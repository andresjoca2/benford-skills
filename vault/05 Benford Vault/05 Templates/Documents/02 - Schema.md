---
id: DOC-<slug>/schema
type: doc-schema
parent_doc: DOC-<slug>
format: tabular                     # tabular | json-tree | key-value | mixed
grain: "<una frase describiendo la unidad de un row>"
tables:                             # Listar los nombres de las tablas que salen del parser
  - <nombre_tabla_1>
  - <nombre_tabla_2>
version: 1
breaking_change_of: null            # Si esta versión rompe compatibilidad, apuntar a la anterior
---

# <Nombre del documento> — Schema

<!-- La tabla final que el sistema debe producir al parsear este documento.
     Este archivo es el CONTRATO DE SALIDA del parser.
     Si cambia, el dev team necesita saber inmediatamente (van a tener que ajustar el harness).
     Por eso todo cambio pasa por PROP + DEC. -->

## Grain

<!-- ¿Qué representa una fila? Ejemplos:
     - "un row = un trabajador-periodo" (SUA)
     - "un row = un movimiento afiliatorio" (movimientos)
     - "un row = un comprobante de pago" (SIPARE)
     Sé preciso — es lo que le evita bugs al dev team. -->

<Frase explicando la unidad atómica de cada tabla. Si hay varias tablas con grains
distintos, especificar uno por tabla.>

## Claves y trazabilidad

- **Primary key del documento:** <columna o columnas que identifican la instancia del doc>
  (ej: `rfc_patron + periodo` para un disco SUA)
- **Foreign keys hacia otros DOC-*:**
  - `<col>` → [[DOC-<otro>]]`.<col>`
  - ...

## Tabla: `<nombre_tabla_1>`

**Grain:** <un row = ...>

| columna | tipo | nullable | pk/fk | descripción | ejemplo | fuente raw |
|---------|------|----------|-------|-------------|---------|------------|
| <col>   | string | no     | pk    | ...         | ABC123  | offset 0-11 |
| <col>   | decimal(12,2) | sí | | ...        | 1234.56 | offset 62-72 |
| <col>   | date | no       |       | ...         | 2026-04-01 | offset 72-80 |

### Campos calculados (no vienen directo del raw)

| columna | expresión | depende de | descripción |
|---------|-----------|------------|-------------|
| <col_calc> | <pseudo-fórmula o SQL-like> | <cols fuente> | <para qué sirve> |

### Enumeraciones usadas en esta tabla

<!-- Si alguna columna es enum, listar los valores posibles y su significado. -->

**`<columna_enum>`:**
- `valor_1` — <significado>
- `valor_2` — <significado>

## Tabla: `<nombre_tabla_2>`

<!-- Repetir la misma estructura. -->

**Grain:** <...>

| columna | tipo | nullable | pk/fk | descripción | ejemplo | fuente raw |
|---------|------|----------|-------|-------------|---------|------------|
| ...     | ...  | ...      | ...   | ...         | ...     | ...        |

## Relaciones entre tablas internas

<!-- Si hay múltiples tablas, cómo se relacionan entre sí. -->

- `<tabla_2>.<fk_col>` → `<tabla_1>.<pk_col>` (relación 1:N / N:1 / N:N)
- ...

## Trazabilidad inversa

<!-- Mapeo columna del schema → de dónde sale en el archivo crudo. -->
<!-- Redundante con la columna "fuente raw" de arriba, pero útil para debuggear. -->
<!-- En casos con fórmulas complejas, ponerlo aquí en prosa. -->

- `<tabla>.<col>`: viene de <bytes X-Y | celda A1 | XPath //foo/bar | combinación de X+Y+Z>

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
  <nombre_tabla_2>:
    type: array
    items:
      type: object
      properties:
        ...
      required: [...]
required: [<nombre_tabla_1>]
```

## Notas de implementación

<!-- Cualquier cosa que el dev team deba saber y que no encaje en los cuadros de arriba.
     Tipos exóticos, tolerancias de precisión, gotchas de zona horaria, etc. -->

- ...

## Cambios de schema

Este archivo solo se modifica vía el pipeline de propuestas:
1. Una sesión con auditor o una detección automática genera un `PROP`
2. El curador emite `DEC-NNNN`
3. Los cambios aceptados se aplican aquí y se bumpea `version`
4. Si el cambio rompe compatibilidad (eliminar columna, cambiar tipo), se marca
   `breaking_change_of` en frontmatter apuntando a la versión previa

No editar este archivo a mano. Ver [[04 - Change log]] para el histórico.
