# Architecture

## Product

Benford Backoffice is an internal mission panel for agentic prospecting workflows. The team creates campaigns, defines search briefs, runs OpenClaw missions, reviews candidates, gives feedback, and launches improved follow-up runs.

This is not a public SaaS and not a full CRM yet. The first useful product is the loop:

```text
campaign -> run -> candidates -> review -> feedback -> next run
```

The long-term product is an outbound generator centered on people. Company discovery is a staging step: find a qualified company, business, practice, or person-owned business, then find the person and channel that can be contacted.

## Runtime Shape

```text
Browser UI
  -> Bun HTTP server
  -> SQLite
  -> backoffice worker
  -> OpenClaw gateway/CLI
  -> web/browser/tool execution
```

Current local app:

```text
apps/backoffice/dev.ts
apps/backoffice/index.html
apps/backoffice/src/clo/*
apps/backoffice/src/server/*
```

## Source Of Truth

The backoffice owns state.

OpenClaw is an executor. It can research, navigate, reason, and return structured JSON. It does not write directly to SQLite.

The write path is:

```text
OpenClaw output
  -> worker/backend validates
  -> backend dedupes
  -> backend applies suppression rules
  -> backend persists
  -> frontend renders state/events
```

The OpenClaw skill source of truth lives in this repo:

```text
apps/backoffice/openclaw-skills/find-companies/
```

Sync it to the `prospecting-agent` workspace with:

```bash
bun run backoffice:sync-openclaw-skills
```

## Environment Split

```text
GitHub
  schema, migrations, code, docs

Local laptop
  development SQLite
  apps/backoffice/.data/backoffice.sqlite

OpenClaw / Hostinger
  operational SQLite
  /var/lib/benford-backoffice/backoffice.sqlite
```

The DB path is controlled by:

```text
BENFORD_BACKOFFICE_DB_PATH
```

## Existing OpenClaw Host

OpenClaw is reachable on the server through the local gateway:

```text
OPENCLAW_BASE_URL=http://127.0.0.1:18789
```

The local SSH alias is:

```bash
ssh openclaw
```

The OpenClaw control UI is visible through the SSH tunnel at:

```text
http://127.0.0.1:18789/
```

The backoffice should run on a separate port, initially:

```text
http://127.0.0.1:3000/
```

## Server Processes

V1 expected processes:

```text
benford-backoffice.service
  Serves the Mission Panel and API.

benford-backoffice-worker.service
  Claims queued jobs, invokes OpenClaw, validates output, and writes results.
```

The existing `benford-automation.service` is separate and watches the Benford Vault proposal workflow. Do not merge it with this backoffice worker.

## Deliberate Non-Goals

- No OpenAI API key in this app.
- No automatic outreach in V1.
- No unattended automatic discovery until budget, score, pause, and kill-switch controls are implemented.
- No direct OpenClaw writes to SQLite.
- No public multi-tenant auth system.
- No Postgres until SQLite becomes a real bottleneck.
