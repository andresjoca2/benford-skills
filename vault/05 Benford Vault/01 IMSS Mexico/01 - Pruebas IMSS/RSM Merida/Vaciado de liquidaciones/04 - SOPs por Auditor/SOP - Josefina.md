---
tipo: sop-prueba-imss
prueba_id: "5.1"
metodologia_version: "v1"
metodologia_fuente: "Josefina / paquete original"
sop_scope: "macro"
estado: draft
actualizado: 2026-03-26
linear_project: "5.1 Vaciado de liquidaciones"
---

# SOP v1 - Prueba 5.1 Vaciado de liquidaciones

## 1. Contexto rapido

- Prueba: `5.1 Vaciado de liquidaciones`
- Alcance SOP: `macro`
- Metodología versión: `v1`
- Fuente metodológica: `Josefina / paquete original`
- Nota temática: [[Prueba 5.1 - Vaciado de liquidaciones]]
- Proyecto Linear: `5.1 Vaciado de liquidaciones`
- Artefactos base usados para este SOP:
  - `PRD Frontend - 5.1 Vaciado de liquidaciones`
  - `PRD Backend - 5.1 Vaciado de liquidaciones`
  - `Fuentes - 5.1 Vaciado de liquidaciones`
  - workbook `5.1.1 - Resumen Liquidaciones mens. Y bimes..xlsx`

## 2. Objetivo de la prueba

En esta metodología, la prueba existe para conciliar el monto operativo de liquidaciones pagadas contra el reflejo contable anual, de modo que el auditor pueda validar que los pagos de IMSS, Cesantía y Vejez e Infonavit que aparecen en la operación efectivamente están reconocidos en la contabilidad y soportados por evidencia documental.

La lógica central de esta variante no está construida primero alrededor del comprobante bancario ni de la salida final del dictamen. Está construida alrededor de un papel de trabajo intermedio:

- `COPS` como concentrado operativo de liquidaciones
- `BC` como balanza contable
- `Amarre` como conciliación entre ambos

Esta metodología responde primero a la pregunta:

- `¿Los saldos operativos de liquidaciones cuadran contra las cuentas contables correctas?`

## 3. Resultado esperado y criterio de cierre

El resultado principal de esta versión es un amarre contable-operativo de tres renglones:

- `Cuotas IMSS`
- `Cesantía y vejez`
- `Aportaciones al Infonavit`

La prueba se considera terminada cuando:

- se obtuvo el set documental mínimo para construir `COPS`, `BC` y `Amarre`
- se calcularon los tres renglones principales del amarre
- la diferencia por renglón y la diferencia total quedaron explicadas
- si persisten diferencias, existe hipótesis documentada y ruta de investigación
- quedó claro si el working paper puede usarse como soporte para el dictamen o si faltan piezas

Regla de status de esta metodología:

- `Cuadrado` si `abs(diferencia_total) <= 0.01`
- `Con diferencia` si `abs(diferencia_total) > 0.01`

## 4. Superficie final del ejercicio

La superficie final autoritativa en esta metodología es la hoja `Amarre` del workbook `5.1.1 - Resumen Liquidaciones mens. Y bimes..xlsx`.

El control visible final es:

- tres renglones de conciliación
- una diferencia por renglón
- un total consolidado de diferencias

Según el análisis del workbook, la estructura relevante es:

- `Amarre!D13:D15` = saldo contable por cuenta
- `Amarre!F13:F15` = saldo operativo derivado de `COPS`
- `Amarre!H13:H15` = diferencia por renglón
- `Amarre!H17` = total consolidado de diferencias

En esta variante, `Amarre!H17` opera como el cierre práctico del ejercicio.

## 5. Reverse engineering del ejercicio

### 5.1 Final artifact

El amarre final compara contabilidad contra operación.

La lógica de negocio se resume así:

- `diferencia_renglon = saldo_contable - saldo_operativo`
- `diferencia_total = suma(diferencia_renglon)`

### 5.2 Auxiliary artifact

El helper principal es la hoja `COPS`.

`COPS` concentra los importes operativos por periodo y por `registro patronal`, y de ahí se derivan los saldos operativos usados por `Amarre`.

