# OUTPUT-CONTRACT.md

## Goal

The fundraising-agent should return outputs that can be used directly by founders for investor targeting, outreach, meeting prep, and follow-up with minimal ambiguity.

## Typical output sections

- `contextSummary`
- `investors`
- `rationale`
- `risksOrObjections`
- `nextSteps`
- `notes`

## Investor output shape

Minimum desired fields:
- `name`
- `type`
- `stageFit`
- `geoFit`
- `whyRelevant`
- `sourceSupport`
- `confidence`
- `status`
- `notes`

## Agent output principles

- include evidence when possible
- distinguish observed facts from heuristics
- keep summaries concise and useful
- preserve clear rationale for why an investor belongs in the list
- if confidence is weak, say so in structured form
