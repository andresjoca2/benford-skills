---
# ── Identidad ────────────────────────────────────────────────
id: DOC-comprobante-pago-sua
type: document
audit: imss
name: "Comprobante bancario de pago SUA"
aliases:
  - "Recibo bancario de pago SUA"
  - "Comprobante de operación SUA"
  - "Pago SUA - SIPARE"
  - "Comprobante de pago"

# ── Estado ───────────────────────────────────────────────────
status: canonical
version: 1

# ── Emisión ──────────────────────────────────────────────────
emitted_by: "Institución bancaria que procesa el pago SUA del patrón"
frequency: mensual
file_formats:
  - .pdf

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
  - "[[DOC-disco-sua]]"
  - "[[DOC-cedula-determinacion-mensual]]"
  - "[[DOC-cedula-determinacion-bimestral]]"
---

# Comprobante bancario de pago SUA

---

## 1. Overview

### ¿Qué es?

Es el comprobante que emite el banco cuando el patrón paga al IMSS las cuotas obrero-patronales, aportaciones al RCV (Retiro, Cesantía y Vejez) y al INFONAVIT, generadas previamente desde el Sistema Único de Autodeterminación (SUA). Es, en corto, la prueba de que el dinero efectivamente salió de la cuenta del patrón hacia el instituto.

### ¿Para qué sirve?

Permite confirmar que un pago determinado por el patrón en su liquidación SUA fue ejecutado, por qué monto, en qué fecha y por cuál institución bancaria. Sin este documento, el amarre de la prueba queda apoyado únicamente en la autodeterminación del patrón, sin evidencia externa de que el pago ocurrió.

### ¿Qué riesgo cubre?

Cubre el riesgo de que exista una liquidación SUA determinada pero no pagada, pagada parcialmente, pagada fuera del periodo correspondiente, o pagada por un monto distinto al determinado. También permite detectar pagos complementarios o extemporáneos que deben tratarse como eventos separados en el amarre.

### Relación con otros documentos

Este documento es la contraparte externa de lo que el patrón declaró en su disco SUA y en sus cédulas de determinación. Se amarra contra esos documentos a nivel de registro patronal, periodo e importe total.

- [[DOC-disco-sua]] — contraparte del amarre: el disco determina lo que se debe pagar, el comprobante evidencia lo que efectivamente se pagó
- [[DOC-cedula-determinacion-mensual]] — misma información determinada para la parte IMSS mensual
- [[DOC-cedula-determinacion-bimestral]] — misma información determinada para la parte RCV e INFONAVIT bimestral

---

## 2. Contrato funcional

### Cómo lo reconoce el auditor

- Encabezado típico: contiene leyendas como "Recibo Bancario de Pago S.U.A", "Comprobante de operación", "Pago SUA - SIPARE" o equivalentes
- Emisor identificable por: logotipo del banco, razón social bancaria, identificadores de plataforma (ej: "BancaNet Empresarial")
- Debe incluir explícitamente el Registro Patronal, el periodo de pago y el desglose de importes IMSS, RCV y vivienda
- Cómo NO confundirlo con documentos parecidos: las cédulas de determinación (mensual y bimestral) son documentos emitidos por el patrón desde el SUA, no por el banco, y contienen detalle por trabajador; el comprobante bancario es la confirmación del pago, sin detalle por trabajador

### Variantes del nombre en la práctica

| Nombre usado | Contexto |
|--------------|----------|
| Comprobante bancario de pago SUA | Nombre canónico en SOPs |
| Recibo Bancario de Pago S.U.A Línea de Captura | Encabezado típico de algunos bancos |
| Comprobante de operación | Encabezado alterno |
| Pago SUA - SIPARE | Encabezado típico cuando el pago se procesa vía SIPARE |
| SUA [mes] [año] | Nombre de archivo común en papeles de trabajo |

### Formato esperado

- **Tipo físico:** PDF nativo (generado por la plataforma bancaria)
- **Encoding:** N/A (documento con texto extraíble)
- **Tamaño típico:** 1 página
- **Compresión habitual:** ninguna

### Alcance

- **Entidad cubierta:** un registro patronal
- **Periodo cubierto:** un pago correspondiente a un periodo (mensual IMSS o bimestral RCV/INFONAVIT)
- **Nivel de detalle:** agregado por registro patronal y periodo; sin desglose por trabajador

### Periodicidad

- **Frecuencia base:** mensual para componente IMSS, bimestral para componente RCV/INFONAVIT
- **Excepciones:** pagos complementarios y pagos extemporáneos generan comprobantes adicionales que deben tratarse como eventos de pago independientes

### Nivel de obligatoriedad

