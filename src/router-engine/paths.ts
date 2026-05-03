import { existsSync, readFileSync } from "node:fs"
import { homedir } from "node:os"
import { isAbsolute, join, relative, resolve } from "node:path"
import type { ProposalQueue, RouterConfig, RouterOptions } from "./types"

export const QUEUE_DIRS: Record<ProposalQueue, string> = {
  "01 Draft": "02 Proposals/01 Draft",
  "02 Needs Human Decision": "02 Proposals/02 Needs Human Decision",
  "03 Approved for Editor": "02 Proposals/03 Approved for Editor",
  "04 Applied": "02 Proposals/04 Applied",
  "05 Rejected": "02 Proposals/05 Rejected",
}

export const ROUTABLE_QUEUES: readonly ProposalQueue[] = ["01 Draft"]

export function expandHome(input: string): string {
  return input === "~" || input.startsWith("~/")
    ? join(homedir(), input.slice(2))
    : input
}

export function resolveRouterConfig(options: RouterOptions = {}): RouterConfig {
  const localConfig = readLocalConfig()
  const rawVaultRoot =
    options.vaultRoot ?? process.env.BENFORD_VAULT_ROOT ?? localConfig.vaultRoot
  if (!rawVaultRoot) {
    throw new Error(
      "Missing vault root. Pass --vault-root or set BENFORD_VAULT_ROOT.",
    )
  }

  const vaultRoot = resolve(expandHome(rawVaultRoot))
  const runtimeDir = resolve(
    expandHome(
      options.runtimeDir ??
        process.env.BENFORD_ROUTER_RUNTIME_DIR ??
        localConfig.runtimeDir ??
        ".benford-runtime",
    ),
  )
  const today = options.today ?? new Date().toISOString().slice(0, 10)

  return { vaultRoot, runtimeDir, today }
}

function readLocalConfig(): { vaultRoot?: string; runtimeDir?: string } {
  const path = resolve(".benford-router.json")
  if (!existsSync(path)) return {}
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8"))
    return {
      vaultRoot:
        typeof parsed.vaultRoot === "string" ? parsed.vaultRoot : undefined,
      runtimeDir:
        typeof parsed.runtimeDir === "string" ? parsed.runtimeDir : undefined,
    }
  } catch {
    return {}
  }
}

export function assertVaultRoot(config: RouterConfig): void {
  const required = [
    "00 Sistema/contrato-metadata-minima.md",
    "00 Sistema/contrato-artefactos-operativos.md",
    "02 Proposals",
  ]
  const missing = required.filter(
    (entry) => !existsSync(join(config.vaultRoot, entry)),
  )
  if (missing.length > 0) {
    throw new Error(
      `Invalid Benford Vault V3 root. Missing: ${missing.join(", ")}`,
    )
  }
}

export function queuePath(config: RouterConfig, queue: ProposalQueue): string {
  return join(config.vaultRoot, QUEUE_DIRS[queue])
}

export function toVaultRelative(
  config: RouterConfig,
  absolutePath: string,
): string {
  const rel = relative(config.vaultRoot, absolutePath)
  return rel.split("\\").join("/")
}

export function resolveVaultPath(
  config: RouterConfig,
  rawPath: string,
): string {
  const trimmed = rawPath.trim().replace(/^`|`$/g, "")
  if (!trimmed || trimmed === "Pendiente") return ""
  return isAbsolute(trimmed) ? trimmed : join(config.vaultRoot, trimmed)
}

export function proposalPackagePath(
  config: RouterConfig,
  proposalId: string,
  queue: ProposalQueue,
): string {
  return join(queuePath(config, queue), proposalId)
}
