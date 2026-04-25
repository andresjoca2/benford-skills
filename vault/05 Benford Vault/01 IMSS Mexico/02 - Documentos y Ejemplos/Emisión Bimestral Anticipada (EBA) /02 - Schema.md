---
id: DOC-emision-eba/schema
type: doc-schema
parent_doc: DOC-emision-eba
format: mixed
grain: "depende de la tabla: resumen agregado por archivo, movimientos por trabajador-movimiento"
tables:
  - emision_eba_resumen
  - movimientos_eba
version: 1
breaking_change_of: null
---

# Emisión Bimestral Anticipada (EBA) — Schema

## Grain

- `emision_eba_resumen`: un row = un archivo EBA (un RP + un periodo bimestral, referenciado al mes que cierra el bimestre).
- `movimientos_eba`: un row = un movimiento afiliatorio por trabajador, emitido en la EBA del bimestre.

## Claves y trazabilidad

- **Primary key del documento:** `(registro_patronal, periodo_año, periodo_mes)` en `emision_eba_resumen`
- **Foreign keys hacia otros DOC-*:**
  - `emision_eba_resumen.registro_patronal` → [[DOC-disco-sua]]`.registro_patronal`
  - `emision_eba_resumen.numero_propuesta_rcv` → referencia lógica cruzable con el folio/propuesta de la cédula de determinación bimestral cuando aplica

## Tabla: `emision_eba_resumen`

**Grain:** un row = un archivo EBA (un RP + un periodo bimestral).

| columna | tipo | nullable | pk/fk | descripción |
|---------|------|----------|-------|-------------|
| registro_patronal | string | no | pk | registro patronal del archivo, normalizado sin guiones |
| periodo_año | integer | no | pk | año del periodo (mes que cierra bimestre) |
| periodo_mes | integer | no | pk | mes del periodo (mes que cierra bimestre) |
| razon_social | string | sí | | nombre o razón social del patrón |
| numero_propuesta_rcv | string | no | | número de propuesta RCV asignado por el IMSS |
| total_cotizantes_rcv | integer | no | | cantidad de cotizantes RCV |
| tipo_documento | integer | no | | tipo de documento RCV asignado por el IMSS |
| numero_acreditados | integer | no | | cantidad de acreditados de crédito de vivienda |
| total_aportacion_patronal_infonavit | decimal(14,2) | no | | total aportación patronal Infonavit |
| aportacion_patronal_sc_infonavit | decimal(14,2) | no | | aportación patronal sin crédito |
| aportacion_patronal_cc_infonavit | decimal(14,2) | no | | aportación patronal con crédito |
| amortizacion | decimal(14,2) | no | | amortización agregada |
| aportacion_patronal_cc_det_mas_amort | decimal(14,2) | no | | aportación patronal con crédito determinada más amortización |
| suma_infonavit | decimal(14,2) | no | | suma del bloque Infonavit |
| retiro | decimal(14,2) | no | | componente RCV: retiro |
| cesantia_vejez_patronal | decimal(14,2) | no | | componente RCV: cesantía y vejez patronal |
| cesantia_vejez_obrero | decimal(14,2) | no | | componente RCV: cesantía y vejez obrero |
| suma_rcv | decimal(14,2) | no | | suma del bloque RCV |
| total_rcv | decimal(14,2) | no | | total de la emisión RCV |

### Campos calculados

| columna | expresión | depende de | descripción |
|---------|-----------|------------|-------------|
| periodo_ym | `format(periodo_año, '04d') + '-' + format(periodo_mes, '02d')` | periodo_año, periodo_mes | representación canónica del periodo para joins |
| suma_bloques | `suma_infonavit + suma_rcv` | suma_infonavit, suma_rcv | usado por VR-EBA-004 para validar contra total_rcv |

## Tabla: `movimientos_eba`

**Grain:** un row = un movimiento afiliatorio emitido en la EBA para un trabajador.

