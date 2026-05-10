import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs"
import { basename, dirname, join } from "node:path"
import { listProposalIds } from "@/router-engine/load-proposal"
import {
  extractSection,
  parseFirstMarkdownTable,
  renderMarkdownTable,
  tableToKeyValue,
} from "@/router-engine/markdown"
import { proposalPackagePath, toVaultRelative } from "@/router-engine/paths"
import type { ProposalQueue, RouterConfig } from "@/router-engine/types"
import type { ProposalGenerationResult } from "./types"

export interface ContributionPackage {
  readonly id: string
  readonly path: string
  readonly mapPath: string
  readonly markdown: string
  readonly identification: Record<string, string>
}

export interface ContributionAutomationDiagnostic {
  readonly id: string
  readonly path: string
  readonly mapPath: string
  readonly automationState: string
  readonly supportedOutputs: string[]
  readonly pendingOutputs: string[]
  readonly ready: boolean
  readonly reason?: string
}

interface SupportedDraftPackage {
  readonly canonicalType: "DOC" | "DVC" | "DOL"
  readonly canonicalId: string
  readonly sourceCanonicalId: string
  readonly path: string
  readonly files: {
    readonly spec?: string
    readonly schema?: string
    readonly rawSchema?: string
    readonly parserConfig?: string
    readonly documentTranscript?: string
    readonly notes?: string
  }
  readonly variants?: readonly DvcVariantDraft[]
}

interface CanonicalMaterial {
  readonly action: "copiar carpeta" | "copiar archivo"
  readonly sourcePath: string
  readonly destinationPath: string
  readonly sourceName: string
  readonly sourceOwner: string
  readonly type: string
  readonly preserveStructure: "si" | "no"
  readonly note: string
}

interface DvcVariantDraft {
  readonly name: string
  readonly path: string
  readonly mode: "full" | "modification"
  readonly files: {
    readonly spec?: string
    readonly rawSchema?: string
    readonly parserConfig?: string
    readonly modificationSpec?: string
    readonly modificationSchema?: string
    readonly modificationParser?: string
  }
}

const QUEUES: readonly ProposalQueue[] = [
  "01 Draft",
  "02 Needs Human Decision",
  "03 Approved for Editor",
  "04 Applied",
  "05 Rejected",
]

export function listPendingContributionPackages(
  config: RouterConfig,
): ContributionPackage[] {
  return inspectContributionPackages(config)
    .filter((diagnostic) => diagnostic.ready)
    .map((diagnostic) => readReadyContributionPackage(diagnostic.mapPath))
}

export function inspectContributionPackages(
  config: RouterConfig,
): ContributionAutomationDiagnostic[] {
  const root = join(config.vaultRoot, "01 Contribuciones")
  if (!existsSync(root)) return []
  const results: ContributionAutomationDiagnostic[] = []
  const stack = [root]

  while (stack.length > 0) {
    const current = stack.pop()
    if (!current) continue
    const entries = readdirSync(current, { withFileTypes: true })
    const hasContributionMap = entries.some(
      (entry) => entry.isFile() && entry.name === "contribution_map.md",
    )
    if (hasContributionMap) {
      const diagnostic = inspectContributionPackage(
        config,
        join(current, "contribution_map.md"),
      )
      if (diagnostic) results.push(diagnostic)
      continue
    }
    for (const entry of entries) {
      if (entry.isDirectory()) stack.push(join(current, entry.name))
    }
  }

  return results.sort((a, b) => a.id.localeCompare(b.id))
}

export function generateProposalForContribution(
  config: RouterConfig,
  contribution: ContributionPackage,
  options: { readonly write?: boolean } = {},
): ProposalGenerationResult {
  const draftPackage = findPendingDraftPackage(config, contribution)
  if (!draftPackage) {
    throw new Error(
      `No pending supported DOC, DVC or DOL draft package found for ${contribution.id}`,
    )
  }

  const proposalId = nextProposalId(config)
  const proposalRoot = proposalPackagePath(config, proposalId, "01 Draft")
  const proposalPath = join(proposalRoot, "proposal.md")
  const proposalMarkdown = renderProposal(config, contribution, draftPackage, {
    proposalId,
  })
  const dryRun = options.write !== true

  if (!dryRun) {
    if (existsSync(proposalRoot)) {
      throw new Error(`Proposal destination already exists: ${proposalId}`)
    }
    mkdirSync(proposalRoot, { recursive: true })
    writeFileSync(proposalPath, proposalMarkdown, "utf8")
    updateContributionMap(config, contribution, proposalId, draftPackage)
  }

  return {
    contributionId: contribution.id,
    proposalId,
    proposalPath: toVaultRelative(config, proposalPath),
    targetCanonicalId: draftPackage.canonicalId,
    canonicalType: draftPackage.canonicalType,
    proposalType: `PROP-${draftPackage.canonicalType}`,
    dryRun,
  }
}

function inspectContributionPackage(
  config: RouterConfig,
  mapPath: string,
): ContributionAutomationDiagnostic | null {
  const markdown = readFileSync(mapPath, "utf8")
  const identification = tableToKeyValue(
    parseFirstMarkdownTable(extractSection(markdown, "Identificacion")),
  )
  const fallbackId = basename(dirname(mapPath))
  const id = stripTicks(identification.ID) || fallbackId
  if (!id.startsWith("CONTRIBUTION-") || id.includes("0000-template")) {
    return null
  }

  const contribution = {
    id,
    path: dirname(mapPath),
    mapPath,
    markdown,
    identification,
  }
  const automationState = automationReadyState(identification) || "missing"
  const supportedDraftPackages = findSupportedDraftPackages(
    config,
    contribution,
  )
  const pendingDraftPackages = supportedDraftPackages.filter(
    (draftPackage) =>
      !hasGeneratedProposalForTarget(
        config,
        contribution.id,
        draftPackage.canonicalId,
        contribution.markdown,
      ),
  )
  const supportedOutputs = supportedDraftPackages.map(
    (draftPackage) => draftPackage.sourceCanonicalId,
  )
  const pendingOutputs = pendingDraftPackages.map(
    (draftPackage) => draftPackage.sourceCanonicalId,
  )
  const missingDvcSourceMapOutputs: string[] = []
  const ready = automationState === "ready" && pendingOutputs.length > 0
  return {
    id,
    path: contribution.path,
    mapPath,
    automationState,
    supportedOutputs,
    pendingOutputs,
    ready,
    reason: contributionSkipReason({
      automationState,
      supportedOutputs,
      pendingOutputs,
      missingDvcSourceMapOutputs,
    }),
  }
}

function readReadyContributionPackage(mapPath: string): ContributionPackage {
  const markdown = readFileSync(mapPath, "utf8")
  const identification = tableToKeyValue(
    parseFirstMarkdownTable(extractSection(markdown, "Identificacion")),
  )
  const fallbackId = basename(dirname(mapPath))
  const id = stripTicks(identification.ID) || fallbackId
  return {
    id,
    path: dirname(mapPath),
    mapPath,
    markdown,
    identification,
  }
}

