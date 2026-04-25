---
id: PRUEBA-IMSS-cuotas-pagadas-instituto/reconciliation/rsm-merida
type: prueba-reconciliation
audit: imss
parent_prueba: PRUEBA-IMSS-cuotas-pagadas-instituto
oficina: rsm-merida
firma: rsm
metodologia_nombre: "Amarre contable-operativo por COPS y balanza"
status: draft
version: 1
artefacto_final:
  nombre: "5.1.1 - Resumen Liquidaciones mens. Y bimes..xlsx"
  formato: xlsx
  hoja_principal: "Amarre"
  unidad_control: "ramo contable consolidado"
data_sources:
  - DOC-cedula-determinacion-mensual
  - DOC-cedula_determinacion_bimestral
  - DOC-comprobante-pago-sua
  - DOC-balanza-comprobacion-anual
  - DOC-balanza-auxiliar-gastos
papeles_de_trabajo:
  - PT-rsm-merida-cops
  - PT-rsm-merida-amarre-contable
has_extras: true
---

# Cuotas pagadas al Instituto — Reconciliation (RSM Merida)

## 1. Overview

RSM Merida usa dos capas. Primero captura con DataSnipper la informacion de cedulas mensuales y bimestrales en un workbook de extraccion; despues consolida esa informacion por registro patronal y la pega en el COPS del workbook final. El cierre de auditoria no se hace por folio, sino por ramos contables: Cuotas IMSS, RCV e INFONAVIT.

## 2. Objetivo especifico del amarre

Validar que el saldo operativo patronal reconstruido desde cedulas y comprobantes sea razonable contra la balanza anual. El amarre contable valida gasto patronal; el delivery del dictamen conserva tambien importes obreros y pagos de vivienda que no son gasto patronal.

## 3. Artefacto final

- Workbook de extraccion: `5.1.1Resumen de liquidaciones.xlsx`
- Workbook final: `5.1.1 - Resumen Liquidaciones mens. Y bimes..xlsx`
- Hojas relevantes: `Form Extraction`, `CONCENTRADO`, `ÍTEM`, `COPS`, `BC`, `Amarre`
- Unidad de control: ramo contable consolidado
- Cierre visible: diferencia por ramo y diferencia total

## 4. Inputs al amarre

| Input | Fuente canonica | Uso |
|---|---|---|
| Registro patronal | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.registro_patronal]]` | llave operativa |
| Componentes COP patronales | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.cuota_fija]]`, `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.excedente_patronal]]`, `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.prestaciones_dinero_patronal]]`, `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.gastos_medicos_pensionados_patronal]]`, `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.riesgos_trabajo]]`, `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.guarderias_prestaciones_sociales]]`, `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.invalidez_vida_patronal]]` | saldo operativo IMSS patronal |
| Componentes RCV patronales | `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.retiro_patronal]]`, `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.cesantia_vejez_patronal]]` | saldo operativo RCV patronal |
| Aportaciones INFONAVIT patronales | `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.aportacion_infonavit_sin_credito]]`, `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.aportacion_infonavit_con_credito]]` | saldo operativo Infonavit patronal |
| Comprobante de pago | `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.folio_sua]]`, `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.fecha_pago]]`, `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.banco]]`, `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.importe_total]]` | trazabilidad del pago |
| Balanza | `[[DOC-balanza-comprobacion-anual/02 - Schema#balanza_cuentas.numero_cuenta]]`, `[[DOC-balanza-comprobacion-anual/02 - Schema#balanza_cuentas.descripcion]]`, `[[DOC-balanza-comprobacion-anual/02 - Schema#balanza_cuentas.saldo_final]]` | saldo contable |
| Auxiliar | `[[DOC-balanza-auxiliar-gastos/02 - Schema#auxiliar_movimientos.numero_cuenta]]`, `[[DOC-balanza-auxiliar-gastos/02 - Schema#auxiliar_movimientos.fecha]]`, `[[DOC-balanza-auxiliar-gastos/02 - Schema#auxiliar_movimientos.poliza]]`, `[[DOC-balanza-auxiliar-gastos/02 - Schema#auxiliar_movimientos.concepto]]`, `[[DOC-balanza-auxiliar-gastos/02 - Schema#auxiliar_movimientos.cargo]]`, `[[DOC-balanza-auxiliar-gastos/02 - Schema#auxiliar_movimientos.abono]]` | investigacion de diferencias |

## 5. Procedimiento paso a paso

### Paso 1 — Extraer cedulas

