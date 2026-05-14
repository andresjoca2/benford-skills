# Reflect And Log

## Purpose

Persist operational learning without letting the agent rewrite source-of-truth behavior freely.

## Write To SQLite

Write structured learning through the backoffice into:

- `prospecting_queries`
- `prospecting_plans`
- `prospecting_steps`
- `source_attempts`
- `learned_patterns`
- `prospecting_cost_ledger`

Do not directly edit `learned-patterns.md` as operational memory. Markdown can be generated later from SQLite snapshots.

## What To Log

For every search:

- original query,
- ICP characterization,
- plans considered,
- plan executed,
- source attempts,
- quality metrics,
- estimated and actual cost,
- winner source,
- failure reasons,
- learned pattern candidate.

## Persist A Learning Only When

- The pattern is specific enough to reuse.
- It is supported by observed metrics.
- It is not merely a one-off source failure.
- It does not violate source policy or budget constraints.

Examples worth persisting:

- "For Mexican SMBs under 20 employees in local services, start with DENUE or maps-like listings before Apollo."
- "For LATAM corporate fintech with 50+ employees, Apollo plus public web verification produced high contactability."

Examples not worth persisting:

- "Search better next time."
- "Apollo was bad."
- "Try Google."

## Human-Facing Summary

The report should explain:

- what worked,
- what failed,
- why escalation happened,
- why the agent stopped,
- how much budget was used,
- and what should happen first next time.
