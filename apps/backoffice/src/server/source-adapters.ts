import type { OpenClawQueuedJob } from "./db.ts"
import { loadBackofficeEnv } from "./env.ts"

type AdapterResult = {
  handled: boolean
  output?: Record<string, unknown>
  source?: string
  reason?: string
}

type JobInput = {
  brief?: Record<string, unknown>
  plan?: {
    step?: Record<string, unknown>
  }
  approvedCompanies?: Array<Record<string, unknown>>
}

type ApolloOrganization = Record<string, unknown>
type ApolloPerson = Record<string, unknown>
type PdlPerson = Record<string, unknown>

export async function runSourceAdapterForJob(job: OpenClawQueuedJob): Promise<AdapterResult> {
  loadBackofficeEnv()
  if (Bun.env.BACKOFFICE_SOURCE_ADAPTERS_ENABLED === "0") return { handled: false, reason: "adapters_disabled" }

  const input = job.input as JobInput
  const sourcePlan = sourcePlanForJob(input)
  if (job.skill === "company_discovery" && sourcePlan.includes("apollo")) {
    const apiKey = Bun.env.APOLLO_API_KEY
    if (!apiKey) return { handled: false, source: "apollo", reason: "missing_apollo_key" }
    return { handled: true, source: "apollo", output: await apolloCompanyDiscovery(apiKey, input) }
  }

  if (job.skill === "find_people" && sourcePlan.includes("apollo")) {
    const apiKey = Bun.env.APOLLO_API_KEY
    if (!apiKey) return { handled: false, source: "apollo", reason: "missing_apollo_key" }
    const output = await apolloPersonDiscovery(apiKey, input)
    if (sourcePlan.includes("pdl") && Bun.env.PDL_API_KEY) {
      return { handled: true, source: "apollo+pdl", output: await enrichPeopleWithPdl(Bun.env.PDL_API_KEY, output) }
    }
    return { handled: true, source: "apollo", output }
  }

  return { handled: false, reason: "no_adapter_for_source_plan" }
}

export function configuredSourceAdapters() {
  loadBackofficeEnv()
  return {
    apollo: Boolean(Bun.env.APOLLO_API_KEY),
    explorium: Boolean(Bun.env.EXPLORIUM_API_KEY),
    pdl: Boolean(Bun.env.PDL_API_KEY),
  }
}

function sourcePlanForJob(input: JobInput) {
  const sourcePlan = input.plan?.step?.source_plan
  if (!Array.isArray(sourcePlan)) return []
  return sourcePlan.map((item) => String(item || "").trim().toLowerCase()).filter(Boolean)
}

async function apolloCompanyDiscovery(apiKey: string, input: JobInput) {
  const brief = input.brief || {}
  const maxCompanies = clampNumber(brief.maxCompanies, 10, 1, 100)
  const payload = compactRecord({
    page: 1,
    per_page: maxCompanies,
    organization_locations: arrayValue(brief.countryRegion),
    organization_num_employees_ranges: employeeRanges(brief.companySize),
    q_organization_keyword_tags: keywordTags([brief.industry, brief.niche, brief.positiveSignals]),
    q_keywords: textValue(brief.objective),
  })
  const json = await apolloPost(apiKey, "/mixed_companies/search", payload)
  const organizations = arrayFromKeys<ApolloOrganization>(json, ["organizations", "accounts", "companies"])
  return {
    companies: organizations.slice(0, maxCompanies).map(normalizeApolloOrganization).filter((company) => company.name),
  }
}

async function apolloPersonDiscovery(apiKey: string, input: JobInput) {
  const brief = input.brief || {}
  const approvedCompanies = Array.isArray(input.approvedCompanies) ? input.approvedCompanies : []
  const maxPeople = clampNumber(brief.maxPeople, 10, 1, 100)
  const domains = approvedCompanies.map((company) => textValue(company.domain)).filter(Boolean)
  const payload = compactRecord({
    page: 1,
    per_page: maxPeople,
    q_organization_domains_list: domains.length > 0 ? domains : undefined,
    organization_locations: arrayValue(brief.countryRegion),
    person_seniorities: inferSeniorities(brief),
    person_titles: inferTitles(brief),
    q_keywords: textValue(brief.positiveSignals) || textValue(brief.objective),
    include_similar_titles: true,
  })
  const json = await apolloPost(apiKey, "/mixed_people/api_search", payload)
  const people = arrayFromKeys<ApolloPerson>(json, ["people", "contacts"])
  return {
    people: people.slice(0, maxPeople).map((person) => normalizeApolloPerson(person, approvedCompanies)).filter((person) => person.name),
    quality_metrics: {
      count: people.length,
      with_role_evidence: people.length,
      with_email: 0,
      estimated_match_quality: people.length > 0 ? 0.72 : 0,
    },
    what_worked: "Apollo people search returned role/company matches.",
    what_failed: "Apollo people search does not return emails; use enrichment only after dedupe.",
    learned: "",
  }
}

