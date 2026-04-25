# Personas físicas

## Tipo
Sheet del entregable final gubernamental.

## Propósito
Documentar esta sheet del entregable `Portal IMSS Excel`.

## Resumen funcional inicial
Hoja que parece registrar operaciones o relaciones con personas físicas con posible relevancia para clasificación, prestación de servicios o tratamiento IMSS.

## Fila candidata de encabezados
- Fila 4

## Campos detectados preliminarmente
- A: Consecutivo
- B: RFC
- C: CURP
- D: Primer apellido
- E: Segundo apellido
- F: Nombre(s)
- G: Número de seguridad social
- H: Actividad o trabajo desempeñado por la persona física
- I: No. de meses en los que operó
- J: Monto de operaciones

## Muestra de filas posteriores
- Fila 5: A=1
- Fila 6: A=2 | C=Totales | I=Totales

## Variables inferidas
- nombre
- rfc
- curp

## Interpretación operativa inicial
- Hoja que parece registrar operaciones o relaciones con personas físicas con posible relevancia para clasificación, prestación de servicios o tratamiento IMSS.
- La hoja parece combinar información de identificación, captura y posiblemente cálculo o validación.
- Falta confirmar qué columnas son obligatorias, cuáles son condicionales y cuáles se alimentan desde otras pruebas.

## Pruebas posiblemente relacionadas
- `5.9`

## Documentos o fuentes probables
- contratos
- pagos a terceros
- relación de prestadores

## Transformaciones previas probables
- clasificación de contraparte
- depuración de personas físicas relevantes

## Preguntas abiertas
- ¿Esta fila candidata sí corresponde al encabezado operativo real?
- ¿Qué columnas son de captura manual, cuáles de arrastre y cuáles de cálculo?
- ¿Qué parte de esta sheet termina impactando directamente el entregable final y cuál solo sirve como soporte?

## Navegación
- [[../00 - Overview del entregable]]
- [[../01 - Estructura general]]
- [[../02 - Mapa prueba a sheet]]
- [[../03 - Variables globales]]
