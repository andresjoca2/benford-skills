ALTER TABLE campaign_briefs
  ADD COLUMN min_score_threshold INTEGER NOT NULL DEFAULT 75 CHECK (min_score_threshold >= 0 AND min_score_threshold <= 100);