async function enrichPeopleWithPdl(apiKey: string, output: Record<string, unknown>) {
  const people = Array.isArray(output.people) ? output.people : []
  const enriched = []
  for (const person of people) {
    if (!person || typeof person !== "object" || Array.isArray(person)) continue
    const record = person as Record<string, unknown>
    try {
      const pdl = await pdlPersonEnrich(apiKey, {
        name: textValue(record.name),
        company: textValue(record.company_domain) || textValue(record.company_name),
        profile: textValue(record.linkedin_url),
        location: textValue(record.country),
      })
      enriched.push(mergePdlPerson(record, pdl))
    } catch {
      enriched.push(record)
    }
  }
  return {
    ...output,
    people: enriched,
    quality_metrics: {
      ...(typeof output.quality_metrics === "object" && output.quality_metrics ? output.quality_metrics : {}),
      with_email: enriched.filter((person) => textValue((person as Record<string, unknown>).email)).length,
    },
  }
}

async function apolloPost(apiKey: string, endpoint: string, payload: Record<string, unknown>) {
  const baseUrl = Bun.env.APOLLO_BASE_URL || "https://api.apollo.io/api/v1"
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`Apollo ${endpoint} failed with ${response.status}: ${await response.text()}`)
  return await response.json() as Record<string, unknown>
}

async function pdlPersonEnrich(apiKey: string, payload: Record<string, string>) {
  const baseUrl = Bun.env.PDL_BASE_URL || "https://api.peopledatalabs.com/v5"
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(payload)) {
    if (value) params.set(key, value)
  }
  const response = await fetch(`${baseUrl}/person/enrich?${params.toString()}`, {
    headers: {
      "Accept": "application/json",
      "X-Api-Key": apiKey,
    },
  })
  if (response.status === 404) return {}
  if (!response.ok) throw new Error(`PDL person enrich failed with ${response.status}: ${await response.text()}`)
  return await response.json() as PdlPerson
}

function normalizeApolloOrganization(org: ApolloOrganization) {
  const name = textValue(org.name)
  const domain = normalizeDomain(textValue(org.primary_domain) || textValue(org.website_url) || textValue(org.domain))
  return {
    name,
    domain,
    linkedin_url: textValue(org.linkedin_url),
    country: textValue(org.country) || textValue(org.organization_country),
    city: textValue(org.city),
    industry: textValue(org.industry),
    employee_range: employeeRangeFromApollo(org),
    description: textValue(org.short_description) || textValue(org.seo_description),
    score: 78,
    rationale: "Apollo organization search match for the campaign ICP.",
    evidence: [{ type: "apollo", url: domain ? `https://${domain}` : textValue(org.linkedin_url), note: "Apollo organization search result." }],
  }
}

function normalizeApolloPerson(person: ApolloPerson, approvedCompanies: Array<Record<string, unknown>>) {
  const organization = objectValue(person.organization) || objectValue(person.account) || {}
  const companyDomain = normalizeDomain(textValue(organization.primary_domain) || textValue(organization.website_url))
  const approved = approvedCompanies.find((company) => {
    const approvedDomain = normalizeDomain(textValue(company.domain))
    return approvedDomain && companyDomain && approvedDomain === companyDomain
  })
  const name = [person.first_name, person.last_name].map(textValue).filter(Boolean).join(" ") || textValue(person.name)
  return {
    name,
    title: textValue(person.title),
    company_name: textValue(organization.name) || textValue(person.organization_name),
    company_domain: companyDomain,
    linkedin_url: textValue(person.linkedin_url),
    email: "",
    country: textValue(person.country) || textValue(organization.country),
    city: textValue(person.city),
    seniority: textValue(person.seniority),
    function: textValue(person.departments),
    description: "",
    score: 76,
    rationale: "Apollo people search match for approved company and target role.",
    evidence: [{ type: "apollo", url: textValue(person.linkedin_url) || (companyDomain ? `https://${companyDomain}` : ""), note: "Apollo people search result." }],
    source_keys: ["apollo"],
    company_candidate_id: textValue(approved?.candidate_id),
  }
}

