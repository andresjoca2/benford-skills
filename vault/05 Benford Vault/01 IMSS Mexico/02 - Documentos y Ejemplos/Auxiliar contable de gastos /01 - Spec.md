---
# ── Identidad ────────────────────────────────────────────────
id: DOC-balanza-auxiliar-gastos
type: document
audit: imss
name: "Auxiliar contable de gastos"
aliases:
  - "Auxiliar de gastos"
  - "Auxiliar contable"
  - "Auxiliares de gastos"
  - "Auxiliar de movimientos"

# ── Estado ───────────────────────────────────────────────────
status: canonical
version: 1

# ── Emisión ──────────────────────────────────────────────────
emitted_by: "Sistema contable del patrón (ERP comercial o propio)"
frequency: ad-hoc
file_formats:
  - .xlsx
  - .xls
  - .csv

# ── Obligatoriedad ───────────────────────────────────────────
mandatory_level: conditional
blocks_audit_if_missing: false
blocks_pruebas:
  - PRUEBA-METH-5-1

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
  - "[[DOC-balanza-comprobacion]]"
---

# Auxiliar contable de gastos

---

## 1. Overview

### ¿Qué es?

El auxiliar contable de gastos es un export del sistema contable del patrón que lista, para una o varias cuentas, los movimientos individuales que impactaron esas cuentas durante un periodo. A diferencia de la balanza, que solo muestra saldos consolidados por cuenta, el auxiliar muestra el detalle renglón por renglón: fecha, póliza, descripción y el importe con que cada movimiento afectó la cuenta.

Cada patrón entrega el auxiliar en el formato que genera su sistema contable. La estructura visual cambia radicalmente entre clientes: columnas distintas, nombres de encabezado distintos, agrupaciones distintas, y en algunos casos la cuenta viene dentro del archivo y en otros no. El contenido lógico, sin embargo, siempre es el mismo: una lista de movimientos con fecha, identificador de póliza, descripción e importe.

### ¿Para qué sirve?

Sirve para abrir una cuenta contable cuando su saldo en balanza levanta preguntas y entender qué movimientos lo componen. Es el documento al que se recurre cuando una conciliación no cuadra y hay que explicar la diferencia, o cuando se sospecha que una cuenta con nombre neutro puede contener pagos que en realidad deberían haber integrado al salario base de cotización.

Sin el auxiliar, la balanza es una caja negra: se ve el saldo pero no los componentes. Con el auxiliar, cada peso del saldo puede rastrearse a un movimiento específico, a una póliza, a una fecha y a una descripción, lo que permite decidir si ese movimiento corresponde o no a sueldos y salarios.

### ¿Qué riesgo cubre?

El riesgo principal es que el patrón esté registrando pagos que sí integran al salario base de cotización en cuentas contables cuyo nombre no los delata, evadiendo así cuotas IMSS. Ejemplos típicos: pagos registrados como "transporte de personal", "gastos de viaje", "ayuda para despensa", "gratificaciones extraordinarias", "préstamos al personal", que funcionan como retribución al trabajo pero se contabilizan en cuentas distintas a sueldos y salarios.

También cubre el riesgo inverso en la prueba 5.1: cuando el amarre contable-operativo de cuotas IMSS/RCV/Infonavit no cuadra contra la balanza, el auxiliar permite identificar movimientos específicos (reclasificaciones, cancelaciones, pagos complementarios) que explican la diferencia.

### Relación con otros documentos

- [[DOC-balanza-comprobacion]] — el auxiliar es el desglose detallado de una o varias cuentas de la balanza. Juntos forman un par natural: la balanza da el saldo, el auxiliar da su composición.
- [[DOC-cedula-determinacion-mensual]] — cuando hay diferencias en el amarre contable-operativo de IMSS, el auxiliar de las cuentas de cuotas patronales permite explicar por qué el saldo contable no coincide con el operativo.
- [[DOC-cedula-determinacion-bimestral]] — mismo rol para las cuentas de RCV e Infonavit.

---

## 2. Contrato funcional

### Lo que siempre tiene que estar presente

Independientemente del formato de entrega, para que un archivo califique como auxiliar contable de gastos debe poder entregar, por cada movimiento, al menos:

- la **fecha contable** del movimiento;
- un **identificador de póliza** que lo origina;
- una **descripción** del movimiento (concepto o texto libre);
- un **importe**, ya sea separado en cargo y abono, o como un único valor con signo.

Si alguno de estos cuatro elementos no puede extraerse del archivo, no se considera un auxiliar válido.

La **identidad de la cuenta** asociada a cada movimiento es necesaria para que el auxiliar sea útil, pero puede venir dentro del archivo (en una columna, en un header, en el nombre de hoja) o puede venir por fuera (nombre del archivo, solicitud al cliente, captura manual en ingestión). Esta variabilidad se maneja en el parser, no en el schema.

