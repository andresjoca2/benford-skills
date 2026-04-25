# KNOWLEDGE_MODEL.md

## Purpose
Define the main knowledge objects in the `Auditoría del IMSS` system and how they relate to each other.

## Main objects

### 1. Test / Prueba
The primary unit of organization.
A test represents a specific IMSS audit check or verification task.

Each test can contain:
- summary
- sources and variants
- official SOP
- open questions
- optional auditor-specific SOPs
- traceability to final deliverables

### 2. Source
Any origin of information about a test.
Examples:
- interview with an auditor
- transcript
- methodology document
- workbook
- sample file
- internal note from V1

A source is an input, not automatically the truth.

### 3. Variant
A different way a source says a test is executed.
Variants are captured inside the relevant test.

### 4. Official SOP
The standardized operational version of a test.
It should be clear, explicit, and understandable to a junior reader.
It may remain empty until the test is mature enough.

### 5. Auditor-specific SOP
A source-specific or auditor-specific version of a SOP.
Useful when a real execution pattern exists but the official SOP is not yet consolidated.

### 6. Document type
A reusable category of document used across one or more tests.
Each document type should live in the document library as:
- one folder
- one main `.md`
- one `Documentos ejemplo/` folder

### 7. Document-test relationship
A documented relationship between a document and the tests where it is used.
This relationship must be reflected in:
- `Tabla de documentos en pruebas.md`

### 8. Session
A chronological record of work, discovery, or discussion.
Sessions are not the final knowledge object; they are a staging layer that later feeds tests, documents, deliverables, or system rules.

### 9. Plantilla fuente de Información Patronal
The main source deliverable the agent must help prepare.
It is the canonical structured input before `.txt` generation via macros and before manual upload into SIDEIMSS.

### 10. Expediente final descargable
The package of files downloaded or produced after processing in SIDEIMSS.
It may include:
- información patronal descargada
- atestiguamientos
- aviso de dictamen patronal
- acuses
- opinión
- technical PDFs or partial outputs

### 11. Traceability relationship
A documented relationship showing how a test connects to:
- raw data
- transformations
- intermediate outputs
- other tests
- the plantilla fuente
- downstream expediente outputs

### 12. Open Question
Any unresolved uncertainty.
Open questions should stay explicit.

### 13. Agent system rule
A rule that defines how the agent should operate within this project.
These live in `Sistema del Agente`.

## Relationships
- A **test** has many **sources**.
- A **test** can have multiple **variants**.
- A **test** may eventually produce one **official SOP**.
- A **test** may also include multiple **auditor-specific SOPs**.
- A **test** uses one or more **document types**.
- **Document-test relationships** must be tracked in the table.
- **Sessions** feed tests, documents, deliverables, and system rules.
- **Tests** should be mapped to the plantilla fuente and downstream expediente outputs when possible.
- **Open questions** prevent false certainty.

## Modeling rules
- Do not organize the system around full methodologies by person.
- Organize around tests.
- Capture source-specific differences inside the relevant test.
- Treat the document library as shared infrastructure across tests.
- Treat sessions as chronological inputs, not final artifacts.
- Treat deliverable mapping as first-class knowledge, not as an afterthought.
- Distinguish clearly between source template and downloaded expediente outputs.

## Practical rule
When new information appears, ask:
1. Is this about one specific test?
2. Is it a document, a source, a variant, a session, a question, a traceability relationship, or a rule?
3. Does it connect to the plantilla fuente, to expediente outputs, to another test, or to an intermediate output?
4. Where does it belong in the active architecture?
5. Does the document-test table need to be updated?
