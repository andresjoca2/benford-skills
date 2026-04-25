# OUTPUT-CONTRACT.md

## Goal

The prospecting-agent should return outputs that can be persisted by the CRM without major transformation ambiguity.

## Company output shape

Minimum desired fields:
- `id` or stable derived key
- `searchRunId`
- `name`
- `website`
- `linkedinUrl`
- `source`
- `sourceUrl`
- `summary`
- `whySelected`
- `fitScore`
- `roleHint`
- `personalized`
- `rationale`
- `status`
- `metadata`

## Person output shape

Minimum desired fields:
- `id` or stable derived key
- `companyId`
- `searchRunId`
- `name`
- `fullName`
- `title`
- `roleTitle`
- `source`
- `sourceUrl`
- `linkedinUrl`
- `xUrl`
- `rationale`
- `personalization`
- `selected`
- `status`

## Agent output principles

- include evidence when possible
- distinguish observed facts from heuristics
- prefer consistent keys over prose variation
- keep summaries concise and useful
- if confidence is weak, say so in structured form instead of hiding it

## Future extension

Later versions may also return:
- evidence arrays
- raw source snippets
- ranking factors
- memory hints
- follow-up research suggestions
