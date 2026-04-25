---
# ── Identidad ────────────────────────────────────────────────
id: DOC-cedula-determinacion-mensual
type: document
audit: imss
name: "Cédula de Determinación de Cuotas (Mensual)"
aliases:
  - "Cédula de Determinación Mensual"
  - "Cédula IMSS Mensual"
  - "CDM"

# ── Estado ───────────────────────────────────────────────────
status: canonical
version: 1

# ── Emisión ──────────────────────────────────────────────────
emitted_by: "IMSS (Instituto Mexicano del Seguro Social)"
frequency: mensual
file_formats:
  - .pdf

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
  - "[[DOC-disco-pago-sua]]"
  - "[[DOC-comprobante-pago-sua]]"
  - "[[DOC-cedula-determinacion-bimestral]]"
---

# Cédula de Determinación de Cuotas (Mensual)

---

## 1. Overview

### ¿Qué es?

La Cédula de Determinación de Cuotas (Mensual) es un documento emitido por el IMSS que detalla, de forma estructurada, el cálculo de las aportaciones y cuotas obrero-patronales que debe pagar un patrón (empleador) al IMSS durante un mes calendario. Contiene el desglose de componentes como cuota fija, excedentes, prestaciones, riesgos de trabajo, invalidez y vida, guarderías, y otros conceptos, tanto en la parte obrera como patronal.

### ¿Para qué sirve?

En el contexto de una auditoría IMSS, la cédula mensual sirve como documento fuente de autoridad para validar que:
- Los montos liquidados en el SUA (Disco de Pago) son consistentes con lo determinado por el IMSS.
- Los importes patronales y obreros están correctamente segregados.
- La prima de riesgo de trabajo aplicada corresponde a la vigente.
- El total a pagar que se refleja en comprobantes bancarios puede amarrarse contra esta determinación oficial.

Sin este documento, el auditor no puede verificar la integridad de los cálculos de cuotas emitidos por la institución, debilitando la trazabilidad del pago.

### ¿Qué riesgo cubre?

La cédula detecta:
- Diferencias entre lo que el patrón declaró en SUA y lo que el IMSS determinó que debe pagar.
- Errores en la aplicación de tasas de cuota fija, excedentes o primas de riesgo.
- Omisiones o inclusiones incorrectas de componentes (prestaciones, guarderías, invalidez).
- Discrepancias entre períodos que podrían indicar cambios sin documentación de respaldo.

### Relación con otros documentos

- [[DOC-disco-pago-sua]] — La cédula mensual se usa para validar que los montos de SUA coincidan con la determinación oficial del IMSS.
- [[DOC-comprobante-pago-sua]] — El comprobante bancario debe coincidiramarrarse contra el total a pagar de la cédula.
- [[DOC-cedula-determinacion-bimestral]] — Complementa la cédula mensual; cubre RCV e INFONAVIT en meses bimestrales (usualmente febrero, abril, junio, agosto, octubre y diciembre).
- [[DOC-emision-ema]] — Cuando se requiere validar la prima de riesgo de trabajo aplicada.

---

## 2. Contrato funcional

### Cómo lo reconoce el auditor

- **Encabezado típico:** "SISTEMA ÚNICO DE AUTODETERMINACIÓN" + "CÉDULA DE DETERMINACIÓN DE CUOTAS"
- **Logotipo:** Logo del IMSS visible
- **Estructura de página:** Tabla resumen con información de RP, período, domicilio, prima de R.T. y componentes de cuotas
- **Sección crítica:** Última página contiene la tabla resumen consolidada con los montos totales

### Variantes del nombre en la práctica

| Nombre usado | Contexto |
|--------------|----------|
| "Cédula de Determinación Mensual" | Referencia formal completa |
| "Cédula IMSS" | Referencia abreviada en papeles de trabajo |
| "CDM" | Sigla en tablas y registros |
| "Determinación IMSS mensual" | Contexto operativo |

### Formato esperado

- **Tipo físico:** PDF nativo (no escaneado)
- **Encoding:** UTF-8
- **Tamaño típico:** 5-50 páginas (páginas previas contienen detalle por trabajador; última página contiene resumen)
- **Compresión habitual:** Sin compresión

### Alcance

- **Entidad cubierta:** Registro Patronal (RP) individual
- **Periodo cubierto:** Un mes calendario
- **Nivel de detalle:** Resumen consolidado en última página; detalle por trabajador en páginas previas (no parseado por esta especificación)

### Periodicidad

- **Frecuencia base:** Mensual
- **Excepciones:** Modificatorias (si el patrón solicita revisión y el IMSS reemite), altas extemporáneas

### Nivel de obligatoriedad

