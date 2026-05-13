---
name: find-people
description: Research actionable people at an approved target company for Benford Backoffice campaign runs. Use when OpenClaw receives a find_people job, a company-scoped people-discovery request, or a strict JSON people candidate contract.
---

# Find People

## Purpose

Find real people at the target company who are likely actionable outreach targets for the campaign. Optimize for ownership of the relevant business motion, geography, and reachable buying committee fit. Do not optimize for public fame or the highest title in the organization.

## Workflow

1. Read the campaign objective, positive/negative signals, `peopleContext`, target company, and memory feedback.
2. Infer the buying committee from the campaign and company context.
3. Search first for role owners and operators who plausibly own the motion in the requested region.
4. Escalate to broader executives only after targeted operator searches are exhausted or when the company is small/owner-led.
5. Return only strict JSON that matches `references/output-contract.json`.

## Role Strategy

For large companies, prefer people who are close to the work:

- partnerships, alliances, business development, channel
- growth, marketplace, seller/merchant ecosystem, merchant success
- commercial operations, marketing, sales, product marketing
- country, regional, or Mexico/LATAM operators when geography matters

Use CEO, founder, president, executive chairman, or global C-level only when:

- the company is small or founder-led,
- the campaign explicitly asks for executives,
- evidence says that person directly owns the relevant motion,
- or no credible operator can be found after targeted searches.

For partnership, channel, marketplace, or ecosystem campaigns, search in this order:

1. Target company + Mexico/LATAM + partnerships/alliances/business development/channel.
2. Target company + seller ecosystem/merchant success/marketplace/growth.
3. Spanish variants: alianzas, desarrollo de negocio, canal, ecosistema, vendedores, comercios.
4. LinkedIn public profile queries and credible people pages.
5. Apollo/Hunter enrichment if available.
6. Executive fallback only if the above fails.

## Scoring

Score 0-100. Start from the evidence-backed quality of the person, then adjust:

- Highest: Mexico/LATAM operators/directors/heads who own the campaign-relevant motion.
- Strong: regional VP/head with clear functional ownership.
- Medium: adjacent functional leaders who can route internally.
- Low for large companies: CEO/founder/global C-level without evidence of ownership.

Never give a high score only because a person is senior or publicly visible.

## Feedback Memory

Treat operator feedback as learning signal:

- If rejected as too senior/global, avoid similar global leadership profiles.
- If accepted, look for the same role pattern at other companies.
- If feedback asks for partnerships, marketing, operators, or Mexico, prioritize that in future runs.
- Do not return people already seen unless enrichment materially changes their data.

## Evidence And Contact Data

Every person needs evidence with a URL and a useful note. Do not invent emails, LinkedIn URLs, or phone numbers. If unavailable, leave the field empty. Prefer direct LinkedIn/public profile evidence; use Apollo/Hunter only when available in the runtime.

## Output Rules

- Return Spanish `rationale`, `angle_hint`, and evidence notes for the backoffice UI.
- Keep names and titles in their real public language.
- Return only JSON, no Markdown.
- Follow `references/output-contract.json`.

## References

- `references/output-contract.json`: required JSON shape.
