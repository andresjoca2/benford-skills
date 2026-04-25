---
# ── Identidad ────────────────────────────────────────────────
id: DOC-disco-sua
type: document
audit: imss
name: "Disco de pago SUA"
aliases:
  - "Disco SUA"
  - "Archivo .SUA"
  - "Liquidación SUA"
  - "Liquidación IMSS en formato SUA"

# ── Estado ───────────────────────────────────────────────────
status: canonical
version: 2

# ── Emisión ──────────────────────────────────────────────────
emitted_by: "Patrón a través del Sistema Único de Autodeterminación (SUA)"
frequency: mensual
file_formats:
  - .sua
  - .SUA

# ── Obligatoriedad ───────────────────────────────────────────
mandatory_level: mandatory
blocks_audit_if_missing: true
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
  - "[[DOC-comprobante-pago-sua]]"
  - "[[DOC-cedula-determinacion-mensual]]"
  - "[[DOC-cedula_determinacion_bimestral]]"
  - "[[DOC-emision-ema]]"
  - "[[DOC-emision-eba]]"
---

# Disco de pago SUA

---

## 1. Overview

### ¿Qué es?

Es el archivo crudo `.sua` que el patrón procesa en el Sistema Único de
Autodeterminación para una liquidación específica. En los ejemplos confirmados,
el documento es texto ASCII en una sola línea larga y está compuesto por
registros de longitud fija de 295 bytes con tipos `02`, `03`, `04`, `05` y
`06`. El alcance observado del archivo es un solo `registro_patronal + periodo
+ folio_sua`.

### ¿Para qué sirve?

Sirve como fuente estructurada base del lado SUA del amarre. A partir de este
archivo se puede:

- traducir el contenido a una salida tabular equivalente a `Datos Empresa`,
  `Datos Trabajador`, `Datos Movimientos`, `Datos Sumarios` y
  `Datos Validación`
- reagrupar esa misma información en helpers operativos equivalentes a
  `PARTE A`, `PARTE B`, `PARTE C`, `PARTE D` y una hoja de amarre por folio
- consolidar ejercicios completos en acumulados operativos tipo ACUMSUA

### ¿Qué riesgo cubre?

Cubre el riesgo de reconstruir pagos, trabajadores, días y componentes
económicos solo desde PDFs o capturas manuales. Sin este archivo, el amarre
pierde la fuente estructurada original del patrón y queda mucho más expuesto a
errores de folio, periodo, población de trabajadores, interpretación de días y
desglose IMSS/RCV/INFONAVIT.

### Relación con otros documentos

El disco determina lo que el patrón liquidó en SUA. No demuestra por sí solo
que el pago ocurrió ni sustituye los documentos que validan el cierre del
amarre.

- [[DOC-comprobante-pago-sua]] — contraparte del amarre monetario: evidencia el
  pago efectivamente ejecutado
- [[DOC-cedula-determinacion-mensual]] — valida y explica la parte IMSS mensual
  que el disco resume estructuralmente
- [[DOC-cedula_determinacion_bimestral]] — valida y explica la parte RCV e
  INFONAVIT cuando el periodo es bimestral
- [[DOC-emision-ema]] — aporta referencia oficial para la capa mensual y la
  comparación de prima
- [[DOC-emision-eba]] — aporta referencia oficial para la capa bimestral

---

## 2. Contrato funcional

### Cómo lo reconoce el auditor

- Extensión `.sua` o `.SUA`
- Texto plano ASCII, sin hojas de Excel ni páginas PDF
- Una sola línea larga, sin saltos de línea visibles
- Registros fijos que arrancan con discriminadores `02`, `03`, `04`, `05` y
  `06`
- En la versión observada `W300`, todos los registros miden 295 bytes

### Variantes del nombre en la práctica

