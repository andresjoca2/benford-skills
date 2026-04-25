---
# -- Identidad ------------------------------------------------
id: PRUEBA-IMSS-cuotas-pagadas-al-instituto/reconciliation/rsm-mazatlan
type: prueba-reconciliation
audit: imss
parent_prueba: PRUEBA-IMSS-cuotas-pagadas-al-instituto
oficina: rsm-mazatlan
firma: rsm
metodologia_nombre: "Vaciado de liquidaciones - amarre por folio SUA"

# -- Autoria y origen -----------------------------------------
contribuciones:
  - CONTRIB-2026-04-24-ruben-rsm-mazatlan
auditores_documentados:
  - "Ruben"

# -- Estado ----------------------------------------------------
status: draft
version: 1
last_decision: null

# -- Superficie del amarre ------------------------------------
artefacto_final:
  nombre: "5.1 - Vaciado de liquidaciones - amarre - Ruben.xlsx"
  formato: xlsx
  hoja_principal: "amarre"
  unidad_control: "folio_sua"

# -- Fuentes canonicas ----------------------------------------
data_sources:
  - DOC-disco-sua
  - DOC-cedula-determinacion-mensual
  - DOC-cedula_determinacion_bimestral
  - DOC-comprobante-pago-sua
  - DOC-emision-ema
  - DOC-emision-eba
  - DOC-declaracion-prima-rt

# -- Columnas del delivery que esta reconciliation valida -----
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

# -- Papeles de trabajo generados -----------------------------
papeles_de_trabajo:
  - PT-rsm-mazatlan-amarre-folio
  - PT-rsm-mazatlan-validacion-comprobante
  - PT-rsm-mazatlan-analisis-prima

# -- Extras de la oficina -------------------------------------
has_extras: true
---

# Cuotas pagadas al Instituto - Reconciliation (RSM Mazatlan)

---

## 1. Overview

RSM Mazatlan ejecuta esta prueba con la variante operativa documentada por Ruben para **5.1 - Vaciado de liquidaciones**. La filosofia del amarre es reconstruir cada liquidacion desde el archivo `.SUA`, concentrarla en un workbook de trabajo y cerrar cada fila por **folio de liquidacion** contra comprobante bancario, cedulas y emision IDSE.

El delivery oficial termina en una fila anual por RP, pero el cierre operativo real ocurre antes, a nivel `folio_sua`. Si un folio no cuadra, la fila anual del RP no debe considerarse plenamente soportada.

## 2. Objetivo especifico del amarre

Validar que lo determinado en SUA para cada folio fue efectivamente pagado y esta soportado por los documentos oficiales del periodo:

- el disco SUA aporta folio, RP, periodo, trabajadores, dias e importes;
- el comprobante bancario prueba el pago efectivo;
- la cedula mensual valida el bloque COP;
- la cedula bimestral valida RCV e INFONAVIT;
- EMA, EBA y la declaracion anual de prima RT soportan el analisis de prima `RT / EMA / AUD`.

## 3. Artefacto final

- **Workbook:** `5.1 - Vaciado de liquidaciones - amarre - Ruben.xlsx`
- **Formato:** xlsx
- **Hojas relevantes:** `PARTE A`, `PARTE B`, `PARTE D`, `amarre`
- **Hoja autoritativa:** `amarre`
- **Unidad de control:** folio de liquidacion SUA
- **Cierre visible:** `Importe Comprobante` igual a `Total a Pagar` y `Comprobacion = 0`

## 4. Inputs al amarre

