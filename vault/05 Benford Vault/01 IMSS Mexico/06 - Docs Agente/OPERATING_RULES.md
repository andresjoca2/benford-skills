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
Each test should have at minimum:
- `00 - Resumen de la Prueba.md`
- `01 - SOP Oficial.md`
- `02 - Fuentes y Variantes.md`
- `03 - Preguntas Abiertas.md`

When the project matures, each test should also capture traceability to:
- plantilla fuente
- expediente outputs
- other tests
- raw data transformations

### Fuentes y Variantes
This file should include, at minimum:
- sources consulted
- documents used in the test
- documents by variant when applicable
- similarities
- differences
- current reading
- internal links to documents in Obsidian

### SOP Oficial
The official SOP can remain empty until the test is mature enough.
Do not force premature standardization.

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
