import { describe, expect, test } from "bun:test"
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  checkProposalAutomations,
  runProposalAutomations,
} from "@/proposal-automation"

describe("benford proposal automation", () => {
  test("check reports proposal counts and rules for each queue", () => {
    const vaultRoot = makeVault()
    writeProposal(vaultRoot, "PROP-0001", completeProposal("PROP-0001"))
    moveProposal(vaultRoot, "PROP-0001", "01 Draft", "03 Approved for Editor")

    const check = checkProposalAutomations({
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
    })

    expect(
      check.queues.find((entry) => entry.queue === "01 Draft")?.count,
    ).toBe(0)
    expect(
      check.queues.find((entry) => entry.queue === "03 Approved for Editor")
        ?.proposalIds,
    ).toEqual(["PROP-0001"])
    expect(
      check.queues.find((entry) => entry.queue === "03 Approved for Editor")
        ?.rule.skillName,
    ).toBe("benford-canonical-editor")
  })

  test("detects ready contributions and requests Proposal Generator", () => {
    const vaultRoot = makeVault()
    writeContributionMap(vaultRoot, {
      id: "CONTRIBUTION-2026-05-03-ready",
      estado: "ready_for_proposal",
    })

    const check = checkProposalAutomations({
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
    })

    expect(check.contributions.count).toBe(1)
    expect(check.contributions.contributionIds).toEqual([
      "CONTRIBUTION-2026-05-03-ready",
    ])
    expect(check.contributions.rule.skillName).toBe("IMSS-Proposal-Generator")

    const events = runProposalAutomations({
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
    })

    expect(events).toHaveLength(1)
    expect(events[0]?.subject).toBe("contribution")
    expect(events[0]?.contributionId).toBe("CONTRIBUTION-2026-05-03-ready")
    expect(events[0]?.action).toBe("generate_proposal")
    expect(events[0]?.status).toBe("pending_manual")
    expect(events[0]?.nextSkill).toBe("IMSS-Proposal-Generator")
  })

  test("skips ready contributions that already reference generated proposals", () => {
    const vaultRoot = makeVault()
    writeContributionMap(vaultRoot, {
      id: "CONTRIBUTION-2026-05-03-done",
      estado: "ready_for_proposal",
      proposalId: "PROP-DOC-0001",
    })

    const check = checkProposalAutomations({
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
    })

    expect(check.contributions.count).toBe(0)
    expect(runProposalAutomations({ vaultRoot })).toHaveLength(0)
  })

  test("dry-run routes draft proposals without writing", () => {
    const vaultRoot = makeVault()
    writeProposal(vaultRoot, "PROP-0002", completeProposal("PROP-0002"))

    const events = runProposalAutomations({
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
      today: "2026-05-03",
    })

    expect(events).toHaveLength(1)
    expect(events[0]?.action).toBe("route_draft")
    expect(events[0]?.status).toBe("pending")
    expect(events[0]?.routerResult?.toQueue).toBe("03 Approved for Editor")
    expect(
      existsSync(
        join(vaultRoot, "02 Proposals/01 Draft/PROP-0002/router_decision.md"),
      ),
    ).toBe(false)
  })

  test("write mode routes drafts and applies supported approved proposals", () => {
    const vaultRoot = makeVault()
    writeProposal(vaultRoot, "PROP-0003", completeProposal("PROP-0003"))

    const events = runProposalAutomations({
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
      today: "2026-05-03",
      write: true,
    })

    const appliedRoot = join(vaultRoot, "02 Proposals/04 Applied/PROP-0003")
    expect(events[0]?.status).toBe("handled")
    expect(events[0]?.routerResult?.dryRun).toBe(false)
    expect(events[1]?.status).toBe("handled")
    expect(events[1]?.editorResult?.dryRun).toBe(false)
    expect(existsSync(join(appliedRoot, "router_decision.md"))).toBe(true)
    expect(
      readFileSync(join(appliedRoot, "router_decision.md"), "utf8"),
    ).toContain("approved_for_editor")
    expect(existsSync(join(appliedRoot, "applied_record.md"))).toBe(true)

    const followUpEvents = runProposalAutomations({
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
      today: "2026-05-03",
    })
    expect(followUpEvents).toHaveLength(0)
  })
})

