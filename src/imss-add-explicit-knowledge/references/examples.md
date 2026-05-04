# Examples

Este archivo no reemplaza los templates canonicos del vault. Los drafts
tecnicos (`spec_draft.md`, `schema_draft.md`, `raw_schema_draft.md`,
`mapping_draft.md`, `parser_config_draft.md`, `document_transcript_draft.md`)
deben seguir los templates listados en `contract-map.md`.

Usar este archivo solo para `notes.md`, bloqueos y criterios de clasificacion.

## Notes minimo
```md
# Notes

## Identificacion

| Campo | Valor |
|---|---|
| ID | NOTES-CONTRIBUTION-YYYY-MM-DD-slug |
| Tipo | skill_output |
| Estado | draft |
| Fecha creacion | YYYY-MM-DD |
| Ultima actualizacion | YYYY-MM-DD |
| Owner operativo | imss-add-explicit-knowledge |
| Contribution origen | CONTRIBUTION-* |
| Skill origen | imss-add-explicit-knowledge |
| Output tipo | notes |

## Evidencia usada
| Material | Ruta | Uso |
|---|---|---|
| Pendiente | materials/... | Pendiente |

## Clasificacion
Tipo confirmado por usuario: DOC / DVC / DOL.

Razon: Pendiente.

Confirmacion humana: pendiente / confirmada.

Regla: esta skill no procesa `AIM-*` ni `DICT-*`. Si el material parece uno de
esos tipos, detenerse y explicar que queda fuera de alcance.

## Decisiones de criterio
Pendiente.

## Confianza y gaps
| Seccion | Confianza | Gap / riesgo |
|---|---|---|
| Pendiente | alta / media / baja | Pendiente |

## Sugerencias para Proposal Builder
Pendiente.
```

## Bloqueo por falta de evidencia
Si no hay material suficiente, crear solo `notes.md` con:

- materiales encontrados;
- que falta;
- por que no se puede redactar;
- pregunta concreta para desbloquear.

No crear `spec_draft.md` si seria especulativo.

## Clasificacion dudosa DOC vs DVC
Si un documento parece estable pero el layout depende de banco/software/cliente:

- no decidirlo como canon definitivo;
- explicar evidencia a favor de `DOC`;
- explicar evidencia a favor de `DVC`;
- sugerir que Proposal Builder genere PROP con riesgo o mande a humano.
