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

<!-- Receta de extracción. Cómo leer el archivo crudo y producir el schema.
     Cambia cuando el emisor (IMSS, SAT, etc.) modifica el layout del documento.
     Se separa del schema porque el schema es el "qué sale" y esto es el "cómo se extrae".
     Las cadencias de cambio son distintas. -->

## Método de extracción

<!-- Sección que varía por parser_kind. Rellenar SOLO la subsección que aplique,
     borrar el resto. -->

### Si `parser_kind: binary-fixed-width`

Layout por tipo de registro (discriminado por primer byte / header):

#### Registro tipo `<nombre>` (discriminator: `0x<NN>`)

| campo | offset | length | tipo binario | interpretación |
|-------|--------|--------|--------------|----------------|
| ...   | 0      | 11     | ascii        | ...            |
| ...   | 11     | 8      | BCD          | fecha AAAAMMDD |
| ...   | 19     | 10     | int32-LE     | importe cents  |

### Si `parser_kind: csv` o `tsv`

- Header en línea: <número>
- Separador: <carácter>
- Quote char: <" | ' | none>
- Escape: <char>
- Columnas esperadas en orden: `[<col1>, <col2>, ...]`
- Líneas a ignorar: <patrón de comentario o filas vacías>

### Si `parser_kind: pdf-text` o `pdf-ocr`

- Páginas relevantes: <rango o criterio de selección>
- Método de extracción por campo:
  - **bbox (coordenadas):** `<campo>: (x0, y0, x1, y1) en página <N>`
  - **anchor por texto:** `<campo>: texto que aparece después de "<ancla>"`
- Si es OCR:
  - Motor recomendado: <Tesseract | Azure | AWS Textract>
  - Preproceso: <deskew | binarize | denoise>
  - Idioma: <spa | spa+eng>

### Si `parser_kind: excel`

- Hoja(s) relevantes: `[<nombre_hoja_1>, ...]`
- Rango de datos: `<A1:Z99>`
- Header row: <número>
- Notas de merged cells, fórmulas, formato condicional, etc.

### Si `parser_kind: xml` o `json`

- XPath / JSONPath por campo del schema:
  - `<tabla>.<col>`: `<expresión XPath o JSONPath>`

### Si `parser_kind: html`

- Selector CSS por campo:
  - `<tabla>.<col>`: `<selector>`
- Estrategia si hay múltiples matches: <primero | último | lista>

## Mapeo raw → schema

<!-- Referencia explícita entre lo extraído por el método de arriba y las columnas
     del schema. Redundante con las tablas del método pero útil cuando hay fórmulas. -->

| campo raw | columna del schema | transformación |
|-----------|--------------------|----------------|
| ...       | `<tabla>.<col>`    | trim + upper   |
| ...       | `<tabla>.<col>`    | div/100        |
| ...       | `<tabla>.<col>`    | parse_date("%Y%m%d") |

## Transformaciones

<!-- Conversiones de unidad, limpieza, normalización. Listar todas con el motivo. -->

- `<col>`: <transformación> porque <razón>
- `<col>`: <transformación> porque <razón>

## Casos borde del parser

<!-- Cosas que el parser debe DETECTAR y manejar programáticamente.
     Los casos de NEGOCIO profundos van en la sección "Casos límite" de 01 - Spec. -->

- Archivo con registros truncados al final → ignorar si no cumple longitud mínima
- Encoding inconsistente dentro del mismo archivo → detectar BOM y fallar con mensaje claro
- Campos con caracteres no imprimibles → normalizar o rechazar según severidad
- ...

## Dependencias / herramientas sugeridas

<!-- El dev team decide la final, pero acá van las opciones documentadas. -->

- Python: `<librería>` (ej: `pypdf`, `openpyxl`, `construct`, `lxml`)
- CLI fallback: `<comando>` (si aplica)
- Versión mínima requerida: <versión>

## Validación post-parseo

<!-- Reglas que el parser debe pasar antes de entregar el resultado.
     Separadas de las Reglas de validación (sección 3 de 01 - Spec) porque son
     sobre la ejecución del parser, no sobre los datos de negocio. -->

- Conteo de registros coincide con el header total (si existe)
- Suma de registros por tipo coincide con el total del encabezado
- No hay campos mandatory nulos (el schema los permite nullable = "no")

## Versionado del parser

El parser tiene su propia versión (campo `version` en frontmatter). Cuando el IMSS
(u otro emisor) cambia el layout oficial:

1. Se crea un PROP tipo `modify` con el diff de offsets / coords / selectors
2. El curador evalúa y emite DEC-NNNN
3. Si se acepta, se bumpea `version` y se registra en [[04 - Change log]]
4. Si el cambio rompe compatibilidad con versiones anteriores del documento,
   marcar `breaking_change_of: <versión anterior>` en frontmatter

No editar este archivo a mano. Cualquier cambio pasa por PROP.
