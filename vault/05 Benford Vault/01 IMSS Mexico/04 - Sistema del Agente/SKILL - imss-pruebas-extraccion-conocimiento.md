# SKILL - imss-pruebas-extraccion-conocimiento

## Propósito
Documentar la existencia de la skill `imss-pruebas-extraccion-conocimiento` como mecanismo principal para extraer conocimiento operativo de pruebas IMSS.

## Qué hace
La skill sirve para extraer conocimiento **por prueba**, no por entregable.

Su objetivo es producir, a partir de la explicación de un auditor sobre una prueba específica:
- un SOP por auditor
- un documento `Cambios a Obsidian - prueba <x> - <auditor>.md`
- una lista estructurada de preguntas abiertas

## Principios clave
- opera por prueba
- no compara auditores entre sí
- no consolida criterio oficial
- usa los entregables finales como capa de trazabilidad, no como unidad principal de extracción
- empuja la extracción hasta ubicar documentos, ejemplos reales, variables, transformaciones, outputs y trazabilidad
- escribe SOPs claros para una persona de 20 años

## Relación con el sistema actual
La skill se apoya en el modelo vigente de:
- prueba como unidad principal
- plantilla fuente de Información Patronal como principal entregable fuente
- SIDEIMSS como paso manual posterior
- expediente final descargable como capa de salida posterior
- atestiguamientos y cédulas como parte de la trazabilidad de outputs

## Regla operativa
Para nuevas extracciones profundas de conocimiento sobre una prueba IMSS, esta skill debe considerarse el mecanismo principal en lugar de usar conversación libre no estructurada.

## Nota
Las diferencias entre auditores deben analizarse después, ya fuera de la skill, cuando existan suficientes SOPs por auditor y material comparable.

## Regla de uso junto con la skill de Obsidian
- Usar `imss-pruebas-extraccion-conocimiento` para extraer y estructurar conocimiento de una prueba IMSS.
- Cuando la extracción ya terminó y toca aplicar cambios dentro de la vault, usar la skill `obsidian`.
- No mezclar ambas funciones en la misma fase: primero extracción de conocimiento, después trabajo estructural sobre el Obsidian.

## Estructura objetivo en Obsidian
La skill debe producir información con esta estructura destino en mente:

### Estructura base por prueba
- `00 - Resumen de la Prueba.md`
- `01 - SOP Oficial.md`
- `02 - Fuentes y Variantes.md`
- `03 - Preguntas Abiertas.md`
- `04 - SOPs por Auditor/`

### Estructura por auditor dentro de `04 - SOPs por Auditor/`
- subcarpeta por auditor (`Rubén/`, `Josefina/`, `Jorge/`, etc.)
- `SOP - <Auditor>.md`
- papeles de trabajo reales del auditor
- `Índice de documentos del cliente - <Auditor>.md`
- `Pendientes/`

### Regla importante
- La skill de extracción no debe crear ni consolidar el `01 - SOP Oficial.md`.
- Los documentos oficiales del cliente deben vivir en `02 - Documentos y Ejemplos/`.
- Dentro de la carpeta del auditor solo se deben referenciar mediante el índice correspondiente.