| Nombre usado      | Contexto                              | Firma / persona donde se oyó |
| ----------------- | ------------------------------------- | ---------------------------- |
| Disco de pago SUA | nombre operativo general              | insumos confirmados          |
| Disco SUA         | abreviación común                     | insumos confirmados          |
| Archivo `.SUA`    | referencia genérica al raw            | insumos confirmados          |
| Liquidación SUA   | cuando se enfatiza el folio liquidado | insumos confirmados          |

### Formato esperado

- **Tipo físico:** texto de ancho fijo
- **Encoding:** ASCII
- **Tamaño típico:** múltiplo de 295 bytes
- **Compresión habitual:** ninguna

### Alcance

- **Entidad cubierta:** un registro patronal
- **Periodo cubierto:** un periodo `YYYYMM`
- **Nivel de detalle:** cabecera patronal, detalle por trabajador, movimientos,
  sumario económico y validación de control

### Periodicidad

- **Frecuencia base:** mensual
- **Excepciones:** puede contener componentes bimestrales de RCV e INFONAVIT en
  meses pares, y puede existir más de un folio para el mismo RP por pagos
  complementarios o extemporáneos

### Nivel de obligatoriedad

- **Obligatoriedad:** mandatory
- **Condición si es conditional:** N/A
- **Qué pasa si el patrón no lo entrega:** se bloquea la reconstrucción
  estructurada del lado SUA y no debe improvisarse el amarre desde documentos
  secundarios

### Bloqueos si falta

- [[PRUEBA-IMSS-5.1]] — sin el disco no se puede reconstruir con trazabilidad el
  universo por folio: trabajadores, días y desglose económico base

### Fuente normativa

- Pendiente de citar. En los insumos confirmados no apareció una referencia
  normativa explícita; este bundle se seedó desde ejemplos reales y SOPs
  operativos confirmados.

---

## 3. Reglas de validación

### Convenciones

- **ID:** `VR-DSUA-NNN`
- **Severidad:** `error` | `warning` | `info`
- **Acción si falla:** `abortar` | `aislar-fila` | `marcar` | `continuar` |
  `reportar`
- **Nunca se borra una regla.** Si deja de aplicar, se mueve a deprecated.

### Reglas activas

#### VR-DSUA-001 — El archivo debe decodificar como ASCII de una sola línea

- **Status:** active
- **Regla:** el archivo debe poder leerse como ASCII y no debe tener saltos de
  línea significativos
- **Expresión:** `decode_ascii(file) = ok and line_count <= 1`
- **Severidad:** error
- **Acción si falla:** abortar
- **Origen:** aporte: insumos confirmados
- **Notas:** ambos ejemplos `.sua` confirmados cumplen este patrón

#### VR-DSUA-002 — La longitud del archivo debe ser compatible con el layout observado

- **Status:** active
- **Regla:** para la versión observada `W300`, el tamaño físico del archivo debe
  ser múltiplo de 295 bytes
- **Expresión:** `file_size_bytes % 295 = 0`
- **Severidad:** error
- **Acción si falla:** abortar
- **Origen:** aporte: insumos confirmados
- **Notas:** esta regla aplica solo al layout observado en esta corrida

#### VR-DSUA-003 — Debe existir el set mínimo de record types

- **Status:** active
- **Regla:** el stream debe contener exactamente un `02`, al menos un `03`,
  cero o más `04`, exactamente un `05` y exactamente un `06`
- **Expresión:** `count(02)=1 and count(03)>=1 and count(05)=1 and count(06)=1`
- **Severidad:** error
- **Acción si falla:** abortar
- **Origen:** aporte: insumos confirmados
- **Notas:** el `04` es opcional solo en cantidad; el layout sigue siendo válido
  aunque un archivo concreto no traiga movimientos

#### VR-DSUA-004 — Cabecera, sumario y validación deben referirse al mismo folio

- **Status:** active
- **Regla:** `registro_patronal`, `periodo` y `folio_sua` deben coincidir entre
  los registros `02`, `05` y `06`
