import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { appRoot } from "./migrate.ts"

let loaded = false

export function loadBackofficeEnv() {
  if (loaded) return
  loaded = true

  for (const filePath of [path.resolve(appRoot, ".env.local"), path.resolve(appRoot, "..", "..", ".env.local")]) {
    if (!existsSync(filePath)) continue
    const text = readFileSync(filePath, "utf8")
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
      if (!match) continue
      const key = match[1] || ""
      const value = unquoteEnvValue(match[2] || "")
      if (key && Bun.env[key] === undefined) Bun.env[key] = value
    }
  }
}

function unquoteEnvValue(value: string) {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}
