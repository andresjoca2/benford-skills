import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import path from "node:path"
import {
  companyLogoMap,
  createCampaign,
  createCompany,
  createProspect,
  dbPath,
  listCampaigns,
  listCompanies,
  listProspects,
  setupDatabase,
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
  const headers = { "Content-Type": mimeTypes[extension] ?? "text/plain" }

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

  if (url.pathname === "/api/campaigns") {
    if (request.method === "POST") {
      const body = await readJson(request)
      return json(
        {
          campaign: createCampaign({
            name: typeof body.name === "string" ? body.name : undefined,
            criteria: typeof body.criteria === "string" ? body.criteria : undefined,
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
