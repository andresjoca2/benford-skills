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

  const prompt = buildPrompt(job)
  const command = Bun.env.OPENCLAW_COMMAND || "openclaw"
  const agent = resolveOpenClawAgent(job)
  const thinking = resolveOpenClawThinking(job)
  const timeoutSeconds = Math.max(Number(job.timeoutSeconds || 0), 1)
  const sessionId = openClawSessionId(job)
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

function buildPrompt(job: OpenClawQueuedJob) {
  const input = job.input as { brief?: { discoveryMode?: string; maxCompanies?: number; minScoreThreshold?: number; reviewBatchSize?: number }; memory?: Record<string, unknown> }
  const maxCompanies = Math.max(Math.min(Number(input.brief?.maxCompanies || 10), 50), 1)
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
      : {}

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
  return Bun.env.OPENCLAW_AGENT || "prospecting-agent"
}

function resolveOpenClawThinking(job: OpenClawQueuedJob) {
  if (job.skill === "find_companies") return Bun.env.OPENCLAW_FIND_COMPANIES_THINKING || Bun.env.OPENCLAW_THINKING || "off"
  return Bun.env.OPENCLAW_THINKING || "minimal"
}

function openClawSessionId(job: OpenClawQueuedJob) {
  return `backoffice-${job.runId}-${job.id}`.replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 160)
}

function mockOutput(job: OpenClawQueuedJob) {
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
