import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { basename, dirname, join, relative } from "node:path"
import type { ProposalPackage, RouterConfig } from "@/router-engine"
import { listProposalIds, loadProposalPackage } from "@/router-engine"
import {
  extractSection,
  parseFirstMarkdownTable,
  renderMarkdownTable,
  tableToKeyValue,
} from "@/router-engine/markdown"
import {
  assertVaultRoot,
  proposalPackagePath,
  queuePath,
  resolveRouterConfig,
  resolveVaultPath,
  toVaultRelative,
} from "@/router-engine/paths"
import type { CanonicalEditorOptions, CanonicalEditPlan } from "./types"

interface DraftMapping {
  readonly sourcePath: string
  readonly destinationFile: string
  readonly content: string
}

type CanonicalFileAction = "create" | "update"

interface PlannedCanonicalFile {
  readonly sourcePath: string
  readonly destinationPath: string
  readonly content: string
  readonly action: CanonicalFileAction
}

interface MaterialMapping {
  readonly sourcePath: string
  readonly destinationPath: string
  readonly action: "copy"
  readonly preserveStructure: boolean
  readonly type: string
  readonly note: string
}

type SupportedProposalType = "PROP-DOC" | "PROP-DVC" | "PROP-DOL"

const SUPPORTED_PROPOSAL_TYPES: readonly SupportedProposalType[] = [
  "PROP-DOC",
  "PROP-DVC",
  "PROP-DOL",
]

export function applyCanonicalProposal(
  proposalId: string,
  options: CanonicalEditorOptions = {},
): CanonicalEditPlan {
  const config = resolveRouterConfig(options)
  assertVaultRoot(config)
  const proposal = loadProposalPackage(
    config,
    proposalId,
    "03 Approved for Editor",
  )
  assertApprovedForEditor(config, proposal)

  const targetCanonicalId = requiredField(
    proposal.identification["Target canonico ID"],
    "Missing Target canonico ID.",
  )
  const targetCanonicalPath = resolveTargetCanonicalPath(config, proposal)
  const draftMappings = loadDraftMappings(config, proposal)
  const materialMappings = loadMaterialMappings(
    config,
    proposal,
    targetCanonicalPath,
  )
  const canonicalFiles = planCanonicalFiles(
    config,
    proposal,
    targetCanonicalPath,
    draftMappings,
  )
  const appliedRecordPath = join(
    proposalPackagePath(config, proposal.id, "04 Applied"),
    "applied_record.md",
  )

  const dryRun = options.write !== true
  if (!dryRun) {
    withCanonicalEditorLock(config, proposal.id, () => {
      writeCanonicalFiles(canonicalFiles)
      copyCanonicalMaterials(materialMappings)
      moveProposalToApplied(config, proposal)
      atomicWriteFile(
        appliedRecordPath,
        renderAppliedRecord(config, proposal, {
          targetCanonicalId,
          targetCanonicalPath,
          canonicalFiles,
          materialMappings,
        }),
      )
    })
  }

  return {
    proposalId: proposal.id,
    targetCanonicalId,
    targetCanonicalPath: toVaultRelative(config, targetCanonicalPath),
    sourceQueue: "03 Approved for Editor",
    destinationQueue: "04 Applied",
    dryRun,
    canonicalFiles: canonicalFiles.map((file) => ({
      sourcePath: toVaultRelative(config, file.sourcePath),
      destinationPath: toVaultRelative(config, file.destinationPath),
      action: file.action,
    })),
    canonicalMaterials: materialMappings.map((material) => ({
      sourcePath: toVaultRelative(config, material.sourcePath),
      destinationPath: toVaultRelative(config, material.destinationPath),
      action: "copy",
    })),
    appliedRecordPath: toVaultRelative(config, appliedRecordPath),
    moved: !dryRun,
  }
}

export function applyAllApprovedCanonicalProposals(
  options: CanonicalEditorOptions = {},
): CanonicalEditPlan[] {
  const config = resolveRouterConfig(options)
  assertVaultRoot(config)
  const approvedRoot = queuePath(config, "03 Approved for Editor")
  if (!existsSync(approvedRoot)) return []
  return listProposalIds(config, "03 Approved for Editor").map((proposalId) =>
    applyCanonicalProposal(proposalId, options),
  )
}

