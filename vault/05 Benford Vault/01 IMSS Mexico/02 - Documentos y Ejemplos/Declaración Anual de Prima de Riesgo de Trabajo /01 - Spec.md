---
# ── Identidad ────────────────────────────────────────────────
id: DOC-declaracion-prima-rt
type: document
audit: imss
name: "Declaración Anual de Prima de Riesgo de Trabajo"
aliases:
  - "Declaración anual de prima de riesgo de trabajo"
  - "Acuse Notarial de Determinación de Prima RT"
  - "Determinación de la Prima de RT"
  - "DAP"
  - "Acuse RT"

# ── Estado ───────────────────────────────────────────────────
status: canonical
version: 1

# ── Emisión ──────────────────────────────────────────────────
emitted_by: "IMSS — IMSS Desde su empresa (portal patronal)"
frequency: anual
file_formats:
  - .pdf

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
  - "[[DOC-alta-seguro-rt]]"
  - "[[DOC-tarjeta-identificacion-patronal]]"
  - "[[DOC-emision-ema]]"
  - "[[DOC-cedula-determinacion-mensual]]"
---

# Declaración Anual de Prima de Riesgo de Trabajo

---

## 1. Overview

### ¿Qué es?

Es el acuse que el IMSS devuelve al patrón cuando este transmite por el portal "IMSS Desde su empresa" su determinación anual de la prima del Seguro de Riesgos de Trabajo. En una sola hoja concentra la identificación del registro patronal, los insumos de siniestralidad del año que se revisa, la prima que venía aplicando y la nueva prima que el patrón declara para el siguiente periodo.

Se presenta una vez al año, típicamente en febrero, y cubre la siniestralidad del año calendario anterior.

### ¿Para qué sirve?

Para dos cosas en la auditoría:

1. **Saber qué prima "correcta" debería haber pagado el patrón en cada mes del año.** La regla operativa es que de enero a febrero aplica la prima anterior y de marzo a diciembre aplica la prima declarada. Esto alimenta la columna AUD (prima según auditoría) del análisis de prima de la prueba 5.1.
2. **Amarrar la prima que realmente vino en las cédulas (RT) y la que emitió IDSE (EMA) contra la que el patrón declaró.** Si las tres no coinciden, hay un hallazgo.

Sin este documento no se puede determinar cuál era la prima correcta para los meses de marzo en adelante. El análisis de prima queda limitado a comparar RT vs EMA sin un tercer punto de anclaje.

### ¿Qué riesgo cubre?

- Que el patrón haya pagado con una prima menor a la que le corresponde (subcotización del riesgo de trabajo).
- Que la prima declarada no se haya aplicado efectivamente en las cédulas a partir de marzo.
- Que la prima emitida por IDSE (EMA) difiera de la declarada y el patrón haya pagado con cualquiera de las dos sin notarlo.
- Que no exista declaración cuando sí debería existir (patrón con siniestralidad en el año revisado).

### Relación con otros documentos

Este documento vive en el análisis de prima, que es una capa dentro de la prueba 5.1. Se cruza con otros documentos así:

- [[DOC-alta-seguro-rt]] — sustituto cuando no existe declaración porque es primer año del RP. El alta aporta clase, fracción y prima media como fallback.
- [[DOC-tarjeta-identificacion-patronal]] — en escenario de primer año acompaña al alta para confirmar el RP.
- [[DOC-emision-ema]] — contraparte del amarre de prima: EMA es la prima emitida por IDSE para ese RP y periodo. Se compara contra la prima declarada de este documento.
- [[DOC-cedula-determinacion-mensual]] — la prima RT que efectivamente se usó en el pago se ve en la cédula mensual. Se compara contra la declarada para detectar desfases de aplicación.

---

## 2. Contrato funcional

### Cómo lo reconoce el auditor

- Encabezado con el logo `gob.mx` y la franja `IMSS Desde su empresa`.
- Título del bloque principal: "Acuse Notarial de confirmación de transmisión del archivo de la Determinación de la Prima en el Seguro de Riesgos de Trabajo Derivada de la Revisión Anual de la Siniestralidad de la Empresa".
- Tabla de identificación con los labels: `Registro Patronal`, `Delegación`, `Subdelegación`, `Folio`, `Lote número`, `Fecha de transacción`, `Razón Social`, `Actividad Económica`, `Clase`, `Fracción`, `Representante Legal`, `Denominación del trámite`.
- Tabla "Datos base para la Determinación" con los labels: `Días Subsidiados (S)`, `Porcentajes (I)`, `Defunciones (D)`, `Trabajadores Prom. (N)`, `Años prom. Vida A. (V)`, `Factor de Prima (F)`, `Prima Mínima R. (M)`, `Días del Año`, `Acreditación STyPS`, y en el lado derecho `Periodo Revisión`, `Prima Anterior`, `Prima Declarada`.
- Al pie, bloque `Cadena Original` con campos `NOTARIA_*` y un `SELLO_DIGITAL` hexadecimal.
- Pie de página institucional con dirección `Paseo de la Reforma 476, P.B.`.

