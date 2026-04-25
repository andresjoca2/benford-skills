# OPERATING_RULES.md

## Core rules
1. The test is the main unit of documentation.
2. Everything in the IMSS Obsidian should be in Spanish.
3. Important Obsidian changes require approval first.
4. Differences between auditors or sources live inside the relevant test.
5. Sessions are time-based records and must later be distilled into structured knowledge.
6. Documents must be organized as a library by document type.
7. If a document-test relationship changes, update the document-test table.
8. Archive outdated structures instead of leaving them mixed into active folders.
9. Every test should be documented in relation to the real final-deliverable flow.
10. For contextual loading before a new interview or SOP lift, the methodology is the primary context unit.
11. The agent must identify the correct methodology before treating an auditor explanation as standalone process truth.

## Final deliverables rule
The IMSS audit should be modeled through its real flow:
- the **Plantilla fuente de Información Patronal** is the main source deliverable the agent must help leave ready
- `.txt` files are then generated manually via macros
- those `.txt` files are uploaded manually into **SIDEIMSS**
- the portal then produces a downloadable expediente with additional outputs

Important downstream output layers include:
- expediente final descargable del portal
- atestiguamientos
- aviso y acuses del dictamen
- opinión final

For every test, capture when possible:
- whether it feeds the plantilla fuente
- whether it later affects expediente outputs
- whether it feeds another test
- what transformations are required from raw data to usable output
- what intermediate outputs are produced

## Structure rules

### Obsidian root
The active structure is:
- `00 - Inicio`
- `01 - Pruebas IMSS`
- `02 - Documentos y Ejemplos`
- `03 - Sesiones`
- `04 - Sistema del Agente`
- `05 - Entregables Finales`
- `90 - Archivado`

### Inicio
`Inicio` is also the overview layer.
Do not create a separate `Overview` root folder.

### Pruebas IMSS
In the current phase, each test should be documented primarily through the auditor-specific SOP and its supporting folder structure.

The working structure for each test in this phase should be centered on the auditor folder, its `documentos/` folder, its `resultado/` folder, and the auditor SOP.

When the project matures, each test may also capture traceability to:
- plantilla fuente
- expediente outputs
- other tests
- raw data transformations

### Fuentes y Variantes / SOP Oficial
In the current phase, sources, variants, uncertainties and operating notes should be absorbed into the auditor SOP when useful.
Do not force premature standardization or extra note proliferation.

### Document library
Every document type should live as:
- its own folder
- one main `.md` note
- one `Documentos ejemplo/` folder

### Document-test table
Maintain:
- `02 - Documentos y Ejemplos/Tabla de documentos en pruebas.md`
If a document starts being used in a new test, stops being used, or gets merged/renamed, update the table.

## Classification rules

### When new information appears
Classify it as one of the following:
- navigation / overview
- test-specific knowledge
- document library item
- session record
- agent system rule
- final-deliverable layer
- archived / outdated material

### When two sources differ
Do not resolve immediately unless explicitly instructed.
Capture both under the test and document the difference.

### When something is still unclear
Store it in `Preguntas Abiertas` rather than guessing.

### When a session contains useful knowledge
The session stays in `Sesiones`, but the useful content must later move into:
- the relevant test
- the relevant document note
- the relevant deliverable note
- or the agent system docs

## Editing rule
Before making meaningful Obsidian changes:
- summarize what will change
- explain why briefly
- wait for approval

## Methodology context rule
Before starting a new procedure conversation, the agent must:
- identify the methodology folder that governs the procedure,
- check whether prior SOPs or related procedure notes already exist inside that methodology,
- and only then interpret the current auditor as a variant, confirmer, or extender of that methodology.

If the methodology is unclear, the agent should clarify it instead of proceeding as if the procedure were isolated.

## Pre-reading rule
The minimum mandatory pre-reading before a new IMSS procedure lift is:
- `IMSS_DICTAMEN_CONTEXT.md`
- `IMSS_DICTAMEN_SHEETS_AND_VARIABLES.md`
- `METHODOLOGY_CONTEXT_RULES.md`

If methodology-specific context already exists, the agent should additionally read:
- methodology context note,
- methodology inventory of documents/tables,
- methodology transformation/reuse map,
- and any related SOPs or procedure notes available.

This additional methodology context should improve quality, but its absence must not block progress.


## Documentary evidence rule
A procedure should not rely only on what the auditor says when key documents are part of the process.

When the auditor mentions a key document, Excel, paper of work, support file or output, the agent should try to:
- request the real document,
- analyze it,
- compare it against the auditor explanation,
- and use that evidence to strengthen the SOP, origin-of-data reasoning and methodological updates.

If the key documents were mentioned but not provided, that gap should remain explicit.


## Deliverable-link rule
For each procedure or test, the agent should try to clarify whether it:
- connects directly to a final IMSS deliverable,
- feeds another intermediate procedure first,
- or remains unclear and must stay pending.
