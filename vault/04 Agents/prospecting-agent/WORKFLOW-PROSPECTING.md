# WORKFLOW-PROSPECTING.md

## Input

The agent should receive a structured `search_run` or equivalent context containing:
- sender identity
- objective
- industry
- niche
- target type
- requested contact data
- notes or restrictions

## Main workflow

### 1. Interpret search intent
Extract:
- target company profile
- likely pain/opportunity pattern
- likely relevant roles
- obvious exclusions or constraints

### 2. Discover company candidates
Produce company candidates with:
- company name
- source
- source url if available
- short summary
- why it may fit
- confidence or score when possible

### 3. Identify likely contacts
For each strong company candidate, propose likely people with:
- name when available
- role/title
- source
- source url when available
- rationale for why that person is relevant

### 4. Structure output for CRM ingestion
Output should be easy to normalize into:
- `company_prospect`
- `person_prospect`
- optional metadata and evidence fields

### 5. Learn from review
When human decisions come back later, preserve learnings such as:
- saved vs discarded company patterns
- preferred roles
- evidence quality that predicts acceptance

## Quality bar

Good output is:
- relevant
- source-aware
- structured
- reviewable
- explicit about uncertainty

Bad output is:
- vague
- overconfident
- hard to trace
- too verbose for ingestion
- disconnected from the original search objective
