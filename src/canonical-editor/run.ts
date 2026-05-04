import {
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
  const canonicalFiles = planCanonicalFiles(
    config,
    proposal,
    targetCanonicalId,
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
      moveProposalToApplied(config, proposal)
      atomicWriteFile(
        appliedRecordPath,
        renderAppliedRecord(config, proposal, {
          targetCanonicalId,
          targetCanonicalPath,
          canonicalFiles,
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
      action: "create",
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
  if (type !== "PROP-DOC") {
    throw new Error(
      `Canonical Editor V1 only supports PROP-DOC. Found: ${type}`,
    )
  }
  if (changeType !== "new") {
    throw new Error(
      `Canonical Editor V1 only supports new canonicals. Found: ${changeType}`,
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
  if (!table) throw new Error(`Missing Drafts usados table: ${proposal.id}`)
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
    const destinationFile = parseDestinationFile(
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

function planCanonicalFiles(
  config: RouterConfig,
  proposal: ProposalPackage,
  targetCanonicalId: string,
  targetCanonicalPath: string,
  draftMappings: DraftMapping[],
): Array<{ sourcePath: string; destinationPath: string; content: string }> {
  return draftMappings.map((draft) => {
    const destinationPath = join(targetCanonicalPath, draft.destinationFile)
    assertInsideVault(config, destinationPath)
    if (existsSync(destinationPath)) {
      throw new Error(
        `Canonical destination already exists: ${toVaultRelative(config, destinationPath)}`,
      )
    }
    return {
      sourcePath: draft.sourcePath,
      destinationPath,
      content:
        draft.destinationFile === "changelog.md"
          ? renderChangelog(config, proposal, draft)
          : renderCanonicalFromDraft(
              config,
              proposal,
              targetCanonicalId,
              draft,
            ),
    }
  })
}

function renderCanonicalFromDraft(
  config: RouterConfig,
  proposal: ProposalPackage,
  targetCanonicalId: string,
  draft: DraftMapping,
): string {
  const title = `# ${targetCanonicalId} - ${draft.destinationFile}`
  const body = stripFirstHeadingAndIdentification(draft.content)
  return `${title}

## Objetivo
Crear el archivo canonico \`${draft.destinationFile}\` para \`${targetCanonicalId}\` desde la PROP aprobada \`${proposal.id}\`.

## Justificacion
${proposal.sections.has("Cambio propuesto") ? (extractSection(proposal.markdown, "Cambio propuesto") ?? "").trim() : `Aplicacion aprobada de ${proposal.id}.`}

## Identificacion
${renderMarkdownTable(
  ["Campo", "Valor"],
  [
    ["ID", targetCanonicalId],
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
${body}

## Evidencia fuente
${extractSection(proposal.markdown, "Evidencia usada") ?? "Pendiente"}

## Relaciones canonicas
${extractSection(proposal.markdown, "Canonicos relacionados") ?? "Pendiente"}

## Changelog
- ${config.today}: Creado desde \`${proposal.id}\` por Canonical Editor.
`
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

function renderAppliedRecord(
  config: RouterConfig,
  proposal: ProposalPackage,
  applied: {
    readonly targetCanonicalId: string
    readonly targetCanonicalPath: string
    readonly canonicalFiles: Array<{
      sourcePath: string
      destinationPath: string
    }>
  },
): string {
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
Se aplico \`${proposal.id}\` creando el canonico \`${applied.targetCanonicalId}\` en \`${toVaultRelative(config, applied.targetCanonicalPath)}\`.

## Archivos canonicos creados
${renderMarkdownTable(
  ["Archivo", "Fuente"],
  applied.canonicalFiles.map((file) => [
    toVaultRelative(config, file.destinationPath),
    toVaultRelative(config, file.sourcePath),
  ]),
)}

## Archivos canonicos modificados
N/A

## Changelogs actualizados
${renderMarkdownTable(
  ["Archivo", "Accion"],
  applied.canonicalFiles
    .filter((file) => file.destinationPath.endsWith("/changelog.md"))
    .map((file) => [toVaultRelative(config, file.destinationPath), "Creado"]),
)}

## Cambios no aplicados
N/A

## Validaciones realizadas
- PROP estaba en \`02 Proposals/03 Approved for Editor\`.
- PROP estaba aprobada por \`router_decision.md\` o \`decision_record.md\`.
- El target canonico resuelve dentro de Benford Vault V3.
- Todos los drafts usados existen.
- Los destinos canonicos no existian antes de escribir.

## Notas
Canonical Editor V1 aplico solamente archivos DOC declarados en \`Drafts usados\`.
`
}

function stripFirstHeadingAndIdentification(content: string): string {
  const withoutHeading = content.replace(/^# .+?\n+/, "")
  return withoutHeading
    .replace(/## Identificacion\n[\s\S]*?(?=\n## |\n$)/, "")
    .trim()
}

function writeCanonicalFiles(
  files: Array<{ destinationPath: string; content: string }>,
): void {
  for (const file of files) atomicWriteFile(file.destinationPath, file.content)
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

function parseDestinationFile(value: string): string {
  const match = stripTicks(value).match(/[A-Za-z0-9_.-]+\.md\b/)
  if (!match?.[0]) {
    throw new Error(`Cannot parse canonical destination filename: ${value}`)
  }
  return match[0]
}
