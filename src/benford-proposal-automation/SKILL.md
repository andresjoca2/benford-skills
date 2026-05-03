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
01 Contribuciones/**/CONTRIBUTION-* ready_for_proposal -> bun run automations -> IMSS-Proposal-Generator
02 Proposals/<cola>/PROP-* -> bun run automations -> siguiente skill o espera
```

## Regla de contributions

| Carpeta | Condicion | Accion | Siguiente paso |
|---|---|---|---|
| `01 Contribuciones/**/CONTRIBUTION-*` | `contribution_map.md` con `Estado` = `ready_for_proposal` y sin PROP generada | `generate_proposal` | usar `IMSS-Proposal-Generator` |

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

- `01 Draft`: puede llamar al Router Engine con `--write`, que escribe archivos
  operativos y mueve la PROP a su cola destino.

## No puede escribir directamente

- Canónicos del Benford Brain.
- `04 Applied`.
- `decision_record.md`.
- `applied_record.md`.

Para CONTRIBUTION-* listas, delega a `IMSS-Proposal-Generator`. Crear la carpeta
PROP-* dentro del Vault requiere aprobacion explicita del usuario en la sesion,
porque es una escritura dentro del Vault.

Para PROPs en `03 Approved for Editor`, delega a `benford-canonical-editor`.

## Validacion final

Reporta:

- cuantas PROPs hay por cola;
- cuantas CONTRIBUTION-* estan listas para Proposal Generator;
- que eventos se detectaron;
- que acciones se ejecutaron;
- que acciones quedaron pendientes;
- si fue dry-run o write.
