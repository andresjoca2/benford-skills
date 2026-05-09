---
name: benford-vault-tracker
description: >-
  Genera un dashboard HTML live del estado de los canonicos de Benford Vault V3
  y lo muestra como Cowork artifact. Usa esta skill cuando el usuario quiera ver
  el "tracker", "dashboard del vault", "que documentos faltan", "estado de
  canonicos", "validar documentos del vault", o quiera trazar la relacion entre
  un documento canonico, sus PROPs y las contributions que lo originaron.
  La skill escanea DOC/DVC/DOL en 01 Explicit Knowledge y METH/TEST en 02 Task
  Specific, calcula status verde/rojo por documento contra el template canonico,
  y arma una tabla expandible con paths copiables y links file:// a Finder.
---

# Benford Vault Tracker

## Responsabilidad

Esta skill produce un dashboard de tracking de los canonicos de Benford Vault V3.
No modifica el vault, no crea PROPs, no toca contribuciones. Solo lee y reporta.

El dashboard es un Cowork artifact (HTML live) que muestra:

- Tabs: Explicit Knowledge / Task Specific.
- Tabla con columnas Documento / Tipo / Contributions / PROPs / Status.
- Status verde si el canonico cumple los 3 criterios; rojo si falla alguno.
- Cada fila se expande para ver archivos requeridos, variantes (DVC), PROPs vinculadas y contributions origen, con paths copiables.

## Criterios de status

Por tipo de canonico la skill aplica reglas distintas porque el "template"
canonico es distinto:

- **DOC** (Documentos y Ejemplos): requiere `spec.md`, `schema.md`, `parser_config.md`, `changelog.md` no vacios y carpeta `Examples/` o `Ejemplos/` con al menos un archivo.
- **DVC** (Documentos Variables Cliente): requiere al menos una variante real
  (no skeleton tipo "Variante x") con `spec.md`, `parser_config.md`,
  `raw_schema.md`, `changelog.md` no vacios y evidencia bajo
  `source_documents/examples/`.
- **DOL** (Documentos de Leyes): requiere `spec.md`, `changelog.md`, `document_transcript.md` no vacios y al menos un PDF fuente en la raiz.

Adicionalmente, todo canonico debe tener al menos una `PROP-*` aplicada
(presente en `02 Proposals/04 Applied/`) que lo apunte como target. Sin PROP
aplicada se marca rojo aunque los archivos esten completos, porque el canonico
no es trazable al flujo Contribution -> PROP -> Editor.

## Cuando invocar la skill

Triggers tipicos:

- "abre el tracker", "muestrame el dashboard del vault", "estado de los canonicos".
- "que documento me falta", "que canonicos estan rojos", "cuales no estan al dia".
- "donde estan las PROPs de X", "que contributions hicieron X canonico" (la skill responde rapido sin grep manual).
- "valida los canonicos contra el template".

No invocar la skill cuando:

- el usuario quiere generar una PROP (usar `imss-add-explicit-knowledge`).
- el usuario quiere rutear PROPs (usar `benford-router-engine`).
- el usuario quiere aplicar una PROP al canonico (usar `benford-canonical-editor`).

## Flujo operativo

```text
detectar vault root
  -> correr build_tracker.py
  -> obtener HTML generado en /tmp/benford_tracker.html (o ruta dada)
  -> create_artifact con id "benford-vault-tracker"
  -> reportar al usuario el resumen (verdes/rojos/PROPs/contribs) y los pendientes especificos
```

## Pasos detallados para Claude

### 1. Detectar el vault root

Buscar en este orden:

1. Si el usuario tiene una carpeta seleccionada (workspace folder) y termina en `05 Benford Vault` o contiene un subdirectorio `Benford Vault V3/`, usar esa.
2. Si la carpeta seleccionada es `Benford Vault V3/` directamente, usar el padre como root.
3. Si nada coincide, llamar `mcp__cowork__request_cowork_directory` y pedir al usuario que conecte la carpeta `05 Benford Vault` de su Drive.

