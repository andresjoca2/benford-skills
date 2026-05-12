ALTER TABLE company_candidates
  ADD COLUMN review_visible INTEGER NOT NULL DEFAULT 1 CHECK (review_visible IN (0, 1));

ALTER TABLE company_candidates
  ADD COLUMN review_revealed_at TEXT;

UPDATE company_candidates
SET review_revealed_at = COALESCE(review_revealed_at, created_at)
WHERE review_visible = 1;

CREATE INDEX company_candidates_review_queue_idx
  ON company_candidates(campaign_id, review_visible, status, score, created_at);
