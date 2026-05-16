# Clo Backoffice

Frontend local del backoffice de Clo. Esta version reemplaza el scaffold
anterior por el proyecto de Claude Design en `Clo_s_Backoffice.zip`.

El primer milestone operativo ya corre con el servidor y worker en OpenClaw.
La UI se abre desde la laptop por tunnel/local browser, pero la API y la base
operativa escriben en el SQLite remoto del host OpenClaw. Campaigns, corridas,
Empresas, review feedback y cola de candidatos ya usan endpoints reales.

## Comandos

```bash
bun run backoffice:dev
bun run backoffice:typecheck
bun run backoffice:test
```

Por default el servidor local corre en:

```text
http://localhost:3000
```

Se puede cambiar el puerto con `PORT=3001 bun run backoffice:dev`.

## Demo remoto con OpenClaw

Para ensenar avances desde otra computadora, la app debe correr en el host
`openclaw` y la otra computadora solo abre un tunel SSH. El navegador es local,
pero el servidor, API y SQLite operativo son los de OpenClaw.

En la computadora que va a ver la demo:

```bash
git clone https://github.com/andresjoca2/benford-skills
cd benford-skills
bun install
ssh -L 3000:127.0.0.1:3000 openclaw
```

Luego abrir:

```text
http://localhost:3000
```

En OpenClaw, el servidor debe estar corriendo desde el repo remoto:

```bash
ssh openclaw
cd /root/benford/benford-skills
git pull origin main
bun install
PORT=3000 BENFORD_BACKOFFICE_DB_PATH=apps/backoffice/.data/backoffice.sqlite bun run backoffice:dev
```

When running inside the OpenClaw VPS, do not use `backoffice:worker:openclaw`
for the server auto-worker. The dev server starts `backoffice:worker` by
default so jobs call the local `/usr/bin/openclaw` binary. The `:openclaw`
script is only for running a worker from a laptop that has `openclaw` in
`~/.ssh/config`.

En otra terminal de OpenClaw, para procesar jobs:

```bash
cd /root/benford/benford-skills
OPENCLAW_COMMAND=/usr/bin/openclaw \
BENFORD_BACKOFFICE_DB_PATH=apps/backoffice/.data/backoffice.sqlite \
bun run backoffice:worker
```

Secrets de proveedores viven en `apps/backoffice/.env.local` en OpenClaw. Ese
archivo esta ignorado por Git.

## Estructura

```text
apps/backoffice/
├── dev.ts                 # servidor local Bun con transpile JSX
├── index.html             # shell HTML + estilos del design
├── db/
│   ├── migrations/        # schema SQLite versionado
│   └── seeds/             # datos dev separados del schema
├── .data/                 # artefactos locales ignorados por Git; no es la DB operativa
├── public/uploads/        # assets del proyecto de Claude Design
└── src/
    ├── clo/               # pantallas JSX del design
    ├── server/            # migrator, SQLite y queries de compatibilidad
    └── vendor/            # runtime local minimo para el prototipo
```

## Notas

- No depende de React/Babel desde CDN; `dev.ts` transpila `.jsx` al vuelo.
- `src/vendor/react-lite.js` existe solo para esta fase de prototipo.
- La base operativa actual vive en OpenClaw:
  `/root/benford/benford-skills/apps/backoffice/.data/backoffice.sqlite`.
- La base local de pruebas inicial fue borrada. Para desarrollo aislado se puede
  crear una nueva con `BENFORD_BACKOFFICE_DB_PATH`.
- Si existe una base prototipo anterior, el migrator conserva sus tablas como
  `legacy_*` y crea el schema nuevo desde migraciones.
- El servidor y worker remotos se levantan siguiendo
  `docs/FIND_COMPANIES_MILESTONE.md`.

## Documentacion de producto

Este backoffice se esta convirtiendo en el Mission Panel agentico oficial para
campanas internas con OpenClaw.

- `docs/ARCHITECTURE.md`: arquitectura, runtime y responsabilidades.
- `docs/DATA_MODEL.md`: tablas, estados, dedupe y catalogo de eventos.
- `docs/API.md`: endpoints actuales y proximos endpoints.
- `docs/OPENCLAW_CONTRACT.md`: contrato backend/worker/OpenClaw.
- `docs/FIND_COMPANIES_MILESTONE.md`: runbook para cerrar el loop remoto de empresas.
- `docs/ROADMAP.md`: fases y siguiente trabajo.
- `docs/DECISIONS.md`: decisiones aceptadas, diferidas y rechazadas.
- `docs/BACKOFFICE_SYSTEM_FLOW.excalidraw`: diagrama del flujo completo.

`docs/APP_SPEC.md` y `docs/PLAN.md` quedan como documentos historicos; los
archivos anteriores son la referencia operativa actual.
