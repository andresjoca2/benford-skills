# MAPA_CONCEPTUAL_OPERACIONAL_IMSS.md

## Propósito
Definir el artefacto híbrido que conectará procedimientos, documentos, tablas, transformaciones, validaciones y entregables finales del sistema de Auditoría IMSS.

Este documento reemplaza una visión demasiado estrecha de "solo una matriz".

La matriz sigue siendo útil, pero ahora se entiende como una de las vistas dentro de un mapa más completo del sistema.

---

## 1. Qué problema resuelve
El sistema necesita una forma de visualizar y mantener claro:
- qué información se pide al cliente,
- qué documentos entran,
- cómo se transforman,
- qué tablas se generan,
- qué procedimientos se ejecutan,
- qué validaciones existen,
- qué outputs intermedios aparecen,
- y cómo todo eso termina en los entregables finales del dictamen IMSS.

---

## 2. Naturaleza del artefacto
Este mapa debe ser:
- conceptual,
- operacional,
- incremental,
- y actualizable conforme se documenten SOPs nuevos.

No debe verse como un documento estático.
Debe crecer sobre la marcha.

---

## 3. Estructura híbrida propuesta
El artefacto debe tener, al menos, dos vistas complementarias.

### 3.1 Vista resumen tipo matriz
Sirve para ver de manera compacta:
- procedimiento,
- metodología,
- prueba u hoja del dictamen relacionada,
- documentos principales,
- transformación clave,
- output principal,
- relación directa o indirecta con el entregable final.

### 3.2 Vista narrativa / secuencial
Sirve para ver el flujo de principio a fin:
- input del cliente,
- documento raw,
- traducción a tabla o estructura interna,
- transformaciones,
- validaciones,
- bifurcaciones,
- outputs intermedios,
- procedimiento siguiente,
- entregable final relacionado.

---

## 4. Vista resumen tipo matriz
### 4.1 Propósito
Permitir una lectura rápida de cobertura y relaciones.

### 4.2 Estructura sugerida
| Metodología | Procedimiento | Prueba / hoja IMSS relacionada | Documentos principales | Transformación clave | Output principal | Relación con dictamen |
|---|---|---|---|---|---|---|

### 4.3 Uso esperado
Esta vista ayuda a responder:
- qué procedimientos ya existen,
- qué pruebas del dictamen tocan,
- con qué documentos trabajan,
- y qué outputs generan.

---

## 5. Vista narrativa / secuencial
### 5.1 Propósito
Representar el camino operativo real de la metodología.

### 5.2 Estructura sugerida
Cada bloque de flujo puede describirse así:
- **Input / documento fuente**
- **Origen**
- **Traducción a estructura interna**
- **Transformación principal**
- **Validación o bifurcación**
- **Output**
- **Siguiente procedimiento / uso posterior**
- **Entregable final relacionado**

### 5.3 Uso esperado
Esta vista ayuda a responder:
- cuál es el camino completo,
- dónde hay bifurcaciones,
- dónde se valida,
- qué pasa si algo no cuadra,
- y cómo se encadenan los procedimientos.

---

## 6. Nivel de detalle recomendado
No bajar de inmediato a campo por campo del dictamen o a variable por variable en esta capa principal, salvo cuando sea realmente útil.

Primero privilegiar:
- procedimiento,
- documento,
- tabla,
- transformación,
- output,
- validación,
- relación con entregable final.

Los detalles más finos pueden vivir en:
- SOPs,
- inventarios documentales,
- catálogos de variables,
- o notas específicas.

---

## 7. Relación con otros artefactos
Este mapa debe convivir con:
- `IMSS_DICTAMEN_CONTEXT.md`
- `IMSS_DICTAMEN_SHEETS_AND_VARIABLES.md`
- `SOP_TEMPLATE_V2.md`
- `CLASIFICACION_DE_DOCUMENTOS_IMSS.md`
- `ORIGEN_DE_DATOS_Y_RELACIONES.md`
- inventarios de documentos y tablas por metodología
- mapas de transformaciones y reuso por metodología

---

## 8. Regla de actualización
Cada vez que se termine o refine un SOP, el agente debe revisar si hay que actualizar:
- la vista resumen,
- la vista narrativa,
- o ambas.

No todo SOP nuevo implicará una actualización grande, pero la revisión debe existir siempre.

---

## 9. Escalas posibles del mapa
Este artefacto puede existir en dos niveles:

### 9.1 Vista global
Para entender el sistema completo de Auditoría IMSS.

### 9.2 Vista por metodología
Para entender el flujo operativo específico de una metodología como:
- Traust
- RSM Merida
- RSM Mazatlan
- o cualquier otra.

---

## 10. Regla práctica
Si al documentar un SOP aparece información nueva sobre:
- un documento,
- una tabla,
- una transformación,
- una validación,
- un output,
- o una relación con el dictamen,

el agente debe evaluar si ese hallazgo debe incorporarse a este mapa.

---

## 11. Criterio de éxito
Este mapa será útil si permite responder, con suficiente claridad:
- qué se pide al cliente,
- qué se hace con eso,
- qué tablas y outputs se generan,
- qué validaciones existen,
- y cómo todo termina en el dictamen IMSS final.
