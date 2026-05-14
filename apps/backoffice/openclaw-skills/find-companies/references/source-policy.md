# Source Policy

## Principle

Use the cheapest reliable source that can answer the brief. The backoffice needs reviewable candidates, not guesses. Escalate to paid, bulk, or enrichment sources only when public research cannot produce enough qualified candidates or the brief explicitly needs scale.

## Source Tiers

### Tier 1: Strong

- Official company or business website.
- Official landing page or product page.
- Google Maps/business profile for a real local business.
- Official LinkedIn company page.
- Official social profile when it clearly identifies the business.
- Company app-store, marketplace, or verified vendor page when the candidate operates primarily there.
- Association or regulator profile when it identifies a specific member business or licensed practice.

### Tier 2: Acceptable

- Search engine result leading to a direct company page.
- Public directories that identify actual businesses or practitioners.
- Chambers, associations, marketplace category pages, partner directories, and local business directories.
- News, event, podcast, webinar, or public profile pages naming the company and activity.
- Crunchbase, TheOrg, Apollo public, Clay-enriched, or similar database profiles when they support the company identity.

### Tier 3: Weak

- Search result snippets without a direct candidate page.
- Generic category pages.
- Lead-list vendors that sell lists of companies.
- Directories that do not identify a specific business.
- Stale articles with no current evidence.
- Social posts that mention a company but do not confirm fit.

Tier 3 sources should not be the only evidence for a returned candidate unless the market is very small and no better evidence exists. If used, lower the score and explain the uncertainty in `rationale`.

## Source Ladder

Use sources in this order unless the brief says otherwise:

1. Primary web sources: official website, landing page, maps/business page, official LinkedIn page, official social profile.
2. Public discovery sources: search, browser tools, public directories, associations, chambers, marketplaces, maps category pages.
3. Enrichment and scale: Apollo, Hunter, LinkedIn search, Crunchbase or similar databases, Apify scrapers, Google Maps scrapers, other paid/public datasets explicitly available to OpenClaw.

Escalate from levels 1/2 to level 3 only when:

- `maxCompanies` is high,
- the market is hard to find publicly,
- the run has explicit budget,
- prior feedback says the first source type is low quality,
- or public discovery cannot produce enough non-duplicate candidates.

## Final Candidate Rule

Return final candidates that are likely contactable later. For company-first runs this means a company, local business, practice, clinic, agency, store, or person-owned business. For person-as-business categories, the candidate may be the practice/person if that is the market's real buying unit.

Directories, rankings, chamber pages, marketplace category pages, maps searches, and search results are discovery sources. They are final candidates only if the brief explicitly asks for directories or lead sources.

## Evidence Requirements

Each evidence object must include:

- `type`: source category from the output contract.
- `url`: direct URL.
- `note`: Spanish note explaining what the source proves.

Prefer 1 strong source. If no strong source exists, use 2 acceptable sources. Use 1-3 evidence objects total; do not flood the JSON with low-signal links.

## Domain And URL Rules

`domain` must be the candidate's official website domain only, normalized without protocol or path.

Leave `domain` empty when:

- the only source is Google Maps,
- the only source is a directory or marketplace,
- the only source is LinkedIn,
- the official website is unclear,
- the URL belongs to a directory, association, lead-list vendor, article, or social platform.

Do not infer:

- domains from company names,
- LinkedIn URLs from company names,
- employee ranges from vibes,
- cities from country names,
- contactability from a generic contact page that does not belong to the candidate.

If a field is unknown, return an empty string.

## Duplicate And Brand Rules

Reject or omit:

- same official domain,
- same LinkedIn company URL,
- same normalized name in the same country,
- already-seen companies, domains, or LinkedIn URLs from memory,
- suppressed values,
- subsidiaries when the parent was already returned and the brief wants company-level candidates,
- parent companies when the brief wants local branches or specific practices,
- franchise headquarters when the brief wants local owner/operators.

If the business has multiple brands or domains, choose the public brand that best matches the campaign and mention the relationship in evidence or rationale.

## Rejection Patterns

Avoid candidates when:

- they are only a directory and no actual business/person was identified,
- they are outside the requested geography,
- they match a negative signal,
- the evidence does not support the rationale,
- the candidate is too weak just to fill `maxCompanies`,
- the source is a lead-list vendor advertising companies rather than the company itself,
- the result is a generic search/category page,
- the candidate is famous but too broad, too enterprise, too consumer, too regulated, or otherwise inconsistent with the brief.
