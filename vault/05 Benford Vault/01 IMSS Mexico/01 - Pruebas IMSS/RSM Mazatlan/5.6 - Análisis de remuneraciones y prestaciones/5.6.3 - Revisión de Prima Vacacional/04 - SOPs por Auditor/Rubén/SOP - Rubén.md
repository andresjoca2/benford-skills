# SOP - Rubén

## Subprueba
`5.6.3 - Revisión de Prima Vacacional`

## Objetivo
Verificar que el pago de prima vacacional realizado por la compañía coincida con lo que corresponde según la antigüedad del trabajador, la tabla de factores de integración aplicable y las prestaciones ligadas al puesto. También se revisa que lo pagado corresponda con lo que se integra en el factor de integración fijo.

## Resultado correcto
La prueba queda correcta cuando el importe pagado por la compañía coincide contra el importe determinado por auditoría, o cuando la diferencia queda explicada. Si el trabajador tiene varias líneas de prima vacacional durante el año, se suman todos los pagos de la compañía y se comparan contra el importe de auditoría.

## Documentos y archivos usados en esta versión
### Documentos necesarios para ejecutar la prueba
Estos documentos viven dentro de la carpeta `documentos/` y se usan en este orden:
1. `documentos/5.6.2 Revisión de Vacaciones.xlsx`
   - Se usa para tomar el universo de trabajadores ya trabajados en la subprueba 5.6.2.
2. `documentos/5.10.2.1_SAP_ACUM_DE_NOM_CON_FOR_2024-1.xlsx`
   - Se usa para identificar conceptos de prima vacacional, periodos, cuota diaria, puesto, NSS y fecha de ingreso.
3. `documentos/5.6.0_FACTOR_DE_INTEGRACION_2024.xlsx`
   - Se usa para obtener los días de vacaciones y el porcentaje de prima vacacional aplicable según el tipo de factor y la antigüedad.

### Papel de trabajo final
El resultado final de esta prueba vive dentro de la carpeta `resultado/`:
- `resultado/Resultado - 5.6.3 Revisión de Prima Vacacional.xlsx`

### Dependencias lógicas
- `[[../../5.6.2 - Revisión de Vacaciones/00 - Resumen de la Prueba]]`
- `[[../../5.6.2 - Revisión de Vacaciones/04 - SOPs por Auditor/Rubén/SOP - Rubén]]`
- `[[../../5.6.0 - Factores de integración]]` _(si existe la nota específica)_
- `[[../../../5.1 - Vaciado de liquidaciones]]`

## Universo de trabajo
1. Partir de los trabajadores ya trabajados en `5.6.2 - Revisión de Vacaciones`.
2. Dentro de ese universo, identificar los trabajadores que tengan importe en cualquiera de estos conceptos:
   - `PRIMA_VACACIONAL_121`
   - `PRIMAS_VACACIONALES_NO_DISFRUTADAS_123`
   - `PRIMA VACACIONAL IMPORTE`
   - `PROP. PRIMA VACAC. IMPORTE`

## Variables que se toman
### Del acumulado de nóminas con formato
- Número de nómina → `F`
- Nombre del trabajador → `G`
- NSS / número de afiliación → `A`
- Puesto → `H`
- Fecha de ingreso → `Y`
- Periodo → `C`
- Cuota diaria → `J`

### Del contexto de otras pruebas/documentos
- Registro patronal → se toma como RP general de la empresa usando la referencia de `5.1`; no se hace cruce individual por trabajador en esta ejecución
- Tipo de factor → se liga al puesto y se obtiene de la pestaña `Puestos`, columna `B`
- Fecha de pago → se obtiene con el periodo usando la pestaña `PERIODOS` y se toma la fecha final del periodo

### Importe pagado por compañía según concepto
- `PRIMA_VACACIONAL_121` → `AJ`
- `PRIMAS_VACACIONALES_NO_DISFRUTADAS_123` → `CU`
- `PRIMA VACACIONAL IMPORTE` → `GO`
- `PROP. PRIMA VACAC. IMPORTE` → `GQ`

## Procedimiento paso a paso
1. Abrir el resultado de `5.6.2 - Revisión de Vacaciones` y tomar el universo de trabajadores ya trabajados ahí.
2. Abrir el acumulado de nóminas con formato e identificar, dentro de ese universo, qué trabajadores tienen importe en cualquiera de los conceptos de prima vacacional relevantes.
3. Armar la cédula de prima vacacional con las columnas base:
   - número de nómina
   - nombre del trabajador
   - RP
   - NSS
   - puesto
   - ID
   - fecha de ingreso
   - periodo
   - fecha de pago de prima vacacional
   - antigüedad
   - cuota diaria
   - días de vacaciones según factor
   - % de prima vacacional según factor
   - importe de auditoría
   - importe pagado por compañía
   - diferencia
4. Capturar el RP general de la empresa usando la referencia que ya quedó definida en `5.1 - Vaciado de liquidaciones`.
5. Identificar el puesto del trabajador y asignar el tipo de factor ligado a ese puesto.
6. Formar el ID como la unión de tipo de factor + antigüedad aplicable.
7. Tomar el periodo de la línea y buscarlo en la pestaña `PERIODOS` del acumulado para obtener la fecha final del periodo.
8. Usar la fecha final del periodo como fecha de pago de la prima vacacional.
9. Calcular la antigüedad con la fórmula de la cédula:
   - `(fecha de pago - fecha de ingreso) / 365`
   - y redondear al año aplicable según la lógica usada en el papel de trabajo.
10. Buscar en la tabla de factores los días de vacaciones y el % de prima vacacional que corresponden al ID armado.
11. Calcular el importe de prima vacacional de auditoría con la fórmula:

`días de vacaciones según factor × % prima vacacional según factor × cuota diaria`

12. Traer del acumulado el importe pagado por la compañía usando la columna que corresponda al concepto de esa línea.
13. Calcular la diferencia entre importe pagado por compañía e importe determinado por auditoría.
14. Si el trabajador tiene varias líneas en el año, sumar todos los pagos de la compañía y compararlos contra el importe de auditoría del trabajador.
15. Concluir si:
   - la diferencia queda en cero,
   - faltan días por disfrutar,
   - la compañía pagó de más,
   - o la diferencia debe revisarse por posible cuota diaria incorrecta u otra explicación.

## Bifurcaciones y reglas operativas
- Si la prima vacacional se paga al año o al disfrute, el procedimiento no cambia.
- Lo que sí cambia es la fecha de pago de cada línea, porque la antigüedad se recalcula a la fecha de pago correspondiente.
- No se abre una rama aparte por sindicato o prestaciones distintas dentro de esta ejecución; esa diferencia ya queda absorbida por la tabla de factores y el tipo de factor ligado al puesto.

## Interpretación de diferencias
### Si la compañía pagó de más
Las lecturas iniciales mencionadas por Rubén son:
- posible uso de cuota diaria incorrecta en auditoría, o
- pago por arriba de lo que correspondía por parte de la compañía.

### Si la diferencia no cuadra de inmediato
Comparar contra la compañía para entender el motivo antes de cerrar una conclusión definitiva.

## Output final
El output final es la cédula consolidada de prima vacacional:
- `Resultado - 5.6.3 Revisión de Prima Vacacional.xlsx`

Esta plantilla final no alimenta otra prueba.

## Evidencia mínima
- CFDI / recibos de nómina
- kárdex de vacaciones
- soporte documental

## Nota de uso
Este SOP documenta la versión operativa de Rubén para esta subprueba. No tratarlo todavía como criterio oficial universal.