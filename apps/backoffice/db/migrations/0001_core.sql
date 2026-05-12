CREATE TABLE campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  owner_name TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE campaign_briefs (
  campaign_id TEXT PRIMARY KEY,
  objective TEXT NOT NULL DEFAULT '',
  industry TEXT NOT NULL DEFAULT '',
  niche TEXT NOT NULL DEFAULT '',
  country_region TEXT NOT NULL DEFAULT '',
  company_size TEXT NOT NULL DEFAULT '',
  positive_signals TEXT NOT NULL DEFAULT '',
  negative_signals TEXT NOT NULL DEFAULT '',
  search_mode TEXT NOT NULL DEFAULT 'companies' CHECK (search_mode IN ('companies', 'people', 'companies_then_people')),
  run_budget_cents INTEGER NOT NULL DEFAULT 0 CHECK (run_budget_cents >= 0),
  max_companies INTEGER NOT NULL DEFAULT 10 CHECK (max_companies >= 0),
  max_people INTEGER NOT NULL DEFAULT 0 CHECK (max_people >= 0),
  max_runtime_seconds INTEGER NOT NULL DEFAULT 900 CHECK (max_runtime_seconds >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

CREATE TABLE agent_runs (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  mission TEXT NOT NULL DEFAULT 'find_companies',
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'needs_review', 'completed', 'failed', 'cancelled')),
  objective TEXT NOT NULL DEFAULT '',
  context_json TEXT NOT NULL DEFAULT '{}',
  limits_json TEXT NOT NULL DEFAULT '{}',
  raw_output_json TEXT NOT NULL DEFAULT '{}',
  error TEXT NOT NULL DEFAULT '',
  started_at TEXT,
  finished_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

CREATE TABLE openclaw_jobs (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  skill TEXT NOT NULL CHECK (skill IN ('find_companies', 'find_people', 'research_company', 'research_person', 'score_company', 'score_person', 'draft_outreach')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
  input_json TEXT NOT NULL DEFAULT '{}',
  output_json TEXT NOT NULL DEFAULT '{}',
  error TEXT NOT NULL DEFAULT '',
  attempt INTEGER NOT NULL DEFAULT 0 CHECK (attempt >= 0),
  max_attempts INTEGER NOT NULL DEFAULT 1 CHECK (max_attempts >= 1),
  timeout_seconds INTEGER NOT NULL DEFAULT 900 CHECK (timeout_seconds >= 0),
  started_at TEXT,
  finished_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (run_id) REFERENCES agent_runs(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

CREATE TABLE agent_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id TEXT,
  run_id TEXT,
  job_id TEXT,
  subject_type TEXT NOT NULL DEFAULT '',
  subject_id TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('debug', 'info', 'success', 'warning', 'error')),
  event_type TEXT NOT NULL,
  message TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL,
  FOREIGN KEY (run_id) REFERENCES agent_runs(id) ON DELETE SET NULL,
  FOREIGN KEY (job_id) REFERENCES openclaw_jobs(id) ON DELETE SET NULL
);

CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT '',
  linkedin_url TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  industry TEXT NOT NULL DEFAULT '',
  employee_range TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  source_json TEXT NOT NULL DEFAULT '{}',
  first_seen_run_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (first_seen_run_id) REFERENCES agent_runs(id) ON DELETE SET NULL
);

CREATE TABLE company_candidates (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  run_id TEXT,
  company_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'approved', 'rejected', 'maybe', 'needs_more_research', 'do_not_contact')),
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  rationale TEXT NOT NULL DEFAULT '',
  evidence_json TEXT NOT NULL DEFAULT '[]',
  user_feedback TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (run_id) REFERENCES agent_runs(id) ON DELETE SET NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE people (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  company_id TEXT,
  company_name TEXT NOT NULL DEFAULT '',
  linkedin_url TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  seniority TEXT NOT NULL DEFAULT '',
  function TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  source_json TEXT NOT NULL DEFAULT '{}',
  first_seen_run_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  FOREIGN KEY (first_seen_run_id) REFERENCES agent_runs(id) ON DELETE SET NULL
);

CREATE TABLE person_candidates (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  run_id TEXT,
  person_id TEXT NOT NULL,
  company_id TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'approved', 'rejected', 'maybe', 'needs_more_research', 'do_not_contact')),
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  rationale TEXT NOT NULL DEFAULT '',
  evidence_json TEXT NOT NULL DEFAULT '[]',
  user_feedback TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (run_id) REFERENCES agent_runs(id) ON DELETE SET NULL,
  FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

CREATE TABLE feedback (
  id TEXT PRIMARY KEY,
  campaign_id TEXT,
  run_id TEXT,
  subject_type TEXT NOT NULL CHECK (subject_type IN ('campaign', 'company_candidate', 'person_candidate')),
  subject_id TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('approved', 'rejected', 'maybe', 'needs_more_research', 'do_not_contact', 'comment')),
  sentiment TEXT NOT NULL DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  text TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL,
  FOREIGN KEY (run_id) REFERENCES agent_runs(id) ON DELETE SET NULL
);

CREATE TABLE suppression_list (
  id TEXT PRIMARY KEY,
  scope TEXT NOT NULL CHECK (scope IN ('company', 'domain', 'linkedin_url', 'email', 'person')),
  value TEXT NOT NULL,
  normalized_value TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE outreach_drafts (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  run_id TEXT,
  company_id TEXT,
  person_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'queued', 'sent', 'failed', 'cancelled')),
  channel TEXT NOT NULL DEFAULT 'email',
  subject TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL DEFAULT '',
  approved_by TEXT NOT NULL DEFAULT '',
  approved_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (run_id) REFERENCES agent_runs(id) ON DELETE SET NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX companies_domain_unique
  ON companies(domain)
  WHERE domain <> '';

CREATE UNIQUE INDEX companies_linkedin_unique
  ON companies(linkedin_url)
  WHERE linkedin_url <> '';

CREATE UNIQUE INDEX companies_name_country_unique
  ON companies(normalized_name, country)
  WHERE normalized_name <> '' AND country <> '';

CREATE UNIQUE INDEX people_email_unique
  ON people(email)
  WHERE email <> '';

CREATE UNIQUE INDEX people_linkedin_unique
  ON people(linkedin_url)
  WHERE linkedin_url <> '';

CREATE UNIQUE INDEX people_name_company_unique
  ON people(normalized_name, company_id)
  WHERE normalized_name <> '' AND company_id IS NOT NULL;

CREATE UNIQUE INDEX people_name_company_country_unique
  ON people(normalized_name, company_name, country)
  WHERE normalized_name <> '' AND company_name <> '' AND country <> '';

CREATE UNIQUE INDEX company_candidates_campaign_company_unique
  ON company_candidates(campaign_id, company_id);

CREATE UNIQUE INDEX person_candidates_campaign_person_unique
  ON person_candidates(campaign_id, person_id);

CREATE UNIQUE INDEX suppression_scope_value_unique
  ON suppression_list(scope, normalized_value);

CREATE INDEX agent_runs_campaign_idx ON agent_runs(campaign_id, created_at);
CREATE INDEX openclaw_jobs_run_idx ON openclaw_jobs(run_id, created_at);
CREATE INDEX agent_events_run_idx ON agent_events(run_id, created_at);
CREATE INDEX company_candidates_campaign_idx ON company_candidates(campaign_id, status, score);
CREATE INDEX person_candidates_campaign_idx ON person_candidates(campaign_id, status, score);
