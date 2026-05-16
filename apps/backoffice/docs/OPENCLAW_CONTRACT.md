# OpenClaw Contract

This document defines how Benford Backoffice talks to OpenClaw.

## V1 Transport Decision

Use the OpenClaw CLI from the backoffice worker.

The worker runs on the OpenClaw host and invokes:

```bash
openclaw agent \
  --agent <agent-id> \
  --thinking <level> \
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

For the current remote milestone, run the worker on the OpenClaw host with:

```bash
OPENCLAW_COMMAND=/usr/bin/openclaw \
OPENCLAW_COMPANY_DISCOVERY_AGENT=prospecting-agent \
BENFORD_BACKOFFICE_DB_PATH=apps/backoffice/.data/backoffice.sqlite \
bun run backoffice:worker
```

For local development against the remote host over SSH, use:

```bash
bun run backoffice:worker:openclaw
```

When `OPENCLAW_SSH_TARGET` is set, the worker sends the prompt over SSH using
base64 transport to avoid shell quoting bugs. When the worker runs on the
OpenClaw host, leave `OPENCLAW_SSH_TARGET` empty and call `/usr/bin/openclaw`
directly.
Each job is sent with an explicit `--session-id` derived from the run/job id so local tests and previous conversations do not bleed into the next campaign run.

Current routing:

- `prospecting strategy`: `OPENCLAW_STRATEGIST_AGENT`, defaulting to `prospecting-agent`.
- `company_discovery`: `OPENCLAW_COMPANY_DISCOVERY_AGENT`, defaulting to `prospecting-agent`.
- Other skills: `OPENCLAW_AGENT`, defaulting to `prospecting-agent`.
- `company_discovery` thinking defaults to `off` through `OPENCLAW_COMPANY_DISCOVERY_THINKING` to keep interactive prospecting runs fast.

The backoffice no longer assumes a generic `research-agent`. The intended
OpenClaw agent profile is:

```text
apps/backoffice/openclaw-agents/prospecting-agent/
```

That profile contains the soul and tool discipline for this CRM: prospecting
strategy first, source selection, evidence discipline, dedupe, and budget stops.
It syncs onto the existing OpenClaw agent id `prospecting-agent` and workspace
`/root/.openclaw/workspace-prospecting-agent`.

## Skills

The `company_discovery` job should use the versioned OpenClaw skill:

```text
apps/backoffice/openclaw-skills/company-discovery/
```

Strategy planning should use:

```text
apps/backoffice/openclaw-skills/prospecting-strategist/
```

Sync to the OpenClaw workspace:

```bash
bun run backoffice:sync-openclaw-skills
```

Remote target:

```text
/root/.openclaw/workspace-prospecting-agent/skills/company-discovery
/root/.openclaw/workspace-prospecting-agent/skills/prospecting-strategist
/root/.openclaw/workspace-prospecting-agent/SOUL.md
/root/.openclaw/workspace-prospecting-agent/TOOLS.md
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

Exception: strategy planning endpoints intentionally call OpenClaw synchronously
because they are operator-facing plan edits, not long-running provider searches.
They must never execute paid source calls; they only return JSON and Markdown.

## Strategy Output

The strategy endpoint expects JSON matching:

```text
apps/backoffice/openclaw-skills/prospecting-strategist/references/strategy-plan-contract.json
```

Minimum required fields:

- `strategy_markdown`
- `plans`
- `recommended_first_plan_id`
- `budget_guard.run_budget_cents`
- `budget_guard.estimated_total_cents`
- `budget_guard.stop_before_exceeding_budget`

The backend persists `strategy_markdown` to:

```text
apps/backoffice/.data/prospecting-strategies/<campaign-id>/<plan-id>.md
```

Operator feedback from the UI revises the same plan id, increments `revision`,
and rewrites that Markdown file.

## Budget Guard

Known-cost sources are hard-stopped before execution if the stored strategy
estimate exceeds the run budget. Source adapters write `prospecting_cost_ledger`
reserve events before paid source calls when a step has an estimated cost.

Unknown-cost sources should be avoided in unattended mode unless the operator
explicitly approves them for that run.

## Source Adapters

Secrets live in `apps/backoffice/.env.local` and are never embedded in prompts,
skill files, or committed docs.

- Apollo can handle `company_discovery` and `find_people` when a step
  `source_plan` includes `apollo`.
- PDL is enrichment-only after person dedupe/search when `source_plan` includes
  `pdl` or `people_data_labs`.
- Explorium is registered as a configured paid source. Execution stays via
  OpenClaw/MCP until the MCP endpoint is wired into the backend.

## Job Input

`openclaw_jobs.input_json` is the source of truth.

Minimum shape:

```json
{
  "mission": "company_discovery",
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
    "maxCompanies": 20,
    "maxPeople": 0,
    "maxRuntimeSeconds": 120,
    "minScoreThreshold": 75,
    "reviewBatchSize": 10,
    "discoveryMode": "fast_prefetch"
  },
  "memory": {
    "alreadySeenCompanies": [],
    "alreadySeenDomains": [],
    "alreadySeenLinkedinUrls": [],
    "approvedCompanies": [],
    "rejectedCompanies": [],
    "suppression": [],
    "feedback": []
  },
  "outputContract": "Return only JSON matching the requested schema."
}
```

`memory.feedback` includes only non-empty operator text from accept/reject review.
The next run must treat this feedback as product signal, not merely audit text.
Feedback written after a run is created belongs to the next run, because job
input is frozen in `openclaw_jobs.input_json` at creation time.

## Job Output

The worker expects JSON. If OpenClaw returns prose around JSON, the worker should mark the job failed until an explicit parser is implemented.

### `company_discovery`

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

Provider costs are stored in USD cents. Defaults can be overridden in
`apps/backoffice/.env.local`:

```text
BACKOFFICE_APOLLO_ORG_SEARCH_COST_CENTS=1
BACKOFFICE_APOLLO_PEOPLE_SEARCH_COST_CENTS=0
BACKOFFICE_PDL_PERSON_ENRICH_COST_CENTS=28
```

Paid sources are blocked when `runBudgetCents = 0` unless
`BACKOFFICE_PAID_SOURCES_REQUIRE_BUDGET=0`.

## Security

No app-level auth in V1 by explicit product decision.

Operational assumption:

- backoffice is accessed through localhost, SSH tunnel, private network, or controlled server access
- do not expose it publicly without adding auth
