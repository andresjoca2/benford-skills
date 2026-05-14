# Waterfall Rules

## Goal

Escalate intelligently without restarting from zero or spending past the run budget.

## Plan Ranking

Rank candidate plans by:

1. Expected entity coverage for this ICP.
2. Expected evidence quality.
3. Expected contactability.
4. Cost and budget fit.
5. Time to first useful review batch.
6. Compliance and source risk.
7. Past success for similar ICP signatures.

## Stop Conditions

Stop the waterfall when any condition is true:

- The current result set meets the quality gate.
- The next step would exceed `runBudgetCents`.
- The remaining budget is too small for a meaningful paid step.
- The operator's `maxCompanies` or `maxPeople` limit is reached.
- The source policy blocks all remaining escalation paths.
- The remaining candidates are duplicates, suppressed, or off-brief.

## Escalation Conditions

Escalate to the next plan when any condition is true:

- Useful count is below the requested review batch.
- Evidence quality is below threshold.
- Contactability is below threshold for a people/outreach-oriented run.
- Geography fit is weak or uncertain.
- Dedupe removed too much of the result set.
- The current source is known from memory to underperform for this ICP.
- The source failed, timed out, or returned malformed data.

## Budget Rules

- Prefer lower-cost verification before paid enrichment.
- Never enrich duplicate or suppressed rows.
- When using per-record paid sources, batch only the records that passed fit and dedupe gates.
- Record estimated and actual cost after every step.
- If actual cost metadata is unavailable, record `unknown` in the step report and avoid repeating the source in unattended mode.

## No Restart Rule

Fallback plans must reuse:

- already discovered names,
- domains,
- locations,
- evidence,
- rejected duplicates,
- suppression checks,
- and quality notes.

Do not discard Plan A data when moving to Plan B. Merge and dedupe.
