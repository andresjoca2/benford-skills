# IMSS Product Agent Evolution Plan

## Propósito

Este plan define cómo evolucionar el `product-agent` IMSS para que deje de documentar procedimientos como piezas aisladas y pase a entender, documentar y relacionar:

- el objetivo final del dictamen IMSS,
- las metodologías por oficina/firma,
- los SOPs como procedimientos completos,
- los documentos involucrados en cada procedimiento,
- el origen de los datos,
- y la relación entre procedimientos intermedios y el entregable final.

La meta es que el agente pueda construir y mantener una visión conceptual-operacional de cómo una metodología de auditoría IMSS converge al dictamen final.

---

# Fase 1. Marco general del dictamen IMSS

## Objetivo
Dar al `product-agent` un contexto explícito del objetivo final de toda la auditoría IMSS: el dictamen final y sus pruebas/secciones.

## Actividades
1. Crear un markdown marco del dictamen IMSS final.
2. Documentar que el dictamen tiene aproximadamente 11 o 12 pruebas/secciones finales.
3. Separar claramente:
   - pruebas obligatorias,
   - pruebas variables según características de la empresa.
4. Incorporar que algunas pruebas dependen de condiciones como:
   - REPSE,
   - construcción,
   - otras características relevantes de la empresa.
5. Documentar que el formato del Excel final del IMSS es estable en esencia, aunque puede cambiar por año.
6. Establecer que, por ahora, el formato vigente será la referencia de trabajo.
7. Preparar el documento para que después se le agreguen:
   - nombres canónicos de las pruebas,
   - descripción de cada prueba,
   - campos relevantes,
   - relación con procedimientos.

---

# Fase 2. Formalización del contexto por metodología

## Objetivo
Hacer que el `product-agent` entienda que la unidad principal de contexto no es el auditor individual, sino la metodología.

## Actividades
1. Definir explícitamente en sus instrucciones que la unidad principal de contexto es la metodología.
2. Documentar que las carpetas dentro de `01 Pruebas IMSS` representan metodologías.
3. Incorporar la lógica de naming por metodología, por ejemplo:
   - `RCM Mazatlán`
   - `RCM Mérida`
   - `RSM Mérida Metodología 1`
   - `RSM Mérida Metodología 2`
4. Aclarar que varios auditores pueden trabajar bajo la misma metodología.
5. Aclarar que si varios auditores siguen la misma metodología, el contexto y el SOP base siguen siendo comunes.
6. Definir que al iniciar trabajo sobre un procedimiento, el agente debe identificar primero:
   - metodología,
   - carpeta correcta,
   - SOPs previos de esa metodología.

---

# Fase 3. Lectura previa contextual obligatoria

## Objetivo
Hacer que el `product-agent` inicie cada nueva entrevista o levantamiento con una lectura previa mínima, eficiente y suficiente del contexto general y de la metodología.

## Actividades
1. Definir un paso obligatorio de prelectura antes de conversar con un auditor.
2. Establecer un orden fijo de lectura mínima obligatoria:
   - `IMSS_DICTAMEN_CONTEXT.md`
   - `IMSS_DICTAMEN_SHEETS_AND_VARIABLES.md`
   - `METHODOLOGY_CONTEXT_RULES.md`
3. Si ya existe contexto dentro de la metodología, leer después:
   - `00 - Contexto de la Metodología.md`
   - `01 - Inventario de Documentos y Tablas.md`
   - `02 - Mapa de Transformaciones y Reuso.md`
   - SOPs o procedimientos relacionados disponibles.
4. Hacer que el agente revise si existen procedimientos relacionados o dependientes previos dentro de esa metodología.
5. Definir un criterio de contexto mínimo suficiente que no bloquee el avance:
   - con los tres documentos globales fijos ya se puede arrancar,
   - el contexto metodológico adicional se carga solo si existe.
6. Definir un fallback explícito para metodologías nuevas o todavía poco documentadas:
   - si no hay contexto metodológico previo, no se bloquea el trabajo,
   - el agente arranca con el contexto global fijo,
   - y el procedimiento nuevo pasa a ser parte de la construcción inicial de esa metodología.
7. Hacer que el agente use este contexto para:
   - entender el punto actual de la metodología,
   - identificar si el nuevo procedimiento ya fue parcialmente documentado,
   - ubicar posibles dependencias con SOPs existentes,
   - y no arrancar desde cero cuando ya haya contexto suficiente.
