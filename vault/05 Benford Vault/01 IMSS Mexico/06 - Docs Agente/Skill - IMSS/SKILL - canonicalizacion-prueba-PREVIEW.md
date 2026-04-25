---
name: imss-canonicalizacion-prueba
description: Convertir el SOP de un auditor en los documentos canónicos del vault Benford para una prueba IMSS (delivery.md unificado + reconciliation_<oficina>.md, agnóstico de Excel). Usar cuando el usuario ya tiene un SOP escrito y quiere materializarlo en el formato canónico de pruebas. No usar para extraer conocimiento de auditores (esa es otra skill) ni para diseñar entregables finales del dictamen.
---

# imss-canonicalizacion-prueba (PREVIEW v0)

> Esto es un preview para revisión del usuario. La skill final se destila después de 3 iteraciones con firmas distintas. Este documento muestra la forma propuesta; los ejemplos y los asserts concretos se afinan con feedback.

---

## Input y output

**Input esperado:**

- Un SOP de auditor en formato markdown (producido por la skill `imss-pruebas-extraccion-conocimiento` o escrito a mano).
- Identidad de oficina y firma (ej: `rsm-merida` / `rsm`, `traust` / `traust`).
- Nombre canónico (slug) de la prueba IMSS correspondiente.
- Opcionalmente: ejemplos de workbooks o artefactos que la oficina produce, para entender la estructura operativa real.

**Output esperado:**

Dentro de `01 IMSS Mexico/01 - Pruebas IMSS Oficial/<slug-prueba>/`:

1. `delivery.md` — si no existe ya, se crea. Si ya existe, NO se sobrescribe; solo se actualiza la matriz de validación para incluir este reconciliation.
2. `reconciliation_<oficina>.md` — siempre se crea, describe la metodología específica de esa oficina sobre tablas de datos canónicas (no sobre Excel).
3. Opcional: un prompt dirigido al agente de schemas si se detectan gaps en `02 - Documentos y Ejemplos/<doc>/02 - Schema.md`.

---

## Flujo operativo (5 fases)

### Fase 1 — Diagnóstico del SOP

Leer el SOP y extraer:

- Nombre canónico de la prueba (slug).
- Oficina + firma que aporta la metodología.
- Filosofía del amarre en una frase (por folio, contable-operativo, por comprobante bancario, etc.).
- Lista de documentos que la prueba usa, con su rol (input principal, soporte, opcional, artefacto propio de la oficina).
- Lista de variables/conceptos que el SOP toca (días cotizados, cuotas patronales, cuentas contables, folios, etc.).

### Fase 2 — Verificación de schemas canónicos

Para cada documento que el SOP menciona:

1. Buscar en `01 IMSS Mexico/02 - Documentos y Ejemplos/` si existe un DOC-*.
2. Si existe: leer `02 - Schema.md` y verificar que cubra todos los campos que el SOP consume.
3. Si **falta el documento entero**: PAUSAR. Avisar al usuario que antes hay que crear el schema canónico (usar skill de autoría de documentos o prompt equivalente).
4. Si **existe pero faltan campos**: producir un prompt concreto de actualización (ver plantilla en §R8), pausar hasta que el usuario confirme que los schemas se actualizaron.

No avanzar a escribir `reconciliation` hasta que todos los schemas estén al día.

### Fase 3 — Preguntas dirigidas

Hacer las preguntas en un solo bloque (evitar ping-pong). Hay 5 categorías típicas:

- **Ambigüedades del contrato del delivery:** si una columna tiene dos lecturas posibles, preguntar cuál.
- **Grain de agregación:** ¿fila por RP consolidada al ejercicio? ¿Detalle mensual? ¿Por folio?
- **Mapeos contables:** si hay amarre contable, ¿cuentas fijas o configurables por cliente? Mapear por **nombre semántico** es la regla default.
- **Tolerancias y cierre:** criterio exacto para `cuadrado` vs `con diferencia`. Qué hacer con diferencias explicables por accesorios de mora, pagos complementarios, etc.
- **Extras de la oficina:** cosas que esta oficina hace aunque no sean requeridas por IMSS (`has_extras: true/false`).

### Fase 4 — Redacción

**Si el `delivery.md` no existe:**

- Crearlo con el mapeo completo columna→DOC-*/campo (tabla en sección "Columnas").
- Formato físico del TXT fuera de scope (el harness resuelve).
- Matriz de validación con la oficina actual como primera columna.
- Status `draft` + version 1.

**Si el `delivery.md` ya existe:**

- NO sobrescribir.
- Agregar la oficina actual al campo `validated_by` del frontmatter.
- Agregar columna a la matriz de validación con `✓` / `◐` / `○` / `✗` por cada columna del entregable.

**Siempre crear `reconciliation_<oficina>.md`:**

Estructura fija (12 secciones):

1. Overview — filosofía en una frase (ej: "amarre contable-operativo por renglón").
2. Objetivo específico del amarre.
3. **Contrato de datos del amarre** — 2 o 3 tablas del sistema con schema completo (no referenciar Excel).
4. Inputs canónicos (tabla con wiki-links a DOC-*/schema).
5. Procedimiento paso a paso (típicamente 8 pasos). Usar nombres de campos de schemas canónicos, NUNCA celdas de Excel.
6. Reglas de cierre y tolerancias.
7. Papeles de trabajo (= las tablas de la sección 3).
8. Casos especiales y bifurcaciones.
9. Extras de la oficina (o sección corta con `has_extras: false`).
10. Errores comunes.
11. Preguntas abiertas.
12. Notas de mantenimiento.

Status `draft` + version 1. Sube a `canonical` solo con confirmación explícita del usuario.

### Fase 5 — Cierre y handoff

