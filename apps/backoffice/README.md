# Clo Backoffice

Frontend local del backoffice de Clo. Esta version reemplaza el scaffold
anterior por el proyecto de Claude Design en `Clo_s_Backoffice.zip`.

La primera capa backend usa SQLite local con `bun:sqlite`. Campaigns,
Prospectos/Personas y Empresas ya se hidratan desde endpoints locales; las
demás pantallas siguen usando datos mock mientras se conectan por fases.

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

## Estructura

```text
apps/backoffice/
├── dev.ts                 # servidor local Bun con transpile JSX
├── index.html             # shell HTML + estilos del design
├── db/
│   ├── migrations/        # schema SQLite versionado
│   └── seeds/             # datos dev separados del schema
├── .data/                 # SQLite local ignorado por Git
├── public/uploads/        # assets del proyecto de Claude Design
└── src/
    ├── clo/               # pantallas JSX del design
    ├── server/            # migrator, SQLite y queries de compatibilidad
    └── vendor/            # runtime local minimo para el prototipo
```

## Notas

- No depende de React/Babel desde CDN; `dev.ts` transpila `.jsx` al vuelo.
- `src/vendor/react-lite.js` existe solo para esta fase de prototipo.
- La base local vive en `apps/backoffice/.data/backoffice.sqlite`.
- Se puede cambiar la ruta con `BENFORD_BACKOFFICE_DB_PATH`.
- Si existe una base prototipo anterior, el migrator conserva sus tablas como
  `legacy_*` y crea el schema nuevo desde migraciones.

## Documentacion de producto

Este backoffice se esta convirtiendo en el Mission Panel agentico oficial para
campanas internas con OpenClaw.

- `docs/ARCHITECTURE.md`: arquitectura, runtime y responsabilidades.
- `docs/DATA_MODEL.md`: tablas, estados, dedupe y catalogo de eventos.
- `docs/API.md`: endpoints actuales y proximos endpoints.
- `docs/OPENCLAW_CONTRACT.md`: contrato backend/worker/OpenClaw.
- `docs/ROADMAP.md`: fases y siguiente trabajo.
- `docs/DECISIONS.md`: decisiones aceptadas, diferidas y rechazadas.
- `docs/BACKOFFICE_SYSTEM_FLOW.excalidraw`: diagrama del flujo completo.

`docs/APP_SPEC.md` y `docs/PLAN.md` quedan como documentos historicos; los
archivos anteriores son la referencia operativa actual.
