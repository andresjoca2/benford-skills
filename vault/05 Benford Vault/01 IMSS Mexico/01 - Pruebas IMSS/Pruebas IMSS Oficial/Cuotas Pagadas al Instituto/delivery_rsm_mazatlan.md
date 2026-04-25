---
# -- Identidad ------------------------------------------------
id: PRUEBA-IMSS-cuotas-pagadas-al-instituto/delivery/rsm-mazatlan
type: prueba-delivery
audit: imss
parent_prueba: PRUEBA-IMSS-cuotas-pagadas-al-instituto
pestaña_excel: "Cuotas pagadas al Instituto"

# -- Forma del entregable -------------------------------------
grain: "una fila por Registro Patronal consolidada al ejercicio completo"
columnas_count: 29
formato_fisico: txt
encoding: "ANSI-1252"
delimitador: tab
celda_inicial_excel: "A7"

# -- Estado ----------------------------------------------------
status: draft
version: 1
last_decision: null

# -- Fuentes canonicas ----------------------------------------
data_sources:
  - DOC-cedula-determinacion-mensual
  - DOC-cedula_determinacion_bimestral

# -- Reconciliations que la validan ---------------------------
validated_by:
  - PRUEBA-IMSS-cuotas-pagadas-al-instituto/reconciliation/rsm-mazatlan
---

# Cuotas pagadas al Instituto - Delivery (RSM Mazatlan)

---

## 1. Objetivo del entregable

Reportar en la pestaña **"Cuotas pagadas al Instituto"** los importes pagados al IMSS por registro patronal durante el ejercicio auditado, con desglose de cotizantes, dias, cuotas obrero-patronales, RCV e INFONAVIT.

Este archivo documenta como se llena el layout oficial. La validacion operativa de RSM Mazatlan vive en `reconciliation_rsm-mazatlan.md`.

## 2. Contrato de salida

### Grain

Una fila por Registro Patronal consolidada al ejercicio completo. La plantilla oficial contiene una fila de totales posterior a las filas de detalle; esa fila no se genera desde el TXT porque la calcula el workbook oficial.

### Columnas (orden oficial del IMSS)

| Col | Variable IMSS | Tipo | Formula | Fuente canonica | Notas |
|-----|---------------|------|---------|-----------------|-------|
| A | Consecutivo | int | `ROW_NUMBER()` por RP | generado | No viene de documentos fuente. |
| B | RP | string | directo normalizado | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.registro_patronal]]` | Normalizar sin guiones para cruce con SUA y comprobante. |
| C | Cotizantes reportados | int | `MAX(total_cotizantes)` por RP en el ejercicio | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.total_cotizantes]]` | MAX, no SUM. |
| D | Dias cotizados | int | `SUM(total_dias_cotizados)` anual por RP | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.total_dias_cotizados]]` |  |
| E | Dias de ausentismo | int | `SUM(total_dias_ausentismo)` anual por RP | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.total_dias_ausentismo]]` | Default `0` si el periodo no trae dato. |
| F | Dias de incapacidad | int | `SUM(total_dias_incapacidad)` anual por RP | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.total_dias_incapacidad]]` | Default `0` si el periodo no trae dato. |
| G | Cuota fija | decimal(14,2) | `SUM(cuota_fija)` anual por RP | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.cuota_fija]]` | Componente patronal. |
| H | Cuota excedente patron | decimal(14,2) | `SUM(excedente_patronal)` anual por RP | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.excedente_patronal]]` |  |
| I | Cuota excedente obrero | decimal(14,2) | `SUM(excedente_obrero)` anual por RP | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.excedente_obrero]]` |  |
| J | Prestaciones en dinero patron | decimal(14,2) | `SUM(prestaciones_dinero_patronal)` anual por RP | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.prestaciones_dinero_patronal]]` |  |
| K | Prestaciones en dinero obrero | decimal(14,2) | `SUM(prestaciones_dinero_obrera)` anual por RP | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.prestaciones_dinero_obrera]]` |  |
| L | Gastos medicos pensionados patron | decimal(14,2) | `SUM(gastos_medicos_pensionados_patronal)` anual por RP | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.gastos_medicos_pensionados_patronal]]` |  |
| M | Gastos medicos pensionados obrero | decimal(14,2) | `SUM(gastos_medicos_pensionados_obrera)` anual por RP | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.gastos_medicos_pensionados_obrera]]` |  |
| N | Riesgos de trabajo | decimal(14,2) | `SUM(riesgos_trabajo)` anual por RP | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.riesgos_trabajo]]` | Componente patronal. |
| O | Guarderias y prestaciones sociales | decimal(14,2) | `SUM(guarderias_prestaciones_sociales)` anual por RP | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.guarderias_prestaciones_sociales]]` | Componente patronal. |
| P | Invalidez y vida patron | decimal(14,2) | `SUM(invalidez_vida_patronal)` anual por RP | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.invalidez_vida_patronal]]` |  |
| Q | Invalidez y vida obrero | decimal(14,2) | `SUM(invalidez_vida_obrera)` anual por RP | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.invalidez_vida_obrera]]` |  |
| R | Suerte principal COP | decimal(14,2) | `G + H + I + J + K + L + M + N + O + P + Q` | calculado | La plantilla oficial puede calcularlo; si el TXT requiere valor materializado, usar esta formula. |
| S | Actualizacion | decimal(14,2) | `SUM(actualizacion_cop)` anual por RP | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.actualizacion_cop]]` | `0.00` si no hay pago extemporaneo. |
| T | Recargos | decimal(14,2) | `SUM(recargos_cop)` anual por RP | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.recargos_cop]]` | `0.00` si no hay pago extemporaneo. |
| U | Total de COP | decimal(14,2) | `R + S + T` | calculado | Total derivado. |
| V | Retiro | decimal(14,2) | `SUM(retiro_patronal)` anual por RP | `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.retiro_patronal]]` | Se suma sobre los bimestres del ejercicio. |
| W | Cesantia y vejez patron | decimal(14,2) | `SUM(cesantia_vejez_patronal)` anual por RP | `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.cesantia_vejez_patronal]]` |  |
| X | Cesantia y vejez obrero | decimal(14,2) | `SUM(cesantia_vejez_obrera)` anual por RP | `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.cesantia_vejez_obrera]]` |  |
| Y | Suerte principal RCV | decimal(14,2) | `V + W + X` | calculado | Total derivado. |
| Z | Actualizacion | decimal(14,2) | `SUM(actualizacion_rcv)` anual por RP | `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.actualizacion_rcv]]` | `0.00` si no hay pago extemporaneo. |
| AA | Recargos | decimal(14,2) | `SUM(recargos_rcv)` anual por RP | `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.recargos_rcv]]` | `0.00` si no hay pago extemporaneo. |
| AB | Total RCV | decimal(14,2) | `Y + Z + AA` | calculado | Total derivado. |
| AC | INFONAVIT pagado | decimal(14,2) | `SUM(aportacion_infonavit_sin_credito + aportacion_infonavit_con_credito + amortizacion_creditos_vivienda)` anual por RP | `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.aportacion_infonavit_sin_credito]]` + `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.aportacion_infonavit_con_credito]]` + `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.amortizacion_creditos_vivienda]]` | Reporta lo pagado, por eso incluye amortizacion. |

