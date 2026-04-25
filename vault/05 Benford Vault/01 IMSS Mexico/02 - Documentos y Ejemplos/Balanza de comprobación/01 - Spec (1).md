---
# ── Identidad ────────────────────────────────────────────────
id: DOC-balanza-comprobacion-anual
type: document
audit: imss
name: "Balanza de comprobación anual"
aliases:
  - "Balanza anual"
  - "BC"
  - "Balanza de comprobación"
  - "Balanza general"

# ── Estado ───────────────────────────────────────────────────
status: canonical
version: 1

# ── Emisión ──────────────────────────────────────────────────
emitted_by: "sistema contable del cliente (ERP)"
frequency: anual
file_formats:
  - .xlsx
  - .xls

# ── Obligatoriedad ───────────────────────────────────────────
mandatory_level: mandatory
blocks_audit_if_missing: true
blocks_pruebas:
  - PRUEBA-METH-5-1-vaciado-liquidaciones

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

# Balanza de comprobación anual

---

## 1. Overview

### ¿Qué es?

Es el reporte contable que emite el sistema (ERP) del cliente con todas las cuentas del catálogo y sus saldos acumulados del ejercicio. Muestra, por cada cuenta, cuánto traía al inicio del año, cuánto se movió a cargo, cuánto se movió a abono y con qué saldo cerró al 31 de diciembre.

Es un archivo plano, típicamente exportado a Excel, que refleja la foto contable del ejercicio fiscal completo.

### ¿Para qué sirve?

Es el **lado contable** del amarre en auditoría IMSS. Cuando la auditoría necesita confirmar que los pagos de cuotas (IMSS, RCV, INFONAVIT), los sueldos y salarios, y otros conceptos ligados a nómina están reconocidos formalmente en la contabilidad del cliente, la balanza es la fuente autoritativa para obtener esos saldos.

Sin balanza no se puede construir la comparación contra los importes operativos derivados de los pagos al IMSS. El amarre contable-operativo se vuelve imposible.

### ¿Qué riesgo cubre?

Desde la perspectiva del auditor, permite detectar:

- pagos operativos que no están reflejados en la contabilidad (caso de pagos fuera de sistema o registros omitidos)
- importes contables que no tienen soporte operativo (posible sobre-registro o contabilización cruzada)
- cuentas mal mapeadas en el catálogo del cliente (por ejemplo, cuotas patronales registradas en cuentas que no corresponden)
- diferencias entre lo registrado y lo declarado en el dictamen

### Relación con otros documentos

- [[DOC-auxiliar-gastos]] — documento de investigación complementario cuando hay diferencias en el amarre; permite ver el detalle de movimientos de una cuenta.
- [[DOC-cedula-determinacion-mensual]] — fuente operativa IMSS; su consolidación anual se compara contra los saldos contables de esta balanza.
- [[DOC-cedula-determinacion-bimestral]] — fuente operativa RCV/INFONAVIT; mismo principio de comparación.
- [[DOC-comprobante-pago-sua]] — soporta que lo que aparece en balanza sí se pagó efectivamente.

---

## 2. Contrato funcional

### Cómo lo reconoce el auditor

- Archivo Excel con una tabla tabular de cuentas contables
- Columnas típicas: número de cuenta, descripción/nombre, saldo inicial, cargos del periodo, abonos del periodo, saldo final
- Jerarquía de cuentas implícita en la longitud del número de cuenta (cuentas más cortas = niveles mayores)
- Metadatos de contexto típicos en encabezado del archivo o del nombre: razón social, RFC, rango de fechas del ejercicio

### Variantes del nombre en la práctica

| Nombre usado | Contexto |
|--------------|----------|
| Balanza de comprobación | nombre oficial del reporte contable |
| Balanza anual | referencia al alcance temporal |
| Balanza general | común en ciertos sistemas contables |
| BC | abreviatura interna usada en papeles de trabajo |

### Formato esperado

- **Tipo físico:** Excel (nativo, exportado por el ERP del cliente)
- **Encoding:** UTF-8 (dentro del .xlsx)
- **Tamaño típico:** entre 300 y 4,000 filas según catálogo del cliente
- **Compresión habitual:** ninguna

### Alcance

- **Entidad cubierta:** empresa (RFC individual, puede incluir múltiples establecimientos internos)
- **Periodo cubierto:** ejercicio fiscal completo (enero-diciembre), con saldos acumulados al cierre
- **Nivel de detalle:** todas las cuentas del catálogo contable, desde mayores hasta auxiliares de último nivel