- **Expresión:** `unique(02.reg_pat,05.reg_pat,06.reg_pat)=1 and unique(02.periodo,05.periodo,06.periodo)=1 and unique(02.folio,05.folio,06.folio)=1`
- **Severidad:** error
- **Acción si falla:** abortar
- **Origen:** aporte: insumos confirmados
- **Notas:** esta es la llave fuerte del documento

#### VR-DSUA-005 — El campo BYTES declarado debe coincidir con el tamaño real

- **Status:** active
- **Regla:** el tamaño declarado en `06.bytes_declarados` debe coincidir con el
  tamaño físico del archivo
- **Expresión:** `bytes_declarados = file_size_bytes`
- **Severidad:** error
- **Acción si falla:** marcar
- **Origen:** aporte: insumos confirmados
- **Notas:** validado con los tamaños observados `12685` y `88795`

#### VR-DSUA-006 — El total de trabajadores debe cuadrar contra los `03`

- **Status:** active
- **Regla:** cuando el `02` exponga `total_trabajadores`, ese total debe
  coincidir con el conteo de registros `03`
- **Expresión:** `02.total_trabajadores = count(03)`
- **Severidad:** warning
- **Acción si falla:** marcar
- **Origen:** aporte: insumos confirmados
- **Notas:** validado explícitamente en el ejemplo Nelly (`259`)

#### VR-DSUA-007 — Los slots vacíos del `04` no deben materializar rows

- **Status:** active
- **Regla:** al expandir un registro `04`, solo deben emitirse rows para slots
  con `nss` no vacío y no todo ceros
- **Expresión:** `emit(slot) iff trim(slot.nss) != '' and slot.nss != '00000000000'`
- **Severidad:** error
- **Acción si falla:** aislar-fila
- **Origen:** aporte: insumos confirmados
- **Notas:** cada `04` observado empaqueta hasta 7 slots de 38 bytes

#### VR-DSUA-008 — Los totales de control deben coincidir con el sumario económico

- **Status:** active
- **Regla:** `total_imss`, `total_rcv`, `total_aportacion` y
  `total_amortizacion` del `06` deben coincidir con el `05` dentro de una
  tolerancia de `0.01`
- **Expresión:** `abs(06.total_imss - 05.subtotal_imss - 05.actualizacion_imss - 05.recargos_imss) <= 0.01` y análogas para RCV e INFONAVIT
- **Severidad:** error
- **Acción si falla:** marcar
- **Origen:** aporte: insumos confirmados
- **Notas:** el `05` y el `06` representan planos distintos del mismo folio

### Reglas deprecated

Sin reglas deprecated en v2.

---

## 4. Uso en pruebas

### Roles que puede tener un documento en una prueba

- **input principal** — fuente estructurada base del lado SUA
- **amarre** — uno de los lados de la reconciliación contra cédulas y
  comprobantes
- **origen de parámetros** — folio, periodo, prima RT, trabajadores, días y
  componentes monetarios
- **referencia cruzada** — permite validar consistencia contra salidas
  traducidas o acumuladas

### Pruebas de METODOLOGÍA que lo usan

| Prueba METH | Rol | Qué alimenta | Pruebas IMSS afectadas | Origen |
|-------------|-----|--------------|------------------------|--------|
| Vaciado estructural de liquidaciones desde disco SUA | input principal | tablas canónicas del disco y materializaciones equivalentes a `PARTE A-D` | [[PRUEBA-IMSS-5.1]] | SOPs y ejemplos confirmados |
| Acumulado anual desde discos SUA | input principal | traducción a Excel y base consolidada equivalente a ACUMSUA | [[PRUEBA-IMSS-5.1]] | SOPs y ejemplos confirmados |

### Pruebas IMSS finales impactadas (transitive)

- [[PRUEBA-IMSS-5.1]] — Vaciado de liquidaciones

---

## 5. Casos límite y variantes

### Convenciones

- **ID:** `EC-DSUA-NNN`
- **Status:** `active` | `resolved` | `superseded`

### Casos activos

#### EC-DSUA-001 — Mes mensual sin bloques bimestrales materiales

