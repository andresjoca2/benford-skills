# Data Model

The current schema is defined in:

```text
apps/backoffice/db/migrations/0001_core.sql
apps/backoffice/db/migrations/0002_brain_snapshot.sql
apps/backoffice/db/migrations/0003_company_candidate_review_queue.sql
```

Development seed data is defined in:

```text
apps/backoffice/db/seeds/dev.sql
```

## Tables

### `campaigns`

Top-level work unit.

Statuses:

- `draft`
- `active`
- `paused`
- `archived`

### `campaign_briefs`

Current non-versioned campaign brief.

Important: versioned campaign briefs are intentionally deferred. Do not add versioning unless explicitly requested. The current shape stores one live brief per campaign.

Fields include:

- `objective`
- `industry`
- `niche`
- `country_region`
- `company_size`
- `positive_signals`
- `negative_signals`
- `search_mode`
- `run_budget_cents`
- `max_companies`
- `max_people`
- `max_runtime_seconds`
- `min_score_threshold` - default 75. The backend should keep lower-score candidates in SQLite, while the UI can default to showing candidates at or above the threshold.

Planned automatic search settings:

- `auto_search_enabled`
- `auto_search_budget_cents`
- `auto_search_max_companies`
- `auto_search_max_people`
- `auto_search_min_score_threshold`

These settings are not implemented in the schema yet. The current UI only captures
the intended controls so the operator can reason about limits before backend work
exists.

Search modes:

- `companies`
- `people`
- `companies_then_people`

`companies_then_people` is conceptually a multi-stage workflow: find companies, wait for human review, then find people for approved companies. Do not treat it as a single autonomous outreach flow.

### `agent_runs`

A run is a full execution attempt for a campaign.

Statuses:

- `queued`
- `running`
- `needs_review`
- `completed`
- `failed`
- `cancelled`

V1 rule: only one active run per campaign. Active means `queued` or `running`.

### `openclaw_jobs`

A job is one concrete OpenClaw task under a run.

Skills:

- `find_companies`
- `find_people`
- `research_company`
- `research_person`
- `score_company`
- `score_person`
- `draft_outreach`

Statuses:

- `queued`
- `running`
- `succeeded`
- `failed`
- `cancelled`

Future field to add before worker retries become real:

- `idempotency_key`

Recommended key:

```text
hash(campaign_id + run_id + skill + input_json)
```

### `agent_events`

Mission Panel event feed. This table is the audit log for what the agent and backend did.

Current fields:

- `campaign_id`
- `run_id`
- `job_id`
- `subject_type`
- `subject_id`
- `level`
- `event_type`
- `message`
- `payload_json`
- `created_at`

Levels:

- `debug`
- `info`
- `success`
- `warning`
- `error`

Event type catalog:

```text
run.queued
run.started
run.completed
run.failed
run.cancelled
job.queued
job.started
job.completed
job.failed
job.retrying
openclaw.requested
openclaw.responded
openclaw.timeout
company.proposed
company.saved
company.dedupe_skipped
company.suppressed
company.reviewed
person.proposed
person.saved
person.dedupe_skipped
person.suppressed
person.reviewed
feedback.recorded
outreach.draft_created
outreach.approved
system.warning
system.error
```

Seed data currently uses `run.completed` and `people.found`. New code should prefer the catalog above. If a new type is needed, add it here first.

### `companies`

Global deduped company table.

Dedupe priority:

1. `domain`
2. `linkedin_url`
3. `normalized_name + country`

### `company_candidates`

Campaign-specific candidate state for a company.

In V1 this can represent a formal company, local business, professional practice, clinic, firm, store, or person-owned business. The core requirement is that it can later lead to a person to contact.

Statuses:

- `new`
- `approved`
- `rejected`
- `maybe`
- `needs_more_research`
- `do_not_contact`

Operational meaning:

- `maybe`: human deferred decision; does not automatically schedule more research.
- `needs_more_research`: should create or queue a future `research_company` job.
- `do_not_contact`: should insert a matching row into `suppression_list`.

Review queue fields:

- `review_visible`: `1` means visible in the current review lot. `0` means saved
  in SQLite but hidden until the next cached reveal.
- `review_revealed_at`: timestamp when the candidate became visible.

The current `find_companies` loop can prefetch more candidates than it reveals.
The UI reviews visible candidates in lots of 10; `POST /api/campaigns/:id/runs`
can reveal the next hidden lot without calling OpenClaw.

### `people`

Global deduped person table.

Dedupe priority:

1. `email`
2. `linkedin_url`
3. `normalized_name + company_id`
4. `normalized_name + company_name + country`

### `person_candidates`

Campaign-specific candidate state for a person. Uses the same status set as company candidates.

### `feedback`

Human feedback and decisions. This is not only audit data: accepted/rejected rationale should feed the next OpenClaw run as memory.

Only non-empty textbox feedback creates a row in this table. A plain accept/reject
without text still updates candidate status, but does not add empty memory to
future agent runs.

Subject types:

- `campaign`
- `company_candidate`
- `person_candidate`

Feedback types:

- `approved`
- `rejected`
- `maybe`
- `needs_more_research`
- `do_not_contact`
- `comment`

### `suppression_list`

Global block list.

Scopes:

- `company`
- `domain`
- `linkedin_url`
- `email`
- `person`

Rule: setting a candidate to `do_not_contact` should also write to `suppression_list`. The suppression list is the global source of truth for future skips.

### `outreach_drafts`

Draft-only outreach store for V1.

Statuses:

- `draft`
- `approved`
- `queued`
- `sent`
- `failed`
- `cancelled`

V1 rule: no automatic sending.

Automatic search is allowed only for discovery work after implementation. It must
not create or send outreach automatically.

## Migration Rules

- Never hand-edit an operational SQLite DB.
- Schema changes go through `apps/backoffice/db/migrations`.
- Development data goes through `apps/backoffice/db/seeds`.
- Runtime DB files stay ignored under `.data`.
- Current operational DB path on OpenClaw:
  `/root/benford/benford-skills/apps/backoffice/.data/backoffice.sqlite`.
- The laptop-local prototype DB was deleted after the remote DB became the source of truth.
