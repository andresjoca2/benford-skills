---
id: DOC-emision-ema/schema
type: doc-schema
parent_doc: DOC-emision-ema
format: mixed
grain: "depende de la tabla: resumen agregado por archivo, movimientos por trabajador-movimiento"
tables:
  - emision_ema_resumen
  - movimientos_ema
version: 1
breaking_change_of: null
---

# Emisión Mensual Anticipada (EMA) — Schema

## Grain

- `emision_ema_resumen`: un row = un archivo EMA (un RP + un periodo mensual). Contiene los totales agregados.
- `movimientos_ema`: un row = un movimiento afiliatorio por trabajador, emitido en la EMA del periodo.

## Claves y trazabilidad

- **Primary key del documento:** `(registro_patronal, periodo_año, periodo_mes)` en `emision_ema_resumen`
- **Foreign keys hacia otros DOC-*:**
  - `emision_ema_resumen.registro_patronal` → [[DOC-disco-sua]]`.registro_patronal`
  - `emision_ema_resumen.numero_propuesta_imss` → referencia lógica cruzable con el folio/propuesta de la cédula de determinación mensual cuando aplica

## Tabla: `emision_ema_resumen`

**Grain:** un row = un archivo EMA (un RP + un periodo mensual).

| columna | tipo | nullable | pk/fk | descripción |
|---------|------|----------|-------|-------------|
| registro_patronal | string | no | pk | registro patronal del archivo, normalizado sin guiones |
| periodo_año | integer | no | pk | año del periodo mensual |
| periodo_mes | integer | no | pk | mes del periodo mensual (1-12) |
| razon_social | string | sí | | nombre o razón social del patrón según el archivo |
| numero_propuesta_imss | string | no | | número de propuesta IMSS asignado por el IMSS para esta emisión |
| dias | integer | no | | días totales cotizados en la emisión |
| total_cotizantes_imss | integer | no | | cantidad de cotizantes IMSS en la emisión |
| prima_riesgo_trabajo | decimal(10,5) | no | | prima de riesgos de trabajo emitida por IDSE (ej: 0.57474) |
| tipo_documento | integer | no | | tipo de documento IMSS asignado por el IMSS |
| cuota_fija | decimal(14,2) | no | | componente IMSS |
| excedente_patronal | decimal(14,2) | no | | componente IMSS |
| excedente_obrero | decimal(14,2) | no | | componente IMSS |
| prestaciones_dinero_patronal | decimal(14,2) | no | | componente IMSS |
| prestaciones_dinero_obrero | decimal(14,2) | no | | componente IMSS |
| gastos_medicos_pensionados_patronal | decimal(14,2) | no | | componente IMSS |
| gastos_medicos_pensionados_obrero | decimal(14,2) | no | | componente IMSS |
| riesgos_trabajo | decimal(14,2) | no | | componente IMSS |
| invalidez_vida_patronal | decimal(14,2) | no | | componente IMSS |
| invalidez_vida_obrero | decimal(14,2) | no | | componente IMSS |
| guarderias_prestaciones_sociales | decimal(14,2) | no | | componente IMSS |
| total_imss | decimal(14,2) | no | | total de la emisión IMSS |

### Campos calculados

| columna | expresión | depende de | descripción |
|---------|-----------|------------|-------------|
| periodo_ym | `format(periodo_año, '04d') + '-' + format(periodo_mes, '02d')` | periodo_año, periodo_mes | representación canónica del periodo para joins |
| suma_componentes_imss | suma de los 11 componentes IMSS | componentes IMSS | usado por VR-EMA-004 para validar contra total_imss |

## Tabla: `movimientos_ema`

**Grain:** un row = un movimiento afiliatorio emitido en la EMA para un trabajador.

