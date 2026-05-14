ALTER TABLE prospecting_plans
  ADD COLUMN strategy_markdown TEXT NOT NULL DEFAULT '';

ALTER TABLE prospecting_plans
  ADD COLUMN markdown_path TEXT NOT NULL DEFAULT '';

ALTER TABLE prospecting_plans
  ADD COLUMN revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1);

ALTER TABLE prospecting_plans
  ADD COLUMN feedback_json TEXT NOT NULL DEFAULT '[]';

CREATE INDEX prospecting_plans_run_created_idx
  ON prospecting_plans(run_id, created_at);
