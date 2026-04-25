# Pendientes de hilar — DOC-emision-ema

## En 01 - Spec.md

- `related_docs` en frontmatter → referencias a `DOC-emision-eba`, `DOC-disco-sua`, `DOC-cedula-determinacion-mensual`, `DOC-declaracion-prima-riesgo-trabajo`. Verificar slugs canónicos.
- Sección 1 (Overview) → mismas referencias en wiki-links.
- Sección 2 (Fuente normativa) → `<!-- PENDIENTE -->`. No citado en SOPs.
- Sección 2 (Bloqueos si falta) y Sección 4 (Uso en pruebas) → `PRUEBA-IMSS-5.1`. Verificar ID canónico.
- Sección 3 (VR-EMA-005) → pendiente sobre qué tipos de movimiento se excluyen del conteo de cotizantes.
- Sección 4 (Pruebas METH) → slugs tentativos `PRUEBA-METH-analisis-prima-riesgo`, `PRUEBA-METH-amarre-liquidaciones-por-folio`. Reemplazar con IDs reales.

## En 02 - Schema.md

- Foreign keys → referencia a `DOC-disco-sua`. Verificar slug.
- Tabla `movimientos_ema`, sección de enumeraciones → catálogo completo de códigos de `origen_movimiento` y `tipo_movimiento` no está en SOPs.

## En 03 - Parser config.md

- Sin pendientes de hilar.
