import { renderMarkdownTable } from "./markdown"
import type { ProposalPackage, RouterConfig, RouterEvaluation } from "./types"

export function renderRouterDecision(
  config: RouterConfig,
  proposal: ProposalPackage,
  evaluation: RouterEvaluation,
): string {
  const routeId = `ROUTE-${proposal.id}-${config.today}`
  return `# Router Decision

## Objetivo
Registrar el movimiento de una PROP hecho por Router Engine.

Este archivo es un recibo corto. El analisis completo vive en \`analysis_report.md\`.

## Identificacion

${renderMarkdownTable(
  ["Campo", "Valor"],
  [
    ["ID", routeId],
    ["Tipo", "router_decision"],
    ["Estado", evaluation.decision],
    ["Fecha creacion", config.today],
    ["Ultima actualizacion", config.today],
    ["Owner operativo", "Router Engine"],
    ["Proposal", proposal.id],
    ["From queue", proposal.queue],
    ["To queue", evaluation.toQueue],
    ["Analysis report", "analysis_report.md"],
  ],
)}

## Decision
${evaluation.decision}

Regla aplicada: ${summarizeRule(evaluation)}

## Archivos movidos o creados
${renderMarkdownTable(
  ["Archivo", "Accion", "Ruta"],
  [
    [
      "proposal.md",
      evaluation.toQueue === proposal.queue ? "Conservado" : "Movido",
      `${evaluation.toQueue}/${proposal.id}/proposal.md`,
    ],
    [
      "router_decision.md",
      "Creado / actualizado",
      `${evaluation.toQueue}/${proposal.id}/router_decision.md`,
    ],
    [
      "analysis_report.md",
      "Creado / actualizado",
      `${evaluation.toQueue}/${proposal.id}/analysis_report.md`,
    ],
    [
      "questions_for_human.md",
      evaluation.decision === "needs_human_decision"
        ? "Creado / actualizado"
        : "No aplica",
      `${evaluation.toQueue}/${proposal.id}/questions_for_human.md`,
    ],
  ],
)}

## Siguiente paso
${nextStep(evaluation.decision)}
`
}

export function renderAnalysisReport(
  config: RouterConfig,
  proposal: ProposalPackage,
  evaluation: RouterEvaluation,
): string {
  const analysisId = `ANALYSIS-${proposal.id}-${config.today}`
  return `# Analysis Report

## Objetivo
Documentar el analisis auditable del Router Engine para una PROP.

El riesgo vive en este archivo. No crear \`risk_score.md\` separado en V1.

## Identificacion

${renderMarkdownTable(
  ["Campo", "Valor"],
  [
    ["ID", analysisId],
    ["Tipo", "analysis_report"],
    ["Estado", "completed"],
    ["Fecha creacion", config.today],
    ["Ultima actualizacion", config.today],
    ["Owner operativo", "Router Engine"],
    ["Proposal", proposal.id],
    ["Router decision", "router_decision.md"],
    ["Risk level", evaluation.riskLevel],
  ],
)}

## Resumen
Router Engine evaluo \`${proposal.id}\` desde \`${proposal.queue}\` y decidio \`${evaluation.decision}\`.

## Checks ejecutados
${renderMarkdownTable(
  ["Check", "Resultado", "Nota"],
  evaluation.checks.map((check) => [check.name, check.status, check.note]),
)}

## Archivos leidos
${renderMarkdownTable(
  ["Archivo", "Tipo", "Uso"],
  evaluation.filesRead.map((file) => [file.path, file.type, file.use]),
)}

## Razones de la decision
${evaluation.reasons.map((reason) => `- ${reason}`).join("\n")}

## Riesgo
${renderMarkdownTable(
  ["Campo", "Valor"],
  [
    ["Nivel", evaluation.riskLevel],
    ["Justificacion", riskJustification(evaluation)],
    [
      "Requiere humano",
      evaluation.decision === "needs_human_decision" ? "si" : "no",
    ],
  ],
)}

## Factores de riesgo
${renderMarkdownTable(
  ["Factor", "Descripcion", "Evidencia"],
  evaluation.riskFactors.map((factor) => [
    factor.factor,
    factor.description,
    factor.evidence,
  ]),
)}

## Factores mitigantes
${renderMarkdownTable(
  ["Factor", "Descripcion", "Evidencia"],
  evaluation.mitigatingFactors.map((factor) => [
    factor.factor,
    factor.description,
    factor.evidence,
  ]),
)}

## Contradicciones o gaps
${renderMarkdownTable(
  ["Tipo", "Descripcion", "Evidencia", "Requiere humano"],
  evaluation.contradictionsOrGaps.map((gap) => [
    gap.type,
    gap.description,
    gap.evidence,
    gap.requiresHuman ? "si" : "no",
  ]),
)}

## Conclusion
${conclusion(evaluation)}
`
}