function assertApprovedForEditor(
  config: RouterConfig,
  proposal: ProposalPackage,
): void {
  const type = proposal.identification.Tipo
  const changeType = proposal.identification["Tipo de cambio"]
  if (!isSupportedProposalType(type)) {
    throw new Error(
      `Canonical Editor only supports ${SUPPORTED_PROPOSAL_TYPES.join(", ")}. Found: ${type}`,
    )
  }
  if (
    changeType !== "new" &&
    !((type === "PROP-DVC" || type === "PROP-DOL") && changeType === "enrich")
  ) {
    throw new Error(
      `Canonical Editor only supports new canonicals and DVC/DOL enrich proposals. Found: ${type} ${changeType}`,
    )
  }

  const routerDecision = readIdentification(
    join(proposal.packagePath, "router_decision.md"),
  )
  const decisionRecord = readIdentification(
    join(proposal.packagePath, "decision_record.md"),
  )
  const routerApproved = routerDecision.Estado === "approved_for_editor"
  const humanApproved =
    decisionRecord.Estado === "approved" &&
    decisionRecord["Next queue"] === "03 Approved for Editor"
  if (!routerApproved && !humanApproved) {
    throw new Error(
      `Proposal is not approved for editor by router_decision.md or decision_record.md: ${proposal.id}`,
    )
  }

  const targetPath = resolveTargetCanonicalPath(config, proposal)
  assertInsideVault(config, targetPath)
  if (changeType === "new" && existsSync(targetPath)) {
    throw new Error(
      `New canonical target already exists: ${toVaultRelative(config, targetPath)}. Use an enrich proposal or repair the existing canonical before applying.`,
    )
  }
  if (changeType === "enrich" && !existsSync(targetPath)) {
    throw new Error(
      `Enrich target canonical does not exist: ${toVaultRelative(config, targetPath)}`,
    )
  }
}

function readIdentification(path: string): Record<string, string> {
  if (!existsSync(path)) return {}
  return tableToKeyValue(
    parseFirstMarkdownTable(
      extractSection(readFileSync(path, "utf8"), "Identificacion"),
    ),
  )
}

function resolveTargetCanonicalPath(
  config: RouterConfig,
  proposal: ProposalPackage,
): string {
  const raw =
    proposal.identification["Target canonico path"] ||
    proposal.routingFields["Target canonico path"]
  const resolvedRaw = resolveVaultPath(
    config,
    requiredField(raw, "Missing target canonical path."),
  )
  const resolved = basename(resolvedRaw).endsWith(".md")
    ? dirname(resolvedRaw)
    : resolvedRaw
  assertInsideVault(config, resolved)
  return resolved
}

function loadDraftMappings(
  config: RouterConfig,
  proposal: ProposalPackage,
): DraftMapping[] {
  const table = parseFirstMarkdownTable(
    extractSection(proposal.markdown, "Drafts usados"),
  )
  if (!table) {
    if (
      proposal.identification.Tipo === "PROP-DOL" &&
      proposal.identification["Tipo de cambio"] === "enrich"
    ) {
      return []
    }
    throw new Error(`Missing Drafts usados table: ${proposal.id}`)
  }
  const sourceHeader = table.headers.find(
    (header) => header.toLowerCase() === "ubicacion",
  )
  const destinationHeader = table.headers.find(
    (header) => header.toLowerCase() === "archivo canonico destino",
  )
  if (!sourceHeader || !destinationHeader) {
    throw new Error(
      "Drafts usados must include Ubicacion and Archivo canonico destino.",
    )
  }

  return table.rows.map((row) => {
    const sourcePath = resolveVaultPath(
      config,
      requiredField(row[sourceHeader], "Missing draft source path."),
    )
    if (!existsSync(sourcePath)) {
      throw new Error(
        `Draft source does not exist: ${toVaultRelative(config, sourcePath)}`,
      )
    }
    const destinationFile = parseDestinationPath(
      requiredField(
        stripTicks(row[destinationHeader]),
        "Missing canonical destination filename.",
      ),
    )
    return {
      sourcePath,
      destinationFile,
      content: readFileSync(sourcePath, "utf8"),
    }
  })
}