- **Status:** active
- **Cuándo ocurre:** periodos mensuales donde RCV e INFONAVIT no aplican o se
  observan en cero
- **Cómo se reconoce:** `05` y `06` muestran `total_rcv = 0`,
  `total_aportacion = 0` y `total_amortizacion = 0`
- **Cómo se maneja:**
  - En el parser: el archivo sigue siendo válido
  - En validación: no debe dispararse error por ceros en los bloques
    bimestrales
  - En pruebas: la ausencia de bloque bimestral no invalida el amarre del
    periodo
- **Origen:** aporte: insumos confirmados
- **Firmas / clientes donde se ha visto:**
  - N/A en esta corrida
- **Primera vez reportado:** 2026-04-24
- **Frecuencia estimada:** común

#### EC-DSUA-002 — El mismo documento se consume en dos familias de salidas derivadas

- **Status:** active
- **Cuándo ocurre:** cuando un flujo traduce el `.sua` a cinco tablas nativas y
  otro lo reagrupa en capas equivalentes a `PARTE A-D` y amarre por folio
- **Cómo se reconoce:** existen workbooks auxiliares con hojas
  `Datos Empresa/Trabajador/Movimientos/Sumarios/Validación` o
  `PARTE A/B/C/D`
- **Cómo se maneja:**
  - En el parser: el input canónico sigue siendo el `.sua`
  - En validación: los Excel auxiliares se usan solo para contraste y reverse
    engineering
  - En pruebas: ambas familias de salidas deben poder derivarse del mismo
    contrato canónico
- **Origen:** aporte: insumos confirmados
- **Firmas / clientes donde se ha visto:**
  - N/A en esta corrida
- **Primera vez reportado:** 2026-04-24
- **Frecuencia estimada:** común

#### EC-DSUA-003 — El `04` empaqueta varios movimientos y mezcla semánticas de valor

- **Status:** active
- **Cuándo ocurre:** cuando un record `04` trae hasta 7 slots internos y el
  payload final del slot representa salario o días según el `tipo_movimiento`
- **Cómo se reconoce:** slots de 38 bytes con `nss + tipo + fecha + folio_incapacidad + valor_raw`
- **Cómo se maneja:**
  - En el parser: expandir a rows y preservar `valor_movimiento_raw`
  - En validación: interpretar `salario` o `días` según `tipo_movimiento` y
    presencia de `folio_incapacidad`
  - En pruebas: no asumir una semántica única del payload del movimiento
- **Origen:** aporte: insumos confirmados
- **Firmas / clientes donde se ha visto:**
  - N/A en esta corrida
- **Primera vez reportado:** 2026-04-24
- **Frecuencia estimada:** ocasional

#### EC-DSUA-004 — El folio es la unidad de control, no el mes consolidado

- **Status:** active
- **Cuándo ocurre:** cuando existen pagos complementarios o más de un folio para
  el mismo RP y periodo
- **Cómo se reconoce:** más de un archivo o más de un folio liquidado para el
  mismo `registro_patronal + periodo`
- **Cómo se maneja:**
  - En el parser: conservar `folio_sua` como parte de la PK
  - En validación: no consolidar varios folios como si fueran uno solo
  - En pruebas: cada folio debe poder amarrarse por separado
- **Origen:** aporte: insumos confirmados
- **Firmas / clientes donde se ha visto:**
  - N/A en esta corrida
- **Primera vez reportado:** 2026-04-24
- **Frecuencia estimada:** ocasional

### Casos resueltos / obsoletos

Sin casos resueltos en v2.

---

## 6. Notas de mantenimiento

- Historia: seedeado y corregido en 2026-04-24 desde ejemplos `.sua`,
  workbooks derivados y SOPs confirmados del set de esta corrida.
- El documento canónico describe el `.sua`; no canoniza columnas añadidas por
  papeles de trabajo ni hojas internas de helpers operativos.
- Archivo solo se modifica vía el pipeline de propuestas. Cambios a mano son bug
  de proceso.
- Ver [[04 - Change log]] para el histórico.
