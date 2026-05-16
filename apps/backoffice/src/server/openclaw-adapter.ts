import type { OpenClawQueuedJob, ProspectingStrategyResult } from "./db.ts"
import { loadBackofficeEnv } from "./env.ts"
import { runSourceAdapterForJob } from "./source-adapters.ts"

type RunOpenClawResult = {
  output: unknown
  stdout: string
  stderr: string
}

export async function runOpenClawJob(job: OpenClawQueuedJob): Promise<RunOpenClawResult> {
  loadBackofficeEnv()
  const adapter = await runSourceAdapterForJob(job)
  if (adapter.handled && adapter.output) {
    return {
      output: adapter.output,
      stdout: JSON.stringify({ sourceAdapter: adapter.source, output: adapter.output }),
      stderr: "",
    }
  }

  if (Bun.env.BENFORD_BACKOFFICE_OPENCLAW_MOCK === "1") {
    return {
      output: mockOutput(job),
      stdout: JSON.stringify(mockOutput(job)),
      stderr: "",
    }
  }

  const prompt = buildPrompt(job)
  const command = Bun.env.OPENCLAW_COMMAND || "openclaw"
  const agent = resolveOpenClawAgent(job)
  const thinking = resolveOpenClawThinking(job)
  const timeoutSeconds = Math.max(Number(job.timeoutSeconds || 0), 1)
  const sessionId = openClawSessionId(job)
  const result = await runOpenClawOnce(command, agent, thinking, sessionId, timeoutSeconds, prompt)
  if (!shouldRetryEmptyFindCompanies(job, result.output)) return result

  const retryPrompt = buildPrompt(job, { emptyRetry: true })
  const retryThinking = thinking === "off" ? "minimal" : thinking
  return runOpenClawOnce(command, agent, retryThinking, `${sessionId}-retry-empty`, timeoutSeconds, retryPrompt)
}

export async function runProspectingStrategist(input: Record<string, unknown>): Promise<RunOpenClawResult & { output: ProspectingStrategyResult }> {
  loadBackofficeEnv()
  if (Bun.env.BENFORD_BACKOFFICE_OPENCLAW_MOCK === "1") {
    const output = mockProspectingStrategy(input)
    return { output, stdout: JSON.stringify(output), stderr: "" }
  }

  const command = Bun.env.OPENCLAW_COMMAND || "openclaw"
  const agent = Bun.env.OPENCLAW_STRATEGIST_AGENT || Bun.env.OPENCLAW_AGENT || "prospecting-agent"
  const thinking = Bun.env.OPENCLAW_STRATEGIST_THINKING || Bun.env.OPENCLAW_THINKING || "minimal"
  const timeoutSeconds = Math.max(Number(Bun.env.OPENCLAW_STRATEGIST_TIMEOUT_SECONDS || 300), 30)
  const result = await runOpenClawOnce(
    command,
    agent,
    thinking,
    `backoffice-strategist-${Date.now()}`,
    timeoutSeconds,
    buildProspectingStrategistPrompt(input),
  )
  return { ...result, output: normalizeProspectingStrategyOutput(result.output) }
}

