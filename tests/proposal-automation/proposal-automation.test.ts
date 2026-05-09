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

  test("detects ready contributions regardless of generic Estado and plans Proposal Generator", () => {
    const vaultRoot = makeVault()
    writeContributionMap(vaultRoot, {
      id: "CONTRIBUTION-2026-05-03-ready",
      estado: "draft_generated",
      automationState: "ready",
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
    expect(events[0]?.status).toBe("pending")
    expect(events[0]?.nextSkill).toBe("IMSS-Proposal-Generator")
    expect(events[0]?.proposalGeneratorResult?.proposalId).toBe("PROP-0001")
  })

  test("ignores complete contributions until Estado automation is ready", () => {
    const vaultRoot = makeVault()
    writeContributionMap(vaultRoot, {
      id: "CONTRIBUTION-2026-05-03-not-ready",
      estado: "draft_generated",
      automationState: "draft",
    })
    writeContributionMap(vaultRoot, {
      id: "CONTRIBUTION-2026-05-03-missing-state",
      estado: "draft_generated",
      automationState: undefined,
    })

    const check = checkProposalAutomations({
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
    })

    expect(check.contributions.count).toBe(0)
    expect(check.skippedContributions).toEqual([
      expect.objectContaining({
        id: "CONTRIBUTION-2026-05-03-missing-state",
        automationState: "missing",
        reason: "missing Estado automation in ## Identificacion",
        supportedOutputs: ["DOC-test"],
      }),
      expect.objectContaining({
        id: "CONTRIBUTION-2026-05-03-not-ready",
        automationState: "draft",
        reason: "Estado automation is draft",
        supportedOutputs: ["DOC-test"],
      }),
    ])
    expect(runProposalAutomations({ vaultRoot })).toHaveLength(0)
  })

  test("diagnoses contributions missing the Identificacion section", () => {
    const vaultRoot = makeVault()
    writeContributionMap(vaultRoot, {
      id: "CONTRIBUTION-2026-05-03-no-identification",
      estado: "draft_generated",
      automationState: "ready",
      omitIdentification: true,
      canonicalType: "DVC",
      outputIds: ["DVC-test"],
    })

    const check = checkProposalAutomations({
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
    })

    expect(check.contributions.count).toBe(0)
    expect(check.skippedContributions).toEqual([
      expect.objectContaining({
        id: "CONTRIBUTION-2026-05-03-no-identification",
        automationState: "missing",
        reason: "missing Estado automation in ## Identificacion",
        supportedOutputs: ["DVC-test"],
      }),
    ])
  })

  test("detects DVC and DOL contribution outputs", () => {
    const dvcVaultRoot = makeVault()
    writeContributionMap(dvcVaultRoot, {
      id: "CONTRIBUTION-2026-05-03-dvc",
      estado: "draft_generated",
      automationState: "ready",
      canonicalType: "DVC",
      outputIds: ["DVC-test"],
    })

    const dvcEvents = runProposalAutomations({
      vaultRoot: dvcVaultRoot,
      runtimeDir: join(dvcVaultRoot, ".runtime"),
    })

    expect(dvcEvents[0]?.proposalGeneratorResult?.canonicalType).toBe("DVC")
    expect(dvcEvents[0]?.proposalGeneratorResult?.proposalType).toBe("PROP-DVC")
    expect(dvcEvents[0]?.proposalGeneratorResult?.targetCanonicalId).toBe(
      "DVC-test",
    )

    const dolVaultRoot = makeVault()
    writeContributionMap(dolVaultRoot, {
      id: "CONTRIBUTION-2026-05-03-dol",
      estado: "draft_generated",
      automationState: "ready",
      canonicalType: "DOL",
      outputIds: ["DOL-test"],
    })

    const dolEvents = runProposalAutomations({
      vaultRoot: dolVaultRoot,
      runtimeDir: join(dolVaultRoot, ".runtime"),
    })

    expect(dolEvents[0]?.proposalGeneratorResult?.canonicalType).toBe("DOL")
    expect(dolEvents[0]?.proposalGeneratorResult?.proposalType).toBe("PROP-DOL")
    expect(dolEvents[0]?.proposalGeneratorResult?.targetCanonicalId).toBe(
      "DOL-test",
    )
  })

  test("write mode copies DOL source documents declared in contribution map", () => {
    const vaultRoot = makeVault()
    writeContributionMap(vaultRoot, {
      id: "CONTRIBUTION-2026-05-03-dol-source",
      estado: "draft_generated",
      automationState: "ready",
      canonicalType: "DOL",
      outputIds: ["DOL-reglamento-test"],
      canonicalMaterials: [
        {
          sourcePath: "materials/Reg_LSS_MACERF.pdf",
          destinationPath: "source_documents/Reg_LSS_MACERF.pdf",
          type: "fuente_legal_original",
          note: "PDF fuente usado para transcripcion DOL.",
        },
      ],
    })

    const events = runProposalAutomations({
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
      today: "2026-05-03",
      write: true,
    })

    expect(events.map((event) => event.action)).toEqual([
      "generate_proposal",
      "route_draft",
      "invoke_skill",
    ])
    expect(events[2]?.editorResult?.canonicalMaterials).toEqual([
      {
        sourcePath:
          "01 Contribuciones/CONTRIBUTION-2026-05-03-dol-source/materials/Reg_LSS_MACERF.pdf",
        destinationPath:
          "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOL Documentos de Leyes/DOL-reglamento-test/source_documents/Reg_LSS_MACERF.pdf",
        action: "copy",
      },
    ])
    expect(
      existsSync(
        join(
          vaultRoot,
          "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOL Documentos de Leyes/DOL-reglamento-test/source_documents/Reg_LSS_MACERF.pdf",
        ),
      ),
    ).toBe(true)
  })

  test("does not require source_documents_map for DVC contributions", () => {
    const vaultRoot = makeVault()
    writeContributionMap(vaultRoot, {
      id: "CONTRIBUTION-2026-05-03-dvc-no-source-map",
      estado: "draft_generated",
      automationState: "ready",
      canonicalType: "DVC",
      outputIds: ["DVC-test"],
      declareDvcExampleMaterials: false,
    })

    const check = checkProposalAutomations({
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
    })

    expect(check.contributions.count).toBe(1)
    expect(check.contributions.contributionIds).toEqual([
      "CONTRIBUTION-2026-05-03-dvc-no-source-map",
    ])
    expect(check.skippedContributions).toEqual([])
  })

  test("skips ready contributions that already reference generated proposals", () => {
    const vaultRoot = makeVault()
    writeContributionMap(vaultRoot, {
      id: "CONTRIBUTION-2026-05-03-done",
      estado: "ready_for_proposal",
      automationState: "ready",
      proposalId: "PROP-DOC-0001",
    })

    const check = checkProposalAutomations({
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
    })

    expect(check.contributions.count).toBe(0)
    expect(runProposalAutomations({ vaultRoot })).toHaveLength(0)
  })

  test("does not treat similarly prefixed contribution IDs as generated", () => {
    const vaultRoot = makeVault()
    writeContributionMap(vaultRoot, {
      id: "CONTRIBUTION-2026-05-03-comprobante-pago-sua",
      estado: "draft_generated",
      automationState: "ready",
    })
    writeProposal(
      vaultRoot,
      "PROP-0001",
      completeProposal("PROP-0001").replace(
        /CONTRIBUTION-2026-05-03-test/g,
        "CONTRIBUTION-2026-05-03-comprobante-pago-sua-v2",
      ),
    )
    moveProposal(vaultRoot, "PROP-0001", "01 Draft", "04 Applied")

    const check = checkProposalAutomations({
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
    })

    expect(check.contributions.contributionIds).toEqual([
      "CONTRIBUTION-2026-05-03-comprobante-pago-sua",
    ])
  })

  test("write mode generates a PROP from a contribution, routes it, and applies it", () => {
    const vaultRoot = makeVault()
    writeContributionMap(vaultRoot, {
      id: "CONTRIBUTION-2026-05-03-auto",
      estado: "draft_generated",
      automationState: "ready",
    })

    const events = runProposalAutomations({
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
      today: "2026-05-03",
      write: true,
    })

    expect(events.map((event) => event.action)).toEqual([
      "generate_proposal",
      "route_draft",
      "invoke_skill",
    ])
    expect(events[0]?.proposalId).toBe("PROP-0001")
    expect(events[1]?.routerResult?.decision).toBe("approved_for_editor")
    expect(events[2]?.editorResult?.dryRun).toBe(false)
    expect(events[2]?.editorResult?.canonicalMaterials).toEqual([
      {
        sourcePath:
          "01 Contribuciones/CONTRIBUTION-2026-05-03-auto/materials/source_documents/examples/Selim",
        destinationPath:
          "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-test/Examples/Selim",
        action: "copy",
      },
    ])
    expect(
      existsSync(join(vaultRoot, "02 Proposals/04 Applied/PROP-0001")),
    ).toBe(true)
    expect(
      existsSync(
        join(
          vaultRoot,
          "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-test/Examples/Selim/example.pdf",
        ),
      ),
    ).toBe(true)
    expect(
      readFileSync(
        join(
          vaultRoot,
          "01 Contribuciones/CONTRIBUTION-2026-05-03-auto/contribution_map.md",
        ),
        "utf8",
      ),
    ).toContain("| PROP-0001 |")
  })

  test("write mode applies supported DVC proposals", () => {
    const vaultRoot = makeVault()
    writeContributionMap(vaultRoot, {
      id: "CONTRIBUTION-2026-05-03-dvc-auto",
      estado: "draft_generated",
      automationState: "ready",
      canonicalType: "DVC",
      outputIds: ["DVC-test"],
    })

    const events = runProposalAutomations({
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
      today: "2026-05-03",
      write: true,
    })

    expect(events.map((event) => event.action)).toEqual([
      "generate_proposal",
      "route_draft",
      "invoke_skill",
    ])
    expect(events[2]?.status).toBe("handled")
    expect(events[2]?.editorResult?.targetCanonicalId).toBe("DVC-test")
    expect(
      existsSync(
        join(
          vaultRoot,
          "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-test/Variante Test/raw_schema.md",
        ),
      ),
    ).toBe(true)
    expect(
      existsSync(join(vaultRoot, "02 Proposals/04 Applied/PROP-0001")),
    ).toBe(true)
  })

  test("write mode enriches an existing DVC with a new variant folder", () => {
    const vaultRoot = makeVault()
    writeExistingDvc(vaultRoot, "DVC-colaboradores-vigentes")
    writeContributionMap(vaultRoot, {
      id: "CONTRIBUTION-2026-05-03-dvc-copa",
      estado: "draft_generated",
      automationState: "ready",
      canonicalType: "DVC",
      outputIds: ["DVC-colaboradores-vigentes"],
      variantNames: ["Copa"],
    })

    const events = runProposalAutomations({
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
      today: "2026-05-03",
      write: true,
    })

    const proposal = readFileSync(
      join(vaultRoot, "02 Proposals/04 Applied/PROP-0001/proposal.md"),
      "utf8",
    )
    expect(events[0]?.proposalGeneratorResult?.targetCanonicalId).toBe(
      "DVC-colaboradores-vigentes",
    )
    expect(events[2]?.editorResult?.targetCanonicalId).toBe(
      "DVC-colaboradores-vigentes",
    )
    expect(proposal).toContain("| Tipo de cambio | enrich |")
    expect(proposal).toContain(
      "| Target canonico ID | DVC-colaboradores-vigentes |",
    )
    expect(proposal).toContain("| Copa/raw_schema_draft.md |")
    expect(
      existsSync(
        join(
          vaultRoot,
          "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-colaboradores-vigentes/Copa/raw_schema.md",
        ),
      ),
    ).toBe(true)
    expect(
      existsSync(
        join(
          vaultRoot,
          "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-colaboradores-vigentes/Copa/Ejemplos/Selim/example.pdf",
        ),
      ),
    ).toBe(true)
    expect(
      existsSync(
        join(
          vaultRoot,
          "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-colaboradores-vigentes/README.md",
        ),
      ),
    ).toBe(false)
  })

  test("supports DVC variant drafts with shared root spec", () => {
    const vaultRoot = makeVault()
    writeContributionMap(vaultRoot, {
      id: "CONTRIBUTION-2026-05-03-dvc-root-spec",
      estado: "draft_generated",
      automationState: "ready",
      canonicalType: "DVC",
      outputIds: ["DVC-root-spec"],
      variantNames: ["Variante RSM Merida"],
    })
    const outputRoot = join(
      vaultRoot,
      "01 Contribuciones/CONTRIBUTION-2026-05-03-dvc-root-spec/skill_outputs/explicit_knowledge/DVC-root-spec",
    )
    renameSync(
      join(outputRoot, "Variante RSM Merida/spec_draft.md"),
      join(outputRoot, "spec_draft.md"),
    )

    const check = checkProposalAutomations({
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
    })

    expect(check.contributions.contributionIds).toEqual([
      "CONTRIBUTION-2026-05-03-dvc-root-spec",
    ])
    const events = runProposalAutomations({
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
      today: "2026-05-03",
      write: true,
    })

    expect(events[0]?.proposalGeneratorResult?.targetCanonicalId).toBe(
      "DVC-root-spec",
    )
    expect(
      existsSync(
        join(
          vaultRoot,
          "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-root-spec/Variante RSM Merida/spec.md",
        ),
      ),
    ).toBe(true)
  })

  test("routes partial DVC modifications as one human-review PROP", () => {
    const vaultRoot = makeVault()
    writeExistingDvc(vaultRoot, "DVC-test", "Copa")
    writeContributionMap(vaultRoot, {
      id: "CONTRIBUTION-2026-05-03-dvc-modification",
      estado: "draft_generated",
      automationState: "ready",
      canonicalType: "DVC",
      outputIds: [],
      declareDvcExampleMaterials: false,
    })
    writeDvcModificationDraft(vaultRoot, {
      contributionId: "CONTRIBUTION-2026-05-03-dvc-modification",
      canonicalId: "DVC-test",
      variantName: "Copa",
    })

    const events = runProposalAutomations({
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
      today: "2026-05-03",
      write: true,
    })

    expect(events.map((event) => event.action)).toEqual([
      "generate_proposal",
      "route_draft",
      "wait_for_human",
    ])
    expect(events[1]?.routerResult?.decision).toBe("needs_human_decision")
    expect(
      existsSync(
        join(vaultRoot, "02 Proposals/02 Needs Human Decision/PROP-0001"),
      ),
    ).toBe(true)
    const proposal = readFileSync(
      join(
        vaultRoot,
        "02 Proposals/02 Needs Human Decision/PROP-0001/proposal.md",
      ),
      "utf8",
    )
    expect(proposal).toContain("| Requiere humano sugerido | D | si |")
    expect(proposal).toContain("| Copa/modification_schema.md |")
    expect(proposal).toContain("| Copa/modification_parser.md |")
  })

  test("generates one DVC PROP with multiple variant folders", () => {
    const vaultRoot = makeVault()
    writeContributionMap(vaultRoot, {
      id: "CONTRIBUTION-2026-05-03-multi-dvc",
      estado: "draft_generated",
      automationState: "ready",
      canonicalType: "DVC",
      outputIds: ["DVC-alpha"],
      variantNames: ["Constructora Parmol", "Servicios Administrativos"],
      exampleFolders: [
        "Constructora Parmol",
        "Servicios Administrativos Playa San Jose",
      ],
      canonicalMaterials: [
        {
          sourcePath: "materials/source_documents/examples/Constructora Parmol",
          destinationPath: "Constructora Parmol/Ejemplos/Constructora Parmol",
          type: "variante_cliente",
        },
        {
          sourcePath:
            "materials/source_documents/examples/Servicios Administrativos Playa San Jose",
          destinationPath:
            "Servicios Administrativos/Ejemplos/Servicios Administrativos Playa San Jose",
          type: "variante_cliente",
        },
      ],
    })

    const events = runProposalAutomations({
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
      today: "2026-05-03",
      write: true,
    })

    expect(events.map((event) => event.action)).toEqual([
      "generate_proposal",
      "route_draft",
      "invoke_skill",
    ])

    const map = readFileSync(
      join(
        vaultRoot,
        "01 Contribuciones/CONTRIBUTION-2026-05-03-multi-dvc/contribution_map.md",
      ),
      "utf8",
    )
    expect(map).toContain("| PROP-0001 |")
    expect(map).toContain(
      "| PROP-0001 | 02 Proposals/01 Draft/PROP-0001 | PROP-DVC | DVC-alpha | draft |",
    )
    expect(
      existsSync(
        join(
          vaultRoot,
          "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-alpha/Constructora Parmol/raw_schema.md",
        ),
      ),
    ).toBe(true)
    expect(
      existsSync(
        join(
          vaultRoot,
          "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-alpha/Servicios Administrativos/parser_config.md",
        ),
      ),
    ).toBe(true)
    expect(
      existsSync(
        join(
          vaultRoot,
          "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-alpha/Constructora Parmol/Ejemplos/Constructora Parmol/example.pdf",
        ),
      ),
    ).toBe(true)
    expect(
      existsSync(
        join(
          vaultRoot,
          "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-alpha/Servicios Administrativos/Ejemplos/Servicios Administrativos Playa San Jose/example.pdf",
        ),
      ),
    ).toBe(true)
    expect(
      checkProposalAutomations({
        vaultRoot,
        runtimeDir: join(vaultRoot, ".runtime"),
      }).contributions.count,
    ).toBe(0)
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

  test("write mode skips malformed approved proposals without aborting the run", () => {
    const vaultRoot = makeVault()
    writeProposal(vaultRoot, "PROP-0002", malformedProposal("PROP-0002"))
    moveProposal(vaultRoot, "PROP-0002", "01 Draft", "03 Approved for Editor")
    writeProposal(vaultRoot, "PROP-0003", completeProposal("PROP-0003"))

    const events = runProposalAutomations({
      vaultRoot,
      runtimeDir: join(vaultRoot, ".runtime"),
      today: "2026-05-03",
      write: true,
    })

    expect(events.map((event) => [event.id, event.status])).toEqual([
      ["PROP-0003", "handled"],
      ["PROP-0002", "skipped"],
      ["PROP-0003", "handled"],
    ])
    expect(events[1]?.detail).toContain(
      "Canonical Editor only supports PROP-DOC, PROP-DVC, PROP-DOL",
    )
    expect(
      existsSync(
        join(vaultRoot, "02 Proposals/03 Approved for Editor/PROP-0002"),
      ),
    ).toBe(true)
    expect(
      existsSync(join(vaultRoot, "02 Proposals/04 Applied/PROP-0003")),
    ).toBe(true)
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
  options: {
    id: string
    estado: string
    automationState?: string
    proposalId?: string
    canonicalType?: "DOC" | "DVC" | "DOL"
    outputIds?: string[]
    variantNames?: string[]
    exampleFolders?: string[]
    omitIdentification?: boolean
    declareDvcExampleMaterials?: boolean
    canonicalMaterials?: Array<{
      sourcePath: string
      destinationPath: string
      type: string
      note?: string
    }>
  },
): void {
  const contributionRoot = join(vaultRoot, "01 Contribuciones", options.id)
  mkdirSync(contributionRoot, { recursive: true })
  const variantNames = options.variantNames ?? ["Variante Test"]
  for (const exampleFolder of options.exampleFolders ?? ["Selim"]) {
    const exampleRoot = join(
      contributionRoot,
      "materials/source_documents/examples",
      exampleFolder,
    )
    mkdirSync(exampleRoot, { recursive: true })
    writeFileSync(join(exampleRoot, "example.pdf"), "fixture", "utf8")
  }
  const effectiveCanonicalMaterials =
    options.canonicalMaterials ??
    (options.canonicalType === "DVC" &&
    options.declareDvcExampleMaterials !== false
      ? (options.exampleFolders ?? ["Selim"]).map((exampleFolder) => ({
          sourcePath: `materials/source_documents/examples/${exampleFolder}`,
          destinationPath: `${variantNames[0] ?? "Variante Test"}/Ejemplos/${exampleFolder}`,
          type: "variante_cliente",
          note: "Fixture material",
        }))
      : [])
  for (const material of effectiveCanonicalMaterials) {
    const materialPath = join(contributionRoot, material.sourcePath)
    if (!existsSync(materialPath)) {
      mkdirSync(join(materialPath, ".."), { recursive: true })
      writeFileSync(materialPath, "fixture", "utf8")
    }
  }
  const proposalRow = options.proposalId
    ? `| ${options.proposalId} | Draft creado |`
    : "| Pendiente | N/A |"
  const canonicalMaterialsSection =
    effectiveCanonicalMaterials.length > 0
      ? `
## Materiales canonicos sugeridos
| Origen en contribution | Destino canonico esperado | Tipo | Copiar | Nota |
|---|---|---|---|---|
${effectiveCanonicalMaterials.map((material) => `| ${material.sourcePath} | ${material.destinationPath} | ${material.type} | si | ${material.note ?? "Fixture material"} |`).join("\n")}
`
      : ""

  writeFileSync(
    join(contributionRoot, "contribution_map.md"),
    `# ${options.id}

${
  options.omitIdentification
    ? ""
    : `
## Identificacion
| Campo | Valor |
|---|---|
| ID | ${options.id} |
| Estado | ${options.estado} |
${options.automationState === undefined ? "" : `| Estado automation | ${options.automationState} |\n`}
`
}

## Proposals generadas
| PROP | Estado |
|---|---|
${proposalRow}
${canonicalMaterialsSection}
    `,
    "utf8",
  )
  for (const outputId of options.outputIds ?? [
    `${options.canonicalType ?? "DOC"}-test`,
  ]) {
    writeDrafts(contributionRoot, outputId, {
      variantNames,
    })
  }
}

function writeDrafts(
  contributionRoot: string,
  outputId: string,
  options: {
    variantNames?: string[]
  } = {},
): void {
  const variantNames = options.variantNames ?? ["Variante Test"]
  const outputRoot = join(
    contributionRoot,
    "skill_outputs/explicit_knowledge",
    outputId,
  )
  mkdirSync(outputRoot, { recursive: true })
  if (outputId.startsWith("DOC-")) {
    writeFileSync(join(outputRoot, "spec_draft.md"), "# Spec draft\n", "utf8")
    writeFileSync(
      join(outputRoot, "schema_draft.md"),
      "# Schema draft\n",
      "utf8",
    )
    writeFileSync(
      join(outputRoot, "parser_config_draft.md"),
      "# Parser draft\n",
      "utf8",
    )
  }
  if (outputId.startsWith("DVC-")) {
    for (const variantName of variantNames) {
      const variantRoot = join(outputRoot, variantName)
      mkdirSync(variantRoot, { recursive: true })
      writeFileSync(
        join(variantRoot, "spec_draft.md"),
        "# Spec draft\n",
        "utf8",
      )
      writeFileSync(
        join(variantRoot, "raw_schema_draft.md"),
        "# Raw schema draft\n",
        "utf8",
      )
      writeFileSync(
        join(variantRoot, "parser_config_draft.md"),
        "# Parser draft\n",
        "utf8",
      )
    }
  }
  if (outputId.startsWith("DOL-")) {
    writeFileSync(join(outputRoot, "spec_draft.md"), "# Spec draft\n", "utf8")
    writeFileSync(
      join(outputRoot, "document_transcript_draft.md"),
      "# Transcript draft\n",
      "utf8",
    )
  }
  writeFileSync(join(outputRoot, "notes.md"), "# Notes\n", "utf8")
}

function writeExistingDvc(
  vaultRoot: string,
  canonicalId: string,
  variantName?: string,
): void {
  const canonicalRoot = join(
    vaultRoot,
    "05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente",
    canonicalId,
  )
  mkdirSync(canonicalRoot, { recursive: true })
  if (!variantName) return
  const variantRoot = join(canonicalRoot, variantName)
  mkdirSync(variantRoot, { recursive: true })
  writeFileSync(join(variantRoot, "spec.md"), "# Existing spec\n", "utf8")
  writeFileSync(join(variantRoot, "raw_schema.md"), "old raw schema\n", "utf8")
  writeFileSync(join(variantRoot, "parser_config.md"), "old parser\n", "utf8")
  writeFileSync(
    join(variantRoot, "changelog.md"),
    "# Existing changelog\n",
    "utf8",
  )
}

function writeDvcModificationDraft(
  vaultRoot: string,
  options: {
    contributionId: string
    canonicalId: string
    variantName: string
  },
): void {
  const variantRoot = join(
    vaultRoot,
    "01 Contribuciones",
    options.contributionId,
    "skill_outputs/explicit_knowledge",
    options.canonicalId,
    options.variantName,
  )
  mkdirSync(variantRoot, { recursive: true })
  writeFileSync(
    join(variantRoot, "modification_schema.md"),
    "# Modification schema\n\nAgregar columna x al raw schema.\n",
    "utf8",
  )
  writeFileSync(
    join(variantRoot, "modification_parser.md"),
    "# Modification parser\n\nActualizar parser_config para columna x.\n",
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

function malformedProposal(proposalId: string): string {
  return `# ${proposalId}

## Identificacion
| Campo | Valor |
|---|---|
| ID | ${proposalId} |
| Estado | draft |
| Target canonico ID | DOC-test |
| Target canonico path | 05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-test/spec.md |
`
}
