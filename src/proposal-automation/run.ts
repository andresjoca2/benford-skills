import { applyCanonicalProposal } from "@/canonical-editor"
import {
  assertVaultRoot,
  resolveRouterConfig,
  runRouterForProposal,
} from "@/router-engine"
import { listProposalIds } from "@/router-engine/load-proposal"
import {
  generateProposalForContribution,
  inspectContributionPackages,
  listPendingContributionPackages,
} from "./proposal-generator"
import {
  AUTOMATION_QUEUE_ORDER,
  AUTOMATION_RULES,
  CONTRIBUTION_AUTOMATION_RULE,
} from "./rules"
import type {
  ProposalAutomationCheck,
  ProposalAutomationEvent,
  ProposalAutomationOptions,
} from "./types"

export function checkProposalAutomations(
  options: ProposalAutomationOptions = {},
): ProposalAutomationCheck {
  const config = resolveRouterConfig(options)
  assertVaultRoot(config)
  const contributionDiagnostics = inspectContributionPackages(config)
  const contributionIds = contributionDiagnostics
    .filter((contribution) => contribution.ready)
    .map((contribution) => contribution.id)

  return {
    vaultRoot: config.vaultRoot,
    runtimeDir: config.runtimeDir,
    contributions: {
      count: contributionIds.length,
      contributionIds,
      rule: CONTRIBUTION_AUTOMATION_RULE,
    },
    skippedContributions: contributionDiagnostics
      .filter((contribution) => !contribution.ready)
      .map((contribution) => ({
        id: contribution.id,
        mapPath: contribution.mapPath,
        automationState: contribution.automationState,
        supportedOutputs: contribution.supportedOutputs,
        pendingOutputs: contribution.pendingOutputs,
        reason: contribution.reason ?? "not ready",
      })),
    queues: AUTOMATION_QUEUE_ORDER.map((queue) => {
      const proposalIds = listProposalIds(config, queue)
      return {
        queue,
        count: proposalIds.length,
        proposalIds,
        rule: AUTOMATION_RULES[queue],
      }
    }),
  }
}

export function runProposalAutomations(
  options: ProposalAutomationOptions = {},
): ProposalAutomationEvent[] {
  const config = resolveRouterConfig(options)
  assertVaultRoot(config)
  const events: ProposalAutomationEvent[] = []

  for (const contribution of listPendingContributionPackages(config)) {
    try {
      const proposalGeneratorResult =
        options.write === true
          ? generateProposalForContribution(config, contribution, {
              write: true,
            })
          : generateProposalForContribution(config, contribution)
      events.push({
        id: contribution.id,
        subject: "contribution",
        contributionId: contribution.id,
        action: "generate_proposal",
        status: options.write === true ? "handled" : "pending",
        detail:
          options.write === true
            ? `Generated ${proposalGeneratorResult.proposalId} in 02 Proposals/01 Draft.`
            : `Dry-run would generate ${proposalGeneratorResult.proposalId} in 02 Proposals/01 Draft.`,
        nextSkill: "IMSS-Proposal-Generator",
        proposalId: proposalGeneratorResult.proposalId,
        proposalGeneratorResult,
      })
    } catch (error) {
      events.push({
        id: contribution.id,
        subject: "contribution",
        contributionId: contribution.id,
        action: "generate_proposal",
        status: "skipped",
        detail: errorDetail(error),
        nextSkill: "IMSS-Proposal-Generator",
      })
    }
  }

  for (const proposalId of listProposalIds(config, "01 Draft")) {
    try {
      const routerResult = runRouterForProposal(proposalId, {
        ...options,
        write: options.write === true,
      })
      events.push({
        id: proposalId,
        subject: "proposal",
        proposalId,
        queue: "01 Draft",
        action: "route_draft",
        status: options.write === true ? "handled" : "pending",
        detail:
          options.write === true
            ? `Routed to ${routerResult.toQueue}.`
            : `Dry-run would route to ${routerResult.toQueue}.`,
        nextSkill: "benford-router-engine",
        routerResult,
      })
    } catch (error) {
      events.push({
        id: proposalId,
        subject: "proposal",
        proposalId,
        queue: "01 Draft",
        action: "route_draft",
        status: "skipped",
        detail: errorDetail(error),
        nextSkill: "benford-router-engine",
      })
    }
  }

  for (const proposalId of listProposalIds(config, "02 Needs Human Decision")) {
    events.push({
      id: proposalId,
      subject: "proposal",
      proposalId,
      queue: "02 Needs Human Decision",
      action: "wait_for_human",
      status: "pending_manual",
      detail: "Human decision is required before another skill can continue.",
    })
  }

  for (const proposalId of listProposalIds(config, "03 Approved for Editor")) {
    try {
      const editorResult =
        options.write === true
          ? applyCanonicalProposal(proposalId, {
              ...options,
              write: true,
            })
          : undefined
      events.push({
        id: proposalId,
        subject: "proposal",
        proposalId,
        queue: "03 Approved for Editor",
        action: "invoke_skill",
        status: options.write === true ? "handled" : "pending_manual",
        detail:
          options.write === true
            ? "Applied by deterministic Canonical Editor and moved to 04 Applied."
            : "Ready for the canonical editor skill. Canonical writes require --write.",
        nextSkill: "benford-canonical-editor",
        editorResult,
      })
    } catch (error) {
      events.push({
        id: proposalId,
        subject: "proposal",
        proposalId,
        queue: "03 Approved for Editor",
        action: "invoke_skill",
        status: "skipped",
        detail: errorDetail(error),
        nextSkill: "benford-canonical-editor",
      })
    }
  }

  return events
}

function errorDetail(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
