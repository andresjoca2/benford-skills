# Pendientes de hilar — DOC-comprobante-pago-sua

Estos son los placeholders y referencias que quedaron sin resolver en los archivos de este documento. Requieren contexto de la bóveda completa para hilarse correctamente.

## En 01 - Spec.md

- `related_docs` en frontmatter → referencia a `DOC-disco-sua`, `DOC-cedula-determinacion-mensual`, `DOC-cedula-determinacion-bimestral`. Verificar que los slugs coincidan con los canónicos de la bóveda.
- Sección 1 (Overview) → mismas referencias en wiki-links (`[[DOC-disco-sua]]`, etc.).
- Sección 2 (Fuente normativa) → marcado como `<!-- PENDIENTE -->`. No estaba citado en los SOPs; falta identificar Ley/Artículo correspondiente.
- Sección 2 (Bloqueos si falta) y Sección 4 (Uso en pruebas) → referencias a `PRUEBA-IMSS-5.1`. Verificar ID canónico.
- Sección 4 (Pruebas METH) → se usaron slugs tentativos: `PRUEBA-METH-amarre-liquidaciones-por-folio` y `PRUEBA-METH-conciliacion-contable-operativa`. Reemplazar con IDs reales si ya existen en la bóveda.

## En 02 - Schema.md

- Foreign keys → referencia a `DOC-disco-sua` en `registro_patronal` y `folio_sua`. Verificar slug canónico.

## En 03 - Parser config.md

- Sin pendientes de hilar.