async function runOpenClawOnce(
  command: string,
  agent: string,
  thinking: string,
  sessionId: string,
  timeoutSeconds: number,
  prompt: string,
) {
  const proc = spawnOpenClaw(command, agent, thinking, sessionId, timeoutSeconds, prompt)
  let timer: ReturnType<typeof setTimeout> | undefined
  const killed = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      proc.kill()
      reject(new Error(`OpenClaw timed out after ${timeoutSeconds}s`))
    }, timeoutSeconds * 1000)
  })

  const completed = Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]).then(([stdout, stderr, exitCode]) => {
    if (exitCode !== 0) {
      throw new Error(`OpenClaw exited ${exitCode}: ${stderr || stdout || "no output"}`)
    }
    return { stdout, stderr, output: parseStrictJson(stdout) }
  })

  try {
    return await Promise.race([completed, killed])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

function shouldRetryEmptyFindCompanies(job: OpenClawQueuedJob, output: unknown) {
  if (!isCompanyDiscoverySkill(job.skill)) return false
  if (!output || typeof output !== "object" || Array.isArray(output)) return false
  const companies = (output as { companies?: unknown }).companies
  return Array.isArray(companies) && companies.length === 0
}

function spawnOpenClaw(command: string, agent: string, thinking: string, sessionId: string, timeoutSeconds: number, prompt: string) {
  const sshTarget = Bun.env.OPENCLAW_SSH_TARGET
  if (sshTarget) {
    const remoteCommand = Bun.env.OPENCLAW_REMOTE_COMMAND || "openclaw"
    const promptBase64 = Buffer.from(prompt, "utf8").toString("base64")
    const script = `exec ${remoteCommand} agent --agent ${quoteShell(agent)} --thinking ${quoteShell(thinking)} --session-id ${quoteShell(sessionId)} --json --timeout ${timeoutSeconds} --message "$(printf %s "$OPENCLAW_MSG_B64" | base64 -d)"`
    const remote = `OPENCLAW_MSG_B64=${quoteShell(promptBase64)} bash -lc ${quoteShell(script)}`
    return Bun.spawn(["ssh", "-o", "ClearAllForwardings=yes", sshTarget, remote], {
      stdout: "pipe",
      stderr: "pipe",
    })
  }

  const shellCommand = `${command} agent --agent ${quoteShell(agent)} --thinking ${quoteShell(thinking)} --session-id ${quoteShell(sessionId)} --json --timeout ${timeoutSeconds} --message "$OPENCLAW_MSG"`
  return Bun.spawn(["bash", "-lc", shellCommand], {
    env: { ...Bun.env, OPENCLAW_MSG: prompt },
    stdout: "pipe",
    stderr: "pipe",
  })
}

function buildProspectingStrategistPrompt(input: Record<string, unknown>) {
  return [
    "You are running a Benford Backoffice prospecting strategy job.",
    "Use the prospecting-strategist skill if available at skills/prospecting-strategist/SKILL.md.",
    "Do not execute the plan or call paid providers. Only create or revise the strategy.",
    "Return strict JSON only. Include strategy_markdown for the UI.",
    "Every plan and step must include estimated_cost_cents and budget stop conditions for known-cost sources.",
    "",
    "Input:",
    JSON.stringify(input, null, 2),
    "",
    "Output must match the prospecting-strategist strategy-plan contract.",
  ].join("\n")
}

function normalizeProspectingStrategyOutput(output: unknown): ProspectingStrategyResult {
  if (!output || typeof output !== "object" || Array.isArray(output)) throw new Error("prospecting strategy output must be an object")
  const record = output as ProspectingStrategyResult
  if (!Array.isArray(record.plans)) throw new Error("prospecting strategy output must include plans array")
  if (!record.budget_guard || typeof record.budget_guard !== "object") throw new Error("prospecting strategy output must include budget_guard")
  if (typeof record.strategy_markdown !== "string" || !record.strategy_markdown.trim()) {
    throw new Error("prospecting strategy output must include strategy_markdown")
  }
  return record
}

function buildPrompt(job: OpenClawQueuedJob, options: { emptyRetry?: boolean } = {}) {
  const input = job.input as {
    brief?: { discoveryMode?: string; maxCompanies?: number; maxPeople?: number; minScoreThreshold?: number; reviewBatchSize?: number }
    approvedCompanies?: Array<Record<string, unknown>>
    memory?: { negativeRules?: unknown[] } & Record<string, unknown>
  }
  const maxCompanies = Math.max(Math.min(Number(input.brief?.maxCompanies || 10), 50), 1)
  const maxPeople = Math.max(Math.min(Number(input.brief?.maxPeople || 10), 100), 1)
  const minScore = Math.max(Math.min(Number(input.brief?.minScoreThreshold || 75), 100), 0)
  const reviewBatchSize = Math.max(Math.min(Number(input.brief?.reviewBatchSize || 10), maxCompanies), 1)
  const fastPrefetch = isCompanyDiscoverySkill(job.skill) && input.brief?.discoveryMode === "fast_prefetch"
  const alreadySeenCompanies = input.memory?.alreadySeenCompanies
  const seenCompanies = Array.isArray(alreadySeenCompanies) ? alreadySeenCompanies.length : 0
  const usefulFollowUpBatch = fastPrefetch && seenCompanies > 0
  const negativeRules = Array.isArray(input.memory?.negativeRules) ? input.memory.negativeRules : []
  const schema =
    isCompanyDiscoverySkill(job.skill)
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
      : job.skill === "research_company"
        ? {
            company: {
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
            notes: "string",
          }
      : job.skill === "find_people"
        ? {
            people: [
              {
                name: "string",
                title: "string",
                company_name: "string",
                company_domain: "string",
                linkedin_url: "string",
                email: "string",
                country: "string",
                city: "string",
                seniority: "string",
                function: "string",
                description: "string",
                score: 0,
                rationale: "string",
                evidence: [{ type: "company_site|licensed_profile_provider|web|apollo|pdl|other", url: "https://example.com", note: "string" }],
                source_keys: ["web_search"],
                company_candidate_id: "string",
              },
            ],
            quality_metrics: {
              count: 0,
              with_role_evidence: 0,
              with_email: 0,
              estimated_match_quality: 0,
            },
            what_worked: "string",
            what_failed: "string",
            learned: "string",
          }
      : {}
  if (job.skill === "research_company") {
    return [
      "You are running a Benford Backoffice company enrichment job.",
      "Research exactly the existing company candidate in Input.subject. Do not discover unrelated new companies.",
      "Use the campaign brief and reviewFeedback to resolve the operator's uncertainty.",
      "If reviewFeedback says the operator is unsure about website, geography, fit, or evidence, verify that point directly.",
      "Return updated company evidence, description, score, and rationale for the same company.",
      "Verify whether the official website currently loads. If it times out, is parked, or returns 5xx/Cloudflare errors, say that explicitly in rationale/evidence and do not score it above 60 unless another current official source proves the business is active.",
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

  if (job.skill === "find_people") {
    const approvedCount = Array.isArray(input.approvedCompanies) ? input.approvedCompanies.length : 0
    return [
      "You are running a Benford Backoffice person-discovery job.",
      "Use the person-discovery skill if it is available at skills/person-discovery/SKILL.md in the OpenClaw workspace.",
      "Use the corporate-b2b playbook when the plan step says playbook=corporate-b2b.",
      approvedCount > 0
        ? "This is people_mapping_from_approved_companies mode: stay anchored to Input.approvedCompanies."
        : "This is people_direct_search mode: use the campaign brief roles, seniority, function, geography, and source plan.",
      "Do not scrape LinkedIn directly. Use public company pages, licensed providers when configured, and credible web evidence.",
      "Do not send outreach and do not write to any CRM directly; the backend persists review output.",
      `Return up to ${maxPeople} people. Prefer candidates scoring ${minScore}+ when possible.`,
      "Every returned person must include evidence with a URL and a note explaining role/company fit.",
      "When anchored to an approved company, include company_candidate_id when known.",
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
    "Use the company-discovery skill if it is available at skills/company-discovery/SKILL.md in the OpenClaw workspace.",
    ...(options.emptyRetry
      ? [
          "The previous attempt returned zero companies. That is not useful for this backoffice workflow.",
          "Run a broader recovery search now. Expand into adjacent but relevant channels: seller platforms, payment tools, appointment/booking platforms, industry-specific SaaS, professional marketplaces, business enablement tools, and Mexico/LATAM SMB platforms.",
          "Use the prior memory only as a duplicate blocklist and taste signal. Do not treat the existing list as market exhaustion.",
          `Return at least ${reviewBatchSize} new non-duplicate candidates if any credible public matches exist. Only return an empty array if every credible adjacent search angle is impossible or fully duplicated.`,
        ]
      : []),
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
      : ["For first-pass company_discovery jobs, actively search until you reach maxCompanies."]),
    "For maxCompanies <= 10, do not stop at 4-5 candidates. Use at least six distinct search/source angles before returning fewer than maxCompanies.",
    "For maxCompanies > 10, prioritize source diversity and breadth over exhaustive per-company enrichment.",
    "For broad first-pass markets such as LATAM fintech, assume enough qualified candidates exist and return maxCompanies unless every remaining result is duplicated or conflicts with the brief.",
    "Do not return companies, domains, LinkedIn URLs, or suppressed values already present in memory.",
    "Treat approved, rejected, do_not_contact, and free-text feedback in memory as product signal for the next batch.",
    ...(negativeRules.length > 0
      ? [
          "The input memory includes negativeRules derived from operator feedback. These are hard exclusion rules, not suggestions.",
          "Never return candidates that match negativeRules. For exclude_spanish_entities, exclude Spain/Spanish companies, companies headquartered in Spain, candidates with Spain as the main market, and candidates whose official/evidence domain is .es.",
        ]
      : []),
    "If memory.needsMoreResearchCompanies is present, use it as an enrichment queue: verify those companies, look for stronger evidence, and use what you learn to bias the next candidates. Do not return the same company as a duplicate unless the job is explicitly a research_company job.",
    "Lean into patterns from approved companies and avoid patterns explicitly rejected by the operator.",
    "Respect maxCompanies, maxPeople, country/region, positive signals, and negative signals from the input.",
    `Prefer candidates scoring ${minScore}+ when possible, but still return lower scores if they are the best real matches after searching.`,
    "Every returned company must include evidence with a URL and a note explaining what was found.",
    "Each candidate must be an actual company, business, firm, clinic, practice, or person-owned business. Do not return directories, generic categories, search result pages, or lead-list vendors as final candidates.",
    "Set domain only when it is the candidate's official website domain. If evidence is a directory, marketplace, maps page, or listing site, leave domain empty and put that URL only in evidence.",
    "Before returning a domain, verify the official website is reachable. Do not return companies whose official site is dead, parked, timed out, or returning 5xx/Cloudflare errors unless there is strong current alternate official evidence and the rationale explicitly says why it is still active.",
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
  if (isCompanyDiscoverySkill(job.skill)) {
    return Bun.env.OPENCLAW_COMPANY_DISCOVERY_AGENT || Bun.env.OPENCLAW_FIND_COMPANIES_AGENT || Bun.env.OPENCLAW_AGENT || "prospecting-agent"
  }
  return Bun.env.OPENCLAW_AGENT || "prospecting-agent"
}

function resolveOpenClawThinking(job: OpenClawQueuedJob) {
  if (isCompanyDiscoverySkill(job.skill)) {
    return Bun.env.OPENCLAW_COMPANY_DISCOVERY_THINKING || Bun.env.OPENCLAW_FIND_COMPANIES_THINKING || Bun.env.OPENCLAW_THINKING || "off"
  }
  return Bun.env.OPENCLAW_THINKING || "minimal"
}

function isCompanyDiscoverySkill(skill: string) {
  return skill === "company_discovery" || skill === "find_companies"
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

function mockProspectingStrategy(input: Record<string, unknown>): ProspectingStrategyResult {
  const campaign = input.campaign && typeof input.campaign === "object" ? (input.campaign as Record<string, unknown>) : {}
  const brief = campaign.brief && typeof campaign.brief === "object" ? (campaign.brief as Record<string, unknown>) : {}
  const limits = input.limits && typeof input.limits === "object" ? (input.limits as Record<string, unknown>) : {}
  const query = cleanText(input.query_original) || cleanText(brief.objective) || "Prospecting strategy"
  const budget = nonNegativeNumber(limits.runBudgetCents)
  const estimated = Math.min(budget || 500, 500)
  const feedback = cleanText(input.feedback)
  const searchMode = cleanText(brief.searchMode) || "companies"
  const steps = [
    {
      order: 1,
      phase: "company_training",
      capability: "company-discovery",
      playbook: "corporate-b2b",
      mode: "company_sourcing",
      legacy_skill: "company_discovery",
      source_key: "web_search",
      source_plan: ["web_search"],
      requires_review_state: "none",
      reason: "Primera pasada barata y verificable.",
      input_focus: query,
      expected_output: "companies",
      estimated_cost_cents: 0,
      quality_gate: { min_count: 10, min_quality_score: 0.75, required_fields: ["name", "evidence"] },
      fallback_if: ["useful_count_below_review_batch"],
      stop_if: ["quality_gate_met", "budget_would_be_exceeded"],
    },
    ...(searchMode === "companies_then_people"
      ? [
          {
            order: 2,
            phase: "review",
            capability: "internal-crm-review",
            playbook: "corporate-b2b",
            mode: "human_review",
            legacy_skill: "",
            source_key: "internal_crm",
            source_plan: ["internal_crm"],
            requires_review_state: "approved_companies",
            reason: "No mapear personas hasta que el operador apruebe empresas.",
            input_focus: "Empresas aprobadas por el operador.",
            expected_output: "internal_crm_state",
            estimated_cost_cents: 0,
            quality_gate: { min_count: 1, min_quality_score: 0, required_fields: ["approved_company"] },
            fallback_if: [],
            stop_if: ["no_approved_companies"],
          },
          {
            order: 3,
            phase: "people_mapping",
            capability: "person-discovery",
            playbook: "corporate-b2b",
            mode: "people_mapping_from_approved_companies",
            legacy_skill: "find_people",
            source_key: "web_search",
            source_plan: ["company_site", "web_search"],
            requires_review_state: "approved_companies",
            reason: "Buscar decision makers solo en empresas aprobadas.",
            input_focus: "Roles financieros, operaciones y liderazgo segun el ICP.",
            expected_output: "people",
            estimated_cost_cents: 0,
            quality_gate: { min_count: 5, min_quality_score: 0.7, required_fields: ["name", "title", "company_name", "evidence"] },
            fallback_if: ["role_evidence_below_gate"],
            stop_if: ["budget_would_be_exceeded"],
          },
        ]
      : []),
  ]
  const markdown = [
    "# Estrategia del agente",
    "",
    "## ICP interpretado",
    "",
    `- Query: ${query}`,
    `- Geografia: ${cleanText(brief.countryRegion) || "por definir"}`,
    "- Huella digital: web publica primero; fuentes pagadas solo si la calidad no alcanza.",
    "",
    "## Plan A",
    "",
    "- Ejecutar `company_discovery` con web/public research.",
    "- Dedupe y suppression antes de gastar en enrichment.",
    ...(searchMode === "companies_then_people"
      ? ["- Esperar revisión interna de empresas antes de activar `find_people`.", "- Mapear personas solo sobre empresas aprobadas."]
      : []),
    "",
    "## Plan B",
    "",
    "- Escalar a Apollo/Explorium para B2B corporativo si el presupuesto y credenciales lo permiten.",
    "",
    ...(feedback ? ["## Feedback aplicado", "", feedback, ""] : []),
  ].join("\n")
  return {
    query_original: query,
    icp_characterized: {
      entity_type: "mixed",
      buyer_or_target: cleanText(brief.niche) || "por definir",
      geography: cleanText(brief.countryRegion),
      digital_footprint_hypothesis: "Fuentes publicas primero; estructuradas segun ICP.",
      likely_source_universes: ["web_search", "apollo", "explorium", "scrapio", "inegi_denue"],
      risk_notes: ["Fuentes pagadas requieren API key y budget gate."],
    },
    memory_used: { similar_queries_found: 0, strongest_pattern_id: "", summary: "Sin patrón previo fuerte." },
    budget_guard: {
      run_budget_cents: budget,
      estimated_total_cents: estimated,
      stop_before_exceeding_budget: true,
      unknown_cost_policy: "avoid_in_unattended_mode",
    },
    strategy_markdown: markdown,
    plans: [
      {
        id: "plan_a",
        rank: 1,
        strategy: "Public web first, paid sources only if quality gate fails.",
        expected_strength: "medium",
        estimated_cost_cents: estimated,
        steps,
      },
    ],
    recommended_first_plan_id: "plan_a",
    operator_warnings: ["Apollo/Scrap.io/Explorium/PDL requieren API keys antes de ejecucion real."],
  }
}

function mockOutput(job: OpenClawQueuedJob) {
  if (job.skill === "find_people") return mockPeopleOutput(job)
  if (!isCompanyDiscoverySkill(job.skill)) return {}
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

function mockPeopleOutput(job: OpenClawQueuedJob) {
  const input = job.input as { brief?: { countryRegion?: string; maxPeople?: number }; approvedCompanies?: Array<Record<string, unknown>> }
  const country = input.brief?.countryRegion || "MX"
  const max = Math.max(Math.min(Number(input.brief?.maxPeople || 10), 50), 1)
  const companies = Array.isArray(input.approvedCompanies) && input.approvedCompanies.length > 0 ? input.approvedCompanies : [{ name: "OpenClaw Demo Company", domain: "openclaw-demo.com", candidate_id: "" }]
  const runSuffix = job.runId.replace(/^run_/, "").slice(-10).replace(/[^a-z0-9]+/gi, "-") || "local"
  return {
    people: Array.from({ length: max }).map((_, index) => {
      const company = companies[index % companies.length] || {}
      const companyName = cleanText(company.name) || "OpenClaw Demo Company"
      return {
        name: `OpenClaw Persona ${runSuffix} ${index + 1}`,
        title: index % 2 === 0 ? "Head of Finance" : "Operations Lead",
        company_name: companyName,
        company_domain: cleanText(company.domain),
        linkedin_url: "",
        email: "",
        country,
        city: "",
        seniority: index % 2 === 0 ? "head" : "manager",
        function: index % 2 === 0 ? "finance" : "operations",
        description: `Persona demo generada por el worker local para ${companyName}.`,
        score: 82 - index,
        rationale: "Mock local para validar el pipeline de personas sin invocar OpenClaw real.",
        evidence: [
          {
            type: "mock",
            url: `https://${cleanText(company.domain) || "openclaw-demo.com"}/team`,
            note: "Evidencia simulada.",
          },
        ],
        source_keys: ["mock"],
        company_candidate_id: cleanText(company.candidate_id),
      }
    }),
    quality_metrics: {
      count: max,
      with_role_evidence: max,
      with_email: 0,
      estimated_match_quality: 0.75,
    },
    what_worked: "Mock local de people mapping.",
    what_failed: "",
    learned: "",
  }
}
