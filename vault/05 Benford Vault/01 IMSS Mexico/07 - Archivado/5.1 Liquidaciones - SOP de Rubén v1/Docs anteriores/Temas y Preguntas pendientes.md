# Temas y Preguntas pendientes

## Estado general
La extracción de la prueba **5.1 - Vaciado de liquidaciones**, versión operativa de **Rubén**, sí quedó cerrada para documentación.

Los puntos de abajo no bloquean el entendimiento operativo principal, pero sí conviene dejarlos visibles como pendientes documentales o de implementación futura.

## Pendientes documentales
- Conseguir y agregar un **ejemplo real de Alta del seguro** para cerrar ese caso condicional dentro de la biblioteca documental.
- Reubicar la documentación de Rubén dentro de una carpeta propia en `04 - SOPs por Auditor/Rubén/` para alinear la estructura con la convención actual.
- Crear `Índice de documentos del cliente - Rubén.md` y vincularlo a las ubicaciones reales de los raw en `02 - Documentos y Ejemplos/`.
- Renombrar o migrar `03 - Preguntas Abiertas.md` a `03 - Temas y Preguntas pendientes.md` dentro de la prueba 5.1.

## Pendientes de biblioteca documental
- Validar si ya existen en la biblioteca global las carpetas por tipo documental para:
  - Disco de pago SUA
  - Cédula mensual
  - Cédula bimestral
  - Comprobantes bancarios de pago SUA
  - Emisión EMA/EBA
  - Declaración de Prima de Riesgo de Trabajo
  - Alta del seguro
- Incorporar a la biblioteca documental los archivos reales ya identificados en esta sesión.
- Crear o completar los índices `.md` dentro de `Documentos ejemplo/` para saber de qué empresa es cada documento y en qué prueba se usó.

## Temas operativos que conviene validar después
- Confirmar si en todos los casos de Rubén el output de 5.1 solo alimenta formalmente **Cuotas pagadas al Instituto** o si alguna prueba posterior también reutiliza esta salida como dependencia directa.
- Confirmar si Rubén usa algún otro papel de trabajo real además del workbook de metodología / amarre cuando el caso se complica.
- Validar si existe una versión más formal o reusable del parser / macro del SUA, dado que el proceso depende mucho de ese vaciado.

## Casos condicionales que deben quedar vigilados
- Primer año del cliente en auditoría IMSS: puede requerir Alta del seguro en vez de Declaración de Prima utilizable.
- Pago complementario: abre fila nueva si existe folio y soporte propios.
- Pago extemporáneo: no cambia el periodo de la liquidación, pero sí cambia la lógica de búsqueda documental.
- Diferencias RT / EMA / AUD: deben quedar visibles y no resolverse en automático.

## Recordatorio de criterio de cierre
La prueba solo se considera cerrada cuando cada fila por folio queda:
- explicada;
- soportada documentalmente;
- cuadrada en cero;
- lista para poblar **Cuotas pagadas al Instituto**.
