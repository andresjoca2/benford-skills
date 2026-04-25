---
document_id: DOC-<slug-documento>
document_name: <Nombre canónico del documento>
document_slug: <slug-documento>
status: draft
version: 1
last_updated: YYYY-MM-DD
owner_surface: <SURFACE-* o nombre de la tabla principal>
source_refs: []
---

# Schema - <Nombre canónico del documento>

## Objetivo del schema
Explicar cuál es la salida estructurada estable que el sistema debe producir.

## Grain
Definir qué representa una fila.

## Tabla o JSON final
Nombre de la tabla o superficie final.

## Campos
| Campo canónico | Tipo | Requerido | Descripción | Origen | Regla / notas |
| --- | --- | --- | --- | --- | --- |
| `<campo>` | `<string | number | date | boolean | enum>` | `sí/no` | descripción | `<campo o fuente origen>` | nota |

## Llaves
- primary key:
- business key:
- llaves auxiliares de trazabilidad:

## Campos calculados
| Campo | Fórmula o regla | Dependencias |
| --- | --- | --- |
| `<campo>` | regla | campos origen |

## Reglas de validación estructural
- no duplicados por llave principal
- tipos correctos
- periodos válidos
- montos con signo esperado
- consistencia mínima entre campos

## Trazabilidad a origen
Explicar cómo se puede rastrear cada fila al documento crudo.

## Relaciones con otras tablas o superficies
| Relación | Llave de amarre | Propósito |
| --- | --- | --- |
| `<tabla o surface>` | `<llave>` | `<para qué se amarra>` |

## Ejemplo de output
```json
[
  {
    "campo_ejemplo": "valor"
  }
]
```

## Notas
- nota 1
- nota 2