function automationReadyState(identification: Record<string, string>): string {
  return stripTicks(
    identification["Estado automation"] ??
      identification["Automation estado"] ??
      identification["Automation status"],
  ).toLowerCase()
}

function contributionSkipReason(options: {
  readonly automationState: string
  readonly supportedOutputs: readonly string[]
  readonly pendingOutputs: readonly string[]
  readonly missingDvcSourceMapOutputs: readonly string[]
}): string | undefined {
  if (options.automationState === "missing") {
    return "missing Estado automation in ## Identificacion"
  }
  if (options.automationState !== "ready") {
    return `Estado automation is ${options.automationState}`
  }
  if (options.pendingOutputs.length > 0) return undefined
  if (options.supportedOutputs.length === 0) {
    return "no supported DOC, DVC or DOL outputs found"
  }
  return "supported outputs already have generated proposals"
}

function hasGeneratedProposalForTarget(
  config: RouterConfig,
  contributionId: string,
  targetCanonicalId: string,
  contributionMarkdown: string,
): boolean {
  const proposals = extractSection(contributionMarkdown, "Proposals generadas")
  if (proposals) {
    const table = parseFirstMarkdownTable(proposals)
    const hasProposalRow = /\|\s*PROP-(?:[A-Z]+-)?\d+\b/.test(proposals)
    const targetHeader = table?.headers.find(
      (header) => header.toLowerCase() === "target",
    )
    if (table && targetHeader) {
      if (
        table.rows.some(
          (row) => stripTicks(row[targetHeader]) === targetCanonicalId,
        )
      )
        return true
    } else if (hasProposalRow) {
      return true
    }
  }

  return QUEUES.some((queue) =>
    listProposalIds(config, queue).some((proposalId) => {
      const path = join(
        proposalPackagePath(config, proposalId, queue),
        "proposal.md",
      )
      return (
        existsSync(path) &&
        proposalReferencesGeneratedTarget(
          readFileSync(path, "utf8"),
          contributionId,
          targetCanonicalId,
        )
      )
    }),
  )
}

function proposalReferencesGeneratedTarget(
  proposalMarkdown: string,
  contributionId: string,
  targetCanonicalId: string,
): boolean {
  return (
    exactTokenMatch(proposalMarkdown, contributionId) &&
    proposalMarkdown.includes(targetCanonicalId)
  )
}

function exactTokenMatch(content: string, token: string): boolean {
  return new RegExp(
    `(^|[^A-Za-z0-9-])${escapeRegExp(token)}(?=$|[^A-Za-z0-9-])`,
  ).test(content)
}

function findPendingDraftPackage(
  config: RouterConfig,
  contribution: ContributionPackage,
): SupportedDraftPackage | null {
  return (
    findSupportedDraftPackages(config, contribution).find(
      (draftPackage) =>
        !hasGeneratedProposalForTarget(
          config,
          contribution.id,
          draftPackage.canonicalId,
          contribution.markdown,
        ),
    ) ?? null
  )
}