8. Evaluar si conviene crear o mantener un índice/resumen por metodología para acelerar la prelectura sin volverla pesada.

---

# Fase 4. Modelo formal del SOP como procedimiento completo

## Objetivo
Asegurar que cada SOP represente un procedimiento completo y no solo una lista de pasos aislados, distinguiendo claramente entre lo que explica el auditor y la interpretación estructural interna que construye el sistema.

## Actividades
1. Definir que cada SOP representa un procedimiento completo de trabajo.
2. Aclarar que un procedimiento puede ser, entre otros:
   - generación de un Excel,
   - amarre,
   - cuadre,
   - verificación,
   - preparación de documentación soporte,
   - obtención de información para otra prueba,
   - obtención de información para el dictamen final.
3. Dividir el modelo del SOP en dos capas explícitas:
   - capa del auditor,
   - capa interna del sistema.
4. En la capa del auditor, capturar como mínimo:
   - objetivo del procedimiento,
   - documentos usados,
   - origen de la información según el auditor,
   - cómo se alimentan los Excels o papeles de trabajo,
   - pasos operativos,
   - validaciones o revisiones,
   - output visible del procedimiento,
   - y relación con procedimientos posteriores cuando el auditor la conozca.
5. En la capa interna del sistema, capturar como mínimo:
   - interpretación estructural del procedimiento,
   - tablas o estructuras internas necesarias,
   - variables clave,
   - transformaciones sugeridas,
   - inputs reutilizables existentes,
   - outputs reutilizables generados,
   - relación con procedimientos previos o posteriores desde el punto de vista del sistema,
   - y vínculo con una o más pruebas del dictamen final.
6. Dejar explícito que la capa interna del sistema no depende de que el auditor sepa de bases de datos o tablas.
7. Definir que el agente debe inferir la capa interna a partir de:
   - documentos mencionados,
   - estructura del Excel,
   - origen de datos,
   - procedimiento descrito,
   - outputs,
   - y contexto previo disponible.
8. Distinguir dentro del SOP entre:
   - observado o dicho por el auditor,
   - inferido por el sistema con alta confianza,
   - inferido con baja confianza,
   - pendiente por validar.
9. Definir qué nivel de granularidad debe tener cada SOP para que represente una unidad útil, trazable y reusable.

---

# Fase 5. Clasificación y trazabilidad documental

## Objetivo
Hacer que el agente identifique correctamente los documentos mencionados por el auditor, los clasifique según su función y origen, y los conecte con la capa interna del sistema, sus tablas derivadas y su posible reuso posterior.

## Actividades
1. Definir una taxonomía documental formal para el agente.
2. Distinguir explícitamente entre:
   - documentos externos del cliente,
   - documentos de trabajo del auditor,
   - documentos derivados de procedimientos previos,
   - documentos de soporte para cuadre, amarre o validación,
   - y activos internos del sistema como tablas raw, tablas transformadas y outputs estructurados.
3. Definir que cada vez que un auditor mencione un documento, el agente debe tratar de identificar:
   - qué documento es,
   - qué tipo de documento es,
   - qué rol cumple,
   - si es input o output,
   - si es raw o ya transformado,
   - si ya existía antes,
   - si se genera durante el procedimiento actual,
   - y si puede convertirse en activo reusable.
4. Dejar explícito que una cosa es el documento y otra la estructura derivada que el sistema construye a partir de él.
5. Incorporar una lógica de trazabilidad documental en cada SOP.
6. Definir un esquema explícito para registrar documentos relevantes dentro de los SOPs.
7. Hacer que la clasificación documental alimente también:
   - el inventario de documentos y tablas de la metodología,
   - el mapa de transformaciones y reuso,
   - y la capa interna del sistema dentro del SOP.
8. Definir que cada documento relevante debería intentar registrar, cuando sea posible:
   - nombre,
   - tipo,
   - origen,
   - procedimiento donde entra,
   - procedimiento que lo genera,
   - relación con tabla raw,
   - relación con tabla transformada,
   - output resultante,
   - reuso potencial,
   - y nivel de certeza.

---

# Fase 6. Origen de datos y relación con procedimientos previos

## Objetivo
Asegurar que el agente entienda y capture de dónde proviene la información que alimenta cada documento o Excel mencionado, siguiendo su cadena hacia atrás hasta llegar, cuando sea posible, a la raw data o fuente externa base.

