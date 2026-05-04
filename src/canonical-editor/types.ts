export interface CanonicalEditorOptions {
  readonly vaultRoot?: string
  readonly runtimeDir?: string
  readonly today?: string
  readonly write?: boolean
}

export interface CanonicalEditPlan {
  readonly proposalId: string
  readonly targetCanonicalId: string
  readonly targetCanonicalPath: string
  readonly sourceQueue: "03 Approved for Editor"
  readonly destinationQueue: "04 Applied"
  readonly dryRun: boolean
  readonly canonicalFiles: Array<{
    readonly sourcePath: string
    readonly destinationPath: string
    readonly action: "create"
  }>
  readonly appliedRecordPath: string
  readonly moved: boolean
}
