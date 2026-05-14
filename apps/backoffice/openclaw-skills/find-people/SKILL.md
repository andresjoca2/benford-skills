---
name: find-people
description: Research actionable people at an approved target company for Benford Backoffice campaign runs. Use when OpenClaw receives a find_people job, a company-scoped people-discovery request, or a strict JSON people candidate contract.
---

# Find People

## Mission

Find real, evidence-backed people at the target company who are plausible outreach targets for the campaign. Optimize for contactability, ownership of the relevant business motion, geography, and buying-committee fit. Do not optimize for fame, generic seniority, or the most visible executive.

This is a company-scoped skill. The target company has already been reviewed or approved by the operator. Your job is to find the people inside that company who are worth reviewing next.

## Inputs To Read First

Read the full input before searching:

1. `brief.objective`
2. `brief.peopleContext`
3. `brief.positiveSignals`
4. `brief.negativeSignals`
5. `brief.maxPeople`
6. `brief.discoveryMode`
7. `targetCompany`
8. `sourceData`, especially `sourceData.hunter.people` when present
9. `memory.feedback`
10. `memory.companyPeople`
11. `memory.refreshFeedback`

Treat `peopleContext`, review feedback, and refresh feedback as operator instructions. Treat prior approvals and rejections as learning signal. Never return people already seen unless the new evidence materially improves contactability or role fit.

## Operating Principles

- Real person first: every candidate must have a real public name.
- Evidence before inference: do not infer a person from a role title, org chart assumption, or generic company page.
- Operator over celebrity: for large companies, prefer the owner of the motion over global executives.
- Local beats global when geography matters: Mexico/LATAM role owners usually beat global leadership pages.
- Contactability matters, but does not excuse bad role fit.
- A small business can justify owner/founder outreach; an enterprise usually cannot unless the brief asks for it.
- Return fewer than `maxPeople` rather than padding with weak, duplicate, off-company, or unevidenced people.

## Workflow

1. Build a role hypothesis from the campaign.
   - Identify the likely buying committee.
   - Identify excluded roles from negative signals and feedback.
   - Decide whether this is an owner-led, operator-led, partnership-led, finance-led, sales-led, marketing-led, technical, or operations-led search.

2. Search the target company first.
   - Use the target company name, official domain, LinkedIn company page, leadership/team pages, press pages, partner pages, and public profiles.
   - Verify that each person actually belongs to the target company or clearly did at the relevant time.

3. Search by role cluster.
   - Use the role strategy below and `references/search-playbook.md`.
   - Use Spanish and English role variants when the company or geography is Mexico/LATAM.

4. Use enrichment data.
   - If Hunter data is present, rank it by role fit and contact confidence.
   - Do not blindly return every Hunter contact.
   - Use Apollo/Hunter only when available in the runtime or input.

5. Score and select.
   - Use `references/scoring-rubric.md`.
   - Keep a buying-committee mix when useful.
   - Avoid returning five people from the same global executive page unless the company is very small and those are the only real operators.

6. Return strict JSON only.
   - Match `references/output-contract.json`.
   - No Markdown, code fences, comments, citations outside `evidence`, or explanatory prose.

## Role Strategy

### Partnership, Channel, Marketplace, Ecosystem

Search in this order:

1. Partnerships, alliances, business development, channel, ecosystem, strategic partnerships.
2. Mexico/LATAM heads, directors, leads, country managers, regional operators.
3. Marketplace, seller ecosystem, merchant success, partner success, growth.
4. Commercial operations, marketing, sales, product marketing when they appear to own the same motion.
5. Spanish variants: alianzas, desarrollo de negocio, canal, ecosistema, vendedores, comercios, aliados, socios, crecimiento.
6. Executive fallback only if targeted operators cannot be found or evidence shows the executive owns the motion.

### Finance, Compliance, Audit, Accounting

Prefer:

- CFO, VP Finance, Head of Finance, Controller, Finance Director.
- Accounting, tax, compliance, audit, treasury, financial operations.
- Mexico/LATAM finance leadership when the campaign is regional.

Avoid:

- Generic founders at larger companies unless founder-led finance ownership is credible.
- Investor relations or public-company finance roles when the campaign is SMB/mid-market.

### Operations, Customer, Delivery

Prefer:

- COO, operations director, head of operations, customer operations.
- Merchant/seller/customer success when the business motion is marketplace or SaaS adoption.
- Regional operators when logistics or local market execution matters.

### Marketing, Growth, Demand

Prefer:

- Head/Director of Growth, Marketing, Demand Gen, Lifecycle, Product Marketing.
- Partnership marketing or channel marketing when the campaign has a co-marketing angle.

### Technology, Product, Data

Prefer:

- CTO, Head of Product, Engineering, Data, Automation, Platform, Integrations.
- Technical operators when the campaign requires integration, automation, or workflow ownership.

### Small Business / Owner-Led

For local businesses, clinics, agencies, practices, stores, or person-owned businesses:

- Owner, founder, managing partner, director general, socio director, principal, or practice lead can be the best target.
- One strong owner candidate is enough if the business appears solo or very small.

## Executive Fallback Rules

Use CEO, founder, president, executive chairman, owner, or global C-level only when at least one is true:

- The company is small, founder-led, or owner-led.
- The campaign explicitly asks for executives, founders, owners, or C-suite.
- Evidence says the executive directly owns the relevant motion.
- Targeted role searches failed and the executive is the best route to a referral.

For large companies, demote global C-levels when there is no evidence of relevant functional ownership. Do not give a high score only because a person is senior.

## Evidence Rules

Every returned person needs evidence with a URL and a note that explains the signal. The note must state what the source proves, for example:

- person works at target company
- person owns the relevant role/function
- person has Mexico/LATAM scope
- person has an email/contact source
- person appears in company leadership/team/press material

Use `references/source-policy.md` for accepted source quality.

Do not invent emails, phones, LinkedIn URLs, cities, titles, or current employment. If unavailable, leave the field as an empty string.

## Output Field Guidance

- `name`: real public person name.
- `title`: real public title, in the language found.
- `company_name`: target company name unless evidence clearly uses a different legal/public name for the same company.
- `company_domain`: official target company domain when known.
- `linkedin_url`: direct public profile URL only. Leave empty if only a search result is available.
- `email` and `phone`: only from credible source/tool output.
- `country` and `city`: use specific values only when evidenced or strongly implied by public role scope.
- `seniority`: concise seniority label.
- `function`: concise function label.
- `description`: one-sentence factual description.
- `score`: 0-100 using the rubric.
- `rationale`: Spanish explanation for the backoffice operator.
- `angle_hint`: Spanish outreach angle tailored to this person.
- `role_category`: one of the enum values in the contract.
- `geo_scope`: one of `Mexico`, `LATAM`, `Global`, `Unknown`.
- `seniority_fit`: one of `operator`, `manager`, `director`, `vp`, `c_level`, `owner`, `unknown`.
- `reachability_reason`: Spanish note explaining why this person can or cannot be reached.
- `source_provider`: `public_web`, `linkedin`, `hunter`, or `apollo`.
- `evidence`: 1-3 useful evidence objects.

## Quality Bar

A strong result has:

- target-company match,
- role ownership,
- region fit when relevant,
- direct LinkedIn/profile/team/evidence URL,
- contactability signal when available,
- campaign-specific rationale,
- person-specific angle.

A weak result has:

- global seniority but no functional ownership,
- no direct evidence URL,
- unclear current employment,
- wrong geography,
- no contact path,
- repeated candidates from prior memory,
- a generic angle that could apply to anyone.

## Output Rules

- Return Spanish `rationale`, `angle_hint`, `reachability_reason`, and evidence notes.
- Keep names, titles, and company names in their real public language.
- Return only JSON.
- Follow `references/output-contract.json`.

## References

- `references/output-contract.json`: required JSON shape.
- `references/search-playbook.md`: role-query patterns and search sequence.
- `references/source-policy.md`: source quality and evidence rules.
- `references/scoring-rubric.md`: 0-100 scoring model.