function loadMaterialMappings(
  config: RouterConfig,
  proposal: ProposalPackage,
  targetCanonicalPath: string,
): MaterialMapping[] {
  const expectedCopyDestinations = loadExpectedCopyDestinations(
    config,
    proposal,
  )
  const table = parseFirstMarkdownTable(
    extractSection(proposal.markdown, "Materiales canonicos a copiar"),
  )
  if (!table) {
    if (expectedCopyDestinations.length > 0) {
      throw new Error(
        "Archivos canonicos esperados declares copy actions but Materiales canonicos a copiar is missing.",
      )
    }
    return []
  }
  const actionHeader = headerByName(table.headers, "accion")
  const sourceHeader = headerByName(table.headers, "origen en contribution")
  const destinationHeader = headerByName(
    table.headers,
    "destino canonico esperado",
  )
  const preserveHeader = headerByName(table.headers, "preservar estructura")
  const typeHeader = headerByName(table.headers, "tipo")
  const noteHeader = headerByName(table.headers, "nota")
  if (!actionHeader || !sourceHeader || !destinationHeader) {
    throw new Error(
      "Materiales canonicos a copiar must include Accion, Origen en contribution and Destino canonico esperado.",
    )
  }

  const mappings = table.rows.map((row) => {
    const rawAction = stripTicks(row[actionHeader]).toLowerCase()
    if (!rawAction.includes("copiar")) {
      throw new Error(`Unsupported material action: ${row[actionHeader]}`)
    }
    const sourcePath = resolveVaultPath(
      config,
      requiredField(row[sourceHeader], "Missing material source path."),
    )
    if (!existsSync(sourcePath)) {
      throw new Error(
        `Material source does not exist: ${toVaultRelative(config, sourcePath)}`,
      )
    }
    const destinationPath = resolveMaterialDestination(
      config,
      targetCanonicalPath,
      requiredField(row[destinationHeader], "Missing material destination."),
    )
    if (existsSync(destinationPath)) {
      throw new Error(
        `Canonical material destination already exists: ${toVaultRelative(config, destinationPath)}`,
      )
    }
    return {
      sourcePath,
      destinationPath,
      action: "copy" as const,
      preserveStructure:
        stripTicks(preserveHeader ? row[preserveHeader] : undefined)
          .toLowerCase()
          .trim() !== "no",
      type: stripTicks(typeHeader ? row[typeHeader] : undefined) || "material",
      note: stripTicks(noteHeader ? row[noteHeader] : undefined) || "N/A",
    }
  })

  const materialDestinations = new Set(
    mappings.map((mapping) => toVaultRelative(config, mapping.destinationPath)),
  )
  const expectedDestinationSet = new Set(expectedCopyDestinations)
  for (const expectedDestination of expectedCopyDestinations) {
    if (!materialDestinations.has(expectedDestination)) {
      throw new Error(
        `Expected copy destination is not declared in Materiales canonicos a copiar: ${expectedDestination}`,
      )
    }
  }
  for (const materialDestination of materialDestinations) {
    if (!expectedDestinationSet.has(materialDestination)) {
      throw new Error(
        `Material copy destination is missing from Archivos canonicos esperados: ${materialDestination}`,
      )
    }
  }

  return mappings
}

function loadExpectedCopyDestinations(
  config: RouterConfig,
  proposal: ProposalPackage,
): string[] {
  const table = parseFirstMarkdownTable(
    extractSection(proposal.markdown, "Archivos canonicos esperados"),
  )
  if (!table) return []
  const actionHeader = headerByName(table.headers, "accion")
  const pathHeader = headerByName(table.headers, "path esperado")
  if (!actionHeader || !pathHeader) return []
  return table.rows
    .filter((row) => stripTicks(row[actionHeader]).toLowerCase() === "copiar")
    .map((row) => {
      const path = resolveVaultPath(
        config,
        requiredField(row[pathHeader], "Missing expected copy path."),
      )
      assertInsideVault(config, path)
      return toVaultRelative(config, path)
    })
}

function loadExpectedFileActions(
  config: RouterConfig,
  proposal: ProposalPackage,
): Map<string, CanonicalFileAction> {
  const table = parseFirstMarkdownTable(
    extractSection(proposal.markdown, "Archivos canonicos esperados"),
  )
  const actions = new Map<string, CanonicalFileAction>()
  if (!table) return actions
  const actionHeader = headerByName(table.headers, "accion")
  const pathHeader = headerByName(table.headers, "path esperado")
  if (!actionHeader || !pathHeader) return actions

  for (const row of table.rows) {
    const action = normalizeExpectedFileAction(row[actionHeader])
    if (!action) continue
    const path = resolveVaultPath(
      config,
      requiredField(row[pathHeader], "Missing expected canonical file path."),
    )
    assertInsideVault(config, path)
    actions.set(toVaultRelative(config, path), action)
  }
  return actions
}

