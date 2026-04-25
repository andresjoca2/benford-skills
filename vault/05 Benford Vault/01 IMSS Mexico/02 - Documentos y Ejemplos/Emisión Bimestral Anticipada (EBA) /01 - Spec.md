---
# ── Identidad ────────────────────────────────────────────────
id: DOC-emision-eba
type: document
audit: imss
name: "Emisión Bimestral Anticipada (EBA)"
aliases:
  - "EBA"
  - "Emisión RCV"
  - "Emisión Bimestral Anticipada"

# ── Estado ───────────────────────────────────────────────────
status: canonical
version: 1

# ── Emisión ──────────────────────────────────────────────────
emitted_by: "IMSS a través del portal IDSE"
frequency: bimestral
file_formats:
  - .xls

# ── Obligatoriedad ───────────────────────────────────────────
mandatory_level: conditional
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
  - "[[DOC-emision-ema]]"
  - "[[DOC-disco-sua]]"
  - "[[DOC-cedula-determinacion-bimestral]]"
---

# Emisión Bimestral Anticipada (EBA)

---

## 1. Overview

### ¿Qué es?

Es el archivo que el IMSS pone a disposición del patrón cada bimestre a través del portal IDSE, con el cálculo anticipado de las aportaciones RCV (Retiro, Cesantía y Vejez) e INFONAVIT que el instituto determina para un registro patronal en ese bimestre. Contiene el detalle agregado y también el detalle por trabajador-movimiento que soporta ese agregado.

### ¿Para qué sirve?

Representa el cálculo oficial que el IMSS hizo de las aportaciones bimestrales RCV e INFONAVIT del patrón, basado en los movimientos afiliatorios registrados. Se usa para contrastar contra lo que el patrón efectivamente determinó y pagó en sus liquidaciones bimestrales, y para obtener información oficial de los acreditados y sus créditos de vivienda.

### ¿Qué riesgo cubre?

Detecta diferencias entre las aportaciones RCV e INFONAVIT que el IMSS reconoce como vigentes y las que el patrón efectivamente aplicó en su liquidación bimestral. También permite identificar discrepancias en acreditados de crédito de vivienda y en amortizaciones.

### Relación con otros documentos

- [[DOC-emision-ema]] — documento hermano: cubre la emisión mensual IMSS. Físicamente puede venir en el mismo archivo .xls que la EBA
- [[DOC-disco-sua]] — contraparte: el SUA es lo que el patrón declaró, la EBA es lo que el IMSS calculó para RCV e INFONAVIT
- [[DOC-cedula-determinacion-bimestral]] — cruzan en los componentes RCV e INFONAVIT bimestrales

---

## 2. Contrato funcional

### Cómo lo reconoce el auditor

- El archivo contiene una hoja de resumen con encabezado "Resumen Emisión RCV"
- Existe una hoja de movimientos con nombre patrón "Movimientos EBA [mes] [año]"
- Se descarga directamente del portal IDSE
- Cómo NO confundirlo con documentos parecidos: no es la cédula de determinación bimestral (la cédula la genera el patrón desde el SUA; la EBA la calcula el IMSS). La EMA es el hermano mensual que cubre solo IMSS.

### Variantes del nombre en la práctica

| Nombre usado | Contexto |
|--------------|----------|
| EBA | Nombre técnico más común |
| Emisión Bimestral Anticipada | Nombre completo |
| Emisión RCV | Encabezado del resumen |
| Emisión IDSE | A veces agrupa EMA y EBA en un solo nombre |

### Formato esperado

- **Tipo físico:** Excel (.xls binario, formato legacy)
- **Encoding:** N/A (formato binario)
- **Tamaño típico:** cientos de filas en hoja de movimientos
- **Compresión habitual:** ninguna
- **Nota:** el archivo .xls que contiene las hojas de EBA típicamente contiene también las hojas de EMA. La EBA se extrae solo de las hojas que le corresponden (sección RCV del resumen + movimientos EBA), ignorando el resto.

### Alcance

- **Entidad cubierta:** un registro patronal
- **Periodo cubierto:** un bimestre; en la práctica el archivo se emite referenciado al mes que cierra el bimestre
- **Nivel de detalle:** agregado patronal en hoja de resumen; por trabajador-movimiento en hoja de movimientos

### Periodicidad

- **Frecuencia base:** bimestral
- **Excepciones:** no se emite en meses que no cierran bimestre

### Nivel de obligatoriedad

