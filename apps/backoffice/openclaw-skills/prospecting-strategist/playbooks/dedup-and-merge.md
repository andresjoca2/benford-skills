# Dedup And Merge

## Company Identity Priority

Deduplicate companies by:

1. Official domain.
2. LinkedIn company URL.
3. Normalized name plus country.
4. Normalized name plus city plus source-specific address when available.

When sources disagree, prefer the value from:

1. Official website or official profile.
2. Licensed structured provider.
3. Maps/business listing.
4. Association or directory.
5. Generic web result.

## Person Identity Priority

Deduplicate people by:

1. Email.
2. LinkedIn/profile URL.
3. Normalized name plus company id.
4. Normalized name plus company name plus country.

Do not merge two people only because they share a first name, title, or company.

## Merge Rules

- Keep all useful evidence URLs.
- Keep source provenance per field when available.
- Do not overwrite a strong sourced field with a weaker inferred field.
- Preserve original source names for audit.
- Apply suppression before returning merged candidates.
- Mark uncertain merges for review instead of silently collapsing them.

## Quality Impact

Deduped results should improve quality:

- duplicates do not count toward result count,
- rows with stronger evidence should receive higher confidence,
- conflicting data should lower score until resolved,
- suppressed rows should be removed from review output and logged separately.
