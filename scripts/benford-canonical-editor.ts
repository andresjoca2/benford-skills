#!/usr/bin/env bun

import {
  applyAllApprovedCanonicalProposals,
  applyCanonicalProposal,
  type CanonicalEditPlan,
} from "@/canonical-editor"

type Command = "run" | "help"

interface Args {
  readonly command: Command
  readonly proposal?: string
  readonly allApproved: boolean
  readonly vaultRoot?: string
  readonly runtimeDir?: string
  readonly today?: string
  readonly write: boolean
}

const args = parseArgs(process.argv.slice(2))

try {
  if (args.command === "help") {
    printHelp()
  } else if (args.command === "run") {
    const plans = args.allApproved
      ? applyAllApprovedCanonicalProposals(args)
      : [
          applyCanonicalProposal(
            required(args.proposal, "Missing --proposal or --all-approved."),
            args,
          ),
        ]
    printPlans(plans)
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}

function printPlans(plans: CanonicalEditPlan[]): void {
  if (plans.length === 0) {
    console.log("No approved proposals to apply.")
    return
  }
  for (const plan of plans) {
    console.log(
      `${plan.proposalId}: ${plan.sourceQueue} -> ${plan.destinationQueue}`,
    )
    console.log(`  target: ${plan.targetCanonicalId}`)
    console.log(`  path: ${plan.targetCanonicalPath}`)
    console.log(`  mode: ${plan.dryRun ? "dry-run" : "write"}`)
    console.log(
      `  canonical files: ${plan.canonicalFiles
        .map((file) => file.destinationPath)
        .join(", ")}`,
    )
    console.log(`  applied record: ${plan.appliedRecordPath}`)
  }
}

function parseArgs(argv: string[]): Args {
  const [rawCommand = "help", ...rest] = argv
  const command = normalizeCommand(rawCommand)
  let proposal: string | undefined
  let vaultRoot: string | undefined
  let runtimeDir: string | undefined
  let today: string | undefined
  let allApproved = false
  let write = false

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index]
    if (arg === "--proposal") proposal = rest[++index]
    else if (arg === "--all-approved") allApproved = true
    else if (arg === "--vault-root") vaultRoot = rest[++index]
    else if (arg === "--runtime-dir") runtimeDir = rest[++index]
    else if (arg === "--today") today = rest[++index]
    else if (arg === "--write") write = true
    else if (arg === "--dry-run") write = false
    else throw new Error(`Unknown argument: ${arg}`)
  }

  return { command, proposal, allApproved, vaultRoot, runtimeDir, today, write }
}

function normalizeCommand(raw: string): Command {
  if (raw === "run" || raw === "help" || raw === "--help" || raw === "-h") {
    return raw === "--help" || raw === "-h" ? "help" : raw
  }
  throw new Error(`Unknown command: ${raw}`)
}

function required<T>(value: T | undefined, message: string): T {
  if (!value) throw new Error(message)
  return value
}

function printHelp(): void {
  console.log(`benford-canonical-editor

Usage:
  bun run canonical-editor -- run --proposal PROP-0001 --vault-root "/path/to/Benford Vault V3"
  bun run canonical-editor -- run --proposal PROP-0001 --write --vault-root "/path/to/Benford Vault V3"
  bun run canonical-editor -- run --all-approved --write --vault-root "/path/to/Benford Vault V3"

Options:
  --vault-root <path>     Benford Vault V3 root. Can also use BENFORD_VAULT_ROOT.
  --runtime-dir <path>    Runtime dir for locks. Defaults to .benford-runtime.
  --proposal <id>         Proposal folder ID, for example PROP-0001.
  --all-approved          Process every PROP-* in 02 Proposals/03 Approved for Editor.
  --write                 Create canonical files, applied_record.md, and move to Applied.
  --dry-run               Default. Plan without writing.
  --today YYYY-MM-DD      Override operation date for tests.
`)
}
