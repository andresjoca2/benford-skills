import { existsSync } from "node:fs"
import { extractSection, parseFirstMarkdownTable } from "./markdown"
import {
  resolveExistingVaultPath,
  resolveVaultPath,
  toVaultRelative,
} from "./paths"
import type {
  CheckResult,
  ProposalPackage,
  ProposalQueue,
  RiskFactor,
  RiskLevel,
  RouterConfig,
  RouterDecision,
  RouterEvaluation,
} from "./types"

const REQUIRED_SECTIONS = [
  "Identificacion",
  "Campos para routing",
  "Contribution source",
  "Tipo de cambio",
  "Target canonico",
  "Cambio propuesto",
  "Evidencia usada",
  "Drafts usados",
  "Canonicos relacionados",
  "Riesgos o dudas",
  "Archivos canonicos esperados",
]

const REQUIRED_IDENTIFICATION = [
  "ID",
  "Tipo",
  "Estado",
  "Fecha creacion",
  "Owner operativo",
  "Contribution origen",
  "Tipo de cambio",
  "Target canonico ID",
  "Target canonico path",
  "Riesgo inicial",
]

const REQUIRED_ROUTING = [
  "Contribution origen",
  "Tipo de cambio",
  "Target canonico ID",
  "Target canonico path",
  "Evidencia minima disponible",
  "Toca canon existente",
  "Contradiccion detectada",
  "Riesgo inicial",
]