También interviene la hoja `BC`, que sirve como lookup de saldos contables de la balanza.

### 5.3 Support documents

Los documentos que alimentan esta variante son:

- `SUA IMSS mensual`
- `SUA INFONAVIT / cédula bimestral`
- `Comprobantes de pago`
- `Balanza de comprobación anual`
- `Auxiliares de gastos`

### 5.4 Raw documents

Los raw sources subyacentes de la metodología son:

- liquidaciones IMSS en formato `.SUA` o cédulas
- liquidaciones INFONAVIT / RCV bimestrales
- comprobantes bancarios de pago
- balanza anual de comprobación
- auxiliares contables

## 6. Inventario de documentos

| Documento canonico | Aliases comunes | Rol | Obligatoriedad | Scope | Como reconocerlo | Variables clave | Llaves de cruce | Si falta | Fallback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `Workbook de amarre 5.1.1` | `Resumen Liquidaciones mens. y bimes.` | final artifact + helper | obligatorio | empresa con detalle por RP | archivo Excel con tabs `Amarre`, `COPS`, `BC` | cuentas, saldos, componentes mensuales | no aplica; es artefacto de trabajo | no se puede ejecutar esta metodología sin reconstruir el paper | reconstrucción manual desde raw |
| `SUA IMSS mensual` | `cédula mensual IMSS` | support document | obligatorio | registro patronal | PDF o export con componentes IMSS mensuales | cotizantes, días, cuota fija, excedentes, prestaciones, RT, guarderías, invalidez y vida | periodo + RP | bloquea el armado del componente IMSS | ninguno documentado |
| `SUA INFONAVIT bimestral` | `cédula bimestral`, `SUA INFONAVIT` | support document | obligatorio en meses bimestrales | registro patronal | PDF o export con bloques RCV e Infonavit | retiro, cesantía y vejez, aportación, amortización | periodo bimestral + RP | bloquea RCV/Infonavit | ninguno documentado |
| `Comprobante de pago` | `SUA FEB 2024`, `comprobante bancario` | support document | obligatorio | registro patronal o evento de pago | PDF bancario con importe total, fecha y banco | total pagado, fecha de pago, banco, folio SUA cuando exista | periodo + RP + evento de pago | debilita trazabilidad del pago | apoyo manual del auditor |
| `Balanza de comprobación anual` | `BC`, `SEL BC 122024` | support document | obligatorio | empresa/RFC | Excel anual con catálogo y saldos | número de cuenta, nombre de cuenta, saldo final | número de cuenta | no se puede calcular lado contable del amarre | ninguno documentado |
| `Auxiliares de gastos` | `auxiliar de gastos` | exception / investigation document | opcional pero muy útil | empresa/RFC | Excel auxiliar de movimientos | detalle contable y explicación de saldo | número de cuenta + periodo | dificulta investigar diferencias | balanza sola |

## 7. Diccionario de variables canonicas