**Cómo NO confundirlo:** no es la Declaración anual de ISR ni la Declaración de PTU. El nombre "declaración anual" es ambiguo en el lenguaje fiscal; este documento específicamente trata de la prima del Seguro de Riesgos de Trabajo, se presenta al IMSS (no al SAT), y siempre trae los campos de siniestralidad (S, I, D, N, V, F, M) visibles.

### Variantes del nombre en la práctica

| Nombre usado | Contexto |
|--------------|----------|
| Declaración anual de prima de riesgo de trabajo | SOPs internos |
| Acuse Notarial de Determinación de Prima RT | Nombre formal que aparece en el título del PDF |
| Determinación de la Prima de RT | Denominación del trámite dentro del PDF |
| DAP | Abreviación usada en la Cadena Original del IMSS (nombre del archivo `.DAP`) |
| Acuse RT | Uso informal en nombres de archivo |

### Formato esperado

- **Tipo físico:** PDF nativo (generado por el portal IMSS, texto seleccionable, no escaneado)
- **Encoding:** UTF-8
- **Tamaño típico:** 1 página
- **Compresión habitual:** ninguna

### Alcance

- **Entidad cubierta:** un registro patronal
- **Periodo cubierto:** un año calendario (el año de siniestralidad que se revisa)
- **Nivel de detalle:** agregado patronal (no hay detalle por trabajador ni por centro)

### Periodicidad

- **Frecuencia base:** anual
- **Excepciones:** puede haber re-envíos durante la ventana de presentación si el patrón corrige antes del cierre. En ese caso queda el acuse más reciente como válido; los anteriores son históricos.

### Nivel de obligatoriedad

- **Obligatoriedad:** conditional
- **Condición si es conditional:** es obligatorio presentarlo ante el IMSS cuando el patrón tuvo siniestralidad en el año revisado. Para efectos de la auditoría, se vuelve obligatorio cuando existe y es utilizable; cuando no existe por tratarse de primer año del RP o alta reciente, se sustituye por alta del seguro RT + tarjeta de identificación patronal.
- **Qué pasa si el patrón no lo entrega:** el análisis AUD de prima queda limitado para marzo en adelante. El flujo de amarre principal (Total a Pagar vs Importe Comprobante, Comprobación = 0) puede cerrar sin este documento, pero el análisis RT / EMA / AUD queda incompleto.

### Bloqueos si falta

- [[PRUEBA-IMSS-5.1]] — no bloquea el amarre operativo principal. Sí limita el análisis de prima (columna AUD): sin declaración y sin alta del seguro aplicable, no hay tercer punto de anclaje para validar la prima correcta.

### Fuente normativa

- Ley del Seguro Social, artículos relativos a la determinación de la prima del Seguro de Riesgos de Trabajo.
- Reglamento de la Ley del Seguro Social en materia de Afiliación, Clasificación de Empresas, Recaudación y Fiscalización (RACERF).

*[Referencias normativas exactas pendientes de verificación — los SOPs no las citan.]*

---

## 3. Reglas de validación

### Convenciones

- **ID:** `VR-DPRT-NNN` (tres dígitos, inmutable una vez asignada)
- **Severidad:** `error` | `warning` | `info`
- **Acción si falla:** `abortar` | `aislar-fila` | `marcar` | `continuar` | `reportar`
- **Nunca se borra una regla.** Si deja de aplicar, se marca `status: deprecated` con su DEC-NNNN correspondiente.

### Reglas activas

#### VR-DPRT-001 — Registro patronal presente y con formato válido

- **Status:** active
- **Regla:** el campo `registro_patronal` existe, no es vacío y cumple el formato IMSS (11 caracteres alfanuméricos en mayúsculas).
- **Expresión:** `registro_patronal is not null and match(registro_patronal, "^[A-Z0-9]{11}$")`
- **Severidad:** error
- **Acción si falla:** abortar
- **Origen:** operativo
- **Notas:** sin RP válido el documento no se puede asociar a ningún cliente.

#### VR-DPRT-002 — Periodo de revisión presente y de 4 dígitos

- **Status:** active
- **Regla:** el campo `periodo_revision` es un año válido de 4 dígitos.
- **Expresión:** `periodo_revision is not null and match(periodo_revision, "^[0-9]{4}$")`
- **Severidad:** error
- **Acción si falla:** abortar
- **Origen:** operativo
- **Notas:** es parte de la llave primaria del documento.

#### VR-DPRT-003 — Prima anterior y prima declarada presentes

- **Status:** active
- **Regla:** ambos campos existen y son decimales no negativos.
- **Expresión:** `prima_anterior is not null and prima_declarada is not null and prima_anterior >= 0 and prima_declarada >= 0`
- **Severidad:** error
- **Acción si falla:** abortar
- **Origen:** operativo
- **Notas:** son los dos valores que alimentan el análisis AUD. Sin ellos el documento no aporta nada.

