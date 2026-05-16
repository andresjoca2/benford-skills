CREATE TABLE IF NOT EXISTS prospecting_steps_new (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  run_id TEXT,
  job_id TEXT,
  step_order INTEGER NOT NULL DEFAULT 0 CHECK (step_order >= 0),
  skill TEXT NOT NULL DEFAULT '',
  source_key TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'waiting_review', 'blocked', 'running', 'succeeded', 'failed', 'skipped', 'cancelled', 'stopped_for_budget')),
  input_json TEXT NOT NULL DEFAULT '{}',
  output_summary_json TEXT NOT NULL DEFAULT '{}',
  quality_score REAL NOT NULL DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 1),
  estimated_cost_cents INTEGER NOT NULL DEFAULT 0 CHECK (estimated_cost_cents >= 0),
  actual_cost_cents INTEGER NOT NULL DEFAULT 0 CHECK (actual_cost_cents >= 0),
  stop_reason TEXT NOT NULL DEFAULT '',
  error TEXT NOT NULL DEFAULT '',
  started_at TEXT,
  finished_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES prospecting_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (run_id) REFERENCES agent_runs(id) ON DELETE SET NULL,
  FOREIGN KEY (job_id) REFERENCES openclaw_jobs(id) ON DELETE SET NULL
);

INSERT INTO prospecting_steps_new (
  id,
  plan_id,
  run_id,
  job_id,
  step_order,
  skill,
  source_key,
  status,
  input_json,
  output_summary_json,
  quality_score,
  estimated_cost_cents,
  actual_cost_cents,
  stop_reason,
  error,
  started_at,
  finished_at,
  created_at,
  updated_at
)
SELECT
  id,
  plan_id,
  run_id,
  job_id,
  step_order,
  skill,
  source_key,
  status,
  input_json,
  output_summary_json,
  quality_score,
  estimated_cost_cents,
  actual_cost_cents,
  stop_reason,
  error,
  started_at,
  finished_at,
  created_at,
  updated_at
FROM prospecting_steps;

DROP TABLE prospecting_steps;
ALTER TABLE prospecting_steps_new RENAME TO prospecting_steps;

CREATE INDEX IF NOT EXISTS prospecting_steps_plan_order_idx ON prospecting_steps(plan_id, step_order);
CREATE INDEX IF NOT EXISTS prospecting_steps_job_idx ON prospecting_steps(job_id);