- **Obligatoriedad:** Mandatory
- **Razón:** Es el único documento que emite el IMSS con la determinación oficial de cuotas; es requisito para validar la integridad de pagos.
- **Qué pasa si el patrón no lo entrega:** La prueba 5.1 no puede cerrarse; la validación de cuotas queda incompleta y la auditoría debe documentar la falta de evidencia.

### Bloqueos si falta

- [[PRUEBA-IMSS-5.1]] — Vaciado de liquidaciones requiere la cédula para amarrar IMSS contra SUA y comprobantes bancarios.

### Fuente normativa

- Ley del Seguro Social (LSS)
- Reglamento de Inscripción, Afiliación y Recaudación (RIAR)
- (Pendiente: citación exacta de artículos; no se hallaron en SOPs pero es norma IMSS aplicable)

---

## 3. Reglas de validación

### Convenciones

- **ID:** `VR-CDM-NNN` (tres dígitos, inmutable una vez asignada)
- **Severidad:** `error` | `warning` | `info`
- **Acción si falla:** `abortar` | `aislar-fila` | `marcar` | `continuar` | `reportar`
- **Nunca se borra una regla.** Si deja de aplicar, se marca `status: deprecated`.

### Reglas activas

#### VR-CDM-001 — Total a pagar debe ser positivo y no nulo

- **Status:** active
- **Regla:** El campo "Total a pagar" debe ser mayor a cero. Una cédula con total cero o negativo indica un error de cálculo del IMSS o un documento incompleto.
- **Expresión:** `total_a_pagar > 0`
- **Severidad:** error
- **Acción si falla:** abortar
- **Origen:** operativo
- **Notas:** Casos raros (e.g., una empresa sin cotizantes en el mes) resultarían en total cero, pero documentalmente el IMSS aún emite cédula. Requiere investigación.

#### VR-CDM-002 — Registro patronal debe coincidir con RP en SUA

- **Status:** active
- **Regla:** El RP extraído de la cédula debe ser idéntico (sin espacios, sin guiones adicionales) al RP declarado en el SUA del mismo período. Discrepancia indica error de captura o documento erróneo.
- **Expresión:** `rp_cedula_normalizado == rp_sua_normalizado`
- **Severidad:** error
- **Acción si falla:** marcar
- **Origen:** operativo
- **Notas:** Los RP pueden tener formatos variantes (ej: "G62-72790-10-5" vs "G6272790105"). Normalizar antes de comparar.

#### VR-CDM-003 — Período de cédula debe coincidir con período auditado

- **Status:** active
- **Regla:** El período (mes-año) extraído de la cédula debe corresponder al período siendo auditado. Una cédula de mes anterior o posterior no es válida para cerrar la fila de amarre.
- **Expresión:** `periodo_cedula == periodo_audit`
- **Severidad:** error
- **Acción si falla:** marcar
- **Origen:** operativo

#### VR-CDM-004 — Suma de componentes debe coincidir con total a pagar

- **Status:** active
- **Regla:** La suma de todos los componentes (C.F. + EXC.PAT. + EXC.OBR. + P.D.PAT. + P.D.OBR. + G.M.P.PAT. + G.M.P.OBR. + R.T. + I.V.PAT. + I.V.OBR. + G.P.S.) debe ser igual al Total a Pagar. Discrepancia indica error de cálculo interno del IMSS o un documento parcial.
- **Expresión:** `cf + exc_pat + exc_obr + pd_pat + pd_obr + gmp_pat + gmp_obr + rt + iv_pat + iv_obr + gps == total_a_pagar`
- **Severidad:** warning
- **Acción si falla:** marcar
- **Origen:** operativo
- **Notas:** Pequeñas discrepancias (< 0.01) pueden deberse a redondeos internos del IMSS. Documentar si ocurren.

#### VR-CDM-005 — Prima de Riesgo de Trabajo debe estar dentro de rango conocido

- **Status:** active
- **Regla:** La prima de riesgo de trabajo aplicada debe ser un porcentaje entre 0.5% y 15% (rango típico de prima de trabajo en México). Valores fuera de este rango sugieren error de captura o clase de riesgo inusual.
- **Expresión:** `0.005 <= prima_rt <= 0.15`
- **Severidad:** warning
- **Acción si falla:** marcar
- **Origen:** operativo
- **Notas:** Casos especiales (ej: actividades de muy alto riesgo) pueden tener primas fuera de rango. Requiere investigación.

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
| [[PRUEBA-METH-vaciado-liquidaciones]] | input principal | Componentes IMSS (patronal/obrero) para amarre contra SUA y contabilidad |

### Pruebas IMSS finales impactadas (transitive)

- [[PRUEBA-IMSS-5.1]] — Vaciado de liquidaciones: es documento obligatorio para validar cuotas IMSS pagadas contra SUA y comprobantes bancarios.

---

## 5. Casos límite y variantes

### Convenciones

- **ID:** `EC-CDM-NNN` (tres dígitos, inmutable)
- **Status:** `active` | `resolved` | `superseded`

