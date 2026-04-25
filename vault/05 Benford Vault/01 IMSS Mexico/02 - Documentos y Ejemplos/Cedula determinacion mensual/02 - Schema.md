---
id: DOC-cedula-determinacion-mensual/schema
type: doc-schema
parent_doc: DOC-cedula-determinacion-mensual
format: tabular
grain: "Un documento = una fila de resumen consolidado para un RP y periodo."
tables:
  - cedula_determinacion_mensual
version: 2
breaking_change_of: 1
---

# Cédula de Determinación de Cuotas (Mensual) — Schema

## Grain

Un documento (Cédula de Determinación Mensual) se expresa como un único row consolidado. El grain es **"RP + Período"** — cada cédula representa la determinación de cuotas para un registro patronal en un mes específico.

## Claves y trazabilidad

- **Primary key del documento:** `(registro_patronal, periodo)`
  - `registro_patronal`: Identificador único del patrón ante el IMSS (ej: "G62-72790-10-5")
  - `periodo`: Año-mes de la liquidación (ej: "2024-01" para enero 2024)
- **Foreign keys hacia otros DOC-*:**
  - `registro_patronal` → [[DOC-disco-pago-sua]]`.registro_patronal`
  - `periodo` → [[DOC-disco-pago-sua]]`.periodo`

## Tabla: `cedula_determinacion_mensual`

**Grain:** Un row = la determinación consolidada de cuotas para un RP en un mes.

| columna | tipo | nullable | pk/fk | descripción |
|---------|------|----------|-------|-------------|
| registro_patronal | string(20) | no | pk | Clave del registro patronal. Formato: "LDDPPPPNNNN-DD" (ej: "G62-72790-10-5") o variantes sin guiones. |
| periodo | string(7) | no | pk | Período de liquidación en formato "YYYY-MM" (ej: "2024-01"). |
| nombre_razon_social | string(150) | sí | | Nombre comercial o razón social del patrón según registros IMSS. |
| rfc_curp | string(20) | sí | | RFC o CURP del patrón, si aparece en documento. |
| domicilio | string(200) | sí | | Domicilio registrado del patrón. |
| codigo_postal | string(10) | sí | | Código postal del domicilio. |
| entidad_federativa | string(50) | sí | | Entidad federativa (estado) del domicilio. |
| delegacion_imss | string(100) | sí | | Delegación o Subdelegación del IMSS responsable. |
| fecha_proceso | date | sí | | Fecha en que el IMSS procesó y emitió la cédula (ej: "2024-02-16"). |
| actividad_economica | string(200) | sí | | Descripción de la actividad económica del patrón. |
| prima_riesgo_trabajo | decimal(10,5) | sí | | Prima de Riesgo de Trabajo aplicada, expresada como porcentaje (ej: 0.51160). Nullable si no aplica. |
| total_cotizantes | decimal(14,2) | sí | | Total de cotizantes (trabajadores activos) en el período. |
| total_dias_cotizados | integer | sí | | Total de días cotizados por todos los trabajadores. |
| total_dias_ausentismo | integer | sí | | Total de días de ausentismo reportados por todos los trabajadores del RP en el mes. Default: 0. |
| total_dias_incapacidad | integer | sí | | Total de días de incapacidad reportados por todos los trabajadores del RP en el mes. Default: 0. |
| cuota_fija | decimal(14,2) | no | | Componente de Cuota Fija patronal. |
| excedente_patronal | decimal(14,2) | no | | Componente de Excedente Patronal. |
| excedente_obrero | decimal(14,2) | no | | Componente de Excedente Obrero. |
| prestaciones_dinero_patronal | decimal(14,2) | no | | Prestaciones en Dinero, parte patronal. |
| prestaciones_dinero_obrera | decimal(14,2) | no | | Prestaciones en Dinero, parte obrera. |
| gastos_medicos_pensionados_patronal | decimal(14,2) | no | | Gastos Médicos Pensionados, parte patronal. |
| gastos_medicos_pensionados_obrera | decimal(14,2) | no | | Gastos Médicos Pensionados, parte obrera. |
| riesgos_trabajo | decimal(14,2) | no | | Riesgos de Trabajo (prima de trabajo aplicada). |
| invalidez_vida_patronal | decimal(14,2) | no | | Invalidez y Vida, parte patronal. |
| invalidez_vida_obrera | decimal(14,2) | no | | Invalidez y Vida, parte obrera. |
| guarderias_prestaciones_sociales | decimal(14,2) | no | | Guarderías y Prestaciones Sociales. |
| actualizacion_cop | decimal(14,2) | sí | | Actualización por pago extemporáneo del componente COP (IMSS). Default: 0.00 cuando el pago fue en plazo. |
| recargos_cop | decimal(14,2) | sí | | Recargos por mora del componente COP (IMSS). Default: 0.00 cuando el pago fue en plazo. |
| total_a_pagar | decimal(14,2) | no | | Total consolidado a pagar por el patrón. Suma de todos los componentes anteriores. |
| smg_diaria_federal | decimal(14,2) | sí | | Salario Mínimo General Diario Federal vigente en el período (dato de referencia del documento). |
| uma | decimal(14,2) | sí | | Unidad de Medida y Actualización vigente en el período (dato de referencia del documento). |
| fuente_archivo | string(255) | sí | | Nombre del archivo PDF del cual se extrajo esta información (para auditoría y trazabilidad). |
| hash_documento | string(64) | sí | | Hash SHA-256 del PDF para detectar duplicados o alteraciones. |
| fecha_extraccion | datetime | sí | | Timestamp de cuándo se extrajo la información del documento. |

### Campos calculados

| columna | expresión | depende de | descripción |
|---------|-----------|------------|-------------|
| total_componentes_obrero | `excedente_obrero + prestaciones_dinero_obrera + gastos_medicos_pensionados_obrera + invalidez_vida_obrera` | cols de componente obrero | Suma de componentes obreros. Útil para validar que solo se toman componentes patronales en algunos cálculos. |
| total_componentes_patronal | `cuota_fija + excedente_patronal + prestaciones_dinero_patronal + gastos_medicos_pensionados_patronal + riesgos_trabajo + invalidez_vida_patronal + guarderias_prestaciones_sociales` | cols de componente patronal | Suma de componentes patronales (excluyendo componentes obreros). |
| suma_todos_componentes | `total_componentes_obrero + total_componentes_patronal` | Suma de campos de componentes | Principal COP sin accesorios de mora. En pagos en plazo coincide con `total_a_pagar`. |
| total_cop_con_accesorios | `suma_todos_componentes + actualizacion_cop + recargos_cop` | suma_todos_componentes, actualizacion_cop, recargos_cop | Total COP útil para salida a plantilla cuando el pago fue extemporáneo. |

### Enumeraciones usadas en esta tabla

**`entidad_federativa`:**
- `YUCATAN` — Entidad Yucatán (ejemplo del PDF)
- (Abierto a todos los estados mexicanos)

**`delegacion_imss`:**
- Catálogo abierto de delegaciones del IMSS (ej: `MERIDA NORTE`, etc.)

## Relaciones entre tablas internas

No aplica. Solo hay una tabla en este documento.

## Trazabilidad inversa

Mapeo de columna del schema → ubicación en el archivo crudo (última página del PDF):

- `registro_patronal`: Label "Registro Patronal:" + valor a la derecha (ej: "G.P.S. I.V. Obr Patronal G62-72790-10-5")
- `periodo`: Extraído de "Período de Proceso: Enero-2024" (convertir a "2024-01")
- `nombre_razon_social`: Label "Nombre o Razón Social:" + valor
- `rfc_curp`: Label "RFC/CURP:" + valor
- `domicilio`: Label "Domicilio:" + valor
- `codigo_postal`: Label "Código Postal:" + valor
- `entidad_federativa`: Label "Entidad:" + valor
- `delegacion_imss`: Labels "Delegación IMSS:" y "SubDelegación IMSS:" + valores
- `fecha_proceso`: Label "Fecha de Proceso:" + valor (convertir a formato date)
- `actividad_economica`: Label "Actividad:" + valor
- `prima_riesgo_trabajo`: Label "Prima de R.T." + valor (convertir porcentaje a decimal 0-1)
- `total_cotizantes`: Label "Total de Cotizantes:" + valor numérico
- `total_dias_cotizados`: Label "Total de Días cotizados..." + valor numérico
- `total_dias_ausentismo`: Label "Ausentismos" + valor numérico en el bloque resumen final
- `total_dias_incapacidad`: Label "Incapacidades" + valor numérico en el bloque resumen final
- `cuota_fija`: Fila "Cuota Fija" → columna "SUMA" (o valor consolidado)
- `excedente_patronal`: Fila "Excedente Patronal" → columna "SUMA"
- `excedente_obrero`: Fila "Excedente Obrera" → columna "SUMA"
- `prestaciones_dinero_patronal`: Fila "Prestaciones en Dinero Patronal" → columna "SUMA"
- `prestaciones_dinero_obrera`: Fila "Prestaciones en Dinero Obrera" → columna "SUMA"
- `gastos_medicos_pensionados_patronal`: Fila "Gastos Médicos Pensionados Patronal" → columna "SUMA"
- `gastos_medicos_pensionados_obrera`: Fila "Gastos Médicos Pensionados Obrera" → columna "SUMA"
- `riesgos_trabajo`: Fila "Riesgos de Trabajo" → columna "SUMA"
- `invalidez_vida_patronal`: Fila "Invalidez y Vida Patronal" → columna "SUMA"
- `invalidez_vida_obrera`: Fila "Invalidez y Vida Obrera" → columna "SUMA"
- `guarderias_prestaciones_sociales`: Fila "Guarderias y Prestaciones Sociales" → columna "SUMA"
- `actualizacion_cop`: Fila o label "Actualización" del bloque COP, cuando exista; no observado en los ejemplos en plazo revisados
- `recargos_cop`: Fila o label "Recargos" del bloque COP, cuando exista; no observado en los ejemplos en plazo revisados
- `total_a_pagar`: Label "Total a pagar:" + valor numérico (fin de tabla resumen; puede incluir accesorios cuando el pago es extemporáneo)
- `smg_diaria_federal`: Label "S.M.G.D.F.:" + valor numérico
- `uma`: Label "U. M. A.:" + valor numérico

