---
# ── Identidad ────────────────────────────────────────────────
id: DOC-<slug-del-documento>         # ID único y estable. No cambia nunca.
type: document
audit: <imss|sat|cnbv|otro>
name: "<Nombre canónico completo>"
aliases:                             # Cómo lo llaman los auditores en la práctica
  - "<alias 1>"
  - "<alias 2>"

# ── Estado ───────────────────────────────────────────────────
status: canonical                    # canonical | draft | deprecated
version: 1                           # Se bumpea solo vía DEC

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
last_decision: null                  # DEC-NNNN que tocó este archivo por última vez
contributed_by: []                   # CONTRIB-* que aportaron info

# ── Links internos ───────────────────────────────────────────
related_schema: "[[02 - Schema]]"
related_parser: "[[03 - Parser config]]"
related_changelog: "[[04 - Change log]]"
related_docs: []                     # Otros DOC-* con los que se amarra
---

# <Nombre del documento>

<!-- Este archivo es el bundle completo del contrato del documento. Las secciones
     son estables: siempre aparecen en este orden, aunque algunas empiecen vacías. -->

---

## 1. Overview

<!-- La nota más humana del bundle. Si alguien no conoce el documento, esto debería
     aterrizarlo en 2 minutos. Prosa, no bullets. -->

### ¿Qué es?

<Un párrafo simple, sin normatividad ni tecnicismos. Como si le explicaras a alguien
nuevo: "Es el archivo donde el patrón declara mes a mes cuánto debe pagar al IMSS
por cada uno de sus trabajadores." Así de directo.>

### ¿Para qué sirve?

<Qué problema resuelve. Por qué existe. Qué pasaría en la auditoría si este documento
no existiera.>

### ¿Qué riesgo cubre?

<Desde el punto de vista del auditor: qué malentendido, error, omisión o fraude se
descubre usando este documento que no se vería sin él. El "¿y qué?" del documento.>

### Relación con otros documentos

<Narrativa breve de qué documentos acompañan a este, cuáles son su contraparte para
el amarre, y cuáles podrían confundirse.>

- [[DOC-<otro>]] — contraparte del amarre
- [[DOC-<otro>]] — a veces se confunde con este, pero <distinción>

---

## 2. Contrato funcional

<!-- Señas prácticas para que un auditor reconozca el documento y sepa cuándo aplica.
     Enfocado en operativa, no en normatividad abstracta. -->

### Cómo lo reconoce el auditor

- Encabezado típico: <texto / logo / folio que aparece>
- Emisor identificable por: <sello, formato, marca de agua>
- Cómo NO confundirlo con documentos parecidos: <distinción vs hermanos>

### Variantes del nombre en la práctica

| Nombre usado | Contexto | Firma / persona donde se oyó |
|--------------|----------|------------------------------|
| ...          | ...      | ...                          |

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
- **Qué pasa si el patrón no lo entrega:** <sanción | observación | bloqueo de prueba>

### Bloqueos si falta

<!-- Qué pruebas se detienen si este doc no está disponible. Se duplica en el
     frontmatter (`blocks_pruebas`) para máquina, acá va en prosa para humanos. -->

- [[PRUEBA-IMSS-<nn>]] — <razón del bloqueo>
- [[PRUEBA-METH-<slug>]] — <razón del bloqueo>

### Fuente normativa

- <Ley / Artículo>
- <Reglamento / Artículo>
- <Acuerdo oficial>

---

## 3. Reglas de validación

<!-- Checks de integridad SOBRE los datos ya parseados.
     No es el schema (eso dice "la columna X existe"); esto dice "el valor de X
     tiene que cumplir Y regla de negocio". -->

<!-- Solo van reglas INTERNAS del documento. Las reglas que cruzan con otros
     documentos viven en la prueba de amarre correspondiente, no aquí. -->

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
- **Origen:** <normativo: <cita> | aporte: [[CONTRIB-...]]>
- **Notas:** <contexto, tolerancias, casos especiales>

#### VR-<SLUG>-002 — <título>

- **Status:** active
- ...

### Reglas deprecated