## Actividades
1. Definir que el origen de los datos es un campo obligatorio de razonamiento/documentación.
2. Forzar al agente a distinguir si la información:
   - viene directamente del cliente,
   - viene de un documento o Excel armado por el auditor,
   - viene de un procedimiento previo,
   - o viene de una transformación interna ya existente.
3. Establecer una lógica de rastreo hacia atrás:
   - si un Excel viene del cliente, tratarlo como raw data o fuente externa base,
   - si un Excel fue armado por el auditor, rastrear de dónde viene la información que lo alimenta,
   - y seguir esa cadena hacia atrás hasta llegar a una fuente suficientemente base o clara.
4. Si viene de un procedimiento previo, hacer que el agente trate de vincularlo con un SOP ya existente, un output previo o una tabla/documento ya identificado dentro de la metodología.
5. Si no existe SOP previo documentado, hacer que el agente deje explícito que el origen requiere levantamiento posterior.
6. Hacer que el agente pregunte activamente por el origen de los datos cuando el auditor lo omita o responda de forma demasiado genérica, por ejemplo diciendo solo que "sale de un Excel".
7. Distinguir entre:
   - origen confirmado por el auditor,
   - origen inferido por el sistema,
   - origen pendiente de confirmar.
8. Registrar, cuando sea posible, si el reuso del origen es:
   - total,
   - parcial,
   - o todavía incierto.
9. Hacer que esta lógica alimente también:
   - el SOP,
   - el inventario de documentos y tablas,
   - el mapa de transformaciones y reuso,
   - y la futura matriz conceptual-operacional.
10. Definir un mecanismo para registrar si el origen quedó:
   - claro,
   - parcialmente claro,
   - pendiente de confirmar.

---

# Fase 7. Construcción del mapa conceptual-operacional híbrido

## Objetivo
Construir y mantener un artefacto híbrido que conecte procedimientos, documentos, tablas, transformaciones, validaciones y entregables finales del dictamen IMSS.

La idea original de matriz se mantiene, pero integrada dentro de una estructura más rica que también permita narrar el flujo operativo de principio a fin.

## Actividades
1. Crear un archivo markdown independiente para el mapa conceptual-operacional.
2. Definir que el artefacto tendrá al menos dos vistas complementarias:
   - una vista resumen tipo matriz,
   - una vista narrativa/secuencial del flujo operativo.
3. En la vista matriz/resumen, representar de forma compacta:
   - procedimientos,
   - pruebas u hojas del dictamen IMSS relacionadas,
   - documentos principales,
   - transformaciones clave,
   - outputs,
   - y relación directa o indirecta con el entregable final.
4. En la vista narrativa/secuencial, representar:
   - información solicitada al cliente,
   - documentos raw,
   - traducción a tablas o estructuras internas,
   - transformaciones,
   - validaciones,
   - bifurcaciones cuando algo no cuadra,
   - outputs intermedios,
   - y entregables finales relacionados.
5. Hacer que el `product-agent` entienda que este mapa es tanto conceptual como operacional.
6. Definir que, al terminar un SOP, el agente debe revisar si el mapa necesita actualización.
7. Definir la lógica para agregar relaciones nuevas detectadas durante entrevistas, documentación de SOPs o inferencias internas suficientemente sólidas.
8. Decidir el nivel de granularidad adecuado para mantener el mapa legible, evitando bajar demasiado pronto a nivel campo por campo cuando todavía no sea necesario.
9. Evaluar si conviene mantener:
   - una vista global del sistema,
   - y vistas específicas por metodología.
10. Asegurar que este mapa conviva con:
   - SOPs,
   - inventarios de documentos y tablas,
   - mapas de transformaciones y reuso,
   - y el contexto del dictamen IMSS.

---

# Fase 8. Protocolo de comunicación con auditores

## Objetivo
Hacer que el `product-agent` converse con auditores de forma más simple, amable, eficiente y estratégica, para extraer mejor el conocimiento sin abrumarlos ni pedirles cosas que no saben modelar técnicamente.

## Actividades
1. Redefinir el estilo de comunicación del agente con auditores para que use:
   - mensajes cortos,
   - lenguaje simple,
   - una idea principal por mensaje,
   - una pregunta principal a la vez,
   - y explicaciones breves solo cuando hagan falta.
2. Definir una apertura estándar de conversación que dé contexto simple sobre:
   - qué se quiere entender,
   - para qué,
   - y cómo se irá paso a paso.
3. Ajustar el flujo de entrevista para que el agente avance por etapas claras, por ejemplo:
   - objetivo de la prueba o procedimiento,
   - documentos usados,
   - cómo se alimenta el Excel o papel de trabajo,
   - validaciones,
   - output,
   - relación con el siguiente paso.
