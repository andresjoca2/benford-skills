import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
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

interface SupportedDraftPackage {
  readonly canonicalType: "DOC" | "DVC" | "DOL"
  readonly canonicalId: string
  readonly path: string
  readonly files: {
    readonly spec: string
    readonly schema?: string
    readonly rawSchema?: string
    readonly mapping?: string
    readonly parserConfig?: string
    readonly documentTranscript?: string
    readonly notes?: string
    readonly sourceManifest?: string
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
  const root = join(config.vaultRoot, "01 Contribuciones")
  if (!existsSync(root)) return []
  const results: ContributionPackage[] = []
  const stack = [root]

  while (stack.length > 0) {
    const current = stack.pop()
    if (!current) continue
    const entries = readdirSync(current, { withFileTypes: true })
    const hasContributionMap = entries.some(
      (entry) => entry.isFile() && entry.name === "contribution_map.md",
    )
    if (hasContributionMap) {
      const contribution = readContributionPackage(
        config,
        join(current, "contribution_map.md"),
      )
      if (contribution) results.push(contribution)
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

function readContributionPackage(
  config: RouterConfig,
  mapPath: string,
): ContributionPackage | null {
  const markdown = readFileSync(mapPath, "utf8")
  const identification = tableToKeyValue(
    parseFirstMarkdownTable(extractSection(markdown, "Identificacion")),
  )
  const fallbackId = basename(dirname(mapPath))
  const id = stripTicks(identification.ID) || fallbackId
  if (!id.startsWith("CONTRIBUTION-") || id.includes("0000-template")) {
    return null
  }
  const contributionPath = dirname(mapPath)
  const contribution = {
    id,
    path: contributionPath,
    mapPath,
    markdown,
    identification,
  }
  if (!findPendingDraftPackage(config, contribution)) {
    return null
  }
  return contribution
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
        readFileSync(path, "utf8").includes(contributionId) &&
        readFileSync(path, "utf8").includes(targetCanonicalId)
      )
    }),
  )
}

