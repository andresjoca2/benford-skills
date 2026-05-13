import type { OpenClawQueuedJob } from "./db.ts"

type RunOpenClawResult = {
  output: unknown
  stdout: string
  stderr: string
}

export async function runOpenClawJob(job: OpenClawQueuedJob): Promise<RunOpenClawResult> {
  if (Bun.env.BENFORD_BACKOFFICE_OPENCLAW_MOCK === "1") {
    return {
      output: mockOutput(job),
      stdout: JSON.stringify(mockOutput(job)),
      stderr: "",
    }
  }

  const enrichedJob = await enrichJobInputWithHunter(job)
  const prompt = buildPrompt(enrichedJob)
  const command = Bun.env.OPENCLAW_COMMAND || "openclaw"
  const agent = resolveOpenClawAgent(enrichedJob)
  const thinking = resolveOpenClawThinking(enrichedJob)
  const timeoutSeconds = Math.max(Number(enrichedJob.timeoutSeconds || 0), 1)
  const sessionId = openClawSessionId(enrichedJob)
  const proc = spawnOpenClaw(command, agent, thinking, sessionId, timeoutSeconds, prompt)

  let timer: ReturnType<typeof setTimeout> | undefined
  const killed = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      proc.kill()
      reject(new Error(`OpenClaw timed out after ${timeoutSeconds}s`))
    }, (timeoutSeconds + 15) * 1000)
  })

  const completed = Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]).then(([stdout, stderr, exitCode]) => {
    if (exitCode !== 0) {
      throw new Error(`OpenClaw exited ${exitCode}: ${stderr || stdout || "no output"}`)
    }
    return { stdout, stderr, output: withHunterFallback(enrichedJob, parseStrictJson(stdout)) }
  })

  try {
    return await Promise.race([completed, killed])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

type HunterSource = {
  provider: "hunter"
  domain: string
  status: "available" | "missing_api_key" | "error" | "no_domain"
  error?: string
  people: Array<{
    name: string
    firstName: string
    lastName: string
    title: string
    email: string
    linkedinUrl: string
    phone: string
    confidence: number
    seniority: string
    department: string
    sourceUrls: string[]
  }>
}

export async function enrichJobInputWithHunter(job: OpenClawQueuedJob): Promise<OpenClawQueuedJob> {
  if (job.skill !== "find_people") return job
  const input = job.input as { targetCompany?: { domain?: string; name?: string }; sourceData?: Record<string, unknown> }
  const hunter = await fetchHunterDomainSearch(input.targetCompany?.domain || "")
  return {
    ...job,
    input: {
      ...input,
      sourceData: {
        ...(input.sourceData || {}),
        hunter,
      },
    },
  }
}

async function fetchHunterDomainSearch(domainValue: string): Promise<HunterSource> {
  const domain = normalizeDomain(domainValue)
  if (!domain) return { provider: "hunter", domain: "", status: "no_domain", people: [] }

  const apiKey = Bun.env.HUNTER_API_KEY?.trim()
  if (!apiKey) return { provider: "hunter", domain, status: "missing_api_key", people: [] }

  const limit = Math.max(Math.min(Number(Bun.env.HUNTER_DOMAIN_SEARCH_LIMIT || 10), 25), 1)
  const url = new URL("https://api.hunter.io/v2/domain-search")
  url.searchParams.set("domain", domain)
  url.searchParams.set("limit", String(limit))
  url.searchParams.set("api_key", apiKey)

  try {
    const response = await fetch(url)
    if (!response.ok) {
      return {
        provider: "hunter",
        domain,
        status: "error",
        error: `Hunter domain-search failed with HTTP ${response.status}`,
        people: [],
      }
    }
    const payload = (await response.json()) as {
      data?: {
        emails?: Array<Record<string, unknown>>
      }
    }
    return {
      provider: "hunter",
      domain,
      status: "available",
      people: (payload.data?.emails || []).map(normalizeHunterEmail).filter((person) => person.name && person.email),
    }
  } catch (error) {
    return {
      provider: "hunter",
      domain,
      status: "error",
      error: error instanceof Error ? error.message : String(error),
      people: [],
    }
  }
}

function normalizeHunterEmail(record: Record<string, unknown>): HunterSource["people"][number] {
  const firstName = cleanText(record.first_name)
  const lastName = cleanText(record.last_name)
  const value = cleanText(record.value).toLowerCase()
  const sources = Array.isArray(record.sources) ? record.sources : []
  return {
    name: [firstName, lastName].filter(Boolean).join(" ").trim(),
    firstName,
    lastName,
    title: cleanText(record.position),
    email: value,
    linkedinUrl: cleanText(record.linkedin),
    phone: cleanText(record.phone_number),
    confidence: nonNegativeNumber(record.confidence),
    seniority: cleanText(record.seniority),
    department: cleanText(record.department),
    sourceUrls: sources
      .map((source) => (source && typeof source === "object" && !Array.isArray(source) ? cleanText((source as Record<string, unknown>).uri) : ""))
      .filter(Boolean)
      .slice(0, 3),
  }
}

function withHunterFallback(job: OpenClawQueuedJob, output: unknown) {
  if (job.skill !== "find_people") return output
  const record = output && typeof output === "object" && !Array.isArray(output) ? (output as Record<string, unknown>) : {}
  if (Array.isArray(record.people) && record.people.length > 0) return output

  const hunter = ((job.input as { sourceData?: { hunter?: HunterSource } }).sourceData?.hunter)
  if (!hunter || hunter.status !== "available" || hunter.people.length === 0) return output
  const input = job.input as { targetCompany?: { name?: string; domain?: string; country?: string; city?: string } }
  return {
    people: hunter.people.map((person) => hunterPersonToOutput(person, input.targetCompany || {})),
  }
}

function hunterPersonToOutput(person: HunterSource["people"][number], targetCompany: { name?: string; domain?: string; country?: string; city?: string }) {
  const roleCategory = inferRoleCategory(person.title || person.department)
  return {
    name: person.name,
    title: person.title,
    company_name: targetCompany.name || "",
    company_domain: targetCompany.domain || "",
    linkedin_url: person.linkedinUrl,
    email: person.email,
    phone: person.phone,
    country: targetCompany.country || "",
    city: targetCompany.city || "",
    seniority: person.seniority,
    function: roleCategory,
    description: `Contacto encontrado por Hunter Domain Search con departamento ${person.department || "desconocido"}.`,
    score: hunterBaseScore(person, roleCategory),
    rationale: `Hunter encontró este contacto asociado al dominio de la empresa. Su rol (${person.title || person.department || "sin título público"}) puede servir como punto de entrada si encaja con la campaña.`,
    angle_hint: hunterAngleHint(roleCategory),
    role_category: roleCategory,
    geo_scope: targetCompany.country || targetCompany.city ? "Mexico" : "Unknown",
    seniority_fit: person.seniority || "unknown",
    reachability_reason: person.email ? "Hunter devolvió email asociado al dominio." : "Hunter devolvió el perfil, pero sin email confirmado.",
    source_provider: "hunter",
    evidence: [
      {
        type: "hunter",
        url: person.sourceUrls[0] || `https://${normalizeDomain(targetCompany.domain || "")}`,
        note: `Hunter domain-search. Confidence: ${person.confidence || 0}.`,
      },
    ],
  }
}

function inferRoleCategory(textValue: string) {
  const text = normalizeName(textValue)
  if (hasAny(text, ["partner", "partnership", "alliance", "alianza", "business development", "bd"])) return "partnerships"
  if (hasAny(text, ["marketing", "growth", "demand", "lead"])) return "marketing"
  if (hasAny(text, ["sales", "commercial", "comercial", "ventas"])) return "sales"
  if (hasAny(text, ["success", "support", "customer", "merchant", "seller"])) return "operations"
  if (hasAny(text, ["product", "technology", "engineering", "cto"])) return "technology"
  if (hasAny(text, ["finance", "cfo", "accounting"])) return "finance"
  if (hasAny(text, ["ceo", "founder", "chief"])) return "executive"
  return "other"
}

function hunterBaseScore(person: HunterSource["people"][number], roleCategory: string) {
  const roleScore = ["partnerships", "marketing", "sales", "operations"].includes(roleCategory) ? 82 : roleCategory === "executive" ? 68 : 74
  const confidenceBonus = Math.min(Math.floor((person.confidence || 0) / 20), 5)
  return Math.min(roleScore + confidenceBonus, 90)
}

function hunterAngleHint(roleCategory: string) {
  if (roleCategory === "partnerships") return "Proponer una alianza o canal conjunto para llegar a clientes de la plataforma."
  if (roleCategory === "marketing") return "Proponer co-marketing, contenido o campaña educativa para usuarios con dolor fiscal."
  if (roleCategory === "sales") return "Enfocar el valor en activación comercial y monetización de la base de clientes."
  if (roleCategory === "operations") return "Enfocar la conversación en reducción de fricción operativa para clientes."
  return "Usar como punto de entrada y pedir redirección al owner de partnerships o growth."
}

function spawnOpenClaw(command: string, agent: string, thinking: string, sessionId: string, timeoutSeconds: number, prompt: string) {
  const sshTarget = Bun.env.OPENCLAW_SSH_TARGET
  if (sshTarget) {
    const remoteCommand = Bun.env.OPENCLAW_REMOTE_COMMAND || "openclaw"
    const promptBase64 = Buffer.from(prompt, "utf8").toString("base64")
    const agentCommand = `${remoteCommand} agent --agent ${quoteShell(agent)} --thinking ${quoteShell(thinking)} --session-id ${quoteShell(sessionId)} --json --timeout ${timeoutSeconds} --message "$(printf %s "$OPENCLAW_MSG_B64" | base64 -d)"`
    const script = `if command -v timeout >/dev/null 2>&1; then exec timeout --kill-after=10s ${timeoutSeconds}s ${agentCommand}; else exec ${agentCommand}; fi`
    const remote = `OPENCLAW_MSG_B64=${quoteShell(promptBase64)} bash -lc ${quoteShell(script)}`
    return Bun.spawn(["ssh", "-o", "ClearAllForwardings=yes", sshTarget, remote], {
      stdout: "pipe",
      stderr: "pipe",
    })
  }

  const agentCommand = `${command} agent --agent ${quoteShell(agent)} --thinking ${quoteShell(thinking)} --session-id ${quoteShell(sessionId)} --json --timeout ${timeoutSeconds} --message "$OPENCLAW_MSG"`
  const shellCommand = `if command -v timeout >/dev/null 2>&1; then exec timeout --kill-after=10s ${timeoutSeconds}s ${agentCommand}; else exec ${agentCommand}; fi`
  return Bun.spawn(["bash", "-lc", shellCommand], {
    env: { ...Bun.env, OPENCLAW_MSG: prompt },
    stdout: "pipe",
    stderr: "pipe",
  })
}

function buildPrompt(job: OpenClawQueuedJob) {
  const input = job.input as {
    brief?: {
      discoveryMode?: string
      maxCompanies?: number
      maxPeople?: number
      minScoreThreshold?: number
      reviewBatchSize?: number
      peopleContext?: string
    }
    targetCompany?: Record<string, unknown>
    memory?: Record<string, unknown>
  }
  const maxCompanies = Math.max(Math.min(Number(input.brief?.maxCompanies || 10), 50), 1)
  const maxPeople = Math.max(Math.min(Number(input.brief?.maxPeople || 5), 8), 1)
  const minScore = Math.max(Math.min(Number(input.brief?.minScoreThreshold || 75), 100), 0)
  const reviewBatchSize = Math.max(Math.min(Number(input.brief?.reviewBatchSize || 10), maxCompanies), 1)
  const fastPrefetch = job.skill === "find_companies" && input.brief?.discoveryMode === "fast_prefetch"
  const alreadySeenCompanies = input.memory?.alreadySeenCompanies
  const seenCompanies = Array.isArray(alreadySeenCompanies) ? alreadySeenCompanies.length : 0
  const usefulFollowUpBatch = fastPrefetch && seenCompanies > 0
  const schema =
    job.skill === "find_companies"
      ? {
          companies: [
            {
              name: "string",
              domain: "string",
              linkedin_url: "string",
              country: "string",
              city: "string",
              industry: "string",
              employee_range: "string",
              description: "string",
              score: 0,
              rationale: "string",
              evidence: [{ type: "website", url: "https://example.com", note: "string" }],
            },
          ],
        }
      : job.skill === "find_people"
        ? {
            people: [
              {
                name: "string",
                title: "string",
                company_name: "string",
                company_domain: "string",
                linkedin_url: "https://linkedin.com/in/example",
                email: "string",
                phone: "string",
                country: "string",
                city: "string",
                seniority: "Founder",
                function: "Partnerships",
                description: "string",
                score: 0,
                rationale: "string",
                angle_hint: "string",
                role_category: "partnerships|business_development|marketing|sales|technology|operations|finance|executive|owner|other",
                geo_scope: "Mexico|LATAM|Global|Unknown",
                seniority_fit: "operator|manager|director|vp|c_level|owner|unknown",
                reachability_reason: "string",
                source_provider: "public_web|linkedin|hunter|apollo",
                evidence: [{ type: "linkedin", url: "https://example.com", note: "string" }],
              },
            ],
          }
        : {}

  if (job.skill === "find_people") {
    return [
      "You are running a Benford Backoffice people-discovery job.",
      "Treat this as an independent fresh run. Ignore previous conversations and previous empty outputs.",
      "Use the find-people skill if it is available at skills/find-people/SKILL.md in the OpenClaw workspace.",
      `Find ${maxPeople} real people at the target company who are plausible outreach targets for the campaign.`,
      "Use the campaign objective, company context, peopleContext, and operator feedback to infer the right buying committee.",
      "Optimize for actionable outreach, not fame or org-chart rank. The best person is usually the operator who owns the relevant motion, not necessarily the CEO.",
      "For large companies, prefer Mexico or LATAM operators/directors/heads in partnerships, alliances, business development, channel, growth, seller ecosystem, merchant success, marketplace, commercial operations, marketing, or sales depending on the campaign.",
      "Use CEO, founder, president, executive chairman, or global C-level only as a fallback when the company is small/owner-led, when the brief explicitly asks for executives, or when evidence shows that executive personally owns the relevant motion.",
      "If the campaign is partnership/channel/marketplace oriented, first search for partnerships, alliances, business development, ecosystem, channel, merchant/seller, and Mexico/LATAM role variants before considering general executives.",
      "If public leadership pages surface only global executives, continue searching targeted role queries before returning them.",
      "Do not overfit to one title. Return a buying committee mix when useful, but avoid filling the list with top executives from the same global leadership page.",
      "Prefer 3-5 people when the company has a real team. Return 1 person if it appears to be a solo-owner or very small practice.",
      "Each person may need a different future sales angle. Include a concise angle_hint for how to approach that person.",
      "For every person, explain the operational reason they apply. Include role_category, geo_scope, seniority_fit, and reachability_reason even if the backend does not persist every field yet.",
      "Scoring guidance: score Mexico/LATAM role owners and functionally relevant operators highest; demote global C-levels at large companies unless they directly own the motion; never give a high score only because the title is senior.",
      "Suggested targeted searches: company + Mexico + partnerships/alliances/business development/channel/growth/marketplace/seller ecosystem; Spanish equivalents alianzas, desarrollo de negocio, canal, ecosistema, vendedores, comercios.",
      "Source policy: first use input.sourceData.hunter when available, then public web and LinkedIn, then Apollo if available in the environment or tools; never invent contact data.",
      "Hunter domain-search results may already be included under input.sourceData.hunter.people. Treat those as evidence-backed contacts for the target domain, but still rank by role fit.",
      "Return email and phone only when a credible source/tool provides them. Leave unknown email/phone as an empty string.",
      "Do not return duplicate people, suppressed people, generic company pages, or role guesses without a real person name.",
      "Every returned person must include evidence with a URL and a note explaining why that person is relevant.",
      "Use memory.feedback and memory.companyPeople feedback as learning signal for the whole campaign and for this company.",
      "Respect rejected-person feedback such as 'too senior', 'too global', 'not Mexico', 'not partnerships', or 'not operator' as explicit negative examples.",
      "Return only valid JSON. Do not include markdown, prose, or code fences.",
      "",
      `Skill: ${job.skill}`,
      "",
      "Input:",
      JSON.stringify(job.input, null, 2),
      "",
      "Required output schema:",
      JSON.stringify(schema, null, 2),
    ].join("\n")
  }

  return [
    "You are running a Benford Backoffice prospecting job.",
    "Treat this as an independent fresh run. Ignore any previous conversation, prior test prompts, or earlier empty outputs.",
    "Use the find-companies skill if it is available at skills/find-companies/SKILL.md in the OpenClaw workspace.",
    `Your task is to research the market and return up to ${maxCompanies} NEW real company/business candidates that match the campaign brief.`,
    "Use available research/browser/search tools when useful. Prefer primary company websites and credible public sources.",
    ...(fastPrefetch
      ? [
          `This is fast_prefetch mode: the UI will initially review ${reviewBatchSize} companies and cache the rest for later reveal.`,
          "Optimize for a broad, deduped first-pass batch instead of deep research on every company.",
          "Use search results, official sites, credible directories, and public profiles to identify candidates quickly.",
          "One good official or credible source is enough per candidate for this pass. Do not deep-crawl every site unless needed to avoid a bad match.",
          "Keep rationale and evidence notes concise, specific, and based on the source signal.",
        ]
      : []),
    ...(usefulFollowUpBatch
      ? [
          `This is a follow-up run with ${seenCompanies} already-seen companies in memory. A useful result is ${reviewBatchSize} strong new candidates; do not burn the whole timeout trying to fill every remaining slot.`,
          `If you can find more quickly, return more, up to ${maxCompanies}. If you have ${reviewBatchSize} solid non-duplicate candidates, return them immediately as valid JSON.`,
        ]
      : ["For first-pass find_companies jobs, actively search until you reach maxCompanies."]),
    "For maxCompanies <= 10, do not stop at 4-5 candidates. Use at least six distinct search/source angles before returning fewer than maxCompanies.",
    "For maxCompanies > 10, prioritize source diversity and breadth over exhaustive per-company enrichment.",
    "For broad first-pass markets such as LATAM fintech, assume enough qualified candidates exist and return maxCompanies unless every remaining result is duplicated or conflicts with the brief.",
    "Do not return companies, domains, LinkedIn URLs, or suppressed values already present in memory.",
    "Treat approved, rejected, do_not_contact, and free-text feedback in memory as product signal for the next batch.",
    "If memory.needsMoreResearchCompanies is present, use it as an enrichment queue: verify those companies, look for stronger evidence, and use what you learn to bias the next candidates. Do not return the same company as a duplicate unless the job is explicitly a research_company job.",
    "Lean into patterns from approved companies and avoid patterns explicitly rejected by the operator.",
    "Respect maxCompanies, maxPeople, country/region, positive signals, and negative signals from the input.",
    `Prefer candidates scoring ${minScore}+ when possible, but still return lower scores if they are the best real matches after searching.`,
    "Every returned company must include evidence with a URL and a note explaining what was found.",
    "Each candidate must be an actual company, business, firm, clinic, practice, or person-owned business. Do not return directories, generic categories, search result pages, or lead-list vendors as final candidates.",
    "Set domain only when it is the candidate's official website domain. If evidence is a directory, marketplace, maps page, or listing site, leave domain empty and put that URL only in evidence.",
    `Return up to ${maxCompanies} companies when the market is broad enough. Never pad with duplicates, directories, or entities that conflict with the brief.`,
    "Return only valid JSON. Do not include markdown, prose, or code fences.",
    "",
    `Skill: ${job.skill}`,
    "",
    "Input:",
    JSON.stringify(job.input, null, 2),
    "",
    "Required output schema:",
    JSON.stringify(schema, null, 2),
  ].join("\n")
}

function parseStrictJson(stdout: string) {
  const text = stdout.trim()
  if (!text) throw new Error("OpenClaw returned empty stdout")
  return unwrapOpenClawJson(JSON.parse(text) as unknown)
}

function unwrapOpenClawJson(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value
  const record = value as Record<string, unknown>
  if (Array.isArray(record.companies) || Array.isArray(record.people)) return record
  if (Array.isArray(record.payloads)) {
    const firstPayload = record.payloads[0]
    if (firstPayload && typeof firstPayload === "object" && !Array.isArray(firstPayload)) {
      const text = (firstPayload as Record<string, unknown>).text
      if (typeof text === "string" && text.trim().startsWith("{")) return unwrapOpenClawJson(JSON.parse(text) as unknown)
    }
  }

  for (const key of ["output", "result", "response", "message", "content", "text"]) {
    const nested = record[key]
    if (!nested) continue
    if (typeof nested === "string") {
      const trimmed = nested.trim()
      if (!trimmed.startsWith("{")) continue
      return unwrapOpenClawJson(JSON.parse(trimmed) as unknown)
    }
    if (typeof nested === "object" && !Array.isArray(nested)) return unwrapOpenClawJson(nested)
  }

  return value
}

function quoteShell(value: string) {
  return `'${value.replace(/'/g, "'\\''")}'`
}

function resolveOpenClawAgent(job: OpenClawQueuedJob) {
  if (job.skill === "find_companies") return Bun.env.OPENCLAW_FIND_COMPANIES_AGENT || Bun.env.OPENCLAW_AGENT || "research-agent"
  if (job.skill === "find_people") return Bun.env.OPENCLAW_FIND_PEOPLE_AGENT || Bun.env.OPENCLAW_AGENT || "research-agent"
  return Bun.env.OPENCLAW_AGENT || "prospecting-agent"
}

function resolveOpenClawThinking(job: OpenClawQueuedJob) {
  if (job.skill === "find_companies") return Bun.env.OPENCLAW_FIND_COMPANIES_THINKING || Bun.env.OPENCLAW_THINKING || "off"
  if (job.skill === "find_people") return Bun.env.OPENCLAW_FIND_PEOPLE_THINKING || Bun.env.OPENCLAW_THINKING || "minimal"
  return Bun.env.OPENCLAW_THINKING || "minimal"
}

function openClawSessionId(job: OpenClawQueuedJob) {
  return `backoffice-${job.runId}-${job.id}`.replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 160)
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function nonNegativeNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

function normalizeDomain(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
}

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function hasAny(text: string, terms: string[]) {
  return terms.some((term) => {
    const normalizedTerm = normalizeName(term)
    if (!normalizedTerm) return false
    return new RegExp(`(?:^| )${escapeRegExp(normalizedTerm)}(?: |$)`).test(text)
  })
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function mockOutput(job: OpenClawQueuedJob) {
  if (job.skill === "find_people") {
    const input = job.input as {
      brief?: { maxPeople?: number }
      targetCompany?: { name?: string; domain?: string; country?: string; city?: string }
    }
    const max = Math.max(Math.min(Number(input.brief?.maxPeople || 5), 8), 1)
    const companyName = input.targetCompany?.name || "Empresa Demo"
    const companyDomain = input.targetCompany?.domain || "example.com"
    const roles = ["Head of Partnerships", "CEO", "Director de Marketing", "CTO", "Head of Sales"]
    return {
      people: Array.from({ length: max }).map((_, index) => {
        const role = roles[index % roles.length] || "CEO"
        return {
        name: `Persona Demo ${index + 1}`,
        title: role,
        company_name: companyName,
        company_domain: companyDomain,
        linkedin_url: `https://linkedin.com/in/persona-demo-${index + 1}`,
        email: index < 2 ? `persona${index + 1}@${companyDomain}` : "",
        phone: "",
        country: input.targetCompany?.country || "MX",
        city: input.targetCompany?.city || "",
        seniority: index === 0 ? "Head" : "Executive",
        function: role.replace(/^Head of /, ""),
        description: `Contacto demo de ${companyName}.`,
        score: 88 - index,
        rationale: "Mock local para validar búsqueda de personas por empresa.",
        angle_hint: index === 0 ? "Explorar partnership y canal indirecto." : "Validar dolor operativo segun su rol.",
        source_provider: index < 2 ? "hunter" : "linkedin",
        evidence: [
          {
            type: "mock",
            url: `https://${companyDomain}`,
            note: "Evidencia simulada.",
          },
        ],
        }
      }),
    }
  }
  if (job.skill !== "find_companies") return {}
  const input = job.input as { brief?: { industry?: string; countryRegion?: string; maxCompanies?: number } }
  const industry = input.brief?.industry || "Software"
  const country = input.brief?.countryRegion || "MX"
  const max = Math.max(Math.min(Number(input.brief?.maxCompanies || 10), 50), 1)
  const runSuffix = job.runId.replace(/^run_/, "").slice(-10).replace(/[^a-z0-9]+/gi, "-") || "local"
  return {
    companies: Array.from({ length: max }).map((_, index) => ({
      name: `OpenClaw Demo ${runSuffix} ${index + 1}`,
      domain: `openclaw-demo-${runSuffix}-${index + 1}.com`,
      linkedin_url: "",
      country,
      city: "",
      industry,
      employee_range: "",
      description: `Empresa demo generada por el worker local para ${industry}.`,
      score: 80 - index,
      rationale: "Mock local para validar el pipeline SQLite sin invocar OpenClaw real.",
      evidence: [
        {
          type: "mock",
          url: `https://openclaw-demo-${runSuffix}-${index + 1}.com`,
          note: "Evidencia simulada.",
        },
      ],
    })),
  }
}
