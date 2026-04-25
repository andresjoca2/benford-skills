# SOP Rubén

Volver a: [[../../00 - Resumen de la Prueba]]

## Prueba
- **Prueba:** 5.10 - Conciliación de nóminas, contabilidad, balanza, dictamen y CFDI
- **Auditor:** Rubén
- **Tipo:** Prueba principal

## Objetivo de la prueba
La prueba 5.10 busca conciliar el lado nómina contra el lado contable para validar que los conceptos de nómina del ejercicio estén completos, correctamente agrupados y correctamente reflejados en la contabilidad. El resultado sirve para detectar diferencias, pedir aclaraciones o ajustes a la compañía y dejar una base confiable para seguir con el dictamen.

## La prueba está bien hecha cuando:
- toda la nómina del ejercicio ya quedó cargada y consolidada;
- la balanza ya quedó revisada y agrupada por conceptos de nómina;
- ambos lados se comparan dentro de `Resultado/Resultado - 5.10.xlsx`;
- las diferencias quedan en cero o con una explicación válida;
- si no cuadra, queda identificado qué debe explicar o corregir la compañía.

## Cuándo aplica esta forma de ejecutar la prueba
Esta forma aplica cuando:
- la empresa entrega listas de raya o reportes de nómina por periodo;
- existe balanza contable del ejercicio;
- pueden existir auxiliares para complementar movimientos que no quedaron claramente visibles en balanza;
- puede haber más de un sistema de nómina dentro del mismo ejercicio.

## Factores que cambian la ejecución
- si toda la nómina viene del mismo sistema o si el año se parte en dos bloques;
- la forma del layout de los archivos de nómina;
- si la compañía registró conceptos de nómina dentro de cuentas no obvias;
- si se necesita acudir a auxiliares o si basta con la balanza;
- si existen provisiones de nómina de un ejercicio a otro.

## Documentos y archivos necesarios

### Raw y soportes relevantes usados en esta variante
Los siguientes archivos quedaron dentro de esta misma carpeta para que el paquete sea autocontenido:

#### Papel de trabajo y output principal
- `Documentos/5.10.2.1 - SAP ACUM DE NOM CON FOR 2024.xlsx`
  - Papel de trabajo donde se concentra el detalle de nómina por trabajador, periodo y tipo de periodo.
- `Documentos/5.10.2 - Acumulado de Nóminas.xlsx`
  - Papel de trabajo donde la nómina ya queda agrupada por mes y concepto.
- `Resultado/Resultado - 5.10.xlsx`
  - Archivo final donde se comparan lado nómina vs lado balanza.

#### Documentos raw del cliente / fuente de nómina
- `Documentos/Lista de raya - enero.xlsx`
- `Documentos/Lista de raya - febrero - periodos 03 y 04.xlsx`
- `Documentos/Lista de raya - marzo.xlsx`
- `Documentos/Lista de raya - abril - periodos 07 y 08.xlsx`
- `Documentos/Lista de raya - mayo - periodos 09 y 10.xlsx`
- `Documentos/Lista de raya - may-jun.xlsx`
- `Documentos/Lista de raya - julio - periodos 15 y 16.xlsx`
- `Documentos/Lista de raya - agosto - periodos 17 y 18.xlsx`
- `Documentos/Lista de raya - septiembre - periodos 19 y 20.xlsx`
- `Documentos/Lista de raya - octubre - periodos 21 y 22.xlsx`
- `Documentos/Lista de raya - noviembre y diciembre - periodos 23 y 24 y aguinaldo.xlsx`
- `Documentos/Lista de raya - resumen por concepto.xlsx`

#### Lado contable
- `Documentos/Balanza de la empresa.xlsx`
- `Documentos/Movimientos auxiliares de la empresa.xlsx`

#### Archivo(s) de colaboradores vigentes usados para complementar datos del trabajador
- [[Documentos/Colaboradores vigentes 1.xlsx]]
- [[Documentos/Colaboradores vigentes 2.xlsx]]
- [[Documentos/Colaboradores vigentes 3.xlsx]]
- [[Documentos/Colaboradores vigentes 4.xlsx]]
- [[Documentos/Colaboradores vigentes 5.xlsx]]
- [[Documentos/Colaboradores vigentes 6.xlsx]]

