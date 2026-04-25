---
# ── Identidad ────────────────────────────────────────────────
id: PRUEBA-IMSS-cuotas-pagadas-al-instituto/reconciliation/rsm-merida
type: prueba-reconciliation
audit: imss
parent_prueba: PRUEBA-IMSS-cuotas-pagadas-al-instituto
oficina: rsm-merida
firma: rsm
metodologia_nombre: "Amarre contable-operativo por renglón"

# ── Autoría y origen ─────────────────────────────────────────
contribuciones:
  - CONTRIB-2026-04-01-josefina-rsm        # paquete original Josefina (v1)
auditores_documentados:
  - "Josefina (RSM Mérida)"

# ── Estado ───────────────────────────────────────────────────
status: draft
version: 1
last_decision: null

# ── Superficie del amarre ────────────────────────────────────
artefacto_final:
  nombre: "5.1.1 - Resumen Liquidaciones mens. Y bimes..xlsx"
  formato: xlsx
  hoja_principal: "Amarre"
  unidad_control: "renglón contable"

# ── Fuentes canónicas ─────────────────────────────────────────
data_sources:
  - DOC-cedula-determinacion-mensual        # componentes IMSS mensuales (lado operativo COPS)
  - DOC-cedula_determinacion_bimestral      # RCV + INFONAVIT bimestrales (lado operativo COPS)
  - DOC-balanza-comprobacion-anual          # saldos por cuenta (lado contable BC)
  - DOC-auxiliares-gastos                   # opcional — solo para investigación cuando hay diferencia

# ── Columnas del delivery que esta reconciliation valida ─────
columnas_validadas:
  - G   # Cuota fija (dentro del agregado IMSS patronal)
  - H   # Excedente patrón
  - J   # Prestaciones en dinero patrón
  - L   # Gastos médicos pensionados patrón
  - N   # Riesgos de trabajo
  - O   # Guarderías y prestaciones sociales
  - P   # Invalidez y vida patrón
  - V   # Retiro (dentro del agregado RCV patronal)
  - W   # Cesantía y vejez patrón
  - AC  # INFONAVIT (solo aportaciones; ver nota abajo sobre amortización)
columnas_no_cubiertas:
  - C   # Cotizantes (no es importe, no entra al amarre contable)
  - D   # Días cotizados (ídem)
  - E   # Días de ausentismo
  - F   # Días de incapacidad
  - I   # Excedente obrero — el amarre v1 solo usa componentes patronales
  - K   # Prest. dinero obrero — ídem
  - M   # Gastos médicos obrero — ídem
  - Q   # Invalidez obrero — ídem
  - S   # Actualización COP — accesorios no entran al amarre principal
  - T   # Recargos COP — ídem
  - X   # Cesantía y vejez obrera — amarre solo patronal RCV
  - Z   # Actualización RCV — ídem accesorios
  - AA  # Recargos RCV — ídem accesorios

# ── Papeles de trabajo generados ─────────────────────────────
papeles_de_trabajo:
  - PT-amarre-5-1                           # hoja "Amarre" del workbook — PT autoritativo
  - PT-cops-5-1                             # hoja "COPS" del workbook — PT de soporte

# ── Extras de la oficina ─────────────────────────────────────
has_extras: false
---

# Cuotas pagadas al Instituto — Reconciliation (RSM Mérida)

<!-- ESTE ARCHIVO CUBRE LA METODOLOGÍA DE LA OFICINA RSM MÉRIDA (paquete original de
     Josefina) para cuadrar la Prueba IMSS "Cuotas pagadas al Instituto" contra las
     cuentas contables del cliente.

     No redefine de dónde sale la data del delivery — eso está fijo en delivery.md,
     unificado para todas las oficinas.

     Aquí documenta:
       • el enfoque filosófico del amarre (contable-operativo por renglón)
       • qué valida específicamente y contra qué
       • el artefacto (workbook) que produce
       • los pasos del procedimiento
       • los papeles de trabajo que quedan como evidencia
       • extras (none para esta oficina) -->

