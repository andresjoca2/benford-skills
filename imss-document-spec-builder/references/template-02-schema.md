---
id: DOC-<slug>/schema
type: doc-schema
parent_doc: DOC-<slug>
format: <tabular | json-tree | key-value | mixed>
grain: "<una frase describiendo la unidad de un row>"
tables:
  - <nombre_tabla_1>
  - <nombre_tabla_2>
version: 1
breaking_change_of: null
---

# <Nombre del documento> — Schema

## Grain

<Frase explicando la unidad atómica de cada tabla. Si hay varias tablas con
grains distintos, especificar uno por tabla.>

## Claves y trazabilidad

- **Primary key del documento:** <columna o columnas que identifican la instancia>
- **Foreign keys hacia otros DOC-*:**
  - `<col>` → [[DOC-<otro>]]`.<col>`

## Tabla: `<nombre_tabla_1>`

**Grain:** <un row = ...>

| columna | tipo | nullable | pk/fk | descripción |
|---------|------|----------|-------|-------------|
| <col>   | string | no     | pk    | ...         |
| <col>   | decimal(12,2) | sí | | ...        |
| <col>   | date | no       |       | ...         |

### Campos calculados

| columna | expresión | depende de | descripción |
|---------|-----------|------------|-------------|
| <col_calc> | <pseudo-fórmula> | <cols fuente> | <para qué sirve> |

### Enumeraciones usadas en esta tabla

**`<columna_enum>`:**
- `valor_1` — <significado>
- `valor_2` — <significado>

## Tabla: `<nombre_tabla_2>`

<!-- Repetir estructura si hay más tablas. -->

## Relaciones entre tablas internas

- `<tabla_2>.<fk_col>` → `<tabla_1>.<pk_col>` (relación 1:N / N:1 / N:N)

## Trazabilidad inversa

<Mapeo columna del schema → de dónde sale en el archivo crudo. Útil para debuggear.>

- `<tabla>.<col>`: viene de <bytes X-Y | celda A1 | XPath //foo/bar | ...>

## JSON Schema (para consumo automático)

```yaml
$schema: "http://json-schema.org/draft-07/schema#"
type: object
properties:
  <nombre_tabla_1>:
    type: array
    items:
      type: object
      properties:
        <col>: {type: string, pattern: "^[A-Z0-9]+$"}
        <col>: {type: number, minimum: 0}
      required: [<col>, <col>]
required: [<nombre_tabla_1>]
```

## Notas de implementación

<Cualquier cosa técnica que el dev team deba saber. Tipos exóticos, tolerancias
de precisión, gotchas de zona horaria, etc.>

- ...

## Cambios de schema

Este archivo solo se modifica vía el pipeline de propuestas. Ver
[[04 - Change log]] para el histórico.
