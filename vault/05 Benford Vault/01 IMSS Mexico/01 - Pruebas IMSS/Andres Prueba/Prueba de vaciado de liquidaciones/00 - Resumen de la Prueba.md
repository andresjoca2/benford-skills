# 00 - Resumen de la Prueba

## Nombre de la prueba
Prueba de vaciado de liquidaciones

## Metodología
[[00 - Contexto de la Metodología]]

## Objetivo operativo
Reconstruir, folio por folio y por registro patronal, lo que se debía pagar al IMSS, RCV e INFONAVIT y amarrarlo contra el comprobante bancario, las cédulas y la emisión IDSE para dejar lista la hoja **Cuotas pagadas al Instituto** de la Plantilla fuente de Información Patronal.

## Qué valida
- que el pago se reconstruya por **folio** y no por mes consolidado
- que el **Total a Pagar** del amarre cuadre exacto contra el **Importe Comprobante**
- que la **Comprobación** quede en `0`
- que los bloques IMSS, RCV e INFONAVIT queden soportados con cédulas
- que el análisis **RT / EMA / AUD** quede visible para revisión
- que la salida sea trasladable a **Cuotas pagadas al Instituto** sin ajustes manuales adicionales

## Unidad real de control
La unidad de control de esta prueba es el **folio de liquidación** dentro de cada **registro patronal**.

No se consolida por mes para simplificar.
Si existen pagos complementarios, cada folio se trabaja en su propia fila.

## Output operativo
Tabla de amarre por folio en la hoja `amarre` del workbook `5.1 - Vaciado de liquidaciones - amarre.xlsx`.

Cada fila contiene, como mínimo:
- registro patronal
- folio
- periodo
- trabajadores
- días cotizados, de ausentismo y de incapacidad
- Total IMSS
- Total RCV
- Total INFONAVIT
- Total a Pagar
- Importe Comprobante
- Comprobación
- RT / EMA / AUD
- Clase y Fracción

## Output formal
Información lista para poblar la hoja **Cuotas pagadas al Instituto** de la Plantilla fuente de Información Patronal.

Lo que se traslada:
- trabajadores
- días
- importes IMSS
- importes RCV
- importes INFONAVIT
- totales pagados

## Documentos soporte que no viajan a la plantilla
- comprobantes bancarios
- cédula de determinación mensual
- cédula de determinación bimestral
- emisión IDSE (EMA / EBA)
- comparación RT / EMA / AUD
- análisis de diferencias
- explicación de complementarios o extemporáneos

## Conexiones con otras pruebas o procedimientos
### Hacia atrás
Existe relación con **ACUMSUA**.

ACUMSUA consolida en un solo Excel la información de los `.sua` del ejercicio por registro patronal.
Comparte fuente con esta prueba, pero no hace amarre folio por folio contra comprobante.

### Hacia adelante
La salida va directo a la hoja **Cuotas pagadas al Instituto**.
Además, esta prueba funciona como base para revisiones posteriores que dependen de cuotas pagadas o de sus cruces.

## Bifurcaciones relevantes
- pago complementario
- pago extemporáneo
- pago en partes
- primer año del cliente o del RP
- varios registros patronales
- faltan comprobantes bancarios
- falta declaración o datos de prima
- diferencias entre RT, EMA y AUD

## Pendientes reales
- Confirmar qué contiene y para qué sirve `PARTE C` dentro del workbook, porque la macro la puebla pero su uso no quedó documentado en este levantamiento.
- Confirmar si existe algún mecanismo formal de marcado de estatus dentro del workbook además del cierre operativo observado en la hoja `amarre`.

## Descripción corta para lector junior
La prueba de vaciado de liquidaciones reconstruye, folio por folio y por registro patronal, lo que se debía pagar al IMSS, RCV e INFONAVIT y lo amarra contra el comprobante bancario, las cédulas y la emisión IDSE para dejar lista la hoja de Cuotas pagadas al Instituto.
