---
# ── Identidad ────────────────────────────────────────────────
id: PRUEBA-IMSS-cuotas-pagadas-al-instituto/delivery/traust-monterrey
type: prueba-delivery
audit: imss
parent_prueba: PRUEBA-IMSS-cuotas-pagadas-al-instituto
pestaña_excel: "Cuotas pagadas al Instituto"

# ── Forma del entregable ─────────────────────────────────────
grain: "una fila por registro patronal consolidada al ejercicio completo"
columnas_count: 29
formato_fisico: txt
encoding: "pendiente"
delimitador: "pendiente"
celda_inicial_excel: "A7"

# ── Estado ───────────────────────────────────────────────────
status: draft
version: 1
last_decision: null

# ── Fuentes canónicas ─────────────────────────────────────────
data_sources:
  - DOC-disco-sua

# ── Reconciliations que la validan ───────────────────────────
validated_by:
  - PRUEBA-IMSS-cuotas-pagadas-al-instituto/reconciliation/traust-monterrey
---

# Cuotas pagadas al Instituto — Delivery (Traust Monterrey)

---

## 1. Objetivo del entregable

Llenar la pestaña oficial **"Cuotas pagadas al Instituto"** con una fila anual por registro patronal, consolidando desde los archivos `.SUA` del ejercicio los cotizantes, días e importes determinados para COP, RCV e INFONAVIT.

En la metodología Traust, el ACUMSUA no es un documento canónico distinto: es la vista acumulada anual que se construye desde `DOC-disco-sua`. El comprobante bancario valida el cierre del amarre, pero no alimenta columnas del delivery.

## 2. Contrato de salida

### Grain

Una fila por registro patronal consolidada para todo el ejercicio dictaminado. El trabajo operativo se hace por RP-mes y RP-bimestre, pero el entregable oficial se pega como una línea anual por RP.

### Layout oficial verificado

La pestaña viva del workbook oficial contiene 29 columnas, de `A` a `AC`, con estos grupos visuales: identificación del RP, días, enfermedades y maternidad, riesgos de trabajo, guarderías, invalidez y vida, COP, retiro, cesantía y vejez, RCV e INFONAVIT. La plantilla incluye una fila de totales propia; el delivery solo produce las filas por RP.

### Columnas (orden oficial del IMSS)

