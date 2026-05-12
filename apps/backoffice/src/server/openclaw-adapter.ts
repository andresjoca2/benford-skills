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
  const agent = Bun.env.OPENCLAW_AGENT || "prospecting-agent"
  const timeoutSeconds = Math.max(Number(job.timeoutSeconds || 0), 1)
  const proc = spawnOpenClaw(command, agent, timeoutSeconds, prompt)

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

function spawnOpenClaw(command: string, agent: string, timeoutSeconds: number, prompt: string) {
  const sshTarget = Bun.env.OPENCLAW_SSH_TARGET
  if (sshTarget) {
    const remoteCommand = Bun.env.OPENCLAW_REMOTE_COMMAND || "openclaw"
    const promptBase64 = Buffer.from(prompt, "utf8").toString("base64")
    const script = `exec ${remoteCommand} agent --agent ${quoteShell(agent)} --json --timeout ${timeoutSeconds} --message "$(printf %s "$OPENCLAW_MSG_B64" | base64 -d)"`
    const remote = `OPENCLAW_MSG_B64=${quoteShell(promptBase64)} bash -lc ${quoteShell(script)}`
    return Bun.spawn(["ssh", "-o", "ClearAllForwardings=yes", sshTarget, remote], {
      stdout: "pipe",
      stderr: "pipe",
    })
  }

  const shellCommand = `${command} agent --agent ${quoteShell(agent)} --json --timeout ${timeoutSeconds} --message "$OPENCLAW_MSG"`
  return Bun.spawn(["bash", "-lc", shellCommand], {
    env: { ...Bun.env, OPENCLAW_MSG: prompt },
    stdout: "pipe",
    stderr: "pipe",
  })
}

function buildPrompt(job: OpenClawQueuedJob) {
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
    "Use the find-companies skill if it is available at skills/find-companies/SKILL.md in the OpenClaw workspace.",
    "Your task is to research the market and return real candidates that match the campaign brief.",
    "Use available research/browser/search tools when useful. Prefer primary company websites and credible public sources.",
    "Respect maxCompanies, maxPeople, country/region, positive signals, and negative signals from the input.",
    "Every returned company must include evidence with a URL and a note explaining what was found.",
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

function mockOutput(job: OpenClawQueuedJob) {
  if (job.skill !== "find_companies") return {}
  const input = job.input as { brief?: { industry?: string; countryRegion?: string; maxCompanies?: number } }
  const industry = input.brief?.industry || "Software"
  const country = input.brief?.countryRegion || "MX"
  const max = Math.max(Math.min(Number(input.brief?.maxCompanies || 10), 10), 1)
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
