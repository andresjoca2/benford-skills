---
name: company-discovery
description: Research real company, business, practice, or person-as-business candidates for Benford Backoffice campaign runs. Use when OpenClaw receives a company_discovery job, a campaign discovery brief, or a request to return strict JSON company_candidates for outbound prospecting.
---

# Company Discovery

## Purpose

Find candidates that can eventually lead to a person to contact. In a company-first run, return companies, businesses, practices, clinics, firms, stores, or person-owned businesses that match the campaign brief. Do not treat directories as final candidates unless the brief explicitly asks for directories; use directories as sources to discover actual businesses or practitioners.

## Workflow

1. Read the campaign brief: objective, industry, niche, region, company size, positive signals, negative signals, maxCompanies, and any prior feedback.
2. Identify the target entity type from the brief. It may be a formal company, a local business, a professional practice, a clinic, an agency, or a person with a business.
3. Search with the lowest-cost/highest-signal sources first. Escalate only when the brief needs scale or the first pass cannot find enough qualified candidates.
4. For each candidate, collect minimum evidence and assign a score.
5. Return only strict JSON that matches `references/output-contract.json`.

For interactive batch discovery, target `maxCompanies` but do not crawl exhaustively. When `maxCompanies <= 10`, treat the requested count as an exact batch size unless the market is truly exhausted. Do not stop at 4-5 candidates in broad markets such as LATAM fintech, SaaS, agencies, clinics, restaurants, or professional services. Try at least six high-signal search/source angles, at least two city/region variants when the market is geographic, and both primary websites and credible secondary sources before returning fewer than requested. Return a smaller list only when the remaining candidates are weak, duplicated, directory-only, or conflict with negative signals.

When the job brief says `discoveryMode: "fast_prefetch"`, optimize for breadth and review velocity. On first-pass runs, return the requested `maxCompanies` as a discovery batch when the market is broad enough, knowing the backoffice will show only `reviewBatchSize` candidates immediately and cache the rest for later. On follow-up runs where memory already includes prior companies and feedback, treat `reviewBatchSize` strong new candidates as a useful complete result; return more only if they are quick to find. Use concise source checks; one strong official or credible public source is enough per candidate. Do not deep-crawl every candidate unless the entity identity or brief fit is unclear.

## Source Ladder

Use sources in this order unless the brief says otherwise:

1. Primary web sources: official website, landing page, public profile, Google Maps/business page, official social profile.
2. Search/browser tools: browser search, Brave/search, OpenClaw browser, gstack/browser-use, public directories, associations, marketplaces, maps.
3. Enrichment sources: Apollo, Hunter, LinkedIn, Crunchbase, paid databases, Apify/Google Maps scrapers.

Escalate from level 1/2 to level 3 only when:

- maxCompanies is high,
- the target market is hard to find publicly,
- the run has explicit budget,
- or prior feedback says the first source type is low quality.

## Evidence Rule

Minimum evidence:

- Prefer 1 primary source URL.
- If no primary source is available, use 2 credible secondary sources.
- Evidence notes must explain what signal was found, not just repeat the URL.

Do not invent missing data. Leave unknown fields as empty strings.

`domain` must be the candidate's official website domain only. If the evidence is a directory, marketplace, association profile, maps page, or listing site, leave `domain` as an empty string and keep that URL in `evidence`.

## Scoring

Score 0-100. Start from the campaign's implicit threshold of 75 unless the brief says otherwise.

Use this scoring model:

- 40 pts: industry/niche fit.
- 20 pts: region and size fit.
- 25 pts: positive buying/fit signals.
- 15 pts: evidence quality.
- subtract for negative signals, weak evidence, directory-only evidence, or unclear entity identity.

Return fewer than maxCompanies only if weak, duplicated, directory-only, or off-brief candidates are the only remaining options after multiple search/source angles. Do not pad the list.

For follow-up fast_prefetch runs, never time out trying to fill the full requested count after a solid review batch is available. Returning 10 strong non-duplicate companies is better than returning nothing after exhausting the timeout.

For follow-up runs with many already-seen companies, use memory as a duplicate blocklist and taste signal, not as proof that the market is exhausted. If exact matches are thin, broaden into adjacent but relevant channels before returning: seller platforms, payment tools, appointment/booking platforms, industry-specific SaaS, professional marketplaces, business enablement tools, and Mexico/LATAM SMB platforms. Empty `companies: []` is a failure for interactive discovery unless every credible adjacent search angle is impossible or already duplicated.

## Feedback Memory

Prior acceptance/rejection feedback is part of the brief memory. Use it to adjust the next search:

- If the user rejected a candidate because it was a directory, avoid directories as final candidates.
- If the user accepted a type of business, find more candidates with similar traits.
- If feedback mentions missing role/person data, favor candidates where a human contact is likely discoverable later.

## Output Rules

- Return Spanish `rationale` and `evidence.note` for the backoffice UI.
- Keep company names in their real public language.
- Return only JSON, no Markdown.
- Follow `references/output-contract.json`.

## References

- `references/output-contract.json`: required JSON shape.
- `references/source-policy.md`: source ladder and escalation rules.