function findSupportedDraftPackages(
  config: RouterConfig,
  contribution: Pick<ContributionPackage, "path">,
): SupportedDraftPackage[] {
  const explicitRoot = join(
    contribution.path,
    "skill_outputs/explicit_knowledge",
  )
  if (!existsSync(explicitRoot)) return []
  return readdirSync(explicitRoot, { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && /^(?:DOC|DVC|DOL)-/.test(entry.name),
    )
    .map((entry) => join(explicitRoot, entry.name))
    .sort()
    .map((path) => readSupportedDraftPackage(config, path))
    .filter((draftPackage): draftPackage is SupportedDraftPackage =>
      Boolean(draftPackage),
    )
}

function readSupportedDraftPackage(
  config: RouterConfig,
  path: string,
): SupportedDraftPackage | null {
  const sourceCanonicalId = basename(path)
  const canonicalType = sourceCanonicalId.split("-")[0]
  if (
    canonicalType !== "DOC" &&
    canonicalType !== "DVC" &&
    canonicalType !== "DOL"
  ) {
    return null
  }

  const canonicalId =
    canonicalType === "DVC"
      ? resolveDvcTargetCanonicalId(config, sourceCanonicalId)
      : sourceCanonicalId
  const spec = resolveDraftOrCopyThrough(path, "spec")
  const schema = resolveDraftOrCopyThrough(path, "schema")
  const rawSchema = resolveDraftOrCopyThrough(path, "raw_schema")
  const parserConfig = resolveDraftOrCopyThrough(path, "parser_config")
  const documentTranscript = resolveDraftOrCopyThrough(
    path,
    "document_transcript",
  )
  const notes = join(path, "notes.md")
  const files = {
    spec,
    schema,
    rawSchema,
    parserConfig,
    documentTranscript,
    notes: existsSync(notes) ? notes : undefined,
  }

  if (canonicalType === "DOC") {
    if (
      !files.spec ||
      !files.schema ||
      !files.parserConfig ||
      !draftPackageMatchesLiveTemplate(config, canonicalType, path)
    ) {
      return null
    }
    return { canonicalType, canonicalId, sourceCanonicalId, path, files }
  }

  if (canonicalType === "DVC") {
    const variants = findDvcVariantDrafts(config, canonicalId, path)
    if (variants.length === 0) return null
    if (!draftPackageMatchesLiveTemplate(config, canonicalType, path)) {
      return null
    }
    return {
      canonicalType,
      canonicalId,
      sourceCanonicalId,
      path,
      files,
      variants,
    }
  }

  if (
    !files.spec ||
    !files.documentTranscript ||
    !draftPackageMatchesLiveTemplate(config, canonicalType, path)
  ) {
    return null
  }
  return { canonicalType, canonicalId, sourceCanonicalId, path, files }
}

function resolveDraftOrCopyThrough(
  root: string,
  canonicalName: string,
): string | undefined {
  const draft = join(root, `${canonicalName}_draft.md`)
  if (existsSync(draft)) return draft
  const copyThrough = join(root, `${canonicalName}.md`)
  return existsSync(copyThrough) ? copyThrough : undefined
}

function resolveDvcTargetCanonicalId(
  config: RouterConfig,
  sourceCanonicalId: string,
): string {
  const dvcRoot = join(
    config.vaultRoot,
    "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente",
  )
  if (!existsSync(dvcRoot)) return sourceCanonicalId
  const existing = readdirSync(dvcRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("DVC-"))
    .map((entry) => entry.name)
    .filter(
      (canonicalId) =>
        sourceCanonicalId === canonicalId ||
        sourceCanonicalId.startsWith(`${canonicalId}-`),
    )
    .sort((a, b) => b.length - a.length)
  return existing[0] ?? sourceCanonicalId
}

function draftPackageMatchesLiveTemplate(
  config: RouterConfig,
  canonicalType: "DOC" | "DVC" | "DOL",
  outputPath: string,
): boolean {
  const templateRoot = liveTemplateRoot(config, canonicalType)
  if (!existsSync(templateRoot)) return true

  switch (canonicalType) {
    case "DOC":
      return (
        hasFileForTemplate(outputPath, templateRoot, "spec") &&
        hasFileForTemplate(outputPath, templateRoot, "schema") &&
        hasFileForTemplate(outputPath, templateRoot, "parser_config")
      )
    case "DOL":
      return (
        hasFileForTemplate(outputPath, templateRoot, "spec") &&
        hasFileForTemplate(outputPath, templateRoot, "document_transcript")
      )
    case "DVC":
      return dvcDraftPackageMatchesLiveTemplate(outputPath, templateRoot)
  }
}

function liveTemplateRoot(
  config: RouterConfig,
  canonicalType: "DOC" | "DVC" | "DOL",
): string {
  const base = join(
    config.vaultRoot,
    "05 Benford Brain IMSS Mexico/01 Explicit Knowledge",
  )
  switch (canonicalType) {
    case "DOC":
      return join(base, "DOC Documentos y Ejemplos/DOC-0000_template")
    case "DVC":
      return join(base, "DVC Documentos Variables Cliente/DVC-0000_template")
    case "DOL":
      return join(base, "DOL Documentos de Leyes/DOL-0000_template")
  }
}

function hasFileForTemplate(
  outputRoot: string,
  templateRoot: string,
  canonicalName: string,
): boolean {
  const templatePath = join(templateRoot, `${canonicalName}.md`)
  if (!isUsableTemplateFile(templatePath)) return true
  return Boolean(resolveDraftOrCopyThrough(outputRoot, canonicalName))
}

function dvcDraftPackageMatchesLiveTemplate(
  outputRoot: string,
  templateRoot: string,
): boolean {
  if (
    isUsableTemplateFile(join(templateRoot, "spec.md")) === false &&
    (existsSync(join(outputRoot, "spec_draft.md")) ||
      existsSync(join(outputRoot, "spec.md")))
  ) {
    return false
  }

  const variantTemplate = findDvcVariantTemplate(templateRoot)
  if (!variantTemplate) return true
  const templateHasMapping = isUsableTemplateFile(
    join(variantTemplate, "mapping.md"),
  )

  for (const entry of readdirSync(outputRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const variantPath = join(outputRoot, entry.name)
    const hasModificationDraft =
      existsSync(join(variantPath, "modification_spec.md")) ||
      existsSync(join(variantPath, "modification_schema.md")) ||
      existsSync(join(variantPath, "modification_parser.md"))
    const hasFullDraft =
      Boolean(resolveDraftOrCopyThrough(variantPath, "spec")) ||
      Boolean(resolveDraftOrCopyThrough(variantPath, "raw_schema")) ||
      Boolean(resolveDraftOrCopyThrough(variantPath, "parser_config"))
    if (hasModificationDraft && !hasFullDraft) continue
    if (
      !hasFileForTemplate(variantPath, variantTemplate, "spec") ||
      !hasFileForTemplate(variantPath, variantTemplate, "raw_schema") ||
      !hasFileForTemplate(variantPath, variantTemplate, "parser_config")
    ) {
      return false
    }
    if (
      !templateHasMapping &&
      (existsSync(join(variantPath, "mapping_draft.md")) ||
        existsSync(join(variantPath, "mapping.md")))
    ) {
      return false
    }
  }
  return true
}

function findDvcVariantTemplate(templateRoot: string): string | undefined {
  const preferred = join(templateRoot, "Variante x")
  if (existsSync(preferred)) return preferred
  return readdirSync(templateRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(templateRoot, entry.name))
    .sort()[0]
}

function isUsableTemplateFile(path: string): boolean {
  if (!existsSync(path)) return false
  return !readFileSync(path, "utf8").includes("LEGACY DO NOT USE")
}

function findDvcVariantDrafts(
  config: RouterConfig,
  canonicalId: string,
  path: string,
): DvcVariantDraft[] {
  const canonicalRoot = join(
    config.vaultRoot,
    "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente",
    canonicalId,
  )
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry): DvcVariantDraft | null => {
      const variantPath = join(path, entry.name)
      const spec = resolveDraftOrCopyThrough(variantPath, "spec")
      const rawSchema = resolveDraftOrCopyThrough(variantPath, "raw_schema")
      const parserConfig = resolveDraftOrCopyThrough(
        variantPath,
        "parser_config",
      )
      const modificationSpec = join(variantPath, "modification_spec.md")
      const modificationSchema = join(variantPath, "modification_schema.md")
      const modificationParser = join(variantPath, "modification_parser.md")
      const hasFullDrafts =
        Boolean(spec) && Boolean(rawSchema) && Boolean(parserConfig)
      const hasModifications =
        existsSync(modificationSpec) ||
        existsSync(modificationSchema) ||
        existsSync(modificationParser)
      const variantExists = existsSync(join(canonicalRoot, entry.name))
      if (!variantExists && !hasFullDrafts) return null
      if (variantExists && !hasFullDrafts && !hasModifications) return null
      return {
        name: entry.name,
        path: variantPath,
        mode: hasFullDrafts ? "full" : "modification",
        files: {
          spec,
          rawSchema,
          parserConfig,
          modificationSpec: existsSync(modificationSpec)
            ? modificationSpec
            : undefined,
          modificationSchema: existsSync(modificationSchema)
            ? modificationSchema
            : undefined,
          modificationParser: existsSync(modificationParser)
            ? modificationParser
            : undefined,
        },
      }
    })
    .filter((variant): variant is DvcVariantDraft => Boolean(variant))
    .sort((a, b) => a.name.localeCompare(b.name))
}

function nextProposalId(config: RouterConfig): string {
  let max = 0
  for (const queue of QUEUES) {
    for (const proposalId of listProposalIds(config, queue)) {
      const match = proposalId.match(/^PROP-(\d+)$/)
      if (match?.[1]) max = Math.max(max, Number(match[1]))
    }
  }
  return `PROP-${String(max + 1).padStart(4, "0")}`
}