### Periodicidad

- **Frecuencia base:** anual (al cierre del ejercicio)
- **Excepciones:** existen balanzas mensuales del mismo cliente/ERP, con la misma estructura pero alcance de un solo mes. Ver EC-BC-001.

### Nivel de obligatoriedad

- **Obligatoriedad:** mandatory
- **Qué pasa si el patrón no lo entrega:** el lado contable del amarre no puede construirse. Dependiendo del flujo de uso, esto puede bloquear total o parcialmente la prueba.

### Bloqueos si falta

- [[PRUEBA-METH-5-1-vaciado-liquidaciones]] — en flujos donde el amarre se construye contra contabilidad, sin balanza no se puede calcular el saldo contable por control (IMSS, RCV, INFONAVIT) y la conciliación queda incompleta.

### Fuente normativa

- Código de Comercio, Art. 33-38 (obligación de llevar contabilidad)
- Código Fiscal de la Federación, Art. 28 (contabilidad para efectos fiscales)

*Ver pendientes: confirmar fuentes normativas exactas.*

---

## 3. Reglas de validación

### Convenciones

- **ID:** `VR-BC-NNN` (tres dígitos, inmutable una vez asignada)
- **Severidad:** `error` | `warning` | `info`
- **Acción si falla:** `abortar` | `aislar-fila` | `marcar` | `continuar` | `reportar`
- **Nunca se borra una regla.** Si deja de aplicar, se marca `status: deprecated`.

### Reglas activas

#### VR-BC-001 — Integridad contable de la cuenta

- **Status:** active
- **Regla:** para cada cuenta, debe cumplirse que `saldo_final ≈ saldo_inicial + cargos + abonos` dentro de una tolerancia de 0.01. La igualdad depende de la convención de signos del sistema origen; el parser normaliza esta comprobación.
- **Expresión:** `abs((saldo_inicial + cargos + abonos) - saldo_final) <= 0.01`
- **Severidad:** error
- **Acción si falla:** marcar
- **Origen:** operativo
- **Notas:** algunas balanzas muestran abonos como negativos y otras como positivos absolutos; el parser aplica la convención del sistema detectado antes de validar.

#### VR-BC-002 — Consistencia jerárquica de saldos

- **Status:** active
- **Regla:** el saldo de una cuenta padre debe coincidir con la suma de los saldos de sus cuentas hijas directas.
- **Expresión:** `abs(saldo_padre - sum(saldo_hijas_directas)) <= 0.01`
- **Severidad:** warning
- **Acción si falla:** marcar
- **Origen:** operativo
- **Notas:** la jerarquía se deriva de la longitud del número de cuenta. Inconsistencias menores pueden indicar cuentas nuevas mal aliadas o truncadas en el export.

#### VR-BC-003 — Unicidad de número de cuenta

- **Status:** active
- **Regla:** no debe haber dos filas con el mismo número de cuenta dentro de un mismo ejercicio.
- **Expresión:** `count(numero_cuenta) == 1 for each numero_cuenta`
- **Severidad:** error
- **Acción si falla:** aislar-fila
- **Origen:** operativo

#### VR-BC-004 — Cuenta debe tener descripción

- **Status:** active
- **Regla:** toda fila con número de cuenta debe tener descripción no vacía.
- **Expresión:** `descripcion is not null and len(trim(descripcion)) > 0`
- **Severidad:** warning
- **Acción si falla:** marcar
- **Origen:** operativo

#### VR-BC-005 — Ejercicio debe ser identificable

- **Status:** active
- **Regla:** debe poder identificarse el ejercicio al que corresponde la balanza (por metadatos internos, por nombre de archivo, o por input del auditor).
- **Expresión:** `ejercicio is not null`
- **Severidad:** error
- **Acción si falla:** abortar
- **Origen:** operativo
- **Notas:** algunos exports no traen el ejercicio en el cuerpo del archivo y debe inferirse o capturarse por separado.

### Reglas deprecated

<!-- Sin reglas deprecated todavía. -->

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
| [[PRUEBA-METH-5-1-vaciado-liquidaciones]] | amarre | lado contable de la conciliación: saldos anuales de cuentas asociadas a cuotas IMSS, cesantía y vejez (RCV), aportaciones INFONAVIT y, cuando aplica, sueldos y salarios |

### Pruebas IMSS finales impactadas (transitive)

- [[PRUEBA-IMSS-5-1]] — Vaciado de liquidaciones

