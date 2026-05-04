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
import { applyCanonicalProposal } from "@/canonical-editor"
import { runProposalAutomations } from "@/proposal-automation"

describe("benford canonical editor", () => {
  test("dry-run plans canonical files without writing", () => {
    const vaultRoot = makeVault()
    writeApprovedProposal(vaultRoot, "PROP-0001")

    const plan = applyCanonicalProposal("PROP-0001", {
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
      today: "2026-05-03",
    })

    expect(plan.dryRun).toBe(true)
    expect(plan.destinationQueue).toBe("04 Applied")
    expect(plan.canonicalFiles.map((file) => file.destinationPath)).toEqual([
      "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-test/spec.md",
      "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-test/schema.md",
      "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-test/changelog.md",
    ])
    expect(
      existsSync(
        join(
          vaultRoot,
          "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-test/spec.md",
        ),
      ),
    ).toBe(false)
  })

  test("write mode creates canonical files, applied record, and moves proposal", () => {
    const vaultRoot = makeVault()
    writeApprovedProposal(vaultRoot, "PROP-0002")

    const plan = applyCanonicalProposal("PROP-0002", {
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
      today: "2026-05-03",
      write: true,
    })

    const canonicalSpec = join(
      vaultRoot,
      "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-test/spec.md",
    )
    const appliedRoot = join(vaultRoot, "02 Proposals/04 Applied/PROP-0002")
    expect(plan.dryRun).toBe(false)
    expect(existsSync(canonicalSpec)).toBe(true)
    expect(readFileSync(canonicalSpec, "utf8")).toContain("Tipo | canonical")
    expect(existsSync(join(appliedRoot, "applied_record.md"))).toBe(true)
    expect(existsSync(join(appliedRoot, "proposal.md"))).toBe(true)
  })

  test("automation write applies approved proposals", () => {
    const vaultRoot = makeVault()
    writeApprovedProposal(vaultRoot, "PROP-0003")

    const events = runProposalAutomations({
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
      today: "2026-05-03",
      write: true,
    })

    expect(events).toHaveLength(1)
    expect(events[0]?.queue).toBe("03 Approved for Editor")
    expect(events[0]?.status).toBe("handled")
    expect(events[0]?.editorResult?.targetCanonicalId).toBe("DOC-test")
    expect(
      existsSync(join(vaultRoot, "02 Proposals/04 Applied/PROP-0003")),
    ).toBe(true)
  })

  test("write mode applies approved DVC proposals", () => {
    const vaultRoot = makeVault()
    writeApprovedProposal(vaultRoot, "PROP-0004", dvcProposal("PROP-0004"))

    const plan = applyCanonicalProposal("PROP-0004", {
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
      today: "2026-05-03",
      write: true,
    })

    expect(plan.targetCanonicalId).toBe("DVC-test")
    expect(plan.canonicalFiles.map((file) => file.destinationPath)).toContain(
      "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-test/Variante Test/raw_schema.md",
    )
    expect(
      existsSync(
        join(
          vaultRoot,
          "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-test/Variante Test/mapping.md",
        ),
      ),
    ).toBe(true)
    expect(
      existsSync(join(vaultRoot, "02 Proposals/04 Applied/PROP-0004")),
    ).toBe(true)
  })

  test("write mode applies approved DOL proposals", () => {
    const vaultRoot = makeVault()
    writeApprovedProposal(vaultRoot, "PROP-0005", dolProposal("PROP-0005"))

    const plan = applyCanonicalProposal("PROP-0005", {
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
      today: "2026-05-03",
      write: true,
    })

    expect(plan.targetCanonicalId).toBe("DOL-test")
    expect(plan.canonicalFiles.map((file) => file.destinationPath)).toContain(
      "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOL Documentos de Leyes/DOL-test/document_transcript.md",
    )
    expect(
      existsSync(
        join(
          vaultRoot,
          "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOL Documentos de Leyes/DOL-test/document_transcript.md",
        ),
      ),
    ).toBe(true)
    expect(
      existsSync(join(vaultRoot, "02 Proposals/04 Applied/PROP-0005")),
    ).toBe(true)
  })
})

