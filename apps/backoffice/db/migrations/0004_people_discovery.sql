ALTER TABLE campaign_briefs
  ADD COLUMN people_context TEXT NOT NULL DEFAULT '';

ALTER TABLE people
  ADD COLUMN phone TEXT NOT NULL DEFAULT '';

ALTER TABLE people
  ADD COLUMN source_provider TEXT NOT NULL DEFAULT '';

ALTER TABLE person_candidates
  ADD COLUMN angle_hint TEXT NOT NULL DEFAULT '';

CREATE INDEX person_candidates_company_review_idx
  ON person_candidates(campaign_id, company_id, status, score, created_at);