- **Obligatoriedad:** mandatory
- **Qué pasa si el patrón no lo entrega:** debilita o bloquea el amarre del pago en la prueba, según la metodología aplicada; en flujos donde el comprobante es pilar del amarre, la fila no puede cerrarse

### Bloqueos si falta

- [[PRUEBA-IMSS-5.1]] — en los flujos donde el amarre se construye contra el comprobante, sin este documento no puede validarse que el pago se ejecutó por el importe determinado; en flujos donde el amarre es contable-operativo, su ausencia debilita la trazabilidad del pago sin bloquear totalmente la prueba

### Fuente normativa

<!-- PENDIENTE: no está citado explícitamente en los SOPs; requiere verificación normativa -->

---

## 3. Reglas de validación

### Convenciones

- **ID:** `VR-CPSUA-NNN` (tres dígitos, inmutable una vez asignada)
- **Severidad:** `error` | `warning` | `info`
- **Acción si falla:** `abortar` | `aislar-fila` | `marcar` | `continuar` | `reportar`
- **Nunca se borra una regla.** Si deja de aplicar, se marca `status: deprecated` con su DEC-NNNN correspondiente.

### Reglas activas

#### VR-CPSUA-001 — Registro Patronal presente y con formato válido

- **Status:** active
- **Regla:** el comprobante debe exhibir un Registro Patronal legible y extraíble
- **Expresión:** `registro_patronal is not null and registro_patronal matches patrón alfanumérico IMSS`
- **Severidad:** error
- **Acción si falla:** aislar-fila
- **Origen:** operativo: el RP es llave de cruce con todos los demás documentos
- **Notas:** el formato puede venir con o sin guiones (ej: `E53-55462-10-5` o `E5355462105`); ambos son válidos si normalizan al mismo valor

#### VR-CPSUA-002 — Periodo de pago presente e interpretable

- **Status:** active
- **Regla:** el comprobante debe exhibir un periodo de pago identificable como mes/año
- **Expresión:** `periodo is not null and periodo resuelve a (mes, año) válidos`
- **Severidad:** error
- **Acción si falla:** aislar-fila
- **Origen:** operativo: sin periodo no puede cruzarse contra la liquidación correspondiente
- **Notas:** el formato varía (ej: `Mes 02 Año 2024`, `202412`, `12-2024`); todos deben normalizarse a (mes, año)

#### VR-CPSUA-003 — Importe Total presente y mayor a cero

- **Status:** active
- **Regla:** el importe total del comprobante debe estar presente y ser un número positivo
- **Expresión:** `importe_total is not null and importe_total > 0`
- **Severidad:** error
- **Acción si falla:** aislar-fila
- **Origen:** operativo: es el valor que cuadra contra Total a Pagar en el amarre
- **Notas:** puede venir con o sin separador de miles y con o sin símbolo de moneda; todos deben normalizarse a decimal

#### VR-CPSUA-004 — Importe Total consistente con suma de componentes

- **Status:** active
- **Regla:** cuando los componentes IMSS, RCV, Vivienda y ACV están presentes, su suma debe coincidir con el Importe Total dentro de una tolerancia de 0.01
- **Expresión:** `abs((importe_imss + importe_rcv + importe_vivienda + importe_acv) - importe_total) <= 0.01`
- **Severidad:** error
- **Acción si falla:** marcar
- **Origen:** operativo: detecta errores de parseo o comprobantes con desglose inconsistente
- **Notas:** la tolerancia de 0.01 absorbe redondeos estándar

#### VR-CPSUA-005 — Fecha de pago presente

- **Status:** active
- **Regla:** el comprobante debe exhibir una fecha en que se ejecutó o aplicó el pago
- **Expresión:** `fecha_pago is not null and es fecha válida`
- **Severidad:** error
- **Acción si falla:** aislar-fila
- **Origen:** operativo: necesaria para identificar pagos extemporáneos

#### VR-CPSUA-006 — Folio SUA, cuando existe, con formato numérico

- **Status:** active
- **Regla:** si el comprobante incluye folio SUA, debe ser una cadena numérica
- **Expresión:** `folio_sua is null or folio_sua matches ^[0-9]+$`
- **Severidad:** warning
- **Acción si falla:** marcar
- **Origen:** operativo: no todos los formatos bancarios incluyen el folio, pero cuando aparece es llave de amarre con el disco SUA

#### VR-CPSUA-007 — Línea de captura presente

