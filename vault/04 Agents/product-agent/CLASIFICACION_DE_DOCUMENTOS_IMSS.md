# CLASIFICACION_DE_DOCUMENTOS_IMSS.md

## Propósito
Definir una taxonomía documental base para el `product-agent` IMSS.

Esta taxonomía sirve para que el agente pueda:
- clasificar correctamente los documentos mencionados por el auditor,
- distinguir entre documentos externos, documentos de trabajo y activos internos del sistema,
- ligar documentos con procedimientos y pruebas,
- y construir trazabilidad útil para SOPs, metodologías y reuso posterior.

---

## 1. Principio general
No todo lo que aparece en un procedimiento debe tratarse como el mismo tipo de objeto.

Hay que distinguir, al menos, entre:
- documentos externos,
- documentos de trabajo del auditor,
- documentos derivados de otros procedimientos,
- documentos de soporte,
- y activos internos del sistema.

Una cosa es el documento que menciona el auditor.
Otra cosa es la tabla o estructura interna que el sistema deriva a partir de ese documento.

---

## 2. Categorías principales

### 2.1 Documentos externos del cliente
Documentos o archivos entregados por el cliente o recibidos desde fuera del procedimiento del auditor.

Ejemplos típicos:
- SUA / UAS
- balanza
- auxiliares
- nómina
- CFDI
- comprobantes de pago
- contratos
- layouts o reportes del cliente

### 2.2 Documentos de trabajo del auditor
Archivos o papeles de trabajo construidos o mantenidos por el auditor como parte del procedimiento.

Ejemplos típicos:
- Excel operativo
- papel de trabajo
- cédula de conciliación
- amarre
- recálculo
- concentrado
- cédula resumen
- archivo anualizado

### 2.3 Documentos derivados de procedimientos previos
Documentos que no vienen directamente del cliente, sino que ya son resultado de otro procedimiento anterior.

Ejemplos típicos:
- acumulado generado antes
- concentrado derivado
- tabla exportada a Excel para otra prueba
- output de un SOP previo

### 2.4 Documentos de soporte, control o validación
Documentos que no necesariamente alimentan directo al dictamen, pero sirven para:
- cuadre,
- validación,
- revisión,
- control,
- soporte,
- o justificación.

Ejemplos típicos:
- amarre global
- conciliación de diferencias
- recálculo de validación
- papel de soporte

### 2.5 Activos internos del sistema
Estos no son necesariamente documentos que el auditor mencione como tal. Son abstracciones internas construidas por el sistema para representar y reutilizar información.

Ejemplos típicos:
- tabla raw interna
- tabla transformada
- output estructurado reusable
- vista derivada
- consolidado interno

---

## 3. Dimensiones de clasificación
Cada documento relevante debería intentar clasificarse en varias dimensiones, no solo una.

### 3.1 Origen
- cliente
- auditor
- procedimiento previo
- sistema
- pendiente de confirmar

### 3.2 Rol dentro del procedimiento
- input principal
- input auxiliar
- output principal
- output intermedio
- soporte / validación
- control
- pendiente de confirmar

### 3.3 Estado estructural
- raw
- parcialmente transformado
- transformado
- consolidado
- reusable
- pendiente de confirmar

### 3.4 Formato
- Excel
- PDF
- papel de trabajo
- layout
- reporte
- tabla interna
- otro

---

## 4. Reglas de interpretación
### 4.1 Documento vs tabla
Si el auditor menciona un Excel, eso no implica automáticamente que el sistema lo deba tratar solo como documento final.

El agente debe evaluar si ese Excel:
- se conserva como documento,
- se traduce a una tabla raw,
- se transforma a una tabla derivada,
- o produce un output reusable.

### 4.2 No asumir reuso sin base suficiente
Que un documento parezca útil para otro procedimiento no significa que el reuso ya esté validado.

Usar niveles de certeza:
- claro,
- inferido con alta confianza,
- inferido con baja confianza,
- pendiente.

### 4.3 El auditor no define la estructura interna del sistema
El auditor describe documentos, flujo, uso, validaciones y outputs.

La traducción a:
- tablas,
- variables,
- transformaciones,
- y activos reutilizables
la hace el sistema.

---

## 5. Registro mínimo sugerido por documento
Cuando sea posible, registrar:
- nombre del documento,
- categoría principal,
- origen,
- rol,
- formato,
- procedimiento donde entra,
- procedimiento que lo genera,
- si se traduce a tabla raw,
- si se transforma después,
- output asociado,
- reuso potencial,
- nivel de certeza,
- observaciones.

---

## 6. Uso esperado en el sistema
Esta taxonomía debe usarse para alimentar:
- SOPs nuevos,
- inventarios de documentos y tablas por metodología,
- mapas de transformaciones y reuso,
- trazabilidad entre procedimientos,
- y futuras relaciones con la matriz conceptual-operacional.

---

## 7. Regla práctica para entrevistas
Durante la entrevista con el auditor, el agente debe enfocarse en entender:
- qué documento usa,
- quién lo entrega o lo genera,
- cómo se alimenta,
- cómo se usa,
- qué output produce,
- y qué procedimiento previo o posterior toca.

La abstracción estructural interna viene después y la construye el sistema.
