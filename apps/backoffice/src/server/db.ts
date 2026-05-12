import { mkdirSync } from "node:fs"
import path from "node:path"
import { Database } from "bun:sqlite"

export type CampaignRow = {
  id: string
  name: string
  criteria: string
  created: string
  runs: number
  lastRun: string
  total: number
  contacted: number
  replied: number
  qualified: number
  pending: number
  status_kind: string
  status_label: string
  owner_name: string
  owner_initials: string
  owner_color: string
  progressKind: string
}

export type ProspectRow = {
  id: string
  name: string
  title: string
  company: string
  industry: string
  score: number
  scoreBand: string
  status_kind: string
  status_label: string
  channels_json: string
  lastTouch: string
  batch: string
  country: string
  owner_initials: string
  owner_color: string
  tags_json: string
}

export type CompanyRow = {
  id: string
  name: string
  domain: string
  industry: string
  size: string
  country: string
  prospects: number
  contacted: number
  replied: number
  last: string
  owner_initials: string
  owner_color: string
  tags_json: string
  logo_color: string
}

type CampaignSeed = [
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  number,
  number,
  number,
  number,
  string,
  string,
  string,
  string,
  string,
  string,
]

type CompanySeed = [
  string,
  string,
  string,
  string,
  string,
  string,
  number,
  number,
  number,
  string,
  string,
  string,
  string[],
  string,
]

type ProspectSeed = [
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  string,
  string,
  Record<string, string>,
  string,
  string,
  string,
  string,
  string,
  string[],
]

const dbDir = path.resolve(import.meta.dir, "../../.data")
mkdirSync(dbDir, { recursive: true })

export const dbPath = path.join(dbDir, "backoffice.sqlite")
export const db = new Database(dbPath, { create: true })

db.exec("PRAGMA journal_mode = WAL;")
db.exec("PRAGMA foreign_keys = ON;")

const campaigns: CampaignSeed[] = [
  ["btc_8821", "Fintech LATAM · Founders", "Fintech · LATAM · 11–50 emp · Founder/CEO", "hace 2 d", 4, "Corrida actual · 14:02", 248, 184, 41, 12, 64, "running", "En curso", "Manu", "M", "#A855F7", "info"],
  ["btc_8814", "SaaS B2B · CFOs Mx", "SaaS B2B · México · 50–200 emp · CFO/Finance", "hace 5 d", 3, "Corrida #3 · ayer 09:14", 412, 412, 89, 31, 0, "done", "Completado", "Vale", "V", "#0EA5E9", "ok"],
  ["btc_8807", "Contadores · Pymes", "Contabilidad · México · 1–10 emp · Owner", "hace 1 sem", 2, "Corrida #2 · mar 06 11:30", 96, 71, 18, 5, 25, "done", "Completado", "Iván", "I", "#16A34A", "ok"],
  ["btc_8799", "E-commerce · Shopify Plus", "E-commerce · LATAM · 11–50 emp · Founder", "hace 9 d", 1, "Corrida #1 · feb 28 15:20", 158, 158, 22, 8, 0, "done", "Completado", "Manu", "M", "#A855F7", "ok"],
  ["btc_draft", "Batch sin nombre", "—", "draft", 0, "—", 0, 0, 0, 0, 0, "empty", "Vacío", "Manu", "M", "#A855F7", "warn"],
]

