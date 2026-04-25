---
id: DOC-balanza-auxiliar-gastos/schema
type: doc-schema
parent_doc: DOC-balanza-auxiliar-gastos
format: tabular
grain: "un row = un movimiento contable individual (cuenta × fecha × póliza × renglón)"
tables:
  - auxiliar_movimientos
  - auxiliar_saldos_cuenta
version: 1
breaking_change_of: null
---

# Auxiliar contable de gastos — Schema

## Grain

- `auxiliar_movimientos`: un row = un movimiento contable individual. Identidad por `(numero_cuenta, fecha, poliza, orden_en_export)`.
- `auxiliar_saldos_cuenta`: un row = una cuenta con sus totales consolidados cuando el export los reporta. Tabla opcional; no todos los formatos la alimentan.

## Claves y trazabilidad

- **Primary key de `auxiliar_movimientos`:** compuesta `(numero_cuenta, fecha, poliza, orden_en_export)`. No hay clave natural de negocio universal entre sistemas. `orden_en_export` es un secuencial asignado por el parser para garantizar unicidad.
- **Primary key de `auxiliar_saldos_cuenta`:** `numero_cuenta`.
- **Foreign keys hacia otros DOC-*:**
  - `auxiliar_movimientos.numero_cuenta` → [[DOC-balanza-comprobacion]]`.numero_cuenta` (la cuenta debería existir en la balanza del mismo ejercicio).
  - `auxiliar_saldos_cuenta.numero_cuenta` → [[DOC-balanza-comprobacion]]`.numero_cuenta`.

## Tabla: `auxiliar_movimientos`

**Grain:** un row = un movimiento contable individual.

| columna | tipo | nullable | pk/fk | descripción |
|---------|------|----------|-------|-------------|
| numero_cuenta | string | no | pk | número de cuenta contable del movimiento. Puede venir del archivo o haberse asignado por metadato externo. Preservado como string. |
| nombre_cuenta | string | sí | | nombre de la cuenta cuando el archivo lo incluye. Puede venir vacío si solo se proporcionó el número por metadato externo. |
| fecha | datetime | no | pk | fecha y hora contable del movimiento. Si el sistema solo provee fecha, la hora queda en `00:00:00`. |
| poliza | string | no | pk | identificador principal de la póliza. Preservado como string por prefijos alfanuméricos. |
| tipo_poliza | string | sí | | código corto que algunos sistemas emiten para clasificar la póliza (p. ej. diario, ajuste, egreso). Se preserva como cadena sin interpretación. |
| concepto | string | sí | | descripción principal del movimiento. |
| descripcion | string | sí | | descripción secundaria o texto libre adicional del movimiento, cuando el archivo trae dos campos descriptivos. Si el archivo solo trae uno, esta columna queda vacía. |
| referencia | string | sí | | identificador secundario del movimiento cuando el sistema lo emite (folio alterno, número de documento asociado, consecutivo interno). |
| empresa | string | sí | | identificador de la sociedad / empresa emisora cuando el export es multi-entidad. |
| cargo | decimal(14,2) | sí | | importe del cargo. Null o 0 si el movimiento es un abono. |
| abono | decimal(14,2) | sí | | importe del abono. Null o 0 si el movimiento es un cargo. |
| saldo_corrido | decimal(14,2) | sí | | saldo acumulado de la cuenta tras aplicar este movimiento, cuando el sistema lo reporta por renglón. |
| orden_en_export | integer | no | pk | posición secuencial del renglón en el export original. Asignado por el parser. Garantiza unicidad. |
| fuente_cuenta | string | no | | cómo se obtuvo `numero_cuenta`. Valores: `columna`, `header`, `nombre_hoja`, `nombre_archivo`, `metadato_externo`. Útil para trazabilidad y auditoría del parseo. |

### Campos calculados

| columna | expresión | depende de | descripción |
|---------|-----------|------------|-------------|
| importe_neto | `coalesce(cargo, 0) - coalesce(abono, 0)` | cargo, abono | impacto neto del movimiento. |
| tipo_movimiento | `CASE WHEN cargo > 0 THEN 'cargo' WHEN abono > 0 THEN 'abono' ELSE 'nulo' END` | cargo, abono | clasificación simple. |
| mes | `date_trunc('month', fecha)` | fecha | para agrupación por periodo. |

### Enumeraciones usadas en esta tabla

**`tipo_movimiento`:**
- `cargo` — el movimiento incrementa una cuenta de activo/gasto o disminuye una de pasivo/ingreso.
- `abono` — el movimiento disminuye una cuenta de activo/gasto o incrementa una de pasivo/ingreso.
- `nulo` — ni cargo ni abono con valor (caso anómalo detectado por VR-BAG-001/003).

**`fuente_cuenta`:**
- `columna` — la cuenta se extrajo de una columna dedicada en cada renglón.
- `header` — la cuenta se extrajo de una fila header y se propagó hacia abajo.
- `nombre_hoja` — la cuenta se extrajo del nombre de la hoja que contiene los movimientos.
- `nombre_archivo` — la cuenta se extrajo del nombre del archivo.
- `metadato_externo` — la cuenta se proporcionó como parámetro en la ingestión (no venía en el archivo).

**`tipo_poliza`:** catálogo abierto. No se cierra como enum porque cada sistema usa códigos propios.