function makeVault(): string {
  const root = mkdtempSync(join(tmpdir(), "benford-canonical-editor-test-"))
  mkdirSync(join(root, "00 Sistema"), { recursive: true })
  mkdirSync(
    join(root, "01 Contribuciones/CONTRIBUTION-2026-05-03-test/drafts"),
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
      "01 Contribuciones/CONTRIBUTION-2026-05-03-test/drafts/spec_draft.md",
    ),
    "# Spec Draft\n\n## Identificacion\n| Campo | Valor |\n|---|---|\n| Tipo | skill_output |\n\n## Proposito\nSpec fixture.\n",
    "utf8",
  )
  writeFileSync(
    join(
      root,
      "01 Contribuciones/CONTRIBUTION-2026-05-03-test/drafts/schema_draft.md",
    ),
    "# Schema Draft\n\n## Identificacion\n| Campo | Valor |\n|---|---|\n| Tipo | skill_output |\n\n## Proposito\nSchema fixture.\n",
    "utf8",
  )
  writeFileSync(
    join(
      root,
      "01 Contribuciones/CONTRIBUTION-2026-05-03-test/drafts/notes.md",
    ),
    "# Notes\n\n## Proposito\nNotes fixture.\n",
    "utf8",
  )
  writeFileSync(
    join(
      root,
      "01 Contribuciones/CONTRIBUTION-2026-05-03-test/drafts/raw_schema_draft.md",
    ),
    "# Raw Schema Draft\n\n## Proposito\nRaw schema fixture.\n",
    "utf8",
  )
  writeFileSync(
    join(
      root,
      "01 Contribuciones/CONTRIBUTION-2026-05-03-test/drafts/mapping_draft.md",
    ),
    "# Mapping Draft\n\n## Proposito\nMapping fixture.\n",
    "utf8",
  )
  writeFileSync(
    join(
      root,
      "01 Contribuciones/CONTRIBUTION-2026-05-03-test/drafts/parser_config_draft.md",
    ),
    "# Parser Config Draft\n\n## Proposito\nParser fixture.\n",
    "utf8",
  )
  writeFileSync(
    join(
      root,
      "01 Contribuciones/CONTRIBUTION-2026-05-03-test/drafts/document_transcript_draft.md",
    ),
    "# Document Transcript Draft\n\n## Proposito\nTranscript fixture.\n",
    "utf8",
  )
  return root
}

function writeApprovedProposal(
  vaultRoot: string,
  proposalId: string,
  content = proposal(proposalId),
): void {
  const proposalRoot = join(
    vaultRoot,
    "02 Proposals/03 Approved for Editor",
    proposalId,
  )
  mkdirSync(proposalRoot, { recursive: true })
  writeFileSync(join(proposalRoot, "proposal.md"), content, "utf8")
  writeFileSync(
    join(proposalRoot, "router_decision.md"),
    `# Router Decision

## Identificacion
| Campo | Valor |
|---|---|
| ID | ROUTE-${proposalId}-2026-05-03 |
| Tipo | router_decision |
| Estado | approved_for_editor |
| Proposal | ${proposalId} |
`,
    "utf8",
  )
}

function proposal(proposalId: string): string {
  return `# ${proposalId}

## Identificacion
| Campo | Valor |
|---|---|
| ID | ${proposalId} |
| Tipo | PROP-DOC |
| Estado | approved_for_editor |
| Fecha creacion | 2026-05-03 |
| Ultima actualizacion | 2026-05-03 |
| Owner operativo | Proposal Builder |
| Contribution origen | CONTRIBUTION-2026-05-03-test |
| Tipo de cambio | new |
| Target canonico ID | DOC-test |
| Target canonico path | 05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-test/ |
| Riesgo inicial | low |
| Capa | explicit_knowledge |
| Canonical type | DOC |

## Campos para routing
| Campo | Prioridad | Valor |
|---|---|---|
| Target canonico path | M | 05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-test/ |

## Contribution source
| Campo | Valor |
|---|---|
| Contribution origen | CONTRIBUTION-2026-05-03-test |

## Tipo de cambio
| Campo | Valor |
|---|---|
| Tipo | new |

## Target canonico
| Campo | Valor |
|---|---|
| DOC ID | DOC-test |

## Cambio propuesto
Crear DOC-test.

## Evidencia usada
| Evidencia | Ubicacion | Uso |
|---|---|---|
| source | 01 Contribuciones/CONTRIBUTION-2026-05-03-test/drafts/spec_draft.md | fixture |

## Drafts usados
| Draft | Ubicacion | Archivo canonico destino |
|---|---|---|
| spec_draft.md | 01 Contribuciones/CONTRIBUTION-2026-05-03-test/drafts/spec_draft.md | spec.md |
| schema_draft.md | 01 Contribuciones/CONTRIBUTION-2026-05-03-test/drafts/schema_draft.md | schema.md |
| notes.md | 01 Contribuciones/CONTRIBUTION-2026-05-03-test/drafts/notes.md | changelog.md / notas de aplicacion |

## Canonicos relacionados
| Canonico | Relacion |
|---|---|
| N/A | N/A |

## Riesgos o dudas
N/A

## Archivos canonicos esperados
| Accion | Canonical ID | Path esperado | Nota |
|---|---|---|---|
| crear | DOC-test/spec.md | 05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-test/spec.md | fixture |
`
}