## Documentos obligatorios para cerrar la prueba
**Obligatorios siempre:**
- `Documentos/5.10.2.1 - SAP ACUM DE NOM CON FOR 2024.xlsx`
- `Documentos/5.10.2 - Acumulado de Nóminas.xlsx`
- `Resultado/Resultado - 5.10.xlsx`
- `Documentos/Balanza de la empresa.xlsx`
- listas de raya o reportes de nómina que cubran todo el ejercicio

**Obligatorios según el caso:**
- `Documentos/Movimientos auxiliares de la empresa.xlsx`, cuando la balanza por sí sola no permita llegar al resultado o existan movimientos de nómina en cuentas no obvias
- [[Documentos/Colaboradores vigentes 1.xlsx]], [[Documentos/Colaboradores vigentes 2.xlsx]], [[Documentos/Colaboradores vigentes 3.xlsx]], [[Documentos/Colaboradores vigentes 4.xlsx]], [[Documentos/Colaboradores vigentes 5.xlsx]] o [[Documentos/Colaboradores vigentes 6.xlsx]], cuando se necesiten para completar NSS, RFC, CURP, fecha de alta o puesto en el bloque correspondiente

## Dónde vive la data relevante dentro de los documentos

### 1) Archivos de listas de raya del cliente
**Tipo:** raw / fuente del cliente  
**Formato:** Excel

En el bloque mayo-diciembre:
- cada pestaña representa un periodo;
- cada fila representa un trabajador;
- cada columna representa un concepto.

De aquí se toma primero:
- clave del trabajador;
- nombre del trabajador;
- todos los conceptos e importes del periodo.

La identificación del periodo sale del nombre de la pestaña:
- `P` = quincenal
- `F` = finiquito
- el número = número de periodo

### 2) `Documentos/5.10.2.1 - SAP ACUM DE NOM CON FOR 2024.xlsx`
**Tipo:** papel de trabajo real del auditor  
**Formato:** Excel

Este es el archivo donde se aterriza la transformación operativa principal.

#### Qué contiene
Cada fila representa:
- un trabajador
- un periodo
- un tipo de periodo

Los conceptos viven como columnas.

#### Variables que se llenan
Para el bloque enero-abril y para el bloque mayo-diciembre, aquí se busca tener por fila:
- NSS
- tipo de periodo
- número de periodo
- mes
- bimestre
- clave
- nombre
- puesto
- fecha de alta
- RFC
- CURP
- conceptos e importes

#### Reglas operativas confirmadas
- `T. Periodo` se obtiene del nombre de la pestaña (`P` o `F`)
- `Periodo` se obtiene del número de la pestaña
- `Mes` y `Bim` se determinan con tabla de periodos
- `Clave` sale de la columna `cla`
- `Nombre` sale de la columna `nombre`
- `NSS`, `RFC`, `CURP`, `Alta` y `Puesto` se buscan en colaboradores vigentes con base en la clave del trabajador
- se pasa toda la información de todos los conceptos

### 3) `Documentos/5.10.2 - Acumulado de Nóminas.xlsx`
**Tipo:** papel de trabajo real del auditor  
**Formato:** Excel

Aquí la información deja de verse por trabajador y se agrupa por:
- mes
- concepto

La función de este archivo es llevar el lado nómina a una vista resumida que luego se compara contra contabilidad.

### 4) `Documentos/Balanza de la empresa.xlsx`
**Tipo:** raw / fuente contable del cliente  
**Formato:** Excel

Aquí se identifican las cuentas de:
- activo
- pasivo
- capital
- ingresos
- gastos

La revisión se concentra en:
- cuentas de gastos relacionadas con nómina;
- cuentas de pasivo relacionadas con provisiones de nómina.

### 5) `Documentos/Movimientos auxiliares de la empresa.xlsx`
**Tipo:** soporte contable / raw complementario  
**Formato:** Excel

Este archivo se usa cuando:
- la balanza no alcanza para cuadrar;
- existen conceptos de nómina registrados en cuentas no obvias;
- se necesita rastrear movimientos específicos para integrarlos a la conciliación.

### 6) `Colaboradores vigentes 1.xlsx` a `Colaboradores vigentes 6.xlsx`
**Tipo:** soporte de trabajadores / raw complementario  
**Formato:** Excel

Estos archivos se usan como fuente complementaria para buscar datos faltantes del trabajador en el bloque correspondiente.

#### Qué se extrae
- NSS / IMSS
- RFC
- CURP
- fecha de alta / antigüedad
- puesto

