import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
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
  user_feedback: string
  name: string
  title: string
  linkedin_url: string
  email: string
  company_name: string
  industry: string
  country: string
  seniority: string
  function: string
  description: string
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

type ProspectingPlanRow = {
  id: string
  query_id: string
  run_id: string | null
  status: string
  plan_json: string
  recommended_first_plan_id: string
  estimated_cost_cents: number
  max_cost_cents: number
  strategy_markdown: string
  markdown_path: string
  revision: number
  feedback_json: string
  created_at: string
  updated_at: string
}

type ProspectingStepRow = {
  id: string
  plan_id: string
  run_id: string | null
  job_id: string | null
  step_order: number
  skill: string
  source_key: string
  status: string
  input_json: string
  output_summary_json: string
  quality_score: number
  estimated_cost_cents: number
  actual_cost_cents: number
  stop_reason: string
  error: string
  started_at: string | null
  finished_at: string | null
  created_at: string
  updated_at: string
}

export type ProspectingStrategyResult = {
  query_original?: string
  icp_characterized?: Record<string, unknown>
  memory_used?: Record<string, unknown>
  budget_guard?: {
    run_budget_cents?: number
    estimated_total_cents?: number
    stop_before_exceeding_budget?: boolean
    unknown_cost_policy?: string
  }
  strategy_markdown?: string
  plans?: Array<Record<string, unknown>>
  recommended_first_plan_id?: string
  operator_warnings?: string[]
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
}

type ReviewStatus = "approved" | "rejected" | "maybe" | "needs_more_research" | "do_not_contact" | "new"

export type OpenClawQueuedJob = ReturnType<typeof formatOpenClawJob>

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
  "prospecting_queries",
  "prospecting_plans",
  "prospecting_steps",
  "learned_patterns",
  "prospecting_cost_ledger",
  "schema_migrations",
] as const

const COMPANY_DISCOVERY_INTERACTIVE_PREFETCH_CAP = 20

export function setupDatabase() {
  seedDevelopmentData()
}

function seedDevelopmentData() {
  const campaignCount = db.query<{ count: number }, []>("SELECT COUNT(*) AS count FROM campaigns").get()
  const forceSeed = Bun.env.BENFORD_BACKOFFICE_FORCE_DEV_SEED === "1"
  if ((campaignCount?.count ?? 0) > 0 && !forceSeed) return
  if (forceSeed) resetDevelopmentSeedData()

  const seedPath = path.join(appRoot, "db", "seeds", "dev.sql")
  db.exec(readFileSync(seedPath, "utf8"))
}

