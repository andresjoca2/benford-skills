---
name: benford-router-engine
description: >-
  Ejecuta el Router Engine deterministico de Benford Vault V3 para evaluar y
  mover PROPs entre colas. Usala cuando el usuario quiera rutear, aprobar para
  editor, mandar a decision humana o revisar deterministicamente proposals
  PROP-* en 02 Proposals. Esta skill no rechaza: si falta evidencia, metadata o
  rewrite, manda a decision humana. Esta skill no decide por prompt: invoca el
  CLI portable `bun run router`.
---

# Benford Router Engine

## Responsabilidad

Esta skill es un wrapper operativo sobre el Router Engine deterministico.

Antes de rutear, aplica la politica de decision en
`router-decision-policy.md`. La politica separa la revision general de
incongruencias contra documentos relacionados del vault del movimiento operativo
entre colas.

El Router solo puede producir dos destinos:

- `03 Approved for Editor`
- `02 Needs Human Decision`

`05 Rejected` esta reservado para decision humana posterior. Si la PROP necesita
rewrite, evidencia adicional o correccion estructural, el Router la manda a
`02 Needs Human Decision`.

No hagas routing con razonamiento generativo. El flujo correcto es:

```text
proposal.md -> bun run router -> router_decision.md / analysis_report.md / questions_for_human.md
```

## Regla central

El Vault real vive fuera de este repo. Nunca uses una carpeta `vault/` dentro de
`benford-skills` como fuente de verdad.

Localiza `Benford Vault V3` en este orden:

1. `BENFORD_VAULT_ROOT`, si existe.
2. `.benford-router.json`, si existe.
3. Una ruta proporcionada por el usuario.
4. El workspace actual, solo si ya apunta claramente a `Benford Vault V3`.

Si no puedes localizar el Vault, pide la ruta exacta.

## Comandos

Desde el repo `benford-skills`:

```bash
bun run router -- check --vault-root "$BENFORD_VAULT_ROOT"
bun run router -- run --proposal PROP-0001 --vault-root "$BENFORD_VAULT_ROOT"
bun run router -- run --proposal PROP-0001 --write --vault-root "$BENFORD_VAULT_ROOT"
bun run router -- run --all-draft --write --vault-root "$BENFORD_VAULT_ROOT"
```

## Workflow

1. Verifica que estas en el repo `benford-skills`.
2. Resuelve `vaultRoot`.
3. Ejecuta `check` para confirmar que la estructura del Vault es valida.
4. Revisa `router-decision-policy.md` para distinguir incongruencia sustantiva,
   correccion tecnica y ruteo.
5. Ejecuta primero dry-run salvo que el usuario haya pedido explicitamente escribir.
6. Reporta la decision deterministica.
7. Ejecuta `--write` solo si el usuario pidio o aprobo mover la PROP en esta sesion.

## Puede escribir

Solo cuando se ejecuta `--write`, el CLI puede:

- crear o actualizar `router_decision.md`;
- crear o actualizar `analysis_report.md`;
- crear o actualizar `questions_for_human.md` si aplica;
- mover la carpeta `PROP-*` entre colas de `02 Proposals`.

## No puede escribir

- Benford Brain canonico;
- `04 Applied`;
- `decision_record.md`;
- `applied_record.md`;
- `skill_outputs`;
- carpetas legacy;
- una carpeta `vault/` dentro del repo `benford-skills`.

## Hard stops

Detente si:

- la PROP no esta en `02 Proposals/01 Draft`;
- falta `proposal.md`;
- el Vault root no contiene `00 Sistema` y `02 Proposals`;
- el usuario pide que el Router modifique canónicos;
- hay un lock activo para la misma PROP;
- el comando falla.

## Validacion final

Al terminar, reporta:

- PROP procesada;
- decision;
- cola origen y cola destino;
- archivos creados;
- si fue dry-run o write;
- siguiente paso: Canonical Editor o imss-tomar-decisiones.
