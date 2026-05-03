import {
  existsSync,
  mkdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { dirname, join } from "node:path"
import { evaluateProposal } from "./evaluate"
import {
  findProposalPackage,
  listDraftProposalIds,
  loadProposalPackage,
} from "./load-proposal"
import {
  assertVaultRoot,
  proposalPackagePath,
  queuePath,
  resolveRouterConfig,
  toVaultRelative,
} from "./paths"
import {
  renderAnalysisReport,
  renderQuestionsForHuman,
  renderRouterDecision,
} from "./render"
import type {
  ProposalQueue,
  RouteRunResult,
  RouterConfig,
  RouterOptions,
} from "./types"

export function checkRouter(options: RouterOptions): {
  config: RouterConfig
  draftProposalIds: string[]
} {
  const config = resolveRouterConfig(options)
  assertVaultRoot(config)
  return { config, draftProposalIds: listDraftProposalIds(config) }
}

export function runRouterForProposal(
  proposalId: string,
  options: RouterOptions = {},
): RouteRunResult {
  const config = resolveRouterConfig(options)
  assertVaultRoot(config)
  const proposal = loadProposalPackage(config, proposalId, "01 Draft")
  const evaluation = evaluateProposal(config, proposal)
  const createdFiles = ["router_decision.md", "analysis_report.md"]
  if (evaluation.decision === "needs_human_decision")
    createdFiles.push("questions_for_human.md")

  const dryRun = options.write !== true
  const destinationPath = proposalPackagePath(
    config,
    proposal.id,
    evaluation.toQueue,
  )

  if (!dryRun) {
    withProposalLock(config, proposal.id, () => {
      writeRouteOutputs(config, proposal, evaluation.toQueue, {
        routerDecision: renderRouterDecision(config, proposal, evaluation),
        analysisReport: renderAnalysisReport(config, proposal, evaluation),
        questionsForHuman:
          evaluation.decision === "needs_human_decision"
            ? renderQuestionsForHuman(config, proposal, evaluation)
            : null,
      })
    })
  }

  return {
    proposalId: proposal.id,
    fromQueue: proposal.queue,
    toQueue: evaluation.toQueue,
    decision: evaluation.decision,
    riskLevel: evaluation.riskLevel,
    dryRun,
    packagePath: dryRun
      ? destinationPath
      : findProposalPackage(config, proposal.id).packagePath,
    createdFiles,
    moved: !dryRun && proposal.queue !== evaluation.toQueue,
    evaluation,
  }
}

export function runRouterForAllDraft(
  options: RouterOptions = {},
): RouteRunResult[] {
  const config = resolveRouterConfig(options)
  assertVaultRoot(config)
  return listDraftProposalIds(config).map((proposalId) =>
    runRouterForProposal(proposalId, options),
  )
}

function writeRouteOutputs(
  config: RouterConfig,
  proposal: { id: string; packagePath: string; queue: ProposalQueue },
  toQueue: ProposalQueue,
  outputs: {
    readonly routerDecision: string
    readonly analysisReport: string
    readonly questionsForHuman: string | null
  },
): void {
  const destinationPath = proposalPackagePath(config, proposal.id, toQueue)
  if (proposal.queue !== toQueue) {
    if (existsSync(destinationPath)) {
      throw new Error(
        `Destination already exists: ${toVaultRelative(config, destinationPath)}`,
      )
    }
    mkdirSync(queuePath(config, toQueue), { recursive: true })
    renameSync(proposal.packagePath, destinationPath)
  }

  atomicWriteFile(
    join(destinationPath, "router_decision.md"),
    outputs.routerDecision,
  )
  atomicWriteFile(
    join(destinationPath, "analysis_report.md"),
    outputs.analysisReport,
  )

  const questionsPath = join(destinationPath, "questions_for_human.md")
  if (outputs.questionsForHuman) {
    atomicWriteFile(questionsPath, outputs.questionsForHuman)
  } else if (existsSync(questionsPath)) {
    rmSync(questionsPath)
  }
}

function atomicWriteFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true })
  const tmpPath = `${path}.tmp-${process.pid}-${Date.now()}`
  writeFileSync(tmpPath, content, "utf8")
  renameSync(tmpPath, path)
}

function withProposalLock<T>(
  config: RouterConfig,
  proposalId: string,
  fn: () => T,
): T {
  const locksDir = join(config.runtimeDir, "locks")
  mkdirSync(locksDir, { recursive: true })
  const lockPath = join(locksDir, `${proposalId}.lock`)
  if (existsSync(lockPath)) {
    throw new Error(
      `Proposal is locked: ${proposalId}. Remove stale lock if no router process is active.`,
    )
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