| Variable canonica | Aliases comunes | Significado de negocio | Grain | Documento origen | Capa donde aparece | Formula o regla de negocio | Uso en la prueba | Notas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `saldo_contable_imss` | `Cuotas IMSS contabilidad` | saldo anual contable de cuotas IMSS | cuenta | balanza | final | lookup de cuenta `601-02-000` | lado contable del amarre | variante v1 usa cuenta fija |
| `saldo_contable_rcv` | `Cesantía y vejez contabilidad` | saldo anual contable de RCV | cuenta | balanza | final | lookup de cuenta `601-03-000` | lado contable del amarre | variante v1 usa cuenta fija |
| `saldo_contable_infonavit` | `Aportaciones Infonavit contabilidad` | saldo anual contable de Infonavit | cuenta | balanza | final | lookup de cuenta `601-04-000` | lado contable del amarre | variante v1 usa cuenta fija |
| `cuota_fija_patronal` | `cuota fija` | componente patronal IMSS | periodo x RP | SUA IMSS | auxiliary | suma dentro del bloque IMSS | saldo operativo IMSS | se usa del lado patronal |
| `excedente_patronal` | `excedente patron` | componente patronal IMSS por excedente | periodo x RP | SUA IMSS | auxiliary | suma dentro del bloque IMSS | saldo operativo IMSS | no usar componente obrero |
| `prestaciones_dinero_patronal` | `prestaciones dinero patron` | componente patronal de prestaciones en dinero | periodo x RP | SUA IMSS | auxiliary | suma dentro del bloque IMSS | saldo operativo IMSS | se excluye parte obrera |
| `gastos_medicos_pensionados_patronal` | `gastos medicos patron` | componente patronal de pensionados | periodo x RP | SUA IMSS | auxiliary | suma dentro del bloque IMSS | saldo operativo IMSS | se excluye parte obrera |
| `riesgo_trabajo` | `RT pagado` | cuota de riesgo de trabajo pagada | periodo x RP | SUA IMSS | auxiliary | suma dentro del bloque IMSS | saldo operativo IMSS | en v1 es componente de liquidación, no análisis separado |
| `guarderias_prestaciones_sociales` | `guarderías` | cuota patronal guarderías/prestaciones sociales | periodo x RP | SUA IMSS | auxiliary | suma dentro del bloque IMSS | saldo operativo IMSS | parte patronal |
| `invalidez_vida_patronal` | `invalidez y vida patron` | cuota patronal de invalidez y vida | periodo x RP | SUA IMSS | auxiliary | suma dentro del bloque IMSS | saldo operativo IMSS | parte patronal |
| `retiro` | `retiro` | componente de retiro | periodo x RP | SUA INFONAVIT | auxiliary | suma bloque RCV | saldo operativo RCV | |
| `cesantia_vejez_patronal` | `CV patron` | componente patronal de cesantía y vejez | periodo x RP | SUA INFONAVIT | auxiliary | suma bloque RCV | saldo operativo RCV | parte obrera no se toma en este amarre |
| `aportacion_infonavit_sin_credito` | `aportación s/ crédito` | aportación patronal vivienda sin crédito | periodo x RP | SUA INFONAVIT | auxiliary | suma bloque Infonavit | saldo operativo Infonavit | |
| `aportacion_infonavit_con_credito` | `aportación c/ crédito` | aportación patronal vivienda con crédito | periodo x RP | SUA INFONAVIT | auxiliary | suma bloque Infonavit | saldo operativo Infonavit | amortización no entra al amarre principal |
| `saldo_operativo_imss` | `extracto IMSS` | total operativo IMSS a conciliar con contabilidad | agregado | COPS | final | `cuota_fija_patronal + excedente_patronal + prestaciones_dinero_patronal + gastos_medicos_pensionados_patronal + riesgo_trabajo + guarderias_prestaciones_sociales + invalidez_vida_patronal` | amarre renglón IMSS | |
| `saldo_operativo_rcv` | `extracto RCV` | total operativo RCV a conciliar con contabilidad | agregado | COPS | final | `retiro + cesantia_vejez_patronal` | amarre renglón RCV | |
| `saldo_operativo_infonavit` | `extracto Infonavit` | total operativo Infonavit a conciliar con contabilidad | agregado | COPS | final | `aportacion_infonavit_sin_credito + aportacion_infonavit_con_credito` | amarre renglón Infonavit | |
| `diferencia_renglon` | `difference`, `diferencia` | distancia entre contabilidad y operación | renglón de control | Amarre | final | `saldo_contable - saldo_operativo` | determina mismatch | |
| `diferencia_total` | `total_difference` | suma de diferencias de los tres controles | prueba | Amarre | final | `sum(diferencia_renglon)` | status final | |

## 8. Reglas de transformacion y cruce

