import { existsSync, mkdtempSync, rmSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { describe, expect, test } from "bun:test"
import { Database } from "bun:sqlite"
import { migrateDatabase, resolveDbPath } from "../../apps/backoffice/src/server/migrate.ts"
import {
  cancelCampaignRun,
  completeOpenClawJob,
  createCampaign,
  createCampaignRun,
  createPeopleRunForCompanyCandidate,
  db,
  getCampaignDetail,
  getDatabaseTable,
  hiddenCompanyCandidateCount,
  listDatabaseTables,
  listCampaignCompanyCandidates,
  listCampaigns,
  listCampaignPeople,
  listEvents,
  listProspects,
  reviewCompanyCandidate,
  reviewPersonCandidate,
  revealCachedCompanyCandidates,
  setupDatabase,
  updateCampaignBrief,
} from "../../apps/backoffice/src/server/db.ts"
import { runOpenClawJob } from "../../apps/backoffice/src/server/openclaw-adapter.ts"

const appRoot = path.resolve(import.meta.dir, "../../apps/backoffice")

function restoreFintechBrief() {
  updateCampaignBrief("campaign_fintech_latam", {
    objective: "Encontrar founders y empresas fintech con necesidad operativa clara.",
    industry: "Fintech",
    niche: "Seed/Series A B2B",
    countryRegion: "LATAM",
    companySize: "11-200 empleados",
    positiveSignals: "Founder visible, crecimiento regional, operaciones B2B, stack financiero.",
    negativeSignals: "Banca tradicional, consumer-only sin decision maker claro.",
    searchMode: "companies_then_people",
    runBudgetCents: 2000,
    maxCompanies: 10,
    maxPeople: 20,
    maxRuntimeSeconds: 900,
    minScoreThreshold: 75,
  })
}

describe("clo backoffice frontend", () => {
  test("uses local runtime and local JSX screens", async () => {
    const html = await readFile(path.join(appRoot, "index.html"), "utf8")

    expect(html).toContain("/src/vendor/react-lite.js")
      expect(html).toContain("/src/clo/app.jsx")
      expect(html).toContain("/src/clo/screen-tablas.jsx")
    expect(html).not.toContain("unpkg.com")
    expect(html).not.toContain("text/babel")
  })

  test("keeps referenced scripts present on disk", async () => {
    const html = await readFile(path.join(appRoot, "index.html"), "utf8")
    const scripts = [...html.matchAll(/<script src="([^"]+)"/g)]
      .map((match) => match[1])
      .filter((src): src is string => Boolean(src))

    expect(scripts.length).toBeGreaterThan(5)

    for (const src of scripts) {
      expect(existsSync(path.join(appRoot, src))).toBe(true)
    }
  })

  test("does not render legacy mock totals on DB-backed tables", async () => {
    const companiesScreen = await readFile(path.join(appRoot, "src/clo/screen-empresas.jsx"), "utf8")
    const prospectsScreen = await readFile(path.join(appRoot, "src/clo/screen-prospectos.jsx"), "utf8")
    const sidebar = await readFile(path.join(appRoot, "src/clo/sidebar.jsx"), "utf8")

    expect(companiesScreen).not.toContain("de 284")
    expect(companiesScreen).not.toContain("Página 1 / 16")
    expect(prospectsScreen).not.toContain("de 1,247")
    expect(prospectsScreen).not.toContain("Página 1 / 96")
    expect(sidebar).not.toContain('count="284"')
    expect(sidebar).not.toContain('count="1.2k"')
  })

  test("new campaign flow uses the full brief modal instead of browser prompts", async () => {
    const screen = await readFile(path.join(appRoot, "src/clo/screen-campanas.jsx"), "utf8")

    expect(screen).toContain("Nueva campaña")
    expect(screen).toContain("Señales positivas")
    expect(screen).toContain("Presupuesto por corrida")
    expect(screen).toContain("maxRuntimeSeconds")
    expect(screen).toContain("minScoreThreshold")
    expect(screen).not.toContain("window.prompt")
  })

  test("wires the company rerun button to campaign run creation", async () => {
    const screen = await readFile(path.join(appRoot, "src/clo/screen-batch.jsx"), "utf8")
    const devServer = await readFile(path.join(appRoot, "dev.ts"), "utf8")

    expect(screen).toContain("Re-ejecutar búsqueda")
    expect(screen).toContain("replaceQueuedRun: true")
    expect(screen).toContain("revealCachedCompanies: true")
    expect(screen).toContain("companyPrefetchSize")
    expect(screen).toContain("Mostrar 10 cacheadas")
    expect(screen).toContain("onClick={onRerun}")
    expect(screen).toContain("scoreFilterOn")
    expect(screen).toContain("minScoreThreshold")
    expect(screen).toContain("<span className=\"form-label\">Motivo</span>")
    expect(screen).toContain("data-review-feedback=\"company\"")
    expect(screen).toContain("document.activeElement?.closest?.(\"[data-review-feedback]\")")
    expect(screen).toContain("Enrich")
    expect(screen).toContain("needs_more_research")
    expect(screen).toContain("reviewCompanyCandidate(company.candidateId, status, feedback || undefined)")
    expect(screen).toContain("if (next) setSelectedId(next.id)")
    expect(screen).toContain("onMouseDown={(event)=>submitCompanyReview")
    expect(devServer).toContain("startDevOpenClawWorkerOnce")
  })

  test("opens campaign detail through a stable hash route", async () => {
    const app = await readFile(path.join(appRoot, "src/clo/app.jsx"), "utf8")
    const campaigns = await readFile(path.join(appRoot, "src/clo/screen-campanas.jsx"), "utf8")
    const detail = await readFile(path.join(appRoot, "src/clo/screen-batch.jsx"), "utf8")

    expect(app).toContain("campaign/")
    expect(app).toContain("parseRouteHash")
    expect(campaigns).toContain("openCampaign(b.id)")
    expect(detail).toContain("Array.isArray(b.runs)")
  })

  test("personas tab works by approved company with per-person review", async () => {
    const screen = await readFile(path.join(appRoot, "src/clo/screen-batch.jsx"), "utf8")
    const apiClient = await readFile(path.join(appRoot, "src/clo/api-client.jsx"), "utf8")

    expect(screen).toContain("Empresas aprobadas")
    expect(screen).toContain("Ejecutar búsqueda")
    expect(screen).toContain("createPeopleRunForCompanyCandidate")
    expect(screen).toContain("feedbackByPerson")
    expect(screen).toContain("Sin LinkedIn")
    expect(screen).toContain("Aceptar")
    expect(screen).toContain("Rechazar")
    expect(screen).toContain("needs_more_research")
    expect(screen).toContain("Ángulo sugerido")
    expect(screen).toContain("Contexto para personas")
    expect(apiClient).toContain("/people-runs")
  })
})

describe("clo backoffice local database", () => {
  test("applies the core migration to a fresh SQLite database", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "backoffice-test-"))
    const database = new Database(path.join(dir, "backoffice.sqlite"), { create: true })

    try {
      migrateDatabase(database)

      const migration = database
        .query<{ id: string }, []>("SELECT id FROM schema_migrations ORDER BY id")
        .all()
        .map((row) => row.id)
      const tables = database
        .query<{ name: string }, []>("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((row) => row.name)
      const briefColumns = database
        .query<{ name: string }, []>('PRAGMA table_info("campaign_briefs")')
        .all()
        .map((row) => row.name)

      expect(migration).toContain("0001_core")
      expect(migration).toContain("0002_campaign_min_score_threshold")
      expect(migration).toContain("0003_company_candidate_review_queue")
      expect(tables).toContain("campaigns")
      expect(tables).toContain("people")
      expect(tables).toContain("person_candidates")
      expect(tables).toContain("outreach_drafts")
      expect(briefColumns).toContain("run_budget_cents")
      expect(briefColumns).toContain("max_companies")
      expect(briefColumns).toContain("max_people")
      expect(briefColumns).toContain("min_score_threshold")
      const candidateColumns = database
        .query<{ name: string }, []>('PRAGMA table_info("company_candidates")')
        .all()
        .map((row) => row.name)
      expect(candidateColumns).toContain("review_visible")
      expect(candidateColumns).toContain("review_revealed_at")
    } finally {
      database.close()
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test("imports preserved legacy campaign and company data into the core schema", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "backoffice-legacy-test-"))
    const database = new Database(path.join(dir, "backoffice.sqlite"), { create: true })

    try {
      database.exec(`
        CREATE TABLE campaigns (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          criteria TEXT NOT NULL DEFAULT '',
          created_label TEXT NOT NULL DEFAULT '',
          runs INTEGER NOT NULL DEFAULT 0,
          last_run_label TEXT NOT NULL DEFAULT '',
          total INTEGER NOT NULL DEFAULT 0,
          contacted INTEGER NOT NULL DEFAULT 0,
          replied INTEGER NOT NULL DEFAULT 0,
          qualified INTEGER NOT NULL DEFAULT 0,
          pending INTEGER NOT NULL DEFAULT 0,
          status_kind TEXT NOT NULL DEFAULT 'draft',
          status_label TEXT NOT NULL DEFAULT 'Borrador',
          owner_name TEXT NOT NULL DEFAULT '',
          owner_initials TEXT NOT NULL DEFAULT '',
          owner_color TEXT NOT NULL DEFAULT '#71717A',
          progress_kind TEXT NOT NULL DEFAULT 'info',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE companies (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          domain TEXT NOT NULL DEFAULT '',
          industry TEXT NOT NULL DEFAULT '',
          size TEXT NOT NULL DEFAULT '',
          country TEXT NOT NULL DEFAULT '',
          prospects INTEGER NOT NULL DEFAULT 0,
          contacted INTEGER NOT NULL DEFAULT 0,
          replied INTEGER NOT NULL DEFAULT 0,
          last_label TEXT NOT NULL DEFAULT '',
          owner_initials TEXT NOT NULL DEFAULT '',
          owner_color TEXT NOT NULL DEFAULT '#71717A',
          tags_json TEXT NOT NULL DEFAULT '[]',
          logo_color TEXT NOT NULL DEFAULT '#71717A',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          day_label TEXT NOT NULL,
          severity TEXT NOT NULL,
          type TEXT NOT NULL,
          text TEXT NOT NULL,
          time_label TEXT NOT NULL,
          actor TEXT NOT NULL,
          source TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO campaigns (id, name, criteria, status_kind, owner_name)
        VALUES ('legacy_campaign_1', 'Legacy Campaign', 'Fintech legacy criteria', 'running', 'Manu');
        INSERT INTO companies (id, name, domain, industry, size, country, tags_json)
        VALUES ('legacy_company_1', 'Legacy Company', 'legacy-company.mx', 'Fintech', '11-50', 'MX', '["legacy"]');
      `)

      migrateDatabase(database)

      const campaign = database.query<{ name: string }, []>("SELECT name FROM campaigns WHERE id = 'legacy_campaign_1'").get()
      const company = database.query<{ domain: string }, []>("SELECT domain FROM companies WHERE id = 'legacy_company_1'").get()
      const candidate = database
        .query<{ count: number }, []>(
          "SELECT COUNT(*) AS count FROM company_candidates WHERE campaign_id = 'legacy_campaign_1' AND company_id = 'legacy_company_1'",
        )
        .get()
      const legacyTables = database
        .query<{ name: string }, []>("SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE 'legacy_%'")
        .all()
        .map((row) => row.name)

      expect(campaign?.name).toBe("Legacy Campaign")
      expect(company?.domain).toBe("legacy-company.mx")
      expect(candidate?.count).toBe(1)
      expect(legacyTables.some((name) => name.startsWith("legacy_campaigns_"))).toBe(true)
    } finally {
      database.close()
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test("honors BENFORD_BACKOFFICE_DB_PATH when resolving the SQLite path", () => {
    const previous = Bun.env.BENFORD_BACKOFFICE_DB_PATH
    Bun.env.BENFORD_BACKOFFICE_DB_PATH = "tmp/custom-backoffice.sqlite"

    try {
      expect(resolveDbPath()).toBe(path.resolve("tmp/custom-backoffice.sqlite"))
    } finally {
      if (previous === undefined) delete Bun.env.BENFORD_BACKOFFICE_DB_PATH
      else Bun.env.BENFORD_BACKOFFICE_DB_PATH = previous
    }
  })

  test("seeds campaign and person data for the first backend-backed screens", () => {
    setupDatabase()

    expect(listCampaigns().map((campaign) => campaign.id)).toContain("campaign_fintech_latam")
    expect(listProspects().map((prospect) => prospect.id)).toContain("person_andres_martin")
  })

  test("exposes phase 2 campaign detail data from the new schema", () => {
    setupDatabase()
    restoreFintechBrief()

    const campaign = getCampaignDetail("campaign_fintech_latam")
    const companies = listCampaignCompanyCandidates("campaign_fintech_latam")
    const people = listCampaignPeople("campaign_fintech_latam")
    const events = listEvents({ campaignId: "campaign_fintech_latam" })

      expect(campaign?.brief.searchMode).toBe("companies_then_people")
      expect(campaign?.brief.maxCompanies).toBe(10)
      expect(campaign?.brief.minScoreThreshold).toBe(75)
    expect(companies.map((company) => company.name)).toContain("Mendel")
    expect(people.map((person) => person.name)).toContain("Andres Martin")
    expect(events.length).toBeGreaterThan(0)
  })

  test("updates the live campaign brief with search limits", () => {
    setupDatabase()

    try {
      const updated = updateCampaignBrief("campaign_fintech_latam", {
        objective: "Encontrar fintechs con senales de expansion internacional.",
        searchMode: "companies",
        runBudgetCents: 3500,
        maxCompanies: 12,
        maxPeople: 4,
        maxRuntimeSeconds: 600,
        minScoreThreshold: 82,
      })

      expect(updated?.brief.objective).toBe("Encontrar fintechs con senales de expansion internacional.")
      expect(updated?.brief.searchMode).toBe("companies")
      expect(updated?.brief.runBudgetCents).toBe(3500)
      expect(updated?.brief.maxCompanies).toBe(12)
      expect(updated?.brief.maxPeople).toBe(4)
      expect(updated?.brief.maxRuntimeSeconds).toBe(600)
      expect(updated?.brief.minScoreThreshold).toBe(82)
    } finally {
      restoreFintechBrief()
    }
  })

  test("creates campaigns with a complete live brief", () => {
    setupDatabase()
    let campaignId = ""

    try {
      const campaign = createCampaign({
        name: "Campaign Test Brief Completo",
        objective: "Encontrar empresas industriales con senales de compra.",
        industry: "Manufactura",
        niche: "Compras B2B",
        countryRegion: "Mexico",
        companySize: "50-500 empleados",
        positiveSignals: "Tiene ERP, exporta, contrata compras.",
        negativeSignals: "Solo retail pequeno.",
        searchMode: "companies_then_people",
        runBudgetCents: 1200,
        maxCompanies: 7,
        maxPeople: 14,
        maxRuntimeSeconds: 500,
        minScoreThreshold: 68,
      })
      campaignId = campaign?.id ?? ""

      const detail = campaign ? getCampaignDetail(campaign.id) : null

      expect(detail?.brief.objective).toBe("Encontrar empresas industriales con senales de compra.")
      expect(detail?.brief.industry).toBe("Manufactura")
      expect(detail?.brief.searchMode).toBe("companies_then_people")
      expect(detail?.brief.runBudgetCents).toBe(1200)
      expect(detail?.brief.maxCompanies).toBe(7)
      expect(detail?.brief.maxPeople).toBe(14)
      expect(detail?.brief.maxRuntimeSeconds).toBe(500)
      expect(detail?.brief.minScoreThreshold).toBe(68)
    } finally {
      if (campaignId) db.prepare("DELETE FROM campaigns WHERE id = ?").run(campaignId)
    }
  })

  test("creates and cancels queued campaign runs with one active run per campaign", () => {
    setupDatabase()
    let campaignId = ""

    try {
      const campaign = createCampaign({
        name: "Campaign Test Run Queue",
        objective: "Encontrar empresas para probar corridas.",
        searchMode: "companies",
        maxCompanies: 3,
        maxRuntimeSeconds: 120,
      })
      campaignId = campaign?.id ?? ""

      const created = campaignId ? createCampaignRun(campaignId) : null
      const duplicate = campaignId ? createCampaignRun(campaignId) : null

      expect(created && "run" in created ? created.run?.status : "").toBe("queued")
      expect(duplicate && "error" in duplicate ? duplicate.error : "").toBe("active_run_exists")

      const runId = created && "run" in created ? created.run?.id ?? "" : ""
      const job = db
        .query<{ status: string; skill: string; input_json: string }, [string]>("SELECT status, skill, input_json FROM openclaw_jobs WHERE run_id = ?")
        .get(runId)
      const input = job ? JSON.parse(job.input_json) : {}

      expect(job?.status).toBe("queued")
      expect(job?.skill).toBe("find_companies")
      expect(input.brief?.maxCompanies).toBe(10)
      expect(input.brief?.minScoreThreshold).toBe(75)
      expect(input.brief?.discoveryMode).toBe("fast_prefetch")

      const cancelled = cancelCampaignRun(runId)
      expect(cancelled && "run" in cancelled ? cancelled.run?.status : "").toBe("cancelled")
    } finally {
      if (campaignId) db.prepare("DELETE FROM campaigns WHERE id = ?").run(campaignId)
    }
  })

  test("prefetches larger company batches and reveals cached candidates in review lots", () => {
    setupDatabase()
    let campaignId = ""

    try {
      const campaign = createCampaign({
        name: "Campaign Test Company Prefetch Queue",
        objective: "Encontrar empresas fintech B2B en tandas cacheadas.",
        industry: "Fintech",
        countryRegion: "LATAM",
        searchMode: "companies",
        maxCompanies: 10,
        maxRuntimeSeconds: 900,
      })
      campaignId = campaign?.id ?? ""
      const created = campaignId
        ? createCampaignRun(campaignId, { prefetchCompanies: 12, reviewBatchSize: 5 })
        : null
      const runId = created && "run" in created ? created.run?.id ?? "" : ""
      const job = db
        .query<{ id: string; input_json: string }, [string]>("SELECT id, input_json FROM openclaw_jobs WHERE run_id = ?")
        .get(runId)
      const input = job ? JSON.parse(job.input_json) : {}

      expect(input.brief?.maxCompanies).toBe(12)
      expect(input.brief?.reviewBatchSize).toBe(5)
      expect(input.brief?.discoveryMode).toBe("fast_prefetch")

      if (job) {
        completeOpenClawJob(job.id, {
          companies: Array.from({ length: 12 }).map((_, index) => ({
            name: `Prefetch Queue Company ${index + 1}`,
            domain: `prefetch-queue-company-${index + 1}.example`,
            linkedin_url: "",
            country: "MX",
            city: "",
            industry: "Fintech",
            employee_range: "11-50",
            description: "Empresa de prueba para cola cacheada.",
            score: 95 - index,
            rationale: "Calza con fintech B2B.",
            evidence: [{ type: "website", url: `https://prefetch-queue-company-${index + 1}.example`, note: "Sitio de prueba." }],
          })),
        })
      }

      expect(listCampaignCompanyCandidates(campaignId)).toHaveLength(5)
      expect(hiddenCompanyCandidateCount(campaignId)).toBe(7)
      expect(revealCachedCompanyCandidates(campaignId, 5)).toBe(5)
      expect(listCampaignCompanyCandidates(campaignId)).toHaveLength(10)
      expect(hiddenCompanyCandidateCount(campaignId)).toBe(2)
      const revealViaRun = createCampaignRun(campaignId, { revealCachedCompanies: true, reviewBatchSize: 10 })
      expect(revealViaRun && "revealed" in revealViaRun ? revealViaRun.revealed : 0).toBe(2)
      expect(hiddenCompanyCandidateCount(campaignId)).toBe(0)
    } finally {
      if (campaignId) db.prepare("DELETE FROM campaigns WHERE id = ?").run(campaignId)
      db.prepare("DELETE FROM companies WHERE domain LIKE 'prefetch-queue-company-%.example'").run()
    }
  })

  test("caps interactive company prefetch requests to avoid oversized reruns", () => {
    setupDatabase()
    let campaignId = ""

    try {
      const campaign = createCampaign({
        name: "Campaign Test Company Prefetch Cap",
        objective: "Encontrar partnerships de alto fit.",
        searchMode: "companies",
        maxCompanies: 50,
        maxRuntimeSeconds: 900,
      })
      campaignId = campaign?.id ?? ""

      const created = campaignId
        ? createCampaignRun(campaignId, { prefetchCompanies: 30, reviewBatchSize: 10 })
        : null
      const runId = created && "run" in created ? created.run?.id ?? "" : ""
      const job = db
        .query<{ input_json: string }, [string]>("SELECT input_json FROM openclaw_jobs WHERE run_id = ?")
        .get(runId)
      const input = job ? JSON.parse(job.input_json) : {}

      expect(input.brief?.maxCompanies).toBe(20)
      expect(input.brief?.reviewBatchSize).toBe(10)
    } finally {
      if (campaignId) db.prepare("DELETE FROM campaigns WHERE id = ?").run(campaignId)
    }
  })

  test("creates another search after a company run reaches review", () => {
    setupDatabase()
    let campaignId = ""

    try {
      const campaign = createCampaign({
        name: "Campaign Test Rerun Search",
        objective: "Encontrar empresas en tandas de diez.",
        searchMode: "companies",
        maxCompanies: 10,
        maxRuntimeSeconds: 120,
      })
      campaignId = campaign?.id ?? ""

      const first = campaignId ? createCampaignRun(campaignId) : null
      const firstRunId = first && "run" in first ? first.run?.id ?? "" : ""
      const firstJob = db
        .query<{ id: string }, [string]>("SELECT id FROM openclaw_jobs WHERE run_id = ?")
        .get(firstRunId)

      if (firstJob) completeOpenClawJob(firstJob.id, { companies: [] })

      const second = campaignId ? createCampaignRun(campaignId) : null
      const secondRunId = second && "run" in second ? second.run?.id ?? "" : ""
      const secondJob = db
        .query<{ input_json: string }, [string]>("SELECT input_json FROM openclaw_jobs WHERE run_id = ?")
        .get(secondRunId)
      const input = secondJob ? JSON.parse(secondJob.input_json) : {}

      expect(firstRunId).not.toBe("")
      expect(secondRunId).not.toBe("")
      expect(secondRunId).not.toBe(firstRunId)
      expect(second && "run" in second ? second.run?.status : "").toBe("queued")
      expect(input.brief?.maxCompanies).toBe(10)
      expect(input.brief?.minScoreThreshold).toBe(75)
    } finally {
      if (campaignId) db.prepare("DELETE FROM campaigns WHERE id = ?").run(campaignId)
    }
  })

  test("injects company review feedback into the next find_companies run memory", () => {
    setupDatabase()
    let campaignId = ""
    const domain = "feedback-loop-company.example"

    try {
      const campaign = createCampaign({
        name: "Campaign Test Company Feedback Loop",
        objective: "Encontrar empresas B2B con equipo operativo claro.",
        industry: "Operaciones B2B",
        countryRegion: "Mexico",
        searchMode: "companies",
        maxCompanies: 10,
      })
      campaignId = campaign?.id ?? ""
      const first = campaignId ? createCampaignRun(campaignId) : null
      const firstRunId = first && "run" in first ? first.run?.id ?? "" : ""
      const firstJob = db.query<{ id: string }, [string]>("SELECT id FROM openclaw_jobs WHERE run_id = ?").get(firstRunId)

      if (firstJob) {
        completeOpenClawJob(firstJob.id, {
          companies: [
            {
              name: "Feedback Loop Company",
              domain,
              linkedin_url: "https://linkedin.com/company/feedback-loop-company",
              country: "MX",
              city: "CDMX",
              industry: "Operaciones B2B",
              employee_range: "11-50",
              description: "Empresa usada para probar memoria de feedback.",
              score: 91,
              rationale: "Calza con operación B2B.",
              evidence: [{ type: "website", url: `https://${domain}`, note: "Sitio oficial." }],
            },
          ],
        })
      }

      const candidate = listCampaignCompanyCandidates(campaignId).find((item) => item.domain === domain)
      if (candidate?.candidateId) {
        reviewCompanyCandidate(candidate.candidateId, {
          status: "approved",
          feedback: "Buen fit: operación B2B clara, sitio propio y señales de compra.",
          createdBy: "Test",
        })
      }

      const second = campaignId ? createCampaignRun(campaignId) : null
      const secondRunId = second && "run" in second ? second.run?.id ?? "" : ""
      const secondJob = db.query<{ input_json: string }, [string]>("SELECT input_json FROM openclaw_jobs WHERE run_id = ?").get(secondRunId)
      const input = secondJob ? JSON.parse(secondJob.input_json) : {}

      expect(input.memory?.alreadySeenCompanies).toContain("Feedback Loop Company")
      expect(input.memory?.alreadySeenDomains).toContain(domain)
      expect(input.memory?.approvedCompanies).toContain("Feedback Loop Company")
      expect(input.memory?.feedback?.[0]?.text).toContain("operación B2B clara")
    } finally {
      if (campaignId) {
        db.prepare("DELETE FROM feedback WHERE campaign_id = ? OR created_by = 'Test'").run(campaignId)
        db.prepare("DELETE FROM campaigns WHERE id = ?").run(campaignId)
      }
      db.prepare("DELETE FROM companies WHERE domain = ?").run(domain)
    }
  })

  test("does not inject empty review text into next run feedback memory", () => {
    setupDatabase()
    let campaignId = ""
    const domain = "empty-feedback-company.example"

    try {
      const campaign = createCampaign({
        name: "Campaign Test Empty Feedback",
        objective: "Encontrar empresas B2B.",
        industry: "B2B",
        countryRegion: "Mexico",
        searchMode: "companies",
        maxCompanies: 10,
      })
      campaignId = campaign?.id ?? ""
      const first = campaignId ? createCampaignRun(campaignId) : null
      const firstRunId = first && "run" in first ? first.run?.id ?? "" : ""
      const firstJob = db.query<{ id: string }, [string]>("SELECT id FROM openclaw_jobs WHERE run_id = ?").get(firstRunId)

      if (firstJob) {
        completeOpenClawJob(firstJob.id, {
          companies: [
            {
              name: "Empty Feedback Company",
              domain,
              linkedin_url: "",
              country: "MX",
              city: "CDMX",
              industry: "B2B",
              employee_range: "1-10",
              description: "Empresa usada para probar feedback vacío.",
              score: 82,
              rationale: "Calza para la prueba.",
              evidence: [{ type: "website", url: `https://${domain}`, note: "Sitio oficial." }],
            },
          ],
        })
      }

      const candidate = listCampaignCompanyCandidates(campaignId).find((item) => item.domain === domain)
      if (candidate?.candidateId) {
        reviewCompanyCandidate(candidate.candidateId, {
          status: "rejected",
          feedback: "   ",
          createdBy: "Test",
        })
      }

      const second = campaignId ? createCampaignRun(campaignId) : null
      const secondRunId = second && "run" in second ? second.run?.id ?? "" : ""
      const secondJob = db.query<{ input_json: string }, [string]>("SELECT input_json FROM openclaw_jobs WHERE run_id = ?").get(secondRunId)
      const input = secondJob ? JSON.parse(secondJob.input_json) : {}
      const feedbackRows = db
        .query<{ count: number }, [string]>("SELECT COUNT(*) AS count FROM feedback WHERE campaign_id = ? AND created_by = 'Test'")
        .get(campaignId)

      expect(input.memory?.rejectedCompanies).toContain("Empty Feedback Company")
      expect(input.memory?.feedback || []).toHaveLength(0)
      expect(feedbackRows?.count).toBe(0)
    } finally {
      if (campaignId) {
        db.prepare("DELETE FROM feedback WHERE campaign_id = ? OR created_by = 'Test'").run(campaignId)
        db.prepare("DELETE FROM campaigns WHERE id = ?").run(campaignId)
      }
      db.prepare("DELETE FROM companies WHERE domain = ?").run(domain)
    }
  })

  test("replaces a queued search when rerun requests replacement", () => {
    setupDatabase()
    let campaignId = ""

    try {
      const campaign = createCampaign({
        name: "Campaign Test Replace Queued Rerun",
        objective: "Reemplazar busqueda pendiente.",
        searchMode: "companies",
        maxCompanies: 10,
        maxRuntimeSeconds: 120,
      })
      campaignId = campaign?.id ?? ""

      const first = campaignId ? createCampaignRun(campaignId) : null
      const firstRunId = first && "run" in first ? first.run?.id ?? "" : ""
      const second = campaignId ? createCampaignRun(campaignId, { replaceQueuedRun: true }) : null
      const secondRunId = second && "run" in second ? second.run?.id ?? "" : ""
      const firstStatus = db.query<{ status: string }, [string]>("SELECT status FROM agent_runs WHERE id = ?").get(firstRunId)
      const firstJobStatus = db.query<{ status: string }, [string]>("SELECT status FROM openclaw_jobs WHERE run_id = ?").get(firstRunId)

      expect(firstRunId).not.toBe("")
      expect(secondRunId).not.toBe("")
      expect(secondRunId).not.toBe(firstRunId)
      expect(second && "run" in second ? second.run?.status : "").toBe("queued")
      expect(firstStatus?.status).toBe("cancelled")
      expect(firstJobStatus?.status).toBe("cancelled")
    } finally {
      if (campaignId) db.prepare("DELETE FROM campaigns WHERE id = ?").run(campaignId)
    }
  })

  test("mock OpenClaw company searches return ten candidates by default", async () => {
    const previous = Bun.env.BENFORD_BACKOFFICE_OPENCLAW_MOCK
    Bun.env.BENFORD_BACKOFFICE_OPENCLAW_MOCK = "1"

    try {
      const result = await runOpenClawJob({
        id: "job_mock_ten",
        runId: "run_mock_ten",
        campaignId: "campaign_mock_ten",
        skill: "find_companies",
        status: "queued",
        input: {
          brief: {
            industry: "Fintech",
            countryRegion: "MX",
            maxCompanies: 10,
          },
        },
        output: {},
        error: "",
        attempt: 0,
        maxAttempts: 1,
        timeoutSeconds: 120,
        startedAt: null,
        finishedAt: null,
        createdAt: "",
        updatedAt: "",
      })
      const output = result.output as { companies?: unknown[] }

      expect(output.companies?.length).toBe(10)
    } finally {
      if (previous === undefined) delete Bun.env.BENFORD_BACKOFFICE_OPENCLAW_MOCK
      else Bun.env.BENFORD_BACKOFFICE_OPENCLAW_MOCK = previous
    }
  })

  test("persists find_companies OpenClaw output into company candidates", () => {
    setupDatabase()
    let campaignId = ""

    try {
      const campaign = createCampaign({
        name: "Campaign Test OpenClaw Output",
        objective: "Encontrar empresas de salud.",
        industry: "Salud",
        countryRegion: "Mexico",
        searchMode: "companies",
        maxCompanies: 2,
      })
      campaignId = campaign?.id ?? ""
      const created = campaignId ? createCampaignRun(campaignId) : null
      const runId = created && "run" in created ? created.run?.id ?? "" : ""
      const job = db
        .query<{ id: string }, [string]>("SELECT id FROM openclaw_jobs WHERE run_id = ? AND skill = 'find_companies'")
        .get(runId)

      const completed = job
        ? completeOpenClawJob(job.id, {
            companies: [
              {
                name: "Clinica Demo Backoffice",
                domain: "clinica-demo-backoffice.mx",
                linkedin_url: "",
                country: "MX",
                city: "CDMX",
                industry: "Salud",
                employee_range: "11-50",
                description: "Clinica privada usada para probar persistencia.",
                score: 88,
                rationale: "Calza con la campana de salud.",
                evidence: [{ type: "website", url: "https://clinica-demo-backoffice.mx", note: "Sitio demo." }],
              },
            ],
          })
        : null
      const candidates = campaignId ? listCampaignCompanyCandidates(campaignId) : []

      expect(completed?.status).toBe("succeeded")
      expect(candidates.map((candidate) => candidate.name)).toContain("Clinica Demo Backoffice")
      expect(candidates.find((candidate) => candidate.name === "Clinica Demo Backoffice")?.match).toBe(88)
    } finally {
      if (campaignId) db.prepare("DELETE FROM campaigns WHERE id = ?").run(campaignId)
      db.prepare("DELETE FROM companies WHERE domain = 'clinica-demo-backoffice.mx'").run()
    }
  })

  test("approving a company queues and persists find_people candidates", () => {
    setupDatabase()
    let campaignId = ""
    let companyId = ""
    let personId = ""

    try {
      const campaign = createCampaign({
        name: "Campaign Test Personas",
        objective: "Encontrar buyers para ecommerce SaaS.",
        industry: "SaaS",
        countryRegion: "Mexico",
        searchMode: "companies_then_people",
        maxCompanies: 1,
        maxPeople: 5,
        peopleContext: "Roles objetivo, seniority, areas, excluir roles: partnerships, marketing, CEO; evitar perfiles junior.",
      })
      campaignId = campaign?.id ?? ""
      const created = campaignId ? createCampaignRun(campaignId) : null
      const runId = created && "run" in created ? created.run?.id ?? "" : ""
      const companyJob = db
        .query<{ id: string }, [string]>("SELECT id FROM openclaw_jobs WHERE run_id = ? AND skill = 'find_companies'")
        .get(runId)

      if (companyJob) {
        completeOpenClawJob(companyJob.id, {
          companies: [
            {
              name: "Nuvemshop Personas Test",
              domain: "nuvemshop-personas-test.com",
              linkedin_url: "",
              country: "MX",
              city: "CDMX",
              industry: "SaaS",
              employee_range: "51-200",
              description: "SaaS ecommerce para tiendas.",
              score: 91,
              rationale: "Buen fit para probar personas por empresa.",
              evidence: [{ type: "website", url: "https://nuvemshop-personas-test.com", note: "Sitio demo." }],
            },
          ],
        })
      }

      const company = listCampaignCompanyCandidates(campaignId).find((candidate) => candidate.name === "Nuvemshop Personas Test")
      companyId = company?.id ?? ""
      if (company?.candidateId) reviewCompanyCandidate(company.candidateId, { status: "approved", feedback: "Buen fit para partnerships.", createdBy: "Test" })

      const peopleJob = db
        .query<{ id: string; input_json: string }, [string]>(
          "SELECT id, input_json FROM openclaw_jobs WHERE campaign_id = ? AND skill = 'find_people' ORDER BY created_at DESC LIMIT 1",
        )
        .get(campaignId)
      const peopleInput = peopleJob ? JSON.parse(peopleJob.input_json) : {}

      if (peopleJob) {
        completeOpenClawJob(peopleJob.id, {
          people: [
            {
              name: "Ana Partnerships Personas Test",
              title: "Head of Partnerships",
              company_name: "Nuvemshop Personas Test",
              company_domain: "nuvemshop-personas-test.com",
              linkedin_url: "https://linkedin.com/in/ana-partnerships-personas-test",
              email: "ana@nuvemshop-personas-test.com",
              phone: "+52 55 0000 0000",
              country: "MX",
              city: "CDMX",
              seniority: "Head",
              function: "Partnerships",
              description: "Lidera alianzas para ecommerce.",
              score: 94,
              rationale: "Partnerships es un buen camino comercial para esta empresa.",
              angle_hint: "Hablar de alianzas y canal indirecto.",
              source_provider: "apollo",
              evidence: [{ type: "apollo", url: "https://apollo.io", note: "Perfil demo." }],
            },
          ],
        })
      }

      const person = listCampaignPeople(campaignId).find((candidate) => candidate.name === "Ana Partnerships Personas Test")
      personId = person?.id ?? ""
      const reviewed = person?.candidateId
        ? reviewPersonCandidate(person.candidateId, { status: "approved", feedback: "Esta es la persona correcta para partnerships.", createdBy: "Test" })
        : null
      const refreshed = company?.candidateId
        ? createPeopleRunForCompanyCandidate(company.candidateId, {
            replaceQueuedRun: true,
            enrich: true,
            feedback: "Buscar tambien marketing, no solo partnerships.",
          })
        : null

      expect(peopleInput.brief?.peopleContext).toContain("partnerships")
      expect(peopleInput.targetCompany?.name).toBe("Nuvemshop Personas Test")
      expect(person?.email).toBe("ana@nuvemshop-personas-test.com")
      expect(person?.phone).toBe("+52 55 0000 0000")
      expect(person?.sourceProvider).toBe("apollo")
      expect(person?.angleHint).toContain("alianzas")
      expect(reviewed && "review" in reviewed ? reviewed.review : "").toBe("aceptada")
      expect(refreshed && "run" in refreshed ? refreshed.run?.mission : "").toBe("find_people")
    } finally {
      if (campaignId) db.prepare("DELETE FROM campaigns WHERE id = ?").run(campaignId)
      if (companyId) db.prepare("DELETE FROM companies WHERE id = ?").run(companyId)
      if (personId) db.prepare("DELETE FROM people WHERE id = ?").run(personId)
      db.prepare("DELETE FROM companies WHERE domain = 'nuvemshop-personas-test.com'").run()
      db.prepare("DELETE FROM people WHERE email = 'ana@nuvemshop-personas-test.com'").run()
      db.prepare("DELETE FROM feedback WHERE created_by = 'Test'").run()
    }
  })

  test("reviews candidates with feedback, suppression, and research jobs", () => {
    setupDatabase()

    try {
      const company = reviewCompanyCandidate("company_candidate_mendel_fintech", {
        status: "do_not_contact",
        feedback: "No contactar durante esta campana.",
        createdBy: "Test",
      })
      const person = reviewPersonCandidate("person_candidate_andres_fintech", {
        status: "needs_more_research",
        feedback: "Investigar rol actual.",
        createdBy: "Test",
      })
      const enrichCompany = reviewCompanyCandidate("company_candidate_clip_fintech", {
        status: "needs_more_research",
        feedback: "No estoy seguro; revisar evidencia y sitio antes de decidir.",
        createdBy: "Test",
      })

      const feedback = db
        .query<{ count: number }, []>(
          "SELECT COUNT(*) AS count FROM feedback WHERE subject_id IN ('company_candidate_mendel_fintech', 'person_candidate_andres_fintech', 'company_candidate_clip_fintech') AND created_by = 'Test'",
        )
        .get()
      const suppression = db
        .query<{ count: number }, []>(
          "SELECT COUNT(*) AS count FROM suppression_list WHERE source = 'backoffice_review' AND created_by = 'Test'",
        )
        .get()
      const researchJob = db
        .query<{ count: number }, []>(
          "SELECT COUNT(*) AS count FROM openclaw_jobs WHERE run_id = 'run_fintech_001' AND skill IN ('research_person', 'research_company')",
        )
        .get()
      db.prepare(`
        DELETE FROM openclaw_jobs
        WHERE campaign_id = 'campaign_fintech_latam'
          AND run_id <> 'run_fintech_001'
          AND status IN ('queued', 'running')
      `).run()
      db.prepare(`
        DELETE FROM agent_runs
        WHERE campaign_id = 'campaign_fintech_latam'
          AND id <> 'run_fintech_001'
          AND status IN ('queued', 'running')
      `).run()
      const nextRun = createCampaignRun("campaign_fintech_latam", { prefetchCompanies: 10, reviewBatchSize: 10 })
      const nextRunId = nextRun && "run" in nextRun ? nextRun.run?.id ?? "" : ""
      const nextJob = db
        .query<{ input_json: string }, [string]>("SELECT input_json FROM openclaw_jobs WHERE run_id = ? AND skill = 'find_companies'")
        .get(nextRunId)
      const nextInput = nextJob ? JSON.parse(nextJob.input_json) : {}

      expect(company && "review" in company ? company.review : "").toBe("rechazada")
      expect(person && "review" in person ? person.review : "").toBe("enrich")
      expect(enrichCompany && "review" in enrichCompany ? enrichCompany.review : "").toBe("enrich")
      expect(nextInput.memory?.needsMoreResearchCompanies?.map((row: { name: string }) => row.name)).toContain("Clip")
      expect(feedback?.count).toBeGreaterThanOrEqual(3)
      expect(suppression?.count).toBeGreaterThanOrEqual(1)
      expect(researchJob?.count).toBeGreaterThanOrEqual(2)
    } finally {
      db.prepare("UPDATE company_candidates SET status = 'new', user_feedback = '' WHERE id IN ('company_candidate_mendel_fintech', 'company_candidate_clip_fintech')").run()
      db.prepare("UPDATE person_candidates SET status = 'new', user_feedback = '' WHERE id = 'person_candidate_andres_fintech'").run()
      db.prepare("DELETE FROM feedback WHERE created_by = 'Test'").run()
      db.prepare("DELETE FROM suppression_list WHERE source = 'backoffice_review' AND created_by = 'Test'").run()
      db.prepare("DELETE FROM openclaw_jobs WHERE run_id = 'run_fintech_001' AND skill IN ('research_person', 'research_company')").run()
      db.prepare("DELETE FROM openclaw_jobs WHERE run_id LIKE 'run_campaign_fintech_latam_%'").run()
      db.prepare("DELETE FROM agent_runs WHERE id LIKE 'run_campaign_fintech_latam_%'").run()
    }
  })

  test("exposes inspectable SQLite tables for the frontend table browser", () => {
    setupDatabase()

    const tables = listDatabaseTables()
    const briefs = getDatabaseTable("campaign_briefs")

    expect(tables.map((table) => table.name)).toContain("campaign_briefs")
    expect(tables.map((table) => table.name)).toContain("person_candidates")
    expect(briefs?.columns.map((column) => column.name)).toContain("run_budget_cents")
    expect(briefs?.columns.map((column) => column.name)).toContain("min_score_threshold")
    expect(briefs?.rows.length).toBeGreaterThan(0)
  })
})
