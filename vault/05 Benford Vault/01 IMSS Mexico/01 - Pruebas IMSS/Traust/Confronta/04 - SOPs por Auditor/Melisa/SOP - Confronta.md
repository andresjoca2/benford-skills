# SOP - Confronta

## Prueba
Confronta

## Empresa o metodología
Traust

## Auditor
Melisa

## Resumen de la prueba
La prueba de Confronta consiste en comparar, por registro patronal, lo que se pagó en los archivos `.SUA` contra lo que aparece en las emisiones del IMSS, tomando la emisión como referencia de lo que debió pagarse y de los movimientos presentados ante el Instituto.

En esta variante de Melisa, la prueba se apoya en un papel de trabajo en Excel que cruza la base consolidada proveniente de `ACUMSUA` con las emisiones mensuales y bimestrales del cliente. El objetivo no es cargar este Excel directo al dictamen IMSS, sino anticipar si existen diferencias relevantes que más adelante alimentarán la prueba de **Revisión de Variables / SDI**.

## Objetivo operativo
Verificar que los pagos reflejados en el `.SUA` hagan sentido contra las emisiones del IMSS y detectar diferencias por trabajador que puedan anticipar pagos pendientes, reducciones de variables o revisiones posteriores en SDI.

## Qué valida realmente
Lo que valida esta prueba es que, por cada trabajador y por cada registro patronal:
- el total mensual del SUA coincida contra la EMA
- el total bimestral de RCV, aportación patronal y amortización coincida contra la EBA
- las diferencias relevantes queden identificadas y comentadas

## Resultado correcto de la prueba
El resultado correcto es un **Excel de confronta comentado por registro patronal**, con las comparaciones mensuales y bimestrales listas y con explicación en los casos donde exista diferencia relevante.

## Cómo sabe Melisa que quedó bien hecha
- Si ya se trabajó un Excel por cada registro patronal.
- Si en cada mes y bimestre ya quedó pegada la información consolidada por NSS único.
- Si las diferencias de 10 pesos o más ya fueron revisadas manualmente.
- Si cada diferencia relevante tiene comentario que explique su causa o su estatus.

## Factores que cambian el proceso
Los principales factores que cambian el proceso son:
- la cantidad de registros patronales de la empresa
- si las emisiones del cliente vienen en Excel o en PDF
- si existen NSS repetidos en una emisión
- si hay incapacidades o ausentismos
- si existen altas, bajas o modificaciones de salario
- si la diferencia es positiva o negativa

## Unidad de trabajo
La prueba se trabaja:
- por **registro patronal**
- por **mes** para EMA
- por **bimestre** para EBA
- dentro de un **Excel de confronta** por cada registro patronal

## Relación con otras pruebas
Esta prueba depende del resultado previo de `[[Traust/acumsua/04 - SOPs por Auditor/Nelly/SOP - Nelly|ACUMSUA]]`, porque desde ahí se toma la base consolidada de trabajadores.

A su vez, la Confronta no cierra un entregable final por sí sola, sino que funciona como insumo para una revisión posterior de:
- **SDI**
- **Revisión de Variables**

Su función es anticipar cómo viene la empresa respecto a diferencias que después podrían traducirse en revisión de variables o pagos adicionales.

## Relación con entregables finales
Esta prueba **no alimenta directo el dictamen final del IMSS**.

Su salida es un papel de trabajo intermedio que ayuda a entender si más adelante puede haber:
- diferencias a pagar
- revisión de variables
- ajustes que impacten otras pruebas posteriores dentro del flujo de SDI

## Documentos utilizados en esta variante

### Raw del cliente
1. **12 archivos `.SUA` del ejercicio**
   - Formato: `.sua`
   - Tipo: documento raw del cliente
   - Uso: fuente base de lo efectivamente pagado o cargado en SUA

2. **12 emisiones mensuales EMA**
   - Formato: `.xlsx` o `.pdf`
   - Tipo: documento raw del cliente
   - Uso: fuente de comparación mensual contra el SUA

3. **Emisiones bimestrales EBA**
   - Formato: `.xlsx` o `.pdf`
   - Tipo: documento raw del cliente
   - Uso: fuente de comparación bimestral para RCV, aportación patronal y amortización

### Papeles de trabajo reales del auditor
1. **ACUMSUA acumulado final**
   - Formato: `.xlsx`
   - Tipo: documento derivado / papel de trabajo previo
   - Uso: de aquí se extrae la hoja `Datos Trabajador` como base consolidada de trabajadores

2. **Excel de confronta**
   - Formato: `.xlsx`
   - Tipo: papel de trabajo real principal
   - Uso: cruzar la información del SUA contra EMA y EBA y documentar diferencias

## Documentos obligatorios siempre
- ACUMSUA final del registro patronal
- emisiones EMA del ejercicio
- emisiones EBA del ejercicio
- Excel de confronta por registro patronal

