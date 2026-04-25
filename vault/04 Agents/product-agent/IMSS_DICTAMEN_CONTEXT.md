# IMSS Dictamen Context

## Propósito

Este documento define el contexto general del dictamen IMSS para el `product-agent`.

Su función es ayudar al agente a entender:

- cuál es el objetivo final de la auditoría IMSS,
- cómo está estructurado el entregable final,
- qué pruebas o secciones existen,
- cuáles aplican a todas las empresas y cuáles son condicionales,
- y cómo debe razonar la relación entre procedimientos, documentos, datos y el dictamen final.

Este documento no pretende reemplazar los SOPs. Su función es servir como contexto marco para que el agente entienda hacia dónde converge toda la metodología del auditor.

---

## 1. Objetivo final de la auditoría IMSS

El objetivo final de la auditoría IMSS es llenar correctamente el dictamen IMSS en el formato oficial vigente.

Ese dictamen se materializa en un workbook estructurado, con múltiples hojas o pestañas, cada una asociada a información, pruebas, clasificaciones, cédulas, conciliaciones o anexos que forman parte del entregable final.

Por lo tanto:

- los procedimientos del auditor no deben verse como actividades aisladas,
- cada procedimiento debe entenderse como una pieza que contribuye de forma directa o indirecta al llenado del dictamen,
- y el trabajo del `product-agent` debe orientarse a entender cómo cada procedimiento se conecta con el entregable final.

---

## 2. Naturaleza del dictamen IMSS

El dictamen IMSS no es una sola tabla simple.

Es un sistema de captura y validación compuesto por:

- hojas de información patronal y de contexto,
- hojas de trabajadores y remuneraciones,
- hojas de cuotas y diferencias,
- hojas de variables,
- hojas de terceros o proveedores,
- hojas de clasificación empresarial,
- hojas condicionales para REPSE,
- hojas condicionales para constructoras,
- y hojas de control o soporte técnico del propio archivo.

Esto significa que el agente debe razonar sobre distintos tipos de hojas:

1. hojas que requieren captura más directa,
2. hojas que requieren procedimiento y transformación fuerte,
3. hojas que sirven como clasificación o contexto,
4. hojas que dependen de la naturaleza específica de la empresa.

---

## 3. Estructura general del dictamen

### 3.1 Hojas generales que aplican a todas las empresas

Actualmente, el conjunto base identificado incluye:

- Registros Patronales
- Remuneraciones pagadas
- Prestaciones otorgadas
- Cuotas pagadas al Instituto
- Personas físicas
- Sección A. Procesos de trabajo
- Sección B. Bienes y materias
- Sección C. Maquinaria y equipo
- Sección D. Equipo de transporte
- Sección E. Personal
- Balanza de comprobación
- Diferencias por dictamen
- Variables de remuneraciones
- Variables pagos por separación
- Variables otros ingresos
- Cédula de variables por bajas
- Cédula de proveedores
- C.E. Act. complementarias

### 3.2 Hojas condicionales para empresas prestadoras REPSE

Aplican a empresas dadas de alta en REPSE que prestan servicios especializados:

- Prestación de servicios especializados
- Info Perso servic espec propor

### 3.3 Hojas condicionales para empresas que contratan servicios especializados

Aplican a empresas que reciben o contratan servicios especializados:

- Subcontratación de servicios especializados
- Info Perso servic espec subcont

### 3.4 Hojas condicionales para constructoras

Aplican cuando la empresa es constructora:

- Relación obras const ejer dicta
- Info Personal construcción obra
- Sub obra o Sub ejec obra especi
- Presta trabajo ejec obra especi
- Info Perso ejecu obra especiali

---

## 4. Implicaciones para el razonamiento del agente

El `product-agent` debe entender que:

- no todas las empresas llenan exactamente las mismas hojas,
- existe un núcleo común de pruebas base,
- existen ramas adicionales según el tipo de empresa,
- y parte de la comprensión del procedimiento consiste en identificar a qué parte del dictamen contribuye el procedimiento documentado.

Cuando el agente documenta un SOP, debe preguntarse siempre:

1. ¿Este procedimiento contribuye a una hoja general o a una hoja condicional?
2. ¿La empresa auditada cae en algún supuesto especial (REPSE, contratante de servicios especializados, constructora)?
3. ¿Este procedimiento genera información que llega directo a una hoja del dictamen o primero alimenta otro procedimiento?

---

## 5. Relación entre procedimientos y dictamen final

No todos los procedimientos llegan de forma directa al dictamen final.

