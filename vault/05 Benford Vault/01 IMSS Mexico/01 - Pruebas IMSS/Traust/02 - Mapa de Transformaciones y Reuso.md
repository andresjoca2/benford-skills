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
| SUA / UAS mensual o bimestral | Documento del cliente | `acumsua` (por confirmar alcance exacto) | Traducción a tabla interna + consolidación / anualización | Tabla consolidada anual o acumulado usable | Puede alimentar procedimientos posteriores | Indirecta, por confirmar según prueba final que consuma el output | Caso base planteado por Andrés; falta documentar variables y forma exacta de consolidación |

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

---

## Pendientes actuales
- poblar el mapa con casos reales de `Traust`,
- identificar relaciones entre carpetas/procedimientos ya existentes,
- y conectar estos flujos con pruebas concretas del dictamen IMSS cuando ya se conozca la relación exacta.
