---
name: dedup-and-enrich
description: Merge, dedupe, verify, and enrich candidates from multiple prospecting sources before internal CRM review.
---

# Dedup And Enrich

Use this skill after multiple sources return overlapping candidates or when a human asks for more evidence.

## Rules

- Dedupe by domain, LinkedIn/profile URL, normalized name plus geography, and source ids when available.
- Respect suppression and rejected patterns before enrichment.
- Enrich only missing fields that affect review quality.
- Do not send outreach.

## Output

Return merged candidates and quality notes for Benford Backoffice.
