---
name: prospecting-strategist
description: Plan, evaluate, escalate, and learn from Benford Backoffice prospecting searches across heterogeneous ICPs, geographies, and source universes. Use before executing discovery when the best source or skill is not obvious.
---

# Prospecting Strategist

## Mission

Turn an operator's prospecting request into an auditable search strategy. Characterize the ICP, choose a ranked source/skill plan, define budget guards, evaluate results, decide whether to stop or escalate, and produce learnings for future runs.

This is a meta-skill. It does not replace execution skills such as `find-companies`, `find-people`, `research-company`, or provider-specific source adapters. It chooses and supervises them.

## Operating Model

Use strategy-then-execute with waterfall search:

1. Read the request, campaign brief, current database memory, suppression rules, and run budget.
2. Characterize the target entity and where it is likely to live digitally.
3. Consult past query memory and learned source patterns when available.
4. Generate Plan A, B, and C ranked by expected success, cost, coverage, and compliance fit.
5. Execute the lowest-cost high-probability plan first.
6. Evaluate quality and cost after each step.
7. Escalate only when the current evidence, count, or contactability is insufficient.
8. Stop when quality is sufficient, budget is exhausted, source policy blocks escalation, or the operator's limit is reached.
9. Return results plus an execution report and learned pattern.

Do not use a rigid if-else tree by ICP type. Use the source catalog, memory, and quality criteria to reason about the best path for this specific request.

## Mandatory Budget Guard

Every plan must include budget handling. Before executing or recommending a step:

- Read `runBudgetCents`, `maxCompanies`, `maxPeople`, and any per-source limits.
- Estimate the cost of the next step when the source has a known price.
- Compare estimated cumulative spend with the run budget.
- Prefer free/public or already-paid sources when quality is likely similar.
- Stop before launching a step that would exceed budget unless the operator explicitly increases the limit.
- Record actual cost, estimated cost, and cumulative run cost in the execution report.

If a source cannot report reliable cost, mark the estimate as `unknown` and treat the source as budget-risky. Do not keep escalating through unknown-cost sources in unattended mode.

## Inputs To Read First

1. `query_original`
2. `campaign.brief`
3. `campaign.memory`
4. `limits.runBudgetCents`
5. `limits.maxCompanies`
6. `limits.maxPeople`
7. `limits.maxRuntimeSeconds`
8. `allowedSources`
9. `blockedSources`
10. `pastQueries`
11. `learnedPatterns`
12. `suppression`

## Planning Requirements

The strategy plan must match `references/strategy-plan-contract.json`.

Each step must state:

- what skill or source adapter should run,
- why it is the right next source,
- what it should return,
- how quality will be measured,
- estimated cost,
- fallback condition,
- stop condition.

Also return `strategy_markdown`: a concise Markdown version of the strategy for
the backoffice UI. The backend will persist this Markdown as the campaign's
strategy file. When the operator gives feedback, revise both the JSON plan and
the Markdown so the visible plan and executable plan stay aligned.

The plan should be specific enough for a worker to execute without reinterpreting the operator's intent, but flexible enough that the worker can stop early when quality is already sufficient.

## Source Selection

Use `references/source-catalog.md` as the source inventory. Treat it as capability metadata, not a hardcoded route.

General heuristics:

- Corporate B2B and funded companies often start with Apollo, Explorium, PDL, LinkedIn-like licensed datasets, or public web.
- Local businesses often start with Google Maps-style data, Scrap.io, local directories, and official business pages.
- Mexico-specific traditional businesses often need DENUE, chambers, professional colleges, associations, and directory scraping.
- Recruiting searches need licensed people datasets, GitHub for developers, and role-specific communities.
- Deep web research is fallback when structured sources fail or when evidence quality matters more than volume.

When memory contradicts a generic heuristic, prefer memory unless the current brief has material differences.

## Evaluation Requirements

After each execution step, evaluate using `meta/evaluate-quality.md`.

Quality is sufficient only when the result set meets the campaign's required:

- count,
- entity fit,
- geography fit,
- evidence strength,
- contactability,
- dedupe cleanliness,
- suppression compliance,
- and budget efficiency.

Do not count duplicates, suppressed entities, weak directory-only rows, or off-brief entities toward the quality threshold.

## Reflection Requirements

Every completed search must produce an execution report matching `references/execution-report-contract.json`.

Record:

- what worked,
- what failed,
- where cost was spent,
- which source won,
- which source should be tried first next time for a similar ICP,
- and whether the learned pattern is strong enough to persist.

Write learnings to SQLite through the backoffice, not directly to markdown. Markdown snapshots may be generated from SQLite later for human review.

## Safety And Compliance

- Use only allowlisted sources and tools.
- Respect source terms, provider limits, and rate limits.
- Do not scrape LinkedIn directly. Use licensed providers if LinkedIn-like data is needed.
- Do not push to CRM automatically unless the operator requested it and the backend has approved the action.
- Do not send outreach automatically.
- Apply suppression before returning or pushing candidates.
- Never let OpenClaw or any source adapter write directly to SQLite. The backoffice validates and persists.

## Output Rules

- Return strict JSON when asked for a plan or report.
- Do not include Markdown around JSON.
- Include cost estimates and stop conditions in every plan.
- Include `learned` only when it is specific, reusable, and supported by observed results.

## References

- `references/strategy-plan-contract.json`: required planning shape.
- `references/execution-report-contract.json`: required report shape.
- `references/source-catalog.md`: available source inventory and constraints.
- `playbooks/waterfall-rules.md`: escalation and stop rules.
- `playbooks/dedup-and-merge.md`: identity resolution and merge rules.
- `meta/evaluate-quality.md`: quality scoring.
- `meta/reflect-and-log.md`: learning and logging rules.