const companies: CompanySeed[] = [
  ["c01", "Mendel", "mendel.com", "Fintech", "50–200", "MX", 8, 6, 2, "hoy", "M", "#A855F7", ["ICP-A", "Fintech LATAM"], "#0EA5E9"],
  ["c02", "Rappi", "rappi.com", "Logística", "5k+", "CO", 14, 11, 3, "hoy", "V", "#0EA5E9", ["Enterprise"], "#FF441F"],
  ["c03", "Kavak", "kavak.com", "Mobility", "5k+", "BR", 11, 8, 4, "ayer", "I", "#16A34A", ["Enterprise"], "#7C3AED"],
  ["c04", "Bitso", "bitso.com", "Fintech", "500–1k", "MX", 9, 7, 1, "hace 2 d", "M", "#A855F7", ["ICP-A"], "#2563EB"],
  ["c05", "Clip", "clip.mx", "Fintech", "500–1k", "MX", 6, 5, 1, "hace 2 d", "V", "#0EA5E9", ["ICP-A"], "#16A34A"],
  ["c06", "Konfío", "konfio.mx", "Fintech", "500–1k", "MX", 7, 4, 0, "hace 3 d", "I", "#16A34A", ["ICP-A"], "#1F2937"],
  ["c07", "Albo", "albo.mx", "Fintech", "200–500", "MX", 4, 3, 1, "hoy", "M", "#A855F7", ["ICP-A"], "#0F766E"],
  ["c08", "Stori", "stori.mx", "Fintech", "500–1k", "MX", 5, 2, 0, "hace 4 d", "V", "#0EA5E9", ["ICP-B"], "#DC2626"],
  ["c09", "Belvo", "belvo.com", "Fintech API", "50–200", "CO", 3, 2, 0, "hace 4 d", "I", "#16A34A", ["ICP-A"], "#1E40AF"],
  ["c10", "Truora", "truora.com", "Software", "50–200", "CO", 2, 1, 0, "hace 5 d", "M", "#A855F7", [], "#A21CAF"],
  ["c11", "Tiendanube", "tiendanube.com", "E-commerce", "500–1k", "AR", 6, 3, 1, "hace 5 d", "V", "#0EA5E9", ["ICP-B"], "#0891B2"],
  ["c12", "Fintual", "fintual.com", "Wealthtech", "50–200", "CL", 2, 2, 0, "hace 1 sem", "I", "#16A34A", [], "#0D9488"],
  ["c13", "Cobre", "cobre.co", "Fintech", "50–200", "CO", 3, 0, 0, "—", "M", "#A855F7", ["Nuevo"], "#0F172A"],
]

const prospects: ProspectSeed[] = [
  ["p001", "Andrés Martín", "CEO & Co-founder", "Mendel", "Fintech", 92, "hot", "running", "En conversación", { email: "on", linkedin: "on", call: "" }, "hoy 13:44", "btc_8821", "MX", "M", "#A855F7", ["Founder", "ICP-A"]],
  ["p002", "Sofía Bermúdez", "Head of Growth", "Rappi", "Logística", 88, "hot", "done", "Calificado", { email: "on", linkedin: "on", call: "on" }, "hoy 11:30", "btc_8821", "CO", "V", "#0EA5E9", ["Decision-maker"]],
  ["p003", "Lucas Pereira", "CFO", "Kavak", "Mobility", 81, "hot", "running", "Respondió", { email: "on", linkedin: "" }, "ayer 16:48", "btc_8814", "BR", "I", "#16A34A", ["ICP-A"]],
  ["p004", "María Fernández", "VP Finance", "Bitso", "Fintech", 74, "warm", "draft", "Contactado", { email: "on", linkedin: "on" }, "hace 2 d", "btc_8821", "MX", "M", "#A855F7", ["Founder"]],
  ["p005", "Diego Acosta", "Founder", "Clip", "Fintech", 71, "warm", "draft", "Contactado", { email: "on" }, "hace 2 d", "btc_8814", "MX", "V", "#0EA5E9", ["ICP-B"]],
  ["p006", "Camila Rojas", "Director of Operations", "Konfío", "Fintech", 69, "warm", "warn", "Sin respuesta", { email: "on", linkedin: "on" }, "hace 3 d", "btc_8814", "MX", "I", "#16A34A", []],
  ["p007", "Tomás Vázquez", "Co-founder", "Albo", "Fintech", 64, "warm", "running", "En conversación", { email: "on", linkedin: "on" }, "hoy 09:12", "btc_8821", "MX", "M", "#A855F7", ["Founder", "ICP-A"]],
  ["p008", "Valentina López", "Head of Finance", "Stori", "Fintech", 58, "warm", "draft", "Encolado", { email: "" }, "—", "btc_8821", "MX", "V", "#0EA5E9", []],
  ["p009", "Pablo Restrepo", "CEO", "Belvo", "Fintech", 55, "warm", "draft", "Contactado", { email: "on", linkedin: "" }, "hace 4 d", "btc_8807", "CO", "I", "#16A34A", ["Founder"]],
  ["p010", "Renata Silva", "Head of People", "Truora", "Software", 48, "cold", "empty", "Rebotado", { email: "warn" }, "hace 5 d", "btc_8807", "CO", "M", "#A855F7", []],
  ["p011", "Mateo Aguilar", "Finance Director", "Tiendanube", "E-commerce", 43, "cold", "warn", "Sin respuesta", { email: "on" }, "hace 5 d", "btc_8799", "AR", "V", "#0EA5E9", []],
  ["p012", "Ana Castillo", "COO", "Fintual", "Fintech", 39, "cold", "danger", "Descartado", { email: "on", linkedin: "on" }, "hace 1 sem", "btc_8807", "CL", "I", "#16A34A", ["Decision-maker"]],
  ["p013", "Sebastián Núñez", "CEO", "Cobre", "Fintech", 34, "cold", "draft", "Encolado", { email: "" }, "—", "btc_8821", "CO", "M", "#A855F7", ["Founder"]],
]