function findPendingDraftPackage(
  config: RouterConfig,
  contribution: ContributionPackage,
): SupportedDraftPackage | null {
  return (
    findSupportedDraftPackages(contribution).find(
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
    .map(readSupportedDraftPackage)
    .filter((draftPackage): draftPackage is SupportedDraftPackage =>
      Boolean(draftPackage),
    )
}

function readSupportedDraftPackage(path: string): SupportedDraftPackage | null {
  const canonicalId = basename(path)
  const canonicalType = canonicalId.split("-")[0]
  if (
    canonicalType !== "DOC" &&
    canonicalType !== "DVC" &&
    canonicalType !== "DOL"
  ) {
    return null
  }

  const spec = join(path, "spec_draft.md")
  const schema = join(path, "schema_draft.md")
  const rawSchema = join(path, "raw_schema_draft.md")
  const mapping = join(path, "mapping_draft.md")
  const parserConfig = join(path, "parser_config_draft.md")
  const documentTranscript = join(path, "document_transcript_draft.md")
  const notes = join(path, "notes.md")
  const sourceManifest = join(path, "source_manifest.md")
  const files = {
    spec,
    schema,
    rawSchema: existsSync(rawSchema) ? rawSchema : undefined,
    mapping: existsSync(mapping) ? mapping : undefined,
    parserConfig,
    documentTranscript: existsSync(documentTranscript)
      ? documentTranscript
      : undefined,
    notes: existsSync(notes) ? notes : undefined,
    sourceManifest: existsSync(sourceManifest) ? sourceManifest : undefined,
  }

  if (canonicalType === "DOC") {
    if (!existsSync(spec) || !existsSync(schema) || !existsSync(parserConfig))
      return null
    return { canonicalType, canonicalId, path, files }
  }

  if (canonicalType === "DVC") {
    if (
      !existsSync(spec) ||
      !files.rawSchema ||
      !files.mapping ||
      !existsSync(parserConfig)
    )
      return null
    return { canonicalType, canonicalId, path, files }
  }

  if (!existsSync(spec) || !files.documentTranscript) return null
  return { canonicalType, canonicalId, path, files }
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
    ...(draftPackage.files.sourceManifest
      ? [
          [
            "Source manifest",
            toVaultRelative(config, draftPackage.files.sourceManifest),
            "Manifest de fuentes usadas por la skill",
          ],
        ]
      : []),
    [
      "Spec draft",
      toVaultRelative(config, draftPackage.files.spec),
      `Draft funcional ${draftPackage.canonicalType}`,
    ],
    ...draftEvidenceRows(config, draftPackage),
  ]
  const draftRows = [
    ...draftRowsForPackage(config, draftPackage),
    ...(draftPackage.files.notes
      ? [
          [
            "notes.md",
            toVaultRelative(config, draftPackage.files.notes),
            "changelog.md / notas de aplicacion",
          ],
        ]
      : []),
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
    ["Evidencia minima disponible", "M", "si"],
    ["Toca canon existente", "M", touchesCanon],
    ["Contradiccion detectada", "M", "no"],
    ["Riesgo inicial", "M", "medium"],
    ["Requiere humano sugerido", "D", "no"],
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

${rawDocumentSection(config, contribution, draftPackage)}

${canonicalMaterialsSection(draftPackage)}

## Drafts usados
${renderMarkdownTable(["Draft", "Ubicacion", "Archivo canonico destino"], draftRows)}

## Canonicos relacionados
${extractSection(contribution.markdown, "Canonicos potencialmente afectados") ?? "| Canonico | Relacion |\n|---|---|\n| Pendiente | Pendiente |"}

## Riesgos o dudas
${extractSection(contribution.markdown, "Targets oficiales relacionados") ?? "Pendiente"}

${extractSection(contribution.markdown, "Metodologias relacionadas") ?? ""}

## Archivos canonicos esperados
${renderMarkdownTable(
  ["Accion", "Canonical ID", "Path esperado", "Nota"],
  expectedCanonicalRows(
    draftPackage,
    targetCanonicalPath,
    options.proposalId,
    changeType,
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
      return [
        [
          "Raw schema draft",
          toVaultRelative(config, requiredPath(draftPackage.files.rawSchema)),
          "Draft de raw schema DVC",
        ],
        [
          "Mapping draft",
          toVaultRelative(config, requiredPath(draftPackage.files.mapping)),
          "Draft de mapping hacia DOC estable",
        ],
        [
          "Parser config draft",
          toVaultRelative(
            config,
            requiredPath(draftPackage.files.parserConfig),
          ),
          "Draft de parser DVC",
        ],
      ]
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

function draftRowsForPackage(
  config: RouterConfig,
  draftPackage: SupportedDraftPackage,
): string[][] {
  switch (draftPackage.canonicalType) {
    case "DOC":
      return [
        [
          "spec_draft.md",
          toVaultRelative(config, draftPackage.files.spec),
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
      return [
        [
          "spec_draft.md",
          toVaultRelative(config, draftPackage.files.spec),
          "spec.md",
        ],
        [
          "raw_schema_draft.md",
          toVaultRelative(config, requiredPath(draftPackage.files.rawSchema)),
          "raw_schema.md",
        ],
        [
          "mapping_draft.md",
          toVaultRelative(config, requiredPath(draftPackage.files.mapping)),
          "mapping.md",
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
    case "DOL":
      return [
        [
          "spec_draft.md",
          toVaultRelative(config, draftPackage.files.spec),
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
        ["Variante / version", name],
        [
          "Archivos canonicos esperados",
          "spec.md / raw_schema.md / mapping.md / parser_config.md / changelog.md",
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
      return `${action} canonico \`${draftPackage.canonicalId}\` para documentar la variante cliente ${name}, incluyendo raw schema, mapping y parser config.`
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
        ["Que cambia por cliente/software", `Variante cliente ${name}.`],
        [
          "Software o formato origen",
          "Ver spec_draft.md y materiales fuente de la contribution.",
        ],
        ["Raw schema esperado", "Ver raw_schema_draft.md."],
        ["Parser config esperado", "Ver parser_config_draft.md."],
        ["Relacion con DOC estable", "Ver mapping_draft.md."],
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
): string {
  if (draftPackage.canonicalType === "DOL") return ""
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
  [
    [
      "Materiales fuente",
      stripTicks(contribution.identification["Persona fuente"]) || "Pendiente",
      `${toVaultRelative(config, contribution.path)}/materials/`,
      draftPackage.canonicalType === "DVC"
        ? "variante_cliente"
        : "documento_fuente",
      "evidencia_contextual",
      `${targetCanonicalFolder(draftPackage)}Examples/`,
    ],
  ],
)}
`
}

function canonicalMaterialsSection(
  draftPackage: SupportedDraftPackage,
): string {
  if (draftPackage.canonicalType === "DOL") return ""
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
  [
    [
      "copiar carpeta",
      "materials/",
      `${targetCanonicalFolder(draftPackage)}Examples/`,
      "evidencia_contextual",
      "si",
      "Copiar ejemplos solo si el editor humano o handler soportado lo confirma.",
    ],
  ],
)}
`
}

function expectedCanonicalRows(
  draftPackage: SupportedDraftPackage,
  targetCanonicalPath: string,
  proposalId: string,
  changeType: string,
): string[][] {
  const action = changeType === "new" ? "crear" : "modificar"
  const draftDestinations = expectedDraftDestinations(draftPackage)
  const rows = draftDestinations.map(([draftName, destinationFile]) => [
    action,
    `${draftPackage.canonicalId}/${destinationFile}`,
    `${targetCanonicalPath}${destinationFile}`,
    `Derivado de ${draftName}`,
  ])
  rows.push([
    action,
    `${draftPackage.canonicalId}/changelog.md`,
    `${targetCanonicalPath}changelog.md`,
    `Registro de cambio desde ${proposalId}`,
  ])
  return rows
}

function expectedDraftDestinations(
  draftPackage: SupportedDraftPackage,
): string[][] {
  switch (draftPackage.canonicalType) {
    case "DOC":
      return [
        ["spec_draft.md", "spec.md"],
        ["schema_draft.md", "schema.md"],
        ["parser_config_draft.md", "parser_config.md"],
      ]
    case "DVC":
      return [
        ["spec_draft.md", "spec.md"],
        ["raw_schema_draft.md", "raw_schema.md"],
        ["mapping_draft.md", "mapping.md"],
        ["parser_config_draft.md", "parser_config.md"],
      ]
    case "DOL":
      return [
        ["spec_draft.md", "spec.md"],
        ["document_transcript_draft.md", "document_transcript.md"],
      ]
  }
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