function renderProposal(
  config: RouterConfig,
  contribution: ContributionPackage,
  draftPackage: SupportedDraftPackage,
  options: { readonly proposalId: string },
): string {
  const targetCanonicalPath = targetCanonicalFolder(draftPackage)
  const name = humanizeCanonicalId(draftPackage.canonicalId)
  const proposalType = `PROP-${draftPackage.canonicalType}`
  const changeType = existsSync(join(config.vaultRoot, targetCanonicalPath))
    ? "enrich"
    : "new"
  const canonicalMaterials = discoverCanonicalMaterials(
    config,
    contribution,
    draftPackage,
  )
  const requiresPhysicalDvcEvidence = dvcRequiresPhysicalEvidenceReview(
    draftPackage,
    changeType,
    canonicalMaterials,
  )
  const requiresHuman =
    dvcHasModifications(draftPackage) || requiresPhysicalDvcEvidence
  const touchesCanon = changeType === "new" ? "no" : "si"
  const contributionPath = toVaultRelative(config, contribution.path)
  const sourceInventory = join(
    contribution.path,
    "materials/source_inventory.md",
  )
  const sessionTranscript = join(contribution.path, "session_transcript.md")
  const evidenceRows = [
    [
      "Contribution map",
      toVaultRelative(config, contribution.mapPath),
      "Contexto de contribution y linaje operativo",
    ],
    ...(existsSync(sourceInventory)
      ? [
          [
            "Source inventory",
            toVaultRelative(config, sourceInventory),
            "Inventario de materiales fuente",
          ],
        ]
      : []),
    ...(existsSync(sessionTranscript)
      ? [
          [
            "Session transcript",
            toVaultRelative(config, sessionTranscript),
            "Trazabilidad de captura",
          ],
        ]
      : []),
    ...rootSpecEvidenceRows(config, draftPackage),
    ...draftEvidenceRows(config, draftPackage),
  ]
  const draftRows = [
    ...draftRowsForPackage(config, draftPackage, changeType),
    ...changelogDraftRows(config, draftPackage),
  ]

  return `# ${options.proposalId} - ${draftPackage.canonicalType} ${name}

## Objetivo
Proponer la creacion o enriquecimiento del canonico \`${draftPackage.canonicalId}\` dentro de Explicit Knowledge V3, a partir de la contribution \`${contribution.id}\`.

## Identificacion
${renderMarkdownTable(
  ["Campo", "Valor"],
  [
    ["ID", options.proposalId],
    ["Tipo", proposalType],
    ["Estado", "draft"],
    ["Fecha creacion", config.today],
    ["Ultima actualizacion", config.today],
    ["Owner operativo", "Proposal Builder"],
    ["Contribution origen", contribution.id],
    ["Tipo de cambio", changeType],
    ["Target canonico ID", draftPackage.canonicalId],
    ["Target canonico path", targetCanonicalPath],
    ["Riesgo inicial", "medium"],
    ["Capa", "explicit_knowledge"],
    ["Canonical type", draftPackage.canonicalType],
  ],
)}

## Campos para routing
${renderMarkdownTable(
  ["Campo", "Prioridad", "Valor"],
  [
    ["Contribution origen", "M", contribution.id],
    ["Tipo de cambio", "M", changeType],
    ["Target canonico ID", "M", draftPackage.canonicalId],
    ["Target canonico path", "M", targetCanonicalPath],
    [
      "Evidencia minima disponible",
      "M",
      requiresPhysicalDvcEvidence ? "no" : "si",
    ],
    ["Toca canon existente", "M", touchesCanon],
    ["Contradiccion detectada", "M", "no"],
    ["Riesgo inicial", "M", "medium"],
    ["Requiere humano sugerido", "D", requiresHuman ? "si" : "no"],
  ],
)}

## Contribution source
${renderMarkdownTable(
  ["Campo", "Valor"],
  [
    ["Contribution origen", contribution.id],
    ["Carpeta fuente", contributionPath],
    [
      "Persona / firma fuente",
      stripTicks(contribution.identification["Persona fuente"]) || "Pendiente",
    ],
  ],
)}

## Tipo de cambio
${renderMarkdownTable(
  ["Campo", "Valor"],
  [
    ["Tipo", changeType],
    [
      "Motivo",
      `La contribution contiene drafts ${draftPackage.canonicalType} completos para proponer cambios sobre el canonico ${draftPackage.canonicalId}.`,
    ],
  ],
)}

## Target canonico
${renderMarkdownTable(
  ["Campo", "Valor"],
  targetRowsForPackage(draftPackage, name, targetCanonicalPath),
)}

## Cambio propuesto
${changeDescription(draftPackage, name, changeType)}

La propuesta debe crear o actualizar los archivos canonicos esperados a partir de los drafts de la contribution.

## Detalle ${draftPackage.canonicalType}
${renderMarkdownTable(
  ["Campo", "Valor"],
  detailRowsForPackage(draftPackage, name),
)}

## Evidencia usada
${renderMarkdownTable(["Evidencia", "Ubicacion", "Uso"], evidenceRows)}

${rawDocumentSection(config, contribution, draftPackage, canonicalMaterials)}

${canonicalMaterialsSection(config, canonicalMaterials)}

## Drafts usados
${renderMarkdownTable(["Draft", "Ubicacion", "Archivo canonico destino"], draftRows)}

## Canonicos relacionados
${extractSection(contribution.markdown, "Canonicos potencialmente afectados") ?? "| Canonico | Relacion |\n|---|---|\n| Pendiente | Pendiente |"}

## Riesgos o dudas
${riskOrQuestionsSection(contribution, requiresPhysicalDvcEvidence)}

${extractSection(contribution.markdown, "Metodologias relacionadas") ?? ""}

## Archivos canonicos esperados
${renderMarkdownTable(
  ["Accion", "Canonical ID", "Path esperado", "Nota"],
  expectedCanonicalRows(
    config,
    draftPackage,
    targetCanonicalPath,
    options.proposalId,
    changeType,
    canonicalMaterials,
  ),
)}
`
}

function targetCanonicalFolder(draftPackage: SupportedDraftPackage): string {
  const base = "05 Benford Brain IMSS Mexico/01 Explicit Knowledge"
  switch (draftPackage.canonicalType) {
    case "DOC":
      return `${base}/DOC Documentos y Ejemplos/${draftPackage.canonicalId}/`
    case "DVC":
      return `${base}/DVC Documentos Variables Cliente/${draftPackage.canonicalId}/`
    case "DOL":
      return `${base}/DOL Documentos de Leyes/${draftPackage.canonicalId}/`
  }
}

function draftEvidenceRows(
  config: RouterConfig,
  draftPackage: SupportedDraftPackage,
): string[][] {
  switch (draftPackage.canonicalType) {
    case "DOC":
      return [
        [
          "Schema draft",
          toVaultRelative(config, requiredPath(draftPackage.files.schema)),
          "Draft de schema DOC",
        ],
        [
          "Parser config draft",
          toVaultRelative(
            config,
            requiredPath(draftPackage.files.parserConfig),
          ),
          "Draft de parser DOC",
        ],
      ]
    case "DVC":
      return dvcVariants(draftPackage).flatMap((variant) =>
        dvcVariantEvidenceRows(config, variant),
      )
    case "DOL":
      return [
        [
          "Document transcript draft",
          toVaultRelative(
            config,
            requiredPath(draftPackage.files.documentTranscript),
          ),
          "Draft de transcripcion normativa",
        ],
      ]
  }
}

function rootSpecEvidenceRows(
  config: RouterConfig,
  draftPackage: SupportedDraftPackage,
): string[][] {
  if (!draftPackage.files.spec) return []
  return [
    [
      "Spec draft",
      toVaultRelative(config, draftPackage.files.spec),
      `Draft funcional ${draftPackage.canonicalType}`,
    ],
  ]
}