export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS campaigns (
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

    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
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

    CREATE TABLE IF NOT EXISTS prospects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      company_name TEXT NOT NULL DEFAULT '',
      industry TEXT NOT NULL DEFAULT '',
      score INTEGER NOT NULL DEFAULT 0,
      score_band TEXT NOT NULL DEFAULT 'cold',
      status_kind TEXT NOT NULL DEFAULT 'draft',
      status_label TEXT NOT NULL DEFAULT '',
      channels_json TEXT NOT NULL DEFAULT '{}',
      last_touch_label TEXT NOT NULL DEFAULT '',
      campaign_id TEXT NOT NULL DEFAULT '',
      country TEXT NOT NULL DEFAULT '',
      owner_initials TEXT NOT NULL DEFAULT '',
      owner_color TEXT NOT NULL DEFAULT '#71717A',
      tags_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
    );

    CREATE TABLE IF NOT EXISTS events (
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

    CREATE TABLE IF NOT EXISTS document_tracker_items (
      id TEXT PRIMARY KEY,
      area TEXT NOT NULL,
      document_type TEXT NOT NULL,
      status TEXT NOT NULL,
      title TEXT NOT NULL,
      canonical_path TEXT NOT NULL DEFAULT '',
      props_count INTEGER NOT NULL DEFAULT 0,
      contributions_count INTEGER NOT NULL DEFAULT 0,
      failure_reason TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)
}

