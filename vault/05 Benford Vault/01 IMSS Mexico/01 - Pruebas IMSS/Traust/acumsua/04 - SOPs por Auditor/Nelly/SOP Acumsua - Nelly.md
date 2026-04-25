# SOP - Nelly

## Prueba
ACUMSUA

## Empresa o metodología
Traust

## Auditor
Nelly

## Resumen de la prueba
La prueba de ACUMSUA consiste en consolidar en un solo Excel toda la información contenida en los archivos `.SUA` de un registro patronal durante el ejercicio. Ese acumulado sirve como base para pruebas posteriores y para extraer insumos de cuotas pagadas, altas, bajas, movimientos afiliatorios, trabajadores topados, aportaciones, amortizaciones, días trabajados, incapacidades, ausentismos y total de cotizantes.

En esta variante de Nelly, el resultado principal no es un dictamen final ni un reporte narrativo, sino un **Excel acumulado** que concentra la información del ejercicio por registro patronal y deja lista la base operativa para revisiones posteriores.

## Objetivo operativo
Armar un acumulado anual por registro patronal a partir de los archivos `.SUA` entregados por el cliente, traduciéndolos a Excel y consolidando sus datos en un solo archivo final que sirva como fuente operativa para otras pruebas del sistema.

## Qué valida realmente
Lo principal que valida esta prueba es que el acumulado de los archivos `.SUA` quede correctamente armado y usable para pruebas posteriores.

Cuando existen comprobantes de pago, también se puede validar que los totales acumulados coincidan con lo efectivamente pagado. Si no hay comprobantes, el ACUMSUA igual se arma y se usa como base, pero sin una validación adicional contra pago.

## Resultado correcto de la prueba
El resultado correcto es un **Excel acumulado final por registro patronal** que concentre la información de los meses del ejercicio y deje disponible la data necesaria para alimentar revisiones posteriores.

## Cómo sabe Nelly que quedó bien hecha
- Si hay comprobantes de pago, el acumulado o los totales deben coincidir con lo pagado.
- Si no hay comprobantes, se da por armado cuando ya quedó consolidada la información de los `.SUA` disponibles en el Excel final.
- Para un cierre correcto ideal, deben existir los `.SUA` de todos los meses que correspondan.

## Factores que cambian el proceso
Los principales factores que hacen que el proceso cambie son:
- la cantidad de registros patronales
- si el cliente entrega o no los 12 archivos `.SUA`
- si existen pagos complementarios en el ejercicio
- si existen comprobantes de pago
- si falta uno o más meses del `.SUA`
- si para un mes faltante solo existe cédula en PDF

## Unidad de trabajo
La prueba se trabaja:
- por **registro patronal**
- por **mes**
- dentro de un **Excel acumulado final** por cada registro patronal

## Relación con otras pruebas
Esta prueba alimenta directamente otras revisiones. Según lo explicado por Nelly y el contexto del archivo de Traust, de aquí salen o se soportan revisiones posteriores de:
- cuotas pagadas
- altas
- bajas
- movimientos afiliatorios
- topados
- DGE
- revisión mensual y bimestral
- otras pruebas operativas que reutilizan la data consolidada del registro patronal

Dentro de la metodología Traust, el ACUMSUA funciona como una base de trabajo inicial de la que dependen otras salidas del expediente operativo.

## Relación con entregables finales
El ACUMSUA no parece alimentar de forma directa una hoja final única del entregable descargable, pero sí alimenta capas posteriores del flujo de trabajo que terminan impactando:
- revisiones mensuales y bimestrales
- cuotas pagadas
- movimientos y pagos
- otras pruebas que después sí terminan soportando entregables finales del dictamen

En otras palabras, ACUMSUA es un insumo upstream. No es el entregable final, pero sí una base operativa necesaria para construirlos después.

## Documentos utilizados en esta variante

### Raw del cliente
1. **Archivo `.SUA` del cliente**
   - Formato: `.sua`
   - Tipo: documento raw o fuente del cliente
   - Uso: documento base para traducir información al Excel de trabajo
   - Observación: idealmente debe existir uno por mes y por registro patronal

2. **Comprobante de pago**
   - Formato: variable, normalmente comprobante bancario o soporte de pago
   - Tipo: documento raw o soporte del cliente
   - Uso: validar contra lo efectivamente pagado cuando sí está disponible
   - Carácter: opcional para avanzar, pero útil para validar

3. **Cédula en PDF**
   - Formato: `.pdf`
   - Tipo: documento soporte o sustituto parcial
   - Uso: rescatar información resumida cuando falta el `.SUA`
   - Limitación: no sustituye completamente al `.SUA` para cerrar bien la prueba

### Papeles de trabajo reales del auditor
1. **Excel traducido desde SUA**
   - Formato: `.xlsx`
   - Tipo: documento derivado / papel de trabajo real
   - Uso: sirve para extraer la información del `.SUA` ya traducida a Excel

2. **Excel acumulado final de ACUMSUA**
   - Formato: `.xlsx`
   - Tipo: papel de trabajo real principal y resultado operativo de la prueba
   - Uso: consolidar toda la información del ejercicio por registro patronal y servir de base para otras pruebas