function dvcVariantEvidenceRows(
  config: RouterConfig,
  variant: DvcVariantDraft,
): string[][] {
  const rows: string[][] = []
  if (variant.files.spec) {
    rows.push([
      `${variant.name} spec draft`,
      toVaultRelative(config, variant.files.spec),
      "Draft de spec DVC",
    ])
  }
  if (variant.files.rawSchema) {
    rows.push([
      `${variant.name} raw schema draft`,
      toVaultRelative(config, variant.files.rawSchema),
      "Draft de raw schema DVC",
    ])
  }
  if (variant.files.parserConfig) {
    rows.push([
      `${variant.name} parser config draft`,
      toVaultRelative(config, variant.files.parserConfig),
      "Draft de parser DVC",
    ])
  }
  if (variant.files.modificationSpec) {
    rows.push([
      `${variant.name} modification spec`,
      toVaultRelative(config, variant.files.modificationSpec),
      "Instruccion de cambio para spec.md",
    ])
  }
  if (variant.files.modificationSchema) {
    rows.push([
      `${variant.name} modification schema`,
      toVaultRelative(config, variant.files.modificationSchema),
      "Instruccion de cambio para raw_schema.md",
    ])
  }
  if (variant.files.modificationParser) {
    rows.push([
      `${variant.name} modification parser`,
      toVaultRelative(config, variant.files.modificationParser),
      "Instruccion de cambio para parser_config.md",
    ])
  }
  return rows
}

function draftRowsForPackage(
  config: RouterConfig,
  draftPackage: SupportedDraftPackage,
  changeType: string,
): string[][] {
  switch (draftPackage.canonicalType) {
    case "DOC":
      return [
        [
          "spec_draft.md",
          toVaultRelative(config, requiredPath(draftPackage.files.spec)),
          "spec.md",
        ],
        [
          "schema_draft.md",
          toVaultRelative(config, requiredPath(draftPackage.files.schema)),
          "schema.md",
        ],
        [
          "parser_config_draft.md",
          toVaultRelative(
            config,
            requiredPath(draftPackage.files.parserConfig),
          ),
          "parser_config.md",
        ],
      ]
    case "DVC":
      void changeType
      return dvcVariants(draftPackage).flatMap((variant) =>
        dvcVariantDraftRows(config, variant),
      )
    case "DOL":
      return [
        [
          "spec_draft.md",
          toVaultRelative(config, requiredPath(draftPackage.files.spec)),
          "spec.md",
        ],
        [
          "document_transcript_draft.md",
          toVaultRelative(
            config,
            requiredPath(draftPackage.files.documentTranscript),
          ),
          "document_transcript.md",
        ],
      ]
  }
}

function dvcVariantDraftRows(
  config: RouterConfig,
  variant: DvcVariantDraft,
): string[][] {
  const rows: string[][] = []
  if (variant.files.spec) {
    rows.push([
      `${variant.name}/spec_draft.md`,
      toVaultRelative(config, variant.files.spec),
      `${variant.name}/spec.md`,
    ])
  }
  if (variant.files.rawSchema) {
    rows.push([
      `${variant.name}/raw_schema_draft.md`,
      toVaultRelative(config, variant.files.rawSchema),
      `${variant.name}/raw_schema.md`,
    ])
  }
  if (variant.files.parserConfig) {
    rows.push([
      `${variant.name}/parser_config_draft.md`,
      toVaultRelative(config, variant.files.parserConfig),
      `${variant.name}/parser_config.md`,
    ])
  }
  if (variant.files.modificationSpec) {
    rows.push([
      `${variant.name}/modification_spec.md`,
      toVaultRelative(config, variant.files.modificationSpec),
      `${variant.name}/spec.md`,
    ])
  }
  if (variant.files.modificationSchema) {
    rows.push([
      `${variant.name}/modification_schema.md`,
      toVaultRelative(config, variant.files.modificationSchema),
      `${variant.name}/raw_schema.md`,
    ])
  }
  if (variant.files.modificationParser) {
    rows.push([
      `${variant.name}/modification_parser.md`,
      toVaultRelative(config, variant.files.modificationParser),
      `${variant.name}/parser_config.md`,
    ])
  }
  return rows
}

function changelogDraftRows(
  config: RouterConfig,
  draftPackage: SupportedDraftPackage,
): string[][] {
  if (draftPackage.canonicalType === "DVC") {
    return dvcVariants(draftPackage).flatMap((variant) => {
      const source =
        variant.files.spec ??
        variant.files.modificationSpec ??
        variant.files.modificationSchema ??
        variant.files.modificationParser
      if (!source) return []
      return [
        [
          `${variant.name}/${basename(source)}`,
          toVaultRelative(config, source),
          `${variant.name}/changelog.md`,
        ],
      ]
    })
  }
  if (draftPackage.files.notes) {
    return [
      [
        "notes.md",
        toVaultRelative(config, draftPackage.files.notes),
        "changelog.md / notas de aplicacion",
      ],
    ]
  }
  return []
}

function targetRowsForPackage(
  draftPackage: SupportedDraftPackage,
  name: string,
  targetCanonicalPath: string,
): string[][] {
  switch (draftPackage.canonicalType) {
    case "DOC":
      return [
        ["DOC ID", draftPackage.canonicalId],
        ["Nombre documento", name],
        ["Carpeta destino", targetCanonicalPath],
        [
          "Archivos canonicos esperados",
          "spec.md / schema.md / parser_config.md / changelog.md",
        ],
      ]
    case "DVC":
      return [
        ["DVC ID", draftPackage.canonicalId],
        ["Nombre documento variable", name],
        ["Carpeta destino", targetCanonicalPath],
        [
          "Variantes",
          dvcVariants(draftPackage)
            .map((variant) => variant.name)
            .join(", "),
        ],
        [
          "Archivos canonicos esperados",
          "<variante>/spec.md / <variante>/raw_schema.md / <variante>/parser_config.md / <variante>/changelog.md / <variante>/source_documents/examples si aplica",
        ],
      ]
    case "DOL":
      return [
        ["DOL ID", draftPackage.canonicalId],
        ["Ley / reglamento", name],
        ["Articulo / seccion", "Pendiente"],
        ["Carpeta destino", targetCanonicalPath],
        ["Vigencia conocida", "Pendiente"],
      ]
  }
}

function changeDescription(
  draftPackage: SupportedDraftPackage,
  name: string,
  changeType: string,
): string {
  const action = changeType === "new" ? "Crear un nuevo" : "Enriquecer el"
  switch (draftPackage.canonicalType) {
    case "DOC":
      return `${action} canonico \`${draftPackage.canonicalId}\` para documentar ${name} como documento fuente estable de auditoria IMSS.`
    case "DVC":
      return `${action} canonico \`${draftPackage.canonicalId}\` para documentar ${name} como documento variable de cliente con variantes autonomas. Cada variante contiene su propio spec, raw schema, parser config, changelog y ejemplos.`
    case "DOL":
      return `${action} canonico \`${draftPackage.canonicalId}\` para documentar el fundamento normativo ${name} y su transcripcion operativa.`
  }
}