### Totales

La fila de totales es calculada por la plantilla oficial. Si se materializa fuera del workbook, `B = "Totales"` y las columnas numericas son `SUM` de las filas por RP.

## 3. Reglas de agregacion y transformacion

- **Grain anual por RP:** el output final no conserva folios ni periodos; esos viven en la reconciliation.
- **Mensual vs bimestral:** columnas C a U provienen de informacion mensual; columnas V a AC provienen de informacion bimestral.
- **Cotizantes:** columna C usa el maximo mensual del ejercicio, no la suma de meses.
- **Dias:** columnas D, E y F se suman al ejercicio.
- **Accesorios:** actualizacion y recargos se reportan solo cuando existen en las cedulas; en pagos en plazo son `0.00`.
- **INFONAVIT pagado:** incluye aportaciones patronales y amortizaciones porque la pestaña pide pago al instituto, no gasto patronal.
- **Redondeo:** importes con dos decimales; diferencias de centavos se investigan en reconciliation.

## 4. Casos especiales

### Caso 1 - Pago complementario

- **Cuando ocurre:** existe mas de un folio para el mismo RP y periodo.
- **Regla:** cada folio se valida por separado en reconciliation; para delivery se suma al RP anual.
- **Impacto en columnas:** puede afectar cualquier importe o dias del periodo.
- **Origen:** SOP de RSM Mazatlan, variante Ruben.

### Caso 2 - Pago extemporaneo

- **Cuando ocurre:** el pago incluye actualizacion o recargos.
- **Regla:** reportar accesorios en S/T para COP y Z/AA para RCV.
- **Impacto en columnas:** S, T, Z y AA; los principales permanecen separados.
- **Origen:** schemas de cédula mensual y bimestral.

### Caso 3 - Diferencia RT / EMA / AUD

- **Cuando ocurre:** la prima usada en la cédula, la emitida en IDSE o la determinada por auditoria no coinciden.
- **Regla:** no cambia el delivery de cuotas pagadas; se documenta en reconciliation como soporte y posible hallazgo.
- **Impacto en columnas:** ninguno directo en la pestaña.
- **Origen:** SOP de Ruben y `DOC-declaracion-prima-rt`.

## 5. Formato del TXT final

### Archivo

- **Extension:** `.txt`
- **Encoding:** `ANSI-1252`
- **Delimitador:** `tab`
- **Fin de linea:** `CRLF`
- **Header:** no

### Template del TXT

