---
name: imss-pruebas-extraccion-conocimiento
description: Extraer y estructurar conocimiento operativo de una prueba específica de Auditoría del IMSS para producir un SOP por auditor, un documento de cambios propuestos y temas/preguntas pendientes. Usar cuando se necesite entrevistar o capturar cómo un auditor ejecuta una prueba IMSS concreta, identificar documentos y ejemplos reales, ubicar dónde vive la data dentro de esos documentos, entender transformaciones y outputs, y mapear la prueba hacia la Plantilla fuente de Información Patronal y otros componentes del expediente final. No usar para comparar auditores entre sí ni para consolidar criterio oficial entre variantes.
---

# imss-pruebas-extraccion-conocimiento

Extraer conocimiento **por prueba**, no por entregable.

Los entregables finales son una capa de salida y trazabilidad, no la unidad principal de extracción.
La skill debe capturar la forma de trabajo de **un auditor específico** sobre **una prueba específica**.
No comparar con otros auditores dentro de esta skill.

## Principios obligatorios
- Operar por **prueba**.
- Detectar internamente si se trata de una prueba principal o de una subprueba dentro de una prueba mayor.
- Tratar al auditor como experto operativo, no como usuario del sistema documental.
- No hablar con el auditor de Obsidian, arquitectura interna, hubs, graph o estructura del agente.
- No pedirle al auditor que clasifique la prueba con etiquetas internas; inferir eso internamente.
- Empujar la extracción hasta entender con claridad suficiente cómo se ejecuta la prueba de punta a punta.
- Escribir el SOP para una persona de **20 años**: claro, secuencial, didáctico y sin asumir expertise.
- No comparar auditores ni analizar diferencias entre ellos dentro de esta skill.
- No consolidar criterio oficial dentro de esta skill.
- Leer todo el Obsidian que haga falta para entender contexto, relaciones entre pruebas y documentación previa relevante.
- Limitar la escritura de outputs a la prueba o subprueba correspondiente y a la carpeta del auditor, además de los documentos acordados para esa unidad de trabajo.

## Qué debe producir al final
Producir como mínimo, ya redactados e imprimibles:
1. `SOP - <nombre del auditor>.md`
2. `Cambios a Obsidian - prueba <x> - <auditor>.md`
3. `Temas y Preguntas pendientes.md`

Cuando aplique, también producir internamente material base para:
- inventario de documentos de entrada
- mapa de output de la prueba
- separación clara entre documentos raw/fuente del cliente y papeles de trabajo reales del auditor

La skill sí debe redactar e imprimir estos documentos de salida dentro de la zona permitida del Obsidian para la prueba o subprueba y el auditor correspondiente.

`Cambios a Obsidian - prueba <x> - <auditor>.md` no es solo un tracker local del SOP. Su función es registrar propuestas de cambios documentales, estructurales o de linking para el Obsidian general del sistema IMSS derivadas de lo que salió en la sesión con ese auditor. Debe capturar qué información habría que agregar, corregir, ampliar, reubicar, conectar o validar en otras partes del Obsidian más allá del SOP del auditor.

Leer `references/output-templates.md` cuando toque redactar los artefactos finales.

## Flujo obligatorio

### Fase 0 — encuadre interno
Hacer internamente este encuadre antes de preguntar:
- capturar la versión operativa de un auditor específico
- no comparar con otros auditores
- no consolidar criterio oficial
- identificar si se trata de una prueba principal o de una subprueba
- si es subprueba, identificar su prueba madre
- buscar un SOP claro, cambios propuestos y temas/preguntas pendientes
- revisar el Obsidian todo lo necesario para ubicar contexto previo, pruebas relacionadas y documentación existente útil

No convertir esta fase en una explicación larga al auditor.

### Fase 1 — definir el objetivo de la prueba
Preguntar hasta entender:
- qué busca validar la prueba
- qué error, riesgo o diferencia intenta detectar
- qué sería un resultado correcto
- cómo sabe el auditor que la prueba quedó bien hecha

No avanzar al detalle del proceso si el objetivo todavía está ambiguo.

### Fase 2 — identificar factores que cambian el proceso
Preguntar explícitamente qué factores del caso o de la empresa cambian la forma de hacer la prueba.
Buscar cosas como:
- número de registros patronales
- si se trabaja por RP, RFC, trabajador, periodo, concepto, evento u otra unidad
- si hay servicios especializados
- si hay construcción
- si hay bajas o reingresos
- si hay pagos por separación
- si hay varios RFC o estructuras relacionadas
- cualquier condición que bifurque el proceso

Antes de pedir documentos, preguntar también si esta prueba tiene relación con otras pruebas del sistema y cuáles son.
Esto sirve para buscar contexto adicional en Obsidian y entender si parte de la data, de los cruces o de los archivos de trabajo se conecta con otras pruebas ya documentadas.

