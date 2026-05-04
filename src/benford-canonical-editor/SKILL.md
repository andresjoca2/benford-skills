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
- el usuario no aprobo escribir canónicos en esta sesion.

## Workflow

1. Lee `proposal.md`, `router_decision.md` y `analysis_report.md`.
2. Lee los drafts listados en `Drafts usados`.
3. Lee los targets en `Archivos canonicos esperados`.
4. Explica al usuario exactamente que archivos canonicos vas a crear o editar.
5. Espera aprobacion explicita para escribir.
6. Aplica los cambios con ediciones minimas.
7. Crea `applied_record.md` dentro de la PROP.
8. Mueve la PROP a `02 Proposals/04 Applied`.

## Contrato DVC

Para `PROP-DVC`, respeta destinos relativos con subcarpetas. Un DVC canonico
tiene `README.md`, `spec.md` y `changelog.md` en la raiz, y cada variante tiene
sus propios `raw_schema.md`, `mapping.md` y `parser_config.md`:

```text
DVC-<slug>/
  README.md
  spec.md
  changelog.md
  <Variante>/
    raw_schema.md
    mapping.md
    parser_config.md
```

No aplanes archivos de variante en la raiz del DVC.

## Applied record minimo

`applied_record.md` debe incluir:

- PROP ID;
- fecha;
- archivos canonicos creados/editados;
- drafts usados;
- resumen de cambios;
- siguiente paso o notas.

## No hace

- No rechaza PROPs.
- No resuelve decisiones humanas.
- No edita `05 Rejected`.
- No cambia la logica del Router.
