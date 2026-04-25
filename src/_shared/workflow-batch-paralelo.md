# Workflow de batch paralelo

Anexo compartido por **`imss-document-spec-builder`** y **`imss-test-builder`**.

Cuando el usuario trae **varios docs/pruebas** en una misma sesión, usa este workflow en lugar de procesarlos uno por uno. Reduce iteraciones y agrupa decisiones.

---

## Cuándo aplicar

- El usuario menciona ≥ 2 documentos a fichar o ≥ 2 reconciliations a generar.
- El usuario explícitamente pide procesar "varios" o "en paralelo".

## Cuándo NO aplicar

- Un solo doc/reconciliation por sesión.
- El usuario pide ir uno por uno explícitamente.

## Las tres fases

### Fase A — Intake (paralelo)

El usuario pasa N docs/pruebas. Tú devuelves un **mini-reporte por elemento**, compacto (≤ 12 líneas cada uno):

**Para docs:**
```
DOC N — [nombre]
- Slug propuesto: ...
- Naturaleza (raw / auditor): ...
- Hojas/secciones detectadas: ...
- Decisiones que voy a tomar (con justificación corta): 1) ... 2) ...
- Anotaciones del auditor que voy a ignorar: ...
- Preguntas para ti (solo lo crítico, no decidible por mí): ?
```

**Para reconciliations:**
```
REC N — [nombre]
- Slug propuesto: ...
- Filosofía del amarre: ...
- Inputs canónicos (DOC.tabla): ...
- Outputs / artefacto: ...
- Naturaleza (global / upstream / transversal): ...
- Dependencias con otras pruebas: ...
- Preguntas para ti: ?
```

**Importante:** en Fase A **no escribas archivos todavía**. Solo análisis.

### Fase B — Alineación (libre)

El usuario revisa y responde mencionando el doc/rec por número o nombre. Acepta input libre como:
- "DOC 2: cambia X"
- "DOC 3: aprobado"
- "DOCs 1, 4, 5: van"
- "REC 1: agrega Y"

Cuando esté todo alineado, el usuario dice **"go"** o "corre la skill".

### Fase C — Ejecución (paralela)

Genera todos los archivos en paralelo. Reporte final compacto con resumen por elemento.

## Tamaño de batch recomendado

- **Docs:** batches de 3-4 por iteración. Más de 4 hace la alineación confusa de scrollear.
- **Reconciliations:** mismo límite.

## Detección de relaciones cruzadas

Si en Fase A notas que **dos docs/pruebas del batch tienen relaciones cruzadas** (ej: schema de uno depende de otro, output de uno es input de otro), **flageálo en el reporte** para que el usuario decida si los procesa juntos o en orden.

## Orden cuando hay dependencias

Cuando hay dependencias dentro del batch:
1. Procesa primero el que **no depende de otros** (raíz del DAG).
2. Procesa después los que dependen de ese.
3. Si el batch tiene un ciclo, alerta al usuario — algo está mal modelado.