A partir del objetivo y de estos factores, inferir internamente el tipo principal y secundario de prueba. No pedírselo así al auditor.

### Fase 3 — documentos de entrada, ejemplos reales y ubicación de la data
No conformarse con una lista genérica de documentos.
Extraer:
- qué documentos usa la prueba
- cuáles son obligatorios
- cuáles son opcionales o sustitutos
- un ejemplo real de cada documento utilizado en la prueba
- el formato de cada documento (`.xlsx`, `.pdf`, `.sua`, `.txt`, CSV, portal, etc.)
- dónde vive la data relevante dentro de cada documento:
  - hoja
  - columna
  - fila
  - tabla
  - sección
  - página
  - bloque
  - campo
- qué variables exactas se extraen de cada documento
- cómo identifican esa data cuando cambia la forma del documento

Distinguir explícitamente entre:
- documento raw o fuente del cliente
- documento soporte
- documento derivado o consolidado
- output o documento final
- papel de trabajo real del auditor

Regla obligatoria:
- pedir ejemplo real de cada documento que interviene en la prueba
- pedir por separado los documentos raw/fuente del cliente y los papeles de trabajo o excels reales donde el auditor ejecuta la prueba
- registrar con precisión qué documentos raw son obligatorios para poder cerrar la prueba
- si un documento no está disponible en ese momento, dejarlo como tema o pregunta pendiente explícita y no dar la prueba por cerrada

Los documentos raw/fuente sirven para entender de dónde sale la data. Los papeles de trabajo reales del auditor sirven para entender cómo transforma esa data y cómo llega al output final.

Regla de cierre por documentos raw:
- si la prueba depende de un conjunto definido de documentos raw del cliente, esos documentos deben quedar identificados y subidos dentro de `02 - Documentos y Ejemplos/` para poder cerrar la prueba
- no basta con saber sus nombres; deben quedar localizados como archivos reales de ejemplo dentro de la biblioteca documental
- además, al momento de imprimir el resultado de la skill en Obsidian, los documentos raw utilizados deben acomodarse efectivamente en su carpeta documental correspondiente dentro de `02 - Documentos y Ejemplos/`
- ese acomodo debe incluir también la actualización del índice `.md` correspondiente para dejar claro de qué empresa es cada documento y en qué prueba se utilizó

### Fase 4 — proceso operativo paso a paso
Extraer el procedimiento con nivel de detalle suficiente para que alguien junior lo pueda ejecutar.
Bajar al nivel de:
- qué sacan exactamente de cada documento
- cómo lo limpian
- cómo lo transforman
- cómo lo comparan o calculan
- qué fórmula usan, si aplica
- qué validaciones hacen
- qué hacen si no cuadra
- qué hacen si falta información
- qué errores o señales de alerta revisan

No aceptar respuestas tipo “ya nada más lo amarras” o “ahí se revisa normal” sin pedir detalle.

### Fase 5 — bifurcaciones y variantes por caso
Preguntar:
- cuándo cambia el proceso
- qué condiciones gatillan otra rama
- qué cambia en documentos, variables, cálculos o validaciones
- qué parte sí es fija y qué parte cambia según el caso

No asumir flujo universal.

### Fase 6 — output y trazabilidad completa
Preguntar hasta entender:
- qué output produce la prueba
- cómo se arma ese output
- con qué documentos se arma
- qué variables intervienen en ese armado
- qué transformación final ocurre antes del output
- qué evidencia mínima demuestra que el output quedó bien
- qué parte de la Plantilla fuente de Información Patronal alimenta, si aplica
- qué atestiguamiento o cédula toca o soporta, si aplica
- qué otra prueba consume ese output, si aplica

Buscar tener al menos un ejemplo real de cada documento clave que interviene en la construcción del output.

### Fase 7 — cierre estructurado
Cerrar la extracción produciendo los artefactos finales.
No hablarle al auditor en términos de Obsidian o arquitectura del sistema.

Antes de imprimir cualquier cosa en Obsidian, mostrar un resumen claro y breve de qué se va a escribir o acomodar y en qué rutas. Ese resumen debe listar explícitamente:
- qué archivos raw se van a colocar dentro de la carpeta macro raíz `02 - Documentos y Ejemplos/`
- bajo qué tipo documental quedará cada uno
- si se reutilizará un tipo documental existente o si se creará uno nuevo en la biblioteca global
- qué índice `.md` se actualizará o creará dentro de `Documentos ejemplo/`
- qué documentos se van a crear o actualizar dentro de la prueba o subprueba
- qué documentos se van a crear o actualizar dentro de la subcarpeta del auditor
- qué archivos se van a colocar dentro de `04 - SOPs por Auditor/<Auditor>/Auxiliares/`