| columna | tipo | nullable | pk/fk | descripción |
|---------|------|----------|-------|-------------|
| registro_patronal | string | no | fk | RP del archivo padre |
| periodo_año | integer | no | fk | año del periodo padre |
| periodo_mes | integer | no | fk | mes del periodo padre |
| nss | string | no | | número de seguridad social del trabajador |
| nombre | string | sí | | nombre del trabajador |
| origen_movimiento | integer | no | | código de origen del movimiento |
| tipo_movimiento | integer | no | | código de tipo de movimiento (alta, baja, modificación, permanencia, etc.) |
| fecha_movimiento | date | sí | | fecha del movimiento; nula cuando el archivo muestra `-` |
| dias | integer | no | | días cotizados del movimiento |
| salario_diario | decimal(12,2) | no | | salario diario integrado del trabajador en el movimiento |
| cuota_fija | decimal(12,2) | no | | componente IMSS del movimiento |
| excedente_patronal | decimal(12,2) | no | | componente IMSS del movimiento |
| excedente_obrero | decimal(12,2) | no | | componente IMSS del movimiento |
| prestaciones_dinero_patronal | decimal(12,2) | no | | componente IMSS del movimiento |
| prestaciones_dinero_obrero | decimal(12,2) | no | | componente IMSS del movimiento |
| gastos_medicos_pensionados_patronal | decimal(12,2) | no | | componente IMSS del movimiento |
| gastos_medicos_pensionados_obrero | decimal(12,2) | no | | componente IMSS del movimiento |
| riesgos_trabajo | decimal(12,2) | no | | componente IMSS del movimiento |
| invalidez_vida_patronal | decimal(12,2) | no | | componente IMSS del movimiento |
| invalidez_vida_obrero | decimal(12,2) | no | | componente IMSS del movimiento |
| guarderias_prestaciones_sociales | decimal(12,2) | no | | componente IMSS del movimiento |
| total | decimal(12,2) | no | | total del movimiento |

### Enumeraciones usadas en esta tabla

**`origen_movimiento`** y **`tipo_movimiento`**: códigos numéricos definidos por el IMSS.

<!-- PENDIENTE: catálogo completo de códigos de origen y tipo de movimiento no está citado en los SOPs; requiere documento normativo del IMSS -->

## Relaciones entre tablas internas

- `movimientos_ema.(registro_patronal, periodo_año, periodo_mes)` → `emision_ema_resumen.(registro_patronal, periodo_año, periodo_mes)` (relación N:1)
- Un trabajador puede tener múltiples movimientos en el mismo periodo, por lo que `nss` no es único dentro del periodo.

## Trazabilidad inversa

**`emision_ema_resumen`:**
- Hoja de origen: primera hoja del archivo, nombre patrón `^Emisión\s+[A-Za-záéíóú]+\s+\d{4}$`.
- Labels en columna A, valores en columna B.
- `razon_social`: celda A3.

**`movimientos_ema`:**
- Hoja de origen: nombre patrón `^Movimientos\s+EMA\s+[A-Za-záéíóú]+\s+\d{4}$`.
- Fila de encabezados: posición 4 (0-indexed); datos desde fila 5.
- Columnas canónicas: 19 primeras, leídas por posición.

## JSON Schema (para consumo automático)

```yaml
$schema: "http://json-schema.org/draft-07/schema#"
type: object
properties:
  emision_ema_resumen:
    type: object
    properties:
      registro_patronal: {type: string, pattern: "^[A-Z0-9]+$"}
      periodo_año: {type: integer, minimum: 2000, maximum: 2100}
      periodo_mes: {type: integer, minimum: 1, maximum: 12}
      prima_riesgo_trabajo: {type: number, minimum: 0}
      total_imss: {type: number, minimum: 0}
    required: [registro_patronal, periodo_año, periodo_mes,
               numero_propuesta_imss, prima_riesgo_trabajo, total_imss]
  movimientos_ema:
    type: array
    items:
      type: object
      properties:
        nss: {type: string, minLength: 1}
        dias: {type: integer, minimum: 0}
        salario_diario: {type: number, minimum: 0}
        total: {type: number}
      required: [nss, origen_movimiento, tipo_movimiento, dias, salario_diario, total]
required: [emision_ema_resumen, movimientos_ema]
```

## Notas de implementación

- Todos los importes se almacenan en decimal con 2 posiciones fraccionarias, excepto `prima_riesgo_trabajo` que usa 5 posiciones.
- El campo `registro_patronal` se normaliza eliminando guiones y pasando a mayúsculas.
- Los códigos `origen_movimiento` y `tipo_movimiento` se preservan como enteros.
- El campo `fecha_movimiento` puede ser null cuando el archivo muestra `-`.

## Cambios de schema

Este archivo solo se modifica vía el pipeline de propuestas. Ver [[04 - Change log]] para el histórico.