| Paso | Output canonico | Inputs | Grain | Join o agrupacion | Regla de negocio | Tipo de validacion | Bloqueos frecuentes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `COPS mensual por RP` | SUA IMSS, SUA INFONAVIT, comprobante | periodo x RP | periodo + RP | capturar componentes mensuales y bimestrales del pago | validación operativa | faltantes documentales o periodos incompletos |
| 2 | `saldo_operativo_imss` | componentes patronales IMSS | agregado anual o consolidado de trabajo | sumar periodos relevantes | consolidar solo componentes patronales IMSS | conciliación operativa | confundir patronal con obrera |
| 3 | `saldo_operativo_rcv` | retiro + cesantía y vejez patronal | agregado anual o consolidado de trabajo | sumar periodos bimestrales | no incluir componente obrero | conciliación operativa | tomar columnas incorrectas |
| 4 | `saldo_operativo_infonavit` | aportaciones de vivienda | agregado anual o consolidado de trabajo | sumar periodos bimestrales | usar aportación patronal; no mezclar amortización | conciliación operativa | incluir amortización por error |
| 5 | `saldo_contable_*` | balanza | cuenta | número de cuenta | mapear a cuentas `601-02-000`, `601-03-000`, `601-04-000` | conciliación contable | catálogo distinto o cuenta mal mapeada |
| 6 | `diferencia_renglon` | saldo contable, saldo operativo | renglón | por control | restar contabilidad menos operación | mismatch detection | cualquiera de los lados mal construido |
| 7 | `diferencia_total` | tres diferencias | prueba | suma simple | consolidar resultado de la prueba | cierre de prueba | diferencias no explicadas |

## 9. Normalizacion y modelo de datos esperado

Esta variante requiere una normalización suficiente para reconstruir `COPS`, `BC` y `Amarre`, no necesariamente una reconstrucción documental por folio.

Entidades lógicas mínimas:

| Entidad lógica | Grain esperado | Campos mínimos |
| --- | --- | --- |
| `imss_liquidacion_mensual_rows` | periodo x RP x documento | cotizantes, días, componentes IMSS, archivo fuente |
| `imss_liquidacion_bimestral_rows` | periodo x RP x documento | retiro, CV patronal, aportaciones Infonavit, archivo fuente |
| `imss_payment_proofs` | evento de pago | importe, fecha, banco, archivo fuente |
| `contabilidad_balanza_rows` | cuenta x periodo o ejercicio | cuenta, descripción, saldo |
| `contabilidad_auxiliar_rows` | movimiento auxiliar | cuenta, fecha, importe, referencia |
| `test_5_1_cops_rows` | periodo x RP | componentes operativos consolidados |
| `test_5_1_amarre_rows` | renglón de control | cuenta, saldo contable, saldo operativo, diferencia, status |

Principios:

- la lógica crítica no debe vivir en frontend
- el sistema debe preservar `tenant_id`, `audit_id`, periodo y `registro_patronal`
- el cálculo de la prueba v1 debe priorizar agrupaciones por control contable
- los auxiliares son soporte de investigación, no fuente principal de cálculo

## 10. Procedimiento operativo canonico

1. identificar empresa, ejercicio y registros patronales incluidos en el working paper
2. reunir el set documental mínimo:
   - SUA IMSS mensual
   - SUA INFONAVIT bimestral
   - comprobantes de pago
   - balanza anual
3. reconstruir o validar `COPS` por periodo y por RP
4. consolidar los bloques operativos patronales que alimentan cada renglón del amarre
5. localizar en balanza las cuentas contables correctas
6. calcular la diferencia por renglón y la diferencia total
7. si hay diferencia, reabrir auxiliares y evidencia documental
8. documentar si la prueba queda cuadrada o con diferencia explicada

## 11. Manejo de faltantes y diferencias

### Si falta `SUA IMSS`

- se bloquea el armado del bloque IMSS
- no debe inferirse desde balanza
- hay que pedir el archivo mensual o evidencia equivalente del mismo periodo

### Si falta `SUA INFONAVIT`

- se bloquea RCV/Infonavit en meses bimestrales
- se puede avanzar parcialmente con meses solo IMSS
- el resultado total queda incompleto

### Si falta balanza

- se puede preparar `COPS`, pero no cerrar el amarre principal de esta metodología

### Si no cuadra

Hipótesis principales en orden:

1. se tomó componente obrero en vez de patronal
2. se mapearon mal las cuentas contables
3. el set de periodos está incompleto
4. hay pagos complementarios no incorporados
5. hay diferencias reales derivadas del dictamen no segregadas

