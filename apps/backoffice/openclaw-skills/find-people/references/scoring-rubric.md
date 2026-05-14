# Find People Scoring Rubric

Score each person from 0 to 100. A score should reflect outreach actionability for this campaign, not generic prestige.

## Base Model

- 30 pts: role/function fit.
- 20 pts: company and current-employment confidence.
- 15 pts: geography/scope fit.
- 15 pts: evidence quality.
- 10 pts: contactability.
- 10 pts: campaign-specific angle quality.

## Role Fit: 0-30

- 27-30: direct owner of the campaign-relevant motion.
- 22-26: strong adjacent owner who can route or influence.
- 15-21: plausible stakeholder but not the main owner.
- 8-14: senior person with unclear functional ownership.
- 0-7: role conflicts with the campaign or negative signals.

## Company Confidence: 0-20

- 18-20: current target-company role confirmed by strong source.
- 14-17: credible profile/source, current role likely.
- 8-13: company association exists but recency/current role is unclear.
- 0-7: wrong company, former employee, vendor, investor, journalist, or unclear identity.

## Geography / Scope Fit: 0-15

- 13-15: explicit Mexico/LATAM ownership when geography matters.
- 9-12: regional scope likely or country matches target.
- 5-8: global role can route but local ownership is missing.
- 0-4: geography conflicts with brief or feedback.

If geography does not matter, assign based on business-unit scope instead.

## Evidence Quality: 0-15

- 13-15: direct profile or official/company source plus useful note.
- 9-12: credible secondary source with company and role.
- 5-8: enrichment/source confirms contact but weak role evidence.
- 0-4: generic, stale, indirect, or no URL.

## Contactability: 0-10

- 9-10: sourced email/phone plus profile.
- 6-8: sourced email or strong LinkedIn/profile path.
- 3-5: direct profile only.
- 0-2: no practical contact path.

## Angle Quality: 0-10

- 9-10: angle clearly ties this person's role to the campaign and company.
- 6-8: angle is relevant but broad.
- 3-5: generic referral or discovery angle.
- 0-2: angle could apply to anyone or conflicts with role.

## Adjustments

Add:

- +5 for accepted role pattern from memory.
- +5 for exact `peopleContext` match.
- +3 for credible buying-committee mix when returning multiple people.
- +3 for high-confidence provider contact data with role fit.

Subtract:

- -10 to -25 for large-company CEO/global C-level without functional ownership.
- -10 for wrong or weak geography when geography matters.
- -10 for stale evidence with no current confirmation.
- -10 for duplicate or already-seen person unless materially enriched.
- -15 for no evidence URL.
- -20 for wrong-company or unclear-company match.

## Caps

- Cap at 95 unless there is strong evidence, role fit, and contact path.
- Cap at 88 when there is no email/phone and only a profile URL.
- Cap at 78 for large-company executives without local/functional ownership.
- Cap at 70 when current employment is uncertain.
- Cap at 60 when evidence is only a weak snippet or indirect source.

## Score Bands

- 90-100: review immediately, highly actionable.
- 80-89: strong candidate, likely worth outreach or enrichment.
- 70-79: plausible but needs operator judgment.
- 50-69: weak fit or weak evidence; include only if market is thin.
- 0-49: omit unless explicitly requested as a low-confidence fallback.
