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
  db,
  getCampaignDetail,
  getDatabaseTable,
  listDatabaseTables,
  listCampaignCompanyCandidates,
  listCampaigns,
  listCampaignPeople,
  listEvents,
  listProspects,
  reviewCompanyCandidate,
  reviewPersonCandidate,
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

    expect(screen).toContain("Re-ejecutar búsqueda")
    expect(screen).toContain("replaceQueuedRun: true")
    expect(screen).toContain("onClick={onRerun}")
    expect(screen).toContain("scoreFilterOn")
    expect(screen).toContain("minScoreThreshold")
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
      expect(tables).toContain("campaigns")
      expect(tables).toContain("people")
      expect(tables).toContain("person_candidates")
      expect(tables).toContain("outreach_drafts")
      expect(briefColumns).toContain("run_budget_cents")
      expect(briefColumns).toContain("max_companies")
      expect(briefColumns).toContain("max_people")
      expect(briefColumns).toContain("min_score_threshold")
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

      const cancelled = cancelCampaignRun(runId)
      expect(cancelled && "run" in cancelled ? cancelled.run?.status : "").toBe("cancelled")
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

      const feedback = db
        .query<{ count: number }, []>(
          "SELECT COUNT(*) AS count FROM feedback WHERE subject_id IN ('company_candidate_mendel_fintech', 'person_candidate_andres_fintech') AND created_by = 'Test'",
        )
        .get()
      const suppression = db
        .query<{ count: number }, []>(
          "SELECT COUNT(*) AS count FROM suppression_list WHERE source = 'backoffice_review' AND created_by = 'Test'",
        )
        .get()
      const researchJob = db
        .query<{ count: number }, []>(
          "SELECT COUNT(*) AS count FROM openclaw_jobs WHERE run_id = 'run_fintech_001' AND skill = 'research_person'",
        )
        .get()

      expect(company && "review" in company ? company.review : "").toBe("rechazada")
      expect(person && "review" in person ? person.review : "").toBe("pendiente")
      expect(feedback?.count).toBeGreaterThanOrEqual(2)
      expect(suppression?.count).toBeGreaterThanOrEqual(1)
      expect(researchJob?.count).toBeGreaterThanOrEqual(1)
    } finally {
      db.prepare("UPDATE company_candidates SET status = 'new', user_feedback = '' WHERE id = 'company_candidate_mendel_fintech'").run()
      db.prepare("UPDATE person_candidates SET status = 'new', user_feedback = '' WHERE id = 'person_candidate_andres_fintech'").run()
      db.prepare("DELETE FROM feedback WHERE created_by = 'Test'").run()
      db.prepare("DELETE FROM suppression_list WHERE source = 'backoffice_review' AND created_by = 'Test'").run()
      db.prepare("DELETE FROM openclaw_jobs WHERE run_id = 'run_fintech_001' AND skill = 'research_person'").run()
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
