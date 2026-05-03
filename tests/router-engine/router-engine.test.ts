import { describe, expect, test } from "bun:test"
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { checkRouter, runRouterForProposal } from "@/router-engine"

describe("benford router engine", () => {
  test("dry-run approves a complete low-risk new canonical proposal without writing", () => {
    const vaultRoot = makeVault()
    writeProposal(
      vaultRoot,
      "PROP-0001",
      completeProposal("PROP-0001", {
        contradiction: "no",
        risk: "low",
        requiresHuman: "no",
      }),
    )

    const result = runRouterForProposal("PROP-0001", {
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
      today: "2026-05-03",
    })

    expect(result.dryRun).toBe(true)
    expect(result.decision).toBe("approved_for_editor")
    expect(result.toQueue).toBe("03 Approved for Editor")
    expect(
      existsSync(
        join(vaultRoot, "02 Proposals/01 Draft/PROP-0001/router_decision.md"),
      ),
    ).toBe(false)
  })

  test("write mode moves a proposal requiring human decision and creates questions", () => {
    const vaultRoot = makeVault()
    writeProposal(
      vaultRoot,
      "PROP-0002",
      completeProposal("PROP-0002", {
        contradiction: "si",
        risk: "medium",
        requiresHuman: "si",
      }),
    )

    const result = runRouterForProposal("PROP-0002", {
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
      today: "2026-05-03",
      write: true,
    })

    const movedRoot = join(
      vaultRoot,
      "02 Proposals/02 Needs Human Decision/PROP-0002",
    )
    expect(result.dryRun).toBe(false)
    expect(result.decision).toBe("needs_human_decision")
    expect(existsSync(join(movedRoot, "proposal.md"))).toBe(true)
    expect(existsSync(join(movedRoot, "router_decision.md"))).toBe(true)
    expect(existsSync(join(movedRoot, "analysis_report.md"))).toBe(true)
    expect(existsSync(join(movedRoot, "questions_for_human.md"))).toBe(true)
    expect(
      readFileSync(join(movedRoot, "router_decision.md"), "utf8"),
    ).toContain("needs_human_decision")
  })

  test("missing evidence is escalated to human decision", () => {
    const vaultRoot = makeVault()
    writeProposal(
      vaultRoot,
      "PROP-0003",
      completeProposal("PROP-0003", {
        contradiction: "no",
        risk: "low",
        requiresHuman: "no",
        evidencePath: "01 Contribuciones/missing/materials/source.md",
      }),
    )

    const result = runRouterForProposal("PROP-0003", {
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
      today: "2026-05-03",
    })

    expect(result.decision).toBe("needs_human_decision")
    expect(result.toQueue).toBe("02 Needs Human Decision")
    expect(result.evaluation.humanQuestions[0]?.question).toContain(
      "evidencia faltante",
    )
  })

  test("check lists draft proposals from portable vault root", () => {
    const vaultRoot = makeVault()
    writeProposal(vaultRoot, "PROP-0004", completeProposal("PROP-0004"))

    const result = checkRouter({
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
    })

    expect(result.draftProposalIds).toEqual(["PROP-0004"])
  })
})

function makeVault(): string {
  const root = mkdtempSync(join(tmpdir(), "benford-router-test-"))
  mkdirSync(join(root, "00 Sistema"), { recursive: true })
  mkdirSync(
    join(root, "01 Contribuciones/CONTRIBUTION-2026-05-03-test/materials"),
    { recursive: true },
  )
  mkdirSync(join(root, "02 Proposals/01 Draft"), { recursive: true })
  mkdirSync(join(root, "02 Proposals/02 Needs Human Decision"), {
    recursive: true,
  })
  mkdirSync(join(root, "02 Proposals/03 Approved for Editor"), {
    recursive: true,
  })
  mkdirSync(join(root, "02 Proposals/04 Applied"), { recursive: true })
  mkdirSync(join(root, "02 Proposals/05 Rejected"), { recursive: true })
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

function writeProposal(
  vaultRoot: string,
  proposalId: string,
  content: string,
): void {
  const proposalRoot = join(vaultRoot, "02 Proposals/01 Draft", proposalId)
  mkdirSync(proposalRoot, { recursive: true })
  writeFileSync(join(proposalRoot, "proposal.md"), content, "utf8")
}

function completeProposal(
  proposalId: string,
  options: {
    contradiction?: "si" | "no" | "unknown"
    risk?: "low" | "medium" | "high" | "unknown"
    requiresHuman?: "si" | "no" | "unknown"
    evidencePath?: string
  } = {},
): string {
  const contradiction = options.contradiction ?? "no"
  const risk = options.risk ?? "low"
  const requiresHuman = options.requiresHuman ?? "no"
  const evidencePath =
    options.evidencePath ??
    "01 Contribuciones/CONTRIBUTION-2026-05-03-test/materials/source.md"

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
| Riesgo inicial | ${risk} |

## Campos para routing
| Campo | Prioridad | Valor |
|---|---|---|
| Contribution origen | M | CONTRIBUTION-2026-05-03-test |
| Tipo de cambio | M | new |
| Target canonico ID | M | DOC-test |
| Target canonico path | M | 05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-test/spec.md |
| Evidencia minima disponible | M | si |
| Toca canon existente | M | no |
| Contradiccion detectada | M | ${contradiction} |
| Riesgo inicial | M | ${risk} |
| Requiere humano sugerido | D | ${requiresHuman} |

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
| source.md | ${evidencePath} | Evidencia fixture |

## Drafts usados
| Draft | Ubicacion | Archivo canonico destino |
|---|---|---|
| spec_draft.md | ${evidencePath} | spec.md |

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