- **Status:** active
- **Regla:** el comprobante debe incluir la línea de captura utilizada para el pago
- **Expresión:** `linea_captura is not null and length(linea_captura) > 0`
- **Severidad:** warning
- **Acción si falla:** marcar
- **Origen:** operativo: identificador único del pago ante el IMSS

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
| [[PRUEBA-METH-amarre-liquidaciones-por-folio]] | amarre | Importe Comprobante que cuadra contra Total a Pagar del disco SUA, a nivel folio |
| [[PRUEBA-METH-conciliacion-contable-operativa]] | support | trazabilidad del pago dentro del concentrado operativo por periodo y RP |

### Pruebas IMSS finales impactadas (transitive)

- [[PRUEBA-IMSS-5.1]] — Vaciado de liquidaciones

---

## 5. Casos límite y variantes

### Convenciones

- **ID:** `EC-CPSUA-NNN` (tres dígitos, inmutable)
- **Status:** `active` | `resolved` | `superseded`

### Casos activos

#### EC-CPSUA-001 — Variación de formato entre bancos

- **Status:** active
- **Cuándo ocurre:** el patrón usa distintas instituciones bancarias, o cambia de banco entre periodos
- **Cómo se reconoce:** el layout visual, las etiquetas de los campos y el orden de la información difieren; sin embargo, los campos de negocio relevantes (RP, periodo, importes, fecha) siempre están presentes
- **Cómo se maneja:**
  - En el parser: se requiere detección del banco emisor y selección de la ruta de extracción correspondiente
  - En validación: las reglas de negocio son las mismas para todos los bancos
  - En pruebas: sin impacto una vez normalizado al schema

#### EC-CPSUA-002 — Folio SUA ausente en el comprobante

- **Status:** active
- **Cuándo ocurre:** algunos formatos bancarios no incluyen el folio SUA en el comprobante
- **Cómo se reconoce:** el campo folio no aparece o viene vacío
- **Cómo se maneja:**
  - En el parser: folio queda nullable
  - En validación: VR-CPSUA-006 permite el caso
  - En pruebas: el amarre se realiza por RP + periodo + importe cuando el folio no está disponible

#### EC-CPSUA-003 — Pago complementario

- **Status:** active
- **Cuándo ocurre:** existe un comprobante adicional para el mismo RP y periodo, por un monto distinto al de la liquidación original
- **Cómo se reconoce:** aparece más de un comprobante con la misma combinación RP + periodo
- **Cómo se maneja:**
  - En el parser: sin impacto; cada comprobante se parsea independiente
  - En validación: sin impacto a nivel documento
  - En pruebas: cada comprobante genera una fila nueva en el amarre; no se suman ni se consolidan a la fila original

#### EC-CPSUA-004 — Pago extemporáneo

- **Status:** active
- **Cuándo ocurre:** la fecha de pago del comprobante es posterior a la fecha límite del periodo liquidado
- **Cómo se reconoce:** el periodo de pago declarado en el comprobante no coincide con el mes calendario de la fecha de pago
- **Cómo se maneja:**
  - En el parser: sin impacto; se captura tanto el periodo liquidado como la fecha de pago
  - En validación: sin impacto
  - En pruebas: la fila del amarre se asocia al periodo liquidado, no al mes de pago

#### EC-CPSUA-005 — Importe IMSS en cero

- **Status:** active
- **Cuándo ocurre:** comprobantes correspondientes a periodos donde solo se paga la parte bimestral (RCV e INFONAVIT)
- **Cómo se reconoce:** el importe IMSS aparece como 0.00 mientras RCV, Vivienda y ACV tienen valores positivos
- **Cómo se maneja:**
  - En el parser: sin impacto; cero es un valor válido
  - En validación: VR-CPSUA-004 sigue cuadrando porque la suma de componentes iguala al total
  - En pruebas: la fila se trata como pago exclusivamente bimestral

#### EC-CPSUA-006 — Importe total sin separador de miles

- **Status:** active
- **Cuándo ocurre:** algunos formatos bancarios imprimen el importe total en formato plano (ej: `1448010.18` en vez de `$1,448,010.18`)
- **Cómo se reconoce:** el valor numérico no incluye comas ni símbolo de moneda
- **Cómo se maneja:**
  - En el parser: la transformación de limpieza debe contemplar ambos formatos
  - En validación: sin impacto una vez normalizado
  - En pruebas: sin impacto

### Casos resueltos / obsoletos

<!-- Sin casos resueltos en v1 -->

---

## 6. Notas de mantenimiento

- Historia: seedeado 2026-04-22 desde SOPs de la prueba 5.1 y ejemplos de comprobantes bancarios reales.
- Archivo solo se modifica vía el pipeline de propuestas. Cambios a mano son bug de proceso.
- Ver [[04 - Change log]] para el histórico.
