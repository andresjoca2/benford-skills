# OpenClaw Contract

This document defines how Benford Backoffice talks to OpenClaw.

## V1 Transport Decision

Use the OpenClaw CLI from the backoffice worker.

The worker runs on the OpenClaw host and invokes:

```bash
openclaw agent \
  --agent prospecting-agent \
  --json \
  --timeout <seconds> \
  --message "<mission prompt>"
```

OpenClaw itself talks to the local gateway service on:

```text
http://127.0.0.1:18789
```

Reason:

- avoids implementing WebSocket Gateway RPC directly in the first worker
- uses the installed OpenClaw gateway and session machinery
- lets us swap the driver later behind one adapter

The code should hide this behind:

```ts
runOpenClawJob(job): Promise<OpenClawJobResult>
```

For local development against the remote host, use:

```bash
bun run backoffice:worker:openclaw
```

The worker currently sends the prompt over SSH using base64 transport to avoid shell quoting bugs.

## Skills

The `find_companies` job should use the versioned OpenClaw skill:

```text
apps/backoffice/openclaw-skills/find-companies/
```

Sync to the OpenClaw workspace:

```bash
bun run backoffice:sync-openclaw-skills
```

Remote target:

```text
/root/.openclaw/workspace-prospecting-agent/skills/find-companies
```

## Sync / Async

The backoffice system is async at the job level:

```text
API creates openclaw_jobs row
worker claims queued job
worker invokes OpenClaw
worker writes output/events
frontend polls or streams events
```

The CLI invocation may block inside the worker until timeout or completion, but the user-facing API must not block waiting for OpenClaw.

## Job Input

`openclaw_jobs.input_json` is the source of truth.

Minimum shape:

```json
{
  "mission": "find_companies",
  "campaign": {
    "id": "campaign_fintech_latam",
    "name": "Fintech LATAM - Founders"
  },
  "brief": {
    "objective": "Encontrar founders y empresas fintech con necesidad operativa clara.",
    "industry": "Fintech",
    "niche": "Seed/Series A B2B",
    "countryRegion": "LATAM",
    "companySize": "11-200 empleados",
    "positiveSignals": "Founder visible...",
    "negativeSignals": "Banca tradicional...",
    "searchMode": "companies",
    "maxCompanies": 10,
    "maxPeople": 0,
    "maxRuntimeSeconds": 900
  },
  "memory": {
    "alreadySeenCompanies": [],
    "approvedCompanies": [],
    "rejectedCompanies": [],
    "suppression": [],
    "feedback": []
  },
  "outputContract": "Return only JSON matching the requested schema."
}
```

`memory.feedback` should include the operator's reason for acceptance or rejection when available. The next run must treat this feedback as product signal, not merely audit text.

## Job Output

The worker expects JSON. If OpenClaw returns prose around JSON, the worker should mark the job failed until an explicit parser is implemented.

### `find_companies`

Candidates can be formal companies, local businesses, professional practices, clinics, firms, or person-owned businesses when that is the actual buying unit. Directories should normally be discovery sources, not final candidates.

```json
{
  "companies": [
    {
      "name": "Mendel",
      "domain": "mendel.com",
      "linkedin_url": "https://linkedin.com/company/mendel",
      "country": "MX",
      "city": "Ciudad de Mexico",
      "industry": "Fintech",
      "employee_range": "50-200",
      "description": "Fintech B2B para gestion financiera.",
      "score": 92,
      "rationale": "Calza por industria, B2B y crecimiento regional.",
      "evidence": [
        {
          "type": "website",
          "url": "https://mendel.com",
          "note": "Describe producto financiero B2B."
        }
      ]
    }
  ]
}
```

### `find_people`

```json
{
  "people": [
    {
      "name": "Andres Martin",
      "title": "CEO & Co-founder",
      "company_name": "Mendel",
      "company_domain": "mendel.com",
      "linkedin_url": "https://linkedin.com/in/example",
      "email": "",
      "country": "MX",
      "city": "Ciudad de Mexico",
      "seniority": "Founder",
      "function": "Executive",
      "description": "Founder ejecutivo en fintech B2B.",
      "score": 92,
      "rationale": "Decision maker con alta afinidad.",
      "evidence": [
        {
          "type": "linkedin",
          "url": "https://linkedin.com/in/example",
          "note": "Perfil founder."
        }
      ]
    }
  ]
}
```

## Events

The worker writes `agent_events`. OpenClaw does not write directly.

Minimum events per job:

```text
job.started
openclaw.requested
openclaw.responded
job.completed
```

On error:

```text
job.failed
openclaw.timeout
system.error
```

When persisting results:

```text
company.proposed
company.saved
company.dedupe_skipped
company.suppressed
person.proposed
person.saved
person.dedupe_skipped
person.suppressed
```

## Timeout

Use `openclaw_jobs.timeout_seconds`.

The worker should pass that timeout to CLI:

```bash
openclaw agent --timeout "$timeout_seconds" --json --message "$prompt"
```

If the process exceeds the timeout, mark:

```text
openclaw_jobs.status = failed
openclaw_jobs.error = timeout message
agent_events.event_type = openclaw.timeout
```

## Retries

Retries are not automatic until `idempotency_key` exists.

When added:

- same idempotency key should not re-run OpenClaw if a succeeded output exists
- failed retries increment `attempt`
- max retries come from `max_attempts`

## Cost

Cost tracking is deferred until OpenClaw can reliably return cost metadata.

Future output/event field:

```json
{
  "cost_cents": 12
}
```

Do not enforce `run_budget_cents` as a hard stop until cost reporting exists. Treat it as an advisory budget in V1.

## Security

No app-level auth in V1 by explicit product decision.

Operational assumption:

- backoffice is accessed through localhost, SSH tunnel, private network, or controlled server access
- do not expose it publicly without adding auth