4. Hacer que el agente pregunte explícitamente por:
   - documentos usados,
   - documentos generados,
   - origen de datos,
   - procedimientos previos relacionados,
   - vínculo con pruebas finales del dictamen,
   pero sin meter demasiadas preguntas en un solo mensaje.
5. Definir repreguntas estándar para aclarar:
   - de dónde sale el Excel,
   - quién lo arma,
   - qué información lo alimenta,
   - si ese archivo viene de otro procedimiento,
   - y si el documento lo entrega el cliente o lo arman ellos.
6. Dejar explícito que el agente no debe pedirle al auditor cosas como:
   - diseño de tablas,
   - modelos de base de datos,
   - estructuras técnicas internas,
   - o abstracciones que pertenecen al sistema y no al auditor.
7. Hacer que el agente detecte cuándo el auditor está omitiendo pasos o asumiendo contexto no dicho.
8. Hacer que el agente muestre suficiente contexto y entendimiento para que el auditor sienta que la conversación está bien dirigida.
9. Definir una lógica de adaptación cuando el auditor:
   - responde muy corto,
   - se muestra impaciente,
   - se confunde,
   - o rechaza mensajes demasiado largos.
10. Evitar ciclos extremos de estilo, por ejemplo pasar de mensajes demasiado largos a un modo excesivamente seco de sí/no.
11. Hacer que el agente sea insistente en trazabilidad cuando el contexto esté incompleto, pero de forma liviana y estratégica.
12. Establecer reglas de cuándo marcar algo como pendiente en vez de inferir demasiado.

---

# Fase 9. Alineación con la estructura actual del vault

## Objetivo
Alinear todo el sistema nuevo con la estructura que ya existe dentro de `IMSS Vault`, sin rediseñar de más lo que ya está funcionando.

## Actividades
1. Tomar como base la estructura actual de `01 - Pruebas IMSS`, donde cada carpeta raíz representa una metodología.
2. Definir que dentro de cada metodología deben vivir los documentos de contexto metodológico, por ejemplo:
   - contexto de la metodología,
   - inventario de documentos y tablas,
   - mapa de transformaciones y reuso.
3. Mantener que dentro de cada metodología vivan también las carpetas de pruebas o procedimientos correspondientes.
4. Definir que, dentro de cada prueba, la estructura por auditor debe seguir el patrón correcto ya observado en casos buenos como `acumsua`.
5. Formalizar que cada SOP generado debe dejar al menos:
   - una carpeta con documentos,
   - una carpeta de resultado,
   - el archivo del SOP,
   - y actualización de los demás documentos metodológicos o relacionales que correspondan.
6. Dejar explícito que los documentos globales del sistema, por ejemplo contexto general del dictamen y reglas generales del agent, no deben vivir dentro de cada metodología porque son contexto global.
7. Replicar la estructura correcta de las pruebas conforme se vayan generando o corrigiendo SOPs nuevos.
8. Establecer reglas simples de naming y ubicación para que el agente encuentre y actualice la estructura sin ambigüedad.

---

# Fase 10. Pruebas controladas y validación

## Objetivo
Validar que el nuevo enfoque realmente mejora la documentación y la trazabilidad.

## Actividades
1. Probar con una metodología concreta, por ejemplo `RCM Mérida`.
2. Seleccionar un procedimiento ya conocido y verificar si el agente puede:
   - leer contexto previo,
   - identificar documentos,
   - identificar origen de datos,
   - ubicar el procedimiento dentro de la cadena,
   - relacionarlo con el dictamen final.
3. Probar con un procedimiento que alimente otro procedimiento para validar relaciones intermedias.
4. Probar la actualización de la matriz después de una entrevista.
5. Revisar si el output realmente ayuda a visualizar el sistema completo.
6. Ajustar el diseño antes de escalar a todas las metodologías.

---

# Resultado esperado al final del plan

Al terminar estas fases, el `product-agent` debería poder:

- entender el objetivo final del dictamen IMSS,
- trabajar por metodología como unidad principal de contexto,
- leer SOPs previos antes de documentar nuevos procedimientos,
- documentar SOPs como procedimientos completos,
- clasificar documentos correctamente,
- capturar origen de datos,
- identificar relaciones entre procedimientos,
- y mantener una matriz que conecte metodologías, procedimientos, documentos y pruebas finales del dictamen.
