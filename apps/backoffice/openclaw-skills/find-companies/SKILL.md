---
name: find-companies
description: Research real company, business, practice, or person-as-business candidates for Benford Backoffice campaign runs. Use when OpenClaw receives a find_companies job, a campaign discovery brief, or a request to return strict JSON company_candidates for outbound prospecting.
---

# Find Companies

## Mission

Find real, evidence-backed company or business candidates for a Benford Backoffice campaign. Optimize for candidates that are worth human review now and can later lead to a named person to contact. The candidate may be a formal company, local business, professional practice, clinic, firm, store, agency, franchise location, or person-owned business when that is the real buying unit.

Do not optimize for famous brands, generic lists, or easy directory results. A directory is normally a discovery source, not a final candidate.

## Inputs To Read First

Read the full input before searching:

1. `brief.objective`
2. `brief.industry`
3. `brief.niche`
4. `brief.countryRegion`
5. `brief.companySize`
6. `brief.positiveSignals`
7. `brief.negativeSignals`
8. `brief.peopleContext`
9. `brief.maxCompanies`
10. `brief.minScoreThreshold`
11. `brief.reviewBatchSize`
12. `brief.discoveryMode`
13. `memory.alreadySeenCompanies`
14. `memory.alreadySeenDomains`
15. `memory.alreadySeenLinkedinUrls`
16. `memory.approvedCompanies`
17. `memory.rejectedCompanies`
18. `memory.needsMoreResearchCompanies`
19. `memory.feedback`
20. `memory.suppression`

Treat operator feedback as product signal. Approved candidates tell you what to find more of. Rejected and do-not-contact candidates tell you what to avoid. Never return already-seen companies, already-seen domains, already-seen LinkedIn URLs, or suppressed values.

## Operating Principles

- Real entity first: every candidate must be an identifiable business or practice.
- Evidence before inference: the source must support the fit, location, or identity claim.
- The buying unit matters: for local services, a solo practitioner or owner-led practice can be the right candidate.
- Specific beats broad: prefer a firm that clearly matches the niche over a huge generic company.
- Contactability path matters: prefer businesses with an official site, map profile, LinkedIn page, team page, contact page, or public owner/operator trail.
- Directory-only evidence is weak and should lower score unless the market is very small.
- Return fewer than `maxCompanies` rather than padding with duplicates, directories, off-brief entities, or weak guesses.

## Workflow

1. Build a candidate hypothesis.
   - Identify the real entity type: startup, SMB, professional practice, clinic, agency, shop, association member, franchisee, or person-owned business.
   - Identify location requirements and excluded geographies.
   - Identify positive buying signals and hard negative signals.
   - Identify what kind of person should eventually be contactable from the company.

2. Search with the cheapest reliable sources first.
   - Use `references/search-playbook.md`.
   - Start with official websites, maps/business profiles, public profiles, associations, marketplaces, and search results.
   - Escalate to enrichment or bulk sources only when the run needs scale or public discovery is thin.

3. Create a wide dedupe pool before scoring.
   - Collect more raw names than needed.
   - Remove candidates already present in memory.
   - Remove directories, lead-list vendors, generic category pages, and companies that conflict with negative signals.
   - Avoid returning subsidiaries, branches, or franchise locations as duplicates unless the campaign clearly wants location-level businesses.

4. Validate enough evidence for each candidate.
   - Prefer one strong official or map/profile source.
   - Use two credible secondary sources when no primary source exists.
   - Confirm that the candidate is real, in-region, and matches the niche.

5. Score and select.
   - Use `references/scoring-rubric.md`.
   - Sort by campaign fit and review actionability, not brand fame.
   - Keep useful diversity when the brief is broad: avoid returning ten near-identical weak candidates from the same source page.

6. Return strict JSON only.
   - Match `references/output-contract.json`.
   - No Markdown, code fences, comments, citations outside `evidence`, or explanatory prose.

## Discovery Modes

### `fast_prefetch`

Optimize for breadth and review velocity. The backoffice will show only `reviewBatchSize` candidates immediately and cache the rest.

For first-pass runs:

- Return `maxCompanies` when the market is broad enough.
- One strong official or credible public source is enough per candidate.
- Do not deep-crawl every candidate unless identity or brief fit is unclear.

For follow-up runs with already-seen companies:

- A result with `reviewBatchSize` strong new candidates is complete and useful.
- Return more only if they are quick to find.
- Do not spend the whole timeout trying to fill an oversized batch.