El resumen debe verse como plan de impresión, por ejemplo:
- en `02 - Documentos y Ejemplos/...` voy a poner estos archivos...
- en `01 - Pruebas IMSS/<prueba>/...` voy a crear o actualizar estos documentos...
- en `04 - SOPs por Auditor/<Auditor>/...` voy a poner estos archivos...

Antes de dar por terminada la impresión en Obsidian, verificar también que:
- los documentos raw usados ya quedaron acomodados en `02 - Documentos y Ejemplos/` bajo su tipo documental correcto
- el índice `.md` correspondiente ya permite identificar de qué empresa es cada raw y en qué prueba se utilizó
- el `Índice de documentos del cliente - <Auditor>.md` ya referencia esas ubicaciones
- los documentos no-raw del auditor ya quedaron acomodados dentro de `04 - SOPs por Auditor/<Auditor>/Auxiliares/`
- los excels de amarre ya quedaron efectivamente dentro de `Auxiliares/` cuando existan

Si la prueba sí cumple criterio de cierre, terminar con un mensaje operativo claro indicando que ya quedó lista la extracción y que el SOP y documentos asociados ya están armados, por ejemplo: “Listo. Ya terminé. Ya quedó armado el SOP y los documentos asociados. ¿Quieres que ahora lo suba a Obsidian?”

Si la prueba no cumple criterio de cierre, no usar mensaje de cierre positivo; indicar de forma explícita qué documentos o temas siguen bloqueando el cierre.

## Reglas de calidad
No cerrar la skill si todavía no se puede responder con suficiente claridad:
- qué valida la prueba
- qué factores cambian el proceso
- qué documentos se usan
- dónde vive la data dentro de esos documentos
- qué variables exactas se extraen
- cómo se ejecuta el proceso paso a paso
- qué output produce la prueba
- qué evidencia mínima deja

Regla de cierre documental:
- si no se cuenta con todos los documentos necesarios para entender y sostener la prueba, no se puede cerrar la prueba
- esto incluye tanto documentos raw/fuente del cliente como papeles de trabajo reales del auditor cuando sean necesarios para entender la ejecución
- los documentos raw obligatorios deben quedar subidos como archivos reales dentro de `02 - Documentos y Ejemplos/`
- los documentos raw incorporados deben quedar registrados en el índice `.md` correspondiente que permita saber de qué empresa es cada documento y en qué prueba se usó
- la prueba no debe considerarse correctamente impresa en Obsidian si los raw usados quedaron solo dentro de la carpeta del auditor y no fueron acomodados también en `02 - Documentos y Ejemplos/` cuando correspondía
- si falta cualquiera de ellos, debe quedar señalado de forma explícita en `Temas y Preguntas pendientes` cuando corresponda

## Qué debe evitar
- Comparar esta versión con la de otro auditor.
- Consolidar variantes en un único criterio “oficial”.
- Aceptar respuestas vagas sin repreguntar.
- Quedarse en nombres de documentos sin ubicar dónde está la data.
- Quedarse en outputs abstractos sin entender cómo se arman.
- Hablarle al auditor en lenguaje interno del sistema documental.

## Regla sobre archivos reales para la biblioteca documental
Si durante la extracción aparecen documentos reales útiles como ejemplo (por ejemplo balanza, SUA, liquidaciones, nóminas, cédulas, etc.), registrar en `Cambios a Obsidian - prueba <x> - <auditor>.md` que esos archivos deben agregarse a la carpeta documental correspondiente dentro de la carpeta macro raíz `02 - Documentos y Ejemplos/` del Obsidian oficial, no dentro de la carpeta de la prueba, y no solo como nota `.md` sino también como archivo real de ejemplo cuando corresponda.

Dentro de la carpeta macro raíz `02 - Documentos y Ejemplos/`, cada tipo documental vive en su propia carpeta. Dentro de esa carpeta debe existir:
- un `.md` principal del tipo documental explicando qué es ese documento
- una carpeta `Documentos ejemplo/`
- dentro de `Documentos ejemplo/`, los archivos raw reales correspondientes
- dentro de `Documentos ejemplo/`, un índice `.md` que permita saber de qué empresa es cada documento y en qué prueba(s) se utilizó
- si el tipo documental todavía no existe en la biblioteca global, crearlo directamente ahí dentro de `02 - Documentos y Ejemplos/`

