# INTERVIEW_PLAYBOOK.md

## Purpose
Guide how to extract useful operational knowledge from auditors and other experts for the `Auditoría del IMSS` knowledge system.

## Main principle
Interview for the **test**, not for an abstract methodology.
The goal is to understand how a person executes a specific test, what documents they use, what decisions they make, how they transform data, and where their version differs from others.

## Deliverables-aware principle
Every interview should try to understand how a test contributes to the two final deliverables:
- the Excel/template uploaded to the government IMSS portal
- the final PDF delivered to the client

Also identify whether the test feeds:
- another test
- an intermediate worksheet or dataset
- a support-only internal artifact

## Interview objective
Do not stop at high-level descriptions.
Push toward concrete operational detail that can later become:
- `Fuentes y Variantes`
- `Preguntas Abiertas`
- `SOPs por Auditor`
- eventually an `SOP Oficial`
- and traceability toward final deliverables

## What to extract
- what the test is trying to validate
- what documents are needed
- what raw data enters the process
- what cleaning or transformation is required
- what order the work happens in
- what the auditor checks first
- what signals tell them something is wrong
- what exceptions appear
- what output the test produces
- whether that output feeds the PDF final
- whether that output feeds the Excel/template final
- whether that output feeds another test
- what parts require judgment
- what seems standard versus personal preference
- what differs from other auditors

## Document-focused extraction
For every relevant test, identify:
- which documents are used
- which are required versus optional
- which are fallback documents
- which document acts as final support
- which document is raw source versus derived artifact

## Deliverable-focused extraction
For every relevant test, ask:
- does this test affect the government Excel/template?
- if yes, which sheet, section, or field does it affect?
- does this test affect the final PDF for the client?
- if yes, how: hallazgo, conclusión, soporte, observación, or another form?
- does this test produce an intermediate result used by another test?

## Useful question patterns
- What is this test actually trying to validate?
- What documents do you need before you can start?
- Which document do you trust most here?
- What raw data enters first?
- What cleaning or transformation do you do before the real test begins?
- What do you look at first?
- What tells you the test is going well?
- What usually causes mismatch or failure?
- What do you do when numbers do not tie?
- What output comes out of this test?
- Does that output go to the Excel/template, the PDF, another test, or only internal support?
- If another auditor did this same test, where might they do it differently?
- Which parts are your preference and which are truly required?

## Output rule after an interview
After extracting information, convert it into:
- session notes in `Sesiones`
- source notes inside the relevant test
- document links for the relevant test
- variant notes if the approach differs from others
- open questions if something remains unclear
- auditor-specific SOP content only if the flow is coherent enough
- traceability notes toward final deliverables

## Important caution
Do not collapse a person's explanation into the official truth too quickly.
First capture:
- what they do
- what documents they use
- what data transformations they perform
- how their output is used
- how it differs
- what still needs validation
