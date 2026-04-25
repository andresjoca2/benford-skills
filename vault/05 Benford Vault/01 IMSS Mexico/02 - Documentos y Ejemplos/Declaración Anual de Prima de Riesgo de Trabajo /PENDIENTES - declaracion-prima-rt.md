# Pendientes de hilar — DOC-declaracion-prima-rt

Estos son los placeholders y referencias que quedaron sin resolver en los archivos de este documento. Requieren contexto de la bóveda completa para hilarse correctamente.

## En 01 - Spec.md

- **`related_docs` en frontmatter**: se propusieron los slugs `DOC-alta-seguro-rt`, `DOC-tarjeta-identificacion-patronal`, `DOC-emision-ema`, `DOC-cedula-determinacion-mensual`. Verificar que los tres primeros coincidan con los slugs canónicos cuando estos documentos se fichen (de los cuatro, solo `DOC-emision-ema` está confirmado porque ya existe en la bóveda).
- **`blocks_pruebas` en frontmatter**: se usó `PRUEBA-IMSS-5.1` como identificador. Confirmar el ID exacto de la prueba final IMSS que le corresponde en el registro de pruebas de la bóveda. Probablemente existe también un `PRUEBA-METH-5.1-ruben` y `PRUEBA-METH-5.1-josefina` que aún no están fichados.
- **Sección 2 → Fuente normativa**: los SOPs no citan artículos específicos. Se mencionaron la Ley del Seguro Social y el RACERF de forma general. Requiere hilarse con la fuente normativa real que regula la determinación anual de la prima RT (probablemente LSS art. 72 y 74, y RACERF en el capítulo de determinación de prima, pero verificar).
- **Sección 4 → Pruebas de METODOLOGÍA**: se referenciaron `PRUEBA-METH-5.1-ruben` y `PRUEBA-METH-5.1-josefina`. Confirmar slugs canónicos cuando se registren estas metodologías formalmente.
- **VR-DPRT-005 (clase consistente con fracción)**: depende de un catálogo RACERF de fracción→clase que no está cargado. Hilar cuando ese catálogo exista como recurso de la bóveda.
- **VR-DPRT-004 (rango legal de primas)**: el tope superior de 15.00000% y el piso técnico de 0.00500 se tomaron como referencia general. Verificar que siguen siendo los valores vigentes conforme a la LSS actualizada.

## En 02 - Schema.md

- **Foreign keys**: se proponen FKs hacia `DOC-emision-ema` y `DOC-cedula-determinacion-mensual`. Verificar slugs cuando esos documentos estén fichados. `DOC-emision-ema` ya existe.
- **Enumeración de `clase`**: catálogo RACERF completo no incluido; solo se listaron los valores 1-5 sin el detalle de tipos de actividad económica que corresponde a cada clase. Hilar si la bóveda va a consumir ese catálogo como referencia.

## En 03 - Parser config.md

- **Librería canónica del stack**: se recomienda `pdfplumber` pero la bóveda aún no tiene decidida una librería oficial de parseo de PDFs transversal a todos los DOC. Cuando se defina, alinear este parser con la decisión.
- **Verificación con más ejemplos**: el parser se diseñó contra un único PDF ejemplo (Acuse RT 2023). No hay confirmación de que el layout sea idéntico en años anteriores al 2023 ni en ejercicios de subdelegaciones distintas. Conseguir 2-3 ejemplos más (años distintos, delegaciones distintas) para validar que las anclas funcionan igual.
