# 00 - Contexto de la Metodología

## Propósito
Este documento funciona como hub de contexto para la metodología `Andres Prueba`.

Su objetivo es ayudar a entender:
- qué lógica metodológica agrupa esta carpeta,
- qué procedimientos ya existen dentro de esta metodología,
- qué documentos aparecen de forma recurrente,
- qué tablas o estructuras de datos internas se van identificando,
- y cómo esta metodología converge al dictamen IMSS final.

---

## Qué representa `Andres Prueba`
`Andres Prueba` debe interpretarse como una **metodología** dentro de `01 - Pruebas IMSS`.

Eso significa que:
- las carpetas y procedimientos aquí contenidos pertenecen a una misma línea metodológica,
- el contexto base debe cargarse a este nivel antes de documentar un SOP nuevo,
- y las diferencias por auditor deben entenderse primero como variantes dentro de esta metodología.

---

## Regla operativa
Antes de documentar un procedimiento nuevo dentro de `Andres Prueba`, se debe revisar:
- este documento,
- `[[01 - Inventario de Documentos y Tablas]]`,
- `[[02 - Mapa de Transformaciones y Reuso]]`,
- y los SOPs o procedimientos ya existentes dentro de esta metodología.

---

## Procedimientos / carpetas actualmente detectados
- [[Prueba de vaciado de liquidaciones/00 - Resumen de la Prueba|Prueba de vaciado de liquidaciones]]

## Lectura metodológica actual
Por ahora, dentro de `Andres Prueba`, ya se identificó una primera prueba base:
- **Prueba de vaciado de liquidaciones**

Esta prueba:
- reconstruye el pago por **folio** y por **registro patronal**,
- usa como fuente base el `.sua` del ejercicio,
- amarra contra comprobante bancario, cédulas y emisión IDSE,
- y deja lista la salida hacia **Cuotas pagadas al Instituto**.

También se identificó una relación importante con **ACUMSUA**:
- ambas piezas comparten los `.sua` del ejercicio como fuente,
- pero ACUMSUA consolida por RP en acumulado anual,
- mientras que vaciado de liquidaciones amarra folio por folio.

---

## Lógica metodológica inicial
Pendiente de documentar con mayor precisión:
- objetivo general de la metodología,
- orden típico de ejecución de procedimientos,
- documentos fuente más recurrentes,
- outputs intermedios más importantes,
- relación entre procedimientos,
- relación con hojas concretas del dictamen IMSS.

---

## Documentos y tablas reutilizables
La capa compartida de la metodología vive principalmente en:
- [[01 - Inventario de Documentos y Tablas]]
- [[02 - Mapa de Transformaciones y Reuso]]

Estos documentos deben crecer conforme se documenten SOPs nuevos.

---

## Uso esperado
Este documento debe servir como punto de entrada para:
- entender rápidamente la metodología,
- ubicar procedimientos ya existentes,
- evitar arrancar entrevistas desde cero,
- y mantener una visión conectada entre procedimientos, documentos, tablas y outputs.
