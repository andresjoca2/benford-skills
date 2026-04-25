---
# ── Identidad ────────────────────────────────────────────────
id: PRUEBA-IMSS-<slug>/delivery
type: prueba-delivery
audit: imss
parent_prueba: PRUEBA-IMSS-<slug>          # ID del spec.md de esta prueba
pestaña_excel: "<nombre literal de la pestaña en Plantilla_Informacion_Patronal_v10.1.xlsm>"

# ── Forma del entregable ─────────────────────────────────────
grain: "<una frase: 'un row por RP consolidado anual'>"
columnas_count: <N>
formato_fisico: txt                        # es el txt que se pega en el Excel oficial
encoding: <ANSI-1252|UTF-8|latin-1>
delimitador: <tab|pipe|fixed-width>
celda_inicial_excel: "A7"                  # dónde se pega el primer row

# ── Estado ───────────────────────────────────────────────────
status: canonical                          # canonical | draft | deprecated
version: 1
last_decision: null

# ── Fuentes canónicas ─────────────────────────────────────────
# Solo DOC-*. Toda variable del entregable tiene que poder trazarse a un DOC-*
# canónico. Si una variable no existe en ningún schema de DOC, la skill PAUSA
# e invoca Documents Skill para que se proponga agregar la columna al doc.
data_sources:
  - DOC-<slug>
  - DOC-<otro-slug>

# ── Reconciliations que la validan ───────────────────────────
# Amarres por oficina que cuadran el entregable desde ángulos distintos.
# Se puebla cuando se escribe un reconciliation_<oficina>.md que toca esta prueba.
validated_by:
  - PRUEBA-IMSS-<slug>/reconciliation/<oficina>
---

# <Nombre de la prueba IMSS> — Delivery (entregable)

<!-- ESTE ARCHIVO ES UNIFICADO. No tiene variaciones por oficina.
     El entregable IMSS es el mismo para todas las firmas — lo que varía es cómo se
     valida (eso vive en reconciliation_<oficina>.md), no de dónde sale la data.

     Todo lo de extracción, parseo y estructuración YA OCURRIÓ en la entidad Documentos.
     Este archivo asume que los DOC-* ya tienen schema.md, spec.md, parser_config.md
     completos. Aquí solo declaramos cómo llenar la pestaña oficial usando las tablas
     condensadas de esos documentos. -->

---

## 1. Objetivo del entregable

<Una línea diciendo qué pestaña del dictamen IMSS se llena y qué valida a alto nivel.
Ej: "Reporta los importes pagados al IMSS por registro patronal en el ejercicio auditado,
desglosados por componente obrero/patronal.">

## 2. Contrato de salida

### Grain

<Frase precisa del grain. Ej: "una fila por RP consolidada para el ejercicio completo.
Si la empresa tiene 3 RPs, la pestaña lleva 3 filas + 1 de totales.">

### Columnas (orden oficial del IMSS)

<!-- Tabla principal del archivo. Una fila por cada columna del Excel IMSS.
     Columnas de la tabla:
     - Col Excel: letra de la pestaña oficial (A, B, C...)
     - Variable IMSS: nombre literal del encabezado
     - Tipo: text/int/decimal(12,2)
     - Fórmula: operación sobre las fuentes canónicas
     - Fuente canónica: wiki-link a DOC-*/02 - Schema#columna
     - Notas: cualquier caso especial

     REGLA ESTRICTA: cada celda de "Fuente canónica" debe ser un wiki-link válido
     a una columna específica de un schema de DOC-*. No se permite texto suelto.
     Si tu variable no existe en ningún DOC-*, detente y propón agregar la columna
     al schema del DOC correspondiente antes de seguir. -->

| Col | Variable IMSS | Tipo | Fórmula | Fuente canónica | Notas |
|-----|---------------|------|---------|-----------------|-------|
| A | <nombre> | <tipo> | `<operación>` | `[[DOC-<slug>/02 - Schema#<tabla>.<columna>]]` | <notas> |
| B | <nombre> | <tipo> | `<operación>` | `[[...]]` | |
| ... | | | | | |

### Totales

<!-- Si la pestaña tiene fila de totales, declararla aquí con las fórmulas de cada columna. -->

## 3. Reglas de agregación y transformación

<!-- Lógica que aplica transversalmente a varias columnas. Ejemplos típicos:
     - "Los componentes mensuales (enero-diciembre) se suman al año para columnas G..."
     - "Los componentes bimestrales se suman bimestre tras bimestre..."
     - "Cotizantes reportados es MAX por mes, no SUM." -->

## 4. Casos especiales

<!-- Escenarios que cambian qué valor se pone en el entregable. -->

### Caso 1 — <nombre del caso>

- **Cuándo ocurre:** <condición>
- **Regla:** <qué hacer>
- **Impacto en columnas:** <cuáles>
- **Origen:** <normativo | aporte [[CONTRIB-...]]>

### Caso 2 — <nombre>
...

## 5. Formato del TXT final

### Archivo

- **Extensión:** .txt
- **Encoding:** <ANSI-1252>
- **Delimitador:** <tab>
- **Fin de línea:** <CRLF | LF>
- **Header:** <sí | no>

### Template del TXT

```
<placeholder del TXT con {{variables}}>
```

### Instrucciones de pegado

1. Abrir `Plantilla_Informacion_Patronal_v<N>.xlsm`
2. Ir a la pestaña `<nombre literal>`
3. Pegar el contenido del TXT en `<celda inicial>`
4. <cualquier paso específico: activar macro, regenerar totales, etc.>

## 6. JSON Schema del output

```yaml
$schema: "http://json-schema.org/draft-07/schema#"
type: object
properties:
  rows:
    type: array
    items:
      type: object
      properties:
        <col_a>: {type: integer}
        <col_b>: {type: string, pattern: "^[A-Z0-9]{12}$"}
        # ... una entrada por columna
      required: [<col_a>, <col_b>, ...]
  totales:
    type: object
    properties:
      # mismas columnas pero agregadas
required: [rows]
```

## 7. Matriz de validación (qué reconciliation cubre qué columna)

<!-- Útil para saber, si una oficina cubre solo N reconciliations, qué columnas del
     entregable quedan sin validar. Se puebla automáticamente desde los
     reconciliation_<oficina>.md que declaran qué columnas tocan. -->

| Columna | rec. RSM Mérida | rec. RSM Mazatlán | rec. Traust | rec. <otra> |
|---------|-----------------|-------------------|-------------|-------------|
| A | ○ | ○ | ○ | |
| B | ✓ | ✓ | ✓ | |
| ... | | | | |

Leyenda: ✓ valida · ◐ parcial · ○ no aplica · ✗ gap conocido

## 8. Preguntas abiertas

- <pregunta>: <contexto>

## 9. Notas de mantenimiento

- Solo se modifica vía PROP + DEC. Los cambios se reflejan en [[changelog]].
- Si una columna cambia de fuente (ej: IMSS actualiza layout), la PROP tiene que
  tocar tanto este archivo como los reconciliations que dependen de esa columna.