export function evaluateProposal(
  config: RouterConfig,
  proposal: ProposalPackage,
): RouterEvaluation {
  const checks: CheckResult[] = []
  const reasons: string[] = []
  const riskFactors: RiskFactor[] = []
  const mitigatingFactors: RiskFactor[] = []
  const contradictionsOrGaps: RouterEvaluation["contradictionsOrGaps"] = []
  const humanQuestions: RouterEvaluation["humanQuestions"] = []
  const filesRead = [
    {
      path: "proposal.md",
      type: "proposal",
      use: "Source proposal evaluated by Router Engine",
    },
  ]

  const missingSections = REQUIRED_SECTIONS.filter(
    (section) => !proposal.sections.has(section),
  )
  pushCheck(
    checks,
    "Required sections",
    missingSections.length === 0 ? "pass" : "fail",
    missingSections.length === 0
      ? "All required proposal sections are present."
      : `Missing: ${missingSections.join(", ")}`,
  )

  const missingIdentification = REQUIRED_IDENTIFICATION.filter((field) =>
    isBlank(proposal.identification[field]),
  )
  pushCheck(
    checks,
    "Metadata minima",
    missingIdentification.length === 0 ? "pass" : "fail",
    missingIdentification.length === 0
      ? "Identification table has required operational fields."
      : `Missing or pending fields: ${missingIdentification.join(", ")}`,
  )

  const missingRouting = REQUIRED_ROUTING.filter((field) =>
    isBlank(proposal.routingFields[field]),
  )
  pushCheck(
    checks,
    "Routing fields",
    missingRouting.length === 0 ? "pass" : "fail",
    missingRouting.length === 0
      ? "Campos para routing contains all mandatory V1 fields."
      : `Missing or pending fields: ${missingRouting.join(", ")}`,
  )

  const evidenceCheck = checkEvidenceLinks(config, proposal)
  checks.push(evidenceCheck.check)
  if (evidenceCheck.readFiles.length > 0)
    filesRead.push(...evidenceCheck.readFiles)
  if (evidenceCheck.missing.length > 0) {
    riskFactors.push({
      factor: "missing_evidence_links",
      description: `Referenced evidence paths do not exist: ${evidenceCheck.missing.join(", ")}`,
      evidence: "Evidencia usada",
    })
  }

  const targetCheck = checkTargetCanonical(config, proposal)
  checks.push(targetCheck.check)
  if (targetCheck.readFile) filesRead.push(targetCheck.readFile)
  if (targetCheck.gap) {
    contradictionsOrGaps.push({
      type: "target_canonical_gap",
      description: targetCheck.gap,
      evidence: "Target canonico",
      requiresHuman: false,
    })
  }

  const contradiction = normalizeFlag(
    proposal.routingFields["Contradiccion detectada"] ??
      proposal.identification["Contradiccion detectada"],
  )
  pushCheck(
    checks,
    "Contradiccion canonica",
    contradiction === "si"
      ? "fail"
      : contradiction === "unknown"
        ? "warning"
        : "pass",
    contradiction === "si"
      ? "Proposal declares a canonical contradiction."
      : contradiction === "unknown"
        ? "Proposal leaves contradiction status unknown."
        : "No declared canonical contradiction.",
  )

  const multiCanonical = detectMultiCanonicalImpact(proposal)
  pushCheck(
    checks,
    "Impacto multi-canonico",
    multiCanonical ? "warning" : "pass",
    multiCanonical
      ? "Proposal appears to affect multiple canonical IDs."
      : "No multi-canonical impact detected.",
  )
  if (multiCanonical) {
    riskFactors.push({
      factor: "multi_canonical_impact",
      description:
        "The proposal references more than one canonical ID in expected outputs or related canonicals.",
      evidence: "Archivos canonicos esperados / Canonicos relacionados",
    })
  }

  const riskLevel = calculateRiskLevel(
    proposal,
    riskFactors,
    contradiction,
    multiCanonical,
  )
  const explicitHuman = normalizeFlag(
    proposal.routingFields["Requiere humano sugerido"],
  )

  if (contradiction === "si") {
    reasons.push("Declared canonical contradiction requires human decision.")
    riskFactors.push({
      factor: "canonical_contradiction",
      description: "The proposal marks Contradiccion detectada as si.",
      evidence: "Campos para routing",
    })
    contradictionsOrGaps.push({
      type: "contradiccion",
      description: "La PROP declara contradiccion canonica.",
      evidence: "Campos para routing",
      requiresHuman: true,
    })
    humanQuestions.push({
      question:
        "Que version debe prevalecer: el canon actual o el cambio propuesto por la PROP?",
      why: "El Router no resuelve contradicciones canonicas por regla de sistema.",
      expectedAnswer:
        "Aprobar, rechazar, pedir reescritura o pedir evidencia adicional.",
    })
  }

  if (contradiction === "unknown") {
    reasons.push("Contradiction status is unknown and needs human review.")
    contradictionsOrGaps.push({
      type: "ambiguedad",
      description:
        "No queda determinado si la PROP contradice canonicos existentes.",
      evidence: "Campos para routing",
      requiresHuman: true,
    })
    humanQuestions.push({
      question:
        "La PROP contradice algun canonico vigente o puede aprobarse como cambio no conflictivo?",
      why: "El campo Contradiccion detectada esta en unknown.",
      expectedAnswer: "si / no, con ruta o ID del canonico afectado si aplica.",
    })
  }

  if (explicitHuman === "si") {
    reasons.push("Proposal Builder suggested human review.")
    humanQuestions.push({
      question: "Que decision humana especifica desbloquea esta PROP?",
      why: "La PROP marco Requiere humano sugerido como si.",
      expectedAnswer: "Decision, rationale y siguiente ruta.",
    })
  }

  if (riskLevel === "high" || riskLevel === "unknown") {
    riskFactors.push({
      factor: "risk_level_requires_review",
      description: `Risk level resolved to ${riskLevel}.`,
      evidence: "Riesgo inicial / analysis checks",
    })
  } else {
    mitigatingFactors.push({
      factor: "risk_level_allows_auto_route",
      description: `Risk level resolved to ${riskLevel}.`,
      evidence: "Campos para routing",
    })
  }

  const decision = decide(
    checks,
    proposal,
    riskLevel,
    contradiction,
    explicitHuman,
    multiCanonical,
    reasons,
    humanQuestions,
  )
  const toQueue = decisionToQueue(decision)

  if (reasons.length === 0) {
    reasons.push(
      decision === "approved_for_editor"
        ? "Metadata, evidence, target and risk checks allow routing to Canonical Editor."
        : "Deterministic routing rules selected this route.",
    )
  }

  return {
    decision,
    toQueue,
    riskLevel,
    checks,
    reasons,
    riskFactors,
    mitigatingFactors,
    contradictionsOrGaps,
    humanQuestions,
    filesRead,
  }
}

