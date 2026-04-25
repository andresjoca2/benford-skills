---
# ── Identidad ────────────────────────────────────────────────
id: PRUEBA-IMSS-<slug>/reconciliation/<oficina-slug>
type: prueba-reconciliation
audit: imss
parent_prueba: PRUEBA-IMSS-<slug>          # ID de la prueba IMSS padre
oficina: <oficina-slug>                    # ej: rsm-merida, rsm-mazatlan, traust
firma: <firma-slug>                        # ej: rsm, traust (solo etiqueta)
metodologia_nombre: "<nombre corto del enfoque: 'Amarre por folio', 'Amarre contable', 'DGE capturada'>"

# ── Autoría y origen ─────────────────────────────────────────
contribuciones:                             # CONTRIB-* que aportaron este SOP
  - CONTRIB-<fecha>-<persona>-<firma>
auditores_documentados:                     # nombres reales; solo como referencia, la autoridad es el CONTRIB
  - "<Nombre del auditor>"

# ── Estado ───────────────────────────────────────────────────
status: canonical                          # canonical | draft | deprecated
version: 1
last_decision: null

# ── Superficie del amarre ────────────────────────────────────
artefacto_final:                            # workbook / archivo que produce esta metodología
  nombre: "<nombre del archivo que usa el auditor>"
  formato: <xlsx|xlsm|otro>
  hoja_principal: "<nombre de la hoja donde vive el resultado>"
  unidad_control: "<folio|RP-mes|renglón contable|RP-periodo>"

# ── Fuentes canónicas ─────────────────────────────────────────
# Solo DOC-*. Mismo principio que delivery.md: no inventar variables.
data_sources:
  - DOC-<slug>
  - DOC-<otro>

# ── Columnas del delivery que esta reconciliation valida ─────
columnas_validadas:                         # subset de las 29 columnas del delivery
  - <letra_col>                             # ej: G, H, I, N...
columnas_no_cubiertas:                      # declaración explícita de gaps
  - <letra_col>

# ── Papeles de trabajo generados ─────────────────────────────
papeles_de_trabajo:
  - PT-<slug>-01
  - PT-<slug>-02

# ── Extras de la oficina ─────────────────────────────────────
# "extras" = cosas que la oficina hace porque quiere, no porque IMSS las pida.
# Se preservan como conocimiento pero el dev team sabe que son opcionales.
has_extras: <true|false>
---

# <Prueba IMSS> — Reconciliation (<oficina>)

<!-- ESTE ARCHIVO CUBRE LA METODOLOGÍA DE UNA OFICINA para cuadrar la prueba IMSS
     contra sus propias fuentes.

     No redefine dónde sale la data del delivery — eso está fijo en delivery.md,
     unificado para todas las oficinas.

     Aquí documenta:
       • el enfoque filosófico del amarre que usa esta oficina
       • qué valida específicamente y contra qué
       • el artefacto (workbook) que produce
       • los pasos del procedimiento
       • los papeles de trabajo que quedan como evidencia
       • extras que esta oficina hace aunque no se pida -->

---

## 1. Overview

<Párrafo humano: qué oficina es, qué filosofía de amarre usa, en qué se distingue
de otras oficinas para la misma prueba. Ejemplo:

"RSM Mérida ataca esta prueba reconstruyendo el pago por folio SUA y cuadrando cada
folio contra su comprobante bancario. La unidad de control es el folio, no el mes.
Esta filosofía viene de que RSM Mérida tiene auditores con enfoque contable que
prefieren trazar el detalle documento-por-documento antes de consolidar."> 

## 2. Objetivo específico del amarre

<Qué valida esta reconciliation que complementa al delivery. Ej: "validar que lo
determinado en SUA efectivamente fue pagado, folio por folio, sin saltos ni
diferencias contra el comprobante bancario".>

## 3. Artefacto final

- **Workbook:** `<nombre del archivo>`
- **Formato:** <xlsx | xlsm>
- **Hojas relevantes:** `<hoja_1>`, `<hoja_2>`, ...
- **Hoja autoritativa (donde vive el resultado):** `<nombre>`
- **Unidad de control:** <folio | RP-mes | renglón contable | RP-periodo>
- **Cierre visible:** <qué celda o bloque indica "prueba cuadrada">