### Casos activos

#### EC-CDM-001 — Cédula modificatoria (corrección posterior al mes)

- **Status:** active
- **Cuándo ocurre:** El patrón solicita revisión al IMSS y este reemite la cédula con importes corregidos después del mes original. Pueden existir dos cédulas para el mismo período.
- **Cómo se reconoce:** El documento incluye leyenda "MODIFICATORIA" o "CORRECCIÓN" en encabezado, o fecha de emisión posterior al mes en cuestión.
- **Cómo se maneja:**
  - En el parser: Documentar ambas cédulas (original y correctiva) con timestamp de emisión.
  - En validación: Usar la cédula más reciente (por fecha de proceso) como autoridad; marcar las previas como supersedidas.
  - En pruebas: Usar la correctiva para cerrar amarre. Documentar la diferencia vs original como observación de auditoría.

#### EC-CDM-002 — Empresa sin movimiento en el mes

- **Status:** active
- **Cuándo ocurre:** La empresa no registra cotizantes o movimiento alguno en el período. El IMSS emite cédula con total a pagar = 0.
- **Cómo se reconoce:** Campo "Total a pagar" = 0.00; "Total de Cotizantes" = 0.
- **Cómo se maneja:**
  - En el parser: Aceptar total_a_pagar = 0 en este contexto; no bloquear.
  - En validación: Cambiar severidad de VR-CDM-001 a warning en lugar de error.
  - En pruebas: Documentar explícitamente que no hay cuotas para el mes; la fila de amarre quedará sin movimiento.

#### EC-CDM-003 — Páginas iniciales no contienen datos tabulares completos

- **Status:** active
- **Cuándo ocurre:** Siempre. El PDF incluye 1-49 páginas de detalle por trabajador (incluyendo NSS, nombre, días, SDI, incapacidades, ausencias, componentes individuales). La última página contiene el resumen consolidado.
- **Cómo se reconoce:** Estructura visual: primeras páginas = tabla ancha con columnas de trabajador. Última página = tabla compacta de resumen.
- **Cómo se maneja:**
  - En el parser: Ignorar completamente las primeras N-1 páginas. Parsear solo la última página (página de número variable, detectar por contenido o ir al final). En los PDFs reales revisados, los labels `Incapacidades` y `Ausentismos` sí aparecen en el resumen final, por lo que `total_dias_incapacidad` y `total_dias_ausentismo` se toman ahí y no requieren agregar el detalle por trabajador.
  - En validación: No desnormalizar el detalle por trabajador dentro del contrato canónico; solo validar los agregados expuestos en la página resumen.
  - En pruebas: El detalle individual sigue fuera de scope; lo que alimenta esta especificación son los totales consolidados del mes (cotizantes, días cotizados, ausentismo, incapacidad y bloque IMSS).

#### EC-CDM-004 — Prima de Riesgo de Trabajo solo reflejada si aplicable

- **Status:** active
- **Cuándo ocurre:** Algunas empresas tienen prima de RT integrada en sus cálculos; otras no (ej: actividades sin riesgo físico, o excepciones normativas). El campo "Prima de R.T." puede no estar presente o mostrar 0%.
- **Cómo se reconoce:** Campo "Prima de R.T." vacío o con valor "0.00000%".
- **Cómo se maneja:**
  - En el parser: Aceptar prima_rt como nullable; si no aparece, registrar como null.
  - En validación: VR-CDM-005 aplica solo si prima_rt != null.
  - En pruebas: Documentar si prima de RT está ausente; puede ser legítimo según actividad.

#### EC-CDM-005 — Pago extemporáneo con actualización y recargos

- **Status:** active
- **Cuándo ocurre:** El pago mensual de COP se realiza fuera de plazo y la cédula refleja accesorios por mora además del principal del periodo.
- **Cómo se reconoce:** El bloque económico del documento agrega conceptos `Actualización` y `Recargos` asociados al componente COP, o el total pagado del periodo supera al principal IMSS por esos accesorios.
- **Cómo se maneja:**
  - En el parser: Extraer `actualizacion_cop` y `recargos_cop` cuando esos labels existan en la cédula; si no aparecen, ambos quedan en `0.00`.
  - En validación: Sin modificar las `VR-CDM-*` existentes, conservar los accesorios como columnas separadas para trazabilidad y salida a plantilla.
  - En pruebas: La fila sigue amarrada al periodo liquidado original; `actualizacion_cop` y `recargos_cop` explican la diferencia entre el principal COP y el total efectivamente pagado en un escenario extemporáneo.

---

## 6. Notas de mantenimiento

- Historia: Generado inicial desde PDF ejemplo (Enero 2024) y SOPs de Rubén y Josefina (2026-04-23).
- Archivo se modifica solo vía propuestas formales. 
- Ver [[04 - Change log]] para histórico de cambios.