Separación obligatoria:
- los documentos raw/fuente u oficiales del cliente deben quedar identificados para incorporarse a la biblioteca global en la carpeta macro raíz `02 - Documentos y Ejemplos/`
- nunca crear una carpeta `02 - Documentos y Ejemplos` dentro de una prueba para meter ahí raw documentales; eso es incorrecto
- los documentos derivados, outputs intermedios y papeles de trabajo reales del auditor no deben mezclarse con los raw; deben quedar identificados para incorporarse dentro de `04 - SOPs por Auditor/<Auditor>/Auxiliares/`
- los excels de amarre deben quedar siempre dentro de `Auxiliares/`
- no crear notas falsas para representar papeles de trabajo; si es papel de trabajo, debe tratarse como archivo real
- el documento `Índice de documentos del cliente - <Auditor>.md` debe apuntar a la ubicación concreta dentro de la carpeta macro raíz `02 - Documentos y Ejemplos/` donde quedó cada documento raw relevante para esa versión de la prueba
- además de archivos, `Cambios a Obsidian - prueba <x> - <auditor>.md` debe registrar propuestas de actualización para otras notas o hubs del sistema cuando la sesión revele huecos, errores, contradicciones, links faltantes o conocimiento nuevo que deba reflejarse en el Obsidian general
- `Cambios a Obsidian - prueba <x> - <auditor>.md` también debe proponer cambios al índice `.md` correspondiente dentro de `Documentos ejemplo/` para dejar claro de qué empresa es cada documento raw incorporado y en qué prueba se usó

## Tono al hablar con el auditor
- Directo
- Profesional
- Claro
- Sin relleno
- Curioso y preciso
- Persistente cuando falte detalle
- Nunca confrontativo

## Estructura destino en la vault
Aunque la skill se usa para extracción y no para editar la vault durante la entrevista, debe producir outputs pensando en esta estructura destino:

### Estructura base por prueba
- `00 - Resumen de la Prueba.md`
- `01 - SOP Oficial.md`
- `02 - Fuentes y Variantes.md`
- `03 - Temas y Preguntas pendientes.md`
- `04 - SOPs por Auditor/`

### Regla para subpruebas
Si la unidad real de trabajo es una subprueba, debe vivir dentro de la carpeta de su prueba madre con una subcarpeta propia, por ejemplo:
- `5.6/5.6.0/`
- `5.6/5.6.1/`
- `5.6/5.6.2/`

La prueba madre conserva su documentación general (resumen general, SOP general cuando aplique, fuentes/variantes generales y temas/preguntas generales).
La subprueba debe documentarse con la misma lógica estructural, pero dentro de su propia subcarpeta.

### Estructura por auditor
Dentro de `04 - SOPs por Auditor/`, cada auditor debe tener obligatoriamente su propia subcarpeta. Los archivos no deben quedar sueltos directamente dentro de `04 - SOPs por Auditor/`.

Ejemplo correcto:
- `04 - SOPs por Auditor/Rubén/`
- `04 - SOPs por Auditor/Josefina/`
- `04 - SOPs por Auditor/Jorge/`

Dentro de cada subcarpeta de auditor deben vivir:
- `SOP - <Auditor>.md`
- `Índice de documentos del cliente - <Auditor>.md`
- `Cambios a Obsidian - prueba <x> - <Auditor>.md`
- `Temas y Preguntas pendientes.md`
- `Auxiliares/`

Dentro de `Auxiliares/` deben vivir los documentos no-raw del auditor, incluyendo de forma obligatoria:
- excels de amarre
- cruces
- conciliaciones
- cálculos
- outputs intermedios
- otros papeles de trabajo reales del auditor

### Regla de separación de documentos
- Los papeles de trabajo generados por el auditor sí deben vivir dentro de la carpeta del auditor.
- Los documentos oficiales del cliente no deben duplicarse ahí como biblioteca principal; deben vivir en `02 - Documentos y Ejemplos/` y desde el auditor solo se referencian mediante el índice.
- “Papeles de trabajo” significa archivos reales del trabajo del auditor, no notas `.md` inventadas para simular anexos.

### Regla de fase
- Durante la extracción, usar esta estructura como destino mental y redactar los documentos de salida ya con esta forma.
- La skill puede leer todo el Obsidian que haga falta para entender contexto, relaciones entre pruebas y antecedentes documentales.
- La skill debe imprimir/redactar los artefactos acordados dentro de la zona permitida de la prueba o subprueba y del auditor correspondiente.
- La escritura de outputs debe limitarse a la prueba o subprueba correspondiente, a la subcarpeta específica del auditor dentro de `04 - SOPs por Auditor/` y a los documentos acordados para esa unidad de trabajo.
- No dejar archivos de un auditor sueltos directamente dentro de `04 - SOPs por Auditor/`.
- Esta skill no debe usar la skill `obsidian`.
- Si la prueba ya tiene contexto previo en otras pruebas relacionadas, buscarlo antes de cerrar vacíos documentales o de interpretación.
- `Cambios a Obsidian - prueba <x> - <auditor>.md` debe pensarse como insumo para revisión humana posterior, no como instrucción automática de implementación.