## 4. Inputs al amarre

<!-- Lista explícita de columnas del condensado canónico que este amarre consume.
     Regla estricta: todas son wiki-links a DOC-*/02 - Schema#tabla.columna. -->

| Input | Fuente canónica | Uso |
|-------|-----------------|-----|
| <variable> | `[[DOC-<slug>/02 - Schema#<tabla>.<columna>]]` | <para qué paso se usa> |
| <variable> | `[[DOC-<otro>/02 - Schema#<tabla>.<columna>]]` | |
| ... | | |

## 5. Procedimiento paso a paso

<!-- Cada paso es pequeño, testeable, y tiene inputs y outputs explícitos.
     Si un paso requiere consultar una columna específica, usar wiki-link. -->

### Paso 1 — <título del paso>

- **Input:** `[[DOC-<slug>/02 - Schema#<tabla>.<columna>]]`
- **Operación:** <qué se hace con el input>
- **Output:** <qué produce: tabla intermedia, papel de trabajo, celda del workbook>
- **Papel de trabajo (si aplica):** [[#PT-<slug>-NN]]

### Paso 2 — <título>
...

## 6. Reglas de cierre y tolerancias

<!-- Cuándo una reconciliation se considera terminada. -->

- **Criterio de cierre:** <condición booleana concreta>
- **Tolerancia:** <ej: `abs(diferencia) <= 0.01`>
- **Regla de status:**
  - `cuadrado` si <condición>
  - `con diferencia` si <condición>
  - `incompleto` si <condición>
- **Qué hacer cuando no cierra:** <orden de investigación, cuándo escalar>

## 7. Papeles de trabajo generados

<!-- Cada PT tiene su propia mini-sección. Son las tablas que quedan como evidencia
     ante el IMSS o como soporte interno. -->

### PT-<slug>-01 — <nombre descriptivo>

- **Propósito:** <qué respalda>
- **Grain:** <unidad de una fila>
- **Inputs:** <qué tablas / columnas alimentan este papel>
- **Se entrega al IMSS:** <sí | no — solo soporte interno>
- **Columnas del papel:**
  - <col>: <tipo> — <descripción>
  - ...
- **Ejemplo poblado:** <link o bloque de código con 2-3 filas de muestra>

### PT-<slug>-02 — <nombre>
...

## 8. Casos especiales y bifurcaciones

<!-- Escenarios que cambian el flujo estándar. -->

### Caso — <nombre>

- **Cuándo:** <condición>
- **Qué hacer:** <ajuste al flujo>
- **Papel de trabajo afectado:** <PT-*>
- **Origen:** <normativo | aporte [[CONTRIB-...]]>

## 9. Extras de la oficina (opcionales, no requeridas por IMSS)

<!-- Cosas que esta oficina hace aunque no sean necesarias para la prueba IMSS.
     Ejemplo: RSM Mérida cuadra contra balanza aunque IMSS no lo pida, porque su
     cultura de auditores financieros lo valora.
     El dev team sabe que estos son opcionales vía `required_for_imss: false`. -->

### Extra 1 — <nombre>

- **Qué hace:** <descripción>
- **Por qué esta oficina lo hace:** <razón cultural / metodológica>
- **Requerido por IMSS:** false
- **Inputs adicionales:** <si usa DOC-* que no están en `data_sources` principales>
- **Salida:** <dónde queda>

### Extra 2 — <nombre>
...

## 10. Errores comunes y alertas

<!-- Lo que esta oficina ha aprendido que sale mal con frecuencia en este amarre. -->

- <error común 1>
- <error común 2>
- ...

## 11. Preguntas abiertas

<!-- Dudas que quedaron sin resolver en la sesión con el auditor.
     Se cierran vía PROP cuando se consigue la respuesta. -->

- <pregunta>: <contexto>

## 12. Notas de mantenimiento

- Solo se modifica vía PROP + DEC. Ver [[changelog]] de la prueba padre.
- Si el procedimiento de esta oficina cambia sustancialmente, se puede bumpear
  `version` (v1 → v2) y marcar la anterior como `status: deprecated` en lugar
  de sobrescribir — útil si quedan auditorías abiertas con la versión vieja.