## Vista compacta de dónde vive la data relevante

### Documento: ACUMSUA acumulado final
- **Hoja `Datos Trabajador`**
  - contiene el acumulado de información de trabajadores proveniente del SUA
  - desde aquí se toma la base consolidada que se pega en la hoja `SUA` del papel de trabajo de confronta

### Documento: Excel de confronta
- **Hoja `SUA`**
  - contiene la base consolidada del ACUMSUA por trabajador y periodo
  - incluye columnas mensuales y bimestrales para comparar contra emisión

- **Hojas `EMA <mes>`**
  - contienen NSS único y total mensual por trabajador
  - comparan el total de emisión contra el total proveniente del SUA

- **Hojas `EBA <mes>`**
  - contienen NSS único y tres totales por trabajador:
    - subtotal RCV
    - aportación patronal
    - amortización

- **Hojas auxiliares `1`, `2`, `2A`, etc.**
  - guardan el detalle de cada emisión del cliente
  - las hojas solo con número corresponden a EMA
  - las hojas con número y letra `A` corresponden a EBA

### Documento: Emisión EMA
De la emisión EMA se toma, por NSS, el total de cuotas pagadas del trabajador.

Las variables que componen ese total son:
- cuota fija
- excedente patronal
- excedente obrero
- prestaciones en dinero patronal
- prestaciones en dinero obrero
- gastos médicos pensionados patronal
- gastos médicos pensionados obrero
- riesgos de trabajo
- invalidez y vida patronal
- invalidez y vida obrero
- guarderías y prestaciones sociales

Operativamente esto queda resumido en la columna **Suma** del EMA.

### Documento: Emisión EBA
De la emisión EBA se toman, por NSS, estos tres bloques:
- **Suma de Subtotal RCV**
- **Suma de Aportación Patronal**
- **Suma de Amortización**

## Variables exactas que se extraen
En esta prueba se extraen y reutilizan variables como:
- registro patronal
- NSS
- nombre del trabajador
- periodo
- mes
- número de movimientos
- último salario
- días mes
- días incapacidad mes
- días ausentismo mes
- total mensual SUA
- total EMA
- diferencia mensual
- días bimestre
- días incapacidad bimestre
- días ausentismo bimestre
- subtotal RCV
- aportación patronal
- amortización
- total EBA
- diferencia bimestral
- comentario

## Proceso operativo paso a paso

### Paso 1. Trabajar por registro patronal
La confronta se arma por registro patronal.

Si la empresa tiene varios RP, se repite el mismo proceso completo para cada uno.

### Paso 2. Tomar la base consolidada desde ACUMSUA
Melisa usa el archivo final de `ACUMSUA` y toma la pestaña **`Datos Trabajador`**.

Esa hoja ya trae el acumulado de trabajadores proveniente de los `.SUA` del ejercicio.

### Paso 3. Pegar la base en la hoja `SUA`
La información consolidada de `Datos Trabajador` se copia y se pega en la hoja **`SUA`** del papel de trabajo de confronta.

Esa hoja funciona como base principal para comparar contra las emisiones.

### Paso 4. Preparar cada emisión mensual EMA
Para cada mes con EMA:
1. se toma la emisión del cliente
2. se ordenan los datos
3. se conserva únicamente:
   - **NSS**
   - **total de cuotas pagadas**
4. si un NSS aparece repetido, se **suman los totales**
5. se deja una tabla final con **NSS únicos + total del trabajador**
6. esa tabla se pega en la hoja mensual correspondiente, por ejemplo `EMA ENERO`

### Paso 5. Preparar cada emisión bimestral EBA
Para cada bimestre con EBA:
1. se toma la emisión del cliente
2. se ordenan los datos
3. se conserva únicamente:
   - **NSS**
   - **Suma de Subtotal RCV**
   - **Suma de Aportación Patronal**
   - **Suma de Amortización**
4. si un NSS aparece repetido, se consolidan sus importes
5. se deja una tabla final con NSS únicos y esos tres totales
6. esa tabla se pega en la hoja bimestral correspondiente, por ejemplo `EBA FEB`

### Paso 6. Comparar SUA contra emisión
Con la base del SUA y la tabla consolidada de emisión ya pegadas, Melisa compara:
- en EMA: **SUA vs total EMA**
- en EBA: **SUA vs subtotal RCV / aportación patronal / amortización**

La comparación se hace por NSS.

### Paso 7. Detectar diferencias relevantes
Si la diferencia es menor a 10 pesos, en principio no se profundiza.

Si la diferencia es de **10 pesos o más**, ya se considera relevante y entra a revisión manual.

### Paso 8. Interpretar la diferencia
La lógica operativa explicada por Melisa es:
- si la diferencia es **positiva**, normalmente no hay mucho que hacer
- si la diferencia es **negativa**, es decir, el SUA es menor que la emisión, sí hay que justificar por qué se pagó de menos