### Standard / Deep Discovery

Use when the brief is narrow, high-value, low-volume, or asks for stronger evidence. Validate more deeply, use multiple sources when useful, and prefer fewer higher-confidence candidates over a large shallow batch.

## Minimum Batch Bar

For interactive batch discovery, target `maxCompanies` but do not crawl exhaustively.

When `maxCompanies <= 10`, treat the requested count as an exact batch size unless the market is truly exhausted. Do not stop at 4-5 candidates in broad markets such as LATAM fintech, SaaS, agencies, clinics, restaurants, local services, or professional services.

Before returning fewer than requested in a broad market, try at least:

- six distinct search/source angles,
- two city/region variants when geography matters,
- official websites or maps profiles,
- credible secondary sources such as associations, marketplaces, directories, or public profile pages.

Return a smaller list only when the remaining candidates are weak, duplicated, directory-only, suppressed, or conflict with negative signals.

For follow-up runs with many already-seen companies, use memory as a duplicate blocklist and taste signal, not as proof that the market is exhausted. If exact matches are thin, broaden into adjacent but relevant channels before returning: seller platforms, payment tools, appointment/booking platforms, industry-specific SaaS, professional marketplaces, business enablement tools, and Mexico/LATAM SMB platforms. Empty `companies: []` is a failure for interactive discovery unless every credible adjacent search angle is impossible or already duplicated.

## Feedback Memory

Prior acceptance/rejection feedback is part of the brief memory. Use it to adjust the next search:

- If the user rejected a candidate because it was a directory, avoid directories as final candidates.
- If the user accepted a type of business, find more candidates with similar traits.
- If feedback mentions missing role/person data, favor candidates where a human contact is likely discoverable later.
- If feedback says candidates are too large, too small, too generic, not local, not B2B, not founder-led, not a real business, or not in the right niche, treat that as a hard search correction.

## Output Field Guidance

- `name`: real public company/business/practice name.
- `domain`: official website domain only, without protocol. Leave empty for maps, directories, marketplaces, associations, and social-only profiles.
- `linkedin_url`: direct company LinkedIn page only. Leave empty for search results or inferred URLs.
- `country`: use the public market/geography from evidence or brief fit. Prefer full country names or common campaign notation consistently.
- `city`: city or metro only when evidenced or strongly implied by maps/official source.
- `industry`: concise industry label that matches the campaign vocabulary.
- `employee_range`: public or reasoned range only when supported by source context; otherwise empty string.
- `description`: one factual sentence about what the business does.
- `score`: 0-100 using the scoring rubric.
- `rationale`: Spanish explanation for why the operator should review this company.
- `evidence`: 1-3 useful evidence objects with Spanish notes.

## Evidence Rules

Every returned company needs evidence with a URL and a note explaining what the source proves. Use `references/source-policy.md`.

Good evidence notes:

- "Sitio oficial describe una plataforma B2B de gestion financiera para empresas."
- "Perfil de Google Maps confirma clinica dental en Guadalajara con datos de contacto."
- "Directorio de la asociacion confirma despacho contable afiliado en Monterrey."

Bad evidence notes:

- "Website."
- "Fuente."
- "Parece buena empresa."
- "Resultado de busqueda."

Do not invent missing data. Leave unknown fields as empty strings.

`domain` must be the candidate's official website domain only. If evidence is a directory, marketplace, association profile, maps page, LinkedIn page, or listing site, leave `domain` empty unless the same source clearly gives the official website and you have verified it belongs to the candidate.

## Quality Bar

A strong result has:

- clear industry/niche fit,
- geography fit,
- positive buying or operational signal,
- official website, maps profile, LinkedIn page, association profile, or credible public source,
- realistic path to find a person later,
- Spanish rationale tied to the campaign.

A weak result has:

- generic category fit only,
- unclear real-world entity identity,
- no direct URL,
- directory-only evidence,
- wrong geography,
- obvious negative signal,
- duplicate name/domain/LinkedIn,
- generic rationale that could apply to any company.

## Output Rules

- Return Spanish `rationale` and `evidence.note` for the backoffice UI.
- Keep company names in their real public language.
- Return only JSON, no Markdown.
- Follow `references/output-contract.json`.

## References

- `references/output-contract.json`: required JSON shape.
- `references/search-playbook.md`: query patterns and source sequence.
- `references/source-policy.md`: source quality and evidence rules.
- `references/scoring-rubric.md`: 0-100 scoring model.