export function renderQuestionsForHuman(
  config: RouterConfig,
  proposal: ProposalPackage,
  evaluation: RouterEvaluation,
): string {
  const questionId = `QUESTIONS-${proposal.id}-${config.today}`
  const contribution =
    proposal.identification["Contribution origen"] ||
    proposal.routingFields["Contribution origen"] ||
    "Pendiente"
  const target =
    proposal.identification["Target canonico ID"] ||
    proposal.routingFields["Target canonico ID"] ||
    "Pendiente"

  return `# Questions for Human

## Objetivo
Listar las preguntas que el humano debe resolver cuando el Router Engine manda una PROP a \`02 Needs Human Decision/\`.

Este archivo no registra la decision final. La decision final vive en \`decision_record.md\`.

## Identificacion
${renderMarkdownTable(
  ["Campo", "Valor"],
  [
    ["ID", questionId],
    ["Tipo", "questions_for_human"],
    ["Estado", "open"],
    ["Fecha creacion", config.today],
    ["Ultima actualizacion", config.today],
    ["Owner operativo", "Router Engine / imss-tomar-decisiones"],
    ["Proposal", proposal.id],
    ["Contribution origen", contribution],
    ["Target canonico", target],
    ["Motivo de decision humana", evaluation.reasons.join("; ")],
    ["Router decision", "router_decision.md"],
    ["Analysis report", "analysis_report.md"],
  ],
)}

## Por que necesita humano
${evaluation.reasons.join("\n\n")}

## Canonicos afectados
${renderMarkdownTable(["Canonico", "Seccion / archivo", "Riesgo"], [[target, "Pendiente", evaluation.riskLevel]])}

## Contradiccion, ambiguedad o gap
${renderMarkdownTable(
  ["Tipo", "Descripcion", "Evidencia"],
  evaluation.contradictionsOrGaps.map((gap) => [
    gap.type,
    gap.description,
    gap.evidence,
  ]),
)}

## Preguntas para el humano
${renderMarkdownTable(
  ["Pregunta", "Por que importa", "Opciones / respuesta esperada"],
  evaluation.humanQuestions.map((question) => [
    question.question,
    question.why,
    question.expectedAnswer,
  ]),
)}

## Opciones de decision
${renderMarkdownTable(
  ["Opcion", "Resultado"],
  [
    ["Aprobar PROP como esta", "Mover a `03 Approved for Editor`."],
    [
      "Aprobar con cambios",
      "Actualizar PROP y mover a `03 Approved for Editor`.",
    ],
    ["Rechazar", "Mover a `05 Rejected`."],
    [
      "Pedir mas evidencia",
      "Mantener en `02 Needs Human Decision` o regresar a `01 Draft`.",
    ],
  ],
)}

## Contexto minimo
Leer \`proposal.md\`, \`analysis_report.md\` y la evidencia referenciada antes de decidir.

## Que se necesita para desbloquear
Registrar la respuesta final en \`decision_record.md\` mediante \`imss-tomar-decisiones\`.

## Donde registrar la decision
Registrar la respuesta final en \`decision_record.md\`.
`
}

function summarizeRule(evaluation: RouterEvaluation): string {
  if (evaluation.decision === "approved_for_editor")
    return "complete_traceable_low_or_medium_risk"
  return "human_judgment_required"
}

function nextStep(decision: string): string {
  if (decision === "approved_for_editor")
    return "Canonical Editor puede aplicar la PROP aprobada."
  return "Ejecutar imss-tomar-decisiones para registrar decision_record.md."
}

function riskJustification(evaluation: RouterEvaluation): string {
  if (evaluation.riskFactors.length === 0)
    return "No se detectaron factores de riesgo deterministico en V1."
  return evaluation.riskFactors.map((factor) => factor.factor).join(", ")
}

function conclusion(evaluation: RouterEvaluation): string {
  if (evaluation.decision === "approved_for_editor") {
    return "La PROP puede pasar a `03 Approved for Editor`."
  }
  if (evaluation.decision === "needs_human_decision") {
    return "La PROP requiere decision humana antes de pasar al editor canonico."
  }
  return "La PROP puede pasar a `03 Approved for Editor`."
}