function mergePdlPerson(person: Record<string, unknown>, pdl: PdlPerson) {
  const data = objectValue(pdl.data) || pdl
  const emails = Array.isArray(data.emails) ? data.emails : []
  const firstEmail = emails.map((item) => typeof item === "string" ? item : textValue((item as Record<string, unknown>)?.address)).find(Boolean) || ""
  return {
    ...person,
    email: textValue(person.email) || firstEmail,
    linkedin_url: textValue(person.linkedin_url) || textValue(data.linkedin_url),
    description: textValue(person.description) || textValue(data.summary),
    source_keys: [...new Set([...(Array.isArray(person.source_keys) ? person.source_keys.map(String) : []), "pdl"])],
  }
}

function employeeRanges(value: unknown) {
  const text = textValue(value).toLowerCase()
  if (!text) return undefined
  const matches = text.match(/\d[\d,]*/g)
  if (matches && matches.length >= 2) return [`${digits(matches[0] || "")},${digits(matches[1] || "")}`]
  if (text.includes("startup")) return ["1,50"]
  if (text.includes("mid") || text.includes("mediana")) return ["51,500"]
  if (text.includes("enterprise") || text.includes("corporativo")) return ["501,10000"]
  return undefined
}

function employeeRangeFromApollo(org: ApolloOrganization) {
  const estimated = Number(org.estimated_num_employees || org.num_employees || 0)
  if (!Number.isFinite(estimated) || estimated <= 0) return ""
  if (estimated <= 10) return "1-10"
  if (estimated <= 50) return "11-50"
  if (estimated <= 200) return "51-200"
  if (estimated <= 500) return "201-500"
  if (estimated <= 1000) return "501-1000"
  return "1001+"
}

function inferSeniorities(brief: Record<string, unknown>) {
  const text = [brief.objective, brief.positiveSignals, brief.niche].map(textValue).join(" ").toLowerCase()
  const seniorities = []
  if (/founder|fundador|ceo|c-?suite|cfo|cto|coo/.test(text)) seniorities.push("founder", "c_suite")
  if (/vp|vice/.test(text)) seniorities.push("vp")
  if (/head|director|lider|líder/.test(text)) seniorities.push("head", "director")
  if (/manager|gerente/.test(text)) seniorities.push("manager")
  return seniorities.length > 0 ? [...new Set(seniorities)] : ["c_suite", "vp", "head", "director"]
}

function inferTitles(brief: Record<string, unknown>) {
  const text = [brief.objective, brief.positiveSignals, brief.niche].map(textValue).join(" ").toLowerCase()
  const titles = []
  if (/cfo|finance|finanzas|financ/.test(text)) titles.push("CFO", "Head of Finance", "Finance Director")
  if (/ops|operaci/.test(text)) titles.push("COO", "Head of Operations", "Operations Director")
  if (/founder|fundador|ceo/.test(text)) titles.push("Founder", "CEO")
  return titles.length > 0 ? titles : undefined
}

function keywordTags(values: unknown[]) {
  const tags = values.flatMap((value) => textValue(value).split(/[,\n]/g)).map((item) => item.trim()).filter(Boolean)
  return tags.length > 0 ? tags.slice(0, 10) : undefined
}

function compactRecord(record: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => {
    if (value === undefined || value === null || value === "") return false
    if (Array.isArray(value) && value.length === 0) return false
    return true
  }))
}

function arrayFromKeys<T>(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (Array.isArray(value)) return value as T[]
  }
  return []
}

function arrayValue(value: unknown) {
  const text = textValue(value)
  return text ? [text] : undefined
}

function objectValue(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null
}

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function digits(value: string) {
  return value.replace(/[^\d]/g, "")
}

function normalizeDomain(value: string) {
  return value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "")
}

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(min, Math.min(max, Math.floor(parsed)))
}
