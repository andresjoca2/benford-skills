# Benford Vault Dashboard

Dashboard HTML estático que muestra el estado de los canónicos (`DOC`, `DVC`, `DOL`) y Task Specific (`METH`, `TEST`) del Benford Vault, con sus PROPs y contributions vinculadas.

## Archivos

| Archivo | Propósito |
|---|---|
| `index.html` | UI completa (single-file). El snapshot vive embebido en `<script id="vaultData">`. |
| `build_snapshot.py` | Escanea el vault y reinyecta el snapshot dentro de `index.html`. |
| `vault_snapshot.json` | Salida cruda del scan (gitignored). |

## Setup (una vez)

1. Asegúrate de tener configurado el path al vault. Cualquiera funciona:
   ```bash
   # Opción A: config persistente
   bun run router -- init --vault-root "/path/to/Benford Vault V3"
   
   # Opción B: env var
   export BENFORD_VAULT_ROOT="/path/to/Benford Vault V3"
   ```

2. Crea el symlink `Dashboard.html` dentro del vault (per-machine, no se versiona):
   ```bash
   bun run dashboard:link
   ```

## Uso

**Abrir el dashboard:**
- Doble-click en `Dashboard.html` dentro del vault, o abre `dashboard/index.html` directo en Chrome/Safari.

**Refrescar el snapshot:**
```bash
bun run dashboard:refresh
```
Luego recarga el dashboard (Cmd+R). El botón "Refrescar" del UI copia este comando al clipboard.

## Reglas que aplica el scanner

**DOC** (Documentos y Ejemplos):
- Canónico requiere: `spec.md`, `schema.md`, `parser_config.md`, `changelog.md`
- Examples: carpeta `Ejemplos/` o `Examples/` con ≥1 archivo

**DVC** (Documentos Variables Cliente):
- Canónico requiere: `README.md`
- Variantes válidas con cualquiera de los dos templates:
  - **NUEVO**: `spec.md`, `changelog.md`, `parser_config.md`, `raw_schema.md` a nivel variante; ejemplos en `source_documents/examples/`
  - **LEGACY**: `parser_config.md`, `raw_schema.md`, `mapping.md` a nivel variante; ejemplos en `Examples/` o `Ejemplos/`
- Status verde requiere ≥1 variante completa (archivos + ejemplos) no-skeleton

**DOL** (Documentos de Leyes):
- Canónico requiere: `spec.md`, `changelog.md`, `document_transcript.md`
- Examples: ≥1 archivo `.pdf` en cualquier sub-path

**Status global** de cada canónico:
- 🟢 verde: `files_ok && examples_ok && prop_applied`
- 🔴 rojo: falla cualquier criterio

## Columna "Falla"

Muestra inline qué criterios fallaron sin necesidad de expandir la fila:
- `archivos` — faltan archivos requeridos a nivel canónico
- `examples` — no hay evidencia (DOC: carpeta vacía; DVC: ninguna variante completa; DOL: sin PDF)
- `sin PROP` — ninguna PROP `04 Applied` vinculada

Filtros chip arriba de la tabla permiten acotar a un criterio específico.
