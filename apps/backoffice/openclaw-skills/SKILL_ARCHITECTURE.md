# Backoffice Prospecting Skill Architecture

## Decision

Do not create one skill per platform by default.

Skills model prospecting capabilities and ICP playbooks. Platforms such as Apollo, Scrap.io, Explorium, PDL, DENUE, Apify, and Google Maps are source adapters that skills may call when the strategy says they fit.

## Layers

1. `prospecting-strategist`
   - Plans the run.
   - Chooses ICP, source order, quality gates, fallback rules, and budget stops.
   - Does not execute paid sources.

2. Playbook skills
   - `corporate-b2b`
   - Future examples: `local-business`, `mexico-traditional`, `recruiting-talent`, `healthcare`, `professional-services`.
   - These decide how to search a class of market.
   - They can be paired with any compatible capability.
   - They reference source adapters but do not own credentials.

3. Execution primitives
   - `company-discovery`
   - `person-discovery`
   - `dedup-and-enrich`
   - These execute concrete steps and return strict JSON for the backend.

4. Source adapters
   - Apollo, Scrap.io, Explorium, PDL, DENUE, Apify, Google Maps, TheirStack.
   - Implemented in backend/tool wrappers after the skill contracts are stable.
   - Shared across skills.

5. Internal CRM state
   - The CRM sink is Benford Backoffice itself: campaigns, candidates, reviews, feedback, suppression, events.
   - There is no third-party CRM dependency.

## When A Platform Gets Its Own Skill

Only create a platform-specific skill when the provider has enough unique behavior to justify a reusable manual:

- complex query grammar,
- non-obvious filters,
- costly calls that need careful batching,
- provider-specific quality caveats,
- compliance constraints,
- reusable examples that several ICP skills need.

Otherwise, keep it as a source adapter reference inside the source catalog.

## Current Skill Set To Build First

1. `prospecting-strategist`
2. `company-discovery`
3. `person-discovery`
4. `dedup-and-enrich`
5. `corporate-b2b`

Wrappers come after those contracts because wrappers should implement the plan, not define the product logic.

## Step Shape

Every executable step should identify:

- `phase`: company_training, company_autopilot, people_mapping, people_direct_search, dedup_enrich, review
- `capability`: company-discovery, person-discovery, dedup-and-enrich
- `playbook`: corporate-b2b for this MVP
- `mode`: source-specific behavior within the capability
- `source_plan`: ordered source adapter calls or public research paths

Example:

```json
{
  "phase": "people_mapping",
  "capability": "person-discovery",
  "playbook": "corporate-b2b",
  "mode": "people_mapping_from_approved_companies",
  "source_plan": ["company_site", "apollo", "pdl"],
  "requires_review_state": "approved_companies"
}
```