function detailRowsForPackage(
  draftPackage: SupportedDraftPackage,
  name: string,
): string[][] {
  switch (draftPackage.canonicalType) {
    case "DOC":
      return [
        [
          "Que es el documento",
          `Documento fuente estable identificado como ${name}.`,
        ],
        [
          "Como se reconoce",
          "Ver spec_draft.md y materiales fuente de la contribution.",
        ],
        [
          "Para que se usa en auditoria",
          "Como evidencia fuente para pruebas y cruces IMSS relacionados.",
        ],
        ["Campos o estructura esperada", "Ver schema_draft.md."],
      ]
    case "DVC":
      return [
        [
          "Que cambia por cliente/software",
          `Variantes: ${dvcVariants(draftPackage)
            .map((variant) => variant.name)
            .join(", ")}.`,
        ],
        [
          "Software o formato origen",
          "Ver spec_draft.md de cada variante y materiales fuente de la contribution.",
        ],
        ["Raw schema esperado", "Ver cada <variante>/raw_schema_draft.md."],
        [
          "Parser config esperado",
          "Ver cada <variante>/parser_config_draft.md.",
        ],
        [
          "Modificaciones parciales",
          "Ver modification_spec.md, modification_schema.md o modification_parser.md cuando aplique.",
        ],
      ]
    case "DOL":
      return [
        ["Texto o fundamento relevante", "Ver document_transcript_draft.md."],
        [
          "Interpretacion auditora permitida",
          "Ver spec_draft.md y canonicos relacionados.",
        ],
        ["Targets AIM relacionados", "Pendiente"],
        ["Metodologias relacionadas", "Pendiente"],
      ]
  }
}

function rawDocumentSection(
  config: RouterConfig,
  contribution: ContributionPackage,
  draftPackage: SupportedDraftPackage,
  canonicalMaterials: readonly CanonicalMaterial[],
): string {
  if (draftPackage.canonicalType === "DOL" && canonicalMaterials.length === 0)
    return ""
  const rows =
    canonicalMaterials.length > 0
      ? canonicalMaterials.map((material) => [
          material.sourceName,
          material.sourceOwner,
          toVaultRelative(config, material.sourcePath),
          material.type,
          "evidencia_contextual",
          `${targetCanonicalFolder(draftPackage)}${material.destinationPath}`,
        ])
      : [
          [
            "Materiales fuente",
            stripTicks(contribution.identification["Persona fuente"]) ||
              "Pendiente",
            `${toVaultRelative(config, contribution.path)}/materials/`,
            draftPackage.canonicalType === "DVC"
              ? "variante_cliente"
              : "documento_fuente",
            "evidencia_contextual",
            `${targetCanonicalFolder(draftPackage)}Examples/`,
          ],
        ]
  return `## Ejemplos raw documents
${renderMarkdownTable(
  [
    "Ejemplo",
    "Empresa / fuente",
    "Ubicacion en contribution",
    "Tipo / variante",
    "Uso en el canonico",
    "Destino canonico sugerido",
  ],
  rows,
)}
`
}

function canonicalMaterialsSection(
  config: RouterConfig,
  canonicalMaterials: readonly CanonicalMaterial[],
): string {
  if (canonicalMaterials.length === 0) return ""
  return `## Materiales canonicos a copiar
${renderMarkdownTable(
  [
    "Accion",
    "Origen en contribution",
    "Destino canonico esperado",
    "Tipo",
    "Preservar estructura",
    "Nota",
  ],
  canonicalMaterials.map((material) => [
    material.action,
    toVaultRelative(config, material.sourcePath),
    material.destinationPath,
    material.type,
    material.preserveStructure,
    material.note,
  ]),
)}
`
}

function expectedCanonicalRows(
  config: RouterConfig,
  draftPackage: SupportedDraftPackage,
  targetCanonicalPath: string,
  proposalId: string,
  changeType: string,
  canonicalMaterials: readonly CanonicalMaterial[],
): string[][] {
  const draftDestinations = expectedDraftDestinations(draftPackage)
  const rows = draftDestinations.map(([draftName, destinationFile]) => [
    expectedCanonicalAction(config, targetCanonicalPath, destinationFile),
    `${draftPackage.canonicalId}/${destinationFile}`,
    `${targetCanonicalPath}${destinationFile}`,
    `Derivado de ${draftName}`,
  ])
  if (draftPackage.canonicalType !== "DVC") {
    rows.push([
      changeType === "new" ? "crear" : "modificar",
      `${draftPackage.canonicalId}/changelog.md`,
      `${targetCanonicalPath}changelog.md`,
      `Registro de cambio desde ${proposalId}`,
    ])
  }
  for (const material of canonicalMaterials) {
    rows.push([
      "copiar",
      `${draftPackage.canonicalId}/${material.destinationPath}`,
      `${targetCanonicalPath}${material.destinationPath}`,
      material.note,
    ])
  }
  return rows
}

function expectedDraftDestinations(
  draftPackage: SupportedDraftPackage,
): Array<[string, string]> {
  switch (draftPackage.canonicalType) {
    case "DOC":
      return [
        ["spec_draft.md", "spec.md"],
        ["schema_draft.md", "schema.md"],
        ["parser_config_draft.md", "parser_config.md"],
      ]
    case "DVC": {
      return dvcVariants(draftPackage).flatMap((variant) => {
        const rows: Array<[string, string]> = []
        if (variant.files.spec) {
          rows.push([
            `${variant.name}/spec_draft.md`,
            `${variant.name}/spec.md`,
          ])
        }
        if (variant.files.rawSchema) {
          rows.push([
            `${variant.name}/raw_schema_draft.md`,
            `${variant.name}/raw_schema.md`,
          ])
        }
        if (variant.files.parserConfig) {
          rows.push([
            `${variant.name}/parser_config_draft.md`,
            `${variant.name}/parser_config.md`,
          ])
        }
        if (variant.files.modificationSpec) {
          rows.push([
            `${variant.name}/modification_spec.md`,
            `${variant.name}/spec.md`,
          ])
        }
        if (variant.files.modificationSchema) {
          rows.push([
            `${variant.name}/modification_schema.md`,
            `${variant.name}/raw_schema.md`,
          ])
        }
        if (variant.files.modificationParser) {
          rows.push([
            `${variant.name}/modification_parser.md`,
            `${variant.name}/parser_config.md`,
          ])
        }
        const changelogSource =
          variant.files.spec ??
          variant.files.modificationSpec ??
          variant.files.modificationSchema ??
          variant.files.modificationParser
        if (changelogSource) {
          rows.push([
            `${variant.name}/${basename(changelogSource)}`,
            `${variant.name}/changelog.md`,
          ])
        }
        return rows
      })
    }
    case "DOL":
      return [
        ["spec_draft.md", "spec.md"],
        ["document_transcript_draft.md", "document_transcript.md"],
      ]
  }
}