| columna | tipo | nullable | pk/fk | descripción |
|---------|------|----------|-------|-------------|
| registro_patronal | string | no | fk | RP del archivo padre |
| periodo_año | integer | no | fk | año del periodo padre |
| periodo_mes | integer | no | fk | mes del periodo padre |
| nss | string | no | | número de seguridad social del trabajador |
| nombre | string | sí | | nombre del trabajador |
| origen_movimiento | integer | no | | código de origen del movimiento |
| tipo_movimiento | integer | no | | código de tipo de movimiento |
| fecha_movimiento | date | sí | | fecha del movimiento; nula cuando el archivo muestra `-` |
| dias | integer | no | | días cotizados del movimiento en el bimestre |
| salario_diario | decimal(12,2) | no | | salario diario integrado del trabajador |
| retiro | decimal(12,2) | no | | componente RCV: retiro |
| cesantia_vejez_patronal | decimal(12,2) | no | | componente RCV: cesantía y vejez patronal |
| cesantia_vejez_obrero | decimal(12,2) | no | | componente RCV: cesantía y vejez obrero |
| subtotal_rcv | decimal(12,2) | no | | subtotal del bloque RCV del movimiento |
| aportacion_patronal | decimal(12,2) | no | | aportación patronal de vivienda del movimiento |
| tipo_descuento | string | sí | | tipo de descuento de crédito (ej: `CF`); nulo si no hay crédito |
| valor_descuento | string | sí | | valor de descuento de crédito (ej: `5,706.91`); nulo si no hay crédito |
| numero_credito | string | sí | | número de crédito de vivienda; nulo si no hay crédito |
| amortizacion | decimal(12,2) | no | | amortización del crédito de vivienda del movimiento (0 si no hay crédito) |
| subtotal_infonavit | decimal(12,2) | no | | subtotal del bloque Infonavit del movimiento |
| total | decimal(12,2) | no | | total del movimiento |

### Enumeraciones usadas en esta tabla

**`origen_movimiento`** y **`tipo_movimiento`**: códigos numéricos definidos por el IMSS.

**`tipo_descuento`**: catálogo de tipos de descuento INFONAVIT (ej: `CF` = cuota fija).

<!-- PENDIENTE: catálogos completos de códigos de origen/tipo de movimiento y de tipos de descuento no están citados en los SOPs; requieren documento normativo del IMSS/INFONAVIT -->

## Relaciones entre tablas internas

- `movimientos_eba.(registro_patronal, periodo_año, periodo_mes)` → `emision_eba_resumen.(registro_patronal, periodo_año, periodo_mes)` (relación N:1)
- Un trabajador puede tener múltiples movimientos en el mismo periodo, por lo que `nss` no es único dentro del periodo.

## Trazabilidad inversa

**`emision_eba_resumen`:**
- Hoja de origen: hoja con nombre patrón `^Emisión\s+[A-Za-záéíóú]+\s+\d{4}$`.
- Labels de sección RCV en columna D, valores en columna E.
- `registro_patronal`: se lee desde la sección IMSS (columna A/B) porque la sección RCV no lo repite; ambas secciones pertenecen al mismo RP.
- `periodo_año`/`periodo_mes`: se leen desde el campo "Periodo Mensual" de la sección IMSS (columna A/B).
- `razon_social`: celda A3.

**`movimientos_eba`:**
- Hoja de origen: nombre patrón `^Movimientos\s+EBA\s+[A-Za-záéíóú]+\s+\d{4}$`.
- Fila de encabezados: posición 4 (0-indexed); datos desde fila 5.
- Columnas canónicas: 18 primeras, leídas por posición.

## JSON Schema (para consumo automático)

```yaml
$schema: "http://json-schema.org/draft-07/schema#"
type: object
properties:
  emision_eba_resumen:
    type: object
    properties:
      registro_patronal: {type: string, pattern: "^[A-Z0-9]+$"}
      periodo_año: {type: integer, minimum: 2000, maximum: 2100}
      periodo_mes: {type: integer, minimum: 1, maximum: 12}
      total_rcv: {type: number, minimum: 0}
    required: [registro_patronal, periodo_año, periodo_mes,
               numero_propuesta_rcv, total_cotizantes_rcv,
               suma_infonavit, suma_rcv, total_rcv]
  movimientos_eba:
    type: array
    items:
      type: object
      properties:
        nss: {type: string, minLength: 1}
        dias: {type: integer, minimum: 0}
        total: {type: number}
      required: [nss, origen_movimiento, tipo_movimiento, dias, total]
required: [emision_eba_resumen, movimientos_eba]
```

## Notas de implementación

- Todos los importes se almacenan en decimal con 2 posiciones fraccionarias.
- El campo `registro_patronal` se normaliza eliminando guiones y pasando a mayúsculas.
- Los códigos `origen_movimiento` y `tipo_movimiento` se preservan como enteros.
- El campo `fecha_movimiento` puede ser null cuando el archivo muestra `-`.
- **`valor_descuento` se preserva como string** (no se convierte a decimal) porque viene con coma de miles (ej: `"5,706.91"`) y su semántica depende de `tipo_descuento` — puede representar un factor, porcentaje o monto según el tipo.
- `tipo_descuento`, `valor_descuento` y `numero_credito` son nullable y aparecen como `-` en el archivo cuando el trabajador no tiene crédito activo.

## Cambios de schema

Este archivo solo se modifica vía el pipeline de propuestas. Ver [[04 - Change log]] para el histórico.
