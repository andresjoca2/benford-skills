# Decisions

## Accepted

### SQLite First

Decision: use SQLite for V1.

Reason: single-node internal tool, simpler deploy, easier local development.

Reconsider when:

- multiple writers become a bottleneck
- the backoffice needs multi-host workers
- operational data becomes too important for file-level backup discipline

### Remote SQLite Is Operational Source Of Truth

Decision: after the first `company_discovery` milestone, the operational SQLite DB
lives on the OpenClaw host. The initial laptop/local test DB was deleted.

Reason: the server and worker must share one real database while OpenClaw runs
jobs and writes candidates. Keeping a local test DB around made it too easy to
look at stale data.

Constraint: local development can still create an isolated DB with
`BENFORD_BACKOFFICE_DB_PATH`, but it must not be treated as production state.

### Backoffice Owns State

Decision: OpenClaw does not write directly to SQLite.

Reason: dedupe, suppression, review state, retries, and audit logs need deterministic backend ownership.

### OpenClaw From The Start

Decision: do not build a fake agent layer first.

Reason: the product risk is whether the agentic discovery loop works. Mocks hide the hardest integration.

### CLI Adapter First

Decision: invoke OpenClaw through `openclaw agent --json` from the worker before implementing direct Gateway RPC.

Reason: the CLI is already installed and talks to the gateway. A driver interface lets us replace transport later.

### Skills Versioned In This Repo

Decision: keep OpenClaw prospecting skills under `apps/backoffice/openclaw-skills/` and sync them to the OpenClaw workspace.

Reason: campaign discovery behavior, output schemas, source policy, and scoring rules must be reviewed and versioned with the backoffice contract.

### Prospecting Agent For Company Discovery

Decision: current `company_discovery` and strategy runs use `prospecting-agent` through
`OPENCLAW_COMPANY_DISCOVERY_AGENT`.

Reason: OpenClaw already has a registered `prospecting-agent` with workspace
`/root/.openclaw/workspace-prospecting-agent`. The backoffice now syncs the CRM
prospecting soul/tools and skills into that workspace instead of inventing a
second agent id.

Reconsider when:

- a lighter dedicated `company-discovery-fast` path exists
- OpenClaw context size becomes the dominant latency bottleneck

### Person-Centered Outbound

Decision: company discovery can return companies, businesses, practices, or person-owned businesses, but the product remains centered on eventually finding people to contact.

Reason: outbound sends to people, not abstract accounts. Company-first search is a way to structure discovery and review before finding contacts.

### SSE Later For Realtime

Decision: use Server-Sent Events for Mission Panel streaming.

Reason: the UI needs server-to-client event flow, not bidirectional sockets.

### No Automatic Outreach In V1

Decision: generate drafts only.

Reason: outbound automation has reputational and operational risk. Human approval comes first.

### Automatic Search Requires Hard Limits

Decision: automatic search may be designed for discovery only, but it must require
operator-configured compute budget, company/person limits, minimum score, pause,
and kill-switch controls before it can run unattended.

Reason: discovery can spend compute and accumulate noisy data. The UI can expose
the shape now, but backend execution must wait for persistence, idempotency, and
worker controls.

### No App Auth In V1

Decision: do not add app-level auth yet.

Reason: explicit product decision for the internal/local phase.

Constraint: do not expose the app publicly without revisiting this.

## Deferred

### Versioned Campaign Briefs

Decision: keep current `campaign_briefs` as one live brief per campaign.

Reason: explicit product decision to defer versioning.

Reconsider when:

- run quality needs to be compared by brief changes
- rollback of campaign criteria becomes important
- multiple operators edit the same campaign

### Postgres

Decision: do not add Postgres yet.

Reason: SQLite is enough for V1 and keeps OpenClaw deployment simpler.

### Cost Enforcement

Decision: keep `run_budget_cents` advisory until OpenClaw reports reliable cost metadata.

Reason: budgets cannot be enforced accurately without per-operation cost reporting.

### Direct Gateway RPC

Decision: do not implement WebSocket Gateway RPC first.

Reason: CLI adapter is faster and lower risk. Direct RPC can come later if CLI output is too limiting.

## Rejected For Now

### Agent Writes To Database

Rejected because it bypasses dedupe, suppression, review state, and auditability.

### Full CRM Scope

Rejected because the core loop is not proven yet.

### Automatic Sending

Rejected for V1 because review quality, suppression, and deliverability controls are not mature yet.
