# Contract Map

## Vault contracts

Leer antes de producir PROPs:

```text
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/00 Sistema/contrato-metadata-minima.md
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/00 Sistema/contrato-artefactos-operativos.md
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/00 Sistema/convenciones-nombrado.md
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/00 Sistema/roles-skills-agentes.md
```

## Allowed output root

Solo con aprobacion explicita del usuario:

```text
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/02 Proposals/01 Draft/PROP-*/proposal.md
```

En Draft, la carpeta de PROP debe contener solo:

```text
PROP-0000/
└── proposal.md
```

## Live proposal templates

Usa estos templates como fuente de forma. No los modifiques.

Los templates son base estructural, no lista cerrada. Si un template vivo no
incluye `Ejemplos raw documents` o `Materiales canonicos a copiar`, el Proposal
Generator debe agregar esas secciones al `proposal.md` cuando apliquen.

### Explicit Knowledge

```text
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/02 Proposals/00 Templates/explicit-knowledge/PROP-AIM-0000_template.md
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/02 Proposals/00 Templates/explicit-knowledge/PROP-DICT-0000_template.md
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/02 Proposals/00 Templates/explicit-knowledge/PROP-DOC-0000_template.md
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/02 Proposals/00 Templates/explicit-knowledge/PROP-DVC-0000_template.md
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/02 Proposals/00 Templates/explicit-knowledge/PROP-DOL-0000_template.md
```

### Task Specific

```text
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/02 Proposals/00 Templates/task-specific/PROP-METH-0000_template.md
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/02 Proposals/00 Templates/task-specific/PROP-TEST-0000_template.md
```

### Experimental Knowledge

```text
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/02 Proposals/00 Templates/experimental-knowledge/PROP-PEOP-0000_template.md
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/02 Proposals/00 Templates/experimental-knowledge/PROP-FIRM-0000_template.md
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/02 Proposals/00 Templates/experimental-knowledge/PROP-FIELD-0000_template.md
```

## Proposal metadata

Toda PROP debe incluir:

```md
## Identificacion

| Campo | Valor |
|---|---|
| ID | PROP-0000 |
| Tipo | PROP-DOC / PROP-DVC / PROP-DOL / PROP-TEST / PROP-METH / PROP-PEOP / PROP-FIRM / PROP-FIELD / PROP-AIM / PROP-DICT |
| Estado | draft |
| Fecha creacion | YYYY-MM-DD |
| Ultima actualizacion | YYYY-MM-DD |
| Owner operativo | Proposal Builder |
| Contribution origen | CONTRIBUTION-* |
| Tipo de cambio | new / enrich / modify / deprecate |
| Target canonico ID | Pendiente |
| Target canonico path | Pendiente |
| Riesgo inicial | low / medium / high / unknown |
```

## Required sections

Cada `proposal.md` debe tener:

- `Campos para routing`
- `Contribution source`
- `Tipo de cambio`
- `Target canonico`
- `Cambio propuesto`
- `Evidencia usada`
- `Ejemplos raw documents`
- `Materiales canonicos a copiar`
- `Drafts usados`
- `Canonicos relacionados`
- `Riesgos o dudas`
- `Archivos canonicos esperados`

Tambien debe conservar cualquier seccion especifica del template vivo, por ejemplo `Detalle DOL`, `Resumen TEST propuesto`, `Documentos requeridos` o `Impacto esperado en METH padre`.

## Raw document examples

La PROP debe inventariar ejemplos reales de los documentos crudos cargados a la
contribution. Esta seccion explica que existe y como se usaria; no basta para
ordenar una copia al canonico.

La carpeta `PROP-*` sigue conteniendo solo `proposal.md`. No copies raw
documents a `02 Proposals/`. Referencialos desde:

```text
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/01 Contribuciones/<source>/CONTRIBUTION-*/materials/
```

Seccion esperada:

```md
## Ejemplos raw documents
| Ejemplo | Empresa / fuente | Ubicacion en contribution | Tipo / variante | Variante canonica destino | Uso en el canonico | Destino canonico sugerido |
|---|---|---|---|---|---|---|
| Pendiente | Pendiente | `materials/...` | Pendiente | Pendiente / no_aplica | ejemplo_real / fixture / muestra_layout / evidencia_contextual | Pendiente |
```