## Documentos obligatorios siempre
- archivo `.SUA` por cada mes aplicable del ejercicio, por registro patronal
- Excel traducido desde SUA
- Excel acumulado final de ACUMSUA

## Documentos obligatorios solo según el caso
- comprobantes de pago, cuando se quiera validar contra lo pagado
- cédula PDF, cuando falte el `.SUA` y se quiera rescatar información resumida

## Vista compacta de dónde vive la data relevante

### Documento: Excel traducido desde SUA
- **Hoja `Datos Sumarios`**
  - Columna A: registro patronal
  - Columna B: RFC del patrón
  - Columna C: periodo
  - Columna D: folio de pago

- **Hoja `Datos Validación`**
  - Columna J: total IMSS

- **Hoja `Datos Movimientos`**
  - Columna B: tipo de movimiento
  - Se filtra para separar:
    - `01` y `08`: altas
    - `02`: bajas
    - `07`: movimientos afiliatorios
  - Se usan todas las columnas de la tabla:
    - NSS
    - tipo de movimiento
    - fecha de movimiento
    - folio de incapacidad
    - días
    - salario

- **Hoja `Datos Trabajador`**
  - Para el acumulado principal: se usa de columna **A a AL** sin limpieza ni transformación
  - Para cuotas pagadas:
    - mensual: columnas **K a U**
    - bimestral: columnas **K a AF**

- **Hoja `Datos Empresa`**
  - Se toma la columna donde viene la **prima de riesgo**

### Documento: cédula PDF
Cuando falta el `.SUA`, del PDF solo se puede rescatar de forma resumida:
- cotizantes
- acreditados
- cantidades de cuotas
- parte obrera
- parte patronal

## Variables exactas que se extraen
De acuerdo con la explicación de Nelly, en esta prueba se extraen y reutilizan variables como:
- registro patronal
- RFC del patrón
- periodo
- folio de pago
- total IMSS
- NSS
- tipo de movimiento
- fecha de movimiento
- folio de incapacidad
- días
- salario
- días trabajados
- incapacidades
- ausentismos
- total de cotizantes
- cuota fija
- cuota excedente
- prestaciones en dinero
- gastos médicos pensionados
- riesgos de trabajo
- invalidez y vida
- guarderías y prestaciones sociales
- retiro
- cesantía y vejez
- aportaciones
- amortización
- prima de riesgo

## Proceso operativo paso a paso

### Paso 1. Reunir los archivos del cliente
Se reciben los archivos `.SUA` del cliente correspondientes al ejercicio. El trabajo se arma por registro patronal.

Si existen varios registros patronales, se arma un acumulado por cada uno.

### Paso 2. Confirmar si el paquete documental está completo
Se revisa si el cliente entregó los meses necesarios del ejercicio.

Puede pasar que:
- sí existan los 12 meses
- falten uno o varios `.SUA`
- existan pagos complementarios
- haya comprobantes de pago
- haya meses donde solo exista una cédula en PDF

### Paso 3. Traducir cada `.SUA` a Excel
Cada archivo `.SUA` se abre en el programa **Sistema Único de Autodeterminación**.

Ruta operativa explicada por Nelly:
1. abrir el programa SUA
2. entrar a `Utilerías`
3. elegir la opción para exportar archivo SUA a Excel
4. seleccionar el archivo
5. leer archivo
6. generar / enviar a Excel

Como resultado se obtiene un Excel con estas hojas:
- `Datos Validación`
- `Datos Sumarios`
- `Datos Movimientos`
- `Datos Trabajador`
- `Datos Empresa`

### Paso 4. Confirmar que el archivo corresponde al registro y periodo correctos
Antes de usarlo, se valida en la hoja `Datos Sumarios`:
- columna A: registro patronal
- columna B: RFC del patrón
- columna C: periodo

Con eso se confirma que el archivo sí corresponde al mes correcto y al registro patronal correcto.

### Paso 5. Extraer la información relevante del Excel traducido
Nelly explicó que para ACUMSUA se usan distintas hojas según el dato:

#### De `Datos Validación`
Se toma el **total IMSS** de la columna J para comprobar que lo acumulado cuadre.

#### De `Datos Sumarios`
Se toma el **folio de pago** de la columna D para los programas donde luego se llena esa información.

#### De `Datos Movimientos`
Se filtra la columna B por tipo de movimiento:
- `01` y `08` para altas
- `02` para bajas
- `07` para movimientos afiliatorios

Una vez filtrado, se usan todas las columnas de la tabla.

#### De `Datos Trabajador`
Para el acumulado principal se utiliza toda la información de la hoja útil, de columna **A a AL**.

Nelly dijo expresamente que:
- no se hace limpieza
- no se hace transformación
- no se hace filtro para el acumulado principal
- simplemente se copia y se acumula

#### De `Datos Empresa`
Se toma la **prima de riesgo**, que sirve después para otra revisión donde se valida si lo declarado coincide con lo que se debió pagar.