- Reporte breve al usuario: qué archivos se crearon, qué quedó pendiente, qué preguntas abiertas bloquean la canonicalización.
- Si aplica: prompt de actualización de schemas listo para que el usuario lo ejecute.
- Si es la 2ª o 3ª oficina para la misma prueba, resumir las diferencias metodológicas relevantes entre oficinas (no en el reconciliation, que es single-office; como addendum al reporte).

---

## Reglas estrictas

**R1 — Nunca referencias a celdas de Excel.** Las celdas tipo `F13`, `Amarre!H17`, `COPS!V30+W30`, `D13:D16` NUNCA aparecen en el reconciliation. Todo se describe sobre tablas de datos (`test_<prueba>_<tabla>`) y campos canónicos.

**R2 — Wiki-links para toda fuente canónica.** Formato: `[[DOC-<slug>/02 - Schema#<tabla>.<columna>]]`. Si el campo no existe en ningún schema, PAUSAR y proponer actualización al DOC.

**R3 — Mapear cuentas contables por nombre, no por código.** Los números (`601-02-000`) son del cliente de ejemplo; en producción varían. Usar descriptores semánticos ("cuenta cuya descripción contiene 'Cuotas IMSS'").

**R4 — `delivery.md` es unificado.** Un solo delivery por prueba, independientemente de cuántas oficinas la ejecuten. Solo la matriz de validación cambia cuando se suman oficinas.

**R5 — Las tablas de salida del reconciliation son data artifacts, no Excel.** Describir con schema (grain, columnas con tipo + nullable + descripción), no con layout de celdas. Bajada a Excel es presentación downstream.

**R6 — Status `draft` por defecto.** Solo pasa a `canonical` con confirmación explícita del usuario.

**R7 — Preservar evidencia que no cabe en el canónico.** Anécdotas, reglas ad-hoc, extras de la oficina que no aplican al IMSS pero valen la pena guardar → van como `CONTRIB-<fecha>-<auditor>-<firma>.md`, no se pierden.

**R8 — Plantilla de prompt para update de schema de un DOC-*.** Cuando se detecta gap:

```
Actualizar `DOC-<slug>` (01 - Spec.md + 02 - Schema.md) para soportar la prueba <nombre-prueba> de <firma>:

**En `<tabla>`:**
- `<campo1>` — <tipo>, <nullable>, default <default>, descripción: "<X>"
- ...

**Casos límite nuevos:** `EC-<SLUG>-<N>` "<nombre>".

**Versionado:** schema `v<N> → v<N+1>`, `breaking_change_of: <N>`.

**Trazabilidad inversa:** los nuevos campos salen de <origen en raw>.

No tocar reglas VR-* existentes.
```

---

## Anti-patterns

- Escribir reconciliation sin verificar schemas primero.
- Inventar nombres de campos que no existen en los DOC-*.
- Copiar lógica del Excel del SOP tal cual (referencias a celdas); hay que traducirla a operaciones sobre tablas.
- Sobrescribir `delivery.md` cuando ya existe.
- Pasar a `status: canonical` sin que el usuario lo pida.
- Resolver preguntas abiertas inventando; mejor dejarlas documentadas y pasar a draft.

---

## Ejemplos de invocación

**E1 — Segunda oficina para prueba existente:**

> Usuario: "Aquí va el SOP de Melanie (Traust) para la prueba DGE, que es la metodología de Traust para `cuotas-pagadas-al-instituto`."
> 
> Skill: [lee SOP] → [confirma que `delivery.md` existe] → [detecta que DGE usa DOC-disco-sua + DOC-comprobante-pago-sua] → [gap en disco_sua_trabajador: faltan montos por concepto] → [pausa con prompt de actualización] → [usuario confirma update] → [preguntas sobre ambigüedades] → [escribe reconciliation_traust.md + actualiza matriz del delivery].

**E2 — Primera oficina para prueba nueva:**

> Usuario: "Aquí va el SOP de <auditor> para la prueba <X>, que todavía no tiene carpeta en el vault."
> 
> Skill: [crea carpeta, lee SOP, confirma schemas, preguntas dirigidas, escribe delivery.md + reconciliation_<oficina>.md de una sola pasada].

**E3 — SOP que en realidad es de un documento, no de una prueba:**

> Usuario: "Aquí va el SOP de Nelly (Traust) sobre ACUMSUA."
> 
> Skill: [detecta que ACUMSUA es un DOCUMENTO derivado, no una prueba] → [responde: "ACUMSUA mapea a DOC-disco-sua. No necesita delivery/reconciliation. ¿Uso este SOP para actualizar el schema de DOC-disco-sua, o documentamos ACUMSUA como DOC propio?"].

---

## Notas de uso

- La skill asume que la skill de **extracción de conocimiento** ya corrió y el SOP ya existe.
- La skill **no toca** los archivos del vault fuera de la carpeta de la prueba específica (aislamiento).
- Si hay conflictos (dos oficinas proponen mapeos incompatibles para la misma columna del delivery), la skill **no resuelve**; los documenta como preguntas abiertas y pide decisión al usuario.
- El naming convention `reconciliation_<oficina>.md` (flat) o `reconciliation/<oficina>.md` (subfolder) se confirma con el usuario en la primera corrida y se aplica consistente después.

---

## Pendientes para la versión 1 (no-preview)

- [ ] Destilar después de 3 ejecuciones reales (Josefina / Melanie / 3ª pendiente).
- [ ] Librería de edge cases comunes que la skill detecta automáticamente (pago extemporáneo, cédula modificatoria, etc.).
- [ ] Validación automática de wiki-links contra los schemas existentes.
- [ ] Script de lint para detectar referencias a celdas de Excel que se hayan colado al reconciliation.
- [ ] Confirmar convención de carpeta (flat vs subfolder) para los archivos de reconciliation.
