# Find People Search Playbook

Use this playbook to turn a campaign-company pair into targeted people searches.

## Search Order

1. Read all input and memory.
2. Search target company official sources.
3. Search public web for role owners.
4. Search LinkedIn public profile results.
5. Search Spanish role variants for Mexico/LATAM.
6. Use Hunter/Apollo data when available.
7. Use executive fallback only after targeted searches are exhausted.

## Query Pattern

Combine:

- company name
- company domain
- geography
- role cluster
- seniority variant
- source hint

Examples:

```text
"Company Name" Mexico partnerships
"Company Name" alianzas Mexico
"Company Name" "Head of Partnerships"
"Company Name" "desarrollo de negocio"
site:linkedin.com/in "Company Name" "Mexico" "partnerships"
site:linkedin.com/in "Company Name" "alianzas"
site:theorg.com "Company Name" partnerships
site:apollo.io "Company Name" partnerships
```

## Geography Variants

Use these when the brief mentions Mexico or LATAM:

- Mexico, MX, CDMX, Ciudad de Mexico
- LATAM, Latin America, America Latina
- Spanish role titles
- country manager, regional director, head of Mexico, Mexico lead

## Role Clusters

### Partnerships / Channel / Ecosystem

English:

- partnerships
- strategic partnerships
- alliances
- partner success
- business development
- channel
- ecosystem
- marketplace
- seller ecosystem
- merchant success
- growth

Spanish:

- alianzas
- alianzas estrategicas
- desarrollo de negocio
- canal
- ecosistema
- socios
- aliados
- vendedores
- comercios
- crecimiento

### Finance / Accounting / Compliance

English:

- finance
- CFO
- controller
- accounting
- treasury
- financial operations
- compliance
- audit
- tax

Spanish:

- finanzas
- contralor
- contabilidad
- tesoreria
- operaciones financieras
- cumplimiento
- auditoria
- impuestos

### Operations / Customer / Delivery

English:

- operations
- customer operations
- merchant operations
- seller operations
- customer success
- support
- delivery

Spanish:

- operaciones
- exito del cliente
- atencion a clientes
- operaciones comerciales
- operaciones de vendedores
- operaciones de comercios

### Marketing / Growth / Demand

English:

- marketing
- growth
- demand generation
- lifecycle
- product marketing
- channel marketing
- partner marketing

Spanish:

- marketing
- crecimiento
- demanda
- ciclo de vida
- marketing de producto
- marketing de canal

### Product / Technology / Data

English:

- product
- CTO
- engineering
- data
- platform
- integrations
- automation

Spanish:

- producto
- tecnologia
- ingenieria
- datos
- plataforma
- integraciones
- automatizacion

## Source-Specific Tactics

### Official Website

Look for:

- team page
- about page
- leadership page
- press releases
- partner pages
- author pages
- contact pages

Use official-site evidence when it confirms employment or functional ownership.

### LinkedIn Public Results

Use direct public profile URLs when visible. Do not use a LinkedIn search results page as a person's profile. If a snippet is the only evidence, add a second credible source when possible.

### Hunter

If `input.sourceData.hunter.people` exists:

- keep contacts with names and emails,
- rank by role fit before seniority,
- prefer high confidence,
- prefer functional owners over generic admin/contact roles,
- add Hunter evidence and contactability notes.

Do not return a Hunter contact just because an email exists.

### Apollo

Use Apollo only when available. Prefer Apollo when it provides:

- title,
- current company,
- geography,
- direct profile/contact data.

Still validate target-company match when possible.

## Exhaustion Rule

Before returning fewer than `maxPeople` for a broad company, try at least:

- 2 role clusters,
- 2 geography variants if geography matters,
- official company sources,
- public LinkedIn profile queries,
- enrichment data if present.

Return fewer than requested when remaining candidates are weak, duplicate, wrong-company, wrong-geography, unevidenced, or generic.
