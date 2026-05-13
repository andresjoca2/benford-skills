import { readFileSync } from "node:fs"
import path from "node:path"
import { appRoot, openDatabase, resolveDbPath } from "./migrate.ts"

export const dbPath = resolveDbPath()
export const db = openDatabase(dbPath)

type CampaignCoreRow = {
  id: string
  name: string
  status: string
  owner_name: string
  created_at: string
  objective: string
  industry: string
  niche: string
  country_region: string
  company_size: string
  people_context: string
  max_companies: number
  max_people: number
  min_score_threshold: number
}

type PersonCompatRow = {
  id: string
  name: string
  title: string
  company_name: string
  industry: string
  score: number
  status: string
  campaign_id: string
  country: string
  email: string
  linkedin_url: string
  phone: string
}

type CompanyCompatRow = {
  id: string
  name: string
  domain: string
  industry: string
  employee_range: string
  country: string
  created_at: string
}

type CampaignDetailRow = CampaignCoreRow & {
  positive_signals: string
  negative_signals: string
  search_mode: string
  run_budget_cents: number
  max_runtime_seconds: number
}

type CompanyCandidateRow = {
  id: string
  campaign_id: string
  run_id: string | null
  company_id: string
  status: string
  score: number
  rationale: string
  evidence_json: string
  user_feedback: string
  review_visible: number
  name: string
  domain: string
  linkedin_url: string
  industry: string
  employee_range: string
  country: string
  city: string
  description: string
}

type PersonCandidateRow = {
  id: string
  campaign_id: string
  run_id: string | null
  person_id: string
  company_id: string | null
  status: string
  score: number
  rationale: string
  evidence_json: string
  name: string
  title: string
  company_name: string
  linkedin_url: string
  email: string
  phone: string
  source_provider: string
  industry: string
  country: string
  seniority: string
  function: string
  description: string
  user_feedback: string
  angle_hint: string
}

type RunRow = {
  id: string
  campaign_id?: string
  mission: string
  status: string
  objective: string
  limits_json: string
  raw_output_json?: string
  error: string
  created_at: string
  started_at: string | null
  finished_at: string | null
}

type OpenClawJobRow = {
  id: string
  run_id: string
  campaign_id: string
  skill: string
  status: string
  input_json: string
  output_json: string
  error: string
  attempt: number
  max_attempts: number
  timeout_seconds: number
  started_at: string | null
  finished_at: string | null
  created_at: string
  updated_at: string
}

type EventRow = {
  id: number
  campaign_id: string | null
  run_id: string | null
  job_id: string | null
  level: string
  event_type: string
  message: string
  created_at: string
}

type CampaignBriefPayload = {
  objective: string
  industry: string
  niche: string
  countryRegion: string
  companySize: string
  positiveSignals: string
  negativeSignals: string
  searchMode: string
  runBudgetCents: number
  maxCompanies: number
  maxPeople: number
  maxRuntimeSeconds: number
  minScoreThreshold: number
  peopleContext: string
}

type ReviewStatus = "approved" | "rejected" | "maybe" | "needs_more_research" | "do_not_contact" | "new"

export type OpenClawQueuedJob = ReturnType<typeof formatOpenClawJob>

type NormalizedPersonOutput = ReturnType<typeof normalizePersonOutput>

type PeopleScoringInput = {
  brief?: {
    objective?: string
    peopleContext?: string
    positiveSignals?: string
    negativeSignals?: string
  }
  targetCompany?: {
    name?: string
    country?: string
    city?: string
    industry?: string
    employeeRange?: string
    description?: string
    rationale?: string
  }
}

const colors = ["#A855F7", "#0EA5E9", "#16A34A", "#2563EB", "#0F766E", "#DC2626", "#7C3AED"]
let uniqueIdCounter = 0
const inspectableTables = [
  "campaigns",
  "campaign_briefs",
  "agent_runs",
  "openclaw_jobs",
  "agent_events",
  "companies",
  "company_candidates",
  "people",
  "person_candidates",
  "feedback",
  "suppression_list",
  "outreach_drafts",
  "schema_migrations",
] as const

const FIND_COMPANIES_INTERACTIVE_PREFETCH_CAP = 20

export function setupDatabase() {
  seedDevelopmentData()
}

function seedDevelopmentData() {
  const campaignCount = db.query<{ count: number }, []>("SELECT COUNT(*) AS count FROM campaigns").get()
  if ((campaignCount?.count ?? 0) > 0) return

  const seedPath = path.join(appRoot, "db", "seeds", "dev.sql")
  db.exec(readFileSync(seedPath, "utf8"))
}

export function listCampaigns() {
  const campaigns = db
    .query<CampaignCoreRow, []>(`
      SELECT
        c.id,
        c.name,
        c.status,
        c.owner_name,
        c.created_at,
        b.objective,
        b.industry,
        b.niche,
        b.country_region,
        b.company_size,
        b.people_context,
        b.max_companies,
        b.max_people,
        b.min_score_threshold
      FROM campaigns c
      LEFT JOIN campaign_briefs b ON b.campaign_id = c.id
      ORDER BY c.created_at DESC, c.name ASC
    `)
    .all()

  const runCount = db.prepare("SELECT COUNT(*) AS count FROM agent_runs WHERE campaign_id = ?")
  const lastRun = db.prepare(`
    SELECT mission, status, created_at
    FROM agent_runs
    WHERE campaign_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `)
  const companyTotals = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
      SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS pending
    FROM company_candidates
    WHERE campaign_id = ?
  `)
  const personTotals = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
      SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS pending
    FROM person_candidates
    WHERE campaign_id = ?
  `)

  return campaigns.map((campaign) => {
    const companies = companyTotals.get(campaign.id) as CountStats
    const people = personTotals.get(campaign.id) as CountStats
    const latest = lastRun.get(campaign.id) as { mission: string; status: string; created_at: string } | null
    const runs = (runCount.get(campaign.id) as { count: number }).count
    const total = numberOrZero(companies.total) + numberOrZero(people.total)
    const approved = numberOrZero(companies.approved) + numberOrZero(people.approved)
    const pending = numberOrZero(companies.pending) + numberOrZero(people.pending)

    return {
      id: campaign.id,
      name: campaign.name,
      criteria: campaignCriteria(campaign),
      created: formatDateLabel(campaign.created_at),
      runs,
      lastRun: latest ? `${latest.mission} · ${latest.status}` : "-",
      total,
      contacted: approved,
      replied: 0,
      qualified: approved,
      pending,
      status: campaignStatus(campaign.status),
      owner: {
        name: campaign.owner_name || "Equipo",
        initials: initials(campaign.owner_name || "Equipo"),
        color: colorFor(campaign.id),
      },
      progressKind: pending > 0 ? "info" : total > 0 ? "ok" : "warn",
    }
  })
}

