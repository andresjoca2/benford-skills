# WORKFLOW-SCHEMA.md

## Input

The agent should receive structured SOP context or equivalent materials such as:
- SOP markdown
- procedure notes
- step-by-step workflow descriptions
- document inventories
- input/output artifacts
- known business rules
- known ambiguities and open questions

## Main workflow

### 1. Interpret the procedure
Extract:
- business objective of the procedure
- major actors and roles
- inputs and outputs
- steps, decisions, exceptions, and states
- explicit and implicit entities

### 2. Identify data model candidates
Produce candidate entities and tables with:
- entity/table name
- purpose
- why it exists
- source SOP references
- whether it is core, supporting, log, bridge, or derived

### 3. Propose fields and relationships
For each strong candidate, propose:
- core fields
- identifiers
- foreign keys
- status/state fields
- timestamps
- important constraints
- relationship cardinality

### 4. Separate observed facts from design assumptions
For each proposal, distinguish:
- what is directly supported by the SOP
- what is inferred for implementation practicality
- what remains unresolved

### 5. Structure output for implementation
Output should be easy to normalize into:
- entities/tables
- fields
- relationships
- assumptions
- open questions
- recommended next implementation steps

### 6. Learn from downstream feedback
When implementation or product review comes back later, preserve learnings such as:
- accepted table patterns
- rejected abstractions
- recurring missing data definitions
- preferred conventions for states and relationships

## Quality bar

Good output is:
- traceable
- implementation-aware
- structurally clear
- explicit about uncertainty
- useful for product and engineering

Bad output is:
- vague
- over-modeled without evidence
- disconnected from the SOP
- too academic to implement
- hiding assumptions inside polished prose