```text
{{consecutivo}}\t{{rp}}\t{{cotizantes_reportados}}\t{{dias_cotizados}}\t{{dias_ausentismo}}\t{{dias_incapacidad}}\t{{cuota_fija}}\t{{cuota_excedente_patron}}\t{{cuota_excedente_obrero}}\t{{prestaciones_dinero_patron}}\t{{prestaciones_dinero_obrero}}\t{{gastos_medicos_pensionados_patron}}\t{{gastos_medicos_pensionados_obrero}}\t{{riesgos_trabajo}}\t{{guarderias_prestaciones_sociales}}\t{{invalidez_vida_patron}}\t{{invalidez_vida_obrero}}\t{{suerte_principal_cop}}\t{{actualizacion_cop}}\t{{recargos_cop}}\t{{total_cop}}\t{{retiro}}\t{{cesantia_vejez_patron}}\t{{cesantia_vejez_obrero}}\t{{suerte_principal_rcv}}\t{{actualizacion_rcv}}\t{{recargos_rcv}}\t{{total_rcv}}\t{{infonavit_pagado}}
```

### Instrucciones de pegado

1. Abrir `Plantilla_Informacion_Patronal_v10.1 2.xlsm`.
2. Ir a la pestaña `Cuotas pagadas al Instituto`.
3. Pegar las filas del TXT desde `A7`.
4. Confirmar que la fila de totales recalcula correctamente.

## 6. JSON Schema del output

```yaml
$schema: "http://json-schema.org/draft-07/schema#"
type: object
properties:
  rows:
    type: array
    items:
      type: object
      properties:
        consecutivo: {type: integer, minimum: 1}
        rp: {type: string}
        cotizantes_reportados: {type: integer, minimum: 0}
        dias_cotizados: {type: integer, minimum: 0}
        dias_ausentismo: {type: integer, minimum: 0}
        dias_incapacidad: {type: integer, minimum: 0}
        cuota_fija: {type: number, minimum: 0}
        cuota_excedente_patron: {type: number, minimum: 0}
        cuota_excedente_obrero: {type: number, minimum: 0}
        prestaciones_dinero_patron: {type: number, minimum: 0}
        prestaciones_dinero_obrero: {type: number, minimum: 0}
        gastos_medicos_pensionados_patron: {type: number, minimum: 0}
        gastos_medicos_pensionados_obrero: {type: number, minimum: 0}
        riesgos_trabajo: {type: number, minimum: 0}
        guarderias_prestaciones_sociales: {type: number, minimum: 0}
        invalidez_vida_patron: {type: number, minimum: 0}
        invalidez_vida_obrero: {type: number, minimum: 0}
        suerte_principal_cop: {type: number, minimum: 0}
        actualizacion_cop: {type: number, minimum: 0}
        recargos_cop: {type: number, minimum: 0}
        total_cop: {type: number, minimum: 0}
        retiro: {type: number, minimum: 0}
        cesantia_vejez_patron: {type: number, minimum: 0}
        cesantia_vejez_obrero: {type: number, minimum: 0}
        suerte_principal_rcv: {type: number, minimum: 0}
        actualizacion_rcv: {type: number, minimum: 0}
        recargos_rcv: {type: number, minimum: 0}
        total_rcv: {type: number, minimum: 0}
        infonavit_pagado: {type: number, minimum: 0}
      required:
        - consecutivo
        - rp
        - cotizantes_reportados
        - dias_cotizados
        - dias_ausentismo
        - dias_incapacidad
        - cuota_fija
        - cuota_excedente_patron
        - cuota_excedente_obrero
        - prestaciones_dinero_patron
        - prestaciones_dinero_obrero
        - gastos_medicos_pensionados_patron
        - gastos_medicos_pensionados_obrero
        - riesgos_trabajo
        - guarderias_prestaciones_sociales
        - invalidez_vida_patron
        - invalidez_vida_obrero
        - suerte_principal_cop
        - actualizacion_cop
        - recargos_cop
        - total_cop
        - retiro
        - cesantia_vejez_patron
        - cesantia_vejez_obrero
        - suerte_principal_rcv
        - actualizacion_rcv
        - recargos_rcv
        - total_rcv
        - infonavit_pagado
required: [rows]
```

## 7. Matriz de validacion

| Columna | rec. RSM Mazatlan |
|---------|-------------------|
| A | ○ |
| B | ✓ |
| C | ✓ |
| D | ✓ |
| E | ✓ |
| F | ✓ |
| G | ✓ |
| H | ✓ |
| I | ✓ |
| J | ✓ |
| K | ✓ |
| L | ✓ |
| M | ✓ |
| N | ✓ |
| O | ✓ |
| P | ✓ |
| Q | ✓ |
| R | ✓ |
| S | ✓ |
| T | ✓ |
| U | ✓ |
| V | ✓ |
| W | ✓ |
| X | ✓ |
| Y | ✓ |
| Z | ✓ |
| AA | ✓ |
| AB | ✓ |
| AC | ✓ |

Leyenda: ✓ valida, ○ no aplica.

## 8. Preguntas abiertas

- Confirmar si el harness final debe materializar columnas calculadas R, U, Y y AB o dejarlas a formulas del workbook oficial.

## 9. Notas de mantenimiento

- `DOC-emision-ema` se cargo con `01 - Spec (1).md`; dejar esta desviacion visible hasta normalizar el nombre del archivo.
- `Alta de Seguro` y `Tarjeta de Identificacion Patronal` no se consideran en esta corrida porque son condicionales y el usuario decidio excluirlas.
