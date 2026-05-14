CREATE TABLE prospecting_queries (
  id TEXT PRIMARY KEY,
  campaign_id TEXT,
  query_original TEXT NOT NULL DEFAULT '',
  query_fingerprint TEXT NOT NULL DEFAULT '',
  icp_signature_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'running', 'succeeded', 'failed', 'cancelled', 'stopped_for_budget')),
  quality_score REAL NOT NULL DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 1),
  total_cost_cents INTEGER NOT NULL DEFAULT 0 CHECK (total_cost_cents >= 0),
  budget_limit_cents INTEGER NOT NULL DEFAULT 0 CHECK (budget_limit_cents >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL
);

CREATE TABLE prospecting_plans (
  id TEXT PRIMARY KEY,
  query_id TEXT NOT NULL,
  run_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'running', 'succeeded', 'failed', 'cancelled', 'stopped_for_budget')),
  plan_json TEXT NOT NULL DEFAULT '{}',
  recommended_first_plan_id TEXT NOT NULL DEFAULT '',
  estimated_cost_cents INTEGER NOT NULL DEFAULT 0 CHECK (estimated_cost_cents >= 0),
  max_cost_cents INTEGER NOT NULL DEFAULT 0 CHECK (max_cost_cents >= 0),
  created_by TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (query_id) REFERENCES prospecting_queries(id) ON DELETE CASCADE,
  FOREIGN KEY (run_id) REFERENCES agent_runs(id) ON DELETE SET NULL
);

CREATE TABLE prospecting_steps (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  run_id TEXT,
  job_id TEXT,
  step_order INTEGER NOT NULL DEFAULT 0 CHECK (step_order >= 0),
  skill TEXT NOT NULL DEFAULT '',
  source_key TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'skipped', 'cancelled', 'stopped_for_budget')),
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

CREATE TABLE source_attempts (
  id TEXT PRIMARY KEY,
  query_id TEXT,
  plan_id TEXT,
  step_id TEXT,
  run_id TEXT,
  job_id TEXT,
  source_key TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'succeeded', 'failed', 'skipped', 'stopped_for_budget')),
  result_count INTEGER NOT NULL DEFAULT 0 CHECK (result_count >= 0),
  useful_count INTEGER NOT NULL DEFAULT 0 CHECK (useful_count >= 0),
  duplicate_count INTEGER NOT NULL DEFAULT 0 CHECK (duplicate_count >= 0),
  suppressed_count INTEGER NOT NULL DEFAULT 0 CHECK (suppressed_count >= 0),
  with_email_count INTEGER NOT NULL DEFAULT 0 CHECK (with_email_count >= 0),
  with_phone_count INTEGER NOT NULL DEFAULT 0 CHECK (with_phone_count >= 0),
  quality_score REAL NOT NULL DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 1),
  cost_cents INTEGER NOT NULL DEFAULT 0 CHECK (cost_cents >= 0),
  latency_ms INTEGER NOT NULL DEFAULT 0 CHECK (latency_ms >= 0),
  error TEXT NOT NULL DEFAULT '',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (query_id) REFERENCES prospecting_queries(id) ON DELETE SET NULL,
  FOREIGN KEY (plan_id) REFERENCES prospecting_plans(id) ON DELETE SET NULL,
  FOREIGN KEY (step_id) REFERENCES prospecting_steps(id) ON DELETE SET NULL,
  FOREIGN KEY (run_id) REFERENCES agent_runs(id) ON DELETE SET NULL,
  FOREIGN KEY (job_id) REFERENCES openclaw_jobs(id) ON DELETE SET NULL
);

CREATE TABLE learned_patterns (
  id TEXT PRIMARY KEY,
  signature_hash TEXT NOT NULL,
  icp_signature_json TEXT NOT NULL DEFAULT '{}',
  preferred_source_order_json TEXT NOT NULL DEFAULT '[]',
  success_rate REAL NOT NULL DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 1),
  sample_size INTEGER NOT NULL DEFAULT 0 CHECK (sample_size >= 0),
  avg_quality_score REAL NOT NULL DEFAULT 0 CHECK (avg_quality_score >= 0 AND avg_quality_score <= 1),
  avg_cost_cents INTEGER NOT NULL DEFAULT 0 CHECK (avg_cost_cents >= 0),
  last_winner_source TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prospecting_cost_ledger (
  id TEXT PRIMARY KEY,
  run_id TEXT,
  job_id TEXT,
  query_id TEXT,
  plan_id TEXT,
  step_id TEXT,
  source_key TEXT NOT NULL DEFAULT '',
  event_type TEXT NOT NULL CHECK (event_type IN ('estimate', 'reserve', 'actual', 'refund', 'budget_stop')),
  amount_cents INTEGER NOT NULL DEFAULT 0 CHECK (amount_cents >= 0),
  budget_limit_cents INTEGER NOT NULL DEFAULT 0 CHECK (budget_limit_cents >= 0),
  cumulative_run_cents INTEGER NOT NULL DEFAULT 0 CHECK (cumulative_run_cents >= 0),
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (run_id) REFERENCES agent_runs(id) ON DELETE SET NULL,
  FOREIGN KEY (job_id) REFERENCES openclaw_jobs(id) ON DELETE SET NULL,
  FOREIGN KEY (query_id) REFERENCES prospecting_queries(id) ON DELETE SET NULL,
  FOREIGN KEY (plan_id) REFERENCES prospecting_plans(id) ON DELETE SET NULL,
  FOREIGN KEY (step_id) REFERENCES prospecting_steps(id) ON DELETE SET NULL
);

CREATE INDEX prospecting_queries_campaign_idx
  ON prospecting_queries(campaign_id, created_at);

CREATE INDEX prospecting_queries_fingerprint_idx
  ON prospecting_queries(query_fingerprint, created_at);

CREATE INDEX prospecting_steps_plan_order_idx
  ON prospecting_steps(plan_id, step_order);

CREATE INDEX source_attempts_source_quality_idx
  ON source_attempts(source_key, quality_score, created_at);

CREATE UNIQUE INDEX learned_patterns_signature_unique
  ON learned_patterns(signature_hash);

CREATE INDEX prospecting_cost_ledger_run_idx
  ON prospecting_cost_ledger(run_id, created_at);
