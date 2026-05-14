# API

The current server is:

```text
apps/backoffice/dev.ts
```

All responses are JSON for `/api/*`.

## Health

### `GET /api/health`

Returns:

```json
{
  "ok": true,
  "database": "/absolute/path/to/backoffice.sqlite"
}
```

## Campaigns

### `GET /api/campaigns`

Returns campaign summaries for the Campanas screen.

### `POST /api/campaigns`

Body:

```json
{
  "name": "Fintech LATAM",
  "criteria": "Founders de fintech B2B"
}
```

Creates a campaign and a live `campaign_briefs` row.

### `GET /api/campaigns/:id`

Returns campaign detail:

```json
{
  "campaign": {
    "id": "campaign_fintech_latam",
    "name": "Fintech LATAM - Founders",
    "brief": {},
    "runs": []
  }
}
```

### `PUT /api/campaigns/:id/brief`

Updates the current live brief.

Body fields:

```json
{
  "objective": "...",
  "industry": "...",
  "niche": "...",
  "countryRegion": "...",
  "companySize": "...",
  "peopleContext": "Roles objetivo, seniority, areas, excluir roles...",
  "positiveSignals": "...",
  "negativeSignals": "...",
  "searchMode": "companies",
  "runBudgetCents": 2000,
  "maxCompanies": 10,
  "maxPeople": 0,
  "maxRuntimeSeconds": 120,
  "minScoreThreshold": 75
}
```

The threshold should filter the review UI but not delete lower-score rows from SQLite.

### `GET /api/campaigns/:id/candidates`

Returns company candidates for the Empresas tab inside a campaign.

### `GET /api/campaigns/:id/people`

Returns person candidates for the Personas tab inside a campaign.

### `POST /api/campaigns/:id/runs`

Creates a queued agent run and its first queued OpenClaw job, or reveals cached
hidden company candidates when requested.

Body:

```json
{
  "replaceQueuedRun": true,
  "revealCachedCompanies": true,
  "reviewBatchSize": 10,
  "prefetchCompanies": 20
}
```

Rules:

- only one `queued` or `running` run per campaign
- `replaceQueuedRun` cancels a queued run before creating the new run
- `revealCachedCompanies` reveals the next hidden review lot before creating a new OpenClaw job
- `reviewBatchSize` controls how many cached candidates become visible; current UI sends 10
- `prefetchCompanies` asks OpenClaw for a larger batch so future review lots can be instant; current UI caps interactive company prefetches at 20 to keep reruns responsive
- `people` briefs enqueue `find_people`
- `companies` and `companies_then_people` briefs enqueue `find_companies`

Returns `409` with `active_run_exists` when a run is already active.

### Planned: `PUT /api/campaigns/:id/auto-search`

Not implemented yet. The current UI modal is frontend-only.

Expected body:

```json
{
  "enabled": true,
  "searchMode": "companies_then_people",
  "runBudgetCents": 5000,
  "maxCompanies": 100,
  "maxPeople": 200,
  "minScoreThreshold": 75
}
```

Rules before implementation:

- automatic search is discovery only, never automatic outreach
- stop when compute budget, company limit, people limit, or manual pause is reached
- keep lower-score candidates in SQLite; default UI filtering uses `minScoreThreshold`
- require a kill switch and idempotency before long-running worker mode
- use feedback memory from accepted, rejected, and `do_not_contact` reviews

### `POST /api/candidates/company/:id/review`

Reviews a company candidate.

Body:

```json
{
  "status": "approved",
  "feedback": "Buen fit",
  "createdBy": "Manu"
}
```

Allowed statuses:

```text
approved, rejected, maybe, needs_more_research, do_not_contact, new
```

Writes candidate status and an `agent_events` record. Non-empty `feedback` also
writes a `feedback` row. `do_not_contact` also writes `suppression_list`;
`needs_more_research` is exposed in the UI as `Enrich`: it keeps the candidate
available as enrichment context for the next run and enqueues a research job.
Approving a company queues a scoped `find_people` run for that company so the
Personas tab can start filling from approved companies.
Non-empty feedback text is memory for the next run and is sent in
`openclaw_jobs.input_json.memory.feedback`.

### `POST /api/company-candidates/:id/people-runs`

Queues a `find_people` run scoped to one approved company candidate. This is the
Personas tab refresh/enrich action.

Body:

```json
{
  "replaceQueuedRun": true,
  "enrich": true,
  "feedback": "Buscar partnerships y marketing; evitar ventas junior.",
  "maxPeople": 5
}
```

Rules:

- candidate must be an approved company candidate
- run input includes the target company, campaign brief, `peopleContext`,
  campaign memory, previous people feedback for that company, and refresh
  feedback from the operator
- `replaceQueuedRun` can cancel a queued people run for the same company, but
  does not cancel a running one
- `enrich` asks the agent to spend more effort and use higher-cost providers
  such as Hunter/Apollo when available

### `POST /api/candidates/person/:id/review`

Same contract as company candidate review, scoped to `person_candidates`.
`do_not_contact` suppresses only that person/email/linkedin, not the company.

### `POST /api/runs/:id/cancel`

Cancels a queued or running run, cancels its queued/running jobs, and writes an
event. Returns `409` with `run_not_cancellable` for terminal runs.

## Events

### `GET /api/events`

Returns the latest agent events.

Optional query:

```text
?campaignId=campaign_fintech_latam
```

### `GET /api/runs/:id/events`

Returns events scoped to one run.

Future realtime endpoint:

```text
GET /api/runs/:id/events/stream
```

Use Server-Sent Events for V1 realtime Mission Panel updates. Do not use WebSockets unless bidirectional client commands become necessary.

## Companies

### `GET /api/companies`

Returns global companies for the Empresas screen.

### `POST /api/companies`

Manual company create.

Body:

```json
{
  "name": "Mendel",
  "domain": "mendel.com",
  "industry": "Fintech"
}
```

## Prospects

### `GET /api/prospects`

Returns person candidates in the compatibility shape expected by the current Prospectos screen.

### `POST /api/prospects`

Manual person create.

Body:

```json
{
  "name": "Andres Martin",
  "title": "CEO",
  "company": "Mendel",
  "campaignId": "campaign_fintech_latam"
}
```

## Table Browser

### `GET /api/tables`

Returns inspectable SQLite tables and row counts.

### `GET /api/tables/:name`

Returns columns and up to 50 rows by default.

This endpoint is internal debugging UI. It should not become a general SQL API.

## Next API Work

The next endpoints to add are:

```text
GET  /api/runs/:id/events/stream
POST /api/prospecting/plan
POST /api/prospecting/plans/:id/feedback
POST /api/prospecting/plans/:id/execute
GET  /api/prospecting/queries/:id/report
```

Worker integration for `find_companies` is operational. The remaining API work is
the realtime SSE stream, clearer run retry/timeout controls, and strategist plan
execution with budget-aware cost ledger writes.

`POST /api/prospecting/plan` is the first strategist endpoint. It asks OpenClaw
for a strategy JSON plus Markdown, then the backend persists the plan and writes
the Markdown strategy file under `.data/prospecting-strategies/`.

`POST /api/prospecting/plans/:id/feedback` sends operator feedback back to
OpenClaw. OpenClaw returns a revised JSON/Markdown plan; the backend updates
SQLite and rewrites the Markdown file. The revised plan is what future strategy
execution should use.
