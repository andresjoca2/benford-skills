PRAGMA foreign_keys = OFF;

CREATE TABLE openclaw_jobs_new (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  skill TEXT NOT NULL CHECK (skill IN ('company_discovery', 'find_companies', 'find_people', 'research_company', 'research_person', 'score_company', 'score_person', 'draft_outreach')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
  input_json TEXT NOT NULL DEFAULT '{}',
  output_json TEXT NOT NULL DEFAULT '{}',
  error TEXT NOT NULL DEFAULT '',
  attempt INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 1,
  timeout_seconds INTEGER NOT NULL DEFAULT 120,
  started_at TEXT,
  finished_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (run_id) REFERENCES agent_runs(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

INSERT INTO openclaw_jobs_new (
  id, run_id, campaign_id, skill, status, input_json, output_json, error, attempt, max_attempts,
  timeout_seconds, started_at, finished_at, created_at, updated_at
)
SELECT
  id, run_id, campaign_id, skill, status, input_json, output_json, error, attempt, max_attempts,
  timeout_seconds, started_at, finished_at, created_at, updated_at
FROM openclaw_jobs;

DROP TABLE openclaw_jobs;
ALTER TABLE openclaw_jobs_new RENAME TO openclaw_jobs;

CREATE INDEX IF NOT EXISTS openclaw_jobs_run_idx ON openclaw_jobs(run_id, created_at);
CREATE INDEX IF NOT EXISTS openclaw_jobs_status_idx ON openclaw_jobs(status, created_at);

PRAGMA foreign_keys = ON;