Para `PROP-DOC` y `PROP-DVC`, esta seccion es obligatoria cuando existan
documentos reales en `materials/`. Para `PROP-TEST` y `PROP-METH`, incluir
papeles de trabajo o documentos fuente reales que sostienen la logica operativa.
Si el ejemplo solo existe como ruta externa y no fue copiado a `materials/`, no
crear PROP hasta preparar la contribution o marcar el bloqueo.

Para `PROP-DVC`, cada ejemplo debe mapearse a una variante canonica explicita.
La PROP debe incluir `## Mapeo ejemplos a variantes DVC` y el destino debe
iniciar con esa variante, por ejemplo
`<variante-id>/source_documents/examples/<fuente>/`. No uses la primera variante como destino por
default ni rutas raiz como `Examples/<fuente>/`.

## Canonical copy materials

Cuando documentos, carpetas, ejemplos, fixtures o legacy markdown deban copiarse
al canonico aprobado, la PROP debe incluir:

```md
## Materiales canonicos a copiar
| Accion | Origen en contribution | Variante canonica destino | Destino canonico esperado | Tipo | Preservar estructura | Nota |
|---|---|---|---|---|---|---|
| copiar archivo / copiar carpeta | `materials/...` | Pendiente / no_aplica | `Examples/...` / `<variante>/source_documents/examples/...` / `fixtures/...` / `PENDIENTES - archivo.md` | ejemplo_real / fixture / legacy_markdown / muestra_layout | si / no | Pendiente |
```

Esta seccion es obligatoria para `PROP-DOC` y `PROP-DVC` cuando:

- existe `materials/source_documents/examples/`;
- hay carpetas por empresa, cliente, banco, sistema o variante;
- hay archivos legacy markdown que deben conservarse en el canonico;
- el usuario espera que Canonical Editor "imprima" documentos fisicos en el
  canonico.

Cada fila de `Materiales canonicos a copiar` debe repetirse tambien en
`Archivos canonicos esperados` con accion `copiar`. Si solo aparece en
`Evidencia usada` o `Ejemplos raw documents`, cuenta como evidencia, no como
output canónico esperado.

En `PROP-DVC`, cada fila de ejemplo o fixture copiable debe declarar
`Variante canonica destino`; el `Destino canonico esperado` y la fila `copiar`
de `Archivos canonicos esperados` deben iniciar con la misma variante. Si no se
puede probar el mapeo fuente -> variante, la PROP queda bloqueada.

## DVC README mapping

En `PROP-DVC`, `spec_draft.md` se usa para `spec.md`. No lo listes tambien como
origen directo de `README.md`. Si el canonico necesita `README.md`, declaralo
como indice generado desde el spec y las variantes, o usa un `README_draft.md`
si existe. La nota de `Archivos canonicos esperados` debe dejar claro que el
README es indice, no duplicado del spec.

## Draft source mapping

| Skill output | Proposal type |
|---|---|
| `skill_outputs/explicit_knowledge/*/spec_draft.md` con tipo AIM | `PROP-AIM` |
| `skill_outputs/explicit_knowledge/*/spec_draft.md` con tipo DICT | `PROP-DICT` |
| `skill_outputs/explicit_knowledge/*/spec_draft.md` con tipo DOC | `PROP-DOC` |
| `skill_outputs/explicit_knowledge/*/spec_draft.md` con tipo DVC | `PROP-DVC` |
| `skill_outputs/explicit_knowledge/*/spec_draft.md` con tipo DOL | `PROP-DOL` |
| `skill_outputs/task-specific/METH-*/` | `PROP-METH` |
| `skill_outputs/task-specific/TEST-*/` | `PROP-TEST` |
| `insights_captured.md` sobre persona | `PROP-PEOP` |
| `insights_captured.md` sobre firma/oficina | `PROP-FIRM` |
| `insights_captured.md` sobre practica de campo | `PROP-FIELD` |

## Forbidden outputs

No produzcas:

- `router_decision.md`
- `analysis_report.md`
- `questions_for_human.md`
- `decision_record.md`
- `applied_record.md`
- `risk_score.md`
- canonicos
- changelogs canonicos
- outputs nuevos dentro de `skill_outputs/`

## Numbering

`PROP-*` usa numeracion global dentro de Benford Vault V3.

Antes de proponer IDs:

1. lista carpetas `PROP-*` en todas las colas de `02 Proposals/`;
2. usa el siguiente numero disponible;
3. conserva cuatro digitos en V1: `PROP-0001`, `PROP-0002`, etc.

Si no puedes listar todo el vault, usa un ID provisional solo en borrador verbal y no escribas.
