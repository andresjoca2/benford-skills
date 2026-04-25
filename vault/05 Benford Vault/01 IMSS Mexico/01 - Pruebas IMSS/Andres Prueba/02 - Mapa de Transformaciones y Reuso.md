# 02 - Mapa de Transformaciones y Reuso

## Propósito
Este documento mapea, a nivel metodología, cómo un documento o tabla entra a un procedimiento, qué transformación recibe y qué output reutilizable produce.

Complementa `[[01 - Inventario de Documentos y Tablas]]`.

Mientras el inventario enumera activos, este documento ayuda a visualizar flujo y reuso.

---

## Preguntas que este documento debe ayudar a responder
- ¿Qué input entra al procedimiento?
- ¿Qué transformación se le aplica?
- ¿Qué output produce?
- ¿Ese output se usa después en otra prueba o procedimiento?
- ¿Qué parte del dictamen IMSS alimenta directa o indirectamente?

---

## Tabla base de transformaciones

| Input | Tipo de input | Procedimiento | Transformación principal | Output | Uso posterior | Relación con dictamen IMSS | Notas |
|---|---|---|---|---|---|---|---|
| Disco de pago SUA (`.sua`) | documento del cliente | Prueba de vaciado de liquidaciones | vaciado por macro hacia `PARTE A`, `PARTE B`, `PARTE C`, `PARTE D` | base operativa por folio | consolidación en `amarre` | indirecta, vía Cuotas pagadas al Instituto | fuente base del procedimiento |
| `PARTE A` + `PARTE B` + `PARTE D` | tabla transformada | Prueba de vaciado de liquidaciones | consolidación por folio en hoja `amarre` | fila de amarre por folio | validación contra comprobante, cédulas e IDSE | directa, vía Cuotas pagadas al Instituto | `PARTE C` sigue pendiente de clasificación |
| Fila en `amarre` + comprobante bancario | documento derivado + documento del cliente | Prueba de vaciado de liquidaciones | amarre exacto de Total a Pagar vs Importe Comprobante | fila técnicamente cuadrada | validación documental posterior | directa, vía Cuotas pagadas al Instituto | la fila no cierra si no cuadra exacto |
| Cédula mensual + cédula bimestral | documento del cliente | Prueba de vaciado de liquidaciones | validación de bloques IMSS, RCV e INFONAVIT | fila soportada por concepto | soporte de revisión | directa, vía Cuotas pagadas al Instituto | mensual para IMSS, bimestral para RCV / INFONAVIT |
| Emisión IDSE + declaración anual / alta RT | documento del cliente | Prueba de vaciado de liquidaciones | construcción de análisis RT / EMA / AUD | análisis visible de prima por fila | hallazgos y revisión de diferencias | indirecta, soporte de la cuota pagada | no se corrigen diferencias en automático |
| Fila cerrada en `amarre` | output estructurado | Prueba de vaciado de liquidaciones | traslado a plantilla fuente | datos listos para hoja Cuotas pagadas al Instituto | alimentación de otras revisiones posteriores | directa | output formal principal de la prueba |

---

## Tipos de transformación que probablemente aparecerán
- traducción de archivo raw a tabla interna,
- homologación de variables,
- consolidación anual,
- agrupación por RP,
- cálculo o recálculo,
- amarre,
- cuadre,
- validación,
- generación de output intermedio reusable,
- generación de output final de procedimiento.

---

## Reglas de uso
Cada vez que se termine un SOP nuevo, revisar si el procedimiento:
1. crea una tabla nueva,
2. transforma una tabla existente,
3. genera un output reusable,
4. o depende de un output ya documentado antes.

Si sí, actualizar este documento.