function expectedCanonicalAction(
  config: RouterConfig,
  targetCanonicalPath: string,
  destinationFile: string,
): "crear" | "modificar" {
  return existsSync(
    join(config.vaultRoot, targetCanonicalPath, destinationFile),
  )
    ? "modificar"
    : "crear"
}

function discoverCanonicalMaterials(
  config: RouterConfig,
  contribution: ContributionPackage,
  draftPackage: SupportedDraftPackage,
): CanonicalMaterial[] {
  const materials: CanonicalMaterial[] = [
    ...loadContributionMapCanonicalMaterials(config, contribution),
  ]
  if (draftPackage.canonicalType === "DOL") {
    collectDolSourceDocuments(contribution, materials)
    return filterExistingCanonicalMaterials(dedupeCanonicalMaterials(materials))
  }
  if (draftPackage.canonicalType === "DVC") {
    return filterExistingCanonicalMaterials(
      pruneCoveredCanonicalMaterials(
        filterDvcVariantMaterials(
          draftPackage,
          dedupeCanonicalMaterials(materials),
        ),
      ),
    )
  }
  const examplesRoot = join(
    contribution.path,
    "materials/source_documents/examples",
  )
  if (existsSync(examplesRoot)) {
    for (const entry of readdirSync(examplesRoot, { withFileTypes: true }).sort(
      (a, b) => a.name.localeCompare(b.name),
    )) {
      const sourcePath = join(examplesRoot, entry.name)
      const destinationBase = "Examples"
      const destinationPath = `${destinationBase}/${entry.name}${entry.isDirectory() ? "/" : ""}`
      materials.push({
        action: entry.isDirectory() ? "copiar carpeta" : "copiar archivo",
        sourcePath,
        destinationPath,
        sourceName: entry.name,
        sourceOwner: entry.name,
        type: "documento_fuente",
        preserveStructure: entry.isDirectory() ? "si" : "no",
        note: "Copiar material fuente aprobado preservando nombres y estructura.",
      })
    }
  }

  const legacyMarkdownRoot = join(
    contribution.path,
    "materials/source_documents/legacy_markdown",
  )
  collectLegacySourceDocuments({
    draftPackage,
    materials,
    rootPath: legacyMarkdownRoot,
    rootName: "legacy_markdown",
    includeFile: (name) => /^pendientes\b/i.test(name),
    type: "pendientes_fuente",
    note: "Copiar pendientes fuente aprobados sin convertirlos en contrato del sistema.",
  })

  return filterExistingCanonicalMaterials(
    pruneCoveredCanonicalMaterials(dedupeCanonicalMaterials(materials)),
  )
}

function filterDvcVariantMaterials(
  draftPackage: SupportedDraftPackage,
  materials: readonly CanonicalMaterial[],
): CanonicalMaterial[] {
  const variants = new Set(
    dvcVariants(draftPackage).map((variant) => variant.name),
  )
  return materials.filter((material) => {
    const firstSegment = material.destinationPath
      .replace(/\\/g, "/")
      .split("/")
      .filter(Boolean)[0]
    return Boolean(firstSegment && variants.has(firstSegment))
  })
}

function collectDolSourceDocuments(
  contribution: ContributionPackage,
  materials: CanonicalMaterial[],
): void {
  const materialsRoot = join(contribution.path, "materials")
  if (!existsSync(materialsRoot)) return
  for (const entry of readdirSync(materialsRoot, { withFileTypes: true }).sort(
    (a, b) => a.name.localeCompare(b.name),
  )) {
    if (!entry.isFile()) continue
    if (!isDolSourceDocumentName(entry.name)) continue
    const sourcePath = join(materialsRoot, entry.name)
    materials.push({
      action: "copiar archivo",
      sourcePath,
      destinationPath: `source_documents/${entry.name}`,
      sourceName: entry.name,
      sourceOwner: "fuente_legal_original",
      type: "fuente_legal_original",
      preserveStructure: "no",
      note: "PDF fuente legal usado para transcripcion DOL y trazabilidad canonica.",
    })
  }
}

function isDolSourceDocumentName(name: string): boolean {
  return /\.(?:pdf|docx?|html?|txt)$/i.test(name)
}

function filterExistingCanonicalMaterials(
  materials: readonly CanonicalMaterial[],
): CanonicalMaterial[] {
  return materials.filter((material) => {
    if (!existsSync(material.sourcePath)) return false
    const stat = statSync(material.sourcePath)
    return material.action === "copiar carpeta"
      ? stat.isDirectory()
      : stat.isFile()
  })
}

function loadContributionMapCanonicalMaterials(
  config: RouterConfig,
  contribution: ContributionPackage,
): CanonicalMaterial[] {
  const table = parseFirstMarkdownTable(
    extractSection(contribution.markdown, "Materiales canonicos sugeridos"),
  )
  if (!table) return []
  const sourceHeader = headerByName(table.headers, "Origen en contribution")
  const destinationHeader = headerByName(
    table.headers,
    "Destino canonico esperado",
  )
  const copyHeader = headerByName(table.headers, "Copiar")
  const typeHeader = headerByName(table.headers, "Tipo")
  const noteHeader = headerByName(table.headers, "Nota")
  if (!sourceHeader || !destinationHeader) return []

  return table.rows.flatMap((row) => {
    const shouldCopy = normalizeName(stripTicks(row[copyHeader ?? ""])) || "si"
    if (["no", "false", "n"].includes(shouldCopy)) return []
    const sourcePath = resolveContributionSourcePath(
      config,
      contribution,
      stripTicks(row[sourceHeader]),
    )
    if (!existsSync(sourcePath)) return []
    const stat = statSync(sourcePath)
    const destinationPath = stripTicks(row[destinationHeader]).replace(
      /^\/+/,
      "",
    )
    if (!destinationPath) return []
    const type = stripTicks(row[typeHeader ?? ""]) || "material_fuente"
    return [
      {
        action: stat.isDirectory() ? "copiar carpeta" : "copiar archivo",
        sourcePath,
        destinationPath: `${destinationPath}${stat.isDirectory() && !destinationPath.endsWith("/") ? "/" : ""}`,
        sourceName: basename(sourcePath),
        sourceOwner: type,
        type,
        preserveStructure: stat.isDirectory() ? "si" : "no",
        note:
          stripTicks(row[noteHeader ?? ""]) ||
          "Copiar material fuente declarado en contribution_map.md.",
      },
    ]
  })
}

function dedupeCanonicalMaterials(
  materials: readonly CanonicalMaterial[],
): CanonicalMaterial[] {
  const seen = new Set<string>()
  const deduped: CanonicalMaterial[] = []
  for (const material of materials) {
    const key = `${material.sourcePath}\0${material.destinationPath}`
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(material)
  }
  return deduped
}