export function createCampaign(input: {
  name?: string
  criteria?: string
  objective?: string
  industry?: string
  niche?: string
  countryRegion?: string
  companySize?: string
  positiveSignals?: string
  negativeSignals?: string
  searchMode?: string
  runBudgetCents?: number
  maxCompanies?: number
  maxPeople?: number
  maxRuntimeSeconds?: number
  minScoreThreshold?: number
  peopleContext?: string
}) {
  const name = input.name?.trim() || "Nueva campaign"
  const id = uniqueId("campaign", name)
  const objective = input.objective?.trim() || input.criteria?.trim() || ""
  const searchMode = ["companies", "people", "companies_then_people"].includes(input.searchMode ?? "")
    ? input.searchMode ?? "companies"
    : "companies"

  db.transaction(() => {
    db.prepare("INSERT INTO campaigns (id, name, status, owner_name) VALUES (?, ?, 'draft', 'Manu')").run(id, name)
    db.prepare(`
      INSERT INTO campaign_briefs (
        campaign_id,
        objective,
        industry,
        niche,
        country_region,
        company_size,
        people_context,
        positive_signals,
        negative_signals,
        search_mode,
        run_budget_cents,
        max_companies,
        max_people,
        max_runtime_seconds,
        min_score_threshold
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      objective,
      input.industry?.trim() || "",
      input.niche?.trim() || "",
      input.countryRegion?.trim() || "",
      input.companySize?.trim() || "",
      input.peopleContext?.trim() || "",
      input.positiveSignals?.trim() || "",
      input.negativeSignals?.trim() || "",
      searchMode,
      nonNegativeInteger(input.runBudgetCents, 0),
      nonNegativeInteger(input.maxCompanies, 10),
      nonNegativeInteger(input.maxPeople, 0),
      nonNegativeInteger(input.maxRuntimeSeconds, 120),
      scoreThreshold(input.minScoreThreshold, 75),
    )
  })()

  return listCampaigns().find((campaign) => campaign.id === id)
}

export function getCampaignDetail(campaignId: string) {
  const row = db
    .query<CampaignDetailRow, [string]>(`
      SELECT
        c.id,
        c.name,
        c.status,
        c.owner_name,
        c.created_at,
        b.objective,
        b.industry,
        b.niche,
        b.country_region,
        b.company_size,
        b.people_context,
        b.positive_signals,
        b.negative_signals,
        b.search_mode,
        b.run_budget_cents,
        b.max_companies,
        b.max_people,
        b.max_runtime_seconds,
        b.min_score_threshold
      FROM campaigns c
      LEFT JOIN campaign_briefs b ON b.campaign_id = c.id
      WHERE c.id = ?
    `)
    .get(campaignId)

  if (!row) return null

  const summary = listCampaigns().find((campaign) => campaign.id === campaignId)
  return {
    ...(summary ?? {
      id: row.id,
      name: row.name,
      criteria: campaignCriteria(row),
      created: formatDateLabel(row.created_at),
      runs: 0,
      lastRun: "-",
      total: 0,
      contacted: 0,
      replied: 0,
      qualified: 0,
      pending: 0,
      status: campaignStatus(row.status),
      owner: { name: row.owner_name || "Equipo", initials: initials(row.owner_name || "Equipo"), color: colorFor(row.id) },
      progressKind: "warn",
    }),
    brief: {
      objective: row.objective || "",
      industry: row.industry || "",
      niche: row.niche || "",
      countryRegion: row.country_region || "",
      companySize: row.company_size || "",
      peopleContext: row.people_context || "",
      positiveSignals: row.positive_signals || "",
      negativeSignals: row.negative_signals || "",
      searchMode: row.search_mode || "companies",
      runBudgetCents: row.run_budget_cents ?? 0,
      maxCompanies: row.max_companies ?? 0,
      maxPeople: row.max_people ?? 0,
      maxRuntimeSeconds: row.max_runtime_seconds ?? 0,
      minScoreThreshold: row.min_score_threshold ?? 75,
    },
    runs: listCampaignRuns(campaignId),
  }
}

export function updateCampaignBrief(
  campaignId: string,
  input: {
    objective?: string
    industry?: string
    niche?: string
    countryRegion?: string
    companySize?: string
    positiveSignals?: string
    negativeSignals?: string
    searchMode?: string
    runBudgetCents?: number
    maxCompanies?: number
    maxPeople?: number
    maxRuntimeSeconds?: number
    minScoreThreshold?: number
    peopleContext?: string
  },
) {
  if (!existingCampaignId(campaignId)) return null

  const current: CampaignBriefPayload = getCampaignDetail(campaignId)?.brief ?? {
    objective: "",
    industry: "",
    niche: "",
    countryRegion: "",
    companySize: "",
    peopleContext: "",
    positiveSignals: "",
    negativeSignals: "",
    searchMode: "companies",
    runBudgetCents: 0,
    maxCompanies: 10,
    maxPeople: 0,
    maxRuntimeSeconds: 120,
    minScoreThreshold: 75,
  }
  const searchMode = ["companies", "people", "companies_then_people"].includes(input.searchMode ?? "")
    ? input.searchMode ?? current.searchMode
    : current.searchMode ?? "companies"

  db.prepare(`
    INSERT INTO campaign_briefs (
      campaign_id,
      objective,
      industry,
      niche,
      country_region,
      company_size,
      people_context,
      positive_signals,
      negative_signals,
      search_mode,
      run_budget_cents,
      max_companies,
      max_people,
      max_runtime_seconds,
      min_score_threshold,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(campaign_id) DO UPDATE SET
      objective = excluded.objective,
      industry = excluded.industry,
      niche = excluded.niche,
      country_region = excluded.country_region,
      company_size = excluded.company_size,
      people_context = excluded.people_context,
      positive_signals = excluded.positive_signals,
      negative_signals = excluded.negative_signals,
      search_mode = excluded.search_mode,
      run_budget_cents = excluded.run_budget_cents,
      max_companies = excluded.max_companies,
      max_people = excluded.max_people,
      max_runtime_seconds = excluded.max_runtime_seconds,
      min_score_threshold = excluded.min_score_threshold,
      updated_at = CURRENT_TIMESTAMP
  `).run(
    campaignId,
    cleanText(input.objective, current.objective),
    cleanText(input.industry, current.industry),
    cleanText(input.niche, current.niche),
    cleanText(input.countryRegion, current.countryRegion),
    cleanText(input.companySize, current.companySize),
    cleanText(input.peopleContext, current.peopleContext),
    cleanText(input.positiveSignals, current.positiveSignals),
    cleanText(input.negativeSignals, current.negativeSignals),
    searchMode,
    nonNegativeInteger(input.runBudgetCents, current.runBudgetCents),
    nonNegativeInteger(input.maxCompanies, current.maxCompanies),
    nonNegativeInteger(input.maxPeople, current.maxPeople),
    nonNegativeInteger(input.maxRuntimeSeconds, current.maxRuntimeSeconds),
    scoreThreshold(input.minScoreThreshold, current.minScoreThreshold),
  )

  db.prepare("UPDATE campaigns SET updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(campaignId)
  return getCampaignDetail(campaignId)
}

export function createCampaignRun(
  campaignId: string,
  options: { replaceQueuedRun?: boolean; revealCachedCompanies?: boolean; reviewBatchSize?: number; prefetchCompanies?: number } = {},
) {
  const campaign = getCampaignDetail(campaignId)
  if (!campaign) return null

  const reviewBatchSize = positiveInteger(options.reviewBatchSize, 10)
  if (options.revealCachedCompanies) {
    const revealed = revealCachedCompanyCandidates(campaignId, reviewBatchSize)
    if (revealed > 0) {
      return { revealed, hiddenCompanyCandidates: hiddenCompanyCandidateCount(campaignId) }
    }
  }

  const active = db
    .query<RunRow, [string]>(`
      SELECT id, mission, status, objective, limits_json, error, created_at, started_at, finished_at
      FROM agent_runs
      WHERE campaign_id = ? AND status IN ('queued', 'running')
      ORDER BY created_at DESC
      LIMIT 1
    `)
    .get(campaignId)
  if (active && (!options.replaceQueuedRun || active.status !== "queued")) {
    return { error: "active_run_exists", run: formatRun(active) }
  }

  const brief = campaign.brief
  const mission = brief.searchMode || "companies"
  const briefCompanyLimit = Math.max(10, positiveInteger(brief.maxCompanies, 10))
  const requestedCompanies = mission === "people"
    ? brief.maxCompanies
    : positiveInteger(options.prefetchCompanies, briefCompanyLimit)
  const runMaxCompanies = mission === "people"
    ? brief.maxCompanies
    : Math.min(FIND_COMPANIES_INTERACTIVE_PREFETCH_CAP, Math.max(10, requestedCompanies))
  const runMaxRuntimeSeconds = effectiveRunTimeoutSeconds(mission, brief.maxRuntimeSeconds)
  const runId = uniqueId("run", `${campaignId}_${mission}`)
  const jobSkill = mission === "people" ? "find_people" : "find_companies"
  const jobId = uniqueId("job", `${runId}_${jobSkill}`)
  const limits = {
    budget_cents: brief.runBudgetCents,
    max_companies: runMaxCompanies,
    max_people: brief.maxPeople,
    max_runtime_seconds: runMaxRuntimeSeconds,
    min_score_threshold: brief.minScoreThreshold,
  }
  const context = {
    campaign_id: campaign.id,
    campaign_name: campaign.name,
    industry: brief.industry,
    niche: brief.niche,
    country_region: brief.countryRegion,
    company_size: brief.companySize,
    positive_signals: brief.positiveSignals,
    negative_signals: brief.negativeSignals,
  }
  const jobInput = {
    mission: jobSkill,
    campaign: {
      id: campaign.id,
      name: campaign.name,
    },
    brief: {
      objective: brief.objective,
      industry: brief.industry,
      niche: brief.niche,
      countryRegion: brief.countryRegion,
      companySize: brief.companySize,
      peopleContext: brief.peopleContext,
      positiveSignals: brief.positiveSignals,
      negativeSignals: brief.negativeSignals,
      searchMode: brief.searchMode,
      maxCompanies: runMaxCompanies,
      maxPeople: brief.maxPeople,
      maxRuntimeSeconds: runMaxRuntimeSeconds,
      runBudgetCents: brief.runBudgetCents,
      minScoreThreshold: brief.minScoreThreshold,
      reviewBatchSize,
      discoveryMode: jobSkill === "find_companies" ? "fast_prefetch" : "standard",
    },
    memory: campaignMemory(campaign.id),
    outputContract: "Return only JSON matching the requested schema.",
  }

  db.transaction(() => {
    if (active?.status === "queued" && options.replaceQueuedRun) {
      db.prepare(`
        UPDATE agent_runs
        SET status = 'cancelled', finished_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND status = 'queued'
      `).run(active.id)
      db.prepare(`
        UPDATE openclaw_jobs
        SET status = 'cancelled', finished_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE run_id = ? AND status = 'queued'
      `).run(active.id)
      insertEvent({
        campaignId,
        runId: active.id,
        subjectType: "run",
        subjectId: active.id,
        level: "warning",
        eventType: "run.cancelled",
        message: "Corrida pendiente reemplazada por re-ejecución de búsqueda.",
        payload: { replacedBy: runId },
      })
    }

    db.prepare(`
      INSERT INTO agent_runs (id, campaign_id, mission, status, objective, context_json, limits_json)
      VALUES (?, ?, ?, 'queued', ?, ?, ?)
    `).run(runId, campaignId, mission, brief.objective || campaign.criteria || "", JSON.stringify(context), JSON.stringify(limits))

    db.prepare(`
      INSERT INTO openclaw_jobs (id, run_id, campaign_id, skill, status, input_json, timeout_seconds)
      VALUES (?, ?, ?, ?, 'queued', ?, ?)
    `).run(jobId, runId, campaignId, jobSkill, JSON.stringify(jobInput), runMaxRuntimeSeconds)

    insertEvent({
      campaignId,
      runId,
      jobId,
      subjectType: "run",
      subjectId: runId,
      level: "info",
      eventType: "run.queued",
      message: "Corrida encolada para OpenClaw.",
      payload: { mission, jobSkill },
    })

    db.prepare("UPDATE campaigns SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(campaignId)
  })()

  return { run: getRun(runId) }
}

export function createPeopleRunForCompanyCandidate(
  companyCandidateId: string,
  options: { replaceQueuedRun?: boolean; enrich?: boolean; feedback?: string; maxPeople?: number } = {},
) {
  const target = db
    .query<
      CompanyCandidateRow & { campaign_name: string; objective: string; people_context: string; positive_signals: string; negative_signals: string },
      [string]
    >(`
      SELECT
        cc.id,
        cc.campaign_id,
        cc.run_id,
        cc.company_id,
        cc.status,
        cc.score,
        cc.rationale,
        cc.evidence_json,
        cc.user_feedback,
        cc.review_visible,
        c.name,
        c.domain,
        c.linkedin_url,
        c.industry,
        c.employee_range,
        c.country,
        c.city,
        c.description,
        campaigns.name AS campaign_name,
        b.objective,
        b.people_context,
        b.positive_signals,
        b.negative_signals
      FROM company_candidates cc
      JOIN companies c ON c.id = cc.company_id
      JOIN campaigns ON campaigns.id = cc.campaign_id
      LEFT JOIN campaign_briefs b ON b.campaign_id = cc.campaign_id
      WHERE cc.id = ?
    `)
    .get(companyCandidateId)
  if (!target) return null
  if (target.status !== "approved") return { error: "company_not_approved" }

  const active = activePeopleRunForCompanyCandidate(companyCandidateId)
  if (active && (!options.replaceQueuedRun || active.status !== "queued")) {
    return { error: "active_people_run_exists", run: formatRun(active) }
  }

  const feedback = typeof options.feedback === "string" ? options.feedback.trim() : ""
  const runId = uniqueId("run", `${target.campaign_id}_people_${target.company_id}`)
  const jobId = uniqueId("job", `${runId}_find_people`)
  const maxPeople = Math.min(Math.max(positiveInteger(options.maxPeople, 5), 1), 8)
  const timeoutSeconds = 300
  const targetCompany = {
    companyCandidateId: target.id,
    companyId: target.company_id,
    name: target.name,
    domain: target.domain,
    linkedinUrl: target.linkedin_url,
    country: target.country,
    city: target.city,
    industry: target.industry,
    employeeRange: target.employee_range,
    description: target.description,
    rationale: target.rationale,
    evidence: parseJson(target.evidence_json, []),
  }
  const context = {
    campaign_id: target.campaign_id,
    campaign_name: target.campaign_name,
    target_company_candidate_id: target.id,
    target_company_id: target.company_id,
    target_company_name: target.name,
  }
  const jobInput = {
    mission: "find_people",
    campaign: {
      id: target.campaign_id,
      name: target.campaign_name,
    },
    brief: {
      objective: target.objective || "",
      peopleContext: target.people_context || "",
      positiveSignals: target.positive_signals || "",
      negativeSignals: target.negative_signals || "",
      maxPeople,
      maxRuntimeSeconds: timeoutSeconds,
      discoveryMode: options.enrich ? "deep_enrich" : "company_people",
      sourcePolicy: ["public_web", "linkedin", "hunter", "apollo"],
    },
    targetCompany,
    memory: {
      ...campaignMemory(target.campaign_id),
      companyPeople: companyPeopleMemory(target.campaign_id, target.company_id),
      refreshFeedback: feedback,
    },
    outputContract: "Return only JSON matching the requested schema.",
  }

  db.transaction(() => {
    if (active?.status === "queued" && options.replaceQueuedRun) {
      db.prepare(`
        UPDATE agent_runs
        SET status = 'cancelled', finished_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND status = 'queued'
      `).run(active.id)
      db.prepare(`
        UPDATE openclaw_jobs
        SET status = 'cancelled', finished_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE run_id = ? AND status = 'queued'
      `).run(active.id)
    }

    db.prepare(`
      INSERT INTO agent_runs (id, campaign_id, mission, status, objective, context_json, limits_json)
      VALUES (?, ?, 'find_people', 'queued', ?, ?, ?)
    `).run(
      runId,
      target.campaign_id,
      `Buscar personas en ${target.name}`,
      JSON.stringify(context),
      JSON.stringify({ max_people: maxPeople, max_runtime_seconds: timeoutSeconds, target_company_candidate_id: target.id }),
    )

    db.prepare(`
      INSERT INTO openclaw_jobs (id, run_id, campaign_id, skill, status, input_json, timeout_seconds)
      VALUES (?, ?, ?, 'find_people', 'queued', ?, ?)
    `).run(jobId, runId, target.campaign_id, JSON.stringify(jobInput), timeoutSeconds)

    insertEvent({
      campaignId: target.campaign_id,
      runId,
      jobId,
      subjectType: "company_candidate",
      subjectId: target.id,
      level: "info",
      eventType: "person.search_queued",
      message: `Búsqueda de personas en ${target.name} encolada.`,
      payload: { companyId: target.company_id, maxPeople, enrich: options.enrich === true },
    })
  })()

  return { run: getRun(runId) }
}

export function cancelCampaignRun(runId: string) {
  const run = getRunRow(runId)
  if (!run) return null
  if (!["queued", "running"].includes(run.status)) return { error: "run_not_cancellable", run: formatRun(run) }

  db.transaction(() => {
    db.prepare(`
      UPDATE agent_runs
      SET status = 'cancelled', finished_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(runId)
    db.prepare(`
      UPDATE openclaw_jobs
      SET status = 'cancelled', finished_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE run_id = ? AND status IN ('queued', 'running')
    `).run(runId)
    insertEvent({
      campaignId: run.campaign_id,
      runId,
      subjectType: "run",
      subjectId: runId,
      level: "warning",
      eventType: "run.cancelled",
      message: "Corrida cancelada por el operador.",
      payload: {},
    })
  })()

  return { run: getRun(runId) }
}

export function reviewCompanyCandidate(
  candidateId: string,
  input: { status?: string; feedback?: string; createdBy?: string } = {},
) {
  return reviewCandidate("company_candidate", candidateId, input)
}

export function reviewPersonCandidate(
  candidateId: string,
  input: { status?: string; feedback?: string; createdBy?: string } = {},
) {
  return reviewCandidate("person_candidate", candidateId, input)
}

export function recordOpenClawRequested(job: { id: string; runId: string; campaignId: string; skill: string; timeoutSeconds: number }) {
  insertEvent({
    campaignId: job.campaignId,
    runId: job.runId,
    jobId: job.id,
    subjectType: "job",
    subjectId: job.id,
    level: "info",
    eventType: "openclaw.requested",
    message: `Solicitud enviada a OpenClaw para ${job.skill}.`,
    payload: { skill: job.skill, timeoutSeconds: job.timeoutSeconds },
  })
}

export function recordOpenClawResponded(
  job: { id: string; runId: string; campaignId: string; skill: string },
  result: { stdout?: string; stderr?: string },
) {
  insertEvent({
    campaignId: job.campaignId,
    runId: job.runId,
    jobId: job.id,
    subjectType: "job",
    subjectId: job.id,
    level: "info",
    eventType: "openclaw.responded",
    message: `OpenClaw respondió para ${job.skill}.`,
    payload: { skill: job.skill, stdoutBytes: result.stdout?.length ?? 0, stderrBytes: result.stderr?.length ?? 0 },
  })
}

export function listCampaignCompanyCandidates(campaignId: string) {
  const rows = db
    .query<CompanyCandidateRow, [string]>(`
      SELECT
        cc.id,
        cc.campaign_id,
        cc.run_id,
        cc.company_id,
        cc.status,
        cc.score,
        cc.rationale,
        cc.evidence_json,
        cc.user_feedback,
        cc.review_visible,
        c.name,
        c.domain,
        c.linkedin_url,
        c.industry,
        c.employee_range,
        c.country,
        c.city,
        c.description
      FROM company_candidates cc
      JOIN companies c ON c.id = cc.company_id
      WHERE cc.campaign_id = ? AND cc.review_visible = 1
      ORDER BY cc.score DESC, c.name ASC
    `)
    .all(campaignId)

  const peopleByCompany = listCampaignPeople(campaignId).reduce<Record<string, ReturnType<typeof listCampaignPeople>>>(
    (acc, person) => {
      if (!person.companyId) return acc
      ;(acc[person.companyId] ??= []).push(person)
      return acc
    },
    {},
  )

  return rows.map((row) => ({
    id: row.company_id,
    candidateId: row.id,
    campaignId: row.campaign_id,
    runId: row.run_id,
    name: row.name,
    domain: row.domain,
    linkedinUrl: row.linkedin_url,
    industry: row.industry,
    size: row.employee_range,
    country: row.country,
    city: row.city,
    description: row.description,
    match: row.score,
    score: row.score,
    review: reviewState(row.status),
    rationale: row.rationale,
    evidence: parseJson(row.evidence_json, []),
    userFeedback: row.user_feedback,
    reviewVisible: row.review_visible === 1,
    prospects: peopleByCompany[row.company_id]?.length ?? 0,
    contacted: row.status === "approved" ? 1 : 0,
    replied: 0,
    owner: { i: "M", c: colorFor(row.company_id) },
    tags: [row.industry].filter(Boolean),
    people: peopleByCompany[row.company_id] ?? [],
  }))
}

export function updateCompanyCandidateStatus(candidateId: string, status: string) {
  return reviewCompanyCandidate(candidateId, { status })
}

export function hiddenCompanyCandidateCount(campaignId: string) {
  return (
    db
      .query<{ count: number }, [string]>(
        "SELECT COUNT(*) AS count FROM company_candidates WHERE campaign_id = ? AND review_visible = 0",
      )
      .get(campaignId)?.count ?? 0
  )
}

export function revealCachedCompanyCandidates(campaignId: string, limit = 10) {
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 50)
  const rows = db
    .query<{ id: string }, [string]>(`
      SELECT id
      FROM company_candidates
      WHERE campaign_id = ? AND review_visible = 0
      ORDER BY score DESC, created_at ASC
      LIMIT ${safeLimit}
    `)
    .all(campaignId)
  if (rows.length === 0) return 0

  db.transaction(() => {
    const update = db.prepare(`
      UPDATE company_candidates
      SET review_visible = 1, review_revealed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    for (const row of rows) update.run(row.id)
    insertEvent({
      campaignId,
      subjectType: "company_candidate",
      subjectId: "",
      level: "info",
      eventType: "company.cache_revealed",
      message: `${rows.length} empresas cacheadas reveladas para revisión.`,
      payload: { count: rows.length },
    })
  })()

  return rows.length
}

export function claimNextOpenClawJob() {
  return db.transaction(() => {
    const row = db
      .query<OpenClawJobRow, []>(`
        SELECT id, run_id, campaign_id, skill, status, input_json, output_json, error, attempt, max_attempts,
          timeout_seconds, started_at, finished_at, created_at, updated_at
        FROM openclaw_jobs
        WHERE status = 'queued'
        ORDER BY created_at ASC
        LIMIT 1
      `)
      .get()
    if (!row) return null

    db.prepare(`
      UPDATE openclaw_jobs
      SET status = 'running', attempt = attempt + 1, started_at = COALESCE(started_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'queued'
    `).run(row.id)
    db.prepare(`
      UPDATE agent_runs
      SET status = 'running', started_at = COALESCE(started_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'queued'
    `).run(row.run_id)
    insertEvent({
      campaignId: row.campaign_id,
      runId: row.run_id,
      jobId: row.id,
      subjectType: "job",
      subjectId: row.id,
      level: "info",
      eventType: "job.started",
      message: `OpenClaw job ${row.skill} iniciado.`,
      payload: { skill: row.skill, attempt: row.attempt + 1 },
    })

    return getOpenClawJob(row.id)
  })()
}

export function completeOpenClawJob(jobId: string, output: unknown) {
  const job = getOpenClawJobRow(jobId)
  if (!job) return null

  const parsed = validateOpenClawOutput(job.skill, output)
  if (!parsed.ok) return failOpenClawJob(jobId, parsed.error)

  db.transaction(() => {
    if (job.skill === "find_companies") persistFoundCompanies(job, parsed.output)
    if (job.skill === "find_people") persistFoundPeople(job, parsed.output)

    db.prepare(`
      UPDATE openclaw_jobs
      SET status = 'succeeded', output_json = ?, error = '', finished_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(JSON.stringify(parsed.output), job.id)
    db.prepare(`
      UPDATE agent_runs
      SET status = ?, raw_output_json = ?, error = '', finished_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(["find_companies", "find_people"].includes(job.skill) ? "needs_review" : "completed", JSON.stringify(parsed.output), job.run_id)
    insertEvent({
      campaignId: job.campaign_id,
      runId: job.run_id,
      jobId: job.id,
      subjectType: "job",
      subjectId: job.id,
      level: "success",
      eventType: "job.completed",
      message: `OpenClaw job ${job.skill} completado.`,
      payload: outputSummary(job.skill, parsed.output),
    })
  })()

  return getOpenClawJob(job.id)
}

export function failOpenClawJob(jobId: string, error: unknown) {
  const job = getOpenClawJobRow(jobId)
  if (!job) return null
  const message = error instanceof Error ? error.message : String(error || "OpenClaw job failed")

  db.transaction(() => {
    db.prepare(`
      UPDATE openclaw_jobs
      SET status = 'failed', error = ?, finished_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(message, job.id)
    db.prepare(`
      UPDATE agent_runs
      SET status = 'failed', error = ?, finished_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(message, job.run_id)
    insertEvent({
      campaignId: job.campaign_id,
      runId: job.run_id,
      jobId: job.id,
      subjectType: "job",
      subjectId: job.id,
      level: "error",
      eventType: "job.failed",
      message,
      payload: { skill: job.skill },
    })
    if (/timed out|timeout/i.test(message)) {
      insertEvent({
        campaignId: job.campaign_id,
        runId: job.run_id,
        jobId: job.id,
        subjectType: "job",
        subjectId: job.id,
        level: "error",
        eventType: "openclaw.timeout",
        message,
        payload: { skill: job.skill, timeoutSeconds: job.timeout_seconds },
      })
    }
  })()

  return getOpenClawJob(job.id)
}

export function listCampaignPeople(campaignId: string) {
  const rows = db
    .query<PersonCandidateRow, [string]>(`
      SELECT
        pc.id,
        pc.campaign_id,
        pc.run_id,
        pc.person_id,
        COALESCE(pc.company_id, p.company_id) AS company_id,
        pc.status,
        pc.score,
        pc.rationale,
        pc.evidence_json,
        pc.user_feedback,
        pc.angle_hint,
        p.name,
        p.title,
        COALESCE(c.name, p.company_name, '') AS company_name,
        p.linkedin_url,
        p.email,
        p.phone,
        p.source_provider,
        COALESCE(c.industry, '') AS industry,
        p.country,
        p.seniority,
        p.function,
        p.description
      FROM person_candidates pc
      JOIN people p ON p.id = pc.person_id
      LEFT JOIN companies c ON c.id = COALESCE(pc.company_id, p.company_id)
      WHERE pc.campaign_id = ?
      ORDER BY pc.score DESC, p.name ASC
    `)
    .all(campaignId)

  return rows.map((row) => ({
    id: row.person_id,
    candidateId: row.id,
    campaignId: row.campaign_id,
    runId: row.run_id,
    companyId: row.company_id,
    name: row.name,
    title: row.title,
    company: row.company_name || "Sin empresa",
    linkedinUrl: row.linkedin_url,
    email: row.email,
    phone: row.phone,
    sourceProvider: row.source_provider,
    industry: row.industry,
    country: row.country,
    seniority: row.seniority || seniorityFromTitle(row.title),
    function: row.function,
    tenure: "-",
    score: row.score,
    band: scoreBand(row.score),
    scoreBand: scoreBand(row.score),
    status: candidateStatus(row.status),
    review: reviewState(row.status),
    rationale: row.rationale,
    evidence: parseJson(row.evidence_json, []),
    userFeedback: row.user_feedback,
    angleHint: row.angle_hint,
    channels: { email: row.email ? "on" : "", linkedin: row.linkedin_url ? "on" : "", call: row.phone ? "on" : "" },
    lastTouch: "-",
    batch: row.campaign_id,
    owner: { i: "M", c: colorFor(row.campaign_id) },
    tags: [row.title].filter(Boolean),
  }))
}

export function listEvents(filters: { campaignId?: string; runId?: string } = {}) {
  const where: string[] = []
  const params: string[] = []

  if (filters.campaignId) {
    where.push("campaign_id = ?")
    params.push(filters.campaignId)
  }
  if (filters.runId) {
    where.push("run_id = ?")
    params.push(filters.runId)
  }

  const rows = db
    .query<EventRow, string[]>(`
      SELECT id, campaign_id, run_id, job_id, level, event_type, message, created_at
      FROM agent_events
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY created_at DESC, id DESC
      LIMIT 200
    `)
    .all(...params)

  return rows.map((row) => ({
    id: row.id,
    day: eventDay(row.created_at),
    t: eventSeverity(row.level),
    type: row.event_type,
    text: row.message,
    time: eventTime(row.created_at),
    actor: row.level === "error" ? "sistema" : "OpenClaw",
    source: row.level === "error" || row.level === "warning" ? "sistema" : "agente",
    campaignId: row.campaign_id,
    runId: row.run_id,
    jobId: row.job_id,
  }))
}

export function listProspects() {
  const rows = db
    .query<PersonCompatRow, []>(`
      SELECT
        p.id,
        p.name,
        p.title,
        COALESCE(c.name, p.company_name, '') AS company_name,
        COALESCE(c.industry, '') AS industry,
        pc.score,
        pc.status,
        pc.campaign_id,
        p.country,
        p.email,
        p.linkedin_url,
        p.phone
      FROM person_candidates pc
      JOIN people p ON p.id = pc.person_id
      LEFT JOIN companies c ON c.id = COALESCE(pc.company_id, p.company_id)
      ORDER BY pc.score DESC, p.name ASC
    `)
    .all()

  return rows.map((row: PersonCompatRow & { email?: string; linkedin_url?: string; phone?: string }) => ({
    id: row.id,
    name: row.name,
    title: row.title,
    company: row.company_name || "Sin empresa",
    industry: row.industry,
    score: row.score,
    scoreBand: scoreBand(row.score),
    status: candidateStatus(row.status),
    channels: { email: row.email ? "on" : "", linkedin: row.linkedin_url ? "on" : "", call: row.phone ? "on" : "" },
    lastTouch: "-",
    batch: row.campaign_id,
    country: row.country,
    owner: { i: "M", c: colorFor(row.campaign_id) },
    tags: [row.title].filter(Boolean),
  }))
}

export function createProspect(input: {
  name?: string
  title?: string
  company?: string
  campaignId?: string
}) {
  const name = input.name?.trim() || "Nuevo prospecto"
  const companyName = input.company?.trim() || ""
  const campaignId = existingCampaignId(input.campaignId) ?? firstCampaignId()
  const id = uniqueId("person", name)
  const candidateId = uniqueId("person_candidate", `${campaignId}_${name}`)

  db.transaction(() => {
    db.prepare(`
      INSERT INTO people (
        id,
        name,
        normalized_name,
        title,
        company_name,
        country,
        source_json
      ) VALUES (?, ?, ?, ?, ?, '', '{"source":"manual"}')
    `).run(id, name, normalizeName(name), input.title?.trim() || "", companyName)

    db.prepare(`
      INSERT INTO person_candidates (
        id,
        campaign_id,
        person_id,
        status,
        score,
        rationale,
        evidence_json
      ) VALUES (?, ?, ?, 'new', 0, 'Creado manualmente.', '[]')
    `).run(candidateId, campaignId, id)
  })()

  return listProspects().find((prospect) => prospect.id === id)
}

export function listCompanies() {
  const rows = db
    .query<CompanyCompatRow, []>(`
      SELECT id, name, domain, industry, employee_range, country, created_at
      FROM companies
      ORDER BY name ASC
    `)
    .all()

  const peopleCount = db.prepare("SELECT COUNT(*) AS count FROM people WHERE company_id = ?")
  const approvedCount = db.prepare(`
    SELECT COUNT(*) AS count
    FROM company_candidates
    WHERE company_id = ? AND status = 'approved'
  `)

  return rows.map((row) => {
    const prospects = (peopleCount.get(row.id) as { count: number }).count
    const approved = (approvedCount.get(row.id) as { count: number }).count

    return {
      id: row.id,
      name: row.name,
      domain: row.domain,
      industry: row.industry,
      size: row.employee_range,
      country: row.country,
      prospects,
      contacted: approved,
      replied: 0,
      last: formatDateLabel(row.created_at),
      owner: { i: "M", c: colorFor(row.id) },
      tags: [row.industry].filter(Boolean),
    }
  })
}

export function createCompany(input: { name?: string; domain?: string; industry?: string }) {
  const name = input.name?.trim() || "Nueva empresa"
  const id = uniqueId("company", name)

  db.prepare(`
    INSERT INTO companies (
      id,
      name,
      normalized_name,
      domain,
      industry,
      source_json
    ) VALUES (?, ?, ?, ?, ?, '{"source":"manual"}')
  `).run(id, name, normalizeName(name), input.domain?.trim() || "", input.industry?.trim() || "")

  return listCompanies().find((company) => company.id === id)
}

export function companyLogoMap() {
  const rows = db.query<{ name: string; id: string }, []>("SELECT id, name FROM companies").all()
  return Object.fromEntries(rows.map((row) => [row.name, { c: colorFor(row.id) }]))
}

export function listDatabaseTables() {
  return inspectableTables
    .filter((name) => tableExists(name))
    .map((name) => {
      const row = db.query<{ count: number }, []>(`SELECT COUNT(*) AS count FROM "${name}"`).get()
      return { name, rows: row?.count ?? 0 }
    })
}

export function getDatabaseTable(tableName: string, limit = 50) {
  if (!isInspectableTable(tableName) || !tableExists(tableName)) return null
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 200)
  const columns = db
    .query<{ name: string; type: string; notnull: number; pk: number }, []>(`PRAGMA table_info("${tableName}")`)
    .all()
    .map((column) => ({
      name: column.name,
      type: column.type,
      required: column.notnull === 1,
      primaryKey: column.pk === 1,
    }))
  const orderBy = columns.some((column) => column.name === "created_at") ? ` ORDER BY "created_at" DESC` : ""
  const rows = db.query<Record<string, unknown>, []>(`SELECT * FROM "${tableName}"${orderBy} LIMIT ${safeLimit}`).all()
  const total = db.query<{ count: number }, []>(`SELECT COUNT(*) AS count FROM "${tableName}"`).get()?.count ?? rows.length

  return {
    name: tableName,
    total,
    limit: safeLimit,
    columns,
    rows: rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, formatCellValue(value)]))),
  }
}

function isInspectableTable(value: string): value is (typeof inspectableTables)[number] {
  return (inspectableTables as readonly string[]).includes(value)
}

function tableExists(name: string) {
  const row = db
    .query<{ count: number }, [string]>("SELECT COUNT(*) AS count FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(name)
  return Boolean(row && row.count > 0)
}

function formatCellValue(value: unknown) {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value.length > 220 ? `${value.slice(0, 220)}...` : value
  return String(value)
}

function listCampaignRuns(campaignId: string) {
  return db
    .query<RunRow, [string]>(`
      SELECT id, mission, status, objective, limits_json, error, created_at, started_at, finished_at
      FROM agent_runs
      WHERE campaign_id = ?
      ORDER BY created_at DESC
    `)
    .all(campaignId)
    .map(formatRun)
}

type CountStats = {
  total: number | null
  approved: number | null
  pending: number | null
}

function campaignCriteria(campaign: CampaignCoreRow) {
  const parts = [campaign.industry, campaign.niche, campaign.country_region, campaign.company_size].filter(Boolean)
  if (parts.length > 0) return parts.join(" · ")
  return campaign.objective || "-"
}

function campaignStatus(status: string) {
  if (status === "active") return { kind: "running", label: "Activa" }
  if (status === "paused") return { kind: "warn", label: "Pausada" }
  if (status === "archived") return { kind: "done", label: "Archivada" }
  return { kind: "empty", label: "Borrador" }
}

function candidateStatus(status: string) {
  if (status === "approved") return { kind: "done", label: "Aprobado" }
  if (status === "rejected") return { kind: "danger", label: "Rechazado" }
  if (status === "do_not_contact") return { kind: "danger", label: "No contactar" }
  if (status === "maybe") return { kind: "warn", label: "Maybe" }
  if (status === "needs_more_research") return { kind: "warn", label: "Investigar mas" }
  return { kind: "draft", label: "Nuevo" }
}

function reviewState(status: string) {
  if (status === "approved") return "aceptada"
  if (status === "needs_more_research") return "enrich"
  if (status === "rejected" || status === "do_not_contact") return "rechazada"
  return "pendiente"
}

function scoreBand(score: number) {
  if (score >= 80) return "hot"
  if (score >= 50) return "warm"
  return "cold"
}

function seniorityFromTitle(title: string) {
  return /CEO|CFO|CTO|COO|VP|Head|Director|Founder/i.test(title) ? "Senior" : "Mid"
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function getRun(runId: string) {
  const row = getRunRow(runId)
  return row ? formatRun(row) : null
}

function getRunRow(runId: string) {
  return db
    .query<RunRow & { campaign_id: string }, [string]>(`
      SELECT id, campaign_id, mission, status, objective, limits_json, error, created_at, started_at, finished_at
      FROM agent_runs
      WHERE id = ?
    `)
    .get(runId)
}

function formatRun(row: RunRow) {
  const companyCandidates =
    db.query<{ count: number }, [string]>("SELECT COUNT(*) AS count FROM company_candidates WHERE run_id = ?").get(row.id)
      ?.count ?? 0

  return {
    id: row.id,
    mission: row.mission,
    status: row.status,
    objective: row.objective,
    companyCandidates,
    limits: parseJson(row.limits_json, {}),
    error: row.error,
    created: formatDateLabel(row.created_at),
    createdAt: row.created_at,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
  }
}

function reviewCandidate(
  subjectType: "company_candidate" | "person_candidate",
  candidateId: string,
  input: { status?: string; feedback?: string; createdBy?: string } = {},
) {
  const status = normalizeReviewStatus(input.status)
  if (!status) return { error: "invalid_review_status" }

  const table = subjectType === "company_candidate" ? "company_candidates" : "person_candidates"
  const row = db
    .query<
      {
        id: string
        campaign_id: string
        run_id: string | null
        company_id: string | null
        person_id?: string
        status: string
        name: string
        domain?: string
        linkedin_url?: string
        email?: string
      },
      [string]
    >(
      subjectType === "company_candidate"
        ? `
          SELECT cc.id, cc.campaign_id, cc.run_id, cc.company_id, cc.status, c.name, c.domain, c.linkedin_url
          FROM company_candidates cc
          JOIN companies c ON c.id = cc.company_id
          WHERE cc.id = ?
        `
        : `
          SELECT pc.id, pc.campaign_id, pc.run_id, pc.company_id, pc.person_id, pc.status, p.name, p.linkedin_url, p.email
          FROM person_candidates pc
          JOIN people p ON p.id = pc.person_id
          WHERE pc.id = ?
        `,
    )
    .get(candidateId)
  if (!row) return null

  const feedback = typeof input.feedback === "string" ? input.feedback.trim() : ""
  const createdBy = typeof input.createdBy === "string" ? input.createdBy.trim() : "Manu"
  const feedbackId = uniqueId("feedback", `${candidateId}_${status}`)
  const hasFeedback = feedback.length > 0

  db.transaction(() => {
    db.prepare(`UPDATE ${table} SET status = ?, user_feedback = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(
      status,
      feedback,
      candidateId,
    )
    if (hasFeedback) {
      db.prepare(`
        INSERT INTO feedback (
          id,
          campaign_id,
          run_id,
          subject_type,
          subject_id,
          feedback_type,
          sentiment,
          text,
          created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        feedbackId,
        row.campaign_id,
        row.run_id,
        subjectType,
        candidateId,
        status,
        feedbackSentiment(status),
        feedback,
        createdBy,
      )
    }

    if (status === "do_not_contact") insertSuppressionForCandidate(subjectType, row, feedback, createdBy)
    if (status === "needs_more_research") enqueueResearchJob(subjectType, row)
    if (subjectType === "company_candidate" && status === "approved" && row.status !== "approved") {
      createPeopleRunForCompanyCandidate(candidateId)
    }

    insertEvent({
      campaignId: row.campaign_id,
      runId: row.run_id ?? undefined,
      subjectType,
      subjectId: candidateId,
      level: status === "approved" ? "success" : status === "do_not_contact" ? "warning" : "info",
      eventType: `${subjectType}.reviewed`,
      message: `${row.name} marcado como ${status}.`,
      payload: hasFeedback ? { status, feedback } : { status },
    })
  })()

  return subjectType === "company_candidate"
    ? listCampaignCompanyCandidates(row.campaign_id).find((candidate) => candidate.candidateId === candidateId)
    : listCampaignPeople(row.campaign_id).find((candidate) => candidate.candidateId === candidateId)
}

function normalizeReviewStatus(value?: string): ReviewStatus | null {
  const normalized = (value || "").trim().toLowerCase()
  if (["approved", "accept", "accepted", "aceptada", "elegida"].includes(normalized)) return "approved"
  if (["rejected", "reject", "rechazada", "descartada"].includes(normalized)) return "rejected"
  if (["maybe", "tal_vez"].includes(normalized)) return "maybe"
  if (["needs_more_research", "research", "investigar"].includes(normalized)) return "needs_more_research"
  if (["do_not_contact", "no_contactar", "dnc"].includes(normalized)) return "do_not_contact"
  if (["new", "pending", "pendiente"].includes(normalized)) return "new"
  return null
}

function feedbackSentiment(status: ReviewStatus) {
  if (status === "approved") return "positive"
  if (status === "rejected" || status === "do_not_contact") return "negative"
  return "neutral"
}

function insertSuppressionForCandidate(
  subjectType: "company_candidate" | "person_candidate",
  row: {
    company_id: string | null
    person_id?: string
    name: string
    domain?: string
    linkedin_url?: string
    email?: string
  },
  feedback: string,
  createdBy: string,
) {
  const reason = feedback || "Marcado como do_not_contact desde backoffice."
  const insert = db.prepare(`
    INSERT OR IGNORE INTO suppression_list (id, scope, value, normalized_value, reason, source, created_by)
    VALUES (?, ?, ?, ?, ?, 'backoffice_review', ?)
  `)

  if (subjectType === "company_candidate") {
    if (row.domain) insert.run(uniqueId("suppression", row.domain), "domain", row.domain, normalizeName(row.domain), reason, createdBy)
    else if (row.company_id) insert.run(uniqueId("suppression", row.company_id), "company", row.company_id, row.company_id, reason, createdBy)
    if (row.linkedin_url) {
      insert.run(uniqueId("suppression", row.linkedin_url), "linkedin_url", row.linkedin_url, row.linkedin_url.toLowerCase(), reason, createdBy)
    }
    return
  }

  if (row.email) insert.run(uniqueId("suppression", row.email), "email", row.email, row.email.toLowerCase(), reason, createdBy)
  else if (row.person_id) insert.run(uniqueId("suppression", row.person_id), "person", row.person_id, row.person_id, reason, createdBy)
  if (row.linkedin_url) {
    insert.run(uniqueId("suppression", row.linkedin_url), "linkedin_url", row.linkedin_url, row.linkedin_url.toLowerCase(), reason, createdBy)
  }
}

function enqueueResearchJob(
  subjectType: "company_candidate" | "person_candidate",
  row: { campaign_id: string; run_id: string | null; company_id: string | null; person_id?: string },
) {
  if (!row.run_id) return
  const skill = subjectType === "company_candidate" ? "research_company" : "research_person"
  const subjectId = subjectType === "company_candidate" ? row.company_id : row.person_id
  const jobId = uniqueId("job", `${row.run_id}_${skill}_${subjectId ?? "subject"}`)

  db.prepare(`
    INSERT INTO openclaw_jobs (id, run_id, campaign_id, skill, status, input_json)
    VALUES (?, ?, ?, ?, 'queued', ?)
  `).run(jobId, row.run_id, row.campaign_id, skill, JSON.stringify({ subjectType, subjectId }))
}

function insertEvent(input: {
  campaignId?: string
  runId?: string
  jobId?: string
  subjectType: string
  subjectId: string
  level: string
  eventType: string
  message: string
  payload: Record<string, unknown>
}) {
  db.prepare(`
    INSERT INTO agent_events (
      campaign_id,
      run_id,
      job_id,
      subject_type,
      subject_id,
      level,
      event_type,
      message,
      payload_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.campaignId ?? null,
    input.runId ?? null,
    input.jobId ?? null,
    input.subjectType,
    input.subjectId,
    input.level,
    input.eventType,
    input.message,
    JSON.stringify(input.payload),
  )
}

function numberOrZero(value: number | null | undefined) {
  return typeof value === "number" ? value : 0
}

function campaignMemory(campaignId: string) {
  const totalCompanies = db
    .query<{ count: number }, [string]>("SELECT COUNT(*) AS count FROM company_candidates WHERE campaign_id = ?")
    .get(campaignId)?.count ?? 0
  const companies = db
    .query<{ name: string; domain: string; linkedin_url: string; status: string; user_feedback: string }, [string]>(`
      SELECT c.name, c.domain, c.linkedin_url, cc.status, cc.user_feedback
      FROM company_candidates cc
      JOIN companies c ON c.id = cc.company_id
      WHERE cc.campaign_id = ?
      ORDER BY cc.updated_at DESC, cc.created_at DESC
      LIMIT 250
    `)
    .all(campaignId)
  const feedback = db
    .query<
      {
        subject_id: string
        feedback_type: string
        text: string
        company_name: string | null
        created_at: string
      },
      [string]
    >(`
      SELECT
        f.subject_id,
        f.feedback_type,
        f.text,
        c.name AS company_name,
        f.created_at
      FROM feedback f
      LEFT JOIN company_candidates cc ON cc.id = f.subject_id AND f.subject_type = 'company_candidate'
      LEFT JOIN companies c ON c.id = cc.company_id
      WHERE f.campaign_id = ?
        AND f.subject_type = 'company_candidate'
        AND f.text <> ''
      ORDER BY f.created_at DESC
      LIMIT 20
    `)
    .all(campaignId)
  const suppression = db.query<{ value: string }, []>("SELECT value FROM suppression_list ORDER BY created_at DESC LIMIT 100").all()

  return {
    memoryStats: {
      totalSeenCompanies: totalCompanies,
      includedSeenCompanies: companies.length,
      includedFeedbackItems: feedback.length,
      truncatedSeenCompanies: Math.max(totalCompanies - companies.length, 0),
    },
    alreadySeenCompanies: companies.map((row) => row.name),
    alreadySeenDomains: companies.map((row) => row.domain).filter(Boolean),
    alreadySeenLinkedinUrls: companies.map((row) => row.linkedin_url).filter(Boolean),
    approvedCompanies: companies.filter((row) => row.status === "approved").map((row) => row.name),
    rejectedCompanies: companies.filter((row) => row.status === "rejected" || row.status === "do_not_contact").map((row) => row.name),
    needsMoreResearchCompanies: companies
      .filter((row) => row.status === "needs_more_research")
      .map((row) => ({
        name: row.name,
        domain: row.domain,
        linkedinUrl: row.linkedin_url,
        note: row.user_feedback,
      })),
    suppression: suppression.map((row) => row.value),
    feedback: feedback.map((row) => ({
      company: row.company_name || row.subject_id,
      type: row.feedback_type,
      text: row.text,
      createdAt: row.created_at,
    })),
  }
}

function companyPeopleMemory(campaignId: string, companyId: string) {
  const people = db
    .query<
      {
        name: string
        title: string
        email: string
        linkedin_url: string
        status: string
        user_feedback: string
        angle_hint: string
      },
      [string, string]
    >(`
      SELECT p.name, p.title, p.email, p.linkedin_url, pc.status, pc.user_feedback, pc.angle_hint
      FROM person_candidates pc
      JOIN people p ON p.id = pc.person_id
      WHERE pc.campaign_id = ? AND COALESCE(pc.company_id, p.company_id) = ?
      ORDER BY pc.updated_at DESC, pc.created_at DESC
      LIMIT 50
    `)
    .all(campaignId, companyId)

  return {
    alreadySeenPeople: people.map((row) => row.name),
    alreadySeenEmails: people.map((row) => row.email).filter(Boolean),
    alreadySeenLinkedinUrls: people.map((row) => row.linkedin_url).filter(Boolean),
    approvedPeople: people.filter((row) => row.status === "approved").map((row) => ({ name: row.name, title: row.title })),
    rejectedPeople: people
      .filter((row) => row.status === "rejected" || row.status === "do_not_contact")
      .map((row) => ({ name: row.name, title: row.title, feedback: row.user_feedback })),
    feedback: people
      .filter((row) => row.user_feedback)
      .map((row) => ({ person: row.name, title: row.title, status: row.status, text: row.user_feedback })),
    angleHints: people.filter((row) => row.angle_hint).map((row) => ({ person: row.name, angleHint: row.angle_hint })),
  }
}

function activePeopleRunForCompanyCandidate(companyCandidateId: string) {
  const rows = db
    .query<RunRow & { input_json: string }, [string]>(`
      SELECT ar.id, ar.campaign_id, ar.mission, ar.status, ar.objective, ar.limits_json, ar.error,
        ar.created_at, ar.started_at, ar.finished_at, oj.input_json
      FROM agent_runs ar
      JOIN openclaw_jobs oj ON oj.run_id = ar.id
      WHERE ar.status IN ('queued', 'running')
        AND oj.skill = 'find_people'
        AND oj.input_json LIKE ?
      ORDER BY ar.created_at DESC
      LIMIT 5
    `)
    .all(`%"companyCandidateId":"${companyCandidateId}"%`)

  return rows.find((row) => {
    const input = parseJson<{ targetCompany?: { companyCandidateId?: string } }>(row.input_json, {})
    return input.targetCompany?.companyCandidateId === companyCandidateId
  }) ?? null
}

function effectiveRunTimeoutSeconds(mission: string, value: unknown) {
  const configured = nonNegativeInteger(value, mission === "people" ? 300 : 900)
  if (mission === "people") return configured
  return Math.min(Math.max(configured, 30), 900)
}

function getOpenClawJob(jobId: string) {
  const row = getOpenClawJobRow(jobId)
  return row ? formatOpenClawJob(row) : null
}

function getOpenClawJobRow(jobId: string) {
  return db
    .query<OpenClawJobRow, [string]>(`
      SELECT id, run_id, campaign_id, skill, status, input_json, output_json, error, attempt, max_attempts,
        timeout_seconds, started_at, finished_at, created_at, updated_at
      FROM openclaw_jobs
      WHERE id = ?
    `)
    .get(jobId)
}

function formatOpenClawJob(row: OpenClawJobRow) {
  return {
    id: row.id,
    runId: row.run_id,
    campaignId: row.campaign_id,
    skill: row.skill,
    status: row.status,
    input: parseJson(row.input_json, {}),
    output: parseJson(row.output_json, {}),
    error: row.error,
    attempt: row.attempt,
    maxAttempts: row.max_attempts,
    timeoutSeconds: row.timeout_seconds,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function validateOpenClawOutput(skill: string, output: unknown): { ok: true; output: Record<string, unknown> } | { ok: false; error: string } {
  if (!output || typeof output !== "object" || Array.isArray(output)) return { ok: false, error: "OpenClaw output must be a JSON object." }
  const record = output as Record<string, unknown>

  if (skill === "find_companies") {
    if (!Array.isArray(record.companies)) return { ok: false, error: "find_companies output must include companies array." }
    return {
      ok: true,
      output: {
        companies: record.companies.map(normalizeCompanyOutput).filter((company) => company.name),
      },
    }
  }

  if (skill === "find_people") {
    if (!Array.isArray(record.people)) return { ok: false, error: "find_people output must include people array." }
    return {
      ok: true,
      output: {
        people: record.people.map(normalizePersonOutput).filter((person) => person.name),
      },
    }
  }

  return { ok: true, output: record }
}

function normalizeCompanyOutput(value: unknown) {
  const record = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
  const score = nonNegativeInteger(record.score, 0)
  return {
    name: cleanText(record.name, ""),
    domain: normalizeDomain(cleanText(record.domain, "")),
    linkedin_url: cleanText(record.linkedin_url, ""),
    country: cleanText(record.country, ""),
    city: cleanText(record.city, ""),
    industry: cleanText(record.industry, ""),
    employee_range: cleanText(record.employee_range, ""),
    description: cleanText(record.description, ""),
    score: Math.min(score, 100),
    rationale: cleanText(record.rationale, ""),
    evidence: Array.isArray(record.evidence) ? record.evidence.map(normalizeEvidenceOutput).filter(Boolean) : [],
  }
}

function normalizeEvidenceOutput(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  return {
    type: cleanText(record.type, "source"),
    url: cleanText(record.url, ""),
    note: cleanText(record.note, ""),
  }
}

function normalizePersonOutput(value: unknown) {
  const record = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
  const score = nonNegativeInteger(record.score, 0)
  const reachabilityReason = cleanText(record.reachability_reason, "")
  const geoScope = cleanText(record.geo_scope, "")
  const seniorityFit = cleanText(record.seniority_fit, "")
  const roleCategory = cleanText(record.role_category, "")
  const rationale = cleanText(record.rationale, "")
  const rationaleContext = [
    reachabilityReason ? `Alcance: ${reachabilityReason}` : "",
    geoScope ? `Scope: ${geoScope}` : "",
  ].filter(Boolean)
  return {
    name: cleanText(record.name, ""),
    title: cleanText(record.title, ""),
    company_name: cleanText(record.company_name, ""),
    company_domain: normalizeDomain(cleanText(record.company_domain, "")),
    linkedin_url: cleanText(record.linkedin_url, ""),
    email: cleanText(record.email, "").toLowerCase(),
    phone: cleanText(record.phone, ""),
    country: cleanText(record.country, ""),
    city: cleanText(record.city, ""),
    seniority: cleanText(record.seniority, seniorityFit),
    function: cleanText(record.function, roleCategory),
    description: cleanText(record.description, ""),
    score: Math.min(score, 100),
    rationale: [rationale, ...rationaleContext].filter(Boolean).join(" "),
    angle_hint: cleanText(record.angle_hint, ""),
    source_provider: cleanText(record.source_provider, ""),
    evidence: Array.isArray(record.evidence) ? record.evidence.map(normalizeEvidenceOutput).filter(Boolean) : [],
  }
}

export function scorePersonCandidateForCampaign(person: NormalizedPersonOutput, input: PeopleScoringInput = {}) {
  const titleText = normalizeName(
    [
      person.title,
      person.seniority,
      person.function,
    ].join(" "),
  )
  const personContextText = normalizeName(
    [
      person.description,
      person.country,
      person.city,
    ].join(" "),
  )
  const explanationText = normalizeName(
    [
      person.rationale,
      person.angle_hint,
    ].join(" "),
  )
  const campaignText = normalizeName(
    [
      input.brief?.objective,
      input.brief?.peopleContext,
      input.brief?.positiveSignals,
      input.targetCompany?.industry,
      input.targetCompany?.description,
      input.targetCompany?.rationale,
    ].join(" "),
  )
  const evidenceText = normalizeName(
    person.evidence
      .filter((item) => Boolean(item))
      .map((item) => `${item?.type} ${item?.url} ${item?.note}`)
      .join(" "),
  )
  const personScopeText = `${titleText} ${personContextText} ${evidenceText}`
  const largeCompany = isLargeCompanyRange(input.targetCompany?.employeeRange || "")
  const partnershipMotion = hasAny(campaignText, [
    "partner",
    "partnership",
    "partnerships",
    "alianza",
    "alianzas",
    "canal",
    "channel",
    "marketplace",
    "seller",
    "sellers",
    "vendedor",
    "vendedores",
    "merchant",
    "ecosystem",
    "ecosistema",
  ])
  const executive = hasAny(titleText, ["ceo", "chief executive officer", "founder", "co founder", "cofundador", "chairman", "owner", "dueno", "propietario"])
  const globalExecutive = executive && hasAny(titleText, ["global", "corporate", "group", "worldwide", "international", "executive chairman", "board"])
  const explicitExecutiveAsk = hasAny(campaignText, ["ceo", "founder", "fundador", "c level", "c suite", "director general", "dueno", "owner"])
  const relevantOperator = hasAny(titleText, [
    "partnership",
    "partnerships",
    "partner",
    "alliances",
    "alliance",
    "alianza",
    "alianzas",
    "business development",
    "desarrollo de negocio",
    "bd",
    "channel",
    "canal",
    "ecosystem",
    "ecosistema",
    "marketplace",
    "seller",
    "sellers",
    "vendedor",
    "vendedores",
    "merchant",
    "merchant success",
    "growth",
    "commercial",
    "comercial",
    "marketing",
    "sales",
    "ventas",
    "operations",
    "operaciones",
  ])
  const localScope = hasAny(personScopeText, ["mexico", "mex", "mx", "latam", "latin america", "america latina", "hispanoamerica"])
  const explanationClaimsOwnership = hasAny(explanationText, ["partnership", "partnerships", "alianza", "alianzas", "canal", "channel"])
  const operatorSeniority = hasAny(titleText, ["head", "director", "lead", "lider", "manager", "gerente", "vp", "vice president", "country", "regional"])
  const contactable = Boolean(person.email || person.linkedin_url || person.phone)
  const evidenceBacked = person.evidence.some((item) => Boolean(item?.url))

  let delta = 0
  const notes: string[] = []

  if (relevantOperator) {
    delta += partnershipMotion ? 18 : 10
    notes.push("sube por rol operativo relevante")
  }
  if (operatorSeniority && !executive) {
    delta += 8
    notes.push("sube por seniority accionable")
  }
  if (localScope) {
    delta += 8
    notes.push("sube por alcance local/regional")
  }
  if (contactable) {
    delta += 4
    notes.push("sube por canal encontrado")
  } else {
    delta -= 6
    notes.push("baja por falta de canal directo")
  }
  if (!evidenceBacked) {
    delta -= 12
    notes.push("baja por evidencia debil")
  }
  if (largeCompany && executive && !explicitExecutiveAsk && !relevantOperator) {
    delta -= 24
    notes.push("baja por ejecutivo demasiado alto para empresa grande")
  } else if (largeCompany && globalExecutive && !explicitExecutiveAsk) {
    delta -= 14
    notes.push("baja por alcance global")
  }
  if (partnershipMotion && !relevantOperator && executive && largeCompany) {
    delta -= 10
    notes.push("baja porque no muestra ownership de partnerships/canal")
  }
  if (partnershipMotion && explanationClaimsOwnership && !relevantOperator && largeCompany) {
    delta -= 6
    notes.push("baja porque el fit viene de la explicación, no del rol")
  }

  let score = clampScore(person.score + delta)
  if (!contactable) score = Math.min(score, 88)
  if (executive && !contactable && !explicitExecutiveAsk) score = Math.min(score, 78)
  if (largeCompany && executive && !explicitExecutiveAsk && !relevantOperator) score = Math.min(score, 70)
  if (largeCompany && globalExecutive && !explicitExecutiveAsk) score = Math.min(score, 68)
  return {
    ...person,
    score,
    rationale: appendFitNote(person.rationale, notes),
  }
}

function appendFitNote(rationale: string, notes: string[]) {
  const uniqueNotes = Array.from(new Set(notes)).slice(0, 3)
  if (uniqueNotes.length === 0) return rationale
  const fitNote = `Ajuste Clo: ${uniqueNotes.join("; ")}.`
  return rationale ? `${rationale} ${fitNote}` : fitNote
}

function isLargeCompanyRange(value: string) {
  const normalized = normalizeName(value)
  if (!normalized) return false
  const numbers = normalized.match(/\d+/g)?.map((item) => Number(item)).filter(Number.isFinite) ?? []
  if (numbers.some((item) => item > 200)) return true
  return hasAny(normalized, ["enterprise", "corporativo", "large", "grande", "1000", "5000", "10000"])
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

function clampScore(value: number) {
  return Math.max(Math.min(Math.round(value), 100), 0)
}

function persistFoundCompanies(job: OpenClawJobRow, output: Record<string, unknown>) {
  const companies = Array.isArray(output.companies) ? output.companies : []
  const input = parseJson<{ brief?: { reviewBatchSize?: number } }>(job.input_json, {})
  const reviewBatchSize = positiveInteger(input.brief?.reviewBatchSize, companies.length || 10)
  let visibleInserted = 0
  for (const company of companies) {
    if (!company || typeof company !== "object" || Array.isArray(company)) continue
    const candidate = company as ReturnType<typeof normalizeCompanyOutput>
    if (!candidate.name) continue

    insertEvent({
      campaignId: job.campaign_id,
      runId: job.run_id,
      jobId: job.id,
      subjectType: "company_candidate",
      subjectId: "",
      level: "info",
      eventType: "company.proposed",
      message: `${candidate.name} propuesta por OpenClaw.`,
      payload: { domain: candidate.domain, linkedinUrl: candidate.linkedin_url, score: candidate.score },
    })
    if (isSuppressedCompanyCandidate(candidate)) {
      insertEvent({
        campaignId: job.campaign_id,
        runId: job.run_id,
        jobId: job.id,
        subjectType: "company_candidate",
        subjectId: "",
        level: "warning",
        eventType: "company.suppressed",
        message: `${candidate.name} omitida por suppression_list.`,
        payload: { domain: candidate.domain, linkedinUrl: candidate.linkedin_url },
      })
      continue
    }

    const companyId = upsertCompanyFromCandidate(candidate, job.run_id)
    const candidateId = stableId("company_candidate", job.campaign_id, companyId)
    const existingCandidate = db
      .query<{ id: string }, [string, string]>("SELECT id FROM company_candidates WHERE campaign_id = ? AND company_id = ? LIMIT 1")
      .get(job.campaign_id, companyId)
    if (existingCandidate) {
      insertEvent({
        campaignId: job.campaign_id,
        runId: job.run_id,
        jobId: job.id,
        subjectType: "company_candidate",
        subjectId: existingCandidate.id,
        level: "info",
        eventType: "company.dedupe_skipped",
        message: `${candidate.name} ya existía en esta campaña.`,
        payload: { companyId, score: candidate.score },
      })
      continue
    }
    db.prepare(`
      INSERT OR IGNORE INTO company_candidates (
        id,
        campaign_id,
        run_id,
        company_id,
        status,
        score,
        rationale,
        evidence_json,
        review_visible,
        review_revealed_at
      ) VALUES (?, ?, ?, ?, 'new', ?, ?, ?, ?, CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END)
    `).run(
      candidateId,
      job.campaign_id,
      job.run_id,
      companyId,
      candidate.score,
      candidate.rationale,
      JSON.stringify(candidate.evidence),
      visibleInserted < reviewBatchSize ? 1 : 0,
      visibleInserted < reviewBatchSize ? 1 : 0,
    )
    visibleInserted += 1
    insertEvent({
      campaignId: job.campaign_id,
      runId: job.run_id,
      jobId: job.id,
      subjectType: "company_candidate",
      subjectId: candidateId,
      level: "info",
      eventType: "company.saved",
      message: `${candidate.name} guardada como empresa candidata.`,
      payload: { companyId, score: candidate.score, reviewVisible: visibleInserted <= reviewBatchSize },
    })
  }
}

function persistFoundPeople(job: OpenClawJobRow, output: Record<string, unknown>) {
  const input = parseJson<
    PeopleScoringInput & { targetCompany?: { companyId?: string; name?: string; domain?: string; country?: string } }
  >(job.input_json, {})
  const people = (Array.isArray(output.people) ? output.people : [])
    .filter((person): person is NormalizedPersonOutput => Boolean(person && typeof person === "object" && !Array.isArray(person)))
    .map((person) => scorePersonCandidateForCampaign(person, input))
    .sort((left, right) => right.score - left.score)
  const targetCompanyId = input.targetCompany?.companyId || ""
  const targetCompanyName = input.targetCompany?.name || ""
  const targetCompanyDomain = input.targetCompany?.domain || ""
  const targetCountry = input.targetCompany?.country || ""

  for (const person of people) {
    const candidate = person
    if (!candidate.name) continue

    if (isDifferentTargetCompany(candidate, targetCompanyName, targetCompanyDomain)) {
      insertEvent({
        campaignId: job.campaign_id,
        runId: job.run_id,
        jobId: job.id,
        subjectType: "person_candidate",
        subjectId: "",
        level: "warning",
        eventType: "person.company_mismatch",
        message: `${candidate.name} omitida porque pertenece a otra empresa.`,
        payload: {
          expectedCompany: targetCompanyName,
          expectedDomain: targetCompanyDomain,
          returnedCompany: candidate.company_name,
          returnedDomain: candidate.company_domain,
        },
      })
      continue
    }

    const companyId =
      targetCompanyId ||
      findExistingCompany(candidate.company_domain || targetCompanyDomain, "", normalizeName(candidate.company_name || targetCompanyName), candidate.country || targetCountry)?.id ||
      null

    insertEvent({
      campaignId: job.campaign_id,
      runId: job.run_id,
      jobId: job.id,
      subjectType: "person_candidate",
      subjectId: "",
      level: "info",
      eventType: "person.proposed",
      message: `${candidate.name} propuesta por OpenClaw.`,
      payload: { title: candidate.title, email: candidate.email, linkedinUrl: candidate.linkedin_url, score: candidate.score },
    })

    if (isSuppressedPersonCandidate(candidate)) {
      insertEvent({
        campaignId: job.campaign_id,
        runId: job.run_id,
        jobId: job.id,
        subjectType: "person_candidate",
        subjectId: "",
        level: "warning",
        eventType: "person.suppressed",
        message: `${candidate.name} omitida por suppression_list.`,
        payload: { email: candidate.email, linkedinUrl: candidate.linkedin_url },
      })
      continue
    }

    const personId = upsertPersonFromCandidate(candidate, companyId, targetCompanyName, job.run_id)
    const candidateId = stableId("person_candidate", job.campaign_id, personId)
    const existingCandidate = db
      .query<{ id: string }, [string, string]>("SELECT id FROM person_candidates WHERE campaign_id = ? AND person_id = ? LIMIT 1")
      .get(job.campaign_id, personId)
    if (existingCandidate) {
      db.prepare(`
        UPDATE person_candidates
        SET
          run_id = ?,
          company_id = COALESCE(company_id, ?),
          score = ?,
          rationale = CASE WHEN ? <> '' THEN ? ELSE rationale END,
          evidence_json = CASE WHEN ? <> '[]' THEN ? ELSE evidence_json END,
          angle_hint = CASE WHEN ? <> '' THEN ? ELSE angle_hint END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        job.run_id,
        companyId,
        candidate.score,
        candidate.rationale,
        candidate.rationale,
        JSON.stringify(candidate.evidence),
        JSON.stringify(candidate.evidence),
        candidate.angle_hint,
        candidate.angle_hint,
        existingCandidate.id,
      )
      insertEvent({
        campaignId: job.campaign_id,
        runId: job.run_id,
        jobId: job.id,
        subjectType: "person_candidate",
        subjectId: existingCandidate.id,
        level: "info",
        eventType: "person.updated",
        message: `${candidate.name} actualizada desde una nueva corrida de personas.`,
        payload: { personId, score: candidate.score },
      })
      continue
    }

    db.prepare(`
      INSERT OR IGNORE INTO person_candidates (
        id,
        campaign_id,
        run_id,
        person_id,
        company_id,
        status,
        score,
        rationale,
        evidence_json,
        angle_hint
      ) VALUES (?, ?, ?, ?, ?, 'new', ?, ?, ?, ?)
    `).run(
      candidateId,
      job.campaign_id,
      job.run_id,
      personId,
      companyId,
      candidate.score,
      candidate.rationale,
      JSON.stringify(candidate.evidence),
      candidate.angle_hint,
    )

    insertEvent({
      campaignId: job.campaign_id,
      runId: job.run_id,
      jobId: job.id,
      subjectType: "person_candidate",
      subjectId: candidateId,
      level: "info",
      eventType: "person.saved",
      message: `${candidate.name} guardada como persona candidata.`,
      payload: { personId, companyId, score: candidate.score, sourceProvider: candidate.source_provider },
    })
  }
}

function isDifferentTargetCompany(person: NormalizedPersonOutput, targetCompanyName: string, targetCompanyDomain: string) {
  const returnedDomain = normalizeDomain(person.company_domain)
  const expectedDomain = normalizeDomain(targetCompanyDomain)
  if (returnedDomain && expectedDomain && returnedDomain !== expectedDomain) return true

  const returnedName = normalizeName(person.company_name)
  const expectedName = normalizeName(targetCompanyName)
  if (!returnedName || !expectedName) return false
  return !returnedName.includes(expectedName) && !expectedName.includes(returnedName)
}

function isSuppressedCompanyCandidate(company: ReturnType<typeof normalizeCompanyOutput>) {
  const checks: Array<[string, string]> = []
  if (company.domain) checks.push(["domain", normalizeName(company.domain)])
  if (company.linkedin_url) checks.push(["linkedin_url", company.linkedin_url.toLowerCase()])
  if (company.name) checks.push(["company", normalizeName(company.name)])

  return checks.some(([scope, normalizedValue]) => {
    const row = db
      .query<{ count: number }, [string, string]>(
        "SELECT COUNT(*) AS count FROM suppression_list WHERE scope = ? AND normalized_value = ?",
      )
      .get(scope, normalizedValue)
    return Boolean(row && row.count > 0)
  })
}

function isSuppressedPersonCandidate(person: ReturnType<typeof normalizePersonOutput>) {
  const checks: Array<[string, string]> = []
  if (person.email) checks.push(["email", person.email.toLowerCase()])
  if (person.linkedin_url) checks.push(["linkedin_url", person.linkedin_url.toLowerCase()])
  if (person.name) checks.push(["person", normalizeName(person.name)])

  return checks.some(([scope, normalizedValue]) => {
    const row = db
      .query<{ count: number }, [string, string]>(
        "SELECT COUNT(*) AS count FROM suppression_list WHERE scope = ? AND normalized_value = ?",
      )
      .get(scope, normalizedValue)
    return Boolean(row && row.count > 0)
  })
}

function upsertCompanyFromCandidate(company: ReturnType<typeof normalizeCompanyOutput>, runId: string) {
  const normalized = normalizeName(company.name)
  const existing = findExistingCompany(company.domain, company.linkedin_url, normalized, company.country)
  const companyId = existing?.id ?? uniqueId("company", company.name)

  if (!existing) {
    db.prepare(`
      INSERT INTO companies (
        id,
        name,
        normalized_name,
        domain,
        linkedin_url,
        country,
        city,
        industry,
        employee_range,
        description,
        source_json,
        first_seen_run_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      companyId,
      company.name,
      normalized,
      company.domain,
      company.linkedin_url,
      company.country,
      company.city,
      company.industry,
      company.employee_range,
      company.description,
      JSON.stringify({ source: "openclaw" }),
      runId,
    )
    return companyId
  }

  db.prepare(`
    UPDATE companies
    SET
      domain = CASE WHEN ? <> '' THEN ? ELSE domain END,
      linkedin_url = CASE WHEN ? <> '' THEN ? ELSE linkedin_url END,
      country = CASE WHEN ? <> '' THEN ? ELSE country END,
      city = CASE WHEN ? <> '' THEN ? ELSE city END,
      industry = CASE WHEN ? <> '' THEN ? ELSE industry END,
      employee_range = CASE WHEN ? <> '' THEN ? ELSE employee_range END,
      description = CASE WHEN ? <> '' THEN ? ELSE description END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    company.domain,
    company.domain,
    company.linkedin_url,
    company.linkedin_url,
    company.country,
    company.country,
    company.city,
    company.city,
    company.industry,
    company.industry,
    company.employee_range,
    company.employee_range,
    company.description,
    company.description,
    companyId,
  )
  return companyId
}

function findExistingCompany(domain: string, linkedinUrl: string, normalizedName: string, country: string) {
  if (domain) {
    const row = db.query<{ id: string }, [string]>("SELECT id FROM companies WHERE domain = ? LIMIT 1").get(domain)
    if (row) return row
  }
  if (linkedinUrl) {
    const row = db.query<{ id: string }, [string]>("SELECT id FROM companies WHERE linkedin_url = ? LIMIT 1").get(linkedinUrl)
    if (row) return row
  }
  if (normalizedName) {
    const row = db
      .query<{ id: string }, [string, string]>("SELECT id FROM companies WHERE normalized_name = ? AND country = ? LIMIT 1")
      .get(normalizedName, country)
    if (row) return row
  }
  return null
}

function upsertPersonFromCandidate(
  person: ReturnType<typeof normalizePersonOutput>,
  companyId: string | null,
  fallbackCompanyName: string,
  runId: string,
) {
  const normalized = normalizeName(person.name)
  const companyName = person.company_name || fallbackCompanyName || ""
  const existing = findExistingPerson(person.email, person.linkedin_url, normalized, companyId, companyName, person.country)
  const personId = existing?.id ?? uniqueId("person", person.name)

  if (!existing) {
    db.prepare(`
      INSERT INTO people (
        id,
        name,
        normalized_name,
        title,
        company_id,
        company_name,
        linkedin_url,
        email,
        phone,
        country,
        city,
        seniority,
        function,
        description,
        source_provider,
        source_json,
        first_seen_run_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      personId,
      person.name,
      normalized,
      person.title,
      companyId,
      companyName,
      person.linkedin_url,
      person.email,
      person.phone,
      person.country,
      person.city,
      person.seniority,
      person.function,
      person.description,
      person.source_provider,
      JSON.stringify({ source: "openclaw", provider: person.source_provider }),
      runId,
    )
    return personId
  }

  db.prepare(`
    UPDATE people
    SET
      title = CASE WHEN ? <> '' THEN ? ELSE title END,
      company_id = COALESCE(company_id, ?),
      company_name = CASE WHEN ? <> '' THEN ? ELSE company_name END,
      linkedin_url = CASE WHEN ? <> '' THEN ? ELSE linkedin_url END,
      email = CASE WHEN ? <> '' THEN ? ELSE email END,
      phone = CASE WHEN ? <> '' THEN ? ELSE phone END,
      country = CASE WHEN ? <> '' THEN ? ELSE country END,
      city = CASE WHEN ? <> '' THEN ? ELSE city END,
      seniority = CASE WHEN ? <> '' THEN ? ELSE seniority END,
      function = CASE WHEN ? <> '' THEN ? ELSE function END,
      description = CASE WHEN ? <> '' THEN ? ELSE description END,
      source_provider = CASE WHEN ? <> '' THEN ? ELSE source_provider END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    person.title,
    person.title,
    companyId,
    companyName,
    companyName,
    person.linkedin_url,
    person.linkedin_url,
    person.email,
    person.email,
    person.phone,
    person.phone,
    person.country,
    person.country,
    person.city,
    person.city,
    person.seniority,
    person.seniority,
    person.function,
    person.function,
    person.description,
    person.description,
    person.source_provider,
    person.source_provider,
    personId,
  )
  return personId
}

function findExistingPerson(
  email: string,
  linkedinUrl: string,
  normalizedName: string,
  companyId: string | null,
  companyName: string,
  country: string,
) {
  if (email) {
    const row = db.query<{ id: string }, [string]>("SELECT id FROM people WHERE email = ? LIMIT 1").get(email)
    if (row) return row
  }
  if (linkedinUrl) {
    const row = db.query<{ id: string }, [string]>("SELECT id FROM people WHERE linkedin_url = ? LIMIT 1").get(linkedinUrl)
    if (row) return row
  }
  if (normalizedName && companyId) {
    const row = db
      .query<{ id: string }, [string, string]>("SELECT id FROM people WHERE normalized_name = ? AND company_id = ? LIMIT 1")
      .get(normalizedName, companyId)
    if (row) return row
  }
  if (normalizedName && companyName) {
    const row = db
      .query<{ id: string }, [string, string, string]>(
        "SELECT id FROM people WHERE normalized_name = ? AND company_name = ? AND country = ? LIMIT 1",
      )
      .get(normalizedName, companyName, country)
    if (row) return row
  }
  return null
}

function outputSummary(skill: string, output: Record<string, unknown>) {
  if (skill === "find_companies") {
    return { companies: Array.isArray(output.companies) ? output.companies.length : 0 }
  }
  if (skill === "find_people") {
    return { people: Array.isArray(output.people) ? output.people.length : 0 }
  }
  return {}
}

function normalizeDomain(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
}

function cleanText(value: unknown, fallback: unknown) {
  if (typeof value === "string") return value.trim()
  if (typeof fallback === "string") return fallback
  return ""
}

function nonNegativeInteger(value: unknown, fallback: unknown) {
  const parsed = typeof value === "number" ? value : Number(value)
  if (Number.isFinite(parsed) && parsed >= 0) return Math.floor(parsed)
  return typeof fallback === "number" && fallback >= 0 ? Math.floor(fallback) : 0
}

function positiveInteger(value: unknown, fallback: unknown) {
  const parsed = nonNegativeInteger(value, fallback)
  if (parsed > 0) return parsed
  return typeof fallback === "number" && fallback > 0 ? Math.floor(fallback) : 1
}

function scoreThreshold(value: unknown, fallback: unknown) {
  return Math.min(nonNegativeInteger(value, fallback), 100)
}

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function uniqueId(prefix: string, value: string) {
  const slug = normalizeName(value).replace(/\s+/g, "_").slice(0, 32) || "nuevo"
  uniqueIdCounter = (uniqueIdCounter + 1) % 46656
  return `${prefix}_${slug}_${Date.now().toString(36).slice(-6)}_${uniqueIdCounter.toString(36)}`
}

function stableId(prefix: string, ...parts: string[]) {
  const slug = parts
    .map((part) => normalizeName(part).replace(/\s+/g, "_"))
    .filter(Boolean)
    .join("_")
  return `${prefix}_${slug || "item"}`
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function colorFor(value: string) {
  let hash = 0
  for (const char of value) hash = (hash + char.charCodeAt(0)) % colors.length
  return colors[hash]
}

function formatDateLabel(value: string) {
  return value?.slice(0, 10) || "-"
}

function eventDay(value: string) {
  const date = value?.slice(0, 10)
  const today = new Date().toISOString().slice(0, 10)
  if (date === today) return "HOY"
  return date || "SIN FECHA"
}

function eventTime(value: string) {
  const match = value?.match(/\d{2}:\d{2}/)
  return match?.[0] ?? value?.slice(0, 16) ?? "-"
}

function eventSeverity(level: string) {
  if (level === "success") return "ok"
  if (level === "warning") return "warn"
  if (level === "error") return "danger"
  return "info"
}

function firstCampaignId() {
  const row = db.query<{ id: string }, []>("SELECT id FROM campaigns ORDER BY created_at ASC LIMIT 1").get()
  if (row) return row.id

  const campaign = createCampaign({ name: "Campaign sin nombre" })
  return campaign?.id ?? "campaign_draft"
}

function existingCampaignId(id?: string) {
  if (!id?.trim()) return null
  const row = db.query<{ id: string }, [string]>("SELECT id FROM campaigns WHERE id = ?").get(id)
  return row?.id ?? null
}