| Input | Fuente canonica | Uso |
|-------|-----------------|-----|
| Registro patronal | `[[DOC-disco-sua/02 - Schema#disco_sua_empresa.registro_patronal]]` | Llave de organizacion documental y cruce. |
| Periodo | `[[DOC-disco-sua/02 - Schema#disco_sua_empresa.periodo]]` | Identificar mes o bimestre liquidado. |
| Folio SUA | `[[DOC-disco-sua/02 - Schema#disco_sua_empresa.folio_sua]]` | Unidad de control del amarre. |
| RFC patron | `[[DOC-disco-sua/02 - Schema#disco_sua_empresa.rfc_patron]]` | Validacion de identidad del archivo. |
| Total trabajadores | `[[DOC-disco-sua/02 - Schema#disco_sua_empresa.total_trabajadores]]` | Cotizantes del folio. |
| Dias cotizados | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.dias_mes]]` | Soporte de dias para la salida. |
| Dias de ausentismo | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.dias_ausentismo_mes]]` | Soporte de ausentismos. |
| Dias de incapacidad | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.dias_incapacidad_mes]]` | Soporte de incapacidades. |
| Cuota fija | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.cuota_fija]]` | Componente COP. |
| Cuota excedente | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.cuota_excedente]]` | Componente COP; se separa patronal/obrero en el papel de trabajo. |
| Prestaciones en dinero | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.prestaciones_dinero]]` | Componente COP; se separa patronal/obrero en el papel de trabajo. |
| Gastos medicos pensionados | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.gastos_medicos_pensionados]]` | Componente COP; se separa patronal/obrero en el papel de trabajo. |
| Riesgos de trabajo | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.riesgos_trabajo]]` | Componente patronal COP y base del analisis RT. |
| Invalidez y vida | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.invalidez_vida]]` | Componente COP; se separa patronal/obrero en el papel de trabajo. |
| Guarderias y prestaciones sociales | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.guarderias_prestaciones_sociales]]` | Componente patronal COP. |
| Actualizacion IMSS | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.actualizacion_imss]]` | Accesorio COP. |
| Recargos IMSS | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.recargos_imss]]` | Accesorio COP. |
| Retiro | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.retiro]]` | Componente RCV. |
| Cesantia y vejez | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.cesantia_vejez]]` | Componente RCV; se separa patronal/obrero en el papel de trabajo cuando el detalle lo permite. |
| Actualizacion RCV | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.actualizacion_rcv]]` | Accesorio RCV. |
| Recargos RCV | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.recargos_rcv]]` | Accesorio RCV. |
| Aportacion patronal INFONAVIT | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.aportacion_patronal_cta_individual]]` | INFONAVIT pagado. |
| Amortizacion INFONAVIT | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.amortizacion]]` | INFONAVIT pagado. |
| Total IMSS de control | `[[DOC-disco-sua/02 - Schema#disco_sua_validacion.total_imss]]` | Validacion del bloque IMSS. |
| Total RCV de control | `[[DOC-disco-sua/02 - Schema#disco_sua_validacion.total_rcv]]` | Validacion del bloque RCV. |
| Total aportacion INFONAVIT | `[[DOC-disco-sua/02 - Schema#disco_sua_validacion.total_aportacion]]` | Validacion de vivienda. |
| Total amortizacion INFONAVIT | `[[DOC-disco-sua/02 - Schema#disco_sua_validacion.total_amortizacion]]` | Validacion de vivienda. |
| Importe total pagado | `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.importe_total]]` | Cierre contra banco. |
| Importe IMSS pagado | `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.importe_imss]]` | Validar COP contra comprobante. |
| Importe RCV pagado | `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.importe_rcv]]` | Validar RCV contra comprobante. |
| Importe vivienda pagado | `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.importe_vivienda]]` | Validar INFONAVIT contra comprobante. |
| Importe ACV pagado | `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.importe_acv]]` | Validar amortizacion contra comprobante. |
| Fecha de pago | `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.fecha_pago]]` | Identificar pagos extemporaneos. |
| Prima RT usada en cédula | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.prima_riesgo_trabajo]]` | Valor `RT` del analisis de prima. |
| Prima EMA | `[[DOC-emision-ema/02 - Schema#emision_ema_resumen.prima_riesgo_trabajo]]` | Valor emitido por IDSE. |
| Clase RT | `[[DOC-declaracion-prima-rt/02 - Schema#declaracion_prima_rt.clase]]` | Soporte del analisis AUD. |
| Fraccion RT | `[[DOC-declaracion-prima-rt/02 - Schema#declaracion_prima_rt.fraccion]]` | Soporte del analisis AUD. |
| Prima anterior | `[[DOC-declaracion-prima-rt/02 - Schema#declaracion_prima_rt.prima_anterior]]` | AUD para enero y febrero. |
| Prima declarada | `[[DOC-declaracion-prima-rt/02 - Schema#declaracion_prima_rt.prima_declarada]]` | AUD para marzo a diciembre. |

## 5. Procedimiento paso a paso

### Paso 1 - Conseguir el SUA correcto

- **Input:** `[[DOC-disco-sua/02 - Schema#disco_sua_empresa.registro_patronal]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_empresa.periodo]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_empresa.folio_sua]]`
- **Operacion:** confirmar que el archivo corresponde al RP y periodo trabajados.
- **Output:** folio SUA validado para cargar al workbook.
- **Papel de trabajo:** [[#PT-rsm-mazatlan-amarre-folio - tabla de amarre por folio]]

### Paso 2 - Traducir el SUA a tablas operativas

- **Input:** tablas `disco_sua_empresa`, `disco_sua_trabajador`, `disco_sua_sumario` y `disco_sua_validacion`.
- **Operacion:** estructurar la informacion en bloques equivalentes a identificacion, dias, detalle economico y validacion.
- **Output:** base operativa por folio.

### Paso 3 - Revisar coherencia del vaciado

- **Input:** RP, periodo, folio, trabajadores, dias e importes extraidos del SUA.
- **Operacion:** verificar que cabecera, trabajador, sumario y validacion correspondan al mismo folio y que no existan datos corridos o incompletos.
- **Output:** folio apto para amarre o folio rechazado para investigacion.

### Paso 4 - Construir fila de amarre por folio

- **Input:** campos del `DOC-disco-sua`.
- **Operacion:** consolidar por `registro_patronal + periodo + folio_sua` los bloques IMSS, RCV e INFONAVIT, mas trabajadores y dias.
- **Output:** una fila en `PT-rsm-mazatlan-amarre-folio`.

### Paso 5 - Buscar comprobante correcto

- **Input:** `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.registro_patronal]]`, `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.periodo_ym]]`, `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.importe_total]]`
- **Operacion:** localizar el comprobante por RP, periodo e importe total. No depender del folio bancario cuando no venga visible.
- **Output:** comprobante asociado al folio.
- **Papel de trabajo:** [[#PT-rsm-mazatlan-validacion-comprobante - validacion contra pago]]

### Paso 6 - Validar contra comprobante

- **Input:** total a pagar determinado desde SUA y `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua.importe_total]]`.
- **Operacion:** calcular diferencia entre importe pagado y total a pagar.
- **Output:** status del folio: `cuadrado`, `con diferencia` o `sin comprobante`.

### Paso 7 - Validar con cedulas

- **Input:** `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual]]` y `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral]]`.
- **Operacion:** cruzar componentes IMSS contra cedula mensual y RCV/INFONAVIT contra cedula bimestral del mismo RP-periodo.
- **Output:** soporte documental de componentes del folio.

### Paso 8 - Completar analisis de prima

- **Input:** `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.prima_riesgo_trabajo]]`, `[[DOC-emision-ema/02 - Schema#emision_ema_resumen.prima_riesgo_trabajo]]`, `[[DOC-declaracion-prima-rt/02 - Schema#declaracion_prima_rt.prima_anterior]]`, `[[DOC-declaracion-prima-rt/02 - Schema#declaracion_prima_rt.prima_declarada]]`.
- **Operacion:** comparar RT, EMA y AUD. AUD usa prima anterior en enero-febrero y prima declarada de marzo a diciembre.
- **Output:** diferencias de prima visibles para revision.
- **Papel de trabajo:** [[#PT-rsm-mazatlan-analisis-prima - RT EMA AUD]]

### Paso 9 - Resolver diferencias o documentarlas

- **Input:** diferencias de comprobante, cedulas o prima.
- **Operacion:** investigar comprobante incorrecto, comprobante faltante, pago complementario, pago extemporaneo, set documental incompleto, error de vaciado del SUA o diferencia RT/EMA/AUD.
- **Output:** folio cerrado, folio con diferencia explicada o folio abierto.

### Paso 10 - Consolidar al delivery

- **Input:** folios cerrados del ejercicio.
- **Operacion:** sumar por RP anual para producir las columnas de `Cuotas pagadas al Instituto`.
- **Output:** fila anual por RP para `delivery_rsm_mazatlan.md`.

## 6. Reglas de cierre y tolerancias

- **Criterio de cierre:** `Importe Comprobante = Total a Pagar` y `Comprobacion = 0` por folio.
- **Tolerancia:** `0.00` como regla operativa de Ruben. Se permite `0.01` solo si el auditor documenta redondeo de centavos.
- **Regla de status:**
  - `cuadrado` si el comprobante existe y la diferencia es cero;
  - `con diferencia` si existe comprobante pero el importe no cuadra;
  - `sin comprobante` si no hay evidencia bancaria;
  - `incompleto` si falta SUA, cedula mensual o cedula bimestral aplicable.
- **Que hacer cuando no cierra:** revisar primero que el SUA sea correcto, despues que el comprobante corresponda al RP-periodo-importe, despues buscar complementarios o extemporaneos, y finalmente revisar si el vaciado del SUA esta incompleto.

## 7. Papeles de trabajo generados

### PT-rsm-mazatlan-amarre-folio - tabla de amarre por folio

- **Proposito:** respaldar la reconstruccion de cada liquidacion.
- **Grain:** un row por `registro_patronal + periodo + folio_sua`.
- **Inputs:** `[[DOC-disco-sua/02 - Schema#disco_sua_empresa]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_sumario]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_validacion]]`.
- **Se entrega al IMSS:** si, como soporte de la prueba cuando se requiera trazabilidad.
- **Columnas del papel:**
  - `registro_patronal`: text - RP normalizado.
  - `periodo`: text - periodo liquidado.
  - `folio_sua`: text - folio de liquidacion.
  - `trabajadores`: int - cotizantes del folio.
  - `dias_cotizados`: int - dias cotizados del folio.
  - `dias_ausentismo`: int - ausentismos.
  - `dias_incapacidad`: int - incapacidades.
  - `total_imss`: decimal - COP determinado.
  - `total_rcv`: decimal - RCV determinado.
  - `total_infonavit`: decimal - vivienda y amortizacion determinadas.
  - `total_a_pagar`: decimal - suma global del folio.

### PT-rsm-mazatlan-validacion-comprobante - validacion contra pago

- **Proposito:** demostrar que el folio liquidado fue pagado.
- **Grain:** un row por folio SUA y comprobante asociado.
- **Inputs:** `[[DOC-comprobante-pago-sua/02 - Schema#comprobante_pago_sua]]` y total determinado en el PT de amarre.
- **Se entrega al IMSS:** si, como evidencia de pago.
- **Columnas del papel:**
  - `linea_captura`: text - identificador bancario cuando existe.
  - `importe_comprobante`: decimal - pago bancario total.
  - `fecha_pago`: date - fecha de aplicacion.
  - `banco`: text - institucion bancaria.
  - `comprobacion`: decimal - importe comprobante menos total a pagar.
  - `status`: text - cierre del folio.

### PT-rsm-mazatlan-analisis-prima - RT EMA AUD

- **Proposito:** dejar visible si la prima aplicada, la emitida por IDSE y la esperada por auditoria coinciden.
- **Grain:** un row por RP-periodo.
- **Inputs:** `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.prima_riesgo_trabajo]]`, `[[DOC-emision-ema/02 - Schema#emision_ema_resumen.prima_riesgo_trabajo]]`, `[[DOC-declaracion-prima-rt/02 - Schema#declaracion_prima_rt.prima_anterior]]`, `[[DOC-declaracion-prima-rt/02 - Schema#declaracion_prima_rt.prima_declarada]]`.
- **Se entrega al IMSS:** no por default; soporte interno y posible hallazgo.
- **Columnas del papel:**
  - `registro_patronal`: text.
  - `periodo`: text.
  - `rt`: decimal - prima usada en pago.
  - `ema`: decimal - prima emitida por IDSE.
  - `aud`: decimal - prima esperada por auditoria.
  - `diferencia_rt_ema`: decimal.
  - `diferencia_rt_aud`: decimal.
  - `diferencia_ema_aud`: decimal.
  - `observacion`: text.

## 8. Casos especiales y bifurcaciones

### Caso - Pago complementario

- **Cuando:** aparece un folio adicional para el mismo RP y periodo.
- **Que hacer:** abrir fila nueva por folio. No mezclarlo con el folio original.
- **Papel de trabajo afectado:** PT-rsm-mazatlan-amarre-folio.
- **Origen:** SOP de Ruben.

### Caso - Pago extemporaneo

- **Cuando:** el pago ocurre fuera de plazo y contiene actualizacion o recargos.
- **Que hacer:** conservar el periodo liquidado como eje del amarre, no el mes de pago. Accesorios se reportan en columnas S/T o Z/AA del delivery.
- **Papel de trabajo afectado:** PT-rsm-mazatlan-validacion-comprobante.
- **Origen:** SOP de Ruben y schemas de cedulas.

### Caso - Falta comprobante bancario

- **Cuando:** no hay comprobante localizable para RP-periodo-importe.
- **Que hacer:** el folio puede quedar avanzado tecnicamente, pero no cerrado.
- **Papel de trabajo afectado:** PT-rsm-mazatlan-validacion-comprobante.
- **Origen:** SOP de Ruben.

### Caso - Diferencias RT / EMA / AUD

- **Cuando:** la prima de cedula, IDSE o auditoria no coinciden.
- **Que hacer:** no corregir automaticamente. Documentar diferencia y escalar si afecta el pago de riesgos de trabajo.
- **Papel de trabajo afectado:** PT-rsm-mazatlan-analisis-prima.
- **Origen:** SOP de Ruben.

### Caso - Alta de seguro o tarjeta patronal

- **Cuando:** no existe declaracion anual de prima utilizable por primer año o alta reciente.
- **Que hacer:** no aplica en esta corrida. El usuario decidio excluir estos documentos por no ser obligatorios para el escenario actual.
- **Papel de trabajo afectado:** PT-rsm-mazatlan-analisis-prima.
- **Origen:** decision de sesion.

## 9. Extras de la oficina

### Extra 1 - Analisis RT / EMA / AUD

- **Que hace:** compara la prima usada, la prima IDSE y la prima esperada por auditoria.
- **Por que esta oficina lo hace:** Ruben deja visible esta revision para que diferencias de prima no queden ocultas dentro del pago global.
- **Requerido por IMSS:** false
- **Inputs adicionales:** `DOC-emision-ema` y `DOC-declaracion-prima-rt`.
- **Salida:** PT-rsm-mazatlan-analisis-prima.

### Extra 2 - Revision de folios complementarios

- **Que hace:** conserva pagos adicionales como filas independientes.
- **Por que esta oficina lo hace:** evita que complementarios se pierdan dentro de un mes consolidado.
- **Requerido por IMSS:** false
- **Inputs adicionales:** ninguno; deriva del set de `DOC-disco-sua` y comprobantes.
- **Salida:** PT-rsm-mazatlan-amarre-folio.

## 10. Errores comunes y alertas

- Cerrar por mes consolidado cuando la unidad real de control es el folio.
- Buscar el comprobante por fecha en lugar de RP, periodo e importe.
- Mezclar un pago complementario con el folio original.
- Confiar en el vaciado del SUA sin revisar coherencia de RP, periodo, folio, trabajadores y totales.
- Cerrar una fila sin comprobante bancario.
- Ignorar diferencias RT / EMA / AUD porque el importe global ya cuadro.
- Tratar el mes de pago como periodo liquidado en pagos extemporaneos.

## 11. Preguntas abiertas

- Confirmar si RSM Mazatlan quiere tolerancia estricta `0.00` siempre o permite `0.01` por redondeo documentado.
- Confirmar si en el output final del TXT se materializan las columnas calculadas o se delegan al workbook oficial.
- Normalizar en la biblioteca documental el nombre `01 - Spec (1).md` de `DOC-emision-ema`.

## 12. Notas de mantenimiento

- Este reconciliation documenta unicamente la variante de Ruben para RSM Mazatlan.
- `Alta de Seguro` y `Tarjeta de Identificacion Patronal` quedan fuera de esta corrida por decision del usuario; si se usan en otra auditoria, primero deben tener `01 - Spec.md` y `02 - Schema.md` canonicos.
- Solo modificar via PROP + DEC. Si la oficina cambia el flujo de folio a otro grain, crear nueva version y deprecar esta.
