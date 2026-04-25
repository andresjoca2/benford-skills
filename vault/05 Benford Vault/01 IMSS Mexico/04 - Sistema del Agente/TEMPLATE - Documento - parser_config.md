---
document_id: DOC-<slug-documento>
document_name: <Nombre canónico del documento>
document_slug: <slug-documento>
status: draft
version: 1
last_updated: YYYY-MM-DD
input_formats: []
source_refs: []
---

# Parser Config - <Nombre canónico del documento>

## Objetivo del parsing
Explicar qué convierte este parser y hacia qué `schema`.

## Tipo de input
- formatos aceptados:
- formatos no aceptados:
- supuestos de entrada:

## Estrategia de reconocimiento
- cómo se detecta el documento
- señales de layout
- encabezados o labels esperados
- si hay variantes conocidas

## Estructura esperada del input
### Hojas, secciones o bloques
- bloque 1
- bloque 2

### Campos críticos de reconocimiento
- campo 1
- campo 2

## Mapeo origen -> destino
| Origen | Destino canónico | Regla |
| --- | --- | --- |
| `<campo origen>` | `<campo schema>` | `<transformación>` |

## Normalizaciones
- trim
- uppercase/lowercase
- parseo de fechas
- homologación de catálogos
- limpieza de signos y montos

## Heurísticas
- heurística 1
- heurística 2

## Fallbacks permitidos
- fallback 1
- fallback 2

## Errores comunes
- error 1
- error 2

## Notas por variante
### Variante 1
Reglas específicas.

### Variante 2
Reglas específicas.

## Dependencias
- catálogos externos
- tablas auxiliares
- documentos relacionados

## Salida esperada
- archivo, tabla o superficie objetivo:
- criterios mínimos de éxito:
