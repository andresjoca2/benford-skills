---
# ── Identidad ────────────────────────────────────────────────
id: DOC-cedula_determinacion_bimestral
type: document
audit: imss
name: "Cédula de Determinación Bimestral de Cuotas Obrero-Patronales, Aportaciones y Amortizaciones"
aliases:
  - "Cédula de determinación bimestral"
  - "Cédula RCV-INFONAVIT"
  - "CDB"

# ── Estado ───────────────────────────────────────────────────
status: canonical
version: 1

# ── Emisión ──────────────────────────────────────────────────
emitted_by: "IMSS (Instituto Mexicano del Seguro Social) — ramo RCV"
frequency: bimestral
file_formats:
  - .pdf

# ── Obligatoriedad ───────────────────────────────────────────
mandatory_level: mandatory
blocks_audit_if_missing: true
blocks_pruebas:
  - PRUEBA-IMSS-051

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
  - DOC-cedula_determinacion_mensual
  - DOC-comprobante_pago_sua
---

# Cédula de Determinación Bimestral (RCV e INFONAVIT)

---

## 1. Overview

### ¿Qué es?

La Cédula de Determinación Bimestral es un documento oficial emitido por el IMSS que consolida los cálculos del patrón para el ramo de Cesantía, Vejez y Jubilación (RCV) y las aportaciones patronales al INFONAVIT (vivienda) durante un bimestre calendario. Resume los importes a pagar separados por componente: retiro, cesantía y vejez (patronal y obrera), aportación de vivienda con y sin crédito, y amortizaciones de créditos vigentes.

### ¿Para qué sirve?

Permite al auditor validar que los importes pagados por RCV e INFONAVIT en el bimestre coinciden con lo calculado y determinado por el IMSS. Es la contraparte del SUA bimestral y se cruza contra comprobantes de pago y la emisión IDSE para verificar que los contribuyentes están clasificados correctamente y que los porcentajes de aportación son congruentes con la operación del período.

### ¿Qué riesgo cubre?

- Errores o fraude en la determinación de cuotas RCV e INFONAVIT por registro patronal.
- Omisión o subregistro de trabajadores que generan aportaciones de vivienda.
- Aplicación de porcentajes de aportación incorrectos o falta de actualización por cambios en la clasificación del patrón.
- Falta de correlación entre la nómina del ejercicio y las obligaciones de vivienda declaradas.

### Relación con otros documentos

- [[DOC-cedula_determinacion_mensual]] — Documento mensual paralelo que cubre solo IMSS (cuota fija, excedentes, prestaciones, RT). La cédula bimestral complementa con RCV e INFONAVIT.
- [[DOC-comprobante_pago_sua]] — Comprobante bancario que evidencia el pago efectivo. El importe de la cédula debe amarrar contra el comprobante.
- [[DOC-emision_idse]] — Emisión del portal de IDSE que refleja la prima de riesgo de trabajo emitida para el período y que se cruza contra la cédula para validar coherencia.

---

## 2. Contrato funcional

### Cómo lo reconoce el auditor

- **Encabezado:** "SISTEMA ÚNICO DE AUTODETERMINACIÓN — CÉDULA DE DETERMINACIÓN DE CUOTAS OBRERO-PATRONALES, APORTACIONES Y AMORTIZACIONES"
- **Identificadores clave:** Registro Patronal (RP), RFC del patrón, período bimestral, fecha de proceso, delegación y subdelegación del IMSS.
- **Estructura interna:** Bloque de datos del patrón en el encabezado + tabla resumen con líneas de cotizantes (si aplica detalle por persona) + sección consolidada final con totales por componente (RCV, INFONAVIT, amortizaciones).

### Variantes del nombre en la práctica

| Nombre usado | Contexto |
|--------------|----------|
| Cédula de determinación bimestral | Uso general; bimestrales regulares |
| Cédula RCV-INFONAVIT | Énfasis en componentes cubiertos |
| Cédula IMSS bimestral | Cuando se diferencia de mensual |
| Determinación de cuotas (bimestral) | Documentos internos de la empresa |

### Formato esperado

- **Tipo físico:** PDF nativo (impresión electrónica del portal IMSS o SUA).
- **Encoding:** UTF-8 (PDF estándar).
- **Tamaño típico:** 1–10 páginas (depende de cantidad de trabajadores y movimientos de crédito).
- **Compresión habitual:** Ninguna (PDF comprimido estándar).

### Alcance