function normalizeExpectedFileAction(
  value: string | undefined,
): CanonicalFileAction | null {
  const action = stripTicks(value).toLowerCase()
  if (action === "crear") return "create"
  if (action === "modificar") return "update"
  return null
}

function resolveMaterialDestination(
  config: RouterConfig,
  targetCanonicalPath: string,
  rawDestination: string,
): string {
  const stripped = stripTicks(rawDestination)
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .trim()
  const targetRelative = toVaultRelative(config, targetCanonicalPath)
  const destinationRelative = stripped.startsWith(targetRelative)
    ? stripped
    : `${targetRelative.replace(/\/+$/, "")}/${parseRelativeMaterialPath(stripped)}`
  const destinationPath = resolveVaultPath(config, destinationRelative)
  assertInsideVault(config, destinationPath)
  return destinationPath
}

function parseRelativeMaterialPath(value: string): string {
  const stripped = value.replace(/^\/+/, "")
  const segments = stripped.split("/").filter(Boolean)
  if (
    segments.length === 0 ||
    stripped.startsWith("/") ||
    segments.some((segment) => segment === "." || segment === "..")
  ) {
    throw new Error(`Unsafe canonical material destination: ${value}`)
  }
  return segments.join("/")
}

function planCanonicalFiles(
  config: RouterConfig,
  proposal: ProposalPackage,
  targetCanonicalPath: string,
  draftMappings: DraftMapping[],
): PlannedCanonicalFile[] {
  const changeType = proposal.identification["Tipo de cambio"]
  const expectedFileActions = loadExpectedFileActions(config, proposal)
  return draftMappings.map((draft) => {
    assertNotModificationDraft(draft.sourcePath)
    const destinationPath = join(targetCanonicalPath, draft.destinationFile)
    assertInsideVault(config, destinationPath)
    const destinationRelative = toVaultRelative(config, destinationPath)

    if (changeType === "enrich") {
      assertSafeEnrichDestination(draft.destinationFile)
      const expectedAction = expectedFileActions.get(destinationRelative)
      if (!expectedAction) {
        throw new Error(
          `Enrich destination is missing from Archivos canonicos esperados: ${destinationRelative}`,
        )
      }
      const destinationExists = existsSync(destinationPath)
      const action: CanonicalFileAction = destinationExists
        ? "update"
        : "create"
      if (expectedAction !== action) {
        throw new Error(
          `Enrich expected action ${expectedAction} does not match destination state for ${destinationRelative}: ${action}`,
        )
      }
      if (isChangelogDestination(draft.destinationFile)) {
        return {
          sourcePath: draft.sourcePath,
          destinationPath,
          action,
          content: destinationExists
            ? renderChangelogUpdate(config, proposal, draft, destinationPath)
            : renderChangelog(config, proposal, draft),
        }
      }
      return {
        sourcePath: draft.sourcePath,
        destinationPath,
        action,
        content: renderCanonicalFromDraft(draft),
      }
    }

    if (destinationExists(destinationPath)) {
      throw new Error(
        `Canonical destination already exists: ${toVaultRelative(config, destinationPath)}`,
      )
    }
    return {
      sourcePath: draft.sourcePath,
      destinationPath,
      action: "create",
      content: isChangelogDestination(draft.destinationFile)
        ? renderChangelog(config, proposal, draft)
        : renderCanonicalFromDraft(draft),
    }
  })
}

function destinationExists(path: string): boolean {
  return existsSync(path)
}

function assertSafeEnrichDestination(destinationFile: string): void {
  if (!destinationFile.includes("/")) {
    throw new Error(
      `Enrich can only create or update nested files, not canonical root files: ${destinationFile}`,
    )
  }
}

function isChangelogDestination(destinationFile: string): boolean {
  return basename(destinationFile) === "changelog.md"
}

function assertNotModificationDraft(sourcePath: string): void {
  if (!basename(sourcePath).startsWith("modification_")) return
  throw new Error(
    `Modification drafts require a human-authored canonical patch before editor apply: ${sourcePath}`,
  )
}

function renderCanonicalFromDraft(draft: DraftMapping): string {
  return `${draft.content.trimEnd()}\n`
}

