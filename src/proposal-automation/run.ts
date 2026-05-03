import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import {
  assertVaultRoot,
  resolveRouterConfig,
  runRouterForProposal,
} from "@/router-engine"
import { listProposalIds } from "@/router-engine/load-proposal"
import {
  extractSection,
  parseFirstMarkdownTable,
  tableToKeyValue,
} from "@/router-engine/markdown"
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
  const contributionIds = listReadyContributionIds(config.vaultRoot)

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

  for (const contribution of listReadyContributions(config.vaultRoot)) {
    events.push({
      id: contribution.id,
      subject: "contribution",
      contributionId: contribution.id,
      action: "generate_proposal",
      status: "pending_manual",
      detail:
        "Contribution is ready for Proposal Generator. Creating a PROP requires explicit user approval in-session.",
      nextSkill: "IMSS-Proposal-Generator",
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
    events.push({
      id: proposalId,
      subject: "proposal",
      proposalId,
      queue: "03 Approved for Editor",
      action: "invoke_skill",
      status: "pending_manual",
      detail:
        "Ready for the canonical editor skill. Canonical writes require explicit user approval in-session.",
      nextSkill: "benford-canonical-editor",
    })
  }

  return events
}

function listReadyContributionIds(vaultRoot: string): string[] {
  return listReadyContributions(vaultRoot).map(
    (contribution) => contribution.id,
  )
}

function listReadyContributions(
  vaultRoot: string,
): Array<{ id: string; path: string }> {
  const root = join(vaultRoot, "01 Contribuciones")
  if (!existsSync(root)) return []
  const results: Array<{ id: string; path: string }> = []
  const stack = [root]

  while (stack.length > 0) {
    const current = stack.pop()
    if (!current) continue
    const entries = readdirSync(current, { withFileTypes: true })
    const hasContributionMap = entries.some(
      (entry) => entry.isFile() && entry.name === "contribution_map.md",
    )
    if (hasContributionMap) {
      const contribution = readContributionMap(
        join(current, "contribution_map.md"),
      )
      if (contribution) results.push({ ...contribution, path: current })
      continue
    }
    for (const entry of entries) {
      if (entry.isDirectory()) stack.push(join(current, entry.name))
    }
  }

  return results.sort((a, b) => a.id.localeCompare(b.id))
}

function readContributionMap(path: string): { id: string } | null {
  const markdown = readFileSync(path, "utf8")
  const identification = tableToKeyValue(
    parseFirstMarkdownTable(extractSection(markdown, "Identificacion")),
  )
  const id = stripTicks(identification.ID)
  const estado = stripTicks(identification.Estado)
  if (!id || estado !== "ready_for_proposal") return null

  const proposals = extractSection(markdown, "Proposals generadas") ?? ""
  if (/\|\s*PROP-[A-Z]+-\d+|\|\s*PROP-\d+/.test(proposals)) return null

  return { id }
}

function stripTicks(value: string | undefined): string {
  return (value ?? "").trim().replace(/^`|`$/g, "")
}
