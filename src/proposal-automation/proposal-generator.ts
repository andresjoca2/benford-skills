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

interface DocDraftPackage {
  readonly docId: string
  readonly path: string
  readonly files: {
    readonly spec: string
    readonly schema: string
    readonly parserConfig: string
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
  const docDraft = findDocDraftPackage(contribution)
  if (!docDraft) {
    throw new Error(
      `No supported DOC draft package found for ${contribution.id}`,
    )
  }

  const proposalId = nextProposalId(config)
  const proposalRoot = proposalPackagePath(config, proposalId, "01 Draft")
  const proposalPath = join(proposalRoot, "proposal.md")
  const proposalMarkdown = renderDocProposal(config, contribution, docDraft, {
    proposalId,
  })
  const dryRun = options.write !== true

  if (!dryRun) {
    if (existsSync(proposalRoot)) {
      throw new Error(`Proposal destination already exists: ${proposalId}`)
    }
    mkdirSync(proposalRoot, { recursive: true })
    writeFileSync(proposalPath, proposalMarkdown, "utf8")
    updateContributionMap(config, contribution, proposalId, docDraft.docId)
  }

  return {
    contributionId: contribution.id,
    proposalId,
    proposalPath: toVaultRelative(config, proposalPath),
    targetCanonicalId: docDraft.docId,
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
  if (hasGeneratedProposal(config, id, markdown)) return null
  if (!findDocDraftPackage({ path: contributionPath })) {
    return null
  }
  return {
    id,
    path: contributionPath,
    mapPath,
    markdown,
    identification,
  }
}

function hasGeneratedProposal(
  config: RouterConfig,
  contributionId: string,
  contributionMarkdown: string,
): boolean {
  const proposals = extractSection(contributionMarkdown, "Proposals generadas")
  if (proposals && /\|\s*PROP-(?:[A-Z]+-)?\d+\b/.test(proposals)) return true

  return QUEUES.some((queue) =>
    listProposalIds(config, queue).some((proposalId) => {
      const path = join(
        proposalPackagePath(config, proposalId, queue),
        "proposal.md",
      )
      return (
        existsSync(path) && readFileSync(path, "utf8").includes(contributionId)
      )
    }),
  )
}

function findDocDraftPackage(
  contribution: Pick<ContributionPackage, "path">,
): DocDraftPackage | null {
  const explicitRoot = join(
    contribution.path,
    "skill_outputs/explicit_knowledge",
  )
  if (!existsSync(explicitRoot)) return null
  const docDirs = readdirSync(explicitRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("DOC-"))
    .map((entry) => join(explicitRoot, entry.name))
    .sort()

  for (const docPath of docDirs) {
    const spec = join(docPath, "spec_draft.md")
    const schema = join(docPath, "schema_draft.md")
    const parserConfig = join(docPath, "parser_config_draft.md")
    if (!existsSync(spec) || !existsSync(schema) || !existsSync(parserConfig)) {
      continue
    }
    const notes = join(docPath, "notes.md")
    const sourceManifest = join(docPath, "source_manifest.md")
    return {
      docId: basename(docPath),
      path: docPath,
      files: {
        spec,
        schema,
        parserConfig,
        notes: existsSync(notes) ? notes : undefined,
        sourceManifest: existsSync(sourceManifest) ? sourceManifest : undefined,
      },
    }
  }

  return null
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

function renderDocProposal(
  config: RouterConfig,
  contribution: ContributionPackage,
  docDraft: DocDraftPackage,
  options: { readonly proposalId: string },
): string {
  const targetCanonicalPath = `05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/${docDraft.docId}/`
  const name = humanizeDocId(docDraft.docId)
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
    ...(docDraft.files.sourceManifest
      ? [
          [
            "Source manifest",
            toVaultRelative(config, docDraft.files.sourceManifest),
            "Manifest de fuentes usadas por la skill",
          ],
        ]
      : []),
    [
      "Spec draft",
      toVaultRelative(config, docDraft.files.spec),
      "Draft funcional DOC",
    ],
    [
      "Schema draft",
      toVaultRelative(config, docDraft.files.schema),
      "Draft de schema DOC",
    ],
    [
      "Parser config draft",
      toVaultRelative(config, docDraft.files.parserConfig),
      "Draft de parser DOC",
    ],
  ]
  const draftRows = [
    ["spec_draft.md", toVaultRelative(config, docDraft.files.spec), "spec.md"],
    [
      "schema_draft.md",
      toVaultRelative(config, docDraft.files.schema),
      "schema.md",
    ],
    [
      "parser_config_draft.md",
      toVaultRelative(config, docDraft.files.parserConfig),
      "parser_config.md",
    ],
    ...(docDraft.files.notes
      ? [
          [
            "notes.md",
            toVaultRelative(config, docDraft.files.notes),
            "changelog.md / notas de aplicacion",
          ],
        ]
      : []),
  ]

  return `# ${options.proposalId} - DOC ${name}

## Objetivo
Proponer la creacion del documento fuente estable \`${docDraft.docId}\` dentro de Explicit Knowledge V3, a partir de la contribution \`${contribution.id}\`.

## Identificacion
${renderMarkdownTable(
  ["Campo", "Valor"],
  [
    ["ID", options.proposalId],
    ["Tipo", "PROP-DOC"],
    ["Estado", "draft"],
    ["Fecha creacion", config.today],
    ["Ultima actualizacion", config.today],
    ["Owner operativo", "Proposal Builder"],
    ["Contribution origen", contribution.id],
    ["Tipo de cambio", "new"],
    ["Target canonico ID", docDraft.docId],
    ["Target canonico path", targetCanonicalPath],
    ["Riesgo inicial", "medium"],
    ["Capa", "explicit_knowledge"],
    ["Canonical type", "DOC"],
  ],
)}

## Campos para routing
${renderMarkdownTable(
  ["Campo", "Prioridad", "Valor"],
  [
    ["Contribution origen", "M", contribution.id],
    ["Tipo de cambio", "M", "new"],
    ["Target canonico ID", "M", docDraft.docId],
    ["Target canonico path", "M", targetCanonicalPath],
    ["Evidencia minima disponible", "M", "si"],
    ["Toca canon existente", "M", "no"],
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
    ["Tipo", "new"],
    [
      "Motivo",
      `La contribution contiene drafts DOC completos para proponer un nuevo canonico ${docDraft.docId}.`,
    ],
  ],
)}

## Target canonico
${renderMarkdownTable(
  ["Campo", "Valor"],
  [
    ["DOC ID", docDraft.docId],
    ["Nombre documento", name],
    ["Carpeta destino", targetCanonicalPath],
    [
      "Archivos canonicos esperados",
      "spec.md / schema.md / parser_config.md / changelog.md",
    ],
  ],
)}

## Cambio propuesto
Crear un nuevo canonico \`${docDraft.docId}\` para documentar ${name} como documento fuente estable de auditoria IMSS.

La propuesta debe crear los archivos canonicos iniciales \`spec.md\`, \`schema.md\`, \`parser_config.md\` y \`changelog.md\` a partir de los drafts de la contribution.

## Detalle DOC
${renderMarkdownTable(
  ["Campo", "Valor"],
  [
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
  ],
)}

## Evidencia usada
${renderMarkdownTable(["Evidencia", "Ubicacion", "Uso"], evidenceRows)}

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
  [
    [
      "crear",
      `${docDraft.docId}/spec.md`,
      `${targetCanonicalPath}spec.md`,
      "Contrato funcional y uso auditor del documento",
    ],
    [
      "crear",
      `${docDraft.docId}/schema.md`,
      `${targetCanonicalPath}schema.md`,
      "Schema inicial del documento",
    ],
    [
      "crear",
      `${docDraft.docId}/parser_config.md`,
      `${targetCanonicalPath}parser_config.md`,
      "Estrategia inicial de parser",
    ],
    [
      "crear",
      `${docDraft.docId}/changelog.md`,
      `${targetCanonicalPath}changelog.md`,
      `Registro inicial de creacion desde ${options.proposalId}`,
    ],
  ],
)}
`
}

function updateContributionMap(
  config: RouterConfig,
  contribution: ContributionPackage,
  proposalId: string,
  targetCanonicalId: string,
): void {
  const row = `| ${proposalId} | 02 Proposals/01 Draft/${proposalId} | PROP-DOC | ${targetCanonicalId} | draft |`
  let markdown = contribution.markdown
  const heading = "## Proposals generadas"
  const start = markdown.indexOf(heading)
  const nextHeading =
    start === -1 ? -1 : markdown.indexOf("\n## ", start + heading.length)
  const replacement = `${heading}
Las PROPs viven en \`02 Proposals\`, no dentro de esta contribution.

| PROP | Ubicacion | Tipo | Target | Estado |
|---|---|---|---|---|
${row}
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

function humanizeDocId(docId: string): string {
  return docId
    .replace(/^DOC-/, "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function stripTicks(value: string | undefined): string {
  return (value ?? "").trim().replace(/^`+|`+$/g, "")
}
