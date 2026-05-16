# Source Catalog

Use this as planning metadata. The backend must still enforce configured credentials, source allowlist, budget, and compliance.

## Corporate B2B

- `apollo`: structured company/person search. Strong for corporate B2B, weaker for very small local businesses. Paid.
- `explorium`: broad company data and enrichment fallback. Paid.
- `people_data_labs`: person enrichment and identity resolution. Paid per person; never enrich duplicates or suppressed rows.

## Local Business

- `scrapio`: Google Maps-style local lead generation. Paid.
- `google_maps_places`: local business verification/discovery. Usage-based.
- `apify`: flexible scraper fallback. Cost and quality vary by actor.

## Mexico-Specific

- `inegi_denue`: Mexican economic units. Strong for traditional/local business discovery; usually low direct cost but needs enrichment.
- `seccion_amarilla`: traditional Mexican listings. Scraper dependent.
- `chambers_and_professional_colleges`: Canacintra, Concanaco, medical/accounting/legal colleges, associations.

## Generic

- `web_search`, `web_fetch`, `google_dorks`: default public research and verification.

## CRM

- `internal_crm`: Benford Backoffice CRM persistence and review state. This is the only CRM sink for this app.
