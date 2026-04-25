# Cambios a Obsidian - prueba 5.1 - Rubén

## Objetivo de este documento
Registrar propuestas de actualización documental, estructural y de linking derivadas de la extracción de conocimiento de la prueba **5.1 - Vaciado de liquidaciones**, versión operativa de **Rubén**.

## Cambio principal de estructura por auditor
La carpeta `04 - SOPs por Auditor/` de la prueba 5.1 todavía no está separada por auditor como pide la estructura actual.

### Propuesta
Crear carpeta específica:
- `04 - SOPs por Auditor/Rubén/`

Y mover o concentrar ahí:
- `SOP - Rubén.md`
- `Índice de documentos del cliente - Rubén.md`
- `Cambios a Obsidian - prueba 5.1 - Rubén.md`
- `Temas y Preguntas pendientes.md`
- workbook real de metodología / amarre de Rubén
- demás papeles de trabajo reales de Rubén, si aparecen después

## Cambio de naming pendiente en la prueba
Actualmente la prueba 5.1 todavía trae el archivo:
- `03 - Preguntas Abiertas.md`

### Propuesta
Alinear al naming actualizado:
- `03 - Temas y Preguntas pendientes.md`

## Índice de documentos del cliente por auditor
La estructura actual de 5.1 no muestra todavía:
- `Índice de documentos del cliente - Rubén.md`

### Propuesta
Crear ese índice dentro de la carpeta de Rubén para que apunte a la ubicación concreta de cada documento raw dentro de `02 - Documentos y Ejemplos/`.

## Biblioteca documental global a reforzar
La prueba 5.1 depende de un conjunto muy claro de documentos raw. No basta con mencionar sus nombres en notas; deben quedar representados como **archivos reales** dentro de la biblioteca documental.

### Tipos documentales a incorporar o validar dentro de `02 - Documentos y Ejemplos/`
- Disco de pago SUA
- Cédula mensual
- Cédula bimestral
- Comprobantes bancarios de pago SUA
- Emisión EMA/EBA
- Declaración de Prima de Riesgo de Trabajo
- Alta del seguro

## Estructura documental sugerida por tipo documental
Para cada tipo documental anterior, validar o crear dentro de `02 - Documentos y Ejemplos/`:
- nota `.md` principal del tipo documental explicando qué es y para qué sirve;
- carpeta `Documentos ejemplo/`;
- archivos raw reales dentro de `Documentos ejemplo/`;
- índice `.md` dentro de `Documentos ejemplo/` indicando:
  - empresa;
  - periodo;
  - prueba(s) en que se usó;
  - observaciones relevantes.

## Documentos raw ya identificados con ejemplo real en esta sesión
Se identificaron ejemplos reales de:
- disco de pago SUA;
- cédula mensual;
- cédula bimestral;
- emisión EMA/EBA;
- comprobante bancario;
- declaración de prima de riesgo.

### Propuesta
Incorporar esos archivos reales a la biblioteca documental correspondiente y registrarlos en su índice.

## Documento raw faltante como ejemplo real
Sigue faltando ejemplo real de:
- Alta del seguro

### Propuesta
No marcarlo como faltante universal de la prueba 5.1.
Tratarlo como documento condicional y dejar explícito en su índice / documentación que solo aplica cuando:
- es primer año del cliente en auditoría IMSS;
- no existe declaración utilizable;
- o todavía no se tiene información histórica suficiente.

## Papel de trabajo real del auditor que debe quedar incorporado en carpeta de Rubén
Identificado en esta sesión:
- workbook de metodología / amarre de Rubén

### Propuesta
Ese archivo no debe representarse con una nota falsa. Debe quedar como archivo real dentro de la carpeta de Rubén.

## Ajustes sugeridos al resumen y fuentes de la prueba
### 00 - Resumen de la Prueba.md
Agregar o reforzar:
- que 5.1 es **prueba principal**;
- que su output operativo es una **tabla de amarre por folio**;
- que su output formal es la preparación de la hoja **Cuotas pagadas al Instituto**;
- que la unidad real de validación es el **folio**, no el mes consolidado.

### 02 - Fuentes y Variantes.md
Agregar o reforzar:
- unidad documental: RP;
- unidad de cruce: periodo;
- unidad de amarre: folio;
- diferencia funcional entre cédula mensual y bimestral;
- rol de RT / EMA / AUD;
- condición especial del alta del seguro.

## Cambios propuestos al contenido documental general del sistema IMSS
### 1. Documentar explícitamente la jerarquía RP / periodo / folio
Se detectó que esta prueba no debe describirse como “cuadre por mes”.

### Propuesta
Agregar a hubs o notas relacionadas con pruebas de liquidaciones:
- RP = organización documental
- periodo = búsqueda y cruce de evidencia
- folio = unidad real de amarre y validación

### 2. Documentar la regla de búsqueda de comprobantes
Se detectó una regla operativa muy importante:
- el comprobante bancario **no se busca por folio SUA**;
- se busca por **RP + periodo + importe total a pagar**.

### Propuesta
Agregar esta regla en notas generales sobre pruebas de liquidaciones y pruebas relacionadas con pagos.

### 3. Documentar la diferencia entre RT, EMA y AUD
### Propuesta
Agregar una nota o reforzar una existente que explique:
- **RT** = prima efectivamente usada en el pago;
- **EMA** = prima emitida por sistema IDSE;
- **AUD** = prima correcta según auditoría;
- que la diferencia no se corrige automática; se deja visible para investigación.

### 4. Documentar que el parser / macro del SUA es parte crítica del proceso
Se detectó que la prueba depende fuertemente del vaciado automático del `.sua`.

### Propuesta
Agregar al sistema documental que:
- el workbook de Rubén depende de macro / parser;
- si PARTE A, B o D fallan, no se considera corrida confiable;
- se requiere validación manual del vaciado antes de confiar en el amarre.

## Relación con otras pruebas
Hasta esta sesión quedó claro que:
- 5.1 es una prueba base;
- por ahora no depende de pruebas anteriores;
- otras pruebas podrán relacionarse con su output.

### Propuesta
Dejar link explícito desde futuras pruebas relacionadas hacia 5.1 cuando reutilicen:
- output de cuotas pagadas;
- lógica de folios;
- cruce de RT / EMA / AUD;
- comprobantes bancarios.

## Propuestas para el índice de documentos ejemplo
Cuando se suban los documentos raw a la biblioteca documental, el índice de cada tipo documental debería capturar al menos:
- empresa;
- RP;
- periodo;
- auditor que lo usó;
- prueba donde se utilizó;
- si el documento fue obligatorio o condicional;
- si se usó para cierre total o parcial.

## Observación final
La prueba 5.1 de Rubén ya quedó suficientemente levantada para documentación formal. Los cambios propuestos aquí buscan:
- evitar que los documentos queden huérfanos;
- separar correctamente raw del cliente vs papel de trabajo del auditor;
- dejar trazabilidad clara entre archivos reales, prueba, auditor y uso operativo.
