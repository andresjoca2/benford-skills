import { applyCanonicalProposal } from "@/canonical-editor"
import {
  assertVaultRoot,
  resolveRouterConfig,
  runRouterForProposal,
} from "@/router-engine"
import { listProposalIds } from "@/router-engine/load-proposal"
import {
  generateProposalForContribution,
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
  const contributionIds = listPendingContributionPackages(config).map(
    (contribution) => contribution.id,
  )

  return {
    vaultRoot: config.vaultRoot,
    runtimeDir: config.runtimeDir,
    contributions: {
      count: contributionIds.length,
      contributionIds,
      rule: CONTRIBUTION_AUTOMATION_RULE,
    },
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
  }

  for (const proposalId of listProposalIds(config, "01 Draft")) {
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
  }

  return events
}
