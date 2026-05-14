# Find People Source Policy

The backoffice needs reviewable candidates, not guesses. Every person must have evidence that helps an operator decide.

## Source Tiers

### Tier 1: Strong

- Direct LinkedIn public profile for the person.
- Target company team, leadership, author, press, partner, or staff page.
- Company press release naming the person and role.
- Public conference, webinar, podcast, or professional profile tied to the company and role.
- Hunter/Apollo result with current company, title, and contact data.

### Tier 2: Acceptable

- Credible news article naming the person, company, and role.
- Association, marketplace, professional directory, speaker page, or event page.
- TheOrg, RocketReach, Clay-enriched, Apollo public, or similar profile page when it includes company and title.

### Tier 3: Weak

- Search result snippets without a direct person page.
- Generic company pages that do not name the person.
- Old articles where current employment is unclear.
- Social posts that mention the person but not current role.
- A role title with no real person name.

Tier 3 sources should not be the only evidence for a returned candidate unless the company is very small and no better evidence exists. If used, lower the score and explain the uncertainty in `rationale`.

## Evidence Requirements

Each evidence object must include:

- `type`: source category from the output contract.
- `url`: direct URL.
- `note`: Spanish note explaining what the source proves.

Good notes:

- "Perfil publico indica Head of Partnerships Mexico en la empresa."
- "Pagina de equipo confirma que es socio director de la firma."
- "Hunter encontro email asociado al dominio y cargo de marketing."

Bad notes:

- "LinkedIn."
- "Fuente."
- "Dice que trabaja ahi."
- "Probablemente es el contacto."

## Contact Data Rules

Emails, phones, and LinkedIn URLs must be sourced. Never infer:

- `first.last@domain.com`
- phone numbers from area codes,
- LinkedIn slugs from names,
- city/country from nationality,
- current role from old articles without date/context.

If a field is unknown, return an empty string.

## Company Match Rules

Return a person only when they appear to belong to the target company or a clearly equivalent legal/brand entity.

Reject or omit:

- former employees when current employment is unclear,
- people at competitors,
- agencies/vendors serving the company,
- journalists or investors covering the company,
- generic company contact emails without a named person,
- corporate group executives when the target is a regional subsidiary and no regional ownership is shown.

If the company has multiple brands/domains, mention the relationship in evidence or rationale.

## Recency

Prefer current sources. For dated sources:

- within 24 months: acceptable if role still plausible,
- older than 24 months: use only with a stronger current source,
- old source plus no current confirmation: lower score or omit.

## Privacy And Compliance

Use only public or provided provider data. Do not expose private guesses. Do not fabricate or enrich personal data outside available tools.
