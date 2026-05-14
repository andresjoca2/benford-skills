# Find Companies Scoring Rubric

Score each company from 0 to 100. A score should reflect review actionability for this campaign, not generic company prestige.

## Base Model

- 30 pts: industry and niche fit.
- 20 pts: geography and size fit.
- 20 pts: positive buying or operational signals.
- 15 pts: evidence quality.
- 10 pts: future person/contact path.
- 5 pts: freshness and specificity.

## Industry / Niche Fit: 0-30

- 27-30: exact campaign category and niche.
- 22-26: strong adjacent fit with clear relevance.
- 15-21: broad industry fit but niche is unclear.
- 8-14: only generic category match.
- 0-7: conflicts with requested industry or negative signals.

## Geography / Size Fit: 0-20

- 18-20: explicit target geography and size/market segment.
- 14-17: target geography clear; size is plausible.
- 8-13: geography or size partly unclear but not conflicting.
- 0-7: wrong geography, wrong segment, or clearly outside size range.

If geography does not matter, assign this based on segment and market fit.

## Positive Signals: 0-20

- 18-20: multiple explicit positive signals from the brief.
- 14-17: one strong positive signal.
- 8-13: plausible signal but needs operator judgment.
- 0-7: no meaningful positive signal beyond category.

Examples of positive signals: B2B positioning, founder/owner visibility, regional growth, visible operations pain, relevant service line, technology adoption, compliance/tax/payroll/IMSS need, partner ecosystem fit, team/contact page.

## Evidence Quality: 0-15

- 13-15: official source, maps profile, or direct public profile proves identity and fit.
- 9-12: credible secondary source proves identity and basic fit.
- 5-8: directory/database evidence only, but specific to the candidate.
- 0-4: generic, stale, indirect, snippet-only, or no direct URL.

## Future Person / Contact Path: 0-10

- 9-10: owner/founder/team/contact path is visible or likely from public source.
- 6-8: company has website, LinkedIn, maps, or contact channel suitable for later people discovery.
- 3-5: only a generic profile exists.
- 0-2: no practical route to a named person or contact.

## Freshness / Specificity: 0-5

- 5: current, specific, and directly tied to the brief.
- 3-4: current enough but not deeply specific.
- 1-2: stale or thin, but still usable.
- 0: no freshness or specificity signal.

## Adjustments

Add:

- +5 for a pattern explicitly accepted in memory.
- +5 for exact positive-signal match from the brief.
- +3 for useful source diversity in a broad batch.
- +3 for a visible future decision maker path.

Subtract:

- -10 to -25 for directory-only evidence.
- -10 for weak or wrong geography when geography matters.
- -10 for unclear entity identity.
- -10 for no future contact path.
- -10 for stale evidence with no current confirmation.
- -15 for duplicate or already-seen company/domain/LinkedIn.
- -20 for a hard negative signal from the brief or feedback.
- -25 for a lead-list vendor, directory, search page, or category page returned as if it were a candidate.

## Caps

- Cap at 95 unless there is strong fit, source quality, and contact path.
- Cap at 90 when there is no official website/domain but strong maps or association evidence exists.
- Cap at 85 when evidence is only a credible directory/profile page.
- Cap at 78 when the candidate is broad/enterprise and the brief targets SMB/mid-market.
- Cap at 70 when geography or current operation is uncertain.
- Cap at 60 when evidence is only snippet-level, stale, or indirect.

## Score Bands

- 90-100: review immediately, highly actionable.
- 80-89: strong candidate, likely worth review.
- 70-79: plausible but needs operator judgment.
- 50-69: weak fit or weak evidence; include only if market is thin.
- 0-49: omit unless explicitly requested as low-confidence fallback.