<!-- Cuando una regla deja de aplicar, se mueve acá — NO se borra. -->
<!-- Necesario para poder auditar data histórica. -->

#### VR-<SLUG>-NNN — <título> [deprecated YYYY-MM-DD por DEC-NNNN]

- **Vigente hasta:** <fecha>
- **Razón de deprecación:** <qué cambió>
- **Reemplazo (si aplica):** [[VR-<SLUG>-MMM]]

---

## 4. Uso en pruebas

<!-- Dónde se consume este documento. Se actualiza cada vez que una PROP de tipo
     `usage-add` o `usage-modify` se acepta. NUNCA se edita a mano. -->

### Roles que puede tener un documento en una prueba

- **input principal** — sin este doc, la prueba no corre
- **input secundario** — útil para enriquecer; corre sin él con menos fidelidad
- **referencia cruzada** — valida datos que vienen de otro doc
- **amarre** — es uno de los dos lados de una reconciliación
- **origen de parámetros** — provee constantes / umbrales / catálogos

### Pruebas de METODOLOGÍA que lo usan

| Prueba METH | Rol | Qué alimenta | Pruebas IMSS afectadas | Origen |
|-------------|-----|--------------|------------------------|--------|
| [[PRUEBA-METH-<slug>]] | <rol> | columna X de tabla Y | [[PRUEBA-IMSS-01]] | [[CONTRIB-...]] |
| ...         | ... | ... | ... | ... |

### Pruebas IMSS finales impactadas (transitive)

<!-- Agregado automático: unión de todas las PRUEBA-IMSS afectadas vía cualquier
     PRUEBA-METH de la tabla anterior. Útil para dimensionar impacto. -->

- [[PRUEBA-IMSS-<nn>]] — <nombre de la pestaña>
- ...

---

## 5. Casos límite y variantes

<!-- Cola larga de excepciones: layouts alternos, campos opcionales, diferencias
     por firma, cliente o periodo. Crece con cada sesión de auditor. -->

<!-- Regla de separación:
     - Excepciones DE LA FORMA de parseo → van en 03 - Parser config
     - Excepciones DE LA REGLA de negocio → van en la sección 3 de arriba
     - Excepciones DE INTERPRETACIÓN (cuándo este doc se comporta distinto) → acá -->

### Convenciones

- **ID:** `EC-<SLUG>-NNN` (tres dígitos, inmutable)
- **Status:** `active` | `resolved` | `superseded`
- Los casos resueltos se preservan (data histórica los necesita para interpretación).

### Casos activos

#### EC-<SLUG>-001 — <título descriptivo corto>

- **Status:** active
- **Cuándo ocurre:** <condición concreta y observable>
- **Cómo se reconoce:** <patrón que un parser/auditor puede detectar>
- **Cómo se maneja:**
  - En el parser: <ajuste de config / ruta alternativa>
  - En validación: <regla especial o exención>
  - En pruebas: <impacto, columna afectada, handling>
- **Origen:** <normativo | aporte: [[CONTRIB-...]]>
- **Firmas / clientes donde se ha visto:**
  - [[FIRM-<slug>]]
  - [[PERSON-<slug>]]
- **Primera vez reportado:** <fecha + [[DEC-NNNN]]>
- **Frecuencia estimada:** <rara | ocasional | común en sector X>

#### EC-<SLUG>-002 — <título>

- ...

### Casos resueltos / obsoletos

#### EC-<SLUG>-NNN — <título> [resolved YYYY-MM-DD por DEC-NNNN]

- **Vigente hasta:** <fecha>
- **Razón de cierre:** <qué cambió>
- **Reemplazado por:** <EC-<SLUG>-MMM | N/A>

---

## 6. Notas de mantenimiento

<!-- Metadata sobre este archivo, no sobre el documento. -->

- Historia: seedeado <fecha> desde <fuente>. Primera validación por auditor: [[CONTRIB-...]]
- Archivo solo se modifica vía el pipeline de propuestas. Cambios a mano son bug de proceso.
- Ver [[04 - Change log]] para el histórico.
