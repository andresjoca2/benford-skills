# Reglas de salida para IMSS Test Builder

## Templates vivos a reutilizar

- `${BENFORD_ROOT}/05 Benford Vault/05 Templates/Pruebas IMSS/delivery.md`
- `${BENFORD_ROOT}/05 Benford Vault/05 Templates/Pruebas IMSS/reconciliation.md`

## Carpeta de destino por default

- `${BENFORD_ROOT}/05 Benford Vault/01 IMSS Mexico/01 - Pruebas IMSS/Pruebas IMSS Oficial/<Nombre literal de la pestaña o de la prueba>/`

Para pruebas globales (sin pestaña directa):
- `${BENFORD_ROOT}/05 Benford Vault/01 IMSS Mexico/01 - Pruebas IMSS/Pruebas IMSS Oficial/Pruebas globales/<Nombre de la prueba>/`

## Convención de nombres

### Patrón A — 1 reconciliation por oficina

- `delivery_<firma>_<oficina>.md`
- `reconciliation_<firma>-<oficina>.md`

Ejemplo:
- `delivery_rsm_merida.md`
- `reconciliation_rsm-merida.md`

### Patrón B — N reconciliations bajo un delivery (uno por procedimiento)

Cuando una pestaña requiere varios procedimientos:

- `delivery_<firma>_<oficina>.md`
- `reconciliation_<procedimiento>_<firma>-<oficina>.md`

Ejemplo:
- `delivery_rsm_mazatlan.md`
- `reconciliation_factor-integracion_rsm-mazatlan.md`
- `reconciliation_aguinaldo_rsm-mazatlan.md`
- `reconciliation_vacaciones_rsm-mazatlan.md`

## Reglas de contenido

- `delivery` documenta cómo se llena la pestaña oficial del dictamen IMSS, **o** (en pruebas globales) qué outputs canónicos produce y a qué pruebas downstream alimenta.
- `reconciliation` describe el **algoritmo data-first** sobre los schemas canónicos. Operaciones explícitas tipo SQL/CTE sobre tablas DOC-*. **NO replica la metodología Excel del auditor; la reemplaza.**
- Si una parte de la prueba no pega al dictamen pero sí al PDF final del cliente, queda explícita en `reconciliation` como soporte u output derivado.
- Cualquier variable del `delivery` debe poder trazarse a un `DOC-*` o a un output canónico de una prueba upstream.
- Está prohibido usar referencias de celdas Excel en el output.
- Usa wiki-links a schema con la forma `[[DOC-<slug>/02 - Schema#<tabla>.<columna>]]`.
- **Lenguaje neutro:** nunca uses números de prueba (5.10, 5.6.x). Usa el nombre completo de la prueba o descripción funcional.

## Estructura obligatoria del reconciliation (data-first)

1. Objetivo + unidad de control
2. Inputs canónicos (con preferencia por outputs upstream cuando existan)
3. Algoritmo paso a paso (CTE-like)
4. Tabla resultado canónica (mapeada al PT del auditor)
5. Reglas de validación (cierre)
6. Casos especiales
7. Outputs derivados (cross-link bidireccional)
8. Notas de mantenimiento

## Estado por default

- `status: draft`

## Regla de publicación

- No escribir en Obsidian sin confirmación explícita del usuario.
- Antes de escribir, mostrar carpeta y nombres de archivo exactos.
