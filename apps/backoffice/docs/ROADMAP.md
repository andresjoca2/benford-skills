# Roadmap

## Done / In Progress

### Phase 1 - SQLite Foundation

Implemented locally:

- `db/migrations/0001_core.sql`
- `db/seeds/dev.sql`
- `src/server/migrate.ts`
- `BENFORD_BACKOFFICE_DB_PATH`
- legacy prototype table preservation
- SQLite table browser support

### Phase 2 - Backend-Backed Screens

Implemented locally:

- campaign list endpoint
- campaign detail endpoint
- campaign brief update endpoint
- company candidates endpoint
- campaign people endpoint
- events endpoint
- companies/prospects compatibility endpoints
- table browser screen

## Next

### Phase 3 - Runs And Review Actions

Implemented locally:

- run creation endpoint
- company/person review endpoints
- run cancellation endpoint
- feedback writes
- `do_not_contact` suppression writes
- `needs_more_research` research job enqueue

Rules:

- only one active run per campaign
- review writes candidate status and feedback
- review UI should collect "why accepted/rejected" next to the accept/reject buttons
- review feedback must be injected into the next run memory
- `do_not_contact` also writes suppression
- `needs_more_research` can enqueue a future research job

### Phase 4 - OpenClaw Worker

Implemented locally:

- worker process
- queued job claim loop
- CLI OpenClaw adapter
- job timeout handling
- output validation
- persistence of proposed companies
- event writes for each step
- SSH transport to `openclaw` host
- `prospecting-agent` execution
- versioned `find-companies` skill source
- review feedback memory for the next `find_companies` run
- stronger `find_companies` prompt for 10 new non-duplicate companies
- OpenClaw request/response event writes

Remaining:

- run backend and worker against the real OpenClaw/Hostinger SQLite path
- verify the remote loop: search 10 companies, review with feedback, search 10 more
- deploy worker as a long-running service on the OpenClaw host
- persist `find_people` outputs later, after the companies loop works

### Phase 4.5 - Discovery Quality Controls

Implemented locally:

- campaign-level minimum score threshold, initially defaulting to 75
- UI filtering by score without deleting lower-score candidates from SQLite
- frontend-only automatic search modal with compute, company, people, and score limits

Add:

- source escalation policy: primary/public sources first, paid or bulk sources only when needed
- feedback-aware reruns that learn from accepted/rejected companies

### Phase 5 - Mission Panel Realtime

Add:

```text
GET /api/runs/:id/events/stream
```

Use Server-Sent Events.

### Phase 6 - OpenClaw Deployment

On OpenClaw host:

- pull latest `main`
- install dependencies
- run backoffice manually once
- create `benford-backoffice.service`
- create `benford-backoffice-worker.service`
- back up SQLite regularly

### Phase 7 - Draft Outreach

Add draft generation only:

- `draft_outreach` jobs
- `outreach_drafts` UI
- human approval

No automatic sending in V1.

### Phase 8 - Runs Overnight

Add:

- automatic search backend: persist per-campaign limits from the UI modal
- scheduled or continuous run creation while respecting budget, company, people, and minimum-score limits
- daily discovery limits
- global kill switch
- pause/resume campaign
- retry/idempotency support

Automatic search behavior:

- discovery only; no automatic outreach
- runs until any configured limit is hit or the operator pauses it
- lower-score candidates stay in SQLite but are hidden by default in review UI
- feedback from accepted/rejected candidates informs subsequent runs

## Current Discipline

Keep the product centered on:

```text
find companies/businesses -> review -> feedback -> next run -> find people
```

People search and outreach build on top of approved companies or person-owned businesses. Do not expand into a full CRM before the discovery/review loop works.
