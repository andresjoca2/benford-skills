---
name: corporate-b2b
description: Plan and execute corporate B2B prospecting for companies and decision makers using structured company/person sources when justified by the strategy.
---

# Corporate B2B

Use this playbook when the ICP is a formal company, mid-market, enterprise, startup, fundable company, or role-based buyer such as CFO, founder, head of ops, HR leader, or finance leader.

This is a playbook skill, not a source adapter and not the whole execution engine. It is paired with capabilities such as `company-discovery`, `person-discovery`, and `dedup-and-enrich`.

## Modes

### `company_sourcing`

Use with `company-discovery` when the system is still training or autopiloting the company loop.

Goal: identify companies that fit the ICP and can later yield useful people.

### `people_mapping_from_approved_companies`

Use with `person-discovery` only after the internal CRM has approved company candidates.

Goal: find likely decision makers at approved companies. Search should stay anchored to the approved company list.

### `people_direct_search`

Use with `person-discovery` when the campaign starts with people directly instead of companies first.

Goal: find people matching role/seniority/function/geography without requiring an approved company list.

## Source Pattern

- Start with public web verification when the target count is small.
- Use Apollo or Explorium when company/person filters matter.
- Use People Data Labs only for enrichment after dedupe and suppression checks.
- Never spend on enrichment for duplicates, rejected patterns, or suppressed entities.
- Never scrape LinkedIn directly.
- Do not send outreach.

## Output

Return strict JSON through the backend contract. Persist review output only through Benford Backoffice.