- **Entidad cubierta:** Un registro patronal (RP) individual.
- **Periodo cubierto:** Un bimestre natural (Feb-Mar, Abr-May, Jun-Jul, Ago-Sep, Oct-Nov, Dic-Ene) o, en últimas liquidaciones, período irregular según cierre.
- **Nivel de detalle:** Agregado patronal (un RP = un documento). Puede incluir detalle de cotizantes con movimientos de crédito, pero el resumen final es por RP.

### Periodicidad

- **Frecuencia base:** Bimestral.
- **Excepciones:** Liquidaciones finales fuera de la periódica normal (cierre de ejercicio, liquidación al cese de actividades, correcciones bimestrales complementarias).

### Nivel de obligatoriedad

- **Obligatoriedad:** Mandatory para auditorías que cierren RCV e INFONAVIT.
- **Condición:** Aplica en todos los bimestres donde existan cotizantes o aportaciones de vivienda.
- **Qué pasa si el patrón no lo entrega:** Bloquea la validación de pagos en la prueba 5.1 (Vaciado de Liquidaciones) y debilita significativamente la conclusión sobre integridad de las obligaciones de vivienda.

### Bloqueos si falta

- [[PRUEBA-IMSS-051]] — Prueba 5.1 (Vaciado de Liquidaciones) no puede cerrarse sin cédula bimestral para validar RCV e INFONAVIT.

### Fuente normativa

- Pendiente: Verificar artículos específicos de la LSS y reglamentos del IMSS que obligan la emisión de esta cédula.

---

## 3. Reglas de validación

### Convenciones

- **ID:** `VR-CDB-NNN` (tres dígitos, inmutable una vez asignada)
- **Severidad:** `error` | `warning` | `info`
- **Acción si falla:** `abortar` | `aislar-fila` | `marcar` | `continuar` | `reportar`

### Reglas activas

#### VR-CDB-001 — Registro Patronal presente y válido

- **Status:** active
- **Regla:** El RP debe estar presente, tener formato válido (XX-XXXXX-XX-X), y coincidir con el RP declarado en el SUA del período.
- **Expresión:** `registro_patronal != null AND regex_match(registro_patronal, "^[A-Z0-9]+-[0-9]+-[0-9]+-[0-9]+$")`
- **Severidad:** error
- **Acción si falla:** abortar
- **Origen:** operativo
- **Notas:** El RP es la llave de cruce con SUA, comprobantes y emisión IDSE.

#### VR-CDB-002 — Período bimestral válido

- **Status:** active
- **Regla:** El período debe ser un bimestre válido (02-Mar, 04-May, etc.) o un período irregular si hay liquidación.
- **Expresión:** `periodo IN ["02-Mar", "04-May", "06-Jul", "08-Sep", "10-Nov", "12-Ene"] OR es_liquidacion = true`
- **Severidad:** error
- **Acción si falla:** abortar
- **Origen:** operativo
- **Notas:** Detecta desfases de período que rompen el cruce con datos operativos.

#### VR-CDB-003 — Total a Pagar RCV >= 0

- **Status:** active
- **Regla:** La suma de importes para RCV (retiro + cesantía-vejez patronal) debe ser mayor o igual a cero.
- **Expresión:** `total_a_pagar_rcv >= 0`
- **Severidad:** error
- **Acción si falla:** marcar
- **Origen:** operativo
- **Notas:** Valores negativos indican error de cálculo o corrección retroactiva mal etiquetada.

#### VR-CDB-004 — Total a Pagar INFONAVIT >= 0

- **Status:** active
- **Regla:** La suma de aportaciones de vivienda debe ser mayor o igual a cero.
- **Expresión:** `total_a_pagar_infonavit >= 0`
- **Severidad:** error
- **Acción si falla:** marcar
- **Origen:** operativo
- **Notas:** Ídem RCV. Detecta casos anómalos de devolución o corrección sin justificativo claro.

#### VR-CDB-005 — Suma de componentes == Total a Pagar consolidado

- **Status:** active
- **Regla:** `total_a_pagar_rcv + total_a_pagar_infonavit + amortizacion_creditos == total_a_pagar_consolidado`
- **Expresión:** `abs(suma_componentes - total_consolidado) < 0.01`
- **Severidad:** error
- **Acción si falla:** abortar
- **Origen:** operativo
- **Notas:** Valida integridad aritmética de la cédula. Tolerancia de 0.01 por redondeo.

---

