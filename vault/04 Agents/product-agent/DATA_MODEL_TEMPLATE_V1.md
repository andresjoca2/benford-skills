# DATA_MODEL_TEMPLATE_V1.md

## Propósito
Plantilla base para modelar una prueba IMSS después de la extracción con auditor.

Este documento debe aterrizar:
- documentos de entrada,
- variables,
- tablas,
- transformaciones,
- outputs,
- reuso,
- y relación con la Plantilla IMSS o entregable final.

---

# Data Model — <Nombre de la prueba>

## Resumen ejecutivo
Explicar qué hace el pipeline, qué documentos entran, qué tablas se generan y cuál es el output final ligado a la plantilla o entregable correspondiente.

---

## 1. Documentos de entrada
Incluir por documento:
- nombre
- formato
- obligatoriedad
- quién lo usa
- si fue recibido y analizado
- notas

---

## 2. Variables extraídas por documento
Separar por documento y, cuando aplique, por bloques lógicos.

Para cada documento, listar:
- variables relevantes
- entidad o bloque lógico
- tabla a la que alimentarían
- notas importantes

---

## 3. Tablas de la base de datos
Separar por capas cuando aplique:
- contexto
- raw
- trabajo / transformaciones
- salida final

Para cada tabla, describir:
- propósito
- campos clave
- relaciones
- notas

---

## 4. Transformaciones
Describir cómo se pasa de una capa a otra.

Para cada transformación, incluir:
- input
- lógica
- validaciones
- output

---

## 5. Diagrama o flujo de datos
Representar el recorrido desde documentos raw hasta outputs finales.

---

## 6. Reglas de negocio críticas
Listar reglas que cambian el resultado del pipeline o condicionan cierres, validaciones, cruces o conciliaciones.

---

## 7. Reuso y relación con otros procedimientos
Explicar:
- qué tablas o outputs pueden reutilizarse
- qué piezas vienen de procedimientos previos
- qué piezas alimentan procedimientos posteriores

---

## 8. Relación con entregables finales
Explicar:
- si pega directo a la Plantilla IMSS
- si primero alimenta otro procedimiento
- qué hoja, prueba o entregable toca

---

## 9. Necesidades de almacenamiento / persistencia
Describir:
- qué archivos originales deben conservarse
- cómo se guardan
- qué persistencia necesitan las tablas
- qué trazabilidad mínima se requiere