function pruneCoveredCanonicalMaterials(
  materials: readonly CanonicalMaterial[],
): CanonicalMaterial[] {
  return materials.filter((material, index) => {
    const destination = normalizeMaterialDestination(material.destinationPath)
    return !materials.some((candidate, candidateIndex) => {
      if (candidateIndex === index) return false
      if (candidate.action !== "copiar carpeta") return false
      const candidateDestination = normalizeMaterialDestination(
        candidate.destinationPath,
      )
      return (
        destination !== candidateDestination &&
        destination.startsWith(`${candidateDestination}/`)
      )
    })
  })
}

function normalizeMaterialDestination(destinationPath: string): string {
  return destinationPath.replace(/\\/g, "/").replace(/\/+$/g, "")
}

function collectLegacySourceDocuments(options: {
  readonly draftPackage: SupportedDraftPackage
  readonly materials: CanonicalMaterial[]
  readonly rootPath: string
  readonly rootName: string
  readonly includeFile: (name: string) => boolean
  readonly type: string
  readonly note: string
}): void {
  if (!existsSync(options.rootPath)) return
  if (options.draftPackage.canonicalType === "DVC") return

  for (const entry of readdirSync(options.rootPath, {
    withFileTypes: true,
  }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isFile() || !options.includeFile(entry.name)) continue
    const sourcePath = join(options.rootPath, entry.name)
    const destinationBase = `Examples/${options.rootName}`
    options.materials.push({
      action: "copiar archivo",
      sourcePath,
      destinationPath: `${destinationBase}/${entry.name}`,
      sourceName: entry.name,
      sourceOwner: options.rootName,
      type: options.type,
      preserveStructure: "no",
      note: options.note,
    })
  }
}

function resolveContributionSourcePath(
  config: RouterConfig,
  contribution: ContributionPackage,
  sourcePath: string,
): string {
  const cleanPath = sourcePath.replace(/\\/g, "/").replace(/^\/+/, "")
  if (cleanPath.startsWith("01 Contribuciones/")) {
    return join(config.vaultRoot, cleanPath)
  }
  if (cleanPath.startsWith("materials/")) {
    return join(contribution.path, cleanPath)
  }
  if (cleanPath.startsWith("skill_outputs/")) {
    return join(contribution.path, cleanPath)
  }
  if (cleanPath.startsWith(`${basename(contribution.path)}/`)) {
    return join(dirname(contribution.path), cleanPath)
  }
  return join(contribution.path, cleanPath)
}

function headerByName(
  headers: readonly string[],
  name: string,
): string | undefined {
  const normalized = normalizeName(name)
  return headers.find((header) => normalizeName(header) === normalized)
}

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function dvcVariants(
  draftPackage: SupportedDraftPackage,
): readonly DvcVariantDraft[] {
  if (draftPackage.canonicalType !== "DVC" || !draftPackage.variants) {
    throw new Error(`Missing DVC variants for ${draftPackage.canonicalId}.`)
  }
  return draftPackage.variants
}

function dvcHasModifications(draftPackage: SupportedDraftPackage): boolean {
  return (
    draftPackage.canonicalType === "DVC" &&
    dvcVariants(draftPackage).some(
      (variant) =>
        variant.mode === "modification" ||
        Boolean(
          variant.files.modificationSpec ??
            variant.files.modificationSchema ??
            variant.files.modificationParser,
        ),
    )
  )
}

function dvcRequiresPhysicalEvidenceReview(
  draftPackage: SupportedDraftPackage,
  changeType: "new" | "enrich",
  canonicalMaterials: readonly CanonicalMaterial[],
): boolean {
  if (draftPackage.canonicalType !== "DVC") return false
  if (changeType !== "new" && changeType !== "enrich") return false
  if (dvcHasModifications(draftPackage)) return false
  return !canonicalMaterials.some(isPhysicalDvcExampleMaterial)
}

function isPhysicalDvcExampleMaterial(material: CanonicalMaterial): boolean {
  const source = material.sourcePath.replace(/\\/g, "/").toLowerCase()
  const destination = material.destinationPath.replace(/\\/g, "/").toLowerCase()
  const type = material.type.toLowerCase()
  return (
    source.includes("/materials/source_documents/examples/") ||
    destination.includes("/ejemplos/") ||
    destination.includes("/examples/") ||
    type.includes("ejemplo") ||
    type.includes("variante_cliente")
  )
}

function riskOrQuestionsSection(
  contribution: ContributionPackage,
  requiresPhysicalDvcEvidence: boolean,
): string {
  const existing =
    extractSection(contribution.markdown, "Targets oficiales relacionados") ??
    "Pendiente"
  if (!requiresPhysicalDvcEvidence) return existing
  return `${existing}

## Requiere decision humana
La PROP-DVC no declara ejemplos fisicos reales o materiales canonicos copiables por variante. No debe aplicarse automaticamente porque el raw schema y parser config no estan validados contra un documento fuente observado.`
}

function requiredPath(path: string | undefined): string {
  if (!path) throw new Error("Missing required draft path.")
  return path
}

function updateContributionMap(
  config: RouterConfig,
  contribution: ContributionPackage,
  proposalId: string,
  draftPackage: SupportedDraftPackage,
): void {
  const row = `| ${proposalId} | 02 Proposals/01 Draft/${proposalId} | PROP-${draftPackage.canonicalType} | ${draftPackage.canonicalId} | draft |`
  let markdown = contribution.markdown
  const heading = "## Proposals generadas"
  const start = markdown.indexOf(heading)
  const nextHeading =
    start === -1 ? -1 : markdown.indexOf("\n## ", start + heading.length)
  const existingRows =
    extractSection(markdown, "Proposals generadas")
      ?.split("\n")
      .filter(
        (line) =>
          /^\|\s*PROP-(?:[A-Z]+-)?\d+\s*\|/.test(line) &&
          !line.includes(`| ${proposalId} |`),
      ) ?? []
  const rows = [...existingRows, row].join("\n")
  const replacement = `${heading}
Las PROPs viven en \`02 Proposals\`, no dentro de esta contribution.

| PROP | Ubicacion | Tipo | Target | Estado |
|---|---|---|---|---|
${rows}
`
  if (start === -1) {
    markdown = `${markdown.trim()}

${replacement}
`
  } else {
    markdown =
      nextHeading === -1
        ? `${markdown.slice(0, start)}${replacement}`
        : `${markdown.slice(0, start)}${replacement}${markdown.slice(nextHeading)}`
  }
  writeFileSync(contribution.mapPath, markdown, "utf8")
  void config
}

function humanizeCanonicalId(canonicalId: string): string {
  return canonicalId
    .replace(/^(?:DOC|DVC|DOL)-/, "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function stripTicks(value: string | undefined): string {
  return (value ?? "").trim().replace(/^`+|`+$/g, "")
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