### Paso 6. Pegar y consolidar la información en el Excel final
La información de los meses se va pegando en el **Excel acumulado final de ACUMSUA**.

La lógica operativa es dejar en un solo archivo toda la información del ejercicio para ese registro patronal.

### Paso 7. Sumar por mes los bloques que se necesitan para cuotas pagadas
Una vez que la información ya está acumulada en el Excel final, dentro del mismo archivo se hacen sumas por mes.

Para cuotas pagadas:
- si el mes es mensual, se usan columnas **K a U**
- si el mes es bimestral, se usan columnas **K a AF**

La regla operativa que explicó Nelly es:
- meses impares, mensual
- meses pares, bimestral

En los meses bimestrales también aparece la parte de:
- aportaciones
- amortización
- retiro
- cesantía y vejez

### Paso 8. Dejar el Excel acumulado listo para otras pruebas
El proceso de ACUMSUA termina cuando ya existe un Excel final con toda la información acumulada del ejercicio y ese archivo ya puede usarse para pruebas posteriores.

## Qué cambia según el caso

### Caso 1. Varios registros patronales
Se arma un ACUMSUA por cada registro patronal.

### Caso 2. Faltan uno o más `.SUA`
El acumulado puede quedar incompleto.

Según Nelly, a veces no pasa nada si queda pendiente uno porque falta el punto SUA y solo tienen PDF, pero eso significa que no está cerrado de forma ideal.

### Caso 3. Solo existe cédula PDF
La cédula PDF sirve para rescatar información resumida y meterla a procesos posteriores como DGE, pero no reemplaza toda la información del `.SUA`.

### Caso 4. Existen comprobantes de pago
Se puede hacer una validación adicional comparando los acumulados contra lo pagado.

### Caso 5. No existen comprobantes de pago
No se hace validación extra. Se avanza con el consolidado de los `.SUA` disponibles.

## Qué hacer si falta información o no cuadra
- Si falta un `.SUA`, el acumulado puede quedar pendiente o incompleto.
- Si solo existe PDF, se rescata información resumida, pero no se sustituye el detalle del `.SUA`.
- Si existe comprobante de pago y no coincide con los totales acumulados, ese comprobante puede evidenciar que el archivo enviado por la empresa no es el correcto.
- Si no existen comprobantes, no hay una validación adicional obligatoria dentro de esta variante.

## Resultado de la prueba
El resultado principal de la prueba es:
- **Excel acumulado final de ACUMSUA por registro patronal**

Ese archivo sirve como base operativa para las pruebas posteriores.

## Cómo se arma el resultado
El resultado se arma:
1. recibiendo los `.SUA`
2. traduciéndolos a Excel desde SUA
3. extrayendo los bloques relevantes de las hojas del Excel traducido
4. pegando la información dentro de un Excel final
5. acumulando todos los meses del ejercicio por registro patronal

## Evidencia mínima que demuestra que quedó bien
- Que el Excel acumulado final exista y tenga consolidada la información del ejercicio por registro patronal.
- Si hay comprobantes de pago, que los totales acumulados coincidan con lo pagado.
- Idealmente, que existan todos los `.SUA` de los meses correspondientes.

## Pendientes reales de cierre
La prueba no queda cerrada de forma ideal si falta cualquiera de estos elementos:
- `.SUA` de meses necesarios del ejercicio
- raw suficiente para reconstruir completamente el acumulado

Si solo existe PDF para algún mes, puede rescatarse información parcial, pero ese mes sigue sin tener el mismo nivel de soporte que un `.SUA` completo.

## Fuentes y variantes relevantes dentro de esta variante
Esta variante corresponde a **Nelly** y a la metodología **Traust**. La lógica principal de esta versión es:
- traducir `.SUA` a Excel desde el programa SUA
- usar como hoja principal `Datos Trabajador`
- acumular meses por registro patronal
- reutilizar el archivo final como base de trabajo para pruebas posteriores

## Archivos de esta carpeta
Los documentos de esta variante deben vivir en esta misma carpeta del auditor:
- `documentos/Archivo SUA de ejemplo - cliente.sua`
- `documentos/Excel traducido desde SUA - ejemplo.xlsx`
- `documentos/ACUMSUA acumulado final - Nelly.xlsx`
- `resultado/` (sin output autónomo separado por ahora)

## Resumen secuencial ultra claro
1. Pides los archivos `.SUA` del cliente.
2. Los separas por registro patronal.
3. Abres cada `.SUA` en el Sistema Único de Autodeterminación.
4. Lo exportas a Excel.
5. Verificas en `Datos Sumarios` que el registro, RFC y periodo sean correctos.
6. Tomas del Excel traducido la información que necesitas.
7. Pegas todo en un Excel final de acumulado.
8. Acumulas todos los meses del ejercicio.
9. Haces las sumas por mes para lo que luego se usa en cuotas pagadas y otras pruebas.
10. Si hay comprobantes de pago, comparas contra lo pagado.
11. El resultado final es el Excel acumulado que servirá para las siguientes pruebas.
