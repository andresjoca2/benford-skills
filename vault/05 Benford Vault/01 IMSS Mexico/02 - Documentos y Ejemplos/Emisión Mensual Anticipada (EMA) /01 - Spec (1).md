---
# ── Identidad ────────────────────────────────────────────────
id: DOC-emision-ema
type: document
audit: imss
name: "Emisión Mensual Anticipada (EMA)"
aliases:
  - "EMA"
  - "Emisión IMSS"
  - "Emisión Mensual Anticipada"

# ── Estado ───────────────────────────────────────────────────
status: canonical
version: 1

# ── Emisión ──────────────────────────────────────────────────
emitted_by: "IMSS a través del portal IDSE"
frequency: mensual
file_formats:
  - .xls

# ── Obligatoriedad ───────────────────────────────────────────
mandatory_level: mandatory
blocks_audit_if_missing: false
blocks_pruebas:
  - PRUEBA-IMSS-5.1

# ── Validación ───────────────────────────────────────────────
validation_severity_levels: [error, warning, info]

# ── Trazabilidad ─────────────────────────────────────────────
last_decision: null
contributed_by: []

# ── Links internos ───────────────────────────────────────────
related_schema: "[[02 - Schema]]"
related_parser: "[[03 - Parser config]]"
related_changelog: "[[04 - Change log]]"
related_docs:
  - "[[DOC-emision-eba]]"
  - "[[DOC-disco-sua]]"
  - "[[DOC-cedula-determinacion-mensual]]"
  - "[[DOC-declaracion-prima-riesgo-trabajo]]"
---

# Emisión Mensual Anticipada (EMA)

---

## 1. Overview

### ¿Qué es?

Es el archivo que el IMSS pone a disposición del patrón cada mes a través del portal IDSE, con el cálculo anticipado de las cuotas IMSS que el instituto determina para un registro patronal en ese periodo. Contiene el detalle agregado y también el detalle por trabajador-movimiento que soporta ese agregado.

### ¿Para qué sirve?

Representa el cálculo oficial que el IMSS hizo de las cuotas IMSS mensuales del patrón, basado en los movimientos afiliatorios registrados. Se usa principalmente para obtener la **prima de riesgo emitida por el IMSS**, que se contrasta contra la prima que el patrón efectivamente usó en su pago. También sirve para cruzar cotizantes y días cotizados contra lo declarado por el patrón en su SUA.

### ¿Qué riesgo cubre?

Detecta diferencias entre la prima de riesgo que el IMSS reconoce como vigente (emitida por IDSE) y la prima que el patrón efectivamente aplicó en su liquidación. También permite identificar discrepancias en cotizantes y días cotizados entre lo que el IMSS tiene registrado y lo que el patrón declaró.

### Relación con otros documentos

- [[DOC-emision-eba]] — documento hermano: cubre la emisión bimestral de RCV e INFONAVIT. Físicamente puede venir en el mismo archivo .xls que la EMA cuando el mes cierra bimestre
- [[DOC-disco-sua]] — contraparte: el SUA es lo que el patrón declaró, la EMA es lo que el IMSS calculó para IMSS mensual
- [[DOC-cedula-determinacion-mensual]] — cruzan en los componentes IMSS mensuales
- [[DOC-declaracion-prima-riesgo-trabajo]] — la prima declarada por el patrón debería ser la misma que la emitida por IDSE en la EMA

---

## 2. Contrato funcional

### Cómo lo reconoce el auditor

- El archivo contiene una hoja de resumen con encabezado "Resumen Emisión IMSS"
- Existe una hoja de movimientos con nombre patrón "Movimientos EMA [mes] [año]"
- Se descarga directamente del portal IDSE
- Cómo NO confundirlo con documentos parecidos: no es la cédula de determinación mensual (la cédula la genera el patrón desde el SUA; la EMA la calcula el IMSS). Tampoco es el disco SUA. La EBA es el hermano bimestral que cubre RCV/INFONAVIT.

### Variantes del nombre en la práctica

| Nombre usado | Contexto |
|--------------|----------|
| EMA | Nombre técnico más común |
| Emisión Mensual Anticipada | Nombre completo |
| Emisión IMSS | Encabezado del resumen |
| Emisión IDSE | A veces agrupa EMA y EBA en un solo nombre |

### Formato esperado

- **Tipo físico:** Excel (.xls binario, formato legacy)
- **Encoding:** N/A (formato binario)
- **Tamaño típico:** cientos de filas en hoja de movimientos
- **Compresión habitual:** ninguna
- **Nota:** el archivo .xls puede contener también las hojas de EBA cuando el mes cierra bimestre. La EMA se extrae solo de las hojas que le corresponden (resumen IMSS + movimientos EMA), ignorando el resto.

### Alcance

- **Entidad cubierta:** un registro patronal
- **Periodo cubierto:** un mes
- **Nivel de detalle:** agregado patronal en hoja de resumen; por trabajador-movimiento en hoja de movimientos

### Periodicidad

- **Frecuencia base:** mensual
- **Excepciones:** ninguna; se emite todos los meses

### Nivel de obligatoriedad

- **Obligatoriedad:** mandatory
- **Qué pasa si el patrón no lo entrega:** se bloquea el análisis comparativo de prima de riesgo y se pierde la referencia oficial del IMSS para cotizantes y días cotizados

### Bloqueos si falta

- [[PRUEBA-IMSS-5.1]] — sin la EMA no puede obtenerse la prima emitida por IDSE necesaria para el análisis comparativo de primas; el impacto exacto depende del flujo de uso

### Fuente normativa

<!-- PENDIENTE: no está citado explícitamente en los SOPs; requiere verificación normativa -->

---

## 3. Reglas de validación

### Convenciones

- **ID:** `VR-EMA-NNN` (tres dígitos, inmutable una vez asignada)
- **Severidad:** `error` | `warning` | `info`
- **Acción si falla:** `abortar` | `aislar-fila` | `marcar` | `continuar` | `reportar`

### Reglas activas

#### VR-EMA-001 — Registro Patronal presente en resumen

- **Status:** active
- **Regla:** la hoja de resumen debe exhibir un Registro Patronal legible y extraíble
- **Expresión:** `emision_ema_resumen.registro_patronal is not null`
- **Severidad:** error
- **Acción si falla:** abortar

#### VR-EMA-002 — Periodo Mensual presente y válido

- **Status:** active
- **Regla:** la hoja de resumen debe exhibir un Periodo Mensual en formato MM/AAAA interpretable
- **Expresión:** `emision_ema_resumen.periodo_año is not null and emision_ema_resumen.periodo_mes between 1 and 12`
- **Severidad:** error
- **Acción si falla:** abortar

#### VR-EMA-003 — Prima de Riesgos de Trabajo presente

- **Status:** active
- **Regla:** la prima de riesgos de trabajo debe estar presente en el resumen
- **Expresión:** `emision_ema_resumen.prima_riesgo_trabajo is not null and emision_ema_resumen.prima_riesgo_trabajo > 0`
- **Severidad:** error
- **Acción si falla:** aislar-fila
- **Origen:** operativo: es el valor principal que se usa para comparación contra RT del pago

#### VR-EMA-004 — Total IMSS consistente con suma de componentes

- **Status:** active
- **Regla:** el Total IMSS del resumen debe coincidir con la suma de los componentes IMSS dentro de tolerancia 0.01
- **Expresión:** `abs(emision_ema_resumen.total_imss - suma(componentes_imss)) <= 0.01`
- **Severidad:** error
- **Acción si falla:** marcar

#### VR-EMA-005 — Total Cotizantes IMSS coincide con conteo de movimientos únicos

- **Status:** active
- **Regla:** el Total Cotizantes IMSS del resumen debe coincidir con la cantidad de NSS únicos en la hoja de movimientos, excluyendo movimientos de baja
- **Expresión:** `emision_ema_resumen.total_cotizantes_imss == count_distinct(movimientos_ema.nss where tipo_movimiento != baja)`
- **Severidad:** warning
- **Acción si falla:** marcar
- **Notas:** <!-- PENDIENTE: confirmar qué tipos de movimiento se excluyen del conteo de cotizantes -->

#### VR-EMA-006 — Suma de Días en movimientos consistente con Días del resumen

- **Status:** active
- **Regla:** la suma de la columna Días en movimientos debe coincidir con el campo Días del resumen
- **Expresión:** `abs(emision_ema_resumen.dias - sum(movimientos_ema.dias)) <= 1`
- **Severidad:** warning
- **Acción si falla:** marcar
- **Notas:** tolerancia 1 por posibles ajustes de redondeo o movimientos especiales

### Reglas deprecated

<!-- Sin reglas deprecated en v1 -->

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
| [[PRUEBA-METH-analisis-prima-riesgo]] | origen de parámetros | prima EMA que se contrasta contra RT del pago y AUD de auditoría |
| [[PRUEBA-METH-amarre-liquidaciones-por-folio]] | referencia cruzada | validación de cotizantes y días contra lo declarado en SUA |

### Pruebas IMSS finales impactadas (transitive)

- [[PRUEBA-IMSS-5.1]] — Vaciado de liquidaciones

---

## 5. Casos límite y variantes

### Convenciones

- **ID:** `EC-EMA-NNN` (tres dígitos, inmutable)
- **Status:** `active` | `resolved` | `superseded`

### Casos activos

#### EC-EMA-001 — Archivo físico compartido con EBA

- **Status:** active
- **Cuándo ocurre:** cuando el mes cierra bimestre, el mismo archivo .xls contiene tanto las hojas de EMA como las de EBA
- **Cómo se reconoce:** el archivo tiene 3 hojas (resumen, Movimientos EMA, Movimientos EBA); la hoja de resumen tiene 5 columnas incluyendo sección "Resumen Emisión RCV"
- **Cómo se maneja:**
  - En el parser: el parser de EMA extrae solo la sección IMSS del resumen (columnas A-B) y la hoja de Movimientos EMA, ignorando el resto
  - En validación: sin impacto
  - En pruebas: sin impacto; cada documento se procesa de forma independiente

#### EC-EMA-002 — Archivo físico dedicado solo a EMA

- **Status:** active
- **Cuándo ocurre:** cuando el mes no cierra bimestre, el archivo .xls contiene solo las hojas de EMA
- **Cómo se reconoce:** el archivo tiene 2 hojas (resumen y Movimientos EMA); la hoja de resumen tiene 2 columnas
- **Cómo se maneja:**
  - En el parser: igual que el caso anterior, el parser extrae solo la sección IMSS
  - En validación: sin impacto
  - En pruebas: sin impacto

#### EC-EMA-003 — Columnas agregadas por auditor en papel de trabajo

- **Status:** active
- **Cuándo ocurre:** el archivo original del portal IDSE fue usado como papel de trabajo y el auditor agregó columnas al final de la hoja de movimientos (ej: `sua`, `dif`, `ausencia`, `incapacidad`) o columnas comparativas en el resumen
- **Cómo se reconoce:** la hoja de movimientos tiene más columnas que el contrato canónico (ej: 23 en vez de 19); la hoja de resumen tiene más de 2 columnas
- **Cómo se maneja:**
  - En el parser: leer solo las columnas canónicas por posición; ignorar columnas adicionales
  - En validación: sin impacto
  - En pruebas: sin impacto

#### EC-EMA-004 — Celda Nombre puede venir vacía o poblada

- **Status:** active
- **Cuándo ocurre:** algunos patrones descargan el archivo con nombres de trabajadores poblados, otros con la columna vacía
- **Cómo se reconoce:** columna Nombre (pos 1) en la hoja de movimientos alternadamente vacía o con texto
- **Cómo se maneja:**
  - En el parser: nombre queda nullable
  - En validación: sin impacto; el NSS es el identificador del trabajador
  - En pruebas: sin impacto

#### EC-EMA-005 — Movimiento sin Fecha del Movimiento

- **Status:** active
- **Cuándo ocurre:** los movimientos de tipo "permanencia" o equivalentes aparecen con guión en el campo Fecha del Movimiento
- **Cómo se reconoce:** el valor del campo Fecha del Movimiento es `-` en vez de una fecha
- **Cómo se maneja:**
  - En el parser: si el valor es `-`, fecha_movimiento queda nula
  - En validación: sin impacto
  - En pruebas: sin impacto

### Casos resueltos / obsoletos

<!-- Sin casos resueltos en v1 -->

---

## 6. Notas de mantenimiento

- Historia: seedeado 2026-04-22 desde SOPs de la prueba 5.1 y ejemplos reales de archivos de emisión IDSE de distintos periodos y patrones.
- Archivo solo se modifica vía el pipeline de propuestas.
- Ver [[04 - Change log]] para el histórico.
