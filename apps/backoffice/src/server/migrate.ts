import { mkdirSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { Database } from "bun:sqlite"

export const appRoot = path.resolve(import.meta.dir, "../..")
export const migrationsDir = path.join(appRoot, "db", "migrations")

export function resolveDbPath() {
  const configured = Bun.env.BENFORD_BACKOFFICE_DB_PATH?.trim()
  if (configured) return path.resolve(configured)
  return path.join(appRoot, ".data", "backoffice.sqlite")
}

export function openDatabase(databasePath = resolveDbPath()) {
  mkdirSync(path.dirname(databasePath), { recursive: true })
  const database = new Database(databasePath, { create: true })
  database.exec("PRAGMA journal_mode = WAL;")
  database.exec("PRAGMA foreign_keys = ON;")
  migrateDatabase(database)
  return database
}

export function migrateDatabase(database: Database) {
  preserveLegacyPrototypeTables(database)

  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)

  const applied = new Set(
    database
      .query<{ id: string }, []>("SELECT id FROM schema_migrations")
      .all()
      .map((row) => row.id),
  )

  const migrationFiles = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort()

  for (const file of migrationFiles) {
    const id = file.replace(/\.sql$/, "")
    if (applied.has(id)) continue

    const sql = readFileSync(path.join(migrationsDir, file), "utf8")
    database.transaction(() => {
      database.exec(sql)
      database.prepare("INSERT INTO schema_migrations (id) VALUES (?)").run(id)
    })()
  }

  importPreservedLegacyPrototypeData(database)
}

function preserveLegacyPrototypeTables(database: Database) {
  if (tableExists(database, "schema_migrations")) return
  if (!tableExists(database, "campaigns")) return
  if (columnExists(database, "campaigns", "status")) return

  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14)
  for (const table of ["campaigns", "companies", "prospects", "events", "document_tracker_items"]) {
    if (!tableExists(database, table)) continue
    const legacyName = `legacy_${table}_${stamp}`
    database.exec(`ALTER TABLE "${table}" RENAME TO "${legacyName}";`)
  }
}