function dvcProposal(proposalId: string): string {
  return `# ${proposalId}

## Identificacion
| Campo | Valor |
|---|---|
| ID | ${proposalId} |
| Tipo | PROP-DVC |
| Estado | approved_for_editor |
| Fecha creacion | 2026-05-03 |
| Ultima actualizacion | 2026-05-03 |
| Owner operativo | Proposal Builder |
| Contribution origen | CONTRIBUTION-2026-05-03-test |
| Tipo de cambio | new |
| Target canonico ID | DVC-test |
| Target canonico path | 05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-test/ |
| Riesgo inicial | low |
| Capa | explicit_knowledge |
| Canonical type | DVC |

## Campos para routing
| Campo | Prioridad | Valor |
|---|---|---|
| Target canonico path | M | 05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-test/ |

## Contribution source
| Campo | Valor |
|---|---|
| Contribution origen | CONTRIBUTION-2026-05-03-test |

## Tipo de cambio
| Campo | Valor |
|---|---|
| Tipo | new |

## Target canonico
| Campo | Valor |
|---|---|
| DVC ID | DVC-test |

## Cambio propuesto
Crear DVC-test.

## Evidencia usada
| Evidencia | Ubicacion | Uso |
|---|---|---|
| source | 01 Contribuciones/CONTRIBUTION-2026-05-03-test/drafts/spec_draft.md | fixture |

## Drafts usados
| Draft | Ubicacion | Archivo canonico destino |
|---|---|---|
| spec_draft.md | 01 Contribuciones/CONTRIBUTION-2026-05-03-test/drafts/spec_draft.md | spec.md |
| spec_draft.md | 01 Contribuciones/CONTRIBUTION-2026-05-03-test/drafts/spec_draft.md | README.md |
| raw_schema_draft.md | 01 Contribuciones/CONTRIBUTION-2026-05-03-test/drafts/raw_schema_draft.md | Variante Test/raw_schema.md |
| mapping_draft.md | 01 Contribuciones/CONTRIBUTION-2026-05-03-test/drafts/mapping_draft.md | Variante Test/mapping.md |
| parser_config_draft.md | 01 Contribuciones/CONTRIBUTION-2026-05-03-test/drafts/parser_config_draft.md | Variante Test/parser_config.md |
| notes.md | 01 Contribuciones/CONTRIBUTION-2026-05-03-test/drafts/notes.md | changelog.md / notas de aplicacion |

## Canonicos relacionados
| Canonico | Relacion |
|---|---|
| N/A | N/A |

## Riesgos o dudas
N/A

## Archivos canonicos esperados
| Accion | Canonical ID | Path esperado | Nota |
|---|---|---|---|
| crear | DVC-test/spec.md | 05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-test/spec.md | fixture |
`
}

function dolProposal(proposalId: string): string {
  return `# ${proposalId}

## Identificacion
| Campo | Valor |
|---|---|
| ID | ${proposalId} |
| Tipo | PROP-DOL |
| Estado | approved_for_editor |
| Fecha creacion | 2026-05-03 |
| Ultima actualizacion | 2026-05-03 |
| Owner operativo | Proposal Builder |
| Contribution origen | CONTRIBUTION-2026-05-03-test |
| Tipo de cambio | new |
| Target canonico ID | DOL-test |
| Target canonico path | 05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOL Documentos de Leyes/DOL-test/ |
| Riesgo inicial | low |
| Capa | explicit_knowledge |
| Canonical type | DOL |

## Campos para routing
| Campo | Prioridad | Valor |
|---|---|---|
| Target canonico path | M | 05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOL Documentos de Leyes/DOL-test/ |

## Contribution source
| Campo | Valor |
|---|---|
| Contribution origen | CONTRIBUTION-2026-05-03-test |

## Tipo de cambio
| Campo | Valor |
|---|---|
| Tipo | new |

## Target canonico
| Campo | Valor |
|---|---|
| DOL ID | DOL-test |

## Cambio propuesto
Crear DOL-test.

## Evidencia usada
| Evidencia | Ubicacion | Uso |
|---|---|---|
| source | 01 Contribuciones/CONTRIBUTION-2026-05-03-test/drafts/spec_draft.md | fixture |

## Drafts usados
| Draft | Ubicacion | Archivo canonico destino |
|---|---|---|
| spec_draft.md | 01 Contribuciones/CONTRIBUTION-2026-05-03-test/drafts/spec_draft.md | spec.md |
| document_transcript_draft.md | 01 Contribuciones/CONTRIBUTION-2026-05-03-test/drafts/document_transcript_draft.md | document_transcript.md |

## Canonicos relacionados
| Canonico | Relacion |
|---|---|
| N/A | N/A |

## Riesgos o dudas
N/A

## Archivos canonicos esperados
| Accion | Canonical ID | Path esperado | Nota |
|---|---|---|---|
| crear | DOL-test/spec.md | 05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOL Documentos de Leyes/DOL-test/spec.md | fixture |
`
}