### Formato esperado

- **Tipo físico:** Excel (`.xlsx` / `.xls`) principalmente; ocasionalmente CSV.
- **Encoding:** UTF-8 en xlsx; en CSV puede variar.
- **Tamaño típico:** desde cientos hasta decenas de miles de renglones.
- **Compresión habitual:** ninguna.

### Cómo NO confundirlo con documentos parecidos

- **Balanza de comprobación:** la balanza tiene una fila por cuenta con su saldo consolidado; el auxiliar tiene múltiples filas por cuenta, una por movimiento individual.
- **Póliza contable individual:** una póliza tiene N renglones de asiento con débito/crédito que suman cero; el auxiliar muestra movimientos de muchas pólizas distintas agrupadas por cuenta o por periodo.

### Variantes del nombre en la práctica

| Nombre usado | Contexto |
|--------------|----------|
| Auxiliar de gastos | Cuando se piden solo cuentas de resultados |
| Auxiliar contable | Nombre genérico |
| Auxiliar de movimientos | Común en varios ERPs |
| Auxiliares (plural) | Referencia coloquial cuando se piden varias cuentas |

### Alcance

- **Entidad cubierta:** empresa / RFC del patrón.
- **Periodo cubierto:** variable; típicamente el ejercicio completo sujeto a revisión o un rango solicitado.
- **Nivel de detalle:** por movimiento contable individual.
- **Cobertura de cuentas:** variable. Puede abarcar desde una sola cuenta hasta el catálogo completo, según cómo se solicite al cliente.

### Periodicidad

- **Frecuencia base:** ad-hoc.
- **Excepciones:** puede pedirse acotado a un mes, a una cuenta, a un bloque de cuentas, o al ejercicio completo.

### Nivel de obligatoriedad

- **Obligatoriedad:** conditional.
- **Condición:** se vuelve necesario cuando el amarre contable-operativo de la prueba 5.1 presenta diferencias que hay que investigar, o cuando existen cuentas en balanza cuyo nombre sugiere que podrían contener pagos integrables al SBC y se requiere confirmar el contenido real.
- **Qué pasa si el patrón no lo entrega:** la prueba 5.1 puede cerrarse parcialmente con solo la balanza, pero las diferencias no explicadas quedan sin ruta de investigación y la trazabilidad se debilita.

### Bloqueos si falta

- [[PRUEBA-METH-5-1]] — no bloquea el cálculo del amarre principal, pero sí bloquea la investigación de diferencias.

### Fuente normativa

- Código Fiscal de la Federación, obligación del contribuyente de conservar contabilidad auxiliar.
- Ley del Seguro Social, obligación del patrón de mantener registros que permitan verificar la integración del SBC.
- Referencias normativas específicas no citadas en los SOPs (ver Pendientes).

---

## 3. Reglas de validación

### Convenciones

- **ID:** `VR-BAG-NNN` (tres dígitos, inmutable una vez asignada).
- **Severidad:** `error` | `warning` | `info`.
- **Acción si falla:** `abortar` | `aislar-fila` | `marcar` | `continuar` | `reportar`.
- **Nunca se borra una regla.** Si deja de aplicar, se marca `status: deprecated`.

### Reglas activas

#### VR-BAG-001 — Cada movimiento tiene una cuenta asociada

- **Status:** active
- **Regla:** todo registro emitido a `auxiliar_movimientos` debe tener `numero_cuenta` no vacío. La cuenta puede venir del archivo o haberse asignado por metadato externo en ingestión, pero el output post-parseo siempre debe tenerla.
- **Expresión:** `row.numero_cuenta IS NOT NULL AND trim(row.numero_cuenta) != ''`
- **Severidad:** error
- **Acción si falla:** aislar-fila
- **Origen:** operativo
- **Notas:** si el archivo no trae la cuenta en ninguna columna, header, hoja ni nombre de archivo, debe proveerse como parámetro externo al parser.

#### VR-BAG-002 — Fecha válida en cada movimiento

- **Status:** active
- **Regla:** la fecha de cada movimiento debe ser parseable y caer dentro del periodo del ejercicio auditado.
- **Expresión:** `parse_date(row.fecha) IS NOT NULL AND row.fecha BETWEEN ejercicio.inicio AND ejercicio.fin`
- **Severidad:** warning
- **Acción si falla:** marcar
- **Origen:** operativo
- **Notas:** fechas fuera de rango pueden indicar ajustes de cierre o reclasificaciones.

#### VR-BAG-003 — Cargo y abono no ambos poblados en el mismo renglón

