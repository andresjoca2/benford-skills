---
# ── Identidad ────────────────────────────────────────────────
id: PRUEBA-IMSS-cuotas-pagadas-al-instituto/reconciliation/traust-monterrey
type: prueba-reconciliation
audit: imss
parent_prueba: PRUEBA-IMSS-cuotas-pagadas-al-instituto
oficina: monterrey
firma: traust
metodologia_nombre: "DGE — amarre de cuotas determinadas desde SUA contra comprobantes bancarios"

# ── Autoría y origen ─────────────────────────────────────────
contribuciones:
  - CONTRIB-2026-04-24-melanie-traust
  - CONTRIB-2026-04-24-nelly-traust
auditores_documentados:
  - "Melanie"
  - "Nelly"

# ── Estado ───────────────────────────────────────────────────
status: draft
version: 1
last_decision: null

# ── Superficie del amarre ────────────────────────────────────
artefacto_final:
  nombre: "DGE - archivo de trabajo con DGE-1 DGE-2 y DGE-3.xlsx"
  formato: xlsx
  hoja_principal: "DGE-2 y DGE-3"
  unidad_control: "RP-periodo"

# ── Fuentes canónicas ─────────────────────────────────────────
data_sources:
  - DOC-disco-sua
  - DOC-comprobante-pago-sua

# ── Columnas del delivery que esta reconciliation valida ─────
columnas_validadas:
  - B
  - C
  - D
  - E
  - F
  - G
  - H
  - I
  - J
  - K
  - L
  - M
  - N
  - O
  - P
  - Q
  - R
  - S
  - T
  - U
  - V
  - W
  - X
  - Y
  - Z
  - AA
  - AB
  - AC
columnas_no_cubiertas:
  - A

# ── Papeles de trabajo generados ─────────────────────────────
papeles_de_trabajo:
  - PT-dge-1
  - PT-dge-2-cop
  - PT-dge-2-rcv
  - PT-dge-3-infonavit

# ── Extras de la oficina ─────────────────────────────────────
has_extras: true
---

# Cuotas pagadas al Instituto — Reconciliation (Traust Monterrey)

---

## 1. Overview

Traust Monterrey documenta la prueba oficial **"Cuotas pagadas al Instituto"** con la metodología operativa DGE. El flujo real es:

1. traducir los archivos `.SUA` del cliente;
2. acumularlos por registro patronal en ACUMSUA;
3. capturar y validar los importes en el workbook DGE;
4. cruzar lo determinado contra los comprobantes bancarios de pago SUA;
5. consolidar el resultado anual en una sola fila por RP para el delivery oficial.

ACUMSUA no es un documento canónico nuevo: es una vista acumulada del `DOC-disco-sua`. El DGE tampoco es un `DOC-*`: es el papel de trabajo donde Traust hace el amarre.

## 2. Objetivo específico del amarre

Validar que las cuotas determinadas desde los archivos `.SUA` para cada registro patronal y periodo coinciden con lo efectivamente pagado según el comprobante bancario. El comprobante no alimenta el delivery, pero sí bloquea el cierre de la prueba si falta.

## 3. Artefacto final

- **Workbook:** `DGE - archivo de trabajo con DGE-1 DGE-2 y DGE-3.xlsx`
- **Formato:** xlsx
- **Hojas relevantes:** `DGE-1`, `DGE-2`, `DGE-3`
- **Hoja autoritativa:** `DGE-2` para COP y RCV; `DGE-3` para INFONAVIT
- **Unidad de control:** RP-periodo, mensual para COP y bimestral para RCV/INFONAVIT
- **Cierre visible:** cada periodo debe cuadrar contra comprobante bancario; si falta comprobante, la prueba queda pendiente

## 4. Inputs al amarre