---

## 1. Overview

RSM Mérida (paquete original de Josefina) ataca esta prueba con un **amarre contable-operativo por renglón de control**. La filosofía es: en lugar de cuadrar documento-por-documento (folio SUA vs comprobante), consolidan los importes operativos de las cédulas en un concentrado anual por RP (`COPS`), extraen los saldos contables anuales por cuenta de la balanza (`BC`) y los comparan en tres renglones agregados:

- `Cuotas IMSS` contra el saldo operativo IMSS patronal
- `Cesantía y vejez` (RCV) contra el saldo operativo RCV patronal
- `Aportaciones al INFONAVIT` contra el saldo operativo de aportaciones de vivienda

La unidad de control es el **renglón contable**, no el folio ni el mes. Esto hace el amarre compacto (3 filas finales) pero valida solo agregados — los componentes obreros, accesorios por mora y totales derivados no se validan individualmente por este amarre.

Esta filosofía viene de un equipo con enfoque contable que prefiere cerrar la prueba contra cuentas del catálogo antes de abrir diferencias a nivel documento.

## 2. Objetivo específico del amarre

Validar que los importes pagados al Instituto (consolidados operativamente desde las cédulas mensuales y bimestrales por RP) **coinciden** con los saldos anuales registrados por el cliente en las cuentas contables de IMSS, RCV e INFONAVIT dentro de su balanza de comprobación del ejercicio.

Cuando la diferencia está dentro de tolerancia (`abs(diferencia) <= 0.01`), el amarre cierra y el entregable queda validado por renglón. Cuando persiste diferencia, se abre investigación usando auxiliares contables y, si es necesario, revisión documento-por-documento.

## 3. Artefacto final

- **Workbook:** `5.1.1 - Resumen Liquidaciones mens. Y bimes..xlsx`
- **Formato:** xlsx
- **Hojas relevantes:** `Amarre`, `COPS`, `BC`
- **Hoja autoritativa (donde vive el resultado):** `Amarre`
- **Unidad de control:** renglón contable (3 renglones: IMSS, RCV, INFONAVIT; opcionalmente 4 cuando el catálogo separa Retiro de Cesantía y Vejez)
- **Cierre visible:** celda `Amarre!H17` — total consolidado de diferencias sobre los tres renglones; cuando `abs(H17) <= 0.01`, la prueba cierra

## 4. Inputs al amarre

Todas las columnas son wiki-links a schemas canónicos. El parser ya normalizó los PDFs a estas tablas.

| Input                               | Fuente canónica                                                                                                                                               | Uso                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Cuota fija patronal IMSS            | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.cuota_fija]]`                                                                    | componente patronal del COPS mensual                                    |
| Excedente patronal IMSS             | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.excedente_patronal]]`                                                            | componente patronal del COPS mensual                                    |
| Prestaciones en dinero patronal     | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.prestaciones_dinero_patronal]]`                                                  | componente patronal del COPS mensual                                    |
| Gastos médicos pensionados patronal | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.gastos_medicos_pensionados_patronal]]`                                           | componente patronal del COPS mensual                                    |
| Riesgos de trabajo                  | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.riesgos_trabajo]]`                                                               | componente patronal del COPS mensual                                    |
| Guarderías y prestaciones sociales  | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.guarderias_prestaciones_sociales]]`                                              | componente patronal del COPS mensual                                    |
| Invalidez y vida patronal           | `[[DOC-cedula-determinacion-mensual/02 - Schema#cedula_determinacion_mensual.invalidez_vida_patronal]]`                                                       | componente patronal del COPS mensual                                    |
| Retiro patronal                     | `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.retiro_patronal]]`                                                                 | componente del COPS bimestral (lado RCV)                                |
| Cesantía y vejez patronal           | `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.cesantia_vejez_patronal]]`                                                         | componente del COPS bimestral (lado RCV)                                |
| Aportación INFONAVIT sin crédito    | `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.aportacion_infonavit_sin_credito]]`                                                | componente del COPS bimestral (lado INFONAVIT)                          |
| Aportación INFONAVIT con crédito    | `[[DOC-cedula_determinacion_bimestral/02 - Schema#cedula_resumen_bimestral.aportacion_infonavit_con_credito]]`                                                | componente del COPS bimestral (lado INFONAVIT)                          |
| Cuenta / saldo final                | `[[DOC-balanza-comprobacion-anual/02 - Schema#balanza_cuentas.numero_cuenta]]` + `[[DOC-balanza-comprobacion-anual/02 - Schema#balanza_cuentas.saldo_final]]` | lookup del saldo contable por cuenta, para el lado BC del amarre        |
| Auxiliar de gastos (opcional)       | `[[DOC-auxiliares-gastos/02 - Schema#movimientos.importe]]`                                                                                                   | solo en Paso 7 cuando hay diferencia — no se consulta en el flujo feliz |

