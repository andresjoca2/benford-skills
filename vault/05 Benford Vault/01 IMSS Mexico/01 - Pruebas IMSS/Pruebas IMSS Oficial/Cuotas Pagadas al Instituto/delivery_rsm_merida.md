---
id: PRUEBA-IMSS-cuotas-pagadas-instituto/delivery
type: prueba-delivery
audit: imss
parent_prueba: PRUEBA-IMSS-cuotas-pagadas-instituto
pestaña_excel: "Cuotas pagadas al Instituto"
grain: "una fila anual por registro patronal"
columnas_count: 29
formato_fisico: txt
encoding: ANSI-1252
delimitador: tab
celda_inicial_excel: "A7"
status: draft
version: 1
data_sources:
  - DOC-cedula-determinacion-mensual
  - DOC-cedula_determinacion_bimestral
validated_by:
  - PRUEBA-IMSS-cuotas-pagadas-instituto/reconciliation/rsm-merida
---

# Cuotas pagadas al Instituto — Delivery (RSM Merida)

## 1. Objetivo del entregable

Llenar la pestaña oficial **Cuotas pagadas al Instituto** con importes anuales por registro patronal, separando COP, RCV e INFONAVIT pagado.

## 2. Contrato de salida

### Grain

Una fila por registro patronal del ejercicio. Las cédulas mensuales se agregan al año; las cédulas bimestrales se agregan por bimestres del ejercicio.

### Columnas oficiales

| Col | Variable IMSS | Fórmula | Fuente canónica | Clasificación |
|---|---|---|---|---|
| A | Consecutivo | `ROW_NUMBER()` | generado | llega_al_dictamen |
| B | RP | directo | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.registro_patronal]]` | llega_al_dictamen |
| C | Cotizantes reportados | `MAX(total_cotizantes)` | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.total_cotizantes]]` | llega_al_dictamen |
| D | Dias cotizados | `SUM(total_dias_cotizados)` | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.total_dias_cotizados]]` | llega_al_dictamen |
| E | Dias de ausentismo | `SUM(total_dias_ausentismo)` | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.total_dias_ausentismo]]` | llega_al_dictamen |
| F | Dias de incapacidad | `SUM(total_dias_incapacidad)` | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.total_dias_incapacidad]]` | llega_al_dictamen |
| G | Cuota fija | `SUM(cuota_fija)` | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.cuota_fija]]` | llega_al_dictamen |
| H | Cuota excedente patron | `SUM(excedente_patronal)` | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.excedente_patronal]]` | llega_al_dictamen |
| I | Cuota excedente obrero | `SUM(excedente_obrero)` | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.excedente_obrero]]` | llega_al_dictamen |
| J | Prestaciones en dinero patron | `SUM(prestaciones_dinero_patronal)` | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.prestaciones_dinero_patronal]]` | llega_al_dictamen |
| K | Prestaciones en dinero obrero | `SUM(prestaciones_dinero_obrera)` | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.prestaciones_dinero_obrera]]` | llega_al_dictamen |
| L | Gastos medicos pensionados patron | `SUM(gastos_medicos_pensionados_patronal)` | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.gastos_medicos_pensionados_patronal]]` | llega_al_dictamen |
| M | Gastos medicos pensionados obrero | `SUM(gastos_medicos_pensionados_obrera)` | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.gastos_medicos_pensionados_obrera]]` | llega_al_dictamen |
| N | Riesgos de trabajo | `SUM(riesgos_trabajo)` | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.riesgos_trabajo]]` | llega_al_dictamen |
| O | Guarderias y prestaciones sociales | `SUM(guarderias_prestaciones_sociales)` | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.guarderias_prestaciones_sociales]]` | llega_al_dictamen |
| P | Invalidez y vida patron | `SUM(invalidez_vida_patronal)` | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.invalidez_vida_patronal]]` | llega_al_dictamen |
| Q | Invalidez y vida obrero | `SUM(invalidez_vida_obrera)` | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.invalidez_vida_obrera]]` | llega_al_dictamen |
| R | Suerte principal COP | `G:Q` | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.suma_todos_componentes]]` | llega_al_dictamen |
| S | Actualizacion COP | `SUM(actualizacion_cop)` | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.actualizacion_cop]]` | llega_al_dictamen |
| T | Recargos COP | `SUM(recargos_cop)` | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.recargos_cop]]` | llega_al_dictamen |
| U | Total de COP | `R + S + T` | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.total_cop_con_accesorios]]` | llega_al_dictamen |
| V | Retiro | `SUM(retiro_patronal)` | `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.retiro_patronal]]` | llega_al_dictamen |
| W | Cesantia y vejez patron | `SUM(cesantia_vejez_patronal)` | `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.cesantia_vejez_patronal]]` | llega_al_dictamen |
| X | Cesantia y vejez obrero | `SUM(cesantia_vejez_obrera)` | `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.cesantia_vejez_obrera]]` | llega_al_dictamen |
| Y | Suerte principal RCV | `V + W + X` | `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.total_rcv_sin_retencion]]` | llega_al_dictamen |
| Z | Actualizacion RCV | `SUM(actualizacion_rcv)` | `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.actualizacion_rcv]]` | llega_al_dictamen |
| AA | Recargos RCV | `SUM(recargos_rcv)` | `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.recargos_rcv]]` | llega_al_dictamen |
| AB | Total RCV | `Y + Z + AA` | `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.total_rcv_con_accesorios]]` | llega_al_dictamen |
| AC | INFONAVIT pagado | `aportacion sin credito + aportacion con credito + amortizacion` | `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.aportacion_infonavit_sin_credito]]`, `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.aportacion_infonavit_con_credito]]`, `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.amortizacion_creditos_vivienda]]` | llega_al_dictamen |

## 3. Reglas de agregacion

- Cifras mensuales COP: sumar por registro patronal y ejercicio.
- Cifras bimestrales RCV/INFONAVIT: sumar por registro patronal y ejercicio.
- Cotizantes reportados: usar el maximo anual observado por registro patronal.
- INFONAVIT pagado incluye amortizacion porque el dictamen reporta pago al instituto, no solo gasto patronal.

## 4. Casos especiales

- Pagos extemporaneos: poblar actualizacion y recargos cuando las cedulas los exhiban.
- Cifras obreras: llegan al dictamen aunque no formen parte del gasto patronal validado contra balanza.
- Amortizacion INFONAVIT: llega al dictamen como pago, pero no se valida contra gasto patronal.

## 5. Formato TXT final

- Extension: `.txt`
- Encoding: `ANSI-1252`
- Delimitador: `tab`
- Header: no
- Grain: una linea por registro patronal

## 6. JSON Schema del output

```yaml
type: object
properties:
  rows:
    type: array
    items:
      type: object
      required: [consecutivo, registro_patronal]
required: [rows]
```

## 7. Matriz de validacion

RSM Merida valida directamente el gasto patronal de COP, RCV e INFONAVIT contra balanza. Valida parcialmente el delivery porque no cubre con balanza los componentes obreros, amortizaciones ni accesorios; esos se soportan documentalmente con cedulas y comprobantes.

## 8. Preguntas abiertas

- Confirmar si RSM Merida quiere conservar como obligatorio el auxiliar contable cuando la diferencia total sea menor a la tolerancia.

## 9. Notas de mantenimiento

- `status: draft`.
- Los cambios futuros deben mantener wiki-links a columnas especificas de schemas.
