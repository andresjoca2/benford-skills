# FORMATO_ESTRUCTURAL_SOP_EN_VAULT.md

## Propósito
Formalizar el formato estructural mínimo que debe dejar cada SOP dentro del vault de Auditoría IMSS.

La idea no es inventar una arquitectura nueva, sino usar de forma consistente la estructura que ya existe y replicar el patrón correcto en cada prueba.

---

## 1. Regla general
Dentro de `IMSS Vault > Auditoría del IMSS > 01 - Pruebas IMSS`, cada carpeta raíz representa una metodología.

Dentro de cada metodología deben vivir:
- los documentos de contexto metodológico,
- y las carpetas de pruebas o procedimientos.

---

## 2. Contexto metodológico
Dentro de cada metodología deben existir, cuando aplique:
- `00 - Contexto de la Metodología.md`
- `01 - Inventario de Documentos y Tablas.md`
- `02 - Mapa de Transformaciones y Reuso.md`

Estos documentos se actualizan conforme se generan SOPs nuevos.

---

## 3. Estructura esperada dentro de cada prueba
Dentro de cada prueba o procedimiento, la estructura por auditor debe seguir el patrón correcto ya usado en casos buenos como `acumsua`.

La lógica mínima es:
- carpeta del auditor
- carpeta con documentos
- carpeta con resultado
- archivo del SOP

---

## 4. Formato mínimo por auditor
Dentro de la carpeta del auditor, cada SOP nuevo debe procurar dejar al menos:

### 4.1 Carpeta de documentos
Aquí deben vivir:
- documentos del cliente usados en la prueba,
- Excels o papeles de trabajo utilizados,
- documentos generados o consumidos para ejecutar la prueba,
- cualquier insumo necesario para entender o reproducir el procedimiento.

### 4.2 Carpeta de resultado
Aquí debe vivir:
- el resultado final del procedimiento,
- ya sea Excel, archivo final, cédula, papel de trabajo final u otro output principal,
- y el SOP correspondiente de la prueba.

### 4.3 Archivo del SOP
Debe existir el archivo `SOP - <Nombre de la prueba>.md` siguiendo el naming acordado.

---

## 5. Regla de actualización al terminar un SOP
Cada vez que se genere o actualice un SOP, el agente debe revisar si también hay que actualizar:
- el contexto de la metodología,
- el inventario de documentos y tablas,
- el mapa de transformaciones y reuso,
- y otros documentos relacionales que correspondan.

No basta con guardar el SOP aislado.

---

## 6. Qué NO debe mezclarse aquí
Los documentos globales del sistema, como:
- contexto general del dictamen IMSS,
- catálogo de hojas y variables,
- taxonomía documental,
- reglas de origen de datos,
- protocolo de comunicación con auditores,
- plantilla general de SOP,

no deben duplicarse dentro de cada metodología, porque pertenecen al contexto global del agente.

---

## 7. Criterio de éxito
La estructura estará bien usada si, al abrir una metodología y luego una prueba, se puede ver con claridad:
- cuál es el contexto metodológico,
- qué documentos se usaron,
- cuál es el resultado final,
- cuál es el SOP,
- y qué otros documentos del sistema deben haberse actualizado después.
