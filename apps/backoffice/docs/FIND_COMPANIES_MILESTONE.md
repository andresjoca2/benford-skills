# Find Companies Milestone

Goal:

```text
laptop browser -> remote backoffice API -> real SQLite on OpenClaw/Hostinger -> worker -> OpenClaw -> 10 more companies -> review feedback -> next 10
```

Do not work on `find_people` for this milestone.

## Runtime

Run the backoffice server and worker on the OpenClaw/Hostinger machine so both
processes use the same operational SQLite database.

Current remote repo path:

```bash
cd /root/benford/benford-skills
```

Current operational DB path:

```bash
export BENFORD_BACKOFFICE_DB_PATH=apps/backoffice/.data/backoffice.sqlite
```

Start the server on the remote host:

```bash
cd /root/benford/benford-skills
BENFORD_BACKOFFICE_DISABLE_AUTO_WORKER=1 \
BENFORD_BACKOFFICE_DB_PATH=apps/backoffice/.data/backoffice.sqlite \
PORT=3000 \
PATH=/root/.bun/bin:$PATH \
bun run backoffice:dev
```

Start the worker in another remote shell:

```bash
cd /root/benford/benford-skills
OPENCLAW_SSH_TARGET= \
OPENCLAW_COMMAND=/usr/bin/openclaw \
BENFORD_BACKOFFICE_DB_PATH=apps/backoffice/.data/backoffice.sqlite \
OPENCLAW_FIND_COMPANIES_AGENT=research-agent \
PATH=/root/.bun/bin:$PATH \
bun run backoffice:worker
```

If the worker is run locally while invoking OpenClaw over SSH, use:

```bash
BENFORD_BACKOFFICE_DB_PATH=/path/to/local-or-mounted/backoffice.sqlite \
bun run backoffice:worker:openclaw
```

The preferred milestone shape is server and worker both remote, with no mounted
SQLite over SSH.

When syncing the `find-companies` skill from inside the OpenClaw host, copy it
directly instead of using the SSH sync script:

```bash
cd /root/benford/benford-skills
rsync -az apps/backoffice/openclaw-skills/find-companies/ \
  /root/.openclaw/workspace-prospecting-agent/skills/find-companies/
```

## Laptop Access

From the laptop:

```bash
ssh -L 3000:127.0.0.1:3000 openclaw
```

Open:

```text
http://localhost:3000
```

That browser session is local, but the API and SQLite writes are remote.

## Find Companies Loop

1. Open a campaign.
2. Confirm `Modo` is `companies` or `companies_then_people`.
3. Confirm `Máx. empresas` is `10`.
4. Click `Re-ejecutar búsqueda`.
5. The API creates `agent_runs` and a `find_companies` row in `openclaw_jobs`.
6. The worker claims the job, calls OpenClaw, and expects JSON with `companies`.
7. The backend validates, dedupes, applies suppression, and writes:
   - `companies`
   - `company_candidates`
   - `agent_events`
8. Review companies in the UI.
9. Before accepting/rejecting, write feedback in `Feedback para la siguiente búsqueda`.
10. Click accept/reject.
11. Click `Re-ejecutar búsqueda` again.

The next job input includes:

```json
{
  "memory": {
    "alreadySeenCompanies": [],
    "alreadySeenDomains": [],
    "alreadySeenLinkedinUrls": [],
    "approvedCompanies": [],
    "rejectedCompanies": [],
    "suppression": [],
    "feedback": []
  }
}
```

OpenClaw is instructed to use that memory to avoid repeats and bias the next 10
toward accepted patterns.

## Quick Checks

See queued/running jobs:

```bash
sqlite3 /var/lib/benford-backoffice/backoffice.sqlite \
  "SELECT id, skill, status, created_at FROM openclaw_jobs ORDER BY created_at DESC LIMIT 10;"
```

See latest saved companies:

```bash
sqlite3 /var/lib/benford-backoffice/backoffice.sqlite \
  "SELECT c.name, c.domain, cc.score, cc.status FROM company_candidates cc JOIN companies c ON c.id = cc.company_id ORDER BY cc.created_at DESC LIMIT 20;"
```

See latest events:

```bash
sqlite3 /var/lib/benford-backoffice/backoffice.sqlite \
  "SELECT event_type, message, created_at FROM agent_events ORDER BY id DESC LIMIT 20;"
```