function renderChangelog(
  config: RouterConfig,
  proposal: ProposalPackage,
  draft: DraftMapping,
): string {
  return `# Changelog - ${proposal.identification["Target canonico ID"]}

## Identificacion
${renderMarkdownTable(
  ["Campo", "Valor"],
  [
    ["ID", proposal.identification["Target canonico ID"] ?? proposal.id],
    ["Tipo", "canonical"],
    ["Estado", "active"],
    ["Fecha creacion", config.today],
    ["Ultima actualizacion", config.today],
    ["Owner operativo", "Canonical Editor"],
    ["Capa", proposal.identification.Capa ?? "explicit_knowledge"],
    ["Canonical type", proposal.identification["Canonical type"] ?? "DOC"],
    ["Source proposal", proposal.id],
  ],
)}

## Contenido canonico
- ${config.today}: Canonico creado desde \`${proposal.id}\`.
- Draft fuente usado para notas/changelog: \`${toVaultRelative(config, draft.sourcePath)}\`.

## Evidencia fuente
${extractSection(proposal.markdown, "Evidencia usada") ?? "Pendiente"}

## Relaciones canonicas
${extractSection(proposal.markdown, "Canonicos relacionados") ?? "Pendiente"}

## Changelog
- ${config.today}: Aplicacion inicial aprobada por Canonical Editor.
`
}

function renderChangelogUpdate(
  config: RouterConfig,
  proposal: ProposalPackage,
  draft: DraftMapping,
  destinationPath: string,
): string {
  const existing = readFileSync(destinationPath, "utf8").trimEnd()
  return `${existing}

## ${config.today} - ${proposal.id}
- Canonico enriquecido desde \`${proposal.id}\`.
- Draft fuente usado para notas/changelog: \`${toVaultRelative(config, draft.sourcePath)}\`.
`
}

function renderAppliedRecord(
  config: RouterConfig,
  proposal: ProposalPackage,
  applied: {
    readonly targetCanonicalId: string
    readonly targetCanonicalPath: string
    readonly canonicalFiles: Array<{
      sourcePath: string
      destinationPath: string
      action: CanonicalFileAction
    }>
    readonly materialMappings: readonly MaterialMapping[]
  },
): string {
  const changeType = proposal.identification["Tipo de cambio"]
  const createdFiles = applied.canonicalFiles.filter(
    (file) => file.action === "create",
  )
  const modifiedFiles = applied.canonicalFiles.filter(
    (file) => file.action === "update",
  )
  const summary =
    changeType === "enrich"
      ? `Se aplico \`${proposal.id}\` enriqueciendo el canonico \`${applied.targetCanonicalId}\` en \`${toVaultRelative(config, applied.targetCanonicalPath)}\`.`
      : `Se aplico \`${proposal.id}\` creando el canonico \`${applied.targetCanonicalId}\` en \`${toVaultRelative(config, applied.targetCanonicalPath)}\`.`

  return `# Applied Record - ${proposal.id}

## Identificacion
${renderMarkdownTable(
  ["Campo", "Valor"],
  [
    ["ID", `APPLY-${proposal.id}-${config.today}`],
    ["Tipo", "applied_record"],
    ["Estado", "applied_full"],
    ["Fecha creacion", config.today],
    ["Ultima actualizacion", config.today],
    ["Owner operativo", "Canonical Editor"],
    ["Proposal", proposal.id],
    ["Applied at", config.today],
  ],
)}

## Resumen de aplicacion
${summary}

## Archivos canonicos creados
${renderMarkdownTable(
  ["Archivo", "Fuente"],
  createdFiles.map((file) => [
    toVaultRelative(config, file.destinationPath),
    toVaultRelative(config, file.sourcePath),
  ]),
)}

## Archivos canonicos modificados
${renderMarkdownTable(
  ["Archivo", "Fuente"],
  modifiedFiles.map((file) => [
    toVaultRelative(config, file.destinationPath),
    toVaultRelative(config, file.sourcePath),
  ]),
)}

## Changelogs actualizados
${renderMarkdownTable(
  ["Archivo", "Accion"],
  applied.canonicalFiles
    .filter((file) => file.destinationPath.endsWith("/changelog.md"))
    .map((file) => [
      toVaultRelative(config, file.destinationPath),
      file.action === "create" ? "Creado" : "Modificado",
    ]),
)}

## Materiales canonicos copiados
${renderMarkdownTable(
  ["Destino", "Fuente", "Tipo", "Nota"],
  applied.materialMappings.map((material) => [
    toVaultRelative(config, material.destinationPath),
    toVaultRelative(config, material.sourcePath),
    material.type,
    material.note,
  ]),
)}

## Materiales declarados no copiados
N/A

## Cambios no aplicados
N/A

## Validaciones realizadas
- PROP estaba en \`02 Proposals/03 Approved for Editor\`.
- PROP estaba aprobada por \`router_decision.md\` o \`decision_record.md\`.
- El target canonico resuelve dentro de Benford Vault V3.
- Todos los drafts usados existen.
- Todos los materiales declarados para copiar existen.
- Los destinos canonicos declarados coincidian con la accion esperada antes de escribir.

## Notas
Canonical Editor aplico los archivos declarados en \`Drafts usados\` y los materiales declarados en \`Materiales canonicos a copiar\` para el tipo de PROP soportado.
`
}