function makeVault(): string {
  const root = mkdtempSync(join(tmpdir(), "benford-automation-test-"))
  mkdirSync(join(root, "00 Sistema"), { recursive: true })
  mkdirSync(
    join(root, "01 Contribuciones/CONTRIBUTION-2026-05-03-test/materials"),
    { recursive: true },
  )
  for (const queue of [
    "01 Draft",
    "02 Needs Human Decision",
    "03 Approved for Editor",
    "04 Applied",
    "05 Rejected",
  ]) {
    mkdirSync(join(root, "02 Proposals", queue), { recursive: true })
  }
  writeFileSync(
    join(root, "00 Sistema/contrato-metadata-minima.md"),
    "# contrato\n",
    "utf8",
  )
  writeFileSync(
    join(root, "00 Sistema/contrato-artefactos-operativos.md"),
    "# contrato\n",
    "utf8",
  )
  writeFileSync(
    join(
      root,
      "01 Contribuciones/CONTRIBUTION-2026-05-03-test/materials/source.md",
    ),
    "# source\n",
    "utf8",
  )
  return root
}

function writeContributionMap(
  vaultRoot: string,
  options: { id: string; estado: string; proposalId?: string },
): void {
  const contributionRoot = join(vaultRoot, "01 Contribuciones", options.id)
  mkdirSync(contributionRoot, { recursive: true })
  const proposalRow = options.proposalId
    ? `| ${options.proposalId} | Draft creado |`
    : "| Pendiente | N/A |"

  writeFileSync(
    join(contributionRoot, "contribution_map.md"),
    `# ${options.id}

## Identificacion
| Campo | Valor |
|---|---|
| ID | ${options.id} |
| Estado | ${options.estado} |

## Proposals generadas
| PROP | Estado |
|---|---|
${proposalRow}
`,
    "utf8",
  )
}

function writeProposal(
  vaultRoot: string,
  proposalId: string,
  content: string,
): void {
  const proposalRoot = join(vaultRoot, "02 Proposals/01 Draft", proposalId)
  mkdirSync(proposalRoot, { recursive: true })
  writeFileSync(join(proposalRoot, "proposal.md"), content, "utf8")
}

function moveProposal(
  vaultRoot: string,
  proposalId: string,
  fromQueue: string,
  toQueue: string,
): void {
  renameSync(
    join(vaultRoot, "02 Proposals", fromQueue, proposalId),
    join(vaultRoot, "02 Proposals", toQueue, proposalId),
  )
}

function completeProposal(proposalId: string): string {
  return `# ${proposalId}

## Identificacion
| Campo | Valor |
|---|---|
| ID | ${proposalId} |
| Tipo | PROP-DOC |
| Estado | draft |
| Fecha creacion | 2026-05-03 |
| Ultima actualizacion | 2026-05-03 |
| Owner operativo | Proposal Builder |
| Contribution origen | CONTRIBUTION-2026-05-03-test |
| Tipo de cambio | new |
| Target canonico ID | DOC-test |
| Target canonico path | 05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-test/spec.md |
| Riesgo inicial | low |

## Campos para routing
| Campo | Prioridad | Valor |
|---|---|---|
| Contribution origen | M | CONTRIBUTION-2026-05-03-test |
| Tipo de cambio | M | new |
| Target canonico ID | M | DOC-test |
| Target canonico path | M | 05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-test/spec.md |
| Evidencia minima disponible | M | si |
| Toca canon existente | M | no |
| Contradiccion detectada | M | no |
| Riesgo inicial | M | low |
| Requiere humano sugerido | D | no |

## Contribution source
| Campo | Valor |
|---|---|
| Contribution origen | CONTRIBUTION-2026-05-03-test |
| Carpeta fuente | 01 Contribuciones/CONTRIBUTION-2026-05-03-test |
| Persona / firma fuente | Test |

## Tipo de cambio
| Campo | Valor |
|---|---|
| Tipo | new |
| Motivo | Test fixture |

## Target canonico
| Campo | Valor |
|---|---|
| DOC ID | DOC-test |
| Nombre documento | Documento test |
| Carpeta destino | 05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-test |

## Cambio propuesto
Crear documento canonico de prueba.

## Evidencia usada
| Evidencia | Ubicacion | Uso |
|---|---|---|
| source.md | 01 Contribuciones/CONTRIBUTION-2026-05-03-test/materials/source.md | Evidencia fixture |

## Drafts usados
| Draft | Ubicacion | Archivo canonico destino |
|---|---|---|
| spec_draft.md | 01 Contribuciones/CONTRIBUTION-2026-05-03-test/materials/source.md | spec.md |

## Canonicos relacionados
| Canonico | Relacion |
|---|---|
| N/A | N/A |

## Riesgos o dudas
Sin dudas.

## Archivos canonicos esperados
| Accion | Canonical ID | Path esperado | Nota |
|---|---|---|---|
| crear | DOC-test | 05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-test/spec.md | Nuevo |
`
}
