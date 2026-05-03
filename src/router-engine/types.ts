export type RouterDecision = "approved_for_editor" | "needs_human_decision"

export type ProposalQueue =
  | "01 Draft"
  | "02 Needs Human Decision"
  | "03 Approved for Editor"
  | "04 Applied"
  | "05 Rejected"

export type RiskLevel = "low" | "medium" | "high" | "unknown"

export interface RouterConfig {
  readonly vaultRoot: string
  readonly runtimeDir: string
  readonly today: string
}

export interface RouterOptions {
  readonly vaultRoot?: string
  readonly runtimeDir?: string
  readonly today?: string
  readonly write?: boolean
}

export interface MarkdownTable {
  readonly headers: string[]
  readonly rows: Array<Record<string, string>>
}

export interface ProposalPackage {
  readonly id: string
  readonly queue: ProposalQueue
  readonly packagePath: string
  readonly proposalPath: string
  readonly relativePackagePath: string
  readonly markdown: string
  readonly identification: Record<string, string>
  readonly routingFields: Record<string, string>
  readonly sections: ReadonlySet<string>
}

export interface CheckResult {
  readonly name: string
  readonly status: "pass" | "warning" | "fail"
  readonly note: string
}

export interface RiskFactor {
  readonly factor: string
  readonly description: string
  readonly evidence: string
}

export interface RouterEvaluation {
  readonly decision: RouterDecision
  readonly toQueue: ProposalQueue
  readonly riskLevel: RiskLevel
  readonly checks: CheckResult[]
  readonly reasons: string[]
  readonly riskFactors: RiskFactor[]
  readonly mitigatingFactors: RiskFactor[]
  readonly contradictionsOrGaps: Array<{
    readonly type: string
    readonly description: string
    readonly evidence: string
    readonly requiresHuman: boolean
  }>
  readonly humanQuestions: Array<{
    readonly question: string
    readonly why: string
    readonly expectedAnswer: string
  }>
  readonly filesRead: Array<{
    readonly path: string
    readonly type: string
    readonly use: string
  }>
}

export interface RouteRunResult {
  readonly proposalId: string
  readonly fromQueue: ProposalQueue
  readonly toQueue: ProposalQueue
  readonly decision: RouterDecision
  readonly riskLevel: RiskLevel
  readonly dryRun: boolean
  readonly packagePath: string
  readonly createdFiles: string[]
  readonly moved: boolean
  readonly evaluation: RouterEvaluation
}