### Paso 9. Revisar causas de justificación
Cuando la diferencia requiere revisión, Melisa revisa manualmente si la causa se explica por:
- días de incapacidad
- ausentismo
- alta
- baja
- cambio de salario
- pago de más
- pago de menos

En los casos de incapacidad o ausentismo, se revisa en el SUA si esos días existen y si con eso se puede justificar la diferencia.

### Paso 10. Documentar el comentario
Una vez entendida la causa, Melisa deja el comentario directamente en el Excel.

Los comentarios típicos pueden ser:
- baja
- alta
- incapacidad
- cambio de salario
- se pagó de más
- se pagó de menos

### Paso 11. Dejar listo el papel de trabajo para SDI
La prueba termina cuando ya quedó el Excel de confronta comentado por registro patronal y ese archivo ya puede usarse después como referencia para **Revisión de Variables / SDI**.

## Qué cambia según el caso

### Caso 1. Emisiones con NSS repetidos
Se deben sumar los importes antes de pegar la tabla final.

### Caso 2. Emisión en PDF
La emisión puede venir en PDF y de ahí también se puede identificar el detalle por trabajador, movimientos, días, salario y cuotas.

### Caso 3. Emisión en Excel
Cuando viene en Excel, esa información se refleja en las hojas auxiliares `1`, `2`, `2A`, etc. dentro del papel de trabajo.

### Caso 4. Diferencia por incapacidad o ausentismo
La diferencia puede justificarse revisando los días correspondientes en el SUA.

### Caso 5. Diferencia por movimiento o salario
Si existe alta, baja o modificación de salario, el auditor revisa manualmente qué pasó y deja comentario.

## Qué hacer si falta información o no cuadra
- Si falta una emisión del cliente, no se puede cerrar correctamente el mes o bimestre.
- Si la diferencia es de 10 pesos o más, no debe dejarse sin revisión.
- Si la diferencia es negativa, se debe intentar justificar.
- Si no queda clara la causa, debe quedar comentario explícito y mantenerse como revisión pendiente para la lectura posterior dentro de SDI.

## Resultado de la prueba
El resultado principal es:
- **Excel de confronta comentado por registro patronal**

Ese Excel no se carga al dictamen final, pero sí funciona como papel de trabajo para pruebas posteriores.

## Cómo se arma el resultado
El resultado se arma:
1. tomando la base consolidada desde ACUMSUA
2. pegándola en la hoja `SUA`
3. consolidando por NSS las emisiones EMA y EBA
4. pegando esa información en las hojas mensuales y bimestrales
5. comparando contra el SUA
6. revisando manualmente las diferencias relevantes
7. dejando comentarios de causa

## Evidencia mínima que demuestra que quedó bien
- que exista un Excel de confronta por cada RP
- que las hojas EMA y EBA ya tengan NSS únicos y totales consolidados
- que las diferencias de 10 pesos o más estén revisadas
- que las diferencias relevantes tengan comentario

## Pendientes reales de cierre
La prueba no queda cerrada de forma ideal si falta cualquiera de estos elementos:
- ACUMSUA del registro patronal
- emisiones EMA o EBA necesarias
- explicación de diferencias relevantes

## Fuentes y variantes relevantes dentro de esta variante
Esta variante corresponde a **Melisa** dentro de la metodología **Traust**.

Los rasgos más importantes de esta versión son:
- reutilizar la base previa de `ACUMSUA`
- trabajar por RP
- consolidar emisiones por NSS único
- usar un umbral operativo de 10 pesos para revisar diferencias
- dejar comentarios manuales como salida principal
- usar la confronta como insumo de SDI y revisión de variables, no como output final del dictamen

## Archivos de esta carpeta
Los documentos de esta variante viven en esta misma carpeta del auditor:
- `documentos/ACUMSUA acumulado final - ejemplo.xlsx`
- `documentos/Emisión EMA - ejemplo.pdf`
- `documentos/Emisión EBA - ejemplo.pdf`
- `resultado/Papel de trabajo Confronta - ejemplo.xlsx`

## Resumen secuencial ultra claro
1. Tomas el ACUMSUA del RP.
2. Copias la hoja `Datos Trabajador`.
3. La pegas en la hoja `SUA` del papel de confronta.
4. Tomas cada EMA del cliente.
5. Dejas NSS único y total de cuotas por trabajador.
6. Pegas eso en la hoja mensual correspondiente.
7. Tomas cada EBA del cliente.
8. Dejas NSS único con subtotal RCV, aportación patronal y amortización.
9. Pegas eso en la hoja bimestral correspondiente.
10. Comparas contra el SUA.
11. Si la diferencia es de 10 pesos o más, la revisas manualmente.
12. Si se puede justificar por incapacidad, ausentismo, alta, baja o cambio de salario, lo documentas.
13. Dejas el comentario en el Excel.
14. El resultado final es el Excel de confronta por RP para apoyar la prueba de SDI.
