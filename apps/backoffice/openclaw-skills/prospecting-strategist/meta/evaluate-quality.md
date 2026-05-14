# Evaluate Quality

Evaluate quality after every step and again after the merged result set.

## Metrics

Use 0-1 scores for:

- `estimated_match_quality`: how well results match the brief.
- `evidence_quality`: whether evidence proves identity, fit, geography, and role.
- `contactability`: whether a future person/contact path exists.
- `coverage`: useful count relative to requested count.
- `budget_efficiency`: useful candidates per cost.
- `overall_quality_score`: weighted summary.

## Default Weights

For company discovery:

- Match quality: 35%.
- Evidence quality: 25%.
- Contactability path: 15%.
- Coverage: 15%.
- Budget efficiency: 10%.

For people discovery:

- Role/person fit: 30%.
- Current company confidence: 20%.
- Contactability: 20%.
- Evidence quality: 15%.
- Geography/scope fit: 10%.
- Budget efficiency: 5%.

## Sufficient Quality

A result set is sufficient when:

- useful count reaches the review batch or requested limit,
- overall quality is at least 0.75 unless the operator set a different threshold,
- evidence quality is not below 0.65,
- suppressed and duplicate rows are removed,
- and the next escalation is unlikely to improve quality enough to justify cost.

## Insufficient Quality

Escalation is justified when:

- overall quality is below 0.75,
- useful count is too low,
- too many rows lack evidence,
- contactability is too low for the mission,
- or the result source is known to underperform for this ICP.

Never call a result set sufficient just because it is large.