| Col | Variable IMSS | Tipo | Fórmula | Fuente canónica | Notas |
|-----|---------------|------|---------|-----------------|-------|
| A | Consecutivo | int | `ROW_NUMBER()` sobre los RP del ejercicio | generado | No viene de documento del cliente. |
| B | RP | text | `registro_patronal` normalizado | `[[DOC-disco-sua/02 - Schema#disco_sua_empresa.registro_patronal]]` | Una fila por RP. |
| C | Cotizantes reportados | int | `MAX(total_trabajadores)` del ejercicio | `[[DOC-disco-sua/02 - Schema#disco_sua_empresa.total_trabajadores]]` | No se suma por mes. |
| D | Días cotizados | int | `SUM(dias_mes)` | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.dias_mes]]` | Suma anual por RP. |
| E | Días de ausentismo | int | `SUM(dias_ausentismo_mes)` | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.dias_ausentismo_mes]]` | Suma anual por RP. |
| F | Días de incapacidad | int | `SUM(dias_incapacidad_mes)` | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.dias_incapacidad_mes]]` | Suma anual por RP. |
| G | Cuota fija | decimal(14,2) | `SUM(cuota_fija)` | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cuota_fija]]` | Componente patronal. |
| H | Cuota excedente patrón | decimal(14,2) | `SUM(cuota_excedente_patronal)` | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cuota_excedente_patronal]]` |  |
| I | Cuota excedente obrero | decimal(14,2) | `SUM(cuota_excedente_obrera)` | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cuota_excedente_obrera]]` | Campo calculado del schema del `.sua`. |
| J | Prestaciones en dinero patrón | decimal(14,2) | `SUM(prestaciones_dinero_patronal)` | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.prestaciones_dinero_patronal]]` |  |
| K | Prestaciones en dinero obrero | decimal(14,2) | `SUM(prestaciones_dinero_obrera)` | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.prestaciones_dinero_obrera]]` | Campo calculado del schema del `.sua`. |
| L | Gastos médicos pensionados patrón | decimal(14,2) | `SUM(gastos_medicos_pensionados_patronal)` | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.gastos_medicos_pensionados_patronal]]` |  |
| M | Gastos médicos pensionados obrero | decimal(14,2) | `SUM(gastos_medicos_pensionados_obrera)` | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.gastos_medicos_pensionados_obrera]]` | Campo calculado del schema del `.sua`. |
| N | Riesgos de trabajo | decimal(14,2) | `SUM(riesgos_trabajo)` | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.riesgos_trabajo]]` | Componente patronal. |
| O | Guarderías y prestaciones sociales | decimal(14,2) | `SUM(guarderias_prestaciones_sociales)` | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.guarderias_prestaciones_sociales]]` | Componente patronal. |
| P | Invalidez y vida patrón | decimal(14,2) | `SUM(invalidez_vida_patronal)` | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.invalidez_vida_patronal]]` |  |
| Q | Invalidez y vida obrero | decimal(14,2) | `SUM(invalidez_vida_obrera)` | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.invalidez_vida_obrera]]` | Campo calculado del schema del `.sua`. |
| R | Suerte principal COP | decimal(14,2) | `G + H + I + J + K + L + M + N + O + P + Q` | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cuota_fija]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cuota_excedente_patronal]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cuota_excedente_obrera]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.prestaciones_dinero_patronal]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.prestaciones_dinero_obrera]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.gastos_medicos_pensionados_patronal]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.gastos_medicos_pensionados_obrera]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.riesgos_trabajo]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.guarderias_prestaciones_sociales]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.invalidez_vida_patronal]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.invalidez_vida_obrera]]` | Columna derivada de componentes COP. |
| S | Actualización | decimal(14,2) | `SUM(actualizacion_imss)` | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.actualizacion_imss]]` | 0.00 cuando el pago fue en plazo. |
| T | Recargos | decimal(14,2) | `SUM(recargos_imss)` | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.recargos_imss]]` | 0.00 cuando el pago fue en plazo. |
| U | Total de COP | decimal(14,2) | `R + S + T`; control contra `total_imss_sumario` | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.total_imss_sumario]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.actualizacion_imss]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.recargos_imss]]` | Debe cuadrar contra componentes. |
| V | Retiro | decimal(14,2) | `SUM(retiro)` | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.retiro]]` | Solo meses bimestrales. |
| W | Cesantía y vejez patrón | decimal(14,2) | `SUM(cesantia_vejez_patronal)` | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cesantia_vejez_patronal]]` | Solo meses bimestrales. |
| X | Cesantía y vejez obrero | decimal(14,2) | `SUM(cesantia_vejez_obrera)` | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cesantia_vejez_obrera]]` | Solo meses bimestrales. |
| Y | Suerte principal RCV | decimal(14,2) | `V + W + X` | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.retiro]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cesantia_vejez_patronal]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.cesantia_vejez_obrera]]` | Columna derivada de componentes RCV. |
| Z | Actualización | decimal(14,2) | `SUM(actualizacion_rcv)` | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.actualizacion_rcv]]` |  |
| AA | Recargos | decimal(14,2) | `SUM(recargos_rcv)` | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.recargos_rcv]]` |  |
| AB | Total RCV | decimal(14,2) | `Y + Z + AA`; control contra `total_rcv_sumario` | `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.total_rcv_sumario]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.actualizacion_rcv]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.recargos_rcv]]` | Debe cuadrar contra componentes. |
| AC | INFONAVIT pagado | decimal(14,2) | `SUM(aportacion_patronal + amortizacion + actualizacion_infonavit + recargos_infonavit)` | `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.aportacion_patronal]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_trabajador.amortizacion]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.actualizacion_infonavit]]`, `[[DOC-disco-sua/02 - Schema#disco_sua_sumario.recargos_infonavit]]` | Incluye amortización. |

### Totales

La fila de totales del workbook oficial se calcula al sumar las filas por RP. No se genera una fila adicional desde el delivery.

## 3. Reglas de agregación y transformación

- **ACUMSUA como vista:** ACUMSUA es el acumulado anual construido desde los `.SUA`; no se modela como `DOC-*`.
- **Unidad operativa:** Traust arma el amarre por RP y por mes para COP, y por RP y bimestre para RCV e INFONAVIT.
- **Unidad final:** el delivery consolida todo a una sola fila anual por RP.
- **Cotizantes reportados:** se usa el máximo mensual observado, no la suma de trabajadores-mes.
- **Meses bimestrales:** RCV e INFONAVIT se toman de los folios de meses pares del ejercicio.
- **Pagos complementarios:** si existe más de un folio para el mismo RP-periodo, los importes se suman al periodo correspondiente antes de consolidar al año.
- **Campos patrón/obrero:** se toman del schema de `DOC-disco-sua`; cuando el schema los marca como calculados, siguen siendo fuente canónica aceptada.
- **Comprobante bancario:** no alimenta el delivery; valida que los importes determinados desde `.SUA` estén efectivamente pagados.

