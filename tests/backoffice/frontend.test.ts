import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { describe, expect, test } from "bun:test"
import {
  listCampaigns,
  listProspects,
  setupDatabase,
} from "../../apps/backoffice/src/server/db.ts"

const appRoot = path.resolve(import.meta.dir, "../../apps/backoffice")

describe("clo backoffice frontend", () => {
  test("uses local runtime and local JSX screens", async () => {
    const html = await readFile(path.join(appRoot, "index.html"), "utf8")

    expect(html).toContain("/src/vendor/react-lite.js")
    expect(html).toContain("/src/clo/app.jsx")
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
})

describe("clo backoffice local database", () => {
  test("seeds CRM data for the first backend-backed screens", () => {
    setupDatabase()

    expect(listCampaigns().map((campaign) => campaign.id)).toContain("btc_8821")
    expect(listProspects().map((prospect) => prospect.id)).toContain("p001")
  })
})
