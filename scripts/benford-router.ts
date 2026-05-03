#!/usr/bin/env bun

import { mkdirSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import {
  checkRouter,
  runRouterForAllDraft,
  runRouterForProposal,
} from "@/router-engine"

type Command = "init" | "check" | "run" | "help"

interface Args {
  readonly command: Command
  readonly proposal?: string
  readonly allDraft: boolean
  readonly vaultRoot?: string
  readonly runtimeDir?: string
  readonly today?: string
  readonly write: boolean
}

const args = parseArgs(process.argv.slice(2))

try {
  if (args.command === "help") {
    printHelp()
  } else if (args.command === "init") {
    initConfig(args)
  } else if (args.command === "check") {
    const result = checkRouter(args)
    console.log(`Vault root: ${result.config.vaultRoot}`)
    console.log(`Runtime dir: ${result.config.runtimeDir}`)
    console.log(`Draft proposals: ${result.draftProposalIds.length}`)
    for (const proposalId of result.draftProposalIds)
      console.log(`- ${proposalId}`)
  } else if (args.command === "run") {
    const results = args.allDraft
      ? runRouterForAllDraft(args)
      : [
          runRouterForProposal(
            required(args.proposal, "Missing --proposal or --all-draft."),
            args,
          ),
        ]

    for (const result of results) {
      console.log(
        `${result.proposalId}: ${result.fromQueue} -> ${result.toQueue}`,
      )
      console.log(`  decision: ${result.decision}`)
      console.log(`  risk: ${result.riskLevel}`)
      console.log(`  mode: ${result.dryRun ? "dry-run" : "write"}`)
      console.log(`  outputs: ${result.createdFiles.join(", ")}`)
    }
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}

function parseArgs(argv: string[]): Args {
  const [rawCommand = "help", ...rest] = argv
  const command = normalizeCommand(rawCommand)
  let proposal: string | undefined
  let vaultRoot: string | undefined
  let runtimeDir: string | undefined
  let today: string | undefined
  let allDraft = false
  let write = false

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index]
    if (arg === "--proposal") proposal = rest[++index]
    else if (arg === "--all-draft") allDraft = true
    else if (arg === "--vault-root") vaultRoot = rest[++index]
    else if (arg === "--runtime-dir") runtimeDir = rest[++index]
    else if (arg === "--today") today = rest[++index]
    else if (arg === "--write") write = true
    else if (arg === "--dry-run") write = false
    else throw new Error(`Unknown argument: ${arg}`)
  }

  return { command, proposal, allDraft, vaultRoot, runtimeDir, today, write }
}

function normalizeCommand(raw: string): Command {
  if (
    raw === "init" ||
    raw === "check" ||
    raw === "run" ||
    raw === "help" ||
    raw === "--help" ||
    raw === "-h"
  ) {
    return raw === "--help" || raw === "-h" ? "help" : raw
  }
  throw new Error(`Unknown command: ${raw}`)
}

function initConfig(args: Args): void {
  const vaultRoot = required(
    args.vaultRoot ?? process.env.BENFORD_VAULT_ROOT,
    "Pass --vault-root or set BENFORD_VAULT_ROOT.",
  )
  const runtimeDir = args.runtimeDir ?? ".benford-runtime"
  const path = resolve(".benford-router.json")
  const payload = {
    vaultRoot,
    runtimeDir,
  }
  mkdirSync(join(runtimeDir, "locks"), { recursive: true })
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, "utf8")
  console.log(`Created ${path}`)
}

function required<T>(value: T | undefined, message: string): T {
  if (!value) throw new Error(message)
  return value
}

function printHelp(): void {
  console.log(`benford-router

Usage:
  bun run router -- init --vault-root "/path/to/Benford Vault V3"
  bun run router -- check --vault-root "/path/to/Benford Vault V3"
  bun run router -- run --proposal PROP-0001 --vault-root "/path/to/Benford Vault V3"
  bun run router -- run --all-draft --write --vault-root "/path/to/Benford Vault V3"

Options:
  --vault-root <path>     Benford Vault V3 root. Can also use BENFORD_VAULT_ROOT.
  --runtime-dir <path>    Runtime dir for locks. Defaults to .benford-runtime.
  --proposal <id>         Proposal folder ID, for example PROP-0001.
  --all-draft             Process every PROP-* in 02 Proposals/01 Draft.
  --write                 Write router outputs and move folders.
  --dry-run               Default. Evaluate without writing.
  --today YYYY-MM-DD      Override operation date for tests.
`)
}