Nota sobre lo que **no** se consume:
- Componentes obreros (excedente, prestaciones en dinero, gastos médicos, invalidez, cesantía obrera) — no entran al amarre patronal v1.
- Accesorios por mora (`actualizacion_cop`, `recargos_cop`, `actualizacion_rcv`, `recargos_rcv`) — no entran al principal del amarre; si un periodo fue extemporáneo, la diferencia se explica por estos renglones y se documenta aparte.
- Amortización de créditos de vivienda — contablemente es retención al trabajador (cuenta puente en pasivo), no gasto patronal, así que no cuadra contra la cuenta `601-04-000` de aportaciones.

## 5. Procedimiento paso a paso

### Paso 1 — Identificar alcance del ejercicio

- **Input:** definición de la auditoría (empresa, ejercicio, lista de RPs esperados).
- **Operación:** confirmar con el auditor que el set documental cubre el ejercicio completo y los RPs en alcance.
- **Output:** lista cerrada de `(RP, mes)` esperados.

### Paso 2 — Reunir set documental mínimo

- **Input:** solicitudes al cliente.
- **Operación:** recibir y parsear:
  - `[[DOC-cedula-determinacion-mensual]]` — una por RP por mes (12 por RP por año)
  - `[[DOC-cedula_determinacion_bimestral]]` — una por RP por bimestre (6 por RP por año)
  - `[[DOC-balanza-comprobacion-anual]]` — una por empresa, anual
- **Output:** tablas condensadas del schema canónico, pobladas.
- **Bloqueo:** si falta cédula mensual → bloquea el bloque IMSS; si falta bimestral → bloquea RCV/INFONAVIT en meses bimestrales; si falta balanza → no se puede cerrar el amarre.

### Paso 3 — Reconstruir COPS por periodo y RP

- **Input:** tablas mensuales y bimestrales parseadas.
- **Operación:** poblar una tabla intermedia con grano `(periodo, RP)` y columnas para cada componente operativo patronal. Esta tabla corresponde a la hoja `COPS` del workbook.
- **Output:** `COPS` lleno con un bloque de 12 filas (meses) por cada RP.
- **Papel de trabajo:** `[[#PT-cops-5-1]]`.

### Paso 4 — Consolidar saldos operativos por ramo

- **Input:** `COPS` del paso 3.
- **Operación:** sumar anualmente por RP los componentes patronales y consolidar por ramo:
  - `saldo_operativo_imss = SUM(cuota_fija + excedente_patronal + prestaciones_dinero_patronal + gastos_medicos_pensionados_patronal + riesgos_trabajo + guarderias_prestaciones_sociales + invalidez_vida_patronal)` sobre los 12 meses × RPs.
  - `saldo_operativo_rcv = SUM(retiro_patronal + cesantia_vejez_patronal)` sobre los 6 bimestres × RPs.
  - `saldo_operativo_infonavit = SUM(aportacion_infonavit_sin_credito + aportacion_infonavit_con_credito)` sobre los 6 bimestres × RPs.
