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
