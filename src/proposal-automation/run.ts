import {
  assertVaultRoot,
  resolveRouterConfig,
  runRouterForProposal,
} from "@/router-engine"
import { listProposalIds } from "@/router-engine/load-proposal"
import { AUTOMATION_QUEUE_ORDER, AUTOMATION_RULES } from "./rules"
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

  return {
    vaultRoot: config.vaultRoot,
    runtimeDir: config.runtimeDir,
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

  for (const proposalId of listProposalIds(config, "01 Draft")) {
    const routerResult = runRouterForProposal(proposalId, {
      ...options,
      write: options.write === true,
    })
    events.push({
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
      proposalId,
      queue: "02 Needs Human Decision",
      action: "wait_for_human",
      status: "pending_manual",
      detail: "Human decision is required before another skill can continue.",
    })
  }

  for (const proposalId of listProposalIds(config, "03 Approved for Editor")) {
    events.push({
      proposalId,
      queue: "03 Approved for Editor",
      action: "invoke_skill",
      status: "pending_manual",
      detail:
        "Ready for the canonical editor skill. Handler is intentionally a placeholder until that skill exists.",
      nextSkill: "benford-canonical-editor",
    })
  }

  return events
}