#### Dónde vive la data
En los archivos se confirmó al menos esta estructura de columnas:
- `CLAVE`
- `NOMBRE`
- `ANTIGUEDAD`
- `RFC`
- `IMSS`
- `CURP`
- `DEPARTAMENTO`
- `SUCURSAL`
- `PUESTO`

#### Cómo se usa
- primero Rubén pasa el periodo y todos los conceptos a `5.10.2.1`
- valida que los importes del periodo cuadren contra el archivo raíz
- después busca por **clave del trabajador** en estos archivos de colaboradores vigentes
- con esa búsqueda complementa las columnas faltantes

## Variables exactas que se extraen
Las variables centrales de la prueba son:
- clave
- nombre
- NSS
- RFC
- CURP
- fecha de alta
- puesto
- tipo de periodo
- periodo
- mes
- bimestre
- conceptos de nómina
- importes por concepto
- cuentas contables de nómina
- IDs o nombres de agrupación de conceptos contables
- diferencias entre lado nómina y lado balanza

## Proceso paso a paso

### Paso 1. Reunir el universo documental
Rubén reúne todas las listas de raya y archivos de nómina del ejercicio, además de la balanza y, si hace falta, los auxiliares.

### Paso 2. Detectar si el año se trabaja en un solo bloque o en dos
En esta prueba se confirmó una bifurcación real por cambio de sistema de nómina:
- **Bloque 2A:** enero a abril
- **Bloque 2B:** mayo a diciembre

Ambos se trabajan por separado y después se consolidan.

### Paso 3. Armar el detalle de nómina en `5.10.2.1`
#### Bloque 2A: enero-abril
Se parte de las listas de raya del primer sistema y se arma un acumulado con formato.

La lógica operativa confirmada es:
- alinear metadata del trabajador;
- acomodar deducciones debajo de percepciones;
- limpiar espacios y basura;
- dejar cada fila con trabajador + periodo + tipo de periodo.

#### Bloque 2B: mayo-diciembre
La lógica operativa confirmada es:
- revisar todos los archivos del segundo sistema;
- identificar todas las columnas de todos los archivos;
- eliminar duplicados y formar una sola estructura de columnas únicas;
- pasar la información periodo por periodo hacia abajo en `5.10.2.1`;
- primero cargar lo que sale directo del archivo fuente;
- validar que la suma de todos los conceptos del periodo cuadre exactamente contra el archivo raíz;
- después completar datos faltantes desde colaboradores vigentes.

### Paso 4. Completar campos faltantes del trabajador
Cuando el periodo ya quedó correctamente pasado a la tabla, Rubén va al archivo de colaboradores vigentes y busca por clave del trabajador para completar:
- NSS
- RFC
- CURP
- fecha de alta
- puesto

### Paso 5. Determinar mes y bimestre
Mes y bimestre no salen directo del archivo de nómina: se determinan según el número de periodo usando la tabla de periodos.

### Paso 6. Consolidar a `Documentos/5.10.2 - Acumulado de Nóminas.xlsx`
Una vez que `5.10.2.1` ya tiene el detalle completo, la información se agrupa por:
- mes
- concepto

Aquí ya no importa el trabajador individual; importa el total por concepto y por mes.

### Paso 7. Revisar la balanza
Rubén identifica primero qué cuentas corresponden a:
- activo
- pasivo
- capital
- ingresos
- gastos

Después se enfoca en gastos y busca todos los conceptos que sí corresponden a nómina, por ejemplo:
- sueldos
- puntualidad
- asistencia
- aguinaldo
- vacaciones
- prima vacacional
- despensa
- ahorro
- otros conceptos equivalentes

### Paso 8. Agrupar conceptos contables por ID
Si existen nombres distintos que en realidad corresponden al mismo concepto, se agrupan bajo un mismo ID interno.

Ejemplo:
- `días festivos`
- `días feriados`

Ambos pueden agruparse bajo un mismo ID para que el total contable quede homologado.

Ese ID:
- se usa internamente para sumar;
- queda visible en la balanza de trabajo;
- queda también en `Resultado/Resultado - 5.10.xlsx`.

### Paso 9. Revisar pasivos y provisiones
Después de revisar gastos, Rubén revisa cuentas de pasivo relacionadas con nómina para identificar provisiones, por ejemplo:
- sueldos
- vacaciones
- prima vacacional
- aguinaldo

La lógica confirmada para provisiones es:
- usar la balanza de enero 2024;
- usar la balanza de diciembre 2024;
- comparar saldos para identificar pendientes del 2023 pagados en 2024 o saldos del 2024 que se pagarán en 2025.

