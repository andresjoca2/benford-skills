#!/usr/bin/env bun

import {
  checkProposalAutomations,
  type ProposalAutomationEvent,
  runProposalAutomations,
} from "@/proposal-automation"

type Command = "check" | "run" | "watch" | "help"

interface Args {
  readonly command: Command
  readonly vaultRoot?: string
  readonly runtimeDir?: string
  readonly today?: string
  readonly write: boolean
  readonly intervalMs: number
}

const args = parseArgs(process.argv.slice(2))

try {
  if (args.command === "help") {
    printHelp()
  } else if (args.command === "check") {
    const check = checkProposalAutomations(args)
    console.log(`Vault root: ${check.vaultRoot}`)
    console.log(`Runtime dir: ${check.runtimeDir}`)
    for (const queue of check.queues) {
      console.log(`${queue.queue}: ${queue.count}`)
      console.log(`  action: ${queue.rule.action}`)
      if (queue.rule.skillName) console.log(`  skill: ${queue.rule.skillName}`)
      for (const proposalId of queue.proposalIds)
        console.log(`  - ${proposalId}`)
    }
  } else if (args.command === "run") {
    printEvents(runProposalAutomations(args))
  } else if (args.command === "watch") {
    const seen = new Set<string>()
    const tick = () => {
      const events = runProposalAutomations(args).filter((event) => {
        const key = [
          event.proposalId,
          event.queue,
          event.action,
          event.routerResult?.toQueue ?? "",
        ].join(":")
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      if (events.length > 0) printEvents(events)
    }
    tick()
    setInterval(tick, args.intervalMs)
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}

function printEvents(events: ProposalAutomationEvent[]): void {
  if (events.length === 0) {
    console.log("No automation events.")
    return
  }
  for (const event of events) {
    console.log(`${event.proposalId}: ${event.queue}`)
    console.log(`  action: ${event.action}`)
    console.log(`  status: ${event.status}`)
    console.log(`  detail: ${event.detail}`)
    if (event.nextSkill) console.log(`  next skill: ${event.nextSkill}`)
    if (event.routerResult) {
      console.log(`  router decision: ${event.routerResult.decision}`)
      console.log(`  router target: ${event.routerResult.toQueue}`)
      console.log(`  mode: ${event.routerResult.dryRun ? "dry-run" : "write"}`)
    }
  }
}

function parseArgs(argv: string[]): Args {
  const [rawCommand = "help", ...rest] = argv
  const command = normalizeCommand(rawCommand)
  let vaultRoot: string | undefined
  let runtimeDir: string | undefined
  let today: string | undefined
  let write = false
  let intervalMs = 5000

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index]
    if (arg === "--vault-root") vaultRoot = rest[++index]
    else if (arg === "--runtime-dir") runtimeDir = rest[++index]
    else if (arg === "--today") today = rest[++index]
    else if (arg === "--write") write = true
    else if (arg === "--dry-run") write = false
    else if (arg === "--interval-ms") intervalMs = Number(rest[++index])
    else throw new Error(`Unknown argument: ${arg}`)
  }

  if (!Number.isFinite(intervalMs) || intervalMs < 1000) {
    throw new Error("--interval-ms must be a number >= 1000.")
  }

  return { command, vaultRoot, runtimeDir, today, write, intervalMs }
}

function normalizeCommand(raw: string): Command {
  if (
    raw === "check" ||
    raw === "run" ||
    raw === "watch" ||
    raw === "help" ||
    raw === "--help" ||
    raw === "-h"
  ) {
    return raw === "--help" || raw === "-h" ? "help" : raw
  }
  throw new Error(`Unknown command: ${raw}`)
}

function printHelp(): void {
  console.log(`benford-automations

Usage:
  bun run automations -- check --vault-root "/path/to/Benford Vault V3"
  bun run automations -- run --vault-root "/path/to/Benford Vault V3"
  bun run automations -- run --write --vault-root "/path/to/Benford Vault V3"
  bun run automations -- watch --interval-ms 5000 --vault-root "/path/to/Benford Vault V3"

Options:
  --vault-root <path>     Benford Vault V3 root. Can also use BENFORD_VAULT_ROOT.
  --runtime-dir <path>    Runtime dir for locks. Defaults to .benford-runtime.
  --write                 Execute safe automatic actions. Default is dry-run.
  --dry-run               Evaluate without writing.
  --interval-ms <ms>      Watch polling interval. Minimum 1000.
  --today YYYY-MM-DD      Override operation date for tests.
`)
}