- **Output:** tres importes consolidados (uno por ramo) que alimentan la columna "SALDO S/ EXTRACTO" (`F13:F15`) de la hoja `Amarre`.

### Paso 5 — Mapear cuentas contables y extraer saldos

- **Input:** `[[DOC-balanza-comprobacion-anual]]`.
- **Operación:** para cada ramo, identificar la cuenta del catálogo del cliente y leer su `saldo_final`. Mapeo típico (variante v1):
  - Cuotas IMSS → cuenta cuyo nombre contiene "Cuotas IMSS" o "Cuotas Obrero Patronales" (ej: `601-02-000`)
  - Cesantía y vejez (RCV) → cuenta cuyo nombre contiene "Cesantía y Vejez" o "RCV" (ej: `601-03-000`)
  - Aportaciones al INFONAVIT → cuenta cuyo nombre contiene "Aportaciones Infonavit" o "Aportaciones Vivienda" (ej: `601-04-000`)
  - (4º renglón opcional) Retiro — cuando el catálogo separa Retiro (ej: `601-03-001`) de Cesantía y Vejez (ej: `601-03-002`)
- **Regla:** identificar la cuenta **por nombre semántico**, no por número, porque los códigos de cuenta varían por cliente. Los números citados son los observados en el ejemplo del cliente SELIM.
- **Output:** saldo contable por ramo, alimentando la columna "SALDO CONTABILIDAD" (`D13:D15` o `D13:D16`) de la hoja `Amarre`.

### Paso 6 — Calcular diferencia por renglón y total

- **Input:** saldos contable y operativo por ramo.
- **Operación:** fórmulas en `Amarre`:
  - `H13 = D13 - F13` (diferencia IMSS)
  - `H14 = D14 - F14` (diferencia RCV)
  - `H15 = D15 - F15` (diferencia INFONAVIT)
  - `H17 = SUM(H13:H16)` (diferencia total consolidada)
- **Output:** diferencia por renglón + total.

### Paso 7 — Investigar cuando no cierra

- **Cuándo aplica:** `abs(H17) > 0.01`.
- **Operación:** aplicar orden de hipótesis:
  1. Se tomó componente obrero en vez de patronal en algún componente del COPS.
  2. Se mapeó mal la cuenta contable (nombre parecido pero ramo distinto).
  3. El set de periodos está incompleto (faltan meses en alguna cédula).
  4. Hay pagos complementarios no incorporados.
  5. Hay diferencias reales derivadas del dictamen no segregadas.
- **Si el Paso 7a–7d no explica la diferencia:** solicitar `[[DOC-auxiliares-gastos]]` para la cuenta afectada y revisar movimientos mes a mes.
- **Output:** hipótesis validada o diferencia escalada al auditor.

### Paso 8 — Cierre

- **Regla de status:**
  - `Cuadrado` si `abs(H17) <= 0.01`
  - `Con diferencia explicada` si `abs(H17) > 0.01` pero hay hipótesis documentada y soporte
  - `Con diferencia no explicada` si queda abierta tras Paso 7 — escalar
- **Output:** PT autoritativo (`Amarre`) firmado; PT de soporte (`COPS`) adjunto; status declarado.

## 6. Reglas de cierre y tolerancias

- **Criterio de cierre:** `abs(Amarre!H17) <= 0.01`
- **Tolerancia:** `0.01` MXN absolutos sobre la diferencia total consolidada. Es la tolerancia del Excel original y absorbe redondeos de centavos entre componentes.
- **Regla de status:**
  - `cuadrado` si `abs(H17) <= 0.01`
  - `con diferencia` si `abs(H17) > 0.01`
  - `incompleto` si falta algún input del Paso 2 o si algún RP/mes del alcance no tiene cédula