*Ver pendientes: confirmar IDs exactos de pruebas IMSS en la bóveda.*

---

## 5. Casos límite y variantes

### Convenciones

- **ID:** `EC-BC-NNN` (tres dígitos, inmutable)
- **Status:** `active` | `resolved` | `superseded`

### Casos activos

#### EC-BC-001 — Balanza mensual en lugar de anual

- **Status:** active
- **Cuándo ocurre:** el cliente entrega una balanza con alcance de un solo mes (o varias balanzas mensuales) en lugar de la balanza anual consolidada del ejercicio.
- **Cómo se reconoce:** el nombre del archivo o los metadatos internos indican un mes específico; el saldo inicial no corresponde al 1-ene y el saldo final no corresponde al 31-dic.
- **Cómo se maneja:**
  - En el parser: la estructura es idéntica a la anual, el parser funciona igual. Se marca el registro con `alcance_temporal = mensual` para distinguirlo.
  - En validación: no pasa la comprobación de ejercicio completo.
  - En pruebas: no sirve como input principal del amarre anual. Puede usarse como apoyo de investigación de diferencias mes a mes.

#### EC-BC-002 — Variación de layout por sistema contable (ERP)

- **Status:** active
- **Cuándo ocurre:** distintos clientes usan distintos ERPs (SAP, Contpaq, sistemas propietarios), y cada uno genera la balanza con un layout propio: diferentes nombres de columnas, diferente fila de encabezados, diferentes convenciones de signo, metadatos variables en el header.
- **Cómo se reconoce:** el parser detecta la variante inspeccionando los encabezados de la tabla y la presencia/ausencia de columnas características (ej: `Naturaleza`, `ctacompleta`, `cod_estab`).
- **Cómo se maneja:**
  - En el parser: se aplica un mapeo raw→canónico por variante detectada. El schema canónico es el mismo independiente del sistema origen.
  - En validación: las reglas de integridad se aplican después de normalizar al modelo canónico.
  - En pruebas: el consumidor recibe siempre los mismos campos con los mismos nombres.

#### EC-BC-003 — Anotaciones del auditor sobre el archivo raw

- **Status:** active
- **Cuándo ocurre:** los ejemplos reales frecuentemente vienen con columnas agregadas por el auditor como papel de trabajo: columnas como `ID`, `MID`, `Len`, `Nivel`, `ID SUELDOS`, columnas recalculadas (`SI`, `D`, `H`, `SF`), y hojas adicionales con filtros y catálogos de clasificación.
- **Cómo se reconoce:** columnas que no aparecen en el export original del ERP; hojas secundarias con nombres genéricos (`Sheet1`, `Sheet2`); valores `#N/A` de fórmulas de Excel; columnas con nombres informales/abreviados.
- **Cómo se maneja:**
  - En el parser: se lee únicamente la hoja/columnas que corresponden al export original del ERP; las anotaciones se ignoran deliberadamente.
  - En validación: no hay regla específica; simplemente no forman parte del modelo canónico.
  - En pruebas: el amarre consume siempre los datos canónicos, no los derivados del papel de trabajo del auditor.

#### EC-BC-004 — Balanza con "ajustes" o "definitivo" en el nombre

- **Status:** active
- **Cuándo ocurre:** el cliente entrega una versión de la balanza posterior al cierre original del ejercicio, que incorpora ajustes contables, reclasificaciones o movimientos derivados del dictamen fiscal. Típicamente el nombre del archivo contiene palabras como "definitivo", "con ajustes", "final", "posterior al dictamen".
- **Cómo se reconoce:** nombre del archivo; saldos distintos respecto a una balanza previa del mismo ejercicio; a veces el cliente entrega ambas versiones.
- **Cómo se maneja:**
  - En el parser: se trata igual que cualquier balanza anual. No hay distinción estructural.
  - En validación: se preserva el indicador de versión (`version_etiqueta`) para trazabilidad.
  - En pruebas: la versión definitiva es la preferente para el amarre. Si existen ambas, la diferencia entre ellas puede ser input para investigar qué movimientos derivaron del dictamen.

### Casos resueltos / obsoletos

<!-- Casos resueltos se preservan, no se borran. -->

---

## 6. Notas de mantenimiento

- Historia: seedeado 2026-04-23 desde SOPs de Prueba 5.1 (metodología macro v1 y metodología por folio) y ejemplos reales de tres clientes con sistemas contables distintos.
- Archivo solo se modifica vía el pipeline de propuestas.
- Ver [[04 - Change log]] para el histórico.
