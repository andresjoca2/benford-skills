# Find Companies Search Playbook

Use this playbook to turn a campaign brief into a deduped company candidate batch.

## Search Order

1. Read the full brief and memory.
2. Build a candidate hypothesis: entity type, geography, size, positive signals, negative signals, and future contact path.
3. Search broad public web for the market.
4. Search official/map/local profiles for real entities.
5. Search associations, chambers, marketplaces, directories, and partner ecosystems.
6. Search geography and language variants.
7. Use enrichment or bulk sources only when available and useful.
8. Score, dedupe, and return strict JSON.

## Query Pattern

Combine:

- industry or niche,
- geography,
- company type,
- positive signal,
- source hint,
- exclusion signal when needed.

Examples:

```text
"fintech B2B" Mexico startups
"fintech" "gestion financiera" empresas Mexico
"despacho contable" pymes "IMSS" Monterrey
"clinica dental" "Google Maps" Guadalajara
site:linkedin.com/company "fintech" "Mexico"
site:clutch.co "software development" "Mexico"
site:doctoralia.com.mx "clinica" "Ciudad de Mexico"
site:amiti.org.mx socios software Mexico
```

## Geography Variants

Use these when the brief mentions Mexico or LATAM:

- Mexico, MX, Ciudad de Mexico, CDMX, Monterrey, Guadalajara, Queretaro, Puebla, Tijuana.
- LATAM, Latin America, America Latina, Hispanoamerica.
- Country variants: Colombia, Chile, Peru, Argentina, Brasil, Costa Rica.
- Spanish and English market terms.

For local services, search city-by-city. For startups or SaaS, search country/region plus ecosystem sources.

## Candidate Type Patterns

### Startups / SaaS / Fintech

Use:

- startup directories and ecosystem maps as discovery sources,
- official websites,
- LinkedIn company pages,
- Crunchbase/public database profiles,
- accelerator portfolios,
- partner marketplaces,
- press and product pages.

Positive signals:

- B2B positioning,
- clear product category,
- regional growth,
- funding stage when relevant,
- founders or leadership visible,
- integrations, API, finance, operations, compliance, or workflow pain.

Avoid:

- banks or traditional financial institutions when negative,
- consumer-only apps when the campaign is B2B,
- crypto/noise unless explicitly requested,
- giant enterprise brands when the target is SMB or mid-market.

### Professional Services / Firms / Agencies

Use:

- official websites,
- Google Maps,
- local directories,
- association/chamber member lists,
- Clutch or similar marketplaces,
- LinkedIn company pages.

Positive signals:

- specific service line matching the campaign,
- local client focus,
- owner/partner visibility,
- team/contact page,
- industry specialization.

Avoid:

- generic blogs,
- legal-only firms when accounting/IMSS/tax is requested,
- enterprise consultancies when the brief wants small practices,
- agencies with no real contact path.

### Clinics / Local Businesses / Practices

Use:

- Google Maps/business profiles,
- official websites,
- Doctoralia or vertical directories,
- association/regulator directories,
- Instagram/Facebook only when clearly official.

Positive signals:

- real location,
- current operating profile,
- owner/practitioner visible,
- service line matching the brief,
- public phone/contact/profile path.

Avoid:

- directory category pages,
- duplicate branches unless location-level targeting is requested,
- businesses outside target city/region,
- inactive or unclear listings.

### Marketplaces / Partner Ecosystems / Retail

Use:

- marketplace seller pages,
- partner directories,
- official merchant pages,
- maps profiles,
- company sites and social profiles.

Positive signals:

- active seller/merchant footprint,
- B2B or operational need,
- visible owner/operator/contact path,
- relevant category and geography.

Avoid:

- the marketplace itself unless it is the target,
- anonymous storefronts with no business identity,
- duplicated branch/location pages.

## Source-Specific Tactics

### Official Website

Look for:

- homepage positioning,
- about page,
- service/product pages,
- customer segment,
- location/contact page,
- team/founder/partner page,
- case studies or integrations.

### Google Maps / Local Profiles

Use maps for local businesses and practices. Evidence should state what the listing confirms: location, category, operating business identity, contact path, or website.

### Directories / Associations / Marketplaces

Use these to discover candidates, then open candidate pages or official sites when possible. If the directory page is the only evidence, return the candidate only when it identifies a specific real business and the score reflects weaker evidence.

### LinkedIn

Use direct company pages as evidence. Do not use LinkedIn search results as a company URL. Do not infer a LinkedIn URL when it is not directly visible.

### Enrichment / Databases

Use Apollo, Hunter, Crunchbase, Apify, Google Maps scrapers, or similar tools only when available in the runtime/input. Prefer them for scale, employee range, domain confirmation, and discovering official profiles. Still validate fit when possible.

## Exhaustion Rule

Before returning fewer than `maxCompanies` for a broad market, try at least:

- 3 source types,
- 6 query angles,
- 2 geography variants when geography matters,
- Spanish and English terms when Mexico/LATAM is involved,
- official or maps/profile sources for the best candidates.

Do not pad weak results after the market is genuinely exhausted.
