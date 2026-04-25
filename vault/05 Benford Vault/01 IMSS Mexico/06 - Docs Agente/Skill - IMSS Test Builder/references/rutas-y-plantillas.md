# Rutas y plantillas para IMSS Test Builder

## Workbook oficial del dictamen IMSS
- `05 Benford Vault/01 IMSS Mexico/01 - Pruebas IMSS/Plantilla_Informacion_Patronal_v10.1 2.xlsm`

## Biblioteca documental obligatoria
Raíz:
- `05 Benford Vault/01 IMSS Mexico/02 - Documentos y Ejemplos/`

Para cada documento requerido, la skill solo puede continuar si encuentra ambos archivos:
- `01 - Spec.md`
- `02 - Schema.md`

Notas prácticas:
- en algunos casos el vault hoy tiene variantes como `01 - Spec (1).md`
- si eso pasa, usar el archivo real disponible pero dejarlo señalado como desviación
- si falta `Spec` o `Schema`, la prueba se detiene

## Plantillas oficiales a reutilizar
- `05 Benford Vault/05 Templates/Pruebas IMSS/delivery.md`
- `05 Benford Vault/05 Templates/Pruebas IMSS/reconciliation.md`

Nota:
- la plantilla se llama `delivery.md`, no `deliverable.md`

## Carpeta destino en Obsidian
- `05 Benford Vault/01 IMSS Mexico/01 - Pruebas IMSS/Pruebas IMSS Oficial/<Nombre literal de la pestaña>/`

## Convención de nombres de archivos
- `delivery_<firma>_<oficina>.md`
- `reconciliation_<firma>-<oficina>.md`

Ejemplo:
- `delivery_rsm_merida.md`
- `reconciliation_rsm-merida.md`

## Reglas de salida
- `status: draft` por default
- no imprimir nada en Obsidian sin confirmación explícita del usuario
- antes de imprimir, mostrar carpeta y nombres de archivo exactos
- nunca describir la metodología con referencias de celdas Excel; usar wiki-links a schema como `[[DOC-<slug>/02 - Schema#<tabla>.<columna>]]`