function tableExists(database: Database, name: string) {
  const row = database
    .query<{ count: number }, [string]>("SELECT COUNT(*) AS count FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(name)
  return Boolean(row && row.count > 0)
}

function columnExists(database: Database, table: string, column: string) {
  const rows = database.query<{ name: string }, []>(`PRAGMA table_info("${table}")`).all()
  return rows.some((row) => row.name === column)
}

function importPreservedLegacyPrototypeData(database: Database) {
  const campaignsTable = latestLegacyTable(database, "legacy_campaigns_")
  const companiesTable = latestLegacyTable(database, "legacy_companies_")
  const eventsTable = latestLegacyTable(database, "legacy_events_")
  if (!campaignsTable && !companiesTable && !eventsTable) return
  if (campaignsTable && legacyCampaignsAlreadyImported(database, campaignsTable)) return

  database.transaction(() => {
    if (campaignsTable) importLegacyCampaigns(database, campaignsTable)
    if (companiesTable) importLegacyCompanies(database, companiesTable, campaignsTable)
    if (eventsTable) importLegacyEvents(database, eventsTable)
  })()
}

function legacyCampaignsAlreadyImported(database: Database, table: string) {
  const row = database
    .query<{ count: number }, []>(`SELECT COUNT(*) AS count FROM campaigns WHERE id IN (SELECT id FROM "${table}")`)
    .get()
  return Boolean(row && row.count > 0)
}

function latestLegacyTable(database: Database, prefix: string) {
  return (
    database
      .query<{ name: string }, [string]>(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE ? ORDER BY name DESC LIMIT 1",
      )
      .get(`${prefix}%`)?.name ?? ""
  )
}

function importLegacyCampaigns(database: Database, table: string) {
  const rows = database
    .query<
      {
        id: string
        name: string
        criteria: string
        status_kind: string
        owner_name: string
        created_at: string
        updated_at: string
      },
      []
    >(
      `SELECT id, name, criteria, status_kind, owner_name, created_at, updated_at FROM "${table}"`,
    )
    .all()
  const insertCampaign = database.prepare(`
    INSERT OR IGNORE INTO campaigns (id, name, status, owner_name, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  const insertBrief = database.prepare(`
    INSERT OR IGNORE INTO campaign_briefs (
      campaign_id,
      objective,
      industry,
      niche,
      country_region,
      company_size,
      search_mode,
      run_budget_cents,
      max_companies,
      max_people,
      max_runtime_seconds,
      min_score_threshold,
      created_at,
      updated_at
    ) VALUES (?, ?, '', '', '', '', 'companies', 0, 10, 0, 900, 75, ?, ?)
  `)

  for (const row of rows) {
    insertCampaign.run(row.id, row.name, legacyCampaignStatus(row.status_kind), row.owner_name || "Equipo", row.created_at, row.updated_at)
    insertBrief.run(row.id, row.criteria || row.name, row.created_at, row.updated_at)
  }
}

function importLegacyCompanies(database: Database, table: string, campaignsTable: string) {
  const rows = database
    .query<
      {
        id: string
        name: string
        domain: string
        industry: string
        size: string
        country: string
        tags_json: string
        created_at: string
        updated_at: string
      },
      []
    >(
      `SELECT id, name, domain, industry, size, country, tags_json, created_at, updated_at FROM "${table}"`,
    )
    .all()
  const campaignId = legacyTargetCampaignId(database, campaignsTable)
  const insertCompany = database.prepare(`
    INSERT OR IGNORE INTO companies (
      id,
      name,
      normalized_name,
      domain,
      country,
      industry,
      employee_range,
      source_json,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertCandidate = database.prepare(`
    INSERT OR IGNORE INTO company_candidates (
      id,
      campaign_id,
      company_id,
      status,
      score,
      rationale,
      evidence_json,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, 'new', 75, 'Importada desde el backoffice legacy.', '[]', ?, ?)
  `)

  for (const row of rows) {
    insertCompany.run(
      row.id,
      row.name,
      normalizeLegacyName(row.name),
      normalizeLegacyDomain(row.domain),
      row.country || "",
      row.industry || "",
      row.size || "",
      JSON.stringify({ source: "legacy_backoffice", tags: parseLegacyJson(row.tags_json, []) }),
      row.created_at,
      row.updated_at,
    )
    if (campaignId) {
      insertCandidate.run(`legacy_company_candidate_${campaignId}_${row.id}`, campaignId, row.id, row.created_at, row.updated_at)
    }
  }
}

function importLegacyEvents(database: Database, table: string) {
  const rows = database
    .query<
      { id: number; severity: string; type: string; text: string; actor: string; source: string; created_at: string },
      []
    >(`SELECT id, severity, type, text, actor, source, created_at FROM "${table}"`)
    .all()
  const insert = database.prepare(`
    INSERT OR IGNORE INTO agent_events (
      id,
      level,
      event_type,
      message,
      subject_type,
      subject_id,
      payload_json,
      created_at
    ) VALUES (?, ?, ?, ?, 'legacy_event', ?, ?, ?)
  `)

  for (const row of rows) {
    insert.run(row.id, legacyEventLevel(row.severity), row.type || "legacy.event", row.text, String(row.id), JSON.stringify({ actor: row.actor, source: row.source }), row.created_at)
  }
}

function legacyTargetCampaignId(database: Database, campaignsTable: string) {
  if (!campaignsTable) {
    return database.query<{ id: string }, []>("SELECT id FROM campaigns ORDER BY created_at ASC LIMIT 1").get()?.id ?? ""
  }
  return (
    database
      .query<{ id: string }, []>(
        `SELECT id FROM "${campaignsTable}" ORDER BY CASE WHEN status_kind = 'running' THEN 0 ELSE 1 END, created_at ASC LIMIT 1`,
      )
      .get()?.id ?? ""
  )
}

function legacyCampaignStatus(statusKind: string) {
  if (statusKind === "running") return "active"
  if (statusKind === "done") return "active"
  if (statusKind === "empty") return "draft"
  return "draft"
}

function legacyEventLevel(severity: string) {
  if (severity === "ok") return "success"
  if (severity === "warn") return "warning"
  if (severity === "bad") return "error"
  return "info"
}

function normalizeLegacyDomain(value: string) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
}

function normalizeLegacyName(value: string) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function parseLegacyJson(value: string, fallback: unknown) {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}
