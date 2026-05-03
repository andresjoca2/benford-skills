import type {
  ProposalQueue,
  RouteRunResult,
  RouterOptions,
} from "@/router-engine"

export type AutomationAction =
  | "route_draft"
  | "invoke_skill"
  | "wait_for_human"
  | "no_op"

export type AutomationStatus =
  | "handled"
  | "pending"
  | "pending_manual"
  | "skipped"

export interface QueueAutomationRule {
  readonly queue: ProposalQueue
  readonly action: AutomationAction
  readonly description: string
  readonly skillName?: string
  readonly writePolicy: "safe_auto" | "manual_only" | "none"
}

export interface ProposalAutomationOptions extends RouterOptions {
  readonly write?: boolean
}

export interface ProposalAutomationEvent {
  readonly proposalId: string
  readonly queue: ProposalQueue
  readonly action: AutomationAction
  readonly status: AutomationStatus
  readonly detail: string
  readonly nextSkill?: string
  readonly routerResult?: RouteRunResult
}

export interface ProposalAutomationCheck {
  readonly vaultRoot: string
  readonly runtimeDir: string
  readonly queues: Array<{
    readonly queue: ProposalQueue
    readonly count: number
    readonly proposalIds: string[]
    readonly rule: QueueAutomationRule
  }>
}