- **Qué hacer cuando no cierra:** aplicar Paso 7 (orden de hipótesis). Escalar al auditor cuando la diferencia persista después de revisar patronal/obrero, cuentas, periodos y pagos complementarios.
- **Qué hacer con accesorios por mora:** cuando una cédula es extemporánea y contiene `actualizacion_*` / `recargos_*` > 0, la diferencia esperada entre saldo contable y principal operativo es precisamente ese monto. Se documenta pero **no** cambia el cierre del amarre principal — los accesorios no entran al saldo operativo v1.

## 7. Papeles de trabajo generados

### PT-amarre-5-1 — Amarre contable-operativo

- **Propósito:** respalda que los pagos operativos al Instituto cuadran contra la contabilidad del cliente por renglón de control.
- **Grain:** un row por renglón contable (típicamente 3; 4 si el catálogo separa Retiro).
- **Inputs:** saldos consolidados del Paso 4 + saldos contables del Paso 5.
- **Se entrega al IMSS:** sí — es el PT autoritativo del amarre de la prueba.
- **Columnas del papel:**
  - `cuenta`: string — número de cuenta contable del ramo
  - `descripcion`: string — nombre del ramo (Cuotas IMSS / Cesantía y vejez / Aportaciones al Infonavit / Retiro)
  - `saldo_contable`: decimal(14,2) — saldo final anual de la cuenta en BC
  - `saldo_operativo`: decimal(14,2) — consolidado anual desde COPS
  - `diferencia`: decimal(14,2) — `saldo_contable - saldo_operativo`
  - `status_renglon`: enum — `cuadrado` / `con diferencia`
- **Fila final:** totales consolidados (`SUM(saldo_contable)`, `SUM(saldo_operativo)`, `SUM(diferencia)`).
- **Ejemplo poblado (ejercicio SELIM 2024):** ver `Amarre!B13:I17` del workbook fuente.

### PT-cops-5-1 — Concentrado operativo mensual/bimestral por RP

- **Propósito:** respalda la construcción del `saldo_operativo_*` del PT principal; permite trazabilidad `periodo × RP → componente → suma anual`.
- **Grain:** una fila por `(periodo, RP)`, con 12 filas mensuales y hasta 6 bimestrales por RP.
- **Inputs:** tablas `cedula_determinacion_mensual` y `cedula_resumen_bimestral` parseadas.
- **Se entrega al IMSS:** no — soporte interno del amarre. Queda como evidencia si el IMSS pide trazabilidad del consolidado.
- **Columnas del papel:**
  - `registro_patronal`: string
  - `periodo`: string (YYYY-MM para mensual, YYYY-BB para bimestral)
  - componentes IMSS patronales individuales (cuota_fija, excedente_patronal, prestaciones_patronal, gmp_patronal, riesgos_trabajo, guarderias, invalidez_patronal)
  - componentes RCV patronales individuales (retiro, cv_patronal)
  - componentes INFONAVIT (aport_sc, aport_cc)
  - `total_periodo`: decimal — suma de componentes del periodo
- **Ejemplo poblado:** ver `COPS` del workbook; cada bloque de 12 filas es un RP, última fila del bloque es TOTAL anual de ese RP.

## 8. Casos especiales y bifurcaciones

### Caso — Periodo extemporáneo

- **Cuándo:** una cédula exhibe `actualizacion_*` o `recargos_*` > 0.
- **Qué hacer:** NO sumarlos al saldo operativo. El saldo operativo queda en el principal; los accesorios se documentan como nota de pie del PT-amarre.
- **Papel de trabajo afectado:** `PT-amarre-5-1` (nota de pie). El delivery sí captura los accesorios en columnas S/T/Z/AA por separado.
- **Origen:** `EC-CDM-005` + `EC-CDB-004`.