function isSupportedProposalType(
  value: string | undefined,
): value is SupportedProposalType {
  return SUPPORTED_PROPOSAL_TYPES.includes(value as SupportedProposalType)
}

function writeCanonicalFiles(
  files: Array<{ destinationPath: string; content: string }>,
): void {
  for (const file of files) atomicWriteFile(file.destinationPath, file.content)
}

function copyCanonicalMaterials(materials: readonly MaterialMapping[]): void {
  for (const material of materials) {
    mkdirSync(dirname(material.destinationPath), { recursive: true })
    cpSync(material.sourcePath, material.destinationPath, {
      recursive: true,
      errorOnExist: true,
      force: false,
    })
    if (!existsSync(material.destinationPath)) {
      throw new Error(
        `Material copy did not produce destination: ${material.destinationPath}`,
      )
    }
  }
}

function moveProposalToApplied(
  config: RouterConfig,
  proposal: ProposalPackage,
): void {
  const destinationPath = proposalPackagePath(config, proposal.id, "04 Applied")
  if (existsSync(destinationPath)) {
    throw new Error(
      `Applied destination already exists: ${toVaultRelative(config, destinationPath)}`,
    )
  }
  mkdirSync(queuePath(config, "04 Applied"), { recursive: true })
  renameSync(proposal.packagePath, destinationPath)
}

function atomicWriteFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true })
  const tmpPath = `${path}.tmp-${process.pid}-${Date.now()}`
  writeFileSync(tmpPath, content, "utf8")
  renameSync(tmpPath, path)
}

function withCanonicalEditorLock<T>(
  config: RouterConfig,
  proposalId: string,
  fn: () => T,
): T {
  const locksDir = join(config.runtimeDir, "locks")
  mkdirSync(locksDir, { recursive: true })
  const lockPath = join(locksDir, `${proposalId}.canonical-editor.lock`)
  if (existsSync(lockPath)) {
    throw new Error(`Canonical Editor lock is active: ${proposalId}`)
  }
  writeFileSync(lockPath, `${process.pid}\n${new Date().toISOString()}\n`, {
    flag: "wx",
  })
  try {
    return fn()
  } finally {
    rmSync(lockPath, { force: true })
  }
}

function assertInsideVault(config: RouterConfig, path: string): void {
  const rel = relative(config.vaultRoot, path)
  if (rel.startsWith("..") || rel === "") {
    throw new Error(`Path must stay inside Benford Vault V3: ${path}`)
  }
}

function requiredField(value: string | undefined, message: string): string {
  const stripped = stripTicks(value)
  if (!stripped || stripped === "Pendiente") throw new Error(message)
  return stripped
}

function stripTicks(value: string | undefined): string {
  return (value ?? "").trim().replace(/^`+|`+$/g, "")
}

function headerByName(
  headers: readonly string[],
  name: string,
): string | undefined {
  return headers.find((header) => header.trim().toLowerCase() === name)
}

function parseDestinationPath(value: string): string {
  const stripped = stripTicks(value)
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .trim()
  const match = stripped.match(
    /[A-Za-z0-9_. ()-]+(?:\/[A-Za-z0-9_. ()-]+)*\.md\b/,
  )
  if (!match?.[0]) {
    throw new Error(`Cannot parse canonical destination filename: ${value}`)
  }
  const destinationPath = match[0]
  const segments = destinationPath.split("/")
  if (
    destinationPath.startsWith("/") ||
    segments.some((segment) => segment === "." || segment === ".." || !segment)
  ) {
    throw new Error(`Unsafe canonical destination filename: ${value}`)
  }
  return destinationPath
}