El vault root debe contener un subdirectorio `Benford Vault V3/`. Si no lo
contiene, abortar y pedir al usuario el path correcto.

Necesitas dos paths:

- **scan_path**: la ruta que ve `bash` en el sandbox (mount path tipo `/sessions/.../mnt/05 Benford Vault`). Es la que pasa el script para leer.
- **mac_path**: la ruta real de macOS (tipo `/Users/<user>/Library/CloudStorage/GoogleDrive-.../05 Benford Vault`). Es la que se inyecta en el HTML para que los links `file://` y los "Copiar path" abran Finder.

Ambas estan disponibles en el contexto de Cowork: el system prompt declara la
ruta seleccionada del usuario (mac) y la ruta de mount (bash) bajo el bloque
`<file_handling_rules>` o `<env>`.

### 2. Correr el script

```bash
python3 <skill_dir>/scripts/build_tracker.py \
  "<scan_path>" \
  --mac-path "<mac_path>" \
  --out /tmp/benford_tracker.html
```

El script imprime un JSON con `out_path`, `summary` (green/red/by_type), `n_props`, `n_contributions`. Si falla (no encuentra `Benford Vault V3/`), se aborta con exit 1.

### 3. Crear el artifact

```
mcp__cowork__create_artifact(
  id="benford-vault-tracker",
  html_path="/tmp/benford_tracker.html",
  description="Tracker del Benford Vault V3: estado de canonicos DOC/DVC/DOL con PROPs y contributions vinculadas.",
  mcp_tools=[]
)
```

Si ya existe el artifact con ese ID (porque la skill se invoco antes),
usar `mcp__cowork__update_artifact` con `update_summary` describiendo que
cambio (ej. "refresh con nuevos canonicos aprobados").

### 4. Resumir al usuario

Reportar en el chat:

- Total verdes / rojos.
- Lista corta de los rojos con la razon (ej. "DVC-contrato-individual-trabajo: ninguna variante real con archivos completos + ejemplos").
- Numero de PROPs y contributions detectadas.
- Recordar que el artifact aparecio en el sidebar y es interactivo (click una fila para expandir, copiar paths, abrir en Finder).

## Notas de implementacion

- El HTML es self-contained, no depende de CDNs externos. Funciona offline una vez generado.
- Los links `file://` solo abren si el navegador del Cowork artifact permite navegacion local. Si no, el boton "Copiar path" siempre funciona.
- Los paths que se copian al portapapeles son los `mac_path`. Para abrir en Finder: `Cmd+Shift+G`, pegar, Enter.
- El script no escribe nada al vault. Solo lee. Es seguro correrlo cuantas veces se quiera.
- Para refrescar despues de aprobar nuevas PROPs, basta con re-invocar la skill.

## Estructura de la skill

```text
benford-vault-tracker/
├── SKILL.md                 # este archivo
└── scripts/
    └── build_tracker.py     # scanner + generador HTML, CLI con argumentos
```

## Limitaciones conocidas

- La deteccion de `target` en `proposal.md` es regex sobre el primer ID `DOC-*`/`DVC-*`/`DOL-*` que aparezca. Si una PROP toca varios canonicos, solo se vincula al primero.
- La deteccion de PROPs en `contribution_map.md` es similar: extrae todos los `PROP-NNNN` que aparezcan en cualquier parte del archivo.
- Si una PROP esta en `01 Draft`, `02 Needs Human Decision`, `03 Approved for Editor` o `05 Rejected`, aparece listada en la fila del canonico pero no cuenta para el criterio "PROP aplicada" (solo `04 Applied` cuenta).
- Si Cowork no esta conectado o el artifact tool no esta disponible, la skill puede caer a guardar el HTML en el outputs folder y compartirlo via `present_files`.
