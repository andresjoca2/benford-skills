# Reglas de salida para IMSS Test Builder

## Templates vivos a reutilizar

- `${BENFORD_ROOT}/05 Benford Vault/05 Templates/Pruebas IMSS/delivery.md`
- `${BENFORD_ROOT}/05 Benford Vault/05 Templates/Pruebas IMSS/reconciliation.md`

## Carpeta de destino por default

- `${BENFORD_ROOT}/05 Benford Vault/01 IMSS Mexico/01 - Pruebas IMSS/Pruebas IMSS Oficial/<Nombre literal de la pestaña>/`

## Convención de nombres

- `delivery_<firma>_<oficina>.md`
- `reconciliation_<firma>-<oficina>.md`

Ejemplo:

- `delivery_rsm_merida.md`
- `reconciliation_rsm-merida.md`

## Reglas de contenido

- `delivery` documenta cómo se llena la pestaña oficial del dictamen IMSS
- `reconciliation` documenta cómo una oficina concreta hace el amarre
- si una parte de la prueba no pega al dictamen pero sí al PDF final del cliente, debe quedar explícita en `reconciliation` como soporte, hallazgo u output intermedio
- cualquier variable del `delivery` debe poder trazarse a un `DOC-*`
- está prohibido usar referencias de celdas Excel en el output
- usa wiki-links a schema con la forma `[[DOC-<slug>/02 - Schema#<tabla>.<columna>]]`

## Estado por default

- `status: draft`

## Regla de publicación

- no escribir en Obsidian sin confirmación explícita del usuario
- antes de escribir, mostrar carpeta y nombres de archivo exactos