- Input: cedulas mensuales y bimestrales aprobadas.
- Operacion: capturar la tabla de DataSnipper por registro patronal y periodo.
- Output: tabla de extraccion con componentes COP, RCV e INFONAVIT.

### Paso 2 — Consolidar por registro patronal

- Input: tabla de extraccion.
- Operacion: agrupar por registro patronal y ejercicio; sumar componentes monetarios y dias; tomar cotizantes segun regla del delivery.
- Output: tabla anual por registro patronal.

### Paso 3 — Construir COPS

- Input: tabla anual por registro patronal y comprobantes.
- Operacion: preparar el resumen operativo con folio, fecha, banco, componentes COP, RCV e INFONAVIT.
- Output: PT-rsm-merida-cops.

### Paso 4 — Obtener saldo contable

- Input: balanza anual.
- Operacion: identificar las cuentas usadas por la oficina para Cuotas IMSS, Cesantia y Vejez e Infonavit; tomar saldo final.
- Output: saldo contable por ramo.

### Paso 5 — Calcular diferencias

- Input: saldo contable y saldo operativo patronal.
- Operacion: restar saldo operativo patronal al saldo contable por ramo.
- Output: PT-rsm-merida-amarre-contable.

### Paso 6 — Investigar diferencias

- Input: diferencias y auxiliar contable.
- Operacion: abrir movimientos de las cuentas involucradas y clasificar reclasificaciones, pagos complementarios, periodos faltantes o diferencias reales.
- Output: soporte interno o hallazgo.

## 6. Reglas de cierre y tolerancias

- Criterio de cierre: diferencia total explicada o dentro de tolerancia.
- Tolerancia: `abs(diferencia_total) <= 0.01`.
- Estado:
  - `cuadrado` si la diferencia total esta dentro de tolerancia.
  - `con diferencia` si queda diferencia explicada fuera de tolerancia.
  - `incompleto` si faltan cedulas, comprobantes o balanza.
- En el workbook revisado, las diferencias observadas son menores por ramo pero no exactamente cero: IMSS 38.15, RCV 53.11, Infonavit 38.87, total 130.13.

## 7. Papeles de trabajo generados

### PT-rsm-merida-cops

- Proposito: concentrar componentes operativos por periodo y registro patronal.
- Grain: periodo por registro patronal.
- Inputs: cedulas mensual/bimestral y comprobantes.
- Se entrega al IMSS: no, soporte interno.
- Salida: base para el delivery y para el amarre contable.

### PT-rsm-merida-amarre-contable

- Proposito: comparar gasto patronal operativo contra balanza.
- Grain: ramo contable consolidado.
- Inputs: COPS y balanza.
- Se entrega al IMSS: no, soporte interno.
- Salida: diferencia por IMSS, RCV e Infonavit.

## 8. Casos especiales

### Diferencia menor

- Cuando: diferencia total fuera de cero pero materialmente baja.
- Que hacer: documentar monto, confirmar que no proviene de captura faltante y conservar como diferencia explicada si la oficina lo acepta.

### Amortizacion INFONAVIT

- Cuando: el dictamen pide pago al instituto, pero la balanza solo valida gasto patronal.
- Que hacer: incluir amortizacion en delivery y excluirla del amarre de gasto patronal.

### Componentes obreros

- Cuando: el delivery reporta cuotas obreras, pero el amarre contable valida gasto patronal.
- Que hacer: soportar contra cedulas y comprobantes; no esperar que cuadren contra cuentas de gasto patronal.

## 9. Extras de la oficina

RSM Merida conserva el auxiliar como ruta de investigacion. No es fuente principal del calculo, pero se vuelve necesario cuando la diferencia no queda explicada por redondeo, reclasificacion o periodo.

## 10. Errores comunes y alertas

- Mezclar componentes obreros con gasto patronal.
- Incluir amortizacion como si fuera gasto patronal.
- Usar balanza sin validar que las cuentas elegidas correspondan al catalogo del cliente.
- Copiar el concentrado al COPS sin preservar el registro patronal y periodo.

## 11. Preguntas abiertas

- Confirmar si la tolerancia de 0.01 es politica de RSM Merida o solo criterio operativo del workbook.
- Confirmar si diferencias menores como 130.13 se documentan como diferencia aceptada o requieren auxiliar obligatorio.

## 12. Notas de mantenimiento

- Esta metodologia explica la variante Josefina / RSM Merida.
- No redefine el delivery oficial; solo declara que parte valida esta oficina y que parte queda soportada documentalmente.
