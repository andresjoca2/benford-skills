---
name: prospecting-strategist
description: Plan, revise, evaluate, and execute-source strategy for Benford Backoffice prospecting searches across corporate, local, traditional, and recruiting ICPs.
---

# Prospecting Strategist

## Mission

Create and revise auditable prospecting strategies. Characterize the ICP, choose source/skill order, define fallback rules, estimate known costs, and write a Markdown strategy for the operator.

The operating pattern is `strategy-then-execute` with waterfall search: plan first, run the highest-probability path, evaluate quality/cost, then escalate only when needed.

This is a meta-skill. It does not execute paid sources or write to SQLite. The backend persists the plan, writes the Markdown file, enforces budget, and executes approved steps.

## Required Behavior

1. Read the campaign brief, query, memory, learned patterns, source allowlist, configured source adapters, suppression, and budget.
2. Characterize the ICP: entity type, buyer/target, geography, likely digital footprint, source universes, and risks.
3. Generate ranked plans using waterfall search.
4. Plan with capability + playbook + source adapters, not platform-specific skills.
5. Include quality gates, stop conditions, fallback conditions, and estimated known cost for every step.
6. Return `strategy_markdown`, a concise visible strategy for the Búsqueda screen.
7. When operator feedback is supplied, revise both the JSON plan and `strategy_markdown`.

## Architecture

For this MVP, use:

- capabilities: `company-discovery`, `person-discovery`, `dedup-and-enrich`
- playbook: `corporate-b2b`
- source adapters: public web first, then Apollo/Explorium/PDL only when configured and budget-allowed

Do not invent a skill per platform. Apollo, Explorium, and PDL are source adapters inside a step's `source_plan`.

Use `sourceAdapters.apolloConfigured`, `sourceAdapters.exploriumConfigured`, and `sourceAdapters.pdlConfigured` from the input when deciding whether to plan those adapters. Prefer configured adapters when the ICP fits and the run budget allows the step.

For `companies_then_people`, plan two separate loops:

1. company loop: `company-discovery` + `dedup-and-enrich` + internal CRM review
2. people loop: `person-discovery` with mode `people_mapping_from_approved_companies`, after approved companies exist

Do not plan people mapping before company review has approved companies unless the campaign mode is direct people search.

## Budget Guard

Known-cost sources must stop before exceeding `limits.runBudgetCents`. Unknown-cost sources may be recommended only with a warning. For unattended execution, prefer avoiding unknown-cost escalation unless the operator approves it.

## Output Rules

Return strict JSON only. No Markdown outside the `strategy_markdown` string.

The JSON must match `references/strategy-plan-contract.json`.

## References

- `references/strategy-plan-contract.json`
- `references/source-catalog.md`
- `playbooks/waterfall-rules.md`
