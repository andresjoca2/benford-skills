# STANDARD - Paquete documental

## Propósito
Definir el estándar operativo para documentar cada tipo de documento dentro de `02 - Documentos y Ejemplos`.

La unidad documental oficial es:
- una carpeta por tipo de documento
- `spec.md`
- `schema.md`
- `parser_config.md`
- `change_log.md`
- carpeta `Documentos ejemplo/`

No usar un solo `.md` principal para todo el documento.

## Estructura esperada por documento
Ejemplo:

- `Disco de pago SUA/`
  - `spec.md`
  - `schema.md`
  - `parser_config.md`
  - `change_log.md`
  - `Documentos ejemplo/`

## Qué resuelve cada archivo

### `spec.md`
Contrato funcional y humano del documento.

Debe responder:
- qué es el documento
- para qué sirve
- cómo lo reconoce el auditor
- qué nombres alternos usa el cliente o la firma
- cuál es su alcance
- con qué periodicidad aparece
- si es obligatorio, opcional o condicional
- qué bloquea si falta
- en qué pruebas se usa
- qué riesgos cubre
- qué casos límite o variantes son comunes
- qué validaciones mínimas deben correrse antes de usarlo

### `schema.md`
Contrato de salida estructurada del documento.

Debe responder:
- cuál es la tabla o JSON final que el sistema debe producir
- cuál es el `grain`
- qué representa una fila
- cuáles son los campos
- cuáles son sus tipos
- cuáles son sus llaves
- qué campos calculados existen
- cómo se conserva la trazabilidad al origen
- qué relaciones tiene con otras superficies o tablas

### `parser_config.md`
Contrato de extracción y transformación.

Debe responder:
- cómo entra el documento al sistema
- cómo se identifica el layout
- qué hojas, bloques o patrones se esperan
- cómo se mapean campos origen a canónicos
- qué normalizaciones se aplican
- qué heurísticas o fallbacks se permiten
- qué errores comunes rompen el parsing
- qué notas específicas aplican por variante

### `change_log.md`
Historial auditable del documento.

Debe responder:
- qué cambió
- cuándo cambió
- por qué cambió
- de qué sesión o propuesta salió
- quién lo aprobó
- qué impactó en `spec`, `schema` o `parser_config`

## Variables compartidas
Estas variables deben usarse en los cuatro archivos cuando apliquen.

### Variables de identidad
- `document_id`: id canónico del documento. Formato sugerido: `DOC-<slug>`
- `document_name`: nombre canónico en español
- `document_slug`: slug corto y estable
- `document_type`: una de las categorías de `Clasificación de documentos`

### Variables de contexto
- `aliases`: nombres alternos o aliases
- `source_system`: sistema, portal o área de origen
- `scope_level`: nivel principal del documento. Ejemplos: `registro patronal`, `empresa/RFC`, `trabajador`, `periodo`
- `periodicity`: `mensual`, `bimestral`, `anual`, `eventual`, `a demanda`
- `requiredness`: `obligatorio`, `opcional`, `condicional`
- `blocking_impact`: qué se bloquea si no existe

### Variables de uso operativo
- `related_tests`: lista de pruebas relacionadas
- `related_deliverables`: entregables finales o superficies relacionadas
- `owner_surface`: nombre de la superficie canónica principal que alimenta
- `join_keys`: llaves principales de amarre o trazabilidad

### Variables de control
- `status`: `draft`, `active`, `deprecated`, `archived`
- `version`: versión actual del paquete documental
- `last_updated`: fecha de última actualización
- `source_refs`: sesiones, propuestas o ejemplos que sustentan el contenido

## Reglas de naming
- El folder usa el nombre humano del documento.
- Los archivos internos usan nombres fijos:
  - `spec.md`
  - `schema.md`
  - `parser_config.md`
  - `change_log.md`
- No usar variantes como `spec_v2.md`, `schema nuevo.md` o `parser final.md`.
- La evolución vive dentro de `change_log.md`, no en nombres de archivo.

## Frontmatter mínimo sugerido
Usarlo cuando ayude a construir el grafo o al futuro harness.

```yaml
---
document_id: DOC-ejemplo
document_name: Nombre del documento
document_slug: nombre-del-documento
document_type: fuente raw
status: draft
version: 1
last_updated: YYYY-MM-DD
aliases: []
related_tests: []
related_deliverables: []
source_refs: []
---
```

## Checklist de creación
Al crear un documento nuevo:
1. Crear la carpeta del documento.
2. Crear los cuatro archivos estándar.
3. Crear `Documentos ejemplo/`.
4. Agregar el documento a `Índice de Documentos.md`.
5. Actualizar `Tabla de documentos en pruebas.md` si ya se conoce su uso.
6. Linkear desde pruebas o entregables relevantes cuando aplique.

## Checklist de cambio
Cuando una sesión descubra algo nuevo sobre un documento:
1. Revisar si el cambio afecta `spec`, `schema` o `parser_config`.
2. No borrar historia anterior sin justificación.
3. Registrar el cambio en `change_log.md`.
4. Si cambia el uso en pruebas, actualizar la tabla documento-prueba.
5. Si cambia el shape final, revisar impactos aguas abajo.