function resetDevelopmentSeedData() {
  db.exec(`
    DELETE FROM campaigns WHERE id IN (
      'campaign_fintech_latam',
      'campaign_saas_cfos_mx',
      'campaign_contadores_pymes',
      'campaign_draft'
    );
    DELETE FROM agent_runs WHERE id IN ('run_fintech_001', 'run_saas_001');
    DELETE FROM openclaw_jobs WHERE id IN (
      'job_fintech_company_discovery_001',
      'job_fintech_find_people_001',
      'job_saas_find_people_001'
    );
    DELETE FROM company_candidates WHERE id IN (
      'company_candidate_mendel_fintech',
      'company_candidate_bitso_fintech',
      'company_candidate_clip_fintech'
    );
    DELETE FROM companies WHERE id IN (
      'company_mendel',
      'company_rappi',
      'company_kavak',
      'company_bitso',
      'company_clip'
    )
    OR domain IN ('mendel.com', 'rappi.com', 'kavak.com', 'bitso.com', 'clip.mx')
    OR linkedin_url IN (
      'https://linkedin.com/company/mendel',
      'https://linkedin.com/company/rappi',
      'https://linkedin.com/company/kavak-com',
      'https://linkedin.com/company/bitso',
      'https://linkedin.com/company/clip-mx'
    );
    DELETE FROM person_candidates WHERE id IN (
      'person_candidate_andres_fintech',
      'person_candidate_sofia_fintech',
      'person_candidate_lucas_saas',
      'person_candidate_maria_saas',
      'person_candidate_diego_fintech'
    );
    DELETE FROM people WHERE id IN (
      'person_andres_martin',
      'person_sofia_bermudez',
      'person_lucas_pereira',
      'person_maria_fernandez',
      'person_diego_acosta'
    )
    OR linkedin_url IN (
      'https://linkedin.com/in/andres-martin-seed',
      'https://linkedin.com/in/sofia-bermudez-seed',
      'https://linkedin.com/in/lucas-pereira-seed',
      'https://linkedin.com/in/maria-fernandez-seed',
      'https://linkedin.com/in/diego-acosta-seed'
    );
    DELETE FROM feedback WHERE id IN ('feedback_sofia_approved', 'feedback_bitso_maybe');
    DELETE FROM outreach_drafts WHERE id = 'draft_sofia_fintech_001';
  `)
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
        positive_signals,
        negative_signals,
        search_mode,
        run_budget_cents,
        max_companies,
        max_people,
        max_runtime_seconds,
        min_score_threshold
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      objective,
      input.industry?.trim() || "",
      input.niche?.trim() || "",
      input.countryRegion?.trim() || "",
      input.companySize?.trim() || "",
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
    latestStrategy: latestProspectingPlanForCampaign(campaignId),
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
  },
) {
  if (!existingCampaignId(campaignId)) return null

  const current: CampaignBriefPayload = getCampaignDetail(campaignId)?.brief ?? {
    objective: "",
    industry: "",
    niche: "",
    countryRegion: "",
    companySize: "",
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
      positive_signals,
      negative_signals,
      search_mode,
      run_budget_cents,
      max_companies,
      max_people,
      max_runtime_seconds,
      min_score_threshold,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(campaign_id) DO UPDATE SET
      objective = excluded.objective,
      industry = excluded.industry,
      niche = excluded.niche,
      country_region = excluded.country_region,
      company_size = excluded.company_size,
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

export function buildProspectingStrategyInput(
  campaignId: string,
  input: { query?: string; feedback?: string; currentPlanId?: string } = {},
) {
  const campaign = getCampaignDetail(campaignId)
  if (!campaign) return null
  const brief = campaign.brief
  const query = input.query?.trim() || brief.objective || campaign.criteria || campaign.name
  const currentStrategy = input.currentPlanId ? getProspectingPlan(input.currentPlanId) : latestProspectingPlanForCampaign(campaign.id)

  return {
    query_original: query,
    mode: input.feedback ? "revise_strategy" : "create_strategy",
    feedback: input.feedback?.trim() || "",
    campaign: {
      id: campaign.id,
      name: campaign.name,
      brief,
      memory: campaignMemory(campaign.id),
    },
    limits: {
      runBudgetCents: brief.runBudgetCents,
      maxCompanies: brief.maxCompanies,
      maxPeople: brief.maxPeople,
      maxRuntimeSeconds: brief.maxRuntimeSeconds,
      minScoreThreshold: brief.minScoreThreshold,
    },
    allowedSources: [
      "web_search",
      "web_fetch",
      "google_dorks",
      "apollo",
      "scrapio",
      "explorium",
      "people_data_labs",
      "google_maps_places",
      "apify",
      "inegi_denue",
    ],
    sourceAdapters: {
      apolloConfigured: Boolean(Bun.env.APOLLO_API_KEY),
      exploriumConfigured: Boolean(Bun.env.EXPLORIUM_API_KEY),
      pdlConfigured: Boolean(Bun.env.PDL_API_KEY),
      paidSourcesRequireBudget: paidSourcesRequireBudget(),
      currency: "USD cents",
    },
    blockedSources: ["direct_linkedin_scraping", "automatic_outreach"],
    currentStrategy,
    outputContract: "Return only JSON matching prospecting-strategist/references/strategy-plan-contract.json.",
  }
}

export function saveProspectingStrategyPlan(
  campaignId: string,
  queryOriginal: string,
  result: ProspectingStrategyResult,
  createdBy = "OpenClaw",
) {
  if (!existingCampaignId(campaignId)) return null
  const query = queryOriginal.trim() || result.query_original?.trim() || ""
  const queryId = uniqueId("prospecting_query", `${campaignId}_${query || "strategy"}`)
  const planId = uniqueId("prospecting_plan", `${queryId}_${result.recommended_first_plan_id || "plan"}`)
  const maxCost = nonNegativeInteger(result.budget_guard?.run_budget_cents, 0)
  const estimatedCost = nonNegativeInteger(result.budget_guard?.estimated_total_cents, 0)
  const markdown = normalizeStrategyMarkdown(result, query)
  const markdownPath = strategyMarkdownPath(campaignId, planId)

  db.transaction(() => {
    db.prepare(`
      INSERT INTO prospecting_queries (
        id, campaign_id, query_original, query_fingerprint, icp_signature_json, status, budget_limit_cents
      ) VALUES (?, ?, ?, ?, ?, 'planned', ?)
    `).run(queryId, campaignId, query, normalizeName(query), JSON.stringify(result.icp_characterized || {}), maxCost)

    db.prepare(`
      INSERT INTO prospecting_plans (
        id, query_id, status, plan_json, recommended_first_plan_id, estimated_cost_cents, max_cost_cents,
        strategy_markdown, markdown_path, revision, feedback_json, created_by
      ) VALUES (?, ?, 'draft', ?, ?, ?, ?, ?, ?, 1, '[]', ?)
    `).run(
      planId,
      queryId,
      JSON.stringify(result),
      result.recommended_first_plan_id || "",
      estimatedCost,
      maxCost,
      markdown,
      markdownPath,
      createdBy,
    )
    insertEvent({
      campaignId,
      subjectType: "prospecting_plan",
      subjectId: planId,
      level: "info",
      eventType: "strategy.plan_created",
      message: "Estrategia del agente generada.",
      payload: { queryId, estimatedCostCents: estimatedCost, maxCostCents: maxCost },
    })
  })()

  writeStrategyMarkdown(markdownPath, markdown)
  return getProspectingPlan(planId)
}

export function reviseProspectingStrategyPlan(planId: string, feedback: string, result: ProspectingStrategyResult, createdBy = "OpenClaw") {
  const current = db
    .query<ProspectingPlanRow & { campaign_id: string; query_original: string }, [string]>(`
      SELECT pp.*, pq.campaign_id, pq.query_original
      FROM prospecting_plans pp
      JOIN prospecting_queries pq ON pq.id = pp.query_id
      WHERE pp.id = ?
    `)
    .get(planId)
  if (!current) return null

  const feedbackHistory = parseJson(current.feedback_json, [] as Array<Record<string, unknown>>)
  feedbackHistory.push({ text: feedback.trim(), createdBy, createdAt: new Date().toISOString() })
  const markdown = normalizeStrategyMarkdown(result, current.query_original)
  const maxCost = nonNegativeInteger(result.budget_guard?.run_budget_cents, current.max_cost_cents)
  const estimatedCost = nonNegativeInteger(result.budget_guard?.estimated_total_cents, current.estimated_cost_cents)
  const markdownPath = current.markdown_path || strategyMarkdownPath(current.campaign_id, current.id)

  db.transaction(() => {
    db.prepare(`
      UPDATE prospecting_plans
      SET plan_json = ?, recommended_first_plan_id = ?, estimated_cost_cents = ?, max_cost_cents = ?,
        strategy_markdown = ?, markdown_path = ?, revision = revision + 1, feedback_json = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      JSON.stringify(result),
      result.recommended_first_plan_id || current.recommended_first_plan_id,
      estimatedCost,
      maxCost,
      markdown,
      markdownPath,
      JSON.stringify(feedbackHistory),
      current.id,
    )
    insertEvent({
      campaignId: current.campaign_id,
      subjectType: "prospecting_plan",
      subjectId: current.id,
      level: "info",
      eventType: "strategy.plan_revised",
      message: "Estrategia del agente revisada con feedback.",
      payload: { feedback: feedback.trim(), estimatedCostCents: estimatedCost, maxCostCents: maxCost },
    })
  })()

  writeStrategyMarkdown(markdownPath, markdown)
  return getProspectingPlan(current.id)
}

export function executeProspectingPlan(
  planId: string,
  options: { replaceQueuedRun?: boolean; mode?: "manual" | "autopilot"; stepId?: string } = {},
): any {
  const current = db
    .query<ProspectingPlanRow & { campaign_id: string }, [string]>(`
      SELECT pp.*, pq.campaign_id
      FROM prospecting_plans pp
      JOIN prospecting_queries pq ON pq.id = pp.query_id
      WHERE pp.id = ?
    `)
    .get(planId)
  if (!current) return null

  const materialized = ensureProspectingSteps(current)
  if ("error" in materialized) return { error: materialized.error, plan: getProspectingPlan(current.id) }

  const step = options.stepId ? getProspectingStep(options.stepId) : nextExecutableProspectingStep(current.id)
  if (!step) return completeProspectingPlanIfDone(current)
  if (step.plan_id !== current.id) return { error: "step_not_in_plan", plan: getProspectingPlan(current.id) }
  if (!["queued", "waiting_review", "blocked"].includes(step.status)) {
    return { error: "step_not_executable", step: formatProspectingStep(step), plan: getProspectingPlan(current.id) }
  }

  const active = activeCampaignRun(current.campaign_id)
  if (active && (!options.replaceQueuedRun || active.status !== "queued")) {
    return { error: "active_run_exists", run: formatRun(active), plan: getProspectingPlan(current.id) }
  }

  const stepInput = parseJson<Record<string, unknown>>(step.input_json, {})
  const gate = prospectingStepGate(current.campaign_id, stepInput)
  if (gate) {
    markProspectingStepWaiting(step.id, gate.reason)
    insertEvent({
      campaignId: current.campaign_id,
      subjectType: "prospecting_step",
      subjectId: step.id,
      level: "warning",
      eventType: "strategy.step_waiting_review",
      message: gate.message,
      payload: { planId: current.id, phase: stepInput.phase, requiresReviewState: stepInput.requires_review_state },
    })
    return { gate: gate.reason, step: formatProspectingStep(getProspectingStep(step.id) || step), plan: getProspectingPlan(current.id) }
  }

  const spent = prospectingPlanSpentCents(current.id)
  const nextCost = nonNegativeInteger(step.estimated_cost_cents, 0)
  if (paidSourcesRequireBudget() && current.max_cost_cents <= 0 && prospectingStepUsesPaidSource(stepInput)) {
    stopProspectingPlanForBudget(current, step, spent, nextCost)
    return { error: "paid_source_requires_budget", step: formatProspectingStep(getProspectingStep(step.id) || step), plan: getProspectingPlan(current.id) }
  }
  if (current.max_cost_cents > 0 && spent + nextCost > current.max_cost_cents) {
    stopProspectingPlanForBudget(current, step, spent, nextCost)
    return { error: "budget_limit_exceeded", step: formatProspectingStep(getProspectingStep(step.id) || step), plan: getProspectingPlan(current.id) }
  }

  const virtual: any = executeVirtualProspectingStep(current, step, options.mode || "manual")
  if (virtual) return virtual

  const queued = queueProspectingStep(current, step, {
    mode: options.mode || "manual",
    replaceQueuedRun: options.replaceQueuedRun === true,
    spentCents: spent,
  })
  return queued
}

export function latestProspectingPlanForCampaign(campaignId: string) {
  const row = db
    .query<ProspectingPlanRow, [string]>(`
      SELECT pp.*
      FROM prospecting_plans pp
      JOIN prospecting_queries pq ON pq.id = pp.query_id
      WHERE pq.campaign_id = ?
      ORDER BY pp.updated_at DESC, pp.created_at DESC
      LIMIT 1
    `)
    .get(campaignId)
  return row ? formatProspectingPlan(row) : null
}

export function getProspectingPlan(planId: string) {
  const row = db.query<ProspectingPlanRow, [string]>("SELECT * FROM prospecting_plans WHERE id = ?").get(planId)
  return row ? formatProspectingPlan(row) : null
}

function ensureProspectingSteps(plan: ProspectingPlanRow & { campaign_id: string }) {
  const existing = db.query<{ count: number }, [string]>("SELECT COUNT(*) AS count FROM prospecting_steps WHERE plan_id = ?").get(plan.id)
  if ((existing?.count ?? 0) > 0) return { ok: true }

  const planJson = parseJson<ProspectingStrategyResult>(plan.plan_json, {})
  const selectedPlan = selectRecommendedPlan(planJson)
  const rawSteps = Array.isArray(selectedPlan?.steps) ? selectedPlan.steps : []
  const steps = rawSteps.length > 0 ? rawSteps : fallbackProspectingSteps(planJson, selectedPlan)
  if (steps.length === 0) return { error: "plan_has_no_steps" }

  db.transaction(() => {
    steps.forEach((rawStep, index) => {
      const step = normalizeProspectingStepInput(rawStep, index + 1, cleanText(selectedPlan?.id, plan.recommended_first_plan_id || "plan_a"))
      db.prepare(`
        INSERT INTO prospecting_steps (
          id, plan_id, step_order, skill, source_key, status, input_json, estimated_cost_cents
        ) VALUES (?, ?, ?, ?, ?, 'queued', ?, ?)
      `).run(
        uniqueId("prospecting_step", `${plan.id}_${step.order}_${step.capability}_${step.phase}`),
        plan.id,
        step.order,
        prospectingStepSkill(step),
        cleanText(step.source_key, ""),
        JSON.stringify(step),
        nonNegativeInteger(step.estimated_cost_cents, 0),
      )
    })
    insertEvent({
      campaignId: plan.campaign_id,
      subjectType: "prospecting_plan",
      subjectId: plan.id,
      level: "info",
      eventType: "strategy.steps_materialized",
      message: "Plan convertido a steps ejecutables.",
      payload: { planId: plan.id, steps: steps.length },
    })
  })()

  return { ok: true }
}

function selectRecommendedPlan(plan: ProspectingStrategyResult) {
  const plans = Array.isArray(plan.plans) ? plan.plans : []
  const recommended = cleanText(plan.recommended_first_plan_id, "")
  return plans.find((item) => cleanText(item.id, "") === recommended) || plans[0] || null
}

function fallbackProspectingSteps(plan: ProspectingStrategyResult, selectedPlan: Record<string, unknown> | null = null) {
  const query = cleanText(plan.query_original, "Prospecting")
  const estimatedCost = nonNegativeInteger(selectedPlan?.estimated_cost_cents, plan.budget_guard?.estimated_total_cents || 0)
  return [
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
      reason: "Fallback company discovery step.",
      input_focus: query,
      expected_output: "companies",
      estimated_cost_cents: estimatedCost,
    },
  ]
}

function normalizeProspectingStepInput(rawStep: unknown, order: number, selectedPlanId: string) {
  const record = rawStep && typeof rawStep === "object" && !Array.isArray(rawStep) ? (rawStep as Record<string, unknown>) : {}
  const capability = cleanText(record.capability, "company-discovery")
  const phase = cleanText(record.phase, capability === "person-discovery" ? "people_mapping" : "company_training")
  return {
    ...record,
    selected_plan_id: selectedPlanId,
    order: positiveInteger(record.order, order),
    phase,
    capability,
    playbook: cleanText(record.playbook, "corporate-b2b"),
    mode: cleanText(record.mode, capability === "person-discovery" ? "people_mapping_from_approved_companies" : "company_sourcing"),
    legacy_skill: cleanText(record.legacy_skill, ""),
    source_key: cleanText(record.source_key, ""),
    source_plan: Array.isArray(record.source_plan) ? record.source_plan : [],
    requires_review_state: cleanText(record.requires_review_state, "none"),
    reason: cleanText(record.reason, ""),
    input_focus: cleanText(record.input_focus, ""),
    expected_output: cleanText(record.expected_output, ""),
    estimated_cost_cents: nonNegativeInteger(record.estimated_cost_cents, sourcePlanDefaultCostCents(record.source_plan)),
  }
}

function prospectingStepSkill(step: Record<string, unknown>) {
  const legacy = cleanText(step.legacy_skill, "")
  if (legacy && legacy !== "find_companies") return legacy
  const capability = cleanText(step.capability, "")
  if (capability === "person-discovery") return "find_people"
  if (capability === "dedup-and-enrich" || capability === "internal-crm-review") return ""
  return "company_discovery"
}

function getProspectingStep(stepId: string) {
  return db.query<ProspectingStepRow, [string]>("SELECT * FROM prospecting_steps WHERE id = ?").get(stepId)
}

function nextExecutableProspectingStep(planId: string) {
  return db
    .query<ProspectingStepRow, [string]>(`
      SELECT *
      FROM prospecting_steps
      WHERE plan_id = ? AND status IN ('queued', 'waiting_review', 'blocked')
      ORDER BY step_order ASC, created_at ASC
      LIMIT 1
    `)
    .get(planId)
}

function activeCampaignRun(campaignId: string) {
  return db
    .query<RunRow, [string]>(`
      SELECT id, campaign_id, mission, status, objective, limits_json, error, created_at, started_at, finished_at
      FROM agent_runs
      WHERE campaign_id = ? AND status IN ('queued', 'running')
      ORDER BY created_at DESC
      LIMIT 1
    `)
    .get(campaignId)
}

function prospectingStepGate(campaignId: string, step: Record<string, unknown>) {
  const capability = cleanText(step.capability, "")
  const phase = cleanText(step.phase, "")
  const requires = cleanText(step.requires_review_state, "none")
  const approvedCompanies = approvedCompanyCount(campaignId)
  if (capability === "internal-crm-review" || phase === "review") {
    if (approvedCompanies === 0) {
      return {
        reason: "human_review_required",
        message: "El plan está esperando revisión humana de empresas en el CRM interno.",
      }
    }
    return null
  }
  if (requires === "approved_companies" && approvedCompanies === 0) {
    return {
      reason: "approved_companies_required",
      message: "No se puede buscar personas hasta que existan empresas aprobadas.",
    }
  }
  return null
}

function approvedCompanyCount(campaignId: string) {
  return db
    .query<{ count: number }, [string]>("SELECT COUNT(*) AS count FROM company_candidates WHERE campaign_id = ? AND status = 'approved'")
    .get(campaignId)?.count ?? 0
}

function markProspectingStepWaiting(stepId: string, reason: string) {
  db.prepare(`
    UPDATE prospecting_steps
    SET status = 'waiting_review', stop_reason = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(reason, stepId)
}

function prospectingPlanSpentCents(planId: string) {
  const row = db
    .query<{ total: number | null }, [string]>(`
      SELECT SUM(CASE WHEN event_type = 'refund' THEN -amount_cents ELSE amount_cents END) AS total
      FROM prospecting_cost_ledger
      WHERE plan_id = ? AND event_type IN ('reserve', 'actual', 'refund')
    `)
    .get(planId)
  return Math.max(0, row?.total ?? 0)
}

function paidSourcesRequireBudget() {
  return Bun.env.BACKOFFICE_PAID_SOURCES_REQUIRE_BUDGET !== "0"
}

function prospectingStepUsesPaidSource(step: Record<string, unknown>) {
  const sourcePlan = Array.isArray(step.source_plan) ? step.source_plan.map((item) => cleanText(item, "").toLowerCase()) : []
  return sourcePlan.some((source) => ["apollo", "explorium", "pdl", "people_data_labs"].includes(source))
}

function sourcePlanDefaultCostCents(sourcePlan: unknown) {
  if (!Array.isArray(sourcePlan)) return 0
  const sources = sourcePlan.map((item) => cleanText(item, "").toLowerCase())
  let total = 0
  if (sources.includes("apollo")) {
    total += nonNegativeInteger(Bun.env.BACKOFFICE_APOLLO_ORG_SEARCH_COST_CENTS, 1)
  }
  if (sources.includes("apollo_people")) {
    total += nonNegativeInteger(Bun.env.BACKOFFICE_APOLLO_PEOPLE_SEARCH_COST_CENTS, 0)
  }
  if (sources.includes("pdl") || sources.includes("people_data_labs")) {
    total += nonNegativeInteger(Bun.env.BACKOFFICE_PDL_PERSON_ENRICH_COST_CENTS, 28)
  }
  if (sources.includes("explorium")) {
    total += nonNegativeInteger(Bun.env.BACKOFFICE_EXPLORIUM_SEARCH_COST_CENTS, 1)
  }
  return total
}

function stopProspectingPlanForBudget(
  plan: ProspectingPlanRow & { campaign_id: string },
  step: ProspectingStepRow,
  spentCents: number,
  nextCostCents: number,
) {
  db.transaction(() => {
    db.prepare(`
      UPDATE prospecting_steps
      SET status = 'stopped_for_budget', stop_reason = 'budget_limit_exceeded', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(step.id)
    db.prepare(`
      INSERT INTO prospecting_cost_ledger (
        id, query_id, plan_id, step_id, source_key, event_type, amount_cents, budget_limit_cents, cumulative_run_cents, metadata_json
      ) VALUES (?, ?, ?, ?, ?, 'budget_stop', ?, ?, ?, ?)
    `).run(
      uniqueId("cost", `${plan.id}_${step.id}_budget_stop`),
      plan.query_id,
      plan.id,
      step.id,
      step.source_key,
      nextCostCents,
      plan.max_cost_cents,
      spentCents,
      JSON.stringify({ reason: "step_would_exceed_budget" }),
    )
    db.prepare("UPDATE prospecting_plans SET status = 'stopped_for_budget', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(plan.id)
    db.prepare("UPDATE prospecting_queries SET status = 'stopped_for_budget', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(plan.query_id)
    insertEvent({
      campaignId: plan.campaign_id,
      subjectType: "prospecting_step",
      subjectId: step.id,
      level: "warning",
      eventType: "strategy.budget_stop",
      message: "Step detenido porque excedería el hard stop de gasto.",
      payload: { spentCents, nextCostCents, maxCostCents: plan.max_cost_cents },
    })
  })()
}

function executeVirtualProspectingStep(
  plan: ProspectingPlanRow & { campaign_id: string },
  step: ProspectingStepRow,
  mode: "manual" | "autopilot",
): any {
  const input = parseJson<Record<string, unknown>>(step.input_json, {})
  const capability = cleanText(input.capability, "")
  if (step.skill || (capability !== "internal-crm-review" && capability !== "dedup-and-enrich")) return null

  const summary = capability === "dedup-and-enrich"
    ? { virtual: true, note: "Dedupe basico aplicado al persistir candidatos; enrichment pagado pendiente de source adapters." }
    : { virtual: true, note: "Gate de revisión satisfecho en Benford Backoffice." }
  db.transaction(() => {
    db.prepare(`
      UPDATE prospecting_steps
      SET status = 'succeeded', output_summary_json = ?, finished_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(JSON.stringify(summary), step.id)
    insertEvent({
      campaignId: plan.campaign_id,
      subjectType: "prospecting_step",
      subjectId: step.id,
      level: "success",
      eventType: "strategy.virtual_step_completed",
      message: capability === "dedup-and-enrich" ? "Dedupe/enrichment virtual completado." : "Gate de revisión completado.",
      payload: { planId: plan.id, capability },
    })
  })()

  if (mode === "autopilot") return executeProspectingPlan(plan.id, { mode: "autopilot" })
  return { step: formatProspectingStep(getProspectingStep(step.id) || step), plan: getProspectingPlan(plan.id) }
}

function queueProspectingStep(
  plan: ProspectingPlanRow & { campaign_id: string },
  step: ProspectingStepRow,
  options: { mode: "manual" | "autopilot"; replaceQueuedRun: boolean; spentCents: number },
) {
  const campaign = getCampaignDetail(plan.campaign_id)
  if (!campaign) return null
  const active = activeCampaignRun(plan.campaign_id)
  const stepInput = parseJson<Record<string, unknown>>(step.input_json, {})
  const runId = uniqueId("run", `${plan.campaign_id}_${stepInput.phase || step.skill || "prospecting_step"}`)
  const jobSkill = step.skill || prospectingStepSkill(stepInput)
  const jobId = uniqueId("job", `${runId}_${jobSkill}`)
  const runMaxRuntimeSeconds = effectiveRunTimeoutSeconds(jobSkill, campaign.brief.maxRuntimeSeconds)
  const limits = {
    budget_cents: plan.max_cost_cents || campaign.brief.runBudgetCents,
    spent_cents: options.spentCents,
    step_estimated_cost_cents: step.estimated_cost_cents,
    max_companies: campaign.brief.maxCompanies,
    max_people: campaign.brief.maxPeople,
    max_runtime_seconds: runMaxRuntimeSeconds,
    min_score_threshold: campaign.brief.minScoreThreshold,
    execution_mode: options.mode,
  }
  const jobInput = buildProspectingStepJobInput(campaign, plan, step, stepInput, options.mode, runMaxRuntimeSeconds)

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
      VALUES (?, ?, ?, 'queued', ?, ?, ?)
    `).run(
      runId,
      plan.campaign_id,
      cleanText(stepInput.phase, jobSkill),
      campaign.brief.objective || campaign.criteria || "",
      JSON.stringify({ planId: plan.id, stepId: step.id, capability: stepInput.capability, playbook: stepInput.playbook }),
      JSON.stringify(limits),
    )
    db.prepare(`
      INSERT INTO openclaw_jobs (id, run_id, campaign_id, skill, status, input_json, timeout_seconds)
      VALUES (?, ?, ?, ?, 'queued', ?, ?)
    `).run(jobId, runId, plan.campaign_id, jobSkill, JSON.stringify(jobInput), runMaxRuntimeSeconds)
    db.prepare(`
      UPDATE prospecting_steps
      SET run_id = ?, job_id = ?, status = 'running', started_at = COALESCE(started_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(runId, jobId, step.id)
    if (step.estimated_cost_cents > 0) {
      db.prepare(`
        INSERT INTO prospecting_cost_ledger (
          id, run_id, job_id, query_id, plan_id, step_id, source_key, event_type, amount_cents, budget_limit_cents, cumulative_run_cents, metadata_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'reserve', ?, ?, ?, ?)
      `).run(
        uniqueId("cost", `${plan.id}_${step.id}_reserve`),
        runId,
        jobId,
        plan.query_id,
        plan.id,
        step.id,
        step.source_key,
        step.estimated_cost_cents,
        plan.max_cost_cents,
        options.spentCents + step.estimated_cost_cents,
        JSON.stringify({ executionMode: options.mode }),
      )
    }
    db.prepare("UPDATE prospecting_plans SET status = 'running', run_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(runId, plan.id)
    db.prepare("UPDATE prospecting_queries SET status = 'running', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(plan.query_id)
    insertEvent({
      campaignId: plan.campaign_id,
      runId,
      jobId,
      subjectType: "prospecting_step",
      subjectId: step.id,
      level: "info",
      eventType: "strategy.step_queued",
      message: options.mode === "autopilot" ? "Step encolado en autopilot." : "Step encolado para ejecución manual.",
      payload: { planId: plan.id, jobSkill, mode: options.mode, sourceKey: step.source_key },
    })
    db.prepare("UPDATE campaigns SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(plan.campaign_id)
  })()

  return { run: getRun(runId), step: formatProspectingStep(getProspectingStep(step.id) || step), plan: getProspectingPlan(plan.id) }
}

function buildProspectingStepJobInput(
  campaign: NonNullable<ReturnType<typeof getCampaignDetail>>,
  plan: ProspectingPlanRow,
  step: ProspectingStepRow,
  stepInput: Record<string, unknown>,
  mode: "manual" | "autopilot",
  timeoutSeconds: number,
) {
  const brief = campaign.brief
  const approvedCompanies = approvedCompaniesForCampaign(campaign.id)
  return {
    mission: step.skill,
    executionMode: mode,
    plan: {
      id: plan.id,
      stepId: step.id,
      stepOrder: step.step_order,
      sourceKey: step.source_key,
      estimatedCostCents: step.estimated_cost_cents,
      step: stepInput,
    },
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
      positiveSignals: brief.positiveSignals,
      negativeSignals: brief.negativeSignals,
      searchMode: brief.searchMode,
      maxCompanies: step.skill === "find_people" ? brief.maxCompanies : Math.max(1, Math.min(COMPANY_DISCOVERY_INTERACTIVE_PREFETCH_CAP, brief.maxCompanies || 10)),
      maxPeople: brief.maxPeople,
      maxRuntimeSeconds: timeoutSeconds,
      runBudgetCents: brief.runBudgetCents,
      minScoreThreshold: brief.minScoreThreshold,
      reviewBatchSize: 10,
      discoveryMode: step.skill === "company_discovery" ? "fast_prefetch" : cleanText(stepInput.mode, "standard"),
    },
    approvedCompanies,
    memory: campaignMemory(campaign.id),
    outputContract: "Return only JSON matching the requested schema.",
  }
}

function approvedCompaniesForCampaign(campaignId: string) {
  return db
    .query<
      { candidate_id: string; company_id: string; name: string; domain: string; linkedin_url: string; industry: string; country: string; city: string; score: number; rationale: string },
      [string]
    >(`
      SELECT
        cc.id AS candidate_id,
        c.id AS company_id,
        c.name,
        c.domain,
        c.linkedin_url,
        c.industry,
        c.country,
        c.city,
        cc.score,
        cc.rationale
      FROM company_candidates cc
      JOIN companies c ON c.id = cc.company_id
      WHERE cc.campaign_id = ? AND cc.status = 'approved'
      ORDER BY cc.score DESC, c.name ASC
      LIMIT 250
    `)
    .all(campaignId)
}

function completeProspectingPlanIfDone(plan: ProspectingPlanRow & { campaign_id: string }) {
  const pending = db
    .query<{ count: number }, [string]>(`
      SELECT COUNT(*) AS count
      FROM prospecting_steps
      WHERE plan_id = ? AND status IN ('queued', 'waiting_review', 'blocked', 'running')
    `)
    .get(plan.id)?.count ?? 0
  if (pending === 0) {
    db.transaction(() => {
      db.prepare("UPDATE prospecting_plans SET status = 'succeeded', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(plan.id)
      db.prepare("UPDATE prospecting_queries SET status = 'succeeded', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(plan.query_id)
      insertEvent({
        campaignId: plan.campaign_id,
        subjectType: "prospecting_plan",
        subjectId: plan.id,
        level: "success",
        eventType: "strategy.execution_completed",
        message: "Todos los steps ejecutables del plan terminaron.",
        payload: { planId: plan.id },
      })
    })()
  }
  return { done: pending === 0, plan: getProspectingPlan(plan.id) }
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
  const memory = campaignMemory(campaign.id)
  const briefCompanyLimit = Math.max(10, positiveInteger(brief.maxCompanies, 10))
  const requestedCompanies = mission === "people"
    ? brief.maxCompanies
    : positiveInteger(options.prefetchCompanies, briefCompanyLimit)
  const seenCompanyCount = Array.isArray(memory.alreadySeenCompanies) ? memory.alreadySeenCompanies.length : 0
  const runMaxCompanies = mission === "people"
    ? brief.maxCompanies
    : seenCompanyCount > 0
      ? Math.min(COMPANY_DISCOVERY_INTERACTIVE_PREFETCH_CAP, Math.max(1, reviewBatchSize))
    : Math.min(COMPANY_DISCOVERY_INTERACTIVE_PREFETCH_CAP, Math.max(10, requestedCompanies))
  const runMaxRuntimeSeconds = effectiveRunTimeoutSeconds(mission, brief.maxRuntimeSeconds)
  const runId = uniqueId("run", `${campaignId}_${mission}`)
  const jobSkill = mission === "people" ? "find_people" : "company_discovery"
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
      positiveSignals: brief.positiveSignals,
      negativeSignals: brief.negativeSignals,
      searchMode: brief.searchMode,
      maxCompanies: runMaxCompanies,
      maxPeople: brief.maxPeople,
      maxRuntimeSeconds: runMaxRuntimeSeconds,
      runBudgetCents: brief.runBudgetCents,
      minScoreThreshold: brief.minScoreThreshold,
      reviewBatchSize,
      discoveryMode: jobSkill === "company_discovery" ? "fast_prefetch" : "standard",
    },
    memory,
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

    const enrichJobs = enqueueCampaignResearchJobs(campaignId, runId, memory)

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
      payload: { mission, jobSkill, enrichJobs },
    })

    db.prepare("UPDATE campaigns SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(campaignId)
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

export function createPeopleRunForCompanyCandidate(
  companyCandidateId: string,
  options: { replaceQueuedRun?: boolean; enrich?: boolean; feedback?: string; maxPeople?: number } = {},
) {
  const target = db
    .query<
      {
        id: string
        campaign_id: string
        run_id: string | null
        company_id: string
        status: string
        score: number
        rationale: string
        evidence_json: string
        user_feedback: string
        name: string
        domain: string
        linkedin_url: string
        industry: string
        country: string
        city: string
        campaign_name: string
      },
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
        c.name,
        c.domain,
        c.linkedin_url,
        c.industry,
        c.country,
        c.city,
        ca.name AS campaign_name
      FROM company_candidates cc
      JOIN companies c ON c.id = cc.company_id
      JOIN campaigns ca ON ca.id = cc.campaign_id
      WHERE cc.id = ?
      LIMIT 1
    `)
    .get(companyCandidateId)
  if (!target) return null

  const activeRows = db
    .query<RunRow, [string, string]>(`
      SELECT ar.id, ar.campaign_id, ar.mission, ar.status, ar.objective, ar.limits_json, ar.error, ar.created_at, ar.started_at, ar.finished_at
      FROM agent_runs ar
      JOIN openclaw_jobs oj ON oj.run_id = ar.id
      WHERE ar.campaign_id = ?
        AND ar.status IN ('queued', 'running')
        AND oj.skill = 'find_people'
        AND oj.input_json LIKE ?
      ORDER BY ar.created_at DESC
      LIMIT 1
    `)
    .all(target.campaign_id, `%${target.id}%`)
  const active = activeRows[0]
  if (active && (!options.replaceQueuedRun || active.status !== "queued")) {
    return { error: "active_run_exists", run: formatRun(active) }
  }

  const campaign = getCampaignDetail(target.campaign_id)
  if (!campaign) return null
  const maxPeople = Math.min(Math.max(positiveInteger(options.maxPeople, campaign.brief.maxPeople || 5), 1), 25)
  const timeoutSeconds = effectiveRunTimeoutSeconds("find_people", Math.min(campaign.brief.maxRuntimeSeconds || 300, 600))
  const runId = uniqueId("run", `${target.campaign_id}_people_${target.company_id}`)
  const jobId = uniqueId("job", `${runId}_find_people`)
  const feedback = typeof options.feedback === "string" ? options.feedback.trim() : ""
  const targetCompany = {
    candidate_id: target.id,
    company_id: target.company_id,
    name: target.name,
    domain: target.domain,
    linkedin_url: target.linkedin_url,
    industry: target.industry,
    country: target.country,
    city: target.city,
    score: target.score,
    rationale: target.rationale,
  }
  const step = {
    phase: "people_mapping",
    capability: "person-discovery",
    playbook: "corporate-b2b",
    mode: options.enrich ? "people_mapping_enrich_from_approved_company" : "people_mapping_from_approved_companies",
    legacy_skill: "find_people",
    source_key: options.enrich ? "web_search_enrich" : "web_search",
    source_plan: options.enrich ? ["company_site", "web_search", "pdl"] : ["company_site", "web_search"],
    requires_review_state: "approved_companies",
    input_focus: `Personas relevantes en ${target.name}`,
    expected_output: "people",
    estimated_cost_cents: options.enrich ? sourcePlanDefaultCostCents(["pdl"]) : 0,
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
    executionMode: "manual",
    plan: {
      step,
      sourceKey: step.source_key,
      estimatedCostCents: step.estimated_cost_cents,
    },
    campaign: {
      id: target.campaign_id,
      name: target.campaign_name,
    },
    brief: {
      ...campaign.brief,
      maxPeople,
      maxRuntimeSeconds: timeoutSeconds,
    },
    approvedCompanies: [targetCompany],
    targetCompany,
    reviewFeedback: feedback || target.user_feedback || "",
    memory: campaignMemory(target.campaign_id),
    outputContract: "Return only JSON matching person-discovery/references/output-contract.json.",
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
      eventType: options.enrich ? "people.enrich_queued" : "people.search_queued",
      message: options.enrich ? `Enrichment de personas encolado para ${target.name}.` : `Búsqueda de personas encolada para ${target.name}.`,
      payload: { companyId: target.company_id, maxPeople, feedback },
    })
  })()

  return { run: getRun(runId) }
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

  let autopilotPlanId = ""
  db.transaction(() => {
    if (isCompanyDiscoverySkill(job.skill)) persistFoundCompanies(job, parsed.output)
    if (job.skill === "find_people") persistFoundPeople(job, parsed.output)
    if (job.skill === "research_company") persistResearchedCompany(job, parsed.output)

    db.prepare(`
      UPDATE openclaw_jobs
      SET status = 'succeeded', output_json = ?, error = '', finished_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(JSON.stringify(parsed.output), job.id)
    const pendingJobs = db
      .query<{ count: number }, [string, string]>(
        "SELECT COUNT(*) AS count FROM openclaw_jobs WHERE run_id = ? AND id <> ? AND status IN ('queued', 'running')",
      )
      .get(job.run_id, job.id)?.count ?? 0
    const nextRunStatus = pendingJobs > 0 ? "running" : isCompanyDiscoverySkill(job.skill) ? "needs_review" : "needs_review"
    db.prepare(`
      UPDATE agent_runs
      SET status = ?, raw_output_json = ?, error = '', finished_at = CASE WHEN ? = 0 THEN CURRENT_TIMESTAMP ELSE finished_at END, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(nextRunStatus, JSON.stringify(parsed.output), pendingJobs, job.run_id)
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

    const linkedStep = db
      .query<ProspectingStepRow, [string]>("SELECT * FROM prospecting_steps WHERE job_id = ? LIMIT 1")
      .get(job.id)
    if (linkedStep) {
      const summary = outputSummary(job.skill, parsed.output)
      db.prepare(`
        UPDATE prospecting_steps
        SET status = 'succeeded', output_summary_json = ?, quality_score = ?, actual_cost_cents = estimated_cost_cents,
          finished_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(JSON.stringify(summary), estimatedQualityScore(summary), linkedStep.id)
      const input = parseJson<{ executionMode?: string }>(job.input_json, {})
      if (input.executionMode === "autopilot") autopilotPlanId = linkedStep.plan_id
    }
  })()

  if (autopilotPlanId) executeProspectingPlan(autopilotPlanId, { mode: "autopilot" })
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
    db.prepare(`
      UPDATE prospecting_steps
      SET status = 'failed', error = ?, finished_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE job_id = ?
    `).run(message, job.id)
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
        p.name,
        p.title,
        p.linkedin_url,
        p.email,
        COALESCE(c.name, p.company_name, '') AS company_name,
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
    industry: row.industry,
    country: row.country,
    email: row.email,
    linkedinUrl: row.linkedin_url,
    phone: "",
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
    angleHint: row.function || row.seniority || "",
    sourceProvider: "OpenClaw",
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
        p.country
      FROM person_candidates pc
      JOIN people p ON p.id = pc.person_id
      LEFT JOIN companies c ON c.id = COALESCE(pc.company_id, p.company_id)
      ORDER BY pc.score DESC, p.name ASC
    `)
    .all()

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    title: row.title,
    company: row.company_name || "Sin empresa",
    industry: row.industry,
    score: row.score,
    scoreBand: scoreBand(row.score),
    status: candidateStatus(row.status),
    channels: { email: "", linkedin: "on", call: "" },
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

function formatProspectingPlan(row: ProspectingPlanRow) {
  const plan = parseJson<ProspectingStrategyResult>(row.plan_json, {})
  const steps = db
    .query<ProspectingStepRow, [string]>("SELECT * FROM prospecting_steps WHERE plan_id = ? ORDER BY step_order ASC, created_at ASC")
    .all(row.id)
  return {
    id: row.id,
    queryId: row.query_id,
    runId: row.run_id,
    status: row.status,
    revision: row.revision,
    strategyMarkdown: row.strategy_markdown,
    markdownPath: row.markdown_path,
    plan,
    recommendedFirstPlanId: row.recommended_first_plan_id,
    estimatedCostCents: row.estimated_cost_cents,
    maxCostCents: row.max_cost_cents,
    spentCostCents: prospectingPlanSpentCents(row.id),
    steps: steps.map(formatProspectingStep),
    feedback: parseJson(row.feedback_json, []),
    warnings: plan.operator_warnings || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function formatProspectingStep(row: ProspectingStepRow) {
  const input = parseJson<Record<string, unknown>>(row.input_json, {})
  return {
    id: row.id,
    planId: row.plan_id,
    runId: row.run_id,
    jobId: row.job_id,
    order: row.step_order,
    skill: row.skill,
    sourceKey: row.source_key,
    status: row.status,
    phase: cleanText(input.phase, ""),
    capability: cleanText(input.capability, ""),
    playbook: cleanText(input.playbook, ""),
    mode: cleanText(input.mode, ""),
    requiresReviewState: cleanText(input.requires_review_state, "none"),
    reason: cleanText(input.reason, ""),
    inputFocus: cleanText(input.input_focus, ""),
    expectedOutput: cleanText(input.expected_output, ""),
    sourcePlan: Array.isArray(input.source_plan) ? input.source_plan : [],
    estimatedCostCents: row.estimated_cost_cents,
    actualCostCents: row.actual_cost_cents,
    qualityScore: row.quality_score,
    stopReason: row.stop_reason,
    error: row.error,
    outputSummary: parseJson(row.output_summary_json, {}),
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function normalizeStrategyMarkdown(result: ProspectingStrategyResult, query: string) {
  const markdown = result.strategy_markdown?.trim()
  if (markdown) return markdown
  const icp = result.icp_characterized || {}
  return [
    "# Estrategia del agente",
    "",
    "## Query",
    "",
    query || result.query_original || "-",
    "",
    "## ICP interpretado",
    "",
    `- Tipo: ${String(icp.entity_type || "unknown")}`,
    `- Target: ${String(icp.buyer_or_target || "-")}`,
    `- Geografia: ${String(icp.geography || "-")}`,
    "",
    "## Presupuesto",
    "",
    `- Limite: ${nonNegativeInteger(result.budget_guard?.run_budget_cents, 0)} centavos`,
    `- Estimado: ${nonNegativeInteger(result.budget_guard?.estimated_total_cents, 0)} centavos`,
  ].join("\n")
}

function strategyMarkdownPath(campaignId: string, planId: string) {
  return path.join(appRoot, ".data", "prospecting-strategies", campaignId, `${planId}.md`)
}

function writeStrategyMarkdown(filePath: string, markdown: string) {
  mkdirSync(path.dirname(filePath), { recursive: true })
  writeFileSync(filePath, `${markdown.trim()}\n`, "utf8")
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

function listRunJobSummaries(runId: string) {
  return db
    .query<
      Pick<
        OpenClawJobRow,
        "id" | "skill" | "status" | "error" | "attempt" | "max_attempts" | "timeout_seconds" | "started_at" | "finished_at" | "created_at"
      >,
      [string]
    >(`
      SELECT id, skill, status, error, attempt, max_attempts, timeout_seconds, started_at, finished_at, created_at
      FROM openclaw_jobs
      WHERE run_id = ?
      ORDER BY created_at ASC
    `)
    .all(runId)
    .map((row) => ({
      id: row.id,
      skill: row.skill,
      status: row.status,
      error: row.error,
      attempt: row.attempt,
      maxAttempts: row.max_attempts,
      timeoutSeconds: row.timeout_seconds,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      created: formatDateLabel(row.created_at),
    }))
}

function formatRun(row: RunRow) {
  const companyCandidates =
    db.query<{ count: number }, [string]>("SELECT COUNT(*) AS count FROM company_candidates WHERE run_id = ?").get(row.id)
      ?.count ?? 0
  const jobs = listRunJobSummaries(row.id)

  return {
    id: row.id,
    mission: row.mission,
    status: row.status,
    objective: row.objective,
    companyCandidates,
    limits: parseJson(row.limits_json, {}),
    jobs,
    skills: jobs.map((job) => job.skill),
    error: row.error,
    created: formatDateLabel(row.created_at),
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
        name: string
        domain?: string
        linkedin_url?: string
        email?: string
        country?: string
        city?: string
        industry?: string
        employee_range?: string
        description?: string
        score?: number
        rationale?: string
        evidence_json?: string
      },
      [string]
    >(
      subjectType === "company_candidate"
        ? `
          SELECT
            cc.id,
            cc.campaign_id,
            cc.run_id,
            cc.company_id,
            c.name,
            c.domain,
            c.linkedin_url,
            c.country,
            c.city,
            c.industry,
            c.employee_range,
            c.description,
            cc.score,
            cc.rationale,
            cc.evidence_json
          FROM company_candidates cc
          JOIN companies c ON c.id = cc.company_id
          WHERE cc.id = ?
        `
        : `
          SELECT pc.id, pc.campaign_id, pc.run_id, pc.company_id, pc.person_id, p.name, p.linkedin_url, p.email
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
    if (status === "needs_more_research") enqueueResearchJob(subjectType, row, row.run_id, feedback)

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
  row: {
    id?: string
    campaign_id: string
    run_id: string | null
    company_id: string | null
    person_id?: string
    name?: string
    domain?: string
    linkedin_url?: string
    country?: string
    city?: string
    industry?: string
    employee_range?: string
    description?: string
    score?: number
    rationale?: string
    evidence_json?: string
    user_feedback?: string
  },
  runId = row.run_id,
  reviewFeedback = row.user_feedback || "",
) {
  if (!runId) return
  const skill = subjectType === "company_candidate" ? "research_company" : "research_person"
  const subjectId = subjectType === "company_candidate" ? row.company_id : row.person_id
  const jobId = uniqueId("job", `${runId}_${skill}_${subjectId ?? "subject"}`)
  const input = buildResearchJobInput(subjectType, row, reviewFeedback)

  db.prepare(`
    INSERT INTO openclaw_jobs (id, run_id, campaign_id, skill, status, input_json)
    VALUES (?, ?, ?, ?, 'queued', ?)
  `).run(jobId, runId, row.campaign_id, skill, JSON.stringify(input))
}

function enqueueCampaignResearchJobs(campaignId: string, runId: string, memory: Record<string, unknown>) {
  const rows = db
    .query<
      {
        id: string
        campaign_id: string
        run_id: string | null
        company_id: string
        name: string
        domain: string
        linkedin_url: string
        country: string
        city: string
        industry: string
        employee_range: string
        description: string
        score: number
        rationale: string
        evidence_json: string
        user_feedback: string
      },
      [string]
    >(`
      SELECT
        cc.id,
        cc.campaign_id,
        cc.run_id,
        cc.company_id,
        c.name,
        c.domain,
        c.linkedin_url,
        c.country,
        c.city,
        c.industry,
        c.employee_range,
        c.description,
        cc.score,
        cc.rationale,
        cc.evidence_json,
        cc.user_feedback
      FROM company_candidates cc
      JOIN companies c ON c.id = cc.company_id
      WHERE cc.campaign_id = ?
        AND cc.status = 'needs_more_research'
      ORDER BY cc.updated_at DESC, cc.created_at DESC
      LIMIT 20
    `)
    .all(campaignId)

  for (const row of rows) {
    const jobId = uniqueId("job", `${runId}_research_company_${row.company_id}`)
    db.prepare(`
      INSERT INTO openclaw_jobs (id, run_id, campaign_id, skill, status, input_json)
      VALUES (?, ?, ?, 'research_company', 'queued', ?)
    `).run(jobId, runId, campaignId, JSON.stringify(buildResearchJobInput("company_candidate", row, row.user_feedback, memory)))
  }

  return rows.length
}

function buildResearchJobInput(
  subjectType: "company_candidate" | "person_candidate",
  row: {
    id?: string
    campaign_id: string
    company_id: string | null
    person_id?: string
    name?: string
    domain?: string
    linkedin_url?: string
    country?: string
    city?: string
    industry?: string
    employee_range?: string
    description?: string
    score?: number
    rationale?: string
    evidence_json?: string
  },
  reviewFeedback = "",
  memory: Record<string, unknown> | null = null,
) {
  const campaign = getCampaignDetail(row.campaign_id)
  const subjectId = subjectType === "company_candidate" ? row.company_id : row.person_id
  return {
    mission: subjectType === "company_candidate" ? "research_company" : "research_person",
    subjectType,
    subjectId,
    candidateId: row.id,
    campaign: campaign ? { id: campaign.id, name: campaign.name } : { id: row.campaign_id },
    brief: campaign?.brief || {},
    reviewFeedback,
    subject: {
      name: row.name || "",
      domain: row.domain || "",
      linkedinUrl: row.linkedin_url || "",
      country: row.country || "",
      city: row.city || "",
      industry: row.industry || "",
      employeeRange: row.employee_range || "",
      description: row.description || "",
      score: row.score ?? 0,
      rationale: row.rationale || "",
      evidence: parseJson(row.evidence_json || "[]", []),
    },
    memory: memory || campaignMemory(row.campaign_id),
    outputContract: "Return only JSON matching the requested schema.",
  }
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
    negativeRules: feedbackRules(feedback),
    feedback: feedback.map((row) => ({
      company: row.company_name || row.subject_id,
      type: row.feedback_type,
      text: row.text,
      createdAt: row.created_at,
    })),
  }
}

function feedbackRules(
  feedback: Array<{ feedback_type: string; text: string; company_name: string | null; created_at: string }>,
) {
  const rules: Array<Record<string, unknown>> = []
  for (const row of feedback) {
    if (row.feedback_type !== "rejected" && row.feedback_type !== "do_not_contact") continue
    const text = row.text.toLowerCase()
    if (/\bespaña\b|\bespan[a-z]*\b|\bespañ[a-z]*\b|\bspain\b|\bspanish\b/.test(text)) {
      rules.push({
        type: "exclude_spanish_entities",
        label: "No empresas españolas",
        reason: row.text,
        sourceCompany: row.company_name,
        createdAt: row.created_at,
      })
    }
  }
  return rules
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

  if (isCompanyDiscoverySkill(skill)) {
    if (!Array.isArray(record.companies)) return { ok: false, error: "company_discovery output must include companies array." }
    if (record.companies.length === 0) return { ok: false, error: "company_discovery returned zero companies." }
    return {
      ok: true,
      output: {
        companies: record.companies.map(normalizeCompanyOutput).filter((company) => company.name),
      },
    }
  }

  if (skill === "find_people") {
    if (!Array.isArray(record.people)) return { ok: false, error: "find_people output must include people array." }
    if (record.people.length === 0) return { ok: false, error: "find_people returned zero people." }
    return {
      ok: true,
      output: {
        ...record,
        people: record.people.map(normalizePersonOutput).filter((person) => person.name),
      },
    }
  }

  if (skill === "research_company") {
    if (typeof record.error === "string" && record.error.trim()) return { ok: false, error: record.error }
    const company = record.company && typeof record.company === "object" && !Array.isArray(record.company)
      ? normalizeCompanyOutput(record.company)
      : normalizeCompanyOutput(record)
    return { ok: true, output: { ...record, company } }
  }

  return { ok: true, output: record }
}

function normalizePersonOutput(value: unknown) {
  const record = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
  const score = nonNegativeInteger(record.score, 0)
  return {
    name: cleanText(record.name, ""),
    title: cleanText(record.title, ""),
    company_name: cleanText(record.company_name, ""),
    company_domain: normalizeDomain(cleanText(record.company_domain, "")),
    linkedin_url: cleanText(record.linkedin_url, ""),
    email: cleanText(record.email, ""),
    country: cleanText(record.country, ""),
    city: cleanText(record.city, ""),
    seniority: cleanText(record.seniority, ""),
    function: cleanText(record.function, ""),
    description: cleanText(record.description, ""),
    score: Math.min(score, 100),
    rationale: cleanText(record.rationale, ""),
    evidence: Array.isArray(record.evidence) ? record.evidence.map(normalizeEvidenceOutput).filter(Boolean) : [],
    source_keys: Array.isArray(record.source_keys) ? record.source_keys : [],
    company_candidate_id: cleanText(record.company_candidate_id, ""),
  }
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

function persistFoundCompanies(job: OpenClawJobRow, output: Record<string, unknown>) {
  const companies = Array.isArray(output.companies) ? output.companies : []
  const input = parseJson<{ brief?: { reviewBatchSize?: number }; memory?: { negativeRules?: Array<Record<string, unknown>> } }>(job.input_json, {})
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
    if (violatesNegativeRules(candidate, input.memory?.negativeRules || [])) {
      insertEvent({
        campaignId: job.campaign_id,
        runId: job.run_id,
        jobId: job.id,
        subjectType: "company_candidate",
        subjectId: "",
        level: "warning",
        eventType: "company.feedback_rule_skipped",
        message: `${candidate.name} omitida por reglas de feedback.`,
        payload: { domain: candidate.domain, country: candidate.country },
      })
      continue
    }
    if (hasUnavailableOfficialWebsite(candidate)) {
      insertEvent({
        campaignId: job.campaign_id,
        runId: job.run_id,
        jobId: job.id,
        subjectType: "company_candidate",
        subjectId: "",
        level: "warning",
        eventType: "company.website_unavailable_skipped",
        message: `${candidate.name} omitida porque el sitio oficial no carga.`,
        payload: { domain: candidate.domain, score: candidate.score },
      })
      continue
    }
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
  const people = Array.isArray(output.people) ? output.people : []
  for (const item of people) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue
    const person = item as ReturnType<typeof normalizePersonOutput>
    if (!person.name) continue
    if (isSuppressedPersonCandidate(person)) {
      insertEvent({
        campaignId: job.campaign_id,
        runId: job.run_id,
        jobId: job.id,
        subjectType: "person_candidate",
        subjectId: "",
        level: "warning",
        eventType: "person.suppressed",
        message: `${person.name} omitida por suppression_list.`,
        payload: { email: person.email, linkedinUrl: person.linkedin_url },
      })
      continue
    }

    const companyId = resolvePersonCompanyId(job.campaign_id, person)
    const personId = upsertPersonFromCandidate(person, companyId, job.run_id)
    const candidateId = stableId("person_candidate", job.campaign_id, personId)
    const existingCandidate = db
      .query<{ id: string }, [string, string]>("SELECT id FROM person_candidates WHERE campaign_id = ? AND person_id = ? LIMIT 1")
      .get(job.campaign_id, personId)
    if (existingCandidate) {
      insertEvent({
        campaignId: job.campaign_id,
        runId: job.run_id,
        jobId: job.id,
        subjectType: "person_candidate",
        subjectId: existingCandidate.id,
        level: "info",
        eventType: "person.dedupe_skipped",
        message: `${person.name} ya existía en esta campaña.`,
        payload: { personId, companyId, score: person.score },
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
        evidence_json
      ) VALUES (?, ?, ?, ?, ?, 'new', ?, ?, ?)
    `).run(
      candidateId,
      job.campaign_id,
      job.run_id,
      personId,
      companyId || null,
      person.score,
      person.rationale,
      JSON.stringify(person.evidence),
    )
    insertEvent({
      campaignId: job.campaign_id,
      runId: job.run_id,
      jobId: job.id,
      subjectType: "person_candidate",
      subjectId: candidateId,
      level: "info",
      eventType: "person.saved",
      message: `${person.name} guardada como persona candidata.`,
      payload: { personId, companyId, score: person.score },
    })
  }
}

function persistResearchedCompany(job: OpenClawJobRow, output: Record<string, unknown>) {
  const input = parseJson<{ candidateId?: string; subjectId?: string }>(job.input_json, {})
  const company = output.company && typeof output.company === "object" && !Array.isArray(output.company)
    ? (output.company as ReturnType<typeof normalizeCompanyOutput>)
    : null
  if (!company || !company.name) return

  const companyId = upsertCompanyFromCandidate(company, job.run_id)
  const candidate = input.candidateId
    ? db.query<{ id: string }, [string]>("SELECT id FROM company_candidates WHERE id = ? LIMIT 1").get(input.candidateId)
    : input.subjectId
      ? db
          .query<{ id: string }, [string, string]>(
            "SELECT id FROM company_candidates WHERE campaign_id = ? AND company_id = ? LIMIT 1",
          )
          .get(job.campaign_id, input.subjectId)
      : null
  if (!candidate) return

  const websiteUnavailable = hasUnavailableOfficialWebsite(company)
  const nextStatus = websiteUnavailable ? "needs_more_research" : "new"
  const nextScore = websiteUnavailable ? Math.min(company.score || 0, 60) : company.score
  db.prepare(`
    UPDATE company_candidates
    SET
      company_id = ?,
      status = ?,
      score = CASE WHEN ? > 0 THEN ? ELSE score END,
      rationale = CASE WHEN ? <> '' THEN ? ELSE rationale END,
      evidence_json = CASE WHEN ? <> '[]' THEN ? ELSE evidence_json END,
      review_visible = 1,
      review_revealed_at = COALESCE(review_revealed_at, CURRENT_TIMESTAMP),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    companyId,
    nextStatus,
    nextScore,
    nextScore,
    company.rationale,
    company.rationale,
    JSON.stringify(company.evidence),
    JSON.stringify(company.evidence),
    candidate.id,
  )
  insertEvent({
    campaignId: job.campaign_id,
    runId: job.run_id,
    jobId: job.id,
    subjectType: "company_candidate",
    subjectId: candidate.id,
    level: websiteUnavailable ? "warning" : "success",
    eventType: websiteUnavailable ? "company.enrichment_needs_more_research" : "company.enriched",
    message: websiteUnavailable
      ? `${company.name} sigue en Enrich porque el sitio oficial no carga.`
      : `${company.name} enriquecida y lista para revisión.`,
    payload: { companyId, score: nextScore, websiteUnavailable },
  })
}

function hasUnavailableOfficialWebsite(company: ReturnType<typeof normalizeCompanyOutput>) {
  const text = [
    company.domain,
    company.rationale,
    company.description,
    ...company.evidence.flatMap((item) => [item?.url || "", item?.note || ""]),
  ]
    .join(" ")
    .toLowerCase()
  if (!text) return false
  return /(?:\bhttp\s*)?\b(?:5\d\d|521|522|523|524)\b|cloudflare.{0,80}(?:error|timeout|time-out|521|522|523|524)|(?:site|sitio|website|web|domain|dominio|url|official|oficial).{0,100}(?:unavailable|unreachable|inaccessible|dead|down|ca[ií]d[ao]?|no carga|no disponible|timeout|timed out|time-out|parked|expirad[ao]?|suspendid[ao]?)|(?:unavailable|unreachable|inaccessible|dead|down|ca[ií]d[ao]?|no carga|no disponible|timeout|timed out|time-out|parked|expirad[ao]?|suspendid[ao]?).{0,100}(?:site|sitio|website|web|domain|dominio|url|official|oficial)/i.test(text)
}

function violatesNegativeRules(company: ReturnType<typeof normalizeCompanyOutput>, rules: Array<Record<string, unknown>>) {
  if (!rules.some((rule) => rule.type === "exclude_spanish_entities")) return false
  const text = [
    company.name,
    company.domain,
    company.country,
    company.city,
    company.description,
    company.rationale,
    ...company.evidence.flatMap((item) => [item?.url || "", item?.note || ""]),
  ]
    .join(" ")
    .toLowerCase()
  return /\bespaña\b|\bespan[a-z]*\b|\bspain\b|\bspanish\b|\.es(\/|$)/i.test(text)
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

function resolvePersonCompanyId(campaignId: string, person: ReturnType<typeof normalizePersonOutput>) {
  if (person.company_candidate_id) {
    const candidate = db
      .query<{ company_id: string }, [string, string]>(
        "SELECT company_id FROM company_candidates WHERE id = ? AND campaign_id = ? LIMIT 1",
      )
      .get(person.company_candidate_id, campaignId)
    if (candidate?.company_id) return candidate.company_id
  }
  if (person.company_domain) {
    const company = db.query<{ id: string }, [string]>("SELECT id FROM companies WHERE domain = ? LIMIT 1").get(person.company_domain)
    if (company?.id) return company.id
  }
  if (person.company_name) {
    const company = db
      .query<{ id: string }, [string]>("SELECT id FROM companies WHERE normalized_name = ? LIMIT 1")
      .get(normalizeName(person.company_name))
    if (company?.id) return company.id
  }
  return null
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

function upsertPersonFromCandidate(person: ReturnType<typeof normalizePersonOutput>, companyId: string | null, runId: string) {
  const normalized = normalizeName(person.name)
  const existing = findExistingPerson(person.email, person.linkedin_url, normalized, companyId, person.company_name)
  const personId = existing?.id ?? uniqueId("person", `${person.name}_${companyId || person.company_name}`)

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
        country,
        city,
        seniority,
        function,
        description,
        source_json,
        first_seen_run_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      personId,
      person.name,
      normalized,
      person.title,
      companyId,
      person.company_name,
      person.linkedin_url,
      person.email,
      person.country,
      person.city,
      person.seniority,
      person.function,
      person.description,
      JSON.stringify({ source: "openclaw", sourceKeys: person.source_keys }),
      runId,
    )
    return personId
  }

  db.prepare(`
    UPDATE people
    SET
      title = CASE WHEN ? <> '' THEN ? ELSE title END,
      company_id = COALESCE(?, company_id),
      company_name = CASE WHEN ? <> '' THEN ? ELSE company_name END,
      linkedin_url = CASE WHEN ? <> '' THEN ? ELSE linkedin_url END,
      email = CASE WHEN ? <> '' THEN ? ELSE email END,
      country = CASE WHEN ? <> '' THEN ? ELSE country END,
      city = CASE WHEN ? <> '' THEN ? ELSE city END,
      seniority = CASE WHEN ? <> '' THEN ? ELSE seniority END,
      function = CASE WHEN ? <> '' THEN ? ELSE function END,
      description = CASE WHEN ? <> '' THEN ? ELSE description END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    person.title,
    person.title,
    companyId,
    person.company_name,
    person.company_name,
    person.linkedin_url,
    person.linkedin_url,
    person.email,
    person.email,
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
    personId,
  )
  return personId
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

function findExistingPerson(email: string, linkedinUrl: string, normalizedName: string, companyId: string | null, companyName: string) {
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
      .query<{ id: string }, [string, string]>("SELECT id FROM people WHERE normalized_name = ? AND company_name = ? LIMIT 1")
      .get(normalizedName, companyName)
    if (row) return row
  }
  return null
}

function outputSummary(skill: string, output: Record<string, unknown>) {
  if (isCompanyDiscoverySkill(skill)) {
    return { companies: Array.isArray(output.companies) ? output.companies.length : 0 }
  }
  if (skill === "find_people") {
    const people = Array.isArray(output.people) ? output.people : []
    const metrics = output.quality_metrics && typeof output.quality_metrics === "object" ? output.quality_metrics : {}
    return { people: people.length, qualityMetrics: metrics }
  }
  return {}
}

function estimatedQualityScore(summary: Record<string, unknown>) {
  const metrics = summary.qualityMetrics && typeof summary.qualityMetrics === "object" ? summary.qualityMetrics as Record<string, unknown> : {}
  const quality = Number(metrics.estimated_match_quality)
  if (Number.isFinite(quality) && quality >= 0 && quality <= 1) return quality
  const count = Number(summary.companies || summary.people || 0)
  return count > 0 ? 0.75 : 0
}

function isCompanyDiscoverySkill(skill: string) {
  return skill === "company_discovery" || skill === "find_companies"
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