| Input | Fuente canónica | Uso |
|-------|-----------------|-----|
| Registro patronal | `[[DOC-disco-sua/02 - Schema#disco_sua_empresa.registro_patronal]]` | Identificar el RP trabajado en ACUMSUA, DGE y delivery. |
| RFC del patrón | `[[DOC-disco-sua/02 - Schema#disco_sua_empresa.rfc_patron]]` | Validación de identidad del paquete `.SUA`. |
| Periodo | `[[DOC-disco-sua/02 - Schema#disco_sua_empresa.periodo]]` | Separar meses y bimestres del ejercicio. |
| Folio SUA | `[[DOC-disco-sua/02 - Schema#disco_sua_empresa.folio_sua]]` | Amarrar cada periodo a su folio de liquidación. |
| Total de trabajadores | `[[DOC-disco-sua/02 - Schema#disco_sua_empresa.total_trabajadores]]` | Cotizantes reportados y control mensual. |
| Días cotizados | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.dias_mes]]` | Alimenta DGE-2 y delivery. |
| Días de ausentismo | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.dias_ausentismo_mes]]` | Alimenta DGE-2 y delivery. |
| Días de incapacidad | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.dias_incapacidad_mes]]` | Alimenta DGE-2 y delivery. |
| Cuota fija | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cuota_fija]]` | COP patronal. |
| Excedente patrón | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cuota_excedente_patronal]]` | COP patronal. |
| Excedente obrero | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cuota_excedente_obrera]]` | COP obrero. |
| Prestaciones dinero patrón | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.prestaciones_dinero_patronal]]` | COP patronal. |
| Prestaciones dinero obrero | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.prestaciones_dinero_obrera]]` | COP obrero. |
| Gastos médicos pensionados patrón | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.gastos_medicos_pensionados_patronal]]` | COP patronal. |
| Gastos médicos pensionados obrero | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.gastos_medicos_pensionados_obrera]]` | COP obrero. |
| Riesgos de trabajo | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.riesgos_trabajo]]` | COP patronal. |
| Guarderías y prestaciones sociales | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.guarderias_prestaciones_sociales]]` | COP patronal. |
| Invalidez y vida patrón | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.invalidez_vida_patronal]]` | COP patronal. |
| Invalidez y vida obrero | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.invalidez_vida_obrera]]` | COP obrero. |
| Actualización IMSS | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.actualizacion_imss]]` | Accesorios COP. |
| Recargos IMSS | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.recargos_imss]]` | Accesorios COP. |
| Retiro | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.retiro]]` | RCV bimestral. |
| Cesantía y vejez patrón | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cesantia_vejez_patronal]]` | RCV bimestral. |
| Cesantía y vejez obrero | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cesantia_vejez_obrera]]` | RCV bimestral. |
| Actualización RCV | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.actualizacion_rcv]]` | Accesorios RCV. |
| Recargos RCV | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.recargos_rcv]]` | Accesorios RCV. |
| Aportación patronal INFONAVIT | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.aportacion_patronal]]` | INFONAVIT bimestral. |
| Amortización INFONAVIT | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.amortizacion]]` | INFONAVIT bimestral. |
| Actualización INFONAVIT | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.actualizacion_infonavit]]` | Accesorios INFONAVIT. |
| Recargos INFONAVIT | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.recargos_infonavit]]` | Accesorios INFONAVIT. |
| Línea de captura | `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.linea_captura]]` | Identificar el pago bancario. |
| Importe IMSS pagado | `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.importe_imss]]` | Validar Total COP. |
| Importe RCV pagado | `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.importe_rcv]]` | Validar Total RCV. |
| Importe vivienda pagado | `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.importe_vivienda]]` | Validar INFONAVIT. |
| Importe ACV pagado | `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.importe_acv]]` | Validar INFONAVIT. |
| Importe total pagado | `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.importe_total]]` | Validación global del comprobante. |
| Fecha de pago | `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.fecha_pago]]` | Cierre del periodo en DGE. |
| Banco | `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.banco]]` | Evidencia del pago. |

## 5. Procedimiento paso a paso

### Paso 1 — Armar ACUMSUA por RP

- **Input:** archivos `.SUA` del ejercicio por RP.
- **Operación:** traducir cada `.SUA`, validar que corresponda al RP y periodo correcto, y acumular el ejercicio por registro patronal.
- **Output:** ACUMSUA operativo derivado de `DOC-disco-sua`.
- **Papel de trabajo:** [[#PT-dge-1 — ficha del registro patronal]]

### Paso 2 — Separar periodos mensuales y bimestrales

- **Input:** `[[DOC-disco-sua/02 - Schema#disco_sua_empresa.periodo]]`
- **Operación:** clasificar meses impares/pares. Los meses pares cierran bimestre para RCV e INFONAVIT.
- **Output:** calendario de trabajo por RP-periodo.

### Paso 3 — Llenar DGE-2 para COP mensual

- **Input:** `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cuota_fija]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cuota_excedente_patronal]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cuota_excedente_obrera]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.prestaciones_dinero_patronal]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.prestaciones_dinero_obrera]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.gastos_medicos_pensionados_patronal]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.gastos_medicos_pensionados_obrera]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.riesgos_trabajo]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.guarderias_prestaciones_sociales]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.invalidez_vida_patronal]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.invalidez_vida_obrera]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.actualizacion_imss]]` y `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.recargos_imss]]`.
- **Operación:** sumar por RP-mes los días, cotizantes y componentes patronales/obreros de COP.
- **Output:** tabla mensual COP en DGE-2.
- **Papel de trabajo:** [[#PT-dge-2-cop — cuotas obrero patronales mensuales]]

### Paso 4 — Llenar DGE-2 para RCV bimestral

- **Input:** `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.retiro]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cesantia_vejez_patronal]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cesantia_vejez_obrera]]`.
- **Operación:** sumar por RP-bimestre y calcular Total RCV con actualización y recargos cuando existan.
- **Output:** tabla bimestral RCV en DGE-2.
- **Papel de trabajo:** [[#PT-dge-2-rcv — RCV bimestral]]

### Paso 5 — Llenar DGE-3 para INFONAVIT

- **Input:** `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.aportacion_patronal]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.amortizacion]]`, accesorios INFONAVIT del sumario.
- **Operación:** sumar aportaciones y amortizaciones por RP-bimestre.
- **Output:** tabla bimestral INFONAVIT en DGE-3.
- **Papel de trabajo:** [[#PT-dge-3-infonavit — aportaciones y amortizaciones]]

### Paso 6 — Cruzar contra comprobante bancario

- **Input:** `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.registro_patronal]]`, `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.folio_sua]]`, `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.linea_captura]]`, `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.importe_imss]]`, `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.importe_rcv]]`, `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.importe_vivienda]]`, `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.importe_acv]]`, `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.importe_total]]`, `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.fecha_pago]]` y `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.banco]]`.
- **Operación:** buscar el comprobante por RP-periodo y, cuando exista, comparar:
  - Total COP contra `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.importe_imss]]`
  - Total RCV contra `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.importe_rcv]]`
  - INFONAVIT contra `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.importe_vivienda]] + [[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.importe_acv]]`
- **Output:** estatus de cierre por periodo.

### Paso 7 — Consolidar al delivery oficial

- **Input:** DGE validado por RP-periodo.
- **Operación:** sumar el ejercicio por registro patronal y producir una línea anual por RP.
- **Output:** fila del delivery `Cuotas pagadas al Instituto`.

## 6. Reglas de cierre y tolerancias

- **Criterio de cierre:** todos los periodos del RP deben tener comprobante bancario y diferencia igual a `0.00` contra lo determinado desde `.SUA`, después de normalizar importes a dos decimales.
- **Tolerancia:** no hay tolerancia operativa. Cualquier diferencia distinta de `0.00` queda abierta.
- **Regla de status:**
  - `cuadrado` si todos los importes del periodo cuadran contra comprobante;
  - `con diferencia` si existe comprobante pero los importes no cuadran;
  - `sin soporte` si falta el comprobante bancario;
  - `incompleto` si falta el `.SUA` del periodo.
- **Qué hacer cuando no cierra:** revisar primero que el `.SUA` sea el correcto, después que el comprobante corresponda al RP-periodo, y finalmente que no exista pago complementario.

## 7. Papeles de trabajo generados

### PT-dge-1 — ficha del registro patronal

- **Propósito:** identificar el RP, empresa, ejercicio y datos base usados en el DGE.
- **Grain:** un row por RP.
- **Inputs:** `[[DOC-disco-sua/02 - Schema#disco_sua_empresa.registro_patronal]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_empresa.rfc_patron]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_empresa.razon_social]]`.
- **Se entrega al IMSS:** sí, como soporte del paquete DGE.
- **Columnas del papel:**
  - `registro_patronal`: text — RP normalizado.
  - `rfc_patron`: text — RFC del patrón.
  - `razon_social`: text — nombre del patrón.
  - `ejercicio`: int — año auditado.

### PT-dge-2-cop — cuotas obrero patronales mensuales

- **Propósito:** soportar la parte mensual de COP con desglose patrón/obrero.
- **Grain:** un row por RP-mes y tipo de pago.
- **Inputs:** `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cuota_fija]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cuota_excedente_patronal]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cuota_excedente_obrera]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.prestaciones_dinero_patronal]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.prestaciones_dinero_obrera]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.gastos_medicos_pensionados_patronal]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.gastos_medicos_pensionados_obrera]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.riesgos_trabajo]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.guarderias_prestaciones_sociales]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.invalidez_vida_patronal]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.invalidez_vida_obrera]]` y comprobante bancario.
- **Se entrega al IMSS:** sí.
- **Columnas del papel:**
  - `periodo`: text — mes trabajado.
  - `folio_sua`: text — folio del `.SUA`.
  - `total_trabajadores`: int — cotizantes del periodo.
  - `dias_cotizados`: int — suma mensual.
  - `dias_ausentismo`: int — suma mensual.
  - `dias_incapacidad`: int — suma mensual.
  - `componentes_cop`: decimal — desglose de cuota fija, excedente, prestaciones, GMP, RT, IV y guarderías.
  - `total_cop`: decimal — total determinado.
  - `importe_pagado`: decimal — importe IMSS del comprobante.
  - `diferencia`: decimal — determinado menos pagado.
  - `status`: text — cierre del periodo.

### PT-dge-2-rcv — RCV bimestral

- **Propósito:** soportar retiro, cesantía y vejez por RP-bimestre.
- **Grain:** un row por RP-bimestre y tipo de pago.
- **Inputs:** `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.retiro]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cesantia_vejez_patronal]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cesantia_vejez_obrera]]`, comprobante bancario.
- **Se entrega al IMSS:** sí.
- **Columnas del papel:**
  - `bimestre`: int — 1 a 6.
  - `folio_sua`: text — folio que cierra el bimestre.
  - `retiro`: decimal — componente patronal.
  - `cesantia_vejez_patronal`: decimal — componente patronal.
  - `cesantia_vejez_obrera`: decimal — componente obrero.
  - `total_rcv`: decimal — total determinado.
  - `importe_pagado`: decimal — importe RCV del comprobante.
  - `diferencia`: decimal — determinado menos pagado.

### PT-dge-3-infonavit — aportaciones y amortizaciones

- **Propósito:** soportar INFONAVIT pagado por RP-bimestre.
- **Grain:** un row por RP-bimestre y tipo de pago.
- **Inputs:** `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.aportacion_patronal]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.amortizacion]]`, comprobante bancario.
- **Se entrega al IMSS:** sí.
- **Columnas del papel:**
  - `bimestre`: int — 1 a 6.
  - `trabajadores_con_credito`: int — trabajadores acreditados.
  - `trabajadores_incluidos`: int — población del bimestre.
  - `aportacion_patronal`: decimal — aportación INFONAVIT.
  - `amortizacion`: decimal — amortización de crédito.
  - `total_infonavit`: decimal — total determinado.
  - `importe_pagado`: decimal — vivienda + ACV del comprobante.
  - `diferencia`: decimal — determinado menos pagado.

## 8. Casos especiales y bifurcaciones

### Caso — falta comprobante bancario

- **Cuándo:** la empresa no entrega el comprobante de un periodo.
- **Qué hacer:** no cerrar la prueba; marcar el periodo como `sin soporte`.
- **Papel de trabajo afectado:** PT-dge-2-cop, PT-dge-2-rcv o PT-dge-3-infonavit.
- **Origen:** SOP DGE Melanie + decisión de sesión.

### Caso — falta `.SUA`

- **Cuándo:** falta el archivo del periodo.
- **Qué hacer:** el ACUMSUA queda incompleto; una cédula PDF puede ayudar a entender importes, pero no sustituye el `.SUA` para cerrar esta metodología.
- **Papel de trabajo afectado:** todos los PT del RP-periodo.
- **Origen:** SOP ACUMSUA Nelly.

### Caso — pago complementario

- **Cuándo:** aparece un folio adicional para el mismo RP-periodo.
- **Qué hacer:** capturar el folio complementario y sumar sus importes al consolidado anual.
- **Papel de trabajo afectado:** DGE-2 o DGE-3 según el ramo.
- **Origen:** SOP DGE Melanie.

## 9. Extras de la oficina (opcionales, no requeridas por IMSS)

### Extra 1 — ACUMSUA como base reutilizable

- **Qué hace:** conserva el acumulado anual por RP para otras pruebas: altas, bajas, movimientos, topados, DGE y revisiones mensuales/bimestrales.
- **Por qué esta oficina lo hace:** Traust usa ACUMSUA como base upstream para varias pruebas.
- **Requerido por IMSS:** false
- **Inputs adicionales:** ninguno; deriva de `DOC-disco-sua`.
- **Salida:** Excel acumulado operativo.

### Extra 2 — separación gasto patrón vs retención obrera

- **Qué hace:** deja visible qué parte corresponde a costo patronal y qué parte a cuota obrera retenida.
- **Por qué esta oficina lo hace:** ayuda a revisar captura y posibles amarres contables posteriores.
- **Requerido por IMSS:** false
- **Inputs adicionales:** ninguno.
- **Salida:** validación interna dentro del DGE.

## 10. Errores comunes y alertas

- Usar un `.SUA` que no corresponde al RP-periodo.
- Mezclar registros patronales cuando el cliente entrega varios.
- Capturar mal fecha de pago o año.
- Usar comprobante de otro mes o de otro pago.
- Tratar ACUMSUA como documento canónico separado, cuando es vista derivada del `.SUA`.
- Cerrar la prueba sin comprobante bancario.

## 11. Preguntas abiertas

- Confirmar si el workbook DGE final que usará Traust Monterrey requiere algún campo de presentación adicional que no cambie la lógica del amarre.

## 12. Notas de mantenimiento

- El delivery oficial se queda anual por RP; esta reconciliation conserva el detalle RP-periodo.
- Si se robustecen campos calculados del schema `DOC-disco-sua`, actualizar los wiki-links de patrón/obrero en este archivo y en el delivery.