Escalar al auditor cuando:

- la diferencia persiste después de revisar componentes patronales vs obreros
- faltan pagos complementarios o evidencia del dictamen
- el catálogo contable del cliente no permite mapear limpio las cuentas

## 12. Casos especiales y edge cases

- `enero` puede mostrar solo IMSS
- meses bimestrales pueden incluir RCV e Infonavit
- pagos complementarios pueden alterar la lectura del total operativo si no están segregados
- diferencias derivadas del dictamen pueden existir aunque el working paper operativo esté “completo”
- la metodología literal incluye `EMA`, `EBA`, discos SUA y avisos derivados del dictamen, pero el working paper `v1` no deja todos esos elementos igual de aterrizados

## 13. Criterios de aceptacion y definicion de terminado

- el set documental mínimo fue obtenido
- los tres renglones del amarre fueron calculados
- cada saldo operativo tiene trazabilidad a `COPS`
- cada saldo contable tiene trazabilidad a `BC`
- la diferencia total quedó en tolerancia o con explicación documentada
- si faltan documentos de dictamen complementario, quedó asentado como pendiente

## 14. Preguntas abiertas

- cómo incorpora esta metodología `EMA`, `EBA` y pagos complementarios dentro del paper final cuando sí existen
- cómo convierte este working paper en salida directa al dictamen sin una capa adicional
- si la tolerancia `0.01` es política estable o solo una comodidad del Excel original

## 15. Runbook operativo compacto

1. confirmar ejercicio, empresa y registros patronales en alcance
2. pedir `SUA IMSS`, `SUA INFONAVIT`, comprobantes, balanza y, si existe, auxiliar
3. validar si el set cubre todos los periodos relevantes
4. reconstruir `COPS` por periodo y RP
5. consolidar:
   - `saldo_operativo_imss`
   - `saldo_operativo_rcv`
   - `saldo_operativo_infonavit`
6. mapear cuentas contables de `BC`
7. calcular diferencias por renglón y total
8. si `abs(diferencia_total) <= 0.01`, cerrar como `Cuadrado`
9. si no cuadra:
   - revisar primero mezcla patronal/obrera
   - luego cuentas contables
   - luego periodos faltantes
   - luego pagos complementarios
10. documentar si el working paper queda listo como soporte o si requiere escalación





|   |   |   |   |   |
|---|---|---|---|---|
  
|Conciliación de Nóminas vs Contabilidad, Balanza de Comprobación, Variables, Prueba Global y CFDI de nóminas.|   |   |   |   |
||||||
|Objetivo: Verificar que los importes pagados por nómina coincidan contra lo registrado contablemente y lo presentado en el dictamen fiscal (en caso de aplicar). Verificar que los importes sean coincidentes en los tres conceptos.|   |   |   |   |
||||||
|1 - Conciliación Nóminas vs Contabilidad.|   |   |   |   |
||||||
|1 - Verificar que los importes pagados a través de nómina y fuera de esta amarren contra la contabilidad. Solicitar a la compañía el papel de trabajo de la conciliación de nóminas contra registros contables.|   |   |   |   |
|¿Se documentaron las debidas conclusiones en estos tabajos efectuados?|   |   |   |   |
||||||
|2 - Acumulado de Nómina y fuera de ésta.|   |   |   |   |
||||||
|Objetivo: Verificar que los importes pagados por nóminas y fuera de estas.|   |   |   |   |
|NOTA: En caso de que la empresa cuente con varios registros elaborar acumulado por cada registro patronal.|   |   |   |   |
||||||
|1 - Obtener por parte de la compañía el papel de trabajo de las nóminas pagadas durante el ejercicio sujeto a revisión; en su caso, solicitar las nóminas por mes (sean semanales, quincenales o mensuales) para ser cotejadas contra la documentación correspondiente (carátulas de nóminas, CFDI de nóminas emitidos, integración anual de las remuneraciones) y que servirán de base para llevar a cabo la revisión de los salarios base de cotización.|   |   |   |   |
|2 - Cotejar Conceptos e Importes vs Nóminas.|   |   |   |   |
|3 - A través de resúmenes correspondientes compruebe la distribución contable de la percepción total según la nómina a los departamentos, centros de costos u ordenes de producción.|   |   |   |   |
|4 - Solicitar el llenado del Layout de remuneraciones de conformidad con el Anexo I del Dictamen Electrónico del IMSS.|   |   |   |   |
|5 - Cotejar las prestaciones señaladas en el lay out vs aquellas incluidas en el concentrado de nóminas.|   |   |   |   |
|6 - Analizar si los conceptos pagados integran o no al SBC de acuerdo a la LSS.|   |   |   |   |
|¿Se documentaron las debidas conclusiones en estos tabajos efectuados?|   |   |   |   |
||||||
|3 - Conciliación de CFDI timbrados vs Nóminas.|   |   |   |   |
||||||
|Objetivo: Verificar que los conceptos reportados en las nóminas coinciden con la información que se encuentra en el portal del SAT por medio de los CFDI de nóminas.|   |   |   |   |
||||||
|1 - Solicitar a la compañía el papel de trabajo de la conciliación que se haya efectuado entre los CFDI de nómina emitidos y timbrados y que se encuentren en el portal del SAT contra las nóminas emitidas por su sistema utilizado.|   |   |   |   |
|2 - En caso de que no se cuente con la información del inciso anterior, solicitar que se baje del portal del SAT los CFDI de uno de los meses del ejercicio para efectuar una validación contra la nómina del propio mes.|   |   |   |   |
|3 - Verificar las discrepancias que arroje la conciliación y notificarla a la compañía.|   |   |   |   |
|¿Se documentaron las debidas conclusiones en estos tabajos efectuados?|   |   |   |   |
||||||
|4 - Balanza de Comprobación.|   |   |   |   |
||||||
|Objetivo: verificar la información contable de la Compañía por concepto sueldos y salarios, así como, la inclusión de esta en declaración anual.|   |   |   |   |
||||||
|1 - En el lado derecho de la cédula efectuar un resumen de los conceptos e importes contabilizados por concepto de sueldos y salarios.|   |   |   |   |
|2 - Verificar que los importes de Sueldos y Salarios se encuentren incluidos en los anexos del dictamen fiscal, y a su vez éstos en la declaración anual. En su caso, solicitar aclaración o plasmar en carta de recomendaciones.|   |   |   |   |
|3 - Solicitar auxiliar contable y pólizas con soporte documental de cuentas que pudieran ser cuestionadas por el IMSS para corroborar que lo contabilizado en dichas cuentas no corresponde ni tiene relación con Sueldos y Salarios.|   |   |   |   |
|¿Se documentaron las debidas conclusiones en estos tabajos efectuados?|   |   |   |   |
||||||
|5 - Copia de Anexos del Dictamen Fiscal Federal.|   |   |   |   |
||||||
|Objetivo: Conocer los importes dictaminados.|   |   |   |   |
||||||
|1 - Obtener, revisar y cotejar los Anexos.|   |   |   |   |
|¿Se documentaron las debidas conclusiones en estos tabajos efectuados?|   |   |   |   |
||||||
|6 - Copia de la Declaración Anual de ISR del ejercicio dictaminado.|   |   |   |   |
||||||
|Objetivo: Conocer los importes y conceptos declarados.|   |   |   |   |
||||||
|1 - Obtener e incluir el importe de PTU del ejercicio y de la PTU no cobrada, sumar ambos importes, realizar la cedula de la PTU|   |   |   |   |
|¿Se documentaron las debidas conclusiones en estos tabajos efectuados?|   |   |   |   |
||||||
|10 - La finalidad de esta cédula es verificar si la nómina y recibo de nómina contiene la información requerida de conformidad con  el Art. 9 del Reglamento de la LSS.|   |   |   |   |
||||||
|Objetivo: Que se cumpla con lo establecido en el Artículo 9 del Reglamento de la LSS.|   |   |   |   |
||||||
|1 - Verificar vs recibos de nomina timbrados seleccionados a su revisión|   |   |   |   |
|¿Se documentaron las debidas conclusiones en estos tabajos efectuados?|   |   |   |   |