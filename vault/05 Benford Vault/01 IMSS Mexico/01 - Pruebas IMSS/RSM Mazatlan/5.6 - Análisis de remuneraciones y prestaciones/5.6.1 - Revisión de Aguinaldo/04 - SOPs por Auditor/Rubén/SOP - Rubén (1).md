# SOP - Rubén

## Prueba
`5.6.1 Revisión de Aguinaldo`

## Resumen breve de la prueba
Esta prueba revisa si el aguinaldo pagado por la compañía durante 2024 fue correcto contra lo que auditoría recalcula con base en salario diario, antigüedad, criterio de días de aguinaldo y, cuando aplica, proporcionalidad por tiempo laborado.

La cédula final principal de la prueba es la hoja `Aguinaldo` del archivo `resultado/5.6.1 - Revisión de Aguinaldo - Servicios Administrativos Playa San Jose.xlsx`.

El cierre técnico principal de la prueba llega hasta la columna `P`. Las columnas posteriores se usan para validaciones adicionales cuando se reciben archivos de nómina y soporte documental.

## Objetivo de la prueba
Verificar que el pago de aguinaldo del ejercicio coincida con lo que le correspondía al trabajador y detectar diferencias a cargo de la compañía que deban considerarse como excedente para la prueba de salario base de cotización.

## Cómo sabe Rubén que la prueba quedó bien hecha
Rubén considera correctamente ejecutada la prueba cuando:
- el universo de aguinaldo ya fue identificado dentro de `5.10.2.1`
- la hoja `Aguinaldo` ya quedó trabajada hasta la columna `P`
- el recálculo por trabajador ya está hecho
- las diferencias a cargo ya quedaron identificadas
- ya se sabe qué casos alimentarían la prueba de salario base de cotización
- la validación muestral posterior contra recibos queda delimitada como fase documental adicional

## Cuándo aplica esta forma de ejecutar la prueba
Aplica para la variante de Rubén cuando existe:
- acumulado de nómina `5.10.2.1`
- archivo de factores de integración `5.6.0`
- papel de trabajo de la prueba `5.6.1`
- soporte muestral con recibos de nómina

## Factores que cambian el proceso
### Factores principales
- si la empresa tiene uno o varios registros patronales
- si el dato de días de aguinaldo ya viene identificado en `5.10.2.1` o no
- si el trabajador tiene menos de un año de antigüedad
- si existe diferencia a cargo o no
- si ya se cuenta con los recibos de nómina de la muestra

### Regla especial identificada en esta variante
Normalmente el dato base relevante viene en `5.10.2.1`. En este caso, para obtener el salario diario que sirve al recálculo, Rubén toma la quincena del periodo 23, correspondiente al 1 al 15 de diciembre, porque en el periodo 29 de aguinaldo no viene ese dato de forma útil para la prueba.

## Documentos y archivos necesarios

### Documentos obligatorios siempre
1. `documentos/5.10.2.1 - Acumulado de nómina con fórmulas - Servicios Administrativos Playa San Jose.xlsx`
2. `documentos/5.6.0 - Factores de integración - Servicios Administrativos Playa San Jose.xlsx`
3. `resultado/5.6.1 - Revisión de Aguinaldo - Servicios Administrativos Playa San Jose.xlsx`
4. recibos de nómina de la muestra solicitada conforme a la lógica de 4.5

### Documentos obligatorios según el caso
- soporte de la `5.1` cuando se necesita contexto de universo general o alcance de revisión
- criterios de prestaciones cuando la compañía sí los haya proporcionado expresamente
- documentación adicional de nómina para validaciones posteriores a la columna `P`

## Distinción de documentos
### Raw / fuente del cliente
- `documentos/5.10.2.1 - Acumulado de nómina con fórmulas - Servicios Administrativos Playa San Jose.xlsx`
- recibos de nómina de aguinaldo de la muestra

### Papel de trabajo real del auditor
- `documentos/5.6.0 - Factores de integración - Servicios Administrativos Playa San Jose.xlsx`
- `resultado/5.6.1 - Revisión de Aguinaldo - Servicios Administrativos Playa San Jose.xlsx`

### Output real de la prueba
- la hoja `Aguinaldo` trabajada hasta columna `P` dentro de `resultado/5.6.1 - Revisión de Aguinaldo - Servicios Administrativos Playa San Jose.xlsx`

## Dónde vive la data relevante

### 1) Acumulado de nómina `5.10.2.1`
Archivo: `documentos/5.10.2.1 - Acumulado de nómina con fórmulas - Servicios Administrativos Playa San Jose.xlsx`

Data relevante:
- columna `B`: tipo de periodo. Rubén filtra `A` para tomar el universo operativo de aguinaldo.
- columna `CX`: aguinaldo pagado normal. Esta es la columna que usa en esta prueba.
- columna `GU`: aguinaldo proporcional por finiquito. En esta variante no se usa para la prueba principal.
- columna del sueldo diario útil para el recálculo: se toma del periodo 23, quincena del 1 al 15 de diciembre.

Variables que se extraen:
- universo de trabajadores del periodo de aguinaldo
- importe de aguinaldo pagado normal
- sueldo diario
- fecha de ingreso / antigüedad
- datos base del trabajador

### 2) Factores de integración `5.6.0`
Archivo: `documentos/5.6.0 - Factores de integración - Servicios Administrativos Playa San Jose.xlsx`

Data relevante:
- tabla de factores por antigüedad
- criterio de días de aguinaldo

Variables que se extraen:
- días de aguinaldo que corresponden por antigüedad
- referencia de criterio para el recálculo

### 3) Papel de trabajo `5.6.1`
Archivo: `resultado/5.6.1 - Revisión de Aguinaldo - Servicios Administrativos Playa San Jose.xlsx`
Hoja principal: `Aguinaldo`

Columnas clave confirmadas:
- `N`: pagado según compañía
- `O`: aguinaldo según auditoría
- `P`: diferencia en pago
- `S`: importe CFDI, pero no forma parte del cierre técnico principal de esta prueba

Observación clave:
- para Rubén, la prueba principal llega hasta `P`
- de `Q` en adelante se usa cuando después se reciben archivos de nómina para validación adicional

## Proceso operativo paso a paso
1. Abrir `documentos/5.10.2.1 - Acumulado de nómina con fórmulas - Servicios Administrativos Playa San Jose.xlsx`.
2. Identificar el universo operativo filtrando la columna `B` por valor `A`, que significa aguinaldo.
3. Tomar ese universo como base de revisión de la prueba 5.6.1.
4. Ubicar el aguinaldo pagado normal en la columna `CX`.
5. No usar la columna `GU` para la prueba principal, porque corresponde al aguinaldo proporcional por finiquito.
6. Para determinar el sueldo diario, ir al periodo 23, quincena del 1 al 15 de diciembre.
7. Tomar de ahí el sueldo diario que servirá para recalcular el aguinaldo.
8. Abrir `documentos/5.6.0 - Factores de integración - Servicios Administrativos Playa San Jose.xlsx`.
9. Determinar cuántos días de aguinaldo le corresponden al trabajador según antigüedad y fecha de ingreso.
10. Si el colaborador tiene menos de un año, calcular el aguinaldo de forma proporcional.
11. La proporcionalidad se basa en días laborados del ejercicio sobre `365` para 2024, no sobre 366.
12. Abrir `resultado/5.6.1 - Revisión de Aguinaldo - Servicios Administrativos Playa San Jose.xlsx`.
13. Trabajar la hoja `Aguinaldo` y recalcular para cada trabajador el importe que auditoría considera correcto.
14. Comparar el importe pagado por la compañía contra el importe recalculado por auditoría.
15. Llevar la prueba técnica hasta la columna `P`.
16. Si la diferencia en `P` es positiva, tratarla como diferencia a cargo.
17. Si la diferencia en `P` es cero, considerar al trabajador correcto y sin ajuste.
18. Si la diferencia en `P` es negativa, no hacer ajuste dentro de esta prueba principal.
19. Enfocarse operativamente solo en las diferencias a cargo.
20. Solicitar y validar soporte documental de los recibos de nómina de la muestra conforme a la lógica heredada de 4.5.

## Reglas de cálculo y validación
### Regla de días de aguinaldo
- se determinan según antigüedad y fecha de ingreso
- cuando el trabajador tiene menos de un año, se calcula proporcionalmente

### Regla de proporcionalidad
- base del año: `365`
- no usar `366` para esta variante

### Regla de universo
- el universo técnico sale de `5.10.2.1` filtrando `B = A`
- la muestra documental posterior se pide conforme a la lógica de 4.5

### Regla de muestra documental
- Rubén toma la lógica de muestra de 4.5
- en este caso se solicitan 20 recibos de nómina
- esos 20 son soporte documental de muestra sobre el universo ya trabajado

