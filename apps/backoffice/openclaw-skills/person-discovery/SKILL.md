---
name: person-discovery
description: Discover people candidates for Benford Backoffice using a playbook, approved company context when available, and strict CRM review output.
---

# Person Discovery

## Purpose

Find people candidates for review in Benford Backoffice.

This is a capability skill. It does not decide the ICP strategy by itself. It runs with a playbook such as `corporate-b2b` and a mode selected by `prospecting-strategist`.

## Modes

### `people_mapping_from_approved_companies`

Use when the campaign first reviewed and approved company candidates.

Input must include approved companies from the internal CRM. Search only for people tied to those companies unless the plan explicitly allows adjacent companies.

### `people_direct_search`

Use when the campaign is directly targeting people without a company-first phase.

Input must include target roles, seniority, function, geography, and source plan.

## Output Rules

Return strict JSON matching `references/output-contract.json`.

Do not send outreach.
Persist review output only through Benford Backoffice.
Do not scrape LinkedIn directly.

Every person must include evidence explaining why the person likely works at the company or fits the target.
