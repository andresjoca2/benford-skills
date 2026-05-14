# Source Catalog

This catalog describes source capabilities for strategy planning. It is not an allowlist by itself. The backend must still enforce configured credentials, allowed sources, budget, rate limits, and compliance.

## Corporate B2B

### `apollo`

- Best for: companies, employees, corporate B2B contacts, titles, firmographics.
- Typical entities: companies and people.
- Strengths: structured filters for geography, industry, headcount, titles, departments.
- Weaknesses: weaker for very small local businesses and informal traditional businesses.
- Cost: paid subscription/API; track per request when provider metadata is available.
- Escalate when: public web lacks volume or contacts.
- Avoid when: the ICP is local/offline, very small, or not likely to maintain corporate profiles.

### `explorium`

- Best for: broad company datasets, international coverage, waterfall enrichment.
- Typical entities: companies.
- Strengths: fallback source for coverage gaps.
- Weaknesses: requires schema mapping and quality checks.
- Cost: paid/API; estimate before bulk calls.

### `people_data_labs`

- Best for: person enrichment, identity resolution, emails/profile normalization.
- Typical entities: people.
- Strengths: enrichment after a named person is known.
- Weaknesses: not the first choice for discovering unknown local businesses.
- Cost: per-person enrichment; never enrich duplicates or suppressed rows.

## Local Business

### `scrapio`

- Best for: Google Maps-style local lead generation.
- Typical entities: local businesses, clinics, practices, stores, restaurants, agencies.
- Strengths: business listings, ratings, reviews, website presence, phone.
- Weaknesses: listing data can be noisy; validate business identity before scoring high.
- Cost: paid/API; use category and geography filters tightly.

### `google_maps_places`

- Best for: direct local business discovery and verification.
- Typical entities: local businesses and practices.
- Strengths: official-ish local listing, phone, website, location.
- Weaknesses: API quotas and per-call cost; category matching can be broad.
- Cost: usage-based; stop when budget is close to limit.

### `apify`

- Best for: targeted extraction from directories or sources without first-party API.
- Typical entities: varies by actor.
- Strengths: flexible fallback.
- Weaknesses: actor quality varies; terms and rate limits must be checked.
- Cost: actor/runtime dependent; treat as budget-risky unless known.

## Mexico-Specific Sources

### `inegi_denue`

- Best for: Mexican economic units and traditional businesses.
- Typical entities: companies, establishments, local units.
- Strengths: official coverage across Mexico.
- Weaknesses: contactability and freshness can be limited; requires enrichment.
- Cost: free or low direct cost; compute/time still counted.

### `seccion_amarilla`

- Best for: traditional Mexican businesses with public listings.
- Typical entities: SMBs, services, local businesses.
- Strengths: useful for categories underrepresented in corporate databases.
- Weaknesses: requires scraper/actor quality checks.
- Cost: depends on scraper.

### `chambers_and_professional_colleges`

- Best for: Canacintra, Concanaco, medical/accounting/legal colleges, associations.
- Typical entities: members, practices, firms.
- Strengths: high relevance for specific traditional/professional ICPs.
- Weaknesses: fragmented formats and uneven data.
- Cost: usually low direct cost; may require custom scraping.

## Recruiting

### `licensed_linkedin_like_provider`

- Best for: professional talent search when licensed data access exists.
- Typical entities: people.
- Strengths: role, current company, geography, seniority.
- Weaknesses: compliance and provider limits.
- Cost: paid; never scrape LinkedIn directly.

### `github`

- Best for: developer recruiting and technical signal.
- Typical entities: people/projects.
- Strengths: public technical evidence.
- Weaknesses: weak for non-technical roles and contactability.
- Cost: low direct cost; respect API limits.

### `wellfound`

- Best for: startup talent and startup companies.
- Typical entities: people and companies.
- Strengths: startup context.
- Weaknesses: coverage varies by geography.

## Signals And Intent

### `theirstack`

- Best for: technographics and hiring signals from job postings.
- Typical entities: companies.
- Strengths: stack and hiring intent.
- Weaknesses: signal needs interpretation and may not imply purchase intent.
- Cost: paid/API.

### `crustdata_or_bombora`

- Best for: funding, job changes, hiring spikes, intent signals.
- Typical entities: companies and people.
- Strengths: timing signals.
- Weaknesses: cost and coverage constraints.

## Generic Research

### `web_search`

- Best for: broad discovery, source verification, niche markets.
- Cost: low direct cost, but time/model cost applies.

### `web_fetch`

- Best for: validating official pages, directories, and evidence URLs.
- Cost: low direct cost, but time/model cost applies.

### `google_dorks`

- Best for: finding hidden public pages, directories, role pages, PDFs.
- Cost: low direct cost, but can be slow.

## CRM Push

### `hubspot`

- Best for: pushing approved, deduped, suppression-checked records to CRM.
- Rule: only after operator approval or explicit backend policy permits it.
- Cost: low direct cost; external side effect requires confirmation in V1.