Hay procedimientos que:

- alimentan directamente una hoja o prueba del dictamen,
- generan un Excel o papel de trabajo intermedio,
- sirven de soporte para otro procedimiento,
- hacen cuadres, amarres, recálculos o verificaciones,
- o preparan información para que posteriormente otro procedimiento sí llene una prueba final.

Por lo tanto, el agente debe poder distinguir entre:

- procedimientos finales,
- procedimientos intermedios,
- procedimientos de soporte,
- procedimientos de validación,
- y procedimientos que generan documentación auxiliar.

La meta no es solo generar SOPs independientes, sino entender cómo se encadenan hacia el dictamen final.

---

## 6. Documentos y origen de datos

Uno de los elementos más importantes para el agente es entender los documentos involucrados en cada procedimiento.

Cuando el auditor mencione un documento, el agente debe tratar de entender:

- qué documento es,
- quién lo proporciona o quién lo genera,
- qué rol cumple en el procedimiento,
- y de dónde viene la información que alimenta ese documento.

### 6.1 Tipos principales de documento

El agente debe clasificar, al menos, entre:

- documentos proporcionados por el cliente,
- documentos generados por el auditor,
- documentos derivados o transformados desde otros procedimientos,
- documentos de soporte para cuadre, amarre o validación.

### 6.2 Origen de datos

El origen de los datos es obligatorio para entender el proceso.

Cada vez que se mencione un Excel, papel de trabajo o documento relevante, el agente debe tratar de determinar si la información proviene de:

1. información proporcionada por el cliente,
2. un Excel o documento generado en un procedimiento previo,
3. una transformación interna hecha por el auditor durante el procedimiento actual.

Si esto no queda claro, el agente debe insistir y pedir precisión.

No se deben dejar huecos importantes sobre el origen de los datos, porque eso impediría sistematizar correctamente la metodología.

---

## 7. Rol de los SOPs dentro del sistema

Cada SOP debe representar un procedimiento completo y trazable.

Eso significa que el SOP debe ayudar a entender:

- qué se hace,
- con qué documentos,
- con qué datos,
- para producir qué resultado,
- y cómo ese resultado contribuye, directa o indirectamente, al dictamen IMSS.

Los SOPs no deben verse como islas. Deben formar parte de una red de procedimientos que desemboca en el llenado del dictamen final.

---

## 8. Rol de la metodología como unidad principal de contexto

La unidad principal de contexto para el `product-agent` es la metodología.

La metodología normalmente está representada por una carpeta dentro de `01 Pruebas IMSS`, por ejemplo:

- `RCM Mazatlán`
- `RCM Mérida`
- u otras variantes por oficina y metodología

Varios auditores pueden trabajar bajo la misma metodología.
En ese caso, el contexto principal sigue siendo la metodología, no el auditor individual.

Por eso, antes de documentar un nuevo procedimiento, el agente debe leer:

- SOPs previos de la metodología,
- contexto marco del dictamen IMSS,
- matriz o documentos relacionales disponibles.

---

## 9. Relación con la matriz conceptual-operacional

El sistema futuro debe poder representarse como una matriz conceptual-operacional en la que:

- las filas representan pruebas o secciones del dictamen IMSS,
- las columnas representan metodologías y procedimientos,
- y las relaciones intermedias representan documentos, transformaciones y vínculos entre ambos.

Este documento marco no reemplaza esa matriz, pero sí la prepara.

La matriz deberá ayudar a visualizar:

- qué procedimiento alimenta qué prueba,
- qué documentos intervienen,
- cuáles documentos vienen del cliente,
- cuáles documentos son generados por el auditor,
- y qué procedimientos solo funcionan como soporte de otros.

---

## 10. Prioridad de esta primera iteración

En esta primera iteración, lo más importante es que el agente logre:

1. entender el dictamen IMSS como objetivo final,
2. entender la estructura general de hojas obligatorias y condicionales,
3. dejar de ver los procedimientos como piezas aisladas,
4. entender que cada documento y cada Excel debe rastrearse hasta su origen de datos,
5. empezar a ligar procedimientos, documentos y pruebas del dictamen.

---

## 11. Uso esperado de este documento

Este documento debe ser leído por el `product-agent` como contexto general antes de:

- analizar metodologías,
- documentar nuevos SOPs,
- clasificar documentos,
- o construir relaciones entre procedimientos y el dictamen final.

No es el documento final del sistema, sino el marco de referencia inicial para que el agente razone correctamente.