## Casos especiales y bifurcaciones
### Caso 1. Empresa con un solo registro patronal
Cuando la empresa es de un solo registro patronal, cierta información puede venir apoyada desde 5.1.

### Caso 2. Empresa con varios registros patronales
Cuando hay varios registros patronales en el mismo acumulado, ese dato debe venir incluido en `5.10.2.1`.

### Caso 3. Dato de días de aguinaldo no proporcionado directamente
Si la compañía no proporcionó el dato directo de días, Rubén lo determina a partir del aguinaldo pagado entre el sueldo diario y lo cruza con antigüedad y fecha de ingreso.

### Caso 4. Diferencia positiva
Si `P` sale positiva, esa diferencia a cargo se considera excedente y alimenta la prueba de salario base de cotización.

### Caso 5. Diferencia negativa
No se trabaja como hallazgo principal en esta variante. El enfoque queda en diferencias a cargo únicamente.

## Resultado de la prueba
El resultado técnico principal de la prueba es:
- la hoja `Aguinaldo` trabajada hasta columna `P`
- con diferencias a cargo identificadas
- y con el excedente listo para alimentar la prueba de salario base de cotización cuando aplique

## Evidencia mínima de cierre
Rubén considera suficiente para cerrar el proceso técnico principal:
- la hoja `Aguinaldo` completa hasta `P`
- el universo ya revisado en la cédula
- y la definición de la validación muestral posterior con recibos de nómina

La revisión documental posterior existe, pero ya no cambia el cierre técnico principal de 5.6.1, sino que funciona como validación muestral conforme a 4.5.

## Relación con otras pruebas y entregables finales
### Relación con otras pruebas
- usa como fuente principal `5.10.2.1`
- usa como apoyo de criterio `5.6.0`
- hereda la lógica de validación muestral de `4.5`
- cuando hay diferencia positiva a cargo, alimenta la prueba de salario base de cotización

### Relación con entregables finales
Esta prueba no entra por sí sola directo al entregable final del dictamen. Su salida primero alimenta el análisis de salario base de cotización cuando existen excedentes de aguinaldo. Desde ahí impacta la integración de remuneraciones que después puede afectar plantillas y cédulas del flujo final.

## Fuentes y variante capturada en este SOP
Este SOP documenta exclusivamente la variante operativa de Rubén.

Puntos distintivos ya confirmados:
- la hoja final principal es `Aguinaldo`
- el cierre técnico principal llega hasta `P`
- `S = Importe CFDI` no se llena dentro de la prueba principal
- el universo sale de `5.10.2.1` filtrando `B = A`
- el aguinaldo pagado normal se toma de `CX`
- `GU` corresponde al aguinaldo proporcional de finiquito y no manda en esta prueba principal
- las diferencias positivas se mandan a salario base de cotización
- las diferencias negativas no son el foco de revisión

## Pendientes reales de cierre
No hay pendientes técnicos críticos declarados por Rubén para entender y ejecutar la prueba.

Pendiente operativo normal:
- conservar y validar los recibos de nómina de muestra como soporte documental de la fase de validación heredada de 4.5

## Resumen secuencial súper corto
1. Filtra `5.10.2.1` en columna `B = A` para quedarte solo con aguinaldo.
2. Toma de `CX` el aguinaldo pagado normal.
3. Toma el sueldo diario del periodo 23, quincena del 1 al 15 de diciembre.
4. Usa `5.6.0` para definir cuántos días de aguinaldo corresponden.
5. Si el trabajador tiene menos de un año, calcula proporcional con base 365.
6. Recalcula en la hoja `Aguinaldo` del archivo de resultado.
7. Lleva la prueba hasta columna `P`.
8. Si `P` es positiva, mándala a salario base de cotización.
9. Si `P` es cero, el caso está correcto.
10. Después valida documentalmente la muestra con recibos de nómina.

## Archivos de esta carpeta
### Documentos
- `documentos/5.10.2.1 - Acumulado de nómina con fórmulas - Servicios Administrativos Playa San Jose.xlsx`
- `documentos/5.6.0 - Factores de integración - Servicios Administrativos Playa San Jose.xlsx`
- `documentos/Índice de documentos del cliente - Rubén.md`

### Resultado
- `resultado/5.6.1 - Revisión de Aguinaldo - Servicios Administrativos Playa San Jose.xlsx`