function checkEvidenceLinks(
  config: RouterConfig,
  proposal: ProposalPackage,
): {
  check: CheckResult
  missing: string[]
  readFiles: Array<{
    readonly path: string
    readonly type: string
    readonly use: string
  }>
} {
  const evidenceAvailable = normalizeFlag(
    proposal.routingFields["Evidencia minima disponible"],
  )
  const section = extractSection(proposal.markdown, "Evidencia usada")
  const table = parseFirstMarkdownTable(section)
  const locationHeader = table?.headers.find(
    (header) => header.toLowerCase() === "ubicacion",
  )
  const locations = locationHeader
    ? (table?.rows
        .map((row) => row[locationHeader]?.trim())
        .filter((value): value is string => Boolean(value)) ?? [])
    : []
  const realLocations = locations.filter((value) => !isBlank(value))
  const missing = realLocations.filter(
    (value) => !resolveExistingVaultPath(config, value),
  )

  if (evidenceAvailable === "no") {
    return {
      check: {
        name: "Evidence links",
        status: "fail",
        note: "PROP declares no minimum evidence available.",
      },
      missing,
      readFiles: [],
    }
  }
  if (missing.length > 0) {
    return {
      check: {
        name: "Evidence links",
        status: "fail",
        note: `Missing referenced paths: ${missing.join(", ")}`,
      },
      missing,
      readFiles: [],
    }
  }
  if (realLocations.length === 0) {
    return {
      check: {
        name: "Evidence links",
        status: "warning",
        note: "No concrete evidence paths were found in Evidencia usada.",
      },
      missing: [],
      readFiles: [],
    }
  }
  return {
    check: {
      name: "Evidence links",
      status: "pass",
      note: "Referenced evidence paths exist.",
    },
    missing: [],
    readFiles: realLocations.map((path) => ({
      path: toVaultRelative(config, resolveExistingVaultPath(config, path)),
      type: "evidence",
      use: "Referenced by proposal evidence table",
    })),
  }
}

function checkTargetCanonical(
  config: RouterConfig,
  proposal: ProposalPackage,
): {
  check: CheckResult
  readFile?: {
    readonly path: string
    readonly type: string
    readonly use: string
  }
  gap?: string
} {
  const touchesCanon = normalizeFlag(
    proposal.routingFields["Toca canon existente"],
  )
  const targetPath =
    proposal.identification["Target canonico path"] ||
    proposal.routingFields["Target canonico path"]
  const targetId =
    proposal.identification["Target canonico ID"] ||
    proposal.routingFields["Target canonico ID"]

  if (isBlank(targetId)) {
    return {
      check: {
        name: "Target canonico",
        status: "fail",
        note: "Missing Target canonico ID.",
      },
      gap: "Falta Target canonico ID.",
    }
  }

  if (touchesCanon === "si") {
    if (isBlank(targetPath)) {
      return {
        check: {
          name: "Target canonico",
          status: "fail",
          note: "Existing canonical target requires a concrete path.",
        },
        gap: "La PROP toca canon existente pero no declara path.",
      }
    }
    const concreteTargetPath = targetPath ?? ""
    const resolved = resolveVaultPath(config, concreteTargetPath)
    if (!resolved || !existsSync(resolved)) {
      return {
        check: {
          name: "Target canonico",
          status: "fail",
          note: `Target canonical path does not exist: ${concreteTargetPath}`,
        },
        gap: `Target canonico path no existe: ${concreteTargetPath}`,
      }
    }
    return {
      check: {
        name: "Target canonico",
        status: "pass",
        note: "Existing canonical target exists.",
      },
      readFile: {
        path: toVaultRelative(config, resolved),
        type: "canonical",
        use: "Existing target canonical",
      },
    }
  }

  if (touchesCanon === "no") {
    return {
      check: {
        name: "Target canonico",
        status: "pass",
        note: "New canonical target declared.",
      },
    }
  }

  return {
    check: {
      name: "Target canonico",
      status: "warning",
      note: "Cannot determine whether proposal touches existing canon.",
    },
    gap: "Toca canon existente no esta determinado.",
  }
}

function calculateRiskLevel(
  proposal: ProposalPackage,
  riskFactors: RiskFactor[],
  contradiction: "si" | "no" | "unknown",
  multiCanonical: boolean,
): RiskLevel {
  const initial = normalizeRisk(
    proposal.routingFields["Riesgo inicial"] ??
      proposal.identification["Riesgo inicial"],
  )
  if (contradiction === "si" || multiCanonical)
    return initial === "low" ? "medium" : initial
  if (riskFactors.length > 0 && initial === "low") return "medium"
  return initial
}