## 4. Casos especiales

### Comprobante bancario faltante

- **Cuándo ocurre:** la empresa no entregó soporte bancario del periodo.
- **Regla:** no se puede cerrar la reconciliation de Traust. El delivery puede estar materialmente calculado desde `.SUA`, pero queda sin cierre de prueba.
- **Impacto en columnas:** ninguna columna cambia de fuente; el bloqueo vive en `reconciliation_traust-monterrey.md`.
- **Origen:** SOP DGE Melanie + decisión de sesión.

### Falta un `.SUA` del ejercicio

- **Cuándo ocurre:** la empresa no entrega un mes del RP.
- **Regla:** el acumulado ACUMSUA queda incompleto y no debe cerrarse como base completa.
- **Impacto en columnas:** puede subestimar días, cotizantes e importes del RP.
- **Origen:** SOP ACUMSUA Nelly.

### Pago complementario

- **Cuándo ocurre:** existe más de un folio SUA para el mismo RP-periodo.
- **Regla:** sumar normal y complementaria antes de consolidar el RP anual.
- **Impacto en columnas:** afecta los importes del ramo del periodo.
- **Origen:** SOP DGE Melanie.

## 5. Formato del TXT final

### Archivo

- **Extensión:** `.txt`
- **Encoding:** pendiente de confirmar contra harness
- **Delimitador:** pendiente de confirmar contra harness
- **Fin de línea:** pendiente de confirmar contra harness
- **Header:** no

### Template del TXT

```text
{{consecutivo}}	{{registro_patronal}}	{{cotizantes_reportados}}	{{dias_cotizados}}	{{dias_ausentismo}}	{{dias_incapacidad}}	{{cuota_fija}}	{{cuota_excedente_patron}}	{{cuota_excedente_obrero}}	{{prestaciones_dinero_patron}}	{{prestaciones_dinero_obrero}}	{{gastos_medicos_pensionados_patron}}	{{gastos_medicos_pensionados_obrero}}	{{riesgos_trabajo}}	{{guarderias_prestaciones_sociales}}	{{invalidez_vida_patron}}	{{invalidez_vida_obrero}}	{{suerte_principal_cop}}	{{actualizacion_cop}}	{{recargos_cop}}	{{total_cop}}	{{retiro}}	{{cesantia_vejez_patron}}	{{cesantia_vejez_obrero}}	{{suerte_principal_rcv}}	{{actualizacion_rcv}}	{{recargos_rcv}}	{{total_rcv}}	{{infonavit_pagado}}
```

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
        consecutivo: {type: integer}
        registro_patronal: {type: string}
        cotizantes_reportados: {type: integer}
        dias_cotizados: {type: integer}
        dias_ausentismo: {type: integer}
        dias_incapacidad: {type: integer}
        cuota_fija: {type: number}
        cuota_excedente_patron: {type: number}
        cuota_excedente_obrero: {type: number}
        prestaciones_dinero_patron: {type: number}
        prestaciones_dinero_obrero: {type: number}
        gastos_medicos_pensionados_patron: {type: number}
        gastos_medicos_pensionados_obrero: {type: number}
        riesgos_trabajo: {type: number}
        guarderias_prestaciones_sociales: {type: number}
        invalidez_vida_patron: {type: number}
        invalidez_vida_obrero: {type: number}
        suerte_principal_cop: {type: number}
        actualizacion_cop: {type: number}
        recargos_cop: {type: number}
        total_cop: {type: number}
        retiro: {type: number}
        cesantia_vejez_patron: {type: number}
        cesantia_vejez_obrero: {type: number}
        suerte_principal_rcv: {type: number}
        actualizacion_rcv: {type: number}
        recargos_rcv: {type: number}
        total_rcv: {type: number}
        infonavit_pagado: {type: number}
      required:
        - consecutivo
        - registro_patronal
        - cotizantes_reportados
        - dias_cotizados
        - dias_ausentismo
        - dias_incapacidad
required: [rows]
```

## 7. Matriz de validación

| Columna | rec. Traust Monterrey |
|---------|------------------------|
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

Leyenda: ✓ valida · ○ generado/no aplica.

## 8. Preguntas abiertas

- Confirmar formato físico final del TXT: encoding, delimitador y fin de línea.

## 9. Notas de mantenimiento

- Este delivery está escrito para la metodología Traust Monterrey: `.SUA` → ACUMSUA derivado → DGE → fila anual por RP.
- Si el schema de `DOC-disco-sua` cambia el nombre de campos calculados patrón/obrero, este delivery debe actualizar sus wiki-links.
