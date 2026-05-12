# Find Companies Milestone

Status: first milestone operational on the OpenClaw host.

Current loop:

```text
laptop browser -> remote backoffice API -> real SQLite on OpenClaw/Hostinger -> worker -> OpenClaw -> 10 more companies -> review feedback -> next 10
```

Do not work on `find_people` until the company loop is stable and fast enough.

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

This is now the active milestone shape: server and worker both run remote, with
no mounted SQLite over SSH. The local test SQLite database was deleted after the
remote DB became the source of truth.

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
5. If cached companies exist, the API reveals the next 10 immediately without calling OpenClaw.
6. If the cache is empty, the API creates `agent_runs` and a `find_companies` row in `openclaw_jobs`.
7. The worker claims the job, calls OpenClaw in `fast_prefetch` mode, and expects JSON with up to 30 `companies`.
8. The backend validates, dedupes, applies suppression, shows the first 10, and hides the rest in the review queue:
   - `companies`
   - `company_candidates`
   - `agent_events`
9. Review companies in the UI.
10. Before accepting/rejecting, optionally write feedback in `Motivo`.
11. Click accept/reject.
12. Click `Re-ejecutar búsqueda` again.

The frontend sends:

```json
{
  "replaceQueuedRun": true,
  "revealCachedCompanies": true,
  "reviewBatchSize": 10,
  "prefetchCompanies": 20
}
```

This means the second click is instant if there are hidden candidates. Only when
the hidden queue is empty does it enqueue another OpenClaw job.
The UI chooses an interactive prefetch size from the campaign limit and caps it
at 20 so follow-up runs do not spend the full timeout trying to fill oversized
batches.

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

OpenClaw is instructed to use that memory to avoid repeats and bias the next
batch toward accepted patterns. The memory is frozen when the run is created; any
feedback written after that point is used by the next run.

## Known Issue

The milestone works, but load/run latency is still too high. Current suspects:

- large API payloads or expensive frontend rendering on detail screens
- OpenClaw agent context size
- web-search latency
- too much work in one `find_companies` turn

This is the next optimization track. Do not confuse it with the old local SQLite
prototype; the operational DB is remote and already working.

## Quick Checks

The OpenClaw host currently does not require `sqlite3`; use Bun for quick checks.

See queued/running jobs:

```bash
PATH=/root/.bun/bin:$PATH bun -e '
import { Database } from "bun:sqlite";
const db = new Database("apps/backoffice/.data/backoffice.sqlite");
console.log(db.query("SELECT id, skill, status, created_at FROM openclaw_jobs ORDER BY created_at DESC LIMIT 10").all());
'
```

See latest saved companies:

```bash
PATH=/root/.bun/bin:$PATH bun -e '
import { Database } from "bun:sqlite";
const db = new Database("apps/backoffice/.data/backoffice.sqlite");
console.log(db.query("SELECT c.name, c.domain, cc.score, cc.status FROM company_candidates cc JOIN companies c ON c.id = cc.company_id ORDER BY cc.created_at DESC LIMIT 20").all());
'
```

See cached companies waiting to be revealed:

```bash
PATH=/root/.bun/bin:$PATH bun -e '
import { Database } from "bun:sqlite";
const db = new Database("apps/backoffice/.data/backoffice.sqlite");
console.log(db.query("SELECT COUNT(*) AS hidden FROM company_candidates WHERE review_visible = 0").get());
'
```

See latest events:

```bash
PATH=/root/.bun/bin:$PATH bun -e '
import { Database } from "bun:sqlite";
const db = new Database("apps/backoffice/.data/backoffice.sqlite");
console.log(db.query("SELECT event_type, message, created_at FROM agent_events ORDER BY id DESC LIMIT 20").all());
'
```
