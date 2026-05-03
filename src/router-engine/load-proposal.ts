import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import {
  extractSection,
  listH2Sections,
  parseFirstMarkdownTable,
  routingTableToKeyValue,
  tableToKeyValue,
} from "./markdown"
import { proposalPackagePath, queuePath, toVaultRelative } from "./paths"
import type { ProposalPackage, ProposalQueue, RouterConfig } from "./types"

const QUEUES_TO_SEARCH: readonly ProposalQueue[] = [
  "01 Draft",
  "02 Needs Human Decision",
  "03 Approved for Editor",
  "04 Applied",
  "05 Rejected",
]

export function loadProposalPackage(
  config: RouterConfig,
  proposalId: string,
  queue: ProposalQueue = "01 Draft",
): ProposalPackage {
  const packagePath = proposalPackagePath(config, proposalId, queue)
  return loadPackageAt(config, packagePath, queue, proposalId)
}

export function findProposalPackage(
  config: RouterConfig,
  proposalId: string,
): ProposalPackage {
  for (const queue of QUEUES_TO_SEARCH) {
    const packagePath = proposalPackagePath(config, proposalId, queue)
    if (existsSync(packagePath))
      return loadPackageAt(config, packagePath, queue, proposalId)
  }
  throw new Error(`Proposal package not found in known queues: ${proposalId}`)
}

export function listDraftProposalIds(config: RouterConfig): string[] {
  const draftRoot = queuePath(config, "01 Draft")
  if (!existsSync(draftRoot)) return []
  return readdirSync(draftRoot, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() && /^PROP-[A-Za-z0-9_-]+$/.test(entry.name),
    )
    .map((entry) => entry.name)
    .sort()
}

function loadPackageAt(
  config: RouterConfig,
  packagePath: string,
  queue: ProposalQueue,
  fallbackProposalId: string,
): ProposalPackage {
  const proposalPath = join(packagePath, "proposal.md")
  if (!existsSync(proposalPath)) {
    throw new Error(
      `Missing proposal.md for ${fallbackProposalId}: ${toVaultRelative(config, proposalPath)}`,
    )
  }

  const markdown = readFileSync(proposalPath, "utf8")
  const identification = tableToKeyValue(
    parseFirstMarkdownTable(extractSection(markdown, "Identificacion")),
  )
  const routingFields = routingTableToKeyValue(
    parseFirstMarkdownTable(extractSection(markdown, "Campos para routing")),
  )
  const id = identification.ID || fallbackProposalId

  return {
    id,
    queue,
    packagePath,
    proposalPath,
    relativePackagePath: toVaultRelative(config, packagePath),
    markdown,
    identification,
    routingFields,
    sections: listH2Sections(markdown),
  }
}