function decide(
  checks: CheckResult[],
  proposal: ProposalPackage,
  riskLevel: RiskLevel,
  contradiction: "si" | "no" | "unknown",
  explicitHuman: "si" | "no" | "unknown",
  multiCanonical: boolean,
  reasons: string[],
  humanQuestions: RouterEvaluation["humanQuestions"],
): RouterDecision {
  const failedChecks = checks.filter((check) => check.status === "fail")
  const evidenceFailed = failedChecks.some(
    (check) => check.name === "Evidence links",
  )
  const metadataFailed = failedChecks.some(
    (check) =>
      check.name === "Metadata minima" ||
      check.name === "Routing fields" ||
      check.name === "Required sections",
  )
  const targetFailed = failedChecks.some(
    (check) => check.name === "Target canonico",
  )

  if (evidenceFailed) {
    reasons.push("Evidence is missing or explicitly unavailable.")
    humanQuestions.push({
      question:
        "La evidencia faltante puede recuperarse o la PROP debe rechazarse?",
      why: "El Router no rechaza por si solo; solo escala faltantes de evidencia a decision humana.",
      expectedAnswer:
        "Aportar evidencia y regresar a Draft, aprobar manualmente con rationale, o rechazar.",
    })
    return "needs_human_decision"
  }
  if (metadataFailed || targetFailed) {
    reasons.push(
      "The issue is structural and needs human decision before routing can continue.",
    )
    humanQuestions.push({
      question:
        "La PROP debe corregirse y regresar a Draft, o puede aprobarse manualmente?",
      why: "Faltan campos, secciones o target canonico necesarios para aprobar automaticamente.",
      expectedAnswer:
        "Corregir/rewrite, aprobar con rationale, pedir evidencia adicional, o rechazar.",
    })
    return "needs_human_decision"
  }
  if (
    contradiction !== "no" ||
    explicitHuman !== "no" ||
    riskLevel === "high" ||
    riskLevel === "unknown" ||
    multiCanonical
  ) {
    return "needs_human_decision"
  }

  const changeType =
    proposal.identification["Tipo de cambio"] ??
    proposal.routingFields["Tipo de cambio"]
  if (changeType === "deprecate") {
    reasons.push("Deprecation requires human decision in V1.")
    return "needs_human_decision"
  }
  return "approved_for_editor"
}

export function decisionToQueue(decision: RouterDecision): ProposalQueue {
  switch (decision) {
    case "approved_for_editor":
      return "03 Approved for Editor"
    case "needs_human_decision":
      return "02 Needs Human Decision"
  }
}

function detectMultiCanonicalImpact(proposal: ProposalPackage): boolean {
  const expected =
    extractSection(proposal.markdown, "Archivos canonicos esperados") ?? ""
  const ids = new Set<string>()
  for (const match of expected.matchAll(
    /\b(?:AIM|DICT|DOC|DVC|DOL|METH|TEST|PEOP|FIRM|FIELD)-[A-Za-z0-9_-]+\b/g,
  )) {
    ids.add(match[0])
  }
  const target = proposal.identification["Target canonico ID"]
  if (target) ids.delete(target)
  return ids.size > 0
}

function normalizeFlag(value: string | undefined): "si" | "no" | "unknown" {
  const normalized = value?.trim().toLowerCase()
  if (normalized === "si" || normalized === "sí" || normalized === "yes")
    return "si"
  if (normalized === "no") return "no"
  return "unknown"
}

function normalizeRisk(value: string | undefined): RiskLevel {
  const normalized = value?.trim().toLowerCase()
  if (
    normalized === "low" ||
    normalized === "medium" ||
    normalized === "high" ||
    normalized === "unknown"
  )
    return normalized
  return "unknown"
}

function isBlank(value: string | undefined): boolean {
  if (!value) return true
  const normalized = value.trim().toLowerCase()
  return normalized === "" || normalized === "pendiente" || normalized === "n/a"
}

function pushCheck(
  checks: CheckResult[],
  name: string,
  status: CheckResult["status"],
  note: string,
): void {
  checks.push({ name, status, note })
}
