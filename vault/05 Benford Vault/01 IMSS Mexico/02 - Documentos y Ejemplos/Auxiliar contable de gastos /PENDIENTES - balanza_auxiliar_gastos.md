# Pendientes de hilar — DOC-balanza-auxiliar-gastos

Estos son los placeholders y referencias que quedaron sin resolver en los archivos de este documento. Requieren contexto de la bóveda completa para hilarse correctamente.

## En 01 - Spec.md

- **Frontmatter `blocks_pruebas`** → contiene `PRUEBA-METH-5-1`. Verificar que el slug canónico de la prueba 5.1 en la bóveda sea exactamente ese.
- **Frontmatter `related_docs`** → referencia a `DOC-balanza-comprobacion`. Verificar el slug canónico del documento de balanza.
- **Sección "Relación con otros documentos"** → referencia a `[[DOC-cedula-determinacion-mensual]]` y `[[DOC-cedula-determinacion-bimestral]]`. Verificar slugs canónicos.
- **Sección "Pruebas de METODOLOGÍA que lo usan"** → segunda fila referencia `[[PRUEBA-METH-sueldos-salarios-balanza]]`. Este slug es un guess basado en el SOP de Josefina (prueba de conciliación de nóminas vs contabilidad y revisión de balanza). Verificar si existe como entidad separada en la bóveda o si se fusiona con `PRUEBA-METH-5-1`.
- **Sección "Pruebas IMSS finales impactadas"** → la segunda bullet menciona "pruebas de revisión de SBC y detección de percepciones no integradas" sin ID concreto. Hilar con el catálogo de pruebas IMSS.
- **Sección "Fuente normativa"** → referencias genéricas sin artículo específico (los SOPs no citan). Completar cuando se tenga catálogo normativo canónico.

## En 02 - Schema.md

- **Sección "Claves y trazabilidad" → Foreign keys** → `auxiliar_movimientos.numero_cuenta` y `auxiliar_saldos_cuenta.numero_cuenta` apuntan a `[[DOC-balanza-comprobacion]].numero_cuenta`. Verificar el slug canónico del documento de balanza y el nombre exacto de la columna equivalente en su schema.

## En 03 - Parser config.md

Sin pendientes de hilar externos. Las referencias son a casos límite (EC-BAG-*) y reglas (VR-BAG-*) definidas en el Spec del mismo documento.

## Decisiones abiertas a confirmar

- **Scope genérico del documento:** se eligió un único documento canónico neutro respecto al sistema contable. La variabilidad de formato se absorbe en el parser con detección de topología y resolución jerárquica de cuenta. La alternativa sería múltiples DOCs (uno por familia de sistema), pero se prefiere mantener un solo DOC mientras el schema siga siendo estable entre formatos.
- **`fuente_cuenta` como campo del schema:** se incluyó como metadato obligatorio de trazabilidad. Alternativamente podría vivir fuera del schema canónico (como log o auditoría). Confirmar si se mantiene en el schema.
- **`auxiliar_saldos_cuenta` opcional:** la tabla puede quedar completamente vacía para exports que no reportan totales (caso común). Se mantiene como tabla del schema porque cuando existe es importante para VR-BAG-004/005. Confirmar si este enfoque se mantiene o si se prefiere colapsarla en metadata cuando el export no la provee.
- **Catálogos de "cuentas a revisar" como anotación del auditor:** los ejemplos observados traen hojas adicionales con listas de cuentas sensibles (conceptos tipo apoyos al personal, honorarios, uniformes, capacitación, etc.). Se documentaron como anotación del auditor (EC-BAG-001) y se ignoran en el parseo canónico. Si el catálogo de cuentas sensibles debe vivir en la bóveda como entidad propia (ej. `CATALOG-cuentas-sbc-sospechosas`), ficharlo por separado.
- **Preservación de `empresa`, `tipo_poliza` y `referencia`:** se incluyeron como opcionales en el schema aunque los SOPs no los consumen directamente. La razón es trazabilidad y soporte de variantes futuras. Si se prefiere aplicar estricto "solo info que alimenta pruebas", estos campos podrían omitirse.
