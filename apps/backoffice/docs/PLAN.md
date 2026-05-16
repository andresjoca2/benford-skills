# Plan

## Current Milestone Status

El primer milestone de `company_discovery` esta operativo en OpenClaw:

```text
laptop browser -> remote backoffice API -> remote SQLite -> worker -> OpenClaw -> company candidates -> review feedback -> next run
```

La fuente de verdad ya no es la base local de pruebas. La base operativa vive en:

```text
/root/benford/benford-skills/apps/backoffice/.data/backoffice.sqlite
```

La base local inicial fue borrada para evitar confusiones. Para desarrollo
aislado, crear una base nueva con `BENFORD_BACKOFFICE_DB_PATH`.

## What Works

- servidor `backoffice:dev` remoto en OpenClaw
- worker remoto de `openclaw_jobs`
- campañas y brief live
- corridas `company_discovery`
- prefetch de candidatos y revelado de lotes de review
- feedback de aceptar/rechazar guardado como memoria para la siguiente corrida
- dedupe por empresa/dominio/LinkedIn
- `do_not_contact` y suppression list
- migracion idempotente de la cola de review

## Current Open Problem

La carga/corrida sigue sintiendose lenta. El cuello de botella ya no es la base
local ni SSH para SQLite; ahora esta en la ejecucion OpenClaw/agente/contexto y
en la carga de la UI con datos reales. Se esta investigando en otra sesion.

## Next Work

1. Reducir latencia de carga inicial de campanas/detalle.
2. Reducir latencia de `company_discovery` sin bajar demasiado la calidad.
3. Hacer mas claro en UI cuando una corrida falla, reintenta o esta corriendo.
4. Convertir server/worker remotos en servicios persistentes.
5. Despues de estabilizar empresas, implementar `find_people`.

## References

El roadmap actual esta en:

- `ROADMAP.md`

La arquitectura, modelo de datos, API, contrato con OpenClaw y decisiones estan en:

- `ARCHITECTURE.md`
- `DATA_MODEL.md`
- `API.md`
- `OPENCLAW_CONTRACT.md`
- `DECISIONS.md`
- `FIND_COMPANIES_MILESTONE.md`
