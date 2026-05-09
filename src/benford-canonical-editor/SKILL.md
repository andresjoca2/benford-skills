---
name: benford-canonical-editor
description: >-
  Aplica una PROP-* aprobada desde `02 Proposals/03 Approved for Editor` al
  Benford Brain canonico. Usala cuando una propuesta ya fue aprobada por
  Router Engine o por decision humana y el usuario quiera imprimir el cambio en
  archivos canonicos, crear applied_record.md y mover la PROP a `04 Applied`.
---

# Benford Canonical Editor

## Responsabilidad

Aplicar una PROP aprobada al canon. No decide si una PROP pasa; eso ya lo hizo
Router Engine o el humano.

## Hard stops

Detente si:

- la PROP no esta en `02 Proposals/03 Approved for Editor`;
- falta `proposal.md`;
- falta `router_decision.md` o no dice `approved_for_editor`;
- el target canonico no esta claro;
- el cambio intenta tocar algo fuera del Benford Vault V3;
- la PROP declara materiales en `Archivos canonicos esperados` con accion
  `copiar`, pero no existe la misma ruta en `Materiales canonicos a copiar`;
- un material declarado para copiar no existe en la contribution;
- el destino de un archivo o carpeta canonica ya existe y la PROP no declara
  explicitamente una modificacion soportada;
- el usuario no aprobo escribir canónicos en esta sesion.

## Regla de fidelidad canonica

Los archivos canonicos no deben recibir narrativa operativa del proceso. No
insertes bloques como `Objetivo`, `Justificacion`, `Evidencia fuente`,
`Relaciones canonicas` o texto de router/editor dentro de `spec.md`,
`schema.md`, `parser_config.md`, `raw_schema.md`, `document_transcript.md` o
equivalentes.

Cuando la PROP apunta a drafts ya aterrizados, imprime el contenido del draft lo
mas intacto posible. La trazabilidad del proceso vive en `changelog.md`,
`applied_record.md`, `router_decision.md` o `decision_record.md`, no dentro del
cuerpo canonico.

## Workflow

1. Lee `proposal.md`, `router_decision.md` y `analysis_report.md`.
2. Lee los drafts listados en `Drafts usados`.
3. Lee los materiales listados en `Materiales canonicos a copiar`, si existe la
   seccion.
4. Lee los targets en `Archivos canonicos esperados`.
5. Valida que cada accion `copiar` de `Archivos canonicos esperados` exista en
   `Materiales canonicos a copiar`.
6. Explica al usuario exactamente que archivos canonicos y carpetas/materiales
   vas a crear o copiar.
7. Espera aprobacion explicita para escribir.
8. Aplica los cambios con ediciones minimas y copia los materiales declarados
   preservando nombres y estructura.
9. Crea `applied_record.md` dentro de la PROP.
10. Mueve la PROP a `02 Proposals/04 Applied`.

## Contrato de materiales

Los ejemplos o documentos fuente no se copian por aparecer solo como evidencia
raw. Para que el Canonical Editor los copie al canon, la PROP debe declararlos
en `Materiales canonicos a copiar` con:

- `Accion`: `copiar carpeta` o `copiar archivo`;
- `Origen en contribution`: ruta real dentro de la contribution;
- `Destino canonico esperado`: ruta relativa al canonico target o ruta canonica
  completa dentro de Benford Brain;
- `Preservar estructura`: `si` para carpetas de ejemplos.

La misma copia debe aparecer en `Archivos canonicos esperados` con accion
`copiar`. Si falta esa sincronizacion, detente.

## Contrato DVC

Para `PROP-DVC`, respeta destinos relativos con subcarpetas. Un DVC canonico
tiene solo una carpeta por variante; cada variante tiene sus propios `spec.md`,
`raw_schema.md`, `parser_config.md`, `changelog.md` y ejemplos fuente:

```text
DVC-<slug>/
  <Variante>/
    spec.md
    raw_schema.md
    parser_config.md
    changelog.md
    source_documents/examples/
```

No aplanes archivos de variante en la raiz del DVC.

## Applied record minimo

`applied_record.md` debe incluir:

- PROP ID;
- fecha;
- archivos canonicos creados/editados;
- materiales canonicos copiados;
- materiales declarados no copiados, si aplica;
- drafts usados;
- resumen de cambios;
- siguiente paso o notas.

## No hace

- No rechaza PROPs.
- No resuelve decisiones humanas.
- No edita `05 Rejected`.
- No cambia la logica del Router.