### Caso — Mes con cédula modificatoria

- **Cuándo:** para un RP + mes existen dos cédulas (original y correctiva).
- **Qué hacer:** usar la correctiva (`fecha_proceso` más reciente). La original queda superseeded en el COPS.
- **Papel de trabajo afectado:** `PT-cops-5-1`.
- **Origen:** `EC-CDM-001`.

### Caso — Catálogo contable del cliente lumpea Retiro con Cesantía

- **Cuándo:** el cliente tiene una sola cuenta `601-03-xxx` para todo RCV en lugar de separar Retiro.
- **Qué hacer:** usar 3 renglones en el amarre (no 4). `saldo_operativo_rcv` = retiro + cv patronal; `saldo_contable` lee la cuenta única.
- **Papel de trabajo afectado:** `PT-amarre-5-1` (estructura 3 filas vs 4).

### Caso — INFONAVIT con amortización en la contabilidad

- **Cuándo:** el cliente registra amortización dentro de la misma cuenta `601-04-000` que las aportaciones.
- **Qué hacer:** el saldo operativo seguirá siendo solo aportaciones (sin amortización); la diferencia contra BC será igual a la amortización anual. Documentar en nota del PT y, si el cliente tiene cuenta separada para amortización (cuenta puente en pasivo), cruzar allá para validar que cuadra el otro lado.
- **Papel de trabajo afectado:** `PT-amarre-5-1`.

## 9. Extras de la oficina

Ninguno. Esta oficina ejecuta el amarre contable-operativo y no hace validaciones adicionales no requeridas por IMSS (ej: no cuadra contra IDSE, no cruza con nóminas, no amarra folio-por-folio contra comprobante bancario). `has_extras: false`.

## 10. Errores comunes y alertas

- Tomar componente obrero en vez de patronal al construir el COPS — siempre revisar primero esta hipótesis cuando no cierra.
- Mapear una cuenta por número cuando el catálogo del cliente usa códigos distintos a los del ejemplo; **mapear por nombre semántico**.
- Olvidar que enero puede tener solo cédula mensual (sin bimestral RCV) si el ejercicio arranca con un bimestre par.
- Incluir amortización INFONAVIT al saldo operativo; el amarre v1 no la considera (va contra pasivo, no gasto).
- Tratar las cédulas modificatorias como originales: la fecha de proceso es la desempatadora.
- Sumar accesorios (actualización/recargos) al principal y romper el amarre cuando hubo extemporáneo.

## 11. Preguntas abiertas

- **4º renglón contable.** Confirmar con Josefina si la metodología canónica contempla 4 renglones (con Retiro separado) o solo 3. En el workbook ejemplo (`Amarre!D13:D16`) hay espacio para 4 filas pero solo 3 están pobladas.
- **Qué hacer con diferencias chicas explicables por pagos extemporáneos.** ¿Se documenta en el PT como nota y cierra "cuadrado con diferencia explicada", o se considera "con diferencia" que requiere escalación?
- **Auxiliares:** confirmar con Josefina qué documento específico solicita como "auxiliar de gastos" (auxiliar por cuenta, pólizas con soporte, mayor auxiliar) y en qué formato típico.

## 12. Notas de mantenimiento

- Solo se modifica vía PROP + DEC. Ver `[[changelog]]` de la prueba padre.
- Si el procedimiento cambia sustancialmente (por ejemplo, si Josefina decide incorporar el amarre por folio o cuadrar también contra comprobantes), bumpear `version` (v1 → v2) y marcar la v1 como `status: deprecated` en lugar de sobrescribir — útil si quedan auditorías abiertas con la versión original.
- El ejemplo poblado (SELIM 2024) vive en `5.1.1 - Resumen Liquidaciones mens. Y bimes..xlsx` y debe preservarse como referencia aunque el cliente cambie.
