import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import path from "node:path"
import {
  companyLogoMap,
  cancelCampaignRun,
  createCampaign,
  createCampaignRun,
  createCompany,
  createProspect,
  dbPath,
  getCampaignDetail,
  getDatabaseTable,
  listCampaignCompanyCandidates,
  listCampaigns,
  listCompanies,
  listCampaignPeople,
  listDatabaseTables,
  listEvents,
  listProspects,
  reviewCompanyCandidate,
  reviewPersonCandidate,
  setupDatabase,
  updateCampaignBrief,
  updateCompanyCandidateStatus,
} from "./src/server/db.ts"

const appRoot = path.resolve(import.meta.dir)
const port = Number(Bun.env.PORT ?? 3000)
const tsTranspiler = new Bun.Transpiler({ loader: "ts" })
const jsxTranspiler = new Bun.Transpiler({ loader: "jsx" })

setupDatabase()

const mimeTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ts": "application/javascript; charset=utf-8",
  ".jsx": "application/javascript; charset=utf-8",
}

function resolveRequestPath(urlPath: string) {
  if (urlPath === "/" || urlPath === "/index.html") {
    return path.join(appRoot, "index.html")
  }

  if (urlPath.startsWith("/src/")) {
    return path.join(appRoot, urlPath)
  }

  if (urlPath.startsWith("/public/")) {
    return path.join(appRoot, urlPath)
  }

  return path.join(appRoot, "index.html")
}

function isAllowedFile(filePath: string) {
  const normalized = path.resolve(filePath)
  return (
    normalized.startsWith(path.join(appRoot, "src")) ||
    normalized.startsWith(path.join(appRoot, "public")) ||
    normalized === path.join(appRoot, "index.html")
  )
}

function compileJsx(source: string) {
  const compiled = jsxTranspiler.transformSync(source)
  return [
    "var jsxDEV_7x81h0kn = window.jsxDEV_7x81h0kn;",
    "var Fragment_8vg9x3sq = window.Fragment_8vg9x3sq;",
    compiled,
  ].join("\n")
}

async function serveFile(filePath: string) {
  if (!isAllowedFile(filePath) || !existsSync(filePath)) {
    return new Response("Not found", { status: 404 })
  }

  const extension = path.extname(filePath)
  const headers = { "Content-Type": mimeTypes[extension] ?? "text/plain", "Cache-Control": "no-store" }

  if (extension === ".ts") {
    const source = await readFile(filePath, "utf8")
    return new Response(tsTranspiler.transformSync(source), { headers })
  }

  if (extension === ".jsx") {
    const source = await readFile(filePath, "utf8")
    return new Response(compileJsx(source), { headers })
  }

  return new Response(await readFile(filePath), { headers })
}

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init?.headers ?? {}),
    },
  })
}

function numberBodyValue(body: Record<string, unknown>, key: string) {
  return typeof body[key] === "number" ? body[key] : undefined
}

async function readJson(request: Request) {
  try {
    return (await request.json()) as Record<string, unknown>
  } catch {
    return {}
  }
}

async function serveApi(request: Request, url: URL) {
  if (url.pathname === "/api/health") {
    return json({ ok: true, database: dbPath })
  }

  const tableMatch = url.pathname.match(/^\/api\/tables\/([^/]+)$/)
  if (tableMatch) {
    const table = getDatabaseTable(tableMatch[1] ?? "", Number(url.searchParams.get("limit") ?? 50))
    if (!table) return json({ error: "Table not found" }, { status: 404 })
    return json({ table })
  }

  if (url.pathname === "/api/tables") {
    return json({ tables: listDatabaseTables() })
  }

  const campaignCandidatesMatch = url.pathname.match(/^\/api\/campaigns\/([^/]+)\/candidates$/)
  if (campaignCandidatesMatch) {
    const campaignId = campaignCandidatesMatch[1]
    if (!campaignId) return json({ error: "Campaign not found" }, { status: 404 })
    return json({ candidates: listCampaignCompanyCandidates(campaignId) })
  }

  const campaignPeopleMatch = url.pathname.match(/^\/api\/campaigns\/([^/]+)\/people$/)
  if (campaignPeopleMatch) {
    const campaignId = campaignPeopleMatch[1]
    if (!campaignId) return json({ error: "Campaign not found" }, { status: 404 })
    return json({ people: listCampaignPeople(campaignId) })
  }

  const campaignRunsMatch = url.pathname.match(/^\/api\/campaigns\/([^/]+)\/runs$/)
  if (campaignRunsMatch) {
    if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 })
    const campaignId = campaignRunsMatch[1]
    if (!campaignId) return json({ error: "Campaign not found" }, { status: 404 })
    const body = await readJson(request)
    const result = createCampaignRun(campaignId, { replaceQueuedRun: body.replaceQueuedRun === true })
    if (!result) return json({ error: "Campaign not found" }, { status: 404 })
    if ("error" in result) return json(result, { status: 409 })
    return json(result, { status: 201 })
  }

  const campaignDetailMatch = url.pathname.match(/^\/api\/campaigns\/([^/]+)$/)
  if (campaignDetailMatch) {
    const campaignId = campaignDetailMatch[1]
    if (!campaignId) return json({ error: "Campaign not found" }, { status: 404 })
    const campaign = getCampaignDetail(campaignId)
    if (!campaign) return json({ error: "Campaign not found" }, { status: 404 })
    return json({ campaign })
  }

  const campaignBriefMatch = url.pathname.match(/^\/api\/campaigns\/([^/]+)\/brief$/)
  if (campaignBriefMatch) {
    if (request.method !== "PUT") return json({ error: "Method not allowed" }, { status: 405 })
    const campaignId = campaignBriefMatch[1]
    if (!campaignId) return json({ error: "Campaign not found" }, { status: 404 })
    const body = await readJson(request)
    const campaign = updateCampaignBrief(campaignId, {
      objective: typeof body.objective === "string" ? body.objective : undefined,
      industry: typeof body.industry === "string" ? body.industry : undefined,
      niche: typeof body.niche === "string" ? body.niche : undefined,
      countryRegion: typeof body.countryRegion === "string" ? body.countryRegion : undefined,
      companySize: typeof body.companySize === "string" ? body.companySize : undefined,
      positiveSignals: typeof body.positiveSignals === "string" ? body.positiveSignals : undefined,
      negativeSignals: typeof body.negativeSignals === "string" ? body.negativeSignals : undefined,
      searchMode: typeof body.searchMode === "string" ? body.searchMode : undefined,
      runBudgetCents: typeof body.runBudgetCents === "number" ? body.runBudgetCents : undefined,
      maxCompanies: typeof body.maxCompanies === "number" ? body.maxCompanies : undefined,
      maxPeople: typeof body.maxPeople === "number" ? body.maxPeople : undefined,
      maxRuntimeSeconds: typeof body.maxRuntimeSeconds === "number" ? body.maxRuntimeSeconds : undefined,
    })
    if (!campaign) return json({ error: "Campaign not found" }, { status: 404 })
    return json({ campaign })
  }

  const runEventsMatch = url.pathname.match(/^\/api\/runs\/([^/]+)\/events$/)
  if (runEventsMatch) {
    return json({ events: listEvents({ runId: runEventsMatch[1] }) })
  }

  const runCancelMatch = url.pathname.match(/^\/api\/runs\/([^/]+)\/cancel$/)
  if (runCancelMatch) {
    if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 })
    const result = cancelCampaignRun(runCancelMatch[1] ?? "")
    if (!result) return json({ error: "Run not found" }, { status: 404 })
    if ("error" in result) return json(result, { status: 409 })
    return json(result)
  }

  if (url.pathname === "/api/events") {
    const campaignId = url.searchParams.get("campaignId") ?? undefined
    return json({ events: listEvents({ campaignId }) })
  }

  const companyReviewMatch = url.pathname.match(/^\/api\/candidates\/company\/([^/]+)\/review$/)
  if (companyReviewMatch) {
    if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 })
    const body = await readJson(request)
    const result = reviewCompanyCandidate(companyReviewMatch[1] ?? "", {
      status: typeof body.status === "string" ? body.status : undefined,
      feedback: typeof body.feedback === "string" ? body.feedback : undefined,
      createdBy: typeof body.createdBy === "string" ? body.createdBy : undefined,
    })
    if (!result) return json({ error: "Candidate not found" }, { status: 404 })
    if ("error" in result) return json(result, { status: 400 })
    return json({ candidate: result })
  }

  const personReviewMatch = url.pathname.match(/^\/api\/candidates\/person\/([^/]+)\/review$/)
  if (personReviewMatch) {
    if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 })
    const body = await readJson(request)
    const result = reviewPersonCandidate(personReviewMatch[1] ?? "", {
      status: typeof body.status === "string" ? body.status : undefined,
      feedback: typeof body.feedback === "string" ? body.feedback : undefined,
      createdBy: typeof body.createdBy === "string" ? body.createdBy : undefined,
    })
    if (!result) return json({ error: "Candidate not found" }, { status: 404 })
    if ("error" in result) return json(result, { status: 400 })
    return json({ candidate: result })
  }

  const companyCandidateStatusMatch = url.pathname.match(/^\/api\/company-candidates\/([^/]+)\/status$/)
  if (companyCandidateStatusMatch) {
    if (request.method !== "PUT") return json({ error: "Method not allowed" }, { status: 405 })
    const body = await readJson(request)
    const candidate = updateCompanyCandidateStatus(
      companyCandidateStatusMatch[1] ?? "",
      typeof body.status === "string" ? body.status : "",
    )
    if (!candidate) return json({ error: "Company candidate not found" }, { status: 404 })
    return json({ candidate })
  }

  if (url.pathname === "/api/campaigns") {
    if (request.method === "POST") {
      const body = await readJson(request)
      return json(
        {
          campaign: createCampaign({
            name: typeof body.name === "string" ? body.name : undefined,
            criteria: typeof body.criteria === "string" ? body.criteria : undefined,
            objective: typeof body.objective === "string" ? body.objective : undefined,
            industry: typeof body.industry === "string" ? body.industry : undefined,
            niche: typeof body.niche === "string" ? body.niche : undefined,
            countryRegion: typeof body.countryRegion === "string" ? body.countryRegion : undefined,
            companySize: typeof body.companySize === "string" ? body.companySize : undefined,
            positiveSignals: typeof body.positiveSignals === "string" ? body.positiveSignals : undefined,
            negativeSignals: typeof body.negativeSignals === "string" ? body.negativeSignals : undefined,
            searchMode: typeof body.searchMode === "string" ? body.searchMode : undefined,
            runBudgetCents: numberBodyValue(body, "runBudgetCents"),
            maxCompanies: numberBodyValue(body, "maxCompanies"),
            maxPeople: numberBodyValue(body, "maxPeople"),
            maxRuntimeSeconds: numberBodyValue(body, "maxRuntimeSeconds"),
          }),
        },
        { status: 201 },
      )
    }

    return json({ campaigns: listCampaigns() })
  }

  if (url.pathname === "/api/prospects") {
    if (request.method === "POST") {
      const body = await readJson(request)
      return json(
        {
          prospect: createProspect({
            name: typeof body.name === "string" ? body.name : undefined,
            title: typeof body.title === "string" ? body.title : undefined,
            company: typeof body.company === "string" ? body.company : undefined,
            campaignId: typeof body.campaignId === "string" ? body.campaignId : undefined,
          }),
        },
        { status: 201 },
      )
    }

    return json({ prospects: listProspects() })
  }

  if (url.pathname === "/api/companies") {
    if (request.method === "POST") {
      const body = await readJson(request)
      return json(
        {
          company: createCompany({
            name: typeof body.name === "string" ? body.name : undefined,
            domain: typeof body.domain === "string" ? body.domain : undefined,
            industry: typeof body.industry === "string" ? body.industry : undefined,
          }),
          logos: companyLogoMap(),
        },
        { status: 201 },
      )
    }

    return json({ companies: listCompanies(), logos: companyLogoMap() })
  }

  return json({ error: "Not found" }, { status: 404 })
}

Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url)
    if (url.pathname.startsWith("/api/")) {
      return serveApi(request, url)
    }

    return serveFile(resolveRequestPath(decodeURIComponent(url.pathname)))
  },
})

console.log(`Benford Backoffice running at http://localhost:${port}`)
