# OUTPUT-CONTRACT.md

## Goal

The data-model-agent should return outputs that can be used directly by product and engineering to review or implement database structures with minimal ambiguity.

## Minimum desired output sections

- `contextSummary`
- `entities` or `tables`
- `relationships`
- `assumptions`
- `openQuestions`
- `implementationNotes`

## Table / entity output shape

Minimum desired fields:
- `name`
- `kind`
- `purpose`
- `sourceSupport`
- `rationale`
- `fields`
- `keys`
- `relationships`
- `status`
- `notes`

## Field output shape

Minimum desired fields:
- `name`
- `type`
- `required`
- `description`
- `sourceSupport`
- `rationale`

## Relationship output shape

Minimum desired fields:
- `from`
- `to`
- `cardinality`
- `description`
- `sourceSupport`
- `rationale`

## Agent output principles

- include traceability to SOP steps when possible
- distinguish observed facts from heuristics
- prefer explicit modeling choices over hidden assumptions
- keep descriptions concise and implementation-useful
- if confidence is weak, say so in structured form

## Future extension

Later versions may also return:
- SQL starter DDL
- Prisma/Drizzle-style model drafts
- event model suggestions
- lifecycle state machines
- migration notes
- API payload suggestions