- **Obligatoriedad:** conditional — obligatorio en meses que cierran bimestre; no existe en los demás
- **Qué pasa si el patrón no lo entrega:** en meses bimestrales, se bloquea el análisis comparativo de aportaciones RCV e INFONAVIT contra lo declarado por el patrón

### Bloqueos si falta

- [[PRUEBA-IMSS-5.1]] — en meses bimestrales, sin la EBA no puede obtenerse la referencia oficial del IMSS para RCV e INFONAVIT; el impacto exacto depende del flujo de uso

### Fuente normativa

<!-- PENDIENTE: no está citado explícitamente en los SOPs; requiere verificación normativa -->

---

## 3. Reglas de validación

### Convenciones

- **ID:** `VR-EBA-NNN` (tres dígitos, inmutable una vez asignada)
- **Severidad:** `error` | `warning` | `info`
- **Acción si falla:** `abortar` | `aislar-fila` | `marcar` | `continuar` | `reportar`

### Reglas activas

#### VR-EBA-001 — Registro Patronal presente en resumen

- **Status:** active
- **Regla:** el resumen debe exhibir un Registro Patronal legible y extraíble
- **Expresión:** `emision_eba_resumen.registro_patronal is not null`
- **Severidad:** error
- **Acción si falla:** abortar
- **Notas:** el RP se extrae de la sección IMSS del resumen (columna A), ya que la sección RCV no lo repite

#### VR-EBA-002 — Periodo Mensual presente y válido

- **Status:** active
- **Regla:** el resumen debe exhibir un Periodo Mensual interpretable
- **Expresión:** `emision_eba_resumen.periodo_año is not null and emision_eba_resumen.periodo_mes between 1 and 12`
- **Severidad:** error
- **Acción si falla:** abortar

#### VR-EBA-003 — Número de Propuesta RCV presente

- **Status:** active
- **Regla:** el Número de Propuesta RCV debe estar presente en el resumen
- **Expresión:** `emision_eba_resumen.numero_propuesta_rcv is not null`
- **Severidad:** error
- **Acción si falla:** abortar

#### VR-EBA-004 — Total RCV consistente con suma Infonavit + suma RCV

- **Status:** active
- **Regla:** el Total del resumen RCV debe coincidir con la suma de `suma_infonavit + suma_rcv` dentro de tolerancia 0.01
- **Expresión:** `abs(emision_eba_resumen.total_rcv - (emision_eba_resumen.suma_infonavit + emision_eba_resumen.suma_rcv)) <= 0.01`
- **Severidad:** error
- **Acción si falla:** marcar

#### VR-EBA-005 — Suma de componentes Infonavit consistente

- **Status:** active
- **Regla:** `suma_infonavit` debe coincidir con `aportacion_patronal_sc_infonavit + aportacion_patronal_cc_det_mas_amort` dentro de tolerancia 0.01
- **Expresión:** `abs(emision_eba_resumen.suma_infonavit - (aportacion_patronal_sc_infonavit + aportacion_patronal_cc_det_mas_amort)) <= 0.01`
- **Severidad:** error
- **Acción si falla:** marcar

#### VR-EBA-006 — Suma de componentes RCV consistente

- **Status:** active
- **Regla:** `suma_rcv` debe coincidir con `retiro + cesantia_vejez_patronal + cesantia_vejez_obrero` dentro de tolerancia 0.01
- **Expresión:** `abs(emision_eba_resumen.suma_rcv - (retiro + cesantia_vejez_patronal + cesantia_vejez_obrero)) <= 0.01`
- **Severidad:** error
- **Acción si falla:** marcar

#### VR-EBA-007 — Total Cotizantes RCV coincide con conteo de movimientos únicos

- **Status:** active
- **Regla:** el Total Cotizantes RCV debe coincidir con la cantidad de NSS únicos en movimientos EBA, excluyendo movimientos de baja
- **Expresión:** `emision_eba_resumen.total_cotizantes_rcv == count_distinct(movimientos_eba.nss where tipo_movimiento != baja)`
- **Severidad:** warning
- **Acción si falla:** marcar
- **Notas:** <!-- PENDIENTE: confirmar qué tipos de movimiento se excluyen del conteo de cotizantes -->

#### VR-EBA-008 — Coherencia de campos de crédito

- **Status:** active
- **Regla:** en movimientos EBA, si existe `numero_credito` no nulo, entonces `tipo_descuento` y `valor_descuento` también deben estar presentes
- **Expresión:** `numero_credito is null or (tipo_descuento is not null and valor_descuento is not null)`
- **Severidad:** warning
- **Acción si falla:** marcar

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
| [[PRUEBA-METH-amarre-liquidaciones-por-folio]] | referencia cruzada | validación de cotizantes y aportaciones RCV/INFONAVIT contra lo declarado en SUA bimestral |

### Pruebas IMSS finales impactadas (transitive)

- [[PRUEBA-IMSS-5.1]] — Vaciado de liquidaciones

---

## 5. Casos límite y variantes

### Convenciones

- **ID:** `EC-EBA-NNN` (tres dígitos, inmutable)
- **Status:** `active` | `resolved` | `superseded`

### Casos activos

#### EC-EBA-001 — Archivo físico compartido con EMA

- **Status:** active
- **Cuándo ocurre:** en meses que cierran bimestre, el archivo .xls del portal IDSE contiene tanto las hojas de EMA como las de EBA
- **Cómo se reconoce:** el archivo tiene 3 hojas (resumen, Movimientos EMA, Movimientos EBA); la hoja de resumen tiene 5 columnas incluyendo sección "Resumen Emisión RCV" (columnas D-E)
- **Cómo se maneja:**
  - En el parser: el parser de EBA extrae solo la sección RCV del resumen (columnas D-E) y la hoja de Movimientos EBA, ignorando el resto
  - En validación: sin impacto
  - En pruebas: sin impacto; cada documento se procesa de forma independiente

#### EC-EBA-002 — Columnas agregadas por auditor en papel de trabajo

- **Status:** active
- **Cuándo ocurre:** el archivo original del portal IDSE fue usado como papel de trabajo y el auditor agregó columnas al final de la hoja de movimientos o columnas comparativas en el resumen
- **Cómo se reconoce:** la hoja de movimientos tiene más de 18 columnas; la hoja de resumen tiene columnas adicionales más allá de las canónicas
- **Cómo se maneja:**
  - En el parser: leer solo las columnas canónicas por posición; ignorar columnas adicionales
  - En validación: sin impacto
  - En pruebas: sin impacto

#### EC-EBA-003 — Celda Nombre puede venir vacía o poblada

- **Status:** active
- **Cuándo ocurre:** algunos patrones descargan el archivo con nombres de trabajadores poblados, otros con la columna vacía
- **Cómo se reconoce:** columna Nombre (pos 1) en la hoja de movimientos alternadamente vacía o con texto
- **Cómo se maneja:**
  - En el parser: nombre queda nullable
  - En validación: sin impacto; el NSS es el identificador del trabajador
  - En pruebas: sin impacto

#### EC-EBA-004 — Movimiento sin Fecha del Movimiento

- **Status:** active
- **Cuándo ocurre:** los movimientos de tipo "permanencia" o equivalentes aparecen con guión en el campo Fecha del Movimiento
- **Cómo se reconoce:** el valor del campo Fecha del Movimiento es `-` en vez de una fecha
- **Cómo se maneja:**
  - En el parser: si el valor es `-`, fecha_movimiento queda nula
  - En validación: sin impacto
  - En pruebas: sin impacto

#### EC-EBA-005 — Campos de crédito INFONAVIT presentes o ausentes

- **Status:** active
- **Cuándo ocurre:** las columnas `Tipo de Descuento`, `Valor de Descuento` y `Número de Crédito` solo traen datos cuando el trabajador tiene crédito INFONAVIT activo
- **Cómo se reconoce:** en trabajadores sin crédito, estas columnas aparecen con `-` o vacías; en trabajadores con crédito, aparecen con valores (ej: `CF`, `5,706.91`, `02619106373`)
- **Cómo se maneja:**
  - En el parser: las tres columnas son nullable; si el valor es `-`, null
  - En validación: VR-EBA-008 verifica coherencia entre los tres campos
  - En pruebas: sin impacto directo en los amarres agregados

#### EC-EBA-006 — Amortización cero en trabajador sin crédito

- **Status:** active
- **Cuándo ocurre:** los trabajadores sin crédito INFONAVIT aparecen con amortización en 0.00
- **Cómo se reconoce:** `amortizacion == 0` junto con `numero_credito is null`
- **Cómo se maneja:**
  - En el parser: cero es valor válido
  - En validación: sin impacto
  - En pruebas: sin impacto

### Casos resueltos / obsoletos

<!-- Sin casos resueltos en v1 -->

---

## 6. Notas de mantenimiento

- Historia: seedeado 2026-04-22 desde SOPs de la prueba 5.1 y ejemplos reales de archivos de emisión IDSE de distintos periodos y patrones.
- Archivo solo se modifica vía el pipeline de propuestas.
- Ver [[04 - Change log]] para el histórico.
