import type { MarkdownTable } from "./types"

export function extractSection(
  content: string,
  heading: string,
): string | null {
  const lines = content.split("\n")
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`)
  if (start === -1) return null

  const sectionLines: string[] = []
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index]
    if (line?.startsWith("## ")) break
    sectionLines.push(line ?? "")
  }
  return sectionLines.join("\n").trim()
}

export function listH2Sections(content: string): Set<string> {
  const sections = new Set<string>()
  for (const match of content.matchAll(/^##\s+(.+?)\s*$/gm)) {
    const section = match[1]
    if (section) sections.add(section.trim())
  }
  return sections
}

export function parseFirstMarkdownTable(
  section: string | null,
): MarkdownTable | null {
  if (!section) return null
  const lines = section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.endsWith("|"))

  if (lines.length < 2) return null
  const headerLine = lines[0]
  const dividerLine = lines[1]
  if (!headerLine || !dividerLine) return null
  const headers = splitTableRow(headerLine)
  const divider = splitTableRow(dividerLine)
  if (headers.length === 0 || divider.length !== headers.length) return null
  if (!divider.every((cell) => /^:?-{3,}:?$/.test(cell))) return null

  const rows = lines.slice(2).map((line) => {
    const cells = splitTableRow(line)
    const row: Record<string, string> = {}
    for (const [index, header] of headers.entries()) {
      row[header] = cells[index] ?? ""
    }
    return row
  })

  return { headers, rows }
}

export function tableToKeyValue(
  table: MarkdownTable | null,
): Record<string, string> {
  if (!table) return {}
  const fieldHeader = table.headers.find(
    (header) => normalizeHeader(header) === "campo",
  )
  const valueHeader = table.headers.find(
    (header) => normalizeHeader(header) === "valor",
  )
  if (!fieldHeader || !valueHeader) return {}

  const values: Record<string, string> = {}
  for (const row of table.rows) {
    const key = row[fieldHeader]?.trim()
    if (!key) continue
    values[key] = row[valueHeader]?.trim() ?? ""
  }
  return values
}

export function routingTableToKeyValue(
  table: MarkdownTable | null,
): Record<string, string> {
  if (!table) return {}
  const fieldHeader = table.headers.find(
    (header) => normalizeHeader(header) === "campo",
  )
  const valueHeader = table.headers.find(
    (header) => normalizeHeader(header) === "valor",
  )
  if (!fieldHeader || !valueHeader) return {}

  const values: Record<string, string> = {}
  for (const row of table.rows) {
    const key = row[fieldHeader]?.trim()
    if (!key) continue
    values[key] = row[valueHeader]?.trim() ?? ""
  }
  return values
}

export function renderMarkdownTable(
  headers: string[],
  rows: Array<Array<string | number>>,
): string {
  const safeRows = rows.length > 0 ? rows : [headers.map(() => "N/A")]
  const lines = [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...safeRows.map((row) => `| ${row.map(formatCell).join(" | ")} |`),
  ]
  return lines.join("\n")
}

function splitTableRow(line: string): string[] {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim())
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase()
}

function formatCell(value: string | number): string {
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, "<br>")
}
