# Roadmap

## Current Status

The first `find_companies` milestone is operational on the OpenClaw host.

Current production-like loop:

```text
laptop browser over SSH tunnel
  -> remote Bun backoffice API
  -> remote SQLite
  -> long-running worker
  -> OpenClaw agent
  -> company candidates
  -> human review + feedback
  -> next run memory
```

Known active issue: initial load and some runs feel slow. A separate performance
pass should focus on API payload size, UI rendering, OpenClaw context size, and
fast/deep discovery modes.

## Done / In Progress

### Phase 1 - SQLite Foundation

Implemented:

- `db/migrations/0001_core.sql`
- `db/seeds/dev.sql`
- `src/server/migrate.ts`
- `BENFORD_BACKOFFICE_DB_PATH`
- legacy prototype table preservation
- SQLite table browser support

### Phase 2 - Backend-Backed Screens

Implemented:

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

Implemented:

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

Implemented:

- worker process
- queued job claim loop
- CLI OpenClaw adapter
- job timeout handling
- output validation
- persistence of proposed companies
- event writes for each step
- SSH transport to `openclaw` host
- `research-agent` execution for current `find_companies` discovery
- versioned `find-companies` skill source
- review feedback memory for the next `find_companies` run
- stronger `find_companies` prompt for 10 new non-duplicate companies
- OpenClaw request/response event writes
- server and worker running against the real OpenClaw SQLite path
- remote loop verified: search companies, review with feedback, search again
- cached review batches: reveal next visible lot before calling OpenClaw again
- idempotent migration for `review_visible` / `review_revealed_at`

Remaining:

- deploy worker as a long-running service on the OpenClaw host
- improve timeout/retry visibility for failed runs
- reduce latency of initial load and agent runs
- persist `find_people` outputs later, after the companies loop works

### Phase 4.5 - Discovery Quality Controls

Implemented:

- campaign-level minimum score threshold, initially defaulting to 75
- UI filtering by score without deleting lower-score candidates from SQLite
- frontend-only automatic search modal with compute, company, people, and score limits

Remaining:

- source escalation policy: primary/public sources first, paid or bulk sources only when needed
- make fast vs deep discovery explicit in campaign/run controls

### Phase 5 - Mission Panel Realtime

Add:

```text
GET /api/runs/:id/events/stream
```

Use Server-Sent Events.

### Phase 6 - OpenClaw Deployment

On OpenClaw host:

- pull the current GitHub branch/commit
- run backoffice manually once against the remote SQLite DB
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
