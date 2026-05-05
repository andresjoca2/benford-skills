---
name: benford-proposal-automation
description: >-
  Orquesta automatizaciones por carpetas de Benford Vault V3. Usala cuando el
  usuario quiera detectar CONTRIBUTION-* listas para proposal, observar
  02 Proposals, rutear Drafts, o continuar con la siguiente skill segun la cola:
  Proposal Generator, Router Engine, decision humana, Canonical Editor u otros
  handlers futuros. Esta skill usa el CLI portable `bun run automations`.
---

# Benford Proposal Automation

## Responsabilidad

Esta skill coordina triggers por carpeta. No reemplaza a las skills de trabajo;
las dispara o reporta que estan listas.

Flujo:

```text
01 Contribuciones/**/CONTRIBUTION-* con Estado automation=ready y outputs soportados -> bun run automations -> IMSS-Proposal-Generator
02 Proposals/<cola>/PROP-* -> bun run automations -> siguiente skill o espera
```

## Regla de contributions

| Carpeta | Condicion | Accion | Siguiente paso |
|---|---|---|---|
| `01 Contribuciones/**/CONTRIBUTION-*` | `contribution_map.md` existe, `## Identificacion` contiene `Estado automation` = `ready`, hay outputs soportados y no hay PROP generada | `generate_proposal` | usar `IMSS-Proposal-Generator` |

El runner debe ignorar contributions sin `Estado automation`, o con valores como
`draft`, `building`, `blocked` o cualquier otro distinto de `ready`.

Para outputs `DVC-*`, si existen ejemplos fisicos bajo
`materials/source_documents/examples/`, tambien debe existir
`skill_outputs/explicit_knowledge/DVC-*/source_documents_map.md`. Sin ese
manifiesto, la contribution se reporta como skipped. El runner no debe adivinar
la variante de un ejemplo por tokens del nombre de carpeta.

## Reglas por cola

| Cola | Accion | Siguiente paso |
|---|---|---|
| `01 Draft` | `route_draft` | usar `benford-router-engine` |
| `02 Needs Human Decision` | `wait_for_human` | pedir decision humana |
| `03 Approved for Editor` | `invoke_skill` | usar `benford-canonical-editor` |
| `04 Applied` | `no_op` | terminal |
| `05 Rejected` | `no_op` | terminal |

## Workflow

1. Verifica que estas en el repo `benford-skills`.
2. Resuelve `vaultRoot` igual que el Router: `BENFORD_VAULT_ROOT`,
   `.benford-router.json`, ruta del usuario, o workspace si claramente es el
   Vault.
3. Ejecuta `check` para ver contributions listas y conteos por cola.
4. Ejecuta `run` en dry-run para mostrar eventos.
5. Usa `--write` solo cuando el usuario pidio automatizar/mover propuestas en
   esta sesion o cuando venga de una accion confiable del backoffice.
6. Si un evento pide una accion manual, reportalo como `pending_manual`; no
   inventes el trabajo de otra skill.

## Comandos

Desde el repo `benford-skills`:

```bash
bun run automations -- check --vault-root "$BENFORD_VAULT_ROOT"
bun run automations -- run --vault-root "$BENFORD_VAULT_ROOT"
bun run automations -- run --write --vault-root "$BENFORD_VAULT_ROOT"
bun run automations -- watch --interval-ms 5000 --vault-root "$BENFORD_VAULT_ROOT"
```

## Puede escribir

Solo por medio de handlers seguros:

- Contributions soportadas: puede crear una `PROP-DOC`, `PROP-DVC` o `PROP-DOL`
  en `01 Draft` y actualizar `contribution_map.md`.
- `01 Draft`: puede llamar al Router Engine con `--write`, que escribe archivos
  operativos y mueve la PROP a su cola destino.

## No puede escribir directamente

- Canónicos del Benford Brain.
- `04 Applied`.
- `decision_record.md`.
- `applied_record.md`.

Para CONTRIBUTION-* con `Estado automation` = `ready` y outputs soportados,
llama al `IMSS-Proposal-Generator` deterministico. En modo `--write`, puede
crear la carpeta PROP-* dentro del Vault.
Si la contribution contiene `materials/source_documents/examples/`, la PROP debe
declarar esas carpetas o archivos en `Materiales canonicos a copiar` y repetir
los destinos en `Archivos canonicos esperados` con accion `copiar`. Listarlos
solo como evidencia raw no basta para que el Canonical Editor los imprima.
En `PROP-DVC`, esos destinos deben salir exclusivamente de
`source_documents_map.md`; una carpeta fuente compartida por varias variantes se
debe declarar por archivo para que cada variante reciba solo sus ejemplos.

Para PROPs en `03 Approved for Editor`, delega a `benford-canonical-editor`.
El editor deterministico aplica `PROP-DOC`, `PROP-DVC` y `PROP-DOL` cuando el
tipo de cambio es `new` y los drafts declarados existen.

## Validacion final

Reporta:

- cuantas PROPs hay por cola;
- cuantas CONTRIBUTION-* estan listas para Proposal Generator, lo cual requiere
  `Estado automation` = `ready`;
- que CONTRIBUTION-* quedaron skipped por faltar `source_documents_map.md` en
  DVC con ejemplos fisicos;
- que eventos se detectaron;
- que acciones se ejecutaron;
- que acciones quedaron pendientes;
- si fue dry-run o write.