#### VR-DPRT-004 — Primas dentro del rango legal

- **Status:** active
- **Regla:** tanto la prima anterior como la declarada están dentro del rango legal permitido por la LSS.
- **Expresión:** `prima_anterior >= 0.00500 and prima_anterior <= 15.00000 and prima_declarada >= 0.00500 and prima_declarada <= 15.00000`
- **Severidad:** warning
- **Acción si falla:** marcar
- **Origen:** normativo
- **Notas:** el rango legal vigente es entre 0.50000% y 15.00000%, con prima mínima de riesgo de 0.00500 como piso técnico. Si cae fuera del rango, probablemente hay error de lectura del parser.

#### VR-DPRT-005 — Clase consistente con fracción

- **Status:** active
- **Regla:** la clase (1-5) debe corresponder al catálogo oficial de clasificación de actividades del RACERF para la fracción declarada.
- **Expresión:** `clase in [1,2,3,4,5] and (fraccion, clase) in CATALOGO_RACERF`
- **Severidad:** warning
- **Acción si falla:** reportar
- **Origen:** normativo
- **Notas:** requiere catálogo externo. Si el catálogo no está cargado, la regla se ejecuta como info.

#### VR-DPRT-006 — Fecha de transacción no futura

- **Status:** active
- **Regla:** la fecha de transacción no puede ser posterior a la fecha de lectura del documento.
- **Expresión:** `fecha_transaccion <= today()`
- **Severidad:** warning
- **Acción si falla:** marcar
- **Origen:** operativo

### Reglas deprecated

<!-- Sin reglas deprecated. -->

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
| [[PRUEBA-METH-5.1-ruben]] | origen de parámetros + referencia cruzada | alimenta la columna AUD (prima según auditoría) del análisis RT/EMA/AUD. También provee clase y fracción para las columnas AM y AN cuando no se usa alta del seguro. |
| [[PRUEBA-METH-5.1-josefina]] | no se consume directamente | la metodología v1 no trabaja la prima como análisis separado — la prima viene ya incorporada al componente de riesgo de trabajo dentro del SUA IMSS. |

### Regla operativa de uso de la prima declarada

El uso puede variar según el flujo, pero la regla canónica observada es:

- Enero y febrero del año siguiente al periodo revisado → se aplica `prima_anterior`.
- Marzo a diciembre del año siguiente al periodo revisado → se aplica `prima_declarada`.

Ejemplo: una declaración con `periodo_revision = 2023` aplica así en 2024: enero-febrero con prima anterior (0.53406 en el PDF ejemplo), marzo-diciembre con prima declarada (0.55257).

### Pruebas IMSS finales impactadas (transitive)

- [[PRUEBA-IMSS-5.1]] — Vaciado de liquidaciones

---

## 5. Casos límite y variantes

### Convenciones

- **ID:** `EC-DPRT-NNN` (tres dígitos, inmutable)
- **Status:** `active` | `resolved` | `superseded`

### Casos activos

#### EC-DPRT-001 — Patrón sin siniestralidad o primer año del RP

- **Status:** active
- **Cuándo ocurre:** el patrón no presenta declaración porque es primer año del RP o no tuvo siniestralidad que detonara obligación de presentar.
- **Cómo se reconoce:** el documento simplemente no existe en el set del cliente para ese RP + ese periodo.
- **Cómo se maneja:**
  - En el parser: no aplica, no hay archivo que parsear.
  - En validación: no es error; es escenario válido.
  - En pruebas: se bifurca al escenario de alta del seguro RT + tarjeta patronal como fallback. La columna AUD se alimenta desde ahí.

#### EC-DPRT-002 — Re-envío por corrección dentro de la ventana

- **Status:** active
- **Cuándo ocurre:** el patrón presenta la declaración, detecta un error antes del cierre de la ventana de presentación, y re-envía. Quedan dos o más acuses con el mismo RP y mismo periodo de revisión pero distinto folio y distinta fecha de transacción.
- **Cómo se reconoce:** aparecen múltiples PDFs para el mismo `(registro_patronal, periodo_revision)` con `folio` distinto.
- **Cómo se maneja:**
  - En el parser: cada PDF se parsea independientemente.
  - En validación: se marca la existencia de múltiples acuses.
  - En pruebas: se toma el acuse con `fecha_transaccion` más reciente como el válido. Los anteriores quedan como histórico. Si hay diferencias relevantes entre acuses se deja visible.

### Casos resueltos / obsoletos

<!-- Sin casos resueltos. -->

---

## 6. Notas de mantenimiento

- Historia: seedeado 2026-04-22 desde SOP-Rubén y SOP-Josefina más un PDF ejemplo de 2023.
- Archivo solo se modifica vía el pipeline de propuestas.
- Ver [[04 - Change log]] para el histórico.