## Tabla: `auxiliar_saldos_cuenta`

**Grain:** un row = una cuenta con sus totales para el periodo reportado. Tabla opcional.

| columna | tipo | nullable | pk/fk | descripción |
|---------|------|----------|-------|-------------|
| numero_cuenta | string | no | pk | número de cuenta. |
| nombre_cuenta | string | sí | | nombre de la cuenta. |
| saldo_inicial | decimal(14,2) | sí | | saldo al inicio del periodo cuando el export lo reporta. |
| total_cargos | decimal(14,2) | sí | | suma de cargos del periodo reportado. |
| total_abonos | decimal(14,2) | sí | | suma de abonos del periodo reportado. |
| saldo_final | decimal(14,2) | sí | | saldo al cierre del periodo reportado. |

### Campos calculados

| columna | expresión | depende de | descripción |
|---------|-----------|------------|-------------|
| movimiento_neto | `coalesce(total_cargos, 0) - coalesce(total_abonos, 0)` | total_cargos, total_abonos | movimiento neto; debe reconciliar con `saldo_final - saldo_inicial` cuando ambos existan. |

## Relaciones entre tablas internas

- `auxiliar_movimientos.numero_cuenta` → `auxiliar_saldos_cuenta.numero_cuenta` (N:1).
- Relación de validación cruzada: `sum(auxiliar_movimientos.cargo) GROUP BY numero_cuenta ≈ auxiliar_saldos_cuenta.total_cargos` (con tolerancia de redondeo). Solo evaluable cuando `auxiliar_saldos_cuenta` está poblada por el parser.

## Trazabilidad inversa

- `numero_cuenta`: fuente variable según `fuente_cuenta` (ver enumeración arriba). El parser registra explícitamente de dónde salió.
- `nombre_cuenta`: acompaña al número cuando la fuente es `columna` o `header`; típicamente vacío cuando la fuente es `nombre_archivo` o `metadato_externo`.
- `fecha`, `poliza`, `tipo_poliza`, `concepto`, `descripcion`, `referencia`, `empresa`, `cargo`, `abono`, `saldo_corrido`: columnas directas del renglón, con nombres variables según el sistema (mapeo en `03 - Parser config`).
- `orden_en_export`: asignado por el parser como entero creciente durante la lectura secuencial de filas válidas.
- `fuente_cuenta`: determinado por el parser según la estrategia de extracción usada.
- `auxiliar_saldos_cuenta.*`: poblada solo cuando el export incluye filas de totales o filas header con saldos. En exports sin estos elementos, la tabla queda vacía y las validaciones VR-BAG-004/005 no aplican.

## JSON Schema (para consumo automático)

```yaml
$schema: "http://json-schema.org/draft-07/schema#"
type: object
properties:
  auxiliar_movimientos:
    type: array
    items:
      type: object
      properties:
        numero_cuenta: {type: string, minLength: 1}
        nombre_cuenta: {type: [string, "null"]}
        fecha: {type: string, format: date-time}
        poliza: {type: string, minLength: 1}
        tipo_poliza: {type: [string, "null"]}
        concepto: {type: [string, "null"]}
        descripcion: {type: [string, "null"]}
        referencia: {type: [string, "null"]}
        empresa: {type: [string, "null"]}
        cargo: {type: [number, "null"]}
        abono: {type: [number, "null"]}
        saldo_corrido: {type: [number, "null"]}
        orden_en_export: {type: integer, minimum: 1}
        fuente_cuenta:
          type: string
          enum: [columna, header, nombre_hoja, nombre_archivo, metadato_externo]
      required: [numero_cuenta, fecha, poliza, orden_en_export, fuente_cuenta]
  auxiliar_saldos_cuenta:
    type: array
    items:
      type: object
      properties:
        numero_cuenta: {type: string, minLength: 1}
        nombre_cuenta: {type: [string, "null"]}
        saldo_inicial: {type: [number, "null"]}
        total_cargos: {type: [number, "null"]}
        total_abonos: {type: [number, "null"]}
        saldo_final: {type: [number, "null"]}
      required: [numero_cuenta]
required: [auxiliar_movimientos]
```

## Notas de implementación

- Preservar `numero_cuenta`, `poliza`, `referencia` y `tipo_poliza` como string. Nunca coercionar a integer por el riesgo de perder ceros a la izquierda o prefijos alfanuméricos.
- Importes en `decimal(14,2)`. Suficiente para saldos anuales de gasto de clientes grandes.
- `fecha` como datetime, no solo date. Algunos sistemas emiten timestamp con hora precisa; preservarlo facilita el ordenamiento estable dentro de un mismo día y la trazabilidad.
- Campos de texto (`concepto`, `descripcion`, `nombre_cuenta`, `referencia`): aplicar trim en el parser como transformación estándar. Los anchos fijos con padding son comunes.
- `auxiliar_saldos_cuenta` puede quedar completamente vacía en exports que no reportan totales. Eso es válido y no es error; simplemente limita qué validaciones aplican.
- `fuente_cuenta` es obligatorio en el output post-parseo aunque el campo en sí sea metadato operativo. Sirve para debuggear casos donde la cuenta no es lo que se esperaba.

## Cambios de schema

Este archivo solo se modifica vía el pipeline de propuestas. Ver [[04 - Change log]] para el histórico.
