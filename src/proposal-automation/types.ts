import type { CanonicalEditPlan } from "@/canonical-editor"
import type {
  ProposalQueue,
  RouteRunResult,
  RouterOptions,
} from "@/router-engine"

export type AutomationAction =
  | "generate_proposal"
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

export interface ContributionAutomationRule {
  readonly action: "generate_proposal"
  readonly description: string
  readonly skillName: "IMSS-Proposal-Generator"
  readonly writePolicy: "safe_auto"
}

export interface ProposalAutomationOptions extends RouterOptions {
  readonly write?: boolean
}

export interface ProposalAutomationEvent {
  readonly id: string
  readonly subject: "contribution" | "proposal"
  readonly action: AutomationAction
  readonly status: AutomationStatus
  readonly detail: string
  readonly proposalId?: string
  readonly contributionId?: string
  readonly queue?: ProposalQueue
  readonly nextSkill?: string
  readonly routerResult?: RouteRunResult
  readonly editorResult?: CanonicalEditPlan
  readonly proposalGeneratorResult?: ProposalGenerationResult
}

export interface ProposalGenerationResult {
  readonly contributionId: string
  readonly proposalId: string
  readonly proposalPath: string
  readonly targetCanonicalId: string
  readonly canonicalType: "DOC" | "DVC" | "DOL"
  readonly proposalType: "PROP-DOC" | "PROP-DVC" | "PROP-DOL"
  readonly dryRun: boolean
}

export interface ProposalAutomationCheck {
  readonly vaultRoot: string
  readonly runtimeDir: string
  readonly contributions: {
    readonly count: number
    readonly contributionIds: string[]
    readonly rule: ContributionAutomationRule
  }
  readonly queues: Array<{
    readonly queue: ProposalQueue
    readonly count: number
    readonly proposalIds: string[]
    readonly rule: QueueAutomationRule
  }>
}