- **Status:** active
- **Regla:** un renglón representa un único impacto contable; solo uno entre cargo y abono debe tener valor distinto de cero.
- **Expresión:** `NOT (cargo != 0 AND abono != 0)`
- **Severidad:** warning
- **Acción si falla:** marcar
- **Origen:** operativo
- **Notas:** aplica sobre las columnas canónicas ya normalizadas, no sobre el raw.

#### VR-BAG-004 — Reconciliación contra totales reportados cuando existen

- **Status:** active
- **Regla:** si el export incluye filas de subtotal (por cuenta, subcuenta o bloque), la suma de los movimientos del bloque debe coincidir con el total reportado, con tolerancia de redondeo.
- **Expresión:** `abs(sum(movimientos.cargo) - totales.cargo) <= 0.01 AND abs(sum(movimientos.abono) - totales.abono) <= 0.01`
- **Severidad:** error
- **Acción si falla:** reportar
- **Origen:** operativo
- **Notas:** solo aplica cuando el parser detectó filas de totales explícitas. Exports sin totales omiten esta validación.

#### VR-BAG-005 — Saldo final reconciliable con movimientos del periodo

- **Status:** active
- **Regla:** cuando el export reporta saldo inicial y saldo final con valores reales a nivel de cuenta o bloque, el movimiento neto debe reconciliar.
- **Expresión:** `abs(saldo_final - (saldo_inicial + sum(cargos) - sum(abonos))) <= 0.01`
- **Severidad:** warning
- **Acción si falla:** reportar
- **Origen:** operativo
- **Notas:** solo aplica cuando el export incluye saldos iniciales y finales con valores reales. Algunos sistemas emiten estas filas en ceros por convención del export; esos casos se excluyen.

### Reglas deprecated

<!-- Ninguna al momento del seedeo inicial. -->

---

## 4. Uso en pruebas

### Roles que puede tener un documento en una prueba

- **input principal** — sin este doc, la prueba no corre.
- **input secundario** — útil para enriquecer; corre sin él con menos fidelidad.
- **referencia cruzada** — valida datos que vienen de otro doc.
- **amarre** — es uno de los dos lados de una reconciliación.
- **origen de parámetros** — provee constantes / umbrales / catálogos.

### Pruebas de METODOLOGÍA que lo usan

| Prueba METH | Rol | Qué alimenta |
|-------------|-----|--------------|
| [[PRUEBA-METH-5-1]] | input secundario / investigación | permite abrir las cuentas del amarre contable-operativo cuando aparece una diferencia, identificando los movimientos que la explican. |
| [[PRUEBA-METH-sueldos-salarios-balanza]] | input principal de investigación | permite abrir las cuentas de gastos cuyos nombres podrían encubrir conceptos integrables al SBC. |

### Pruebas IMSS finales impactadas (transitive)

- [[PRUEBA-IMSS-5-1]] — Vaciado de liquidaciones.
- Pruebas de revisión de SBC y detección de percepciones no integradas (ver Pendientes).

---

## 5. Casos límite y variantes

### Convenciones

- **ID:** `EC-BAG-NNN` (tres dígitos, inmutable).
- **Status:** `active` | `resolved` | `superseded`.

### Casos activos

#### EC-BAG-001 — Anotaciones del auditor dentro del archivo entregado

- **Status:** active
- **Cuándo ocurre:** el auditor recibe el auxiliar y sobre el mismo archivo agrega columnas, fórmulas de lookup contra catálogos de cuentas sospechosas, hojas auxiliares, o marcas de color. Esto convierte el archivo en papel de trabajo, pero no forma parte del auxiliar original.
- **Cómo se reconoce:**
  - Columnas al final con nombres tipo `A revisar`, `marca`, `obs`, `revisar`, `status`.
  - Celdas con fórmulas (`=VLOOKUP(...)`, `=IFERROR(...)`) apuntando a otras hojas.
  - Hojas adicionales con catálogos de cuentas.
  - Filtros guardados, colores de fondo, notas al margen.
- **Cómo se maneja:**
  - En el parser: leer solo columnas y hojas que contengan movimientos contables; ignorar el resto.
  - En validación: no aplicar reglas a contenido añadido por el auditor.

#### EC-BAG-002 — Cuenta ausente del contenido del archivo

- **Status:** active
- **Cuándo ocurre:** el export no incluye la identidad de la cuenta ni en columna, ni en header, ni en nombre de hoja. Típicamente son exports donde el cliente filtró por una cuenta antes de exportar y la cuenta queda implícita en el contexto de entrega.
- **Cómo se reconoce:**
  - Ninguna columna contiene número de cuenta consistente.
  - No hay filas header con texto tipo "Cuenta: XXX".
  - Los movimientos aparecen como lista plana o agrupados solo por separadores genéricos sin etiqueta.
- **Cómo se maneja:**
  - En el parser: recibir la cuenta como parámetro externo en ingestión. Todos los movimientos se etiquetan con ese valor.
  - Si no se proporciona cuenta externa, el parser falla con error explícito.
  - Registrar la fuente de la cuenta (nombre del archivo, captura manual) como metadato del registro.

#### EC-BAG-003 — Estructura agrupada con filas de encabezado y totales por cuenta

- **Status:** active
- **Cuándo ocurre:** exports que presentan la información agrupada visualmente: una fila header por cuenta, las filas de detalle, una fila de subtotal, y a veces filas en blanco como separador.
- **Cómo se reconoce:**
  - Filas con fecha vacía y campo descriptivo que contiene el nombre de la cuenta o la palabra "Totales" / "Total Cuenta" / "Total SubCuenta".
  - La columna de cuenta puede estar presente solo en la fila header.
  - Filas completamente vacías entre bloques.
- **Cómo se maneja:**
  - En el parser: detectar headers y propagar número y nombre de cuenta hacia abajo hasta el siguiente header. Descartar filas de total (se usan para VR-BAG-004). Descartar blancos.
  - Ni headers ni totales ni blancos generan registros en `auxiliar_movimientos`.

#### EC-BAG-004 — Estructura agrupada por subcuenta sin identidad

- **Status:** active
- **Cuándo ocurre:** exports organizados en bloques de subcuentas (separados por filas "Saldo Inicial" / "Total SubCuenta" o equivalentes) sin header identificador. Los bloques existen estructuralmente pero no se pueden distinguir entre sí.
- **Cómo se reconoce:**
  - Presencia de filas con concepto "Saldo Inicial" y "Total SubCuenta" o equivalentes.
  - Ausencia de texto identificador antes de cada bloque.
  - Múltiples bloques secuenciales sin distinción.
- **Cómo se maneja:**
  - En el parser: detectar los bloques pero no intentar asignar identidad específica a cada uno. Todos los movimientos se etiquetan con la cuenta raíz del export (que vendrá por metadato externo, ver EC-BAG-002).
  - Emitir un log `info` indicando que el export contiene subcuentas anónimas y que el análisis desagregado por subcuenta no es posible con ese archivo.

#### EC-BAG-005 — Estructura aplanada con cuenta repetida en cada renglón

- **Status:** active
- **Cuándo ocurre:** exports donde cada renglón tiene la cuenta explícita en su columna, sin filas header ni filas de total.
- **Cómo se reconoce:**
  - Todas las filas tienen valor en la columna de cuenta.
  - No hay filas separadoras.
  - Tabla homogénea de principio a fin.
- **Cómo se maneja:**
  - En el parser: camino feliz. No requiere propagación vertical ni descarte de filas especiales.

#### EC-BAG-006 — Importes con convención de signos variable

- **Status:** active
- **Cuándo ocurre:** algunos sistemas reportan abonos como valores negativos en la misma columna que los cargos; otros usan dos columnas positivas; otros usan una sola columna de importe con signo.
- **Cómo se reconoce:** inspección de encabezados y muestreo de renglones.
- **Cómo se maneja:** el parser configura la convención por sistema y normaliza al schema canónico (cargo y abono separados, ambos no-negativos).

#### EC-BAG-007 — Variabilidad de nombres de columna entre sistemas

- **Status:** active
- **Cuándo ocurre:** cada ERP usa sus propios encabezados (`Poliza` / `Póliza` / `folio` / `Documento`). Casing, acentos, pluralización y nomenclatura varían.
- **Cómo se reconoce:** inspección de la fila de encabezados.
- **Cómo se maneja:** el parser usa un diccionario de aliases case-insensitive. Encabezados nuevos no reconocidos se registran como propuesta de extensión.

#### EC-BAG-008 — Encabezados engañosos

- **Status:** active
- **Cuándo ocurre:** una columna con encabezado que sugiere un significado específico contiene en la práctica contenido distinto. Ejemplo observado: una columna llamada "nombre_area" con texto libre (referencias de factura, descripciones, folios) sin relación con áreas o departamentos.
- **Cómo se reconoce:** al muestrear los valores y comparar contra el significado sugerido por el encabezado, el contenido no corresponde.
- **Cómo se maneja:**
  - En el parser: no mapear la columna al campo sugerido por el encabezado. Si el contenido tiene valor informativo, concatenarlo al campo de descripción; si es ruido, ignorarlo.
  - Registrar el caso para reconocimiento futuro.

---

## 6. Notas de mantenimiento

- Historia: seedeado 2026-04-23 desde los SOPs de la prueba 5.1 y dos ejemplos reales de export con estructuras radicalmente distintas.
- Archivo solo se modifica vía el pipeline de propuestas.
- Ver [[04 - Change log]] para el histórico.