## JSON Schema (para consumo automático)

```yaml
$schema: "http://json-schema.org/draft-07/schema#"
type: object
properties:
  cedula_determinacion_mensual:
    type: array
    items:
      type: object
      properties:
        registro_patronal:
          type: string
          pattern: "^[A-Z][0-9]{2}[A-Z0-9]{6}[0-9]{2}-[0-9]{2}$"
        periodo:
          type: string
          pattern: "^[0-9]{4}-[0-9]{2}$"
        nombre_razon_social:
          type: string
        rfc_curp:
          type: string
        domicilio:
          type: string
        codigo_postal:
          type: string
        entidad_federativa:
          type: string
        delegacion_imss:
          type: string
        fecha_proceso:
          type: string
          format: date
        actividad_economica:
          type: string
        prima_riesgo_trabajo:
          type: number
          minimum: 0.0
          maximum: 1.0
        total_cotizantes:
          type: number
          minimum: 0
        total_dias_cotizados:
          type: integer
          minimum: 0
        total_dias_ausentismo:
          type: integer
          minimum: 0
          default: 0
        total_dias_incapacidad:
          type: integer
          minimum: 0
          default: 0
        cuota_fija:
          type: number
          minimum: 0
        excedente_patronal:
          type: number
          minimum: 0
        excedente_obrero:
          type: number
          minimum: 0
        prestaciones_dinero_patronal:
          type: number
          minimum: 0
        prestaciones_dinero_obrera:
          type: number
          minimum: 0
        gastos_medicos_pensionados_patronal:
          type: number
          minimum: 0
        gastos_medicos_pensionados_obrera:
          type: number
          minimum: 0
        riesgos_trabajo:
          type: number
          minimum: 0
        invalidez_vida_patronal:
          type: number
          minimum: 0
        invalidez_vida_obrera:
          type: number
          minimum: 0
        guarderias_prestaciones_sociales:
          type: number
          minimum: 0
        actualizacion_cop:
          type: number
          minimum: 0
          default: 0.0
        recargos_cop:
          type: number
          minimum: 0
          default: 0.0
        total_a_pagar:
          type: number
          minimum: 0
        smg_diaria_federal:
          type: number
          minimum: 0
        uma:
          type: number
          minimum: 0
        fuente_archivo:
          type: string
        hash_documento:
          type: string
          pattern: "^[a-f0-9]{64}$"
        fecha_extraccion:
          type: string
          format: date-time
      required:
        - registro_patronal
        - periodo
        - cuota_fija
        - excedente_patronal
        - excedente_obrero
        - prestaciones_dinero_patronal
        - prestaciones_dinero_obrera
        - gastos_medicos_pensionados_patronal
        - gastos_medicos_pensionados_obrera
        - riesgos_trabajo
        - invalidez_vida_patronal
        - invalidez_vida_obrera
        - guarderias_prestaciones_sociales
        - total_a_pagar
required:
  - cedula_determinacion_mensual
```

## Notas de implementación

- **Precisión decimal:** Todos los montos usan `decimal(14,2)` para soportar importes hasta 99,999,999.99 MXN con 2 decimales. La prima de riesgo usa `decimal(10,5)` porque típicamente se expresa con 5 dígitos decimales (ej: 0.51160).
- **Período:** Convertir texto como "Enero-2024" a formato ISO "2024-01" para comparabilidad y ordenamiento.
- **Registro patronal:** Normalizar removiendo guiones y espacios para comparación consistente con SUA (ej: "G62-72790-10-5" → "G6272790105").
- **Ausentismo e incapacidad:** En los PDFs reales revisados, los labels `Incapacidades` y `Ausentismos` aparecen en la página resumen final; tomar esos agregados sin recorrer el detalle por trabajador.
- **Accesorios por mora:** `actualizacion_cop` y `recargos_cop` deben defaultear a `0.00` cuando los labels no existan o el pago haya sido en plazo. Los ejemplos PDF revisados corresponden a pagos en plazo y no exhiben esos renglones.
- **Hash del documento:** Usar SHA-256 del archivo PDF completo para detectar duplicados o alteraciones no autorizadas en papeles de trabajo futuros.
- **Trazabilidad de extracción:** Guardar `fuente_archivo` y `fecha_extraccion` para auditoría de cuándo se capturó la información.
- **Campos de referencia (SMGD, UMA):** Incluir aunque no alimenten cálculos directamente, porque pueden ser útiles para auditores que validen componentes vs salarios mínimos vigentes.

## Cambios de schema

Este archivo solo se modifica vía el pipeline de propuestas. Ver [[04 - Change log]] para el histórico.
