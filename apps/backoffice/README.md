# Clo Backoffice

Frontend local del backoffice de Clo. Esta version reemplaza el scaffold
anterior por el proyecto de Claude Design en `Clo_s_Backoffice.zip`.

La primera capa backend usa SQLite local con `bun:sqlite`. Campañas y
Prospectos ya se hidratan desde `/api/campaigns` y `/api/prospects`; las demás
pantallas siguen usando datos mock mientras se conectan por fases.

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
├── .data/                 # SQLite local ignorado por Git
├── public/uploads/        # assets del proyecto de Claude Design
└── src/
    ├── clo/               # pantallas JSX del design
    ├── server/            # SQLite, schema, seed y consultas
    └── vendor/            # runtime local minimo para el prototipo
```

## Notas

- No depende de React/Babel desde CDN; `dev.ts` transpila `.jsx` al vuelo.
- `src/vendor/react-lite.js` existe solo para esta fase de prototipo.
- Cuando empecemos backend conviene migrar datos mock de `src/clo/data.jsx` a
  endpoints locales.
- La base local vive en `apps/backoffice/.data/backoffice.sqlite`.