## 4. Uso en pruebas

### Roles que puede tener un documento en una prueba

- **input principal** — Sin esta cédula, la prueba 5.1 (Vaciado de Liquidaciones) no puede validar RCV e INFONAVIT.
- **referencia cruzada** — Se cruza contra SUA bimestral y comprobantes de pago para validar coherencia de importes.

### Pruebas de METODOLOGÍA que lo usan

| Prueba METH | Rol | Qué alimenta |
|-------------|-----|--------------|
| [[PRUEBA-METH-vaciado-liquidaciones]] | input principal | Saldos operativos de RCV e INFONAVIT consolidados |

### Pruebas IMSS finales impactadas (transitive)

- [[PRUEBA-IMSS-051]] — Prueba 5.1 (Vaciado de Liquidaciones)

---

## 5. Casos límite y variantes

### Convenciones

- **ID:** `EC-CDB-NNN` (tres dígitos, inmutable)
- **Status:** `active` | `resolved` | `superseded`

### Casos activos

#### EC-CDB-001 — Bimestre con cero cotizantes pero aportación de vivienda

- **Status:** active
- **Cuándo ocurre:** En bimestres donde no hay movimiento de nómina pero hay acreditados en crédito de vivienda activo que requieren retención/descuento.
- **Cómo se reconoce:** `total_cotizantes = 0` pero `total_a_pagar_infonavit > 0`.
- **Cómo se maneja:**
  - En el parser: Validar que la cédula se genera incluso sin cotizantes, siempre que haya crédito activo.
  - En validación: No aplicar regla VR-CDB-005 con severidad abortar; cambiar a warning.
  - En pruebas: Documentar como caso válido de liquidación complementaria.

#### EC-CDB-002 — Período bimestral con liquidación final en meses irregulares

- **Status:** active
- **Cuándo ocurre:** En liquidaciones finales de patrón, cuando la cédula se genera para períodos que no son bimestrales regulares (ej: diciembre a enero si es cierre).
- **Cómo se reconoce:** Campo "Bimestre de Proceso" con fecha irregular (ej: "Enero-Febrero" en lugar de Feb-Mar).
- **Cómo se maneja:**
  - En el parser: Detectar patrones irregulares y flexibilizar validación de período.
  - En validación: Permitir períodos fuera del estándar si es liquidación documentada.
  - En pruebas: Marcar como excepcional y solicitar evidencia de cierre al patrón.

#### EC-CDB-003 — Amortización de crédito de vivienda sin aportación activa

- **Status:** active
- **Cuándo ocurre:** Crédito antiguo en amortización pero sin nuevas aportaciones (solo retención).
- **Cómo se reconoce:** `amortizacion_creditos > 0` pero `aportacion_infonavit = 0`.
- **Cómo se maneja:**
  - En el parser: Preservar amortización como campo independiente.
  - En validación: Permitir combinación; ambas columnas son legales independientemente.
  - En pruebas: Aislado en análisis de movimientos de crédito antiguo.

#### EC-CDB-004 — Pago extemporáneo con actualización y recargos RCV

- **Status:** active
- **Cuándo ocurre:** El pago bimestral de RCV se realiza fuera de plazo y la cédula incorpora accesorios de mora además del principal del ramo.
- **Cómo se reconoce:** El bloque RCV agrega conceptos `Actualización` y `Recargos`, o el total pagado de RCV excede al principal formado por retiro + cesantía y vejez.
- **Cómo se maneja:**
  - En el parser: Extraer `actualizacion_rcv` y `recargos_rcv` cuando esos labels existan; si no aparecen, ambos quedan en `0.00`.
  - En validación: Sin tocar las `VR-CDB-*` actuales, conservar los accesorios en columnas separadas para trazabilidad y salida a plantilla.
  - En pruebas: El amarre sigue referenciado al bimestre liquidado original; los accesorios explican la diferencia entre el principal RCV y el total pagado del ramo.

---

## 6. Notas de mantenimiento

- Historia: Seedeado 2026-04-23 desde análisis de últimas 3 páginas de ejemplo PDF (Cédula de determinación bimestral.pdf, página 56).
- Campos extraídos de resumen final de página: RP, período, cotizantes, RCV (retiro, cesantía-vejez patronal/obrera), INFONAVIT (con/sin crédito, amortización), Total a Pagar consolidado.
- Archivo solo se modifica vía el pipeline de propuestas.
- Ver [[04 - Change log]] para el histórico.
