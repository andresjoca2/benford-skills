---
# ── Identidad ────────────────────────────────────────────────
id: DOC-<slug-del-documento>
type: document
audit: <imss|sat|cnbv|otro>
name: "<Nombre canónico completo>"
aliases:
  - "<alias 1>"
  - "<alias 2>"

# ── Estado ───────────────────────────────────────────────────
status: canonical
version: 1

# ── Emisión ──────────────────────────────────────────────────
emitted_by: "<quién lo genera — patrón, IMSS, SAT, ...>"
frequency: <mensual|bimestral|anual|ad-hoc>
file_formats:
  - .<ext>

# ── Obligatoriedad ───────────────────────────────────────────
mandatory_level: <mandatory|conditional|optional>
blocks_audit_if_missing: <true|false>
blocks_pruebas:
  - PRUEBA-IMSS-<nn>
  - PRUEBA-METH-<slug>

# ── Validación ───────────────────────────────────────────────
validation_severity_levels: [error, warning, info]

# ── Trazabilidad ─────────────────────────────────────────────
last_decision: null
contributed_by: []

# ── Links internos ───────────────────────────────────────────
related_schema: "[[02 - Schema]]"
related_parser: "[[03 - Parser config]]"
related_changelog: "[[04 - Change log]]"
related_docs: []
---

# <Nombre del documento>

---

## 1. Overview

### ¿Qué es?

<Párrafo simple, sin normatividad ni tecnicismos. Como si lo explicaras a alguien
nuevo.>

### ¿Para qué sirve?

<Qué problema resuelve. Por qué existe. Qué pasaría en la auditoría si este
documento no existiera.>

### ¿Qué riesgo cubre?

<Desde el punto de vista del auditor: qué malentendido, error, omisión o fraude
se descubre usando este documento.>

### Relación con otros documentos

<Narrativa breve de qué documentos acompañan a este, cuáles son su contraparte
para el amarre, y cuáles podrían confundirse.>

- [[DOC-<otro>]] — <relación>
- [[DOC-<otro>]] — <relación>

---

## 2. Contrato funcional

### Cómo lo reconoce el auditor

- Encabezado típico: <texto / logo / folio que aparece>
- Emisor identificable por: <sello, formato, marca de agua>
- Cómo NO confundirlo con documentos parecidos: <distinción vs hermanos>

### Variantes del nombre en la práctica

| Nombre usado | Contexto |
|--------------|----------|
| ...          | ...      |

### Formato esperado

- **Tipo físico:** <binario | PDF nativo | PDF escaneado | Excel | XML | TXT>
- **Encoding:** <CP-850 | UTF-8 | latin-1 | N/A>
- **Tamaño típico:** <líneas / páginas / MB>
- **Compresión habitual:** <.ZIP | ninguna>

### Alcance

- **Entidad cubierta:** <patrón individual | grupo | conglomerado>
- **Periodo cubierto:** <un mes | acumulado | rango variable>
- **Nivel de detalle:** <agregado patronal | por trabajador | por movimiento>

### Periodicidad

- **Frecuencia base:** <mensual | bimestral | anual | ad-hoc>
- **Excepciones:** <alta extemporánea | modificatoria | finiquito | corrección>

### Nivel de obligatoriedad

- **Obligatoriedad:** <mandatory | conditional | optional>
- **Condición si es conditional:** <cuándo sí / cuándo no>
- **Qué pasa si el patrón no lo entrega:** <sanción | observación | bloqueo>

### Bloqueos si falta

- [[PRUEBA-IMSS-<nn>]] — <razón del bloqueo>
- [[PRUEBA-METH-<slug>]] — <razón del bloqueo>

### Fuente normativa

- <Ley / Artículo>
- <Reglamento / Artículo>
- <Acuerdo oficial>

---

## 3. Reglas de validación

### Convenciones

- **ID:** `VR-<SLUG>-NNN` (tres dígitos, inmutable una vez asignada)
- **Severidad:** `error` | `warning` | `info`
- **Acción si falla:** `abortar` | `aislar-fila` | `marcar` | `continuar` | `reportar`
- **Nunca se borra una regla.** Si deja de aplicar, se marca `status: deprecated`
  con su DEC-NNNN correspondiente.

### Reglas activas

#### VR-<SLUG>-001 — <título corto>

- **Status:** active
- **Regla:** <descripción en lenguaje natural>
- **Expresión:** `<pseudo-código booleano>`
- **Severidad:** <error|warning|info>
- **Acción si falla:** <abortar|aislar-fila|marcar|continuar|reportar>
- **Origen:** <normativo | operativo | aporte: [[CONTRIB-...]]>
- **Notas:** <contexto, tolerancias, casos especiales>

### Reglas deprecated

<!-- Cuando una regla deja de aplicar, se mueve acá — NO se borra. -->

---

## 4. Uso en pruebas

### Roles que puede tener un documento en una prueba

- **input principal** — sin este doc, la prueba no corre
- **input secundario** — útil para enriquecer; corre sin él con menos fidelidad
- **referencia cruzada** — valida datos que vienen de otro doc
- **amarre** — es uno de los dos lados de una reconciliación
- **origen de parámetros** — provee constantes / umbrales / catálogos

### Pruebas de METODOLOGÍA que lo usan

| Prueba METH | Rol | Qué alimenta |
|-------------|-----|--------------|
| [[PRUEBA-METH-<slug>]] | <rol> | <qué alimenta> |

### Pruebas IMSS finales impactadas (transitive)

- [[PRUEBA-IMSS-<nn>]] — <nombre>

---

## 5. Casos límite y variantes

### Convenciones

- **ID:** `EC-<SLUG>-NNN` (tres dígitos, inmutable)
- **Status:** `active` | `resolved` | `superseded`

### Casos activos

#### EC-<SLUG>-001 — <título descriptivo corto>

- **Status:** active
- **Cuándo ocurre:** <condición concreta y observable>
- **Cómo se reconoce:** <patrón que un parser/auditor puede detectar>
- **Cómo se maneja:**
  - En el parser: <ajuste de config / ruta alternativa>
  - En validación: <regla especial o exención>
  - En pruebas: <impacto, columna afectada, handling>

### Casos resueltos / obsoletos

<!-- Casos resueltos se preservan, no se borran. -->

---

## 6. Notas de mantenimiento

- Historia: seedeado <fecha> desde <fuente>.
- Archivo solo se modifica vía el pipeline de propuestas.
- Ver [[04 - Change log]] para el histórico.
