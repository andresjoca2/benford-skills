# SOP - Andres

## Prueba
Prueba de vaciado de liquidaciones

## Metodología
[[../../00 - Contexto de la Metodología]]

## Objetivo operativo
Reconstruir, folio por folio y por registro patronal, lo que se debía pagar al IMSS, RCV e INFONAVIT y amarrarlo contra el comprobante bancario, las cédulas y la emisión IDSE para dejar lista la hoja **Cuotas pagadas al Instituto** de la Plantilla fuente de Información Patronal.

## Resultado esperado
Dejar una tabla de amarre por folio en la hoja `amarre` del workbook `5.1 - Vaciado de liquidaciones - amarre.xlsx`, con soporte documental suficiente y con salida trasladable a **Cuotas pagadas al Instituto**.

## Documentos requeridos
### Obligatorios siempre
- Disco de pago SUA (`.sua`)
- Cédula de determinación mensual (PDF)
- Cédula de determinación bimestral (PDF)
- Comprobantes bancarios de pago SUA
- Emisión IDSE (EMA / EBA)
- Workbook `5.1 - Vaciado de liquidaciones - amarre.xlsx`

### Obligatorios según el caso
- Declaración anual de prima de riesgo de trabajo
- Alta del seguro de riesgos de trabajo
- Tarjeta de Identificación Patronal

## Hojas esenciales del workbook
- `PARTE A`  → identificación general
- `PARTE B`  → días
- `PARTE D`  → bloque económico
- `amarre`   → consolidación y validación por folio

## Paso a paso operativo

### 1. Preparar el alcance
1. Identificar cuántos registros patronales se van a auditar.
2. Identificar qué periodo cubre la auditoría.
3. Reunir el set documental completo antes de empezar.
4. Determinar si aplica escenario de primer año.
5. Tener listo el workbook de amarre.

### 2. Cargar el `.sua`
1. Cargar el archivo `.sua` al workbook mediante la macro.
2. Confirmar que la macro pobló `PARTE A`, `PARTE B`, `PARTE C`, `PARTE D` y `amarre`.
3. No avanzar todavía con comprobantes, cédulas ni análisis de prima.

### 3. Validar coherencia del vaciado inicial
#### En `PARTE A`
Confirmar:
- folio de liquidación
- registro patronal
- periodo
- trabajadores

Si el folio, RP o periodo no corresponden, detenerse y revisar el archivo fuente.

#### En `PARTE B`
Confirmar:
- días cotizados
- días de ausentismo
- días de incapacidad

Si hay valores en cero donde no deberían, o cifras desproporcionadas, revisar la corrida.

#### En `PARTE D`
Confirmar:
- componentes IMSS
- componentes RCV
- componentes INFONAVIT
- Total a Pagar

Si hay columnas corridas, importes incoherentes o campos en blanco, no seguir con esa corrida.

### 4. Formar y validar la fila en `amarre`
Armar o validar una fila por **folio**.

La fila debe contener:
- registro patronal
- folio
- periodo
- trabajadores
- días cotizados
- días de ausentismo
- días de incapacidad
- Total IMSS
- Total RCV
- Total INFONAVIT
- Total a Pagar
- Comprobación

Validar dos cosas antes de buscar el comprobante:
1. que los totales sean coherentes entre sí
2. que `Comprobación = 0`

Si hay descuadre aquí, el problema viene del vaciado del SUA y no se debe avanzar.

### 5. Buscar y aplicar el comprobante bancario
Buscar el comprobante por la combinación:
- RP
- periodo
- Total a Pagar

No buscarlo por folio SUA.

Del comprobante se usa principalmente:
- importe pagado
- fecha de pago
- referencias visibles si existen

Validar:
1. `Importe Comprobante = Total a Pagar`
2. `Comprobación = 0`

Si cualquiera falla, la fila no cierra.

### 6. Validar cédulas
#### Cédula de determinación mensual
Usarla para validar el bloque IMSS.

Cruzar:
- RP
- periodo
- importes IMSS
- RT usada en el pago cuando venga visible

#### Cédula de determinación bimestral
Usarla para validar RCV e INFONAVIT.

Cruzar:
- RP
- periodo bimestral
- RCV
- aportaciones
- amortizaciones
- INFONAVIT

Regla de periodicidad:
- meses impares: solo valida IMSS con la mensual
- meses pares: valida IMSS con mensual y además RCV e INFONAVIT con bimestral

### 7. Construir el análisis RT / EMA / AUD
#### RT
Prima realmente usada en el pago.
Fuente:
- cédula mensual cuando venga visible
- o SUA si la cédula no la refleja

#### EMA
Prima emitida por IDSE.
Fuente:
- Emisión IDSE (EMA / EBA)

#### AUD
Prima correcta según auditoría.
Regla:
- enero-febrero → prima anterior
- marzo-diciembre → prima declarada

Fuente principal:
- Declaración anual de prima de riesgo de trabajo

Si es primer año y no existe declaración utilizable:
- usar Alta del seguro de riesgos de trabajo
- usar Tarjeta de Identificación Patronal para confirmar RP

Capturar además:
- fracción en columna `AM`
- clase en columna `AN`
- prima media / RT en columna `AO`

No corregir RT ni EMA en automático. Las diferencias se dejan visibles como hallazgo.

### 8. Resolver excepciones o pendientes
#### Si la fila no cierra
Revisar, en lógica de menor a mayor costo:
1. si el comprobante sí corresponde
2. si falta otro comprobante
3. si hubo pago complementario
4. si hubo pago extemporáneo
5. si el set documental está incompleto
6. si el vaciado del SUA está mal
7. si hay diferencia RT / EMA / AUD

#### Reglas clave
- un pago complementario abre fila nueva
- un pago extemporáneo sigue amarrado a su periodo liquidado
- un pago en partes requiere todos los comprobantes
- si falta documento del cliente, eso es pendiente
- si todo está y no cuadra, eso es hallazgo

### 9. Cerrar la fila
Una fila se da por cerrada solo si cumple simultáneamente:
1. amarre reconstruido por folio
2. Total a Pagar = Importe Comprobante exacto
3. Comprobación = 0
4. soporte documental completo
5. análisis RT / EMA / AUD visible
6. salida trasladable a plantilla fuente sin ajustes manuales

Si falta cualquiera de los seis, la fila no está cerrada.

### 10. Trasladar salida formal
Cuando las filas ya están cerradas, la salida sirve para poblar la hoja **Cuotas pagadas al Instituto** con:
- trabajadores
- días
- importes IMSS
- importes RCV
- importes INFONAVIT
- totales pagados

## Criterios de cierre de la prueba
- reconstrucción por folio, no por mes
- importes exactos contra comprobante
- `Comprobación = 0`
- soporte documental suficiente por fila
- RT / EMA / AUD visible
- salida lista para trasladarse a la plantilla fuente

## Soporte mínimo por fila cerrada
### Siempre
- Disco de pago SUA (`.sua`)
- Comprobante bancario de pago SUA
- Cédula de determinación mensual
- Cédula de determinación bimestral cuando aplique
- Emisión IDSE (EMA / EBA)

### Según el caso
- Declaración anual de prima de riesgo de trabajo
- Alta del seguro de riesgos de trabajo
- Tarjeta de Identificación Patronal

## Relación con otras piezas
### Upstream
**ACUMSUA** comparte la fuente `.sua` del ejercicio y consolida por RP en acumulado anual.

### Downstream
La salida alimenta directamente **Cuotas pagadas al Instituto**.

## Pendientes reales
- Confirmar contenido y uso de `PARTE C`.
- Confirmar si existe marca formal de estatus dentro del workbook.
