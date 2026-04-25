# Pendientes de hilar — DOC-emision-eba

## En 01 - Spec.md

- `related_docs` en frontmatter → referencias a `DOC-emision-ema`, `DOC-disco-sua`, `DOC-cedula-determinacion-bimestral`. Verificar slugs canónicos.
- Sección 1 (Overview) → mismas referencias en wiki-links.
- Sección 2 (Fuente normativa) → `<!-- PENDIENTE -->`. No citado en SOPs.
- Sección 2 (Bloqueos si falta) y Sección 4 (Uso en pruebas) → `PRUEBA-IMSS-5.1`. Verificar ID canónico.
- Sección 3 (VR-EBA-007) → pendiente sobre qué tipos de movimiento se excluyen del conteo de cotizantes.
- Sección 4 (Pruebas METH) → slug tentativo `PRUEBA-METH-amarre-liquidaciones-por-folio`. Reemplazar con ID real.

## En 02 - Schema.md

- Foreign keys → referencia a `DOC-disco-sua`. Verificar slug.
- Tabla `movimientos_eba`, sección de enumeraciones → catálogos completos de códigos de `origen_movimiento`, `tipo_movimiento` y `tipo_descuento` no están en SOPs.

## En 03 - Parser config.md

- Sin pendientes de hilar.
