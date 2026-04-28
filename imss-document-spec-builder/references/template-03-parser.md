---
id: DOC-<slug>/parser
type: parser-config
parent_doc: DOC-<slug>
parser_kind: <binary-fixed-width|csv|tsv|pdf-text|pdf-ocr|excel|xml|html|json>
encoding: <CP-850|UTF-8|latin-1|null>
delimiter: <"|" | "," | "\t" | null>
version: 1
---

# <Nombre del documento> — Parser config

## Método de extracción

<Explicación de alto nivel del método de parseo, adaptado al tipo de archivo.>

### Estrategia general

1. <paso 1>
2. <paso 2>
3. <paso 3>

### Detalles específicos del formato

<!-- Rellena solo la subsección que aplique al parser_kind. -->

#### Si `parser_kind: binary-fixed-width`

Layout por tipo de registro:

| campo | offset | length | tipo binario | interpretación |
|-------|--------|--------|--------------|----------------|
| ...   | 0      | 11     | ascii        | ...            |

#### Si `parser_kind: csv` o `tsv`

- Header en línea: <número>
- Separador: <carácter>
- Quote char: <" | ' | none>
- Columnas esperadas en orden: `[<col1>, <col2>, ...]`

#### Si `parser_kind: pdf-text` o `pdf-ocr`

- Páginas relevantes: <rango o criterio>
- Método de extracción por campo:
  - **anchor por texto:** `<campo>: texto que sigue al label "<ancla>"`
  - **bbox (coordenadas):** `<campo>: (x0, y0, x1, y1) en página <N>`

#### Si `parser_kind: excel`

- Hoja(s) relevantes y cómo identificarlas (por nombre exacto o patrón regex)
- Fila de encabezados
- Rango de datos
- Columnas canónicas por posición y/o por encabezado

#### Si `parser_kind: xml` o `json`

- XPath / JSONPath por campo del schema

## Mapeo raw → schema

| campo raw | columna del schema | transformación |
|-----------|--------------------|----------------|
| ...       | `<tabla>.<col>`    | trim + upper   |
| ...       | `<tabla>.<col>`    | div/100        |

## Transformaciones

- `<col>`: <transformación> porque <razón>
- `<col>`: <transformación> porque <razón>

## Casos borde del parser

<Cosas que el parser debe detectar y manejar programáticamente.>

- ...

## Dependencias / herramientas sugeridas

- Python: `<librería>` (ej: `pypdf`, `xlrd`, `openpyxl`, `construct`, `lxml`)
- Versión mínima requerida: <versión>

## Validación post-parseo

<Reglas que el parser debe pasar antes de entregar el resultado.>

- ...

## Versionado del parser

<Descripción de cuándo bumpea la versión del parser.>

No editar este archivo a mano. Cualquier cambio pasa por PROP.