### Paso 10. Acudir a auxiliares si la balanza no basta
Normalmente se toma primero la balanza.

Si no se llega al resultado o faltan conceptos, se revisan auxiliares para localizar movimientos que sí son nómina pero que quedaron en cuentas no obvias, por ejemplo no deducibles.

Esos movimientos se marcan y se integran a la conciliación.

### Paso 11. Comparar lado nómina vs lado balanza en `Resultado/Resultado - 5.10.xlsx`
La comparación final se hace dentro del archivo `Resultado/Resultado - 5.10.xlsx`.

En la misma hoja existen dos secciones:
- **lado izquierdo = nómina**
- **lado derecho = balanza**

Del lado izquierdo se pegan los valores de nómina por concepto.
Del lado derecho se pone la misma lógica de conceptos, pero con la información obtenida de balanza y, si hace falta, auxiliares.

La comparación consiste en hacer match entre ambos lados y revisar que todo cuadre.

### Paso 12. Resolver diferencias
Si no cuadra:
- primero se revisa si faltó tomar un concepto o una cuenta;
- luego se valida con la compañía si hay explicación razonable;
- si el auditor está en lo correcto, la compañía debe ajustar y volver a enviar la balanza corregida.

## Validaciones clave
- en `5.10.2.1`, cada fila debe representar trabajador + periodo + tipo de periodo;
- antes de completar metadata faltante, la suma de los conceptos del periodo debe cuadrar contra el archivo raíz;
- `5.10.2` debe reflejar correctamente la agrupación por mes y concepto;
- la balanza debe estar agrupada por conceptos equivalentes de nómina;
- el match final se hace en `Resultado/Resultado - 5.10.xlsx`;
- idealmente no deben existir diferencias.

## Casos especiales y bifurcaciones

### Cambio de sistema de nómina
El ejercicio puede partirse en dos bloques operativos distintos. En esta variante quedó confirmado:
- enero-abril = bloque 2A
- mayo-diciembre = bloque 2B

### Uso o no uso de auxiliares
- si con balanza se llega al resultado, no hace falta profundizar más;
- si no cuadra, se revisan auxiliares.

### Provisiones
Cuando existen saldos provisionados de nómina, deben revisarse cuentas de pasivo para no dejar fuera pagos cruzados entre ejercicios.

## Output final de la prueba

### Output operativo
- `Documentos/5.10.2.1 - SAP ACUM DE NOM CON FOR 2024.xlsx`
- `Documentos/5.10.2 - Acumulado de Nóminas.xlsx`
- `Resultado/Resultado - 5.10.xlsx`

### Output de validación
Una conciliación anual por concepto entre:
- lado nómina
- lado contabilidad

## Relación con entregables finales
Esta prueba deja validada la base de nómina contra contabilidad y sirve como soporte para el dictamen y para pruebas posteriores que dependan de una nómina confiable y correctamente conciliada.

No se usa para determinar por sí sola un entregable final descargable del portal, pero sí alimenta la consistencia del expediente y de los papeles que soportan el dictamen.

## Errores comunes o alertas
- consolidar sin distinguir que hubo cambio de sistema de nómina;
- completar metadata del trabajador antes de validar que los importes del periodo sí cuadran;
- asumir que toda cuenta de nómina está en gastos obvios;
- no revisar provisiones de pasivo;
- dejar diferencias sin explicación formal;
- usar auxiliares desde el inicio sin antes explotar correctamente la balanza;
- querer documentar sueldo diario cuando no es necesario para esta prueba.

## Resumen de la prueba
La 5.10 concilia la nómina del ejercicio contra la contabilidad. Primero se arma el detalle de nómina, luego se resume por concepto, después se agrupan las cuentas contables equivalentes y finalmente ambos lados se comparan en `Resultado/Resultado - 5.10.xlsx`. Si no cuadra, se investiga, se pide explicación y, si aplica, la compañía ajusta la balanza.

## Fuentes y variante documentada
Este SOP documenta únicamente la variante operativa de Rubén. No compara contra otros auditores ni consolida criterio oficial.

## Pendientes reales de cierre
Pendientes reales identificados:
- no quedó documentado dentro de este SOP el detalle fino de cómo se determina el sueldo diario, porque Andrés indicó expresamente que no se necesita para esta prueba;
- fuera de eso, ya quedó cerrada la lógica operativa mínima necesaria para ejecutar la variante documentada.