function seed() {
  const campaignCount = db.query("SELECT COUNT(*) AS count FROM campaigns").get() as { count: number }
  if (campaignCount.count > 0) return

  const insertCampaign = db.prepare(`
    INSERT INTO campaigns (
      id, name, criteria, created_label, runs, last_run_label, total, contacted,
      replied, qualified, pending, status_kind, status_label, owner_name,
      owner_initials, owner_color, progress_kind
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertCompany = db.prepare(`
    INSERT INTO companies (
      id, name, domain, industry, size, country, prospects, contacted, replied,
      last_label, owner_initials, owner_color, tags_json, logo_color
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertProspect = db.prepare(`
    INSERT INTO prospects (
      id, name, title, company_name, industry, score, score_band, status_kind,
      status_label, channels_json, last_touch_label, campaign_id, country,
      owner_initials, owner_color, tags_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  db.transaction(() => {
    for (const row of campaigns) insertCampaign.run(...row)
    for (const row of companies) {
      insertCompany.run(
        row[0],
        row[1],
        row[2],
        row[3],
        row[4],
        row[5],
        row[6],
        row[7],
        row[8],
        row[9],
        row[10],
        row[11],
        JSON.stringify(row[12]),
        row[13],
      )
    }
    for (const row of prospects) {
      insertProspect.run(
        row[0],
        row[1],
        row[2],
        row[3],
        row[4],
        row[5],
        row[6],
        row[7],
        row[8],
        JSON.stringify(row[9]),
        row[10],
        row[11],
        row[12],
        row[13],
        row[14],
        JSON.stringify(row[15]),
      )
    }
  })()
}

export function setupDatabase() {
  migrate()
  seed()
}

export function listCampaigns() {
  const rows = db
    .query<CampaignRow, []>(`
      SELECT
        id, name, criteria, created_label AS created, runs, last_run_label AS lastRun,
        total, contacted, replied, qualified, pending, status_kind, status_label,
        owner_name, owner_initials, owner_color, progress_kind AS progressKind
      FROM campaigns
      ORDER BY
        CASE id
          WHEN 'btc_8821' THEN 1
          WHEN 'btc_8814' THEN 2
          WHEN 'btc_8807' THEN 3
          WHEN 'btc_8799' THEN 4
          WHEN 'btc_draft' THEN 5
          ELSE 99
        END,
        created_at DESC
    `)
    .all()

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    criteria: row.criteria,
    created: row.created,
    runs: row.runs,
    lastRun: row.lastRun,
    total: row.total,
    contacted: row.contacted,
    replied: row.replied,
    qualified: row.qualified,
    pending: row.pending,
    status: { kind: row.status_kind, label: row.status_label },
    owner: {
      name: row.owner_name,
      initials: row.owner_initials,
      color: row.owner_color,
    },
    progressKind: row.progressKind,
  }))
}

function slugId(prefix: string, value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24)

  return `${prefix}_${slug || "nuevo"}_${Date.now().toString(36).slice(-5)}`
}

export function createCampaign(input: { name?: string; criteria?: string }) {
  const name = input.name?.trim() || "Nueva campaña"
  const id = slugId("btc", name)

  db.prepare(`
    INSERT INTO campaigns (
      id, name, criteria, created_label, runs, last_run_label, total, contacted,
      replied, qualified, pending, status_kind, status_label, owner_name,
      owner_initials, owner_color, progress_kind
    ) VALUES (?, ?, ?, ?, 0, ?, 0, 0, 0, 0, 0, 'empty', 'Vacío', 'Manu', 'M', '#A855F7', 'warn')
  `).run(id, name, input.criteria?.trim() || "—", "hoy", "—")

  return listCampaigns().find((campaign) => campaign.id === id)
}

export function listProspects() {
  const rows = db
    .query<ProspectRow, []>(`
      SELECT
        id, name, title, company_name AS company, industry, score,
        score_band AS scoreBand, status_kind, status_label, channels_json,
        last_touch_label AS lastTouch, campaign_id AS batch, country,
        owner_initials, owner_color, tags_json
      FROM prospects
      ORDER BY score DESC, name ASC
    `)
    .all()

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    title: row.title,
    company: row.company,
    industry: row.industry,
    score: row.score,
    scoreBand: row.scoreBand,
    status: { kind: row.status_kind, label: row.status_label },
    channels: JSON.parse(row.channels_json),
    lastTouch: row.lastTouch,
    batch: row.batch,
    country: row.country,
    owner: { i: row.owner_initials, c: row.owner_color },
    tags: JSON.parse(row.tags_json),
  }))
}

export function createProspect(input: {
  name?: string
  title?: string
  company?: string
  campaignId?: string
}) {
  const name = input.name?.trim() || "Nuevo prospecto"
  const company = input.company?.trim() || "Sin empresa"
  const id = slugId("p", name)

  db.prepare(`
    INSERT INTO prospects (
      id, name, title, company_name, industry, score, score_band, status_kind,
      status_label, channels_json, last_touch_label, campaign_id, country,
      owner_initials, owner_color, tags_json
    ) VALUES (?, ?, ?, ?, '', 0, 'cold', 'draft', 'Encolado', '{}', '—', ?, '', 'M', '#A855F7', '[]')
  `).run(id, name, input.title?.trim() || "", company, input.campaignId?.trim() || "btc_draft")

  return listProspects().find((prospect) => prospect.id === id)
}

export function listCompanies() {
  const rows = db
    .query<CompanyRow, []>(`
      SELECT
        id, name, domain, industry, size, country, prospects, contacted,
        replied, last_label AS last, owner_initials, owner_color, tags_json,
        logo_color
      FROM companies
      ORDER BY name ASC
    `)
    .all()

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    domain: row.domain,
    industry: row.industry,
    size: row.size,
    country: row.country,
    prospects: row.prospects,
    contacted: row.contacted,
    replied: row.replied,
    last: row.last,
    owner: { i: row.owner_initials, c: row.owner_color },
    tags: JSON.parse(row.tags_json),
  }))
}

export function createCompany(input: { name?: string; domain?: string; industry?: string }) {
  const name = input.name?.trim() || "Nueva empresa"
  const id = slugId("c", name)
  const logoColor = "#71717A"

  db.prepare(`
    INSERT INTO companies (
      id, name, domain, industry, size, country, prospects, contacted, replied,
      last_label, owner_initials, owner_color, tags_json, logo_color
    ) VALUES (?, ?, ?, ?, '', '', 0, 0, 0, '—', 'M', '#A855F7', '[]', ?)
  `).run(id, name, input.domain?.trim() || "", input.industry?.trim() || "", logoColor)

  return listCompanies().find((company) => company.id === id)
}

export function companyLogoMap() {
  const rows = db
    .query<{ name: string; logo_color: string }, []>("SELECT name, logo_color FROM companies")
    .all()

  return Object.fromEntries(rows.map((row) => [row.name, { c: row.logo_color }]))
}
