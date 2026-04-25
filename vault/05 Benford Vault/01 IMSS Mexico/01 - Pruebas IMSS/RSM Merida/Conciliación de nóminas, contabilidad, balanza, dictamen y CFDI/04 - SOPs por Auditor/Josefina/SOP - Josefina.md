# SOP - Josefina

Volver a: [[../../00 - Resumen de la Prueba]]

## Prueba
- **Prueba:** 5.10 - Conciliación de nóminas, contabilidad, balanza, dictamen y CFDI
- **Auditor:** Josefina
- **Tipo:** Prueba principal

## Objetivo de la prueba
La prueba 5.10 busca conciliar la nómina contra la contabilidad para validar que los importes pagados por nómina estén correctamente registrados en la balanza de comprobación y que la base de nómina del ejercicio esté íntegra, razonablemente reflejada y lista para soportar el resto de las pruebas del dictamen.

Cuando existan pagos especiales, esta conciliación también debe incorporar:
- finiquitos
- indemnizaciones
- pagos fuera de nómina

El resultado de esta prueba sirve como base para continuar con otras pruebas, especialmente la prueba global de razonabilidad, y también sirve para validar la hoja de remuneraciones pagadas de la Plantilla de Información Patronal.

## La prueba está bien hecha cuando:
- ya se tiene la nómina anualizada del ejercicio;
- ya se tiene la balanza de comprobación del ejercicio;
- los conceptos de nómina ya fueron comparados contra la balanza;
- las diferencias son cero o quedan razonablemente explicadas;
- los pagos especiales ya fueron incorporados cuando aplican;
- las diferencias relevantes quedaron documentadas por concepto;
- existe una conclusión global de la cédula;
- los hallazgos relevantes quedaron listos para llevarse a carta de observaciones y recomendaciones.

## Cuándo aplica esta forma de ejecutar la prueba
Esta forma aplica cuando:
- la empresa entrega nómina anualizada o una base de nómina que puede verse de forma anual;
- existe balanza de comprobación del ejercicio;
- la empresa puede tener uno o varios registros patronales;
- puede haber conceptos ordinarios y conceptos especiales fuera de la nómina regular;
- pueden existir diferencias por cuentas incorrectas, conceptos omitidos o desfases mensuales.

## Factores que cambian la ejecución
- periodicidad de nómina: semanal, quincenal, catorcenal, mensual o mezcla;
- catálogo de conceptos que paga cada empresa;
- si la nómina viene desde Compact de Nóminas o Nomipaq;
- si la nómina se entrega ya anualizada o viene por periodos;
- si la empresa tiene varios registros patronales;
- si existen finiquitos, indemnizaciones o pagos fuera de nómina;
- si la hoja de nómina ya trae desglose mensual o solo un acumulado anual;
- si una diferencia requiere solo explicación o también ajuste / observación.

## Documentos y archivos necesarios

### Raw y soportes relevantes usados en esta variante
Los siguientes archivos quedaron dentro de esta misma carpeta para que el paquete sea autocontenido:

#### Raw / fuente del cliente y soportes reales
- [[documentos/Lista de raya anualizada.xlsx]]
  - Nómina anualizada usada como base principal del lado nómina.
- [[documentos/Balanza de comprobación anual.xlsx]]
  - Balanza del ejercicio usada como base principal del lado contable.
- [[documentos/Auxiliar de gastos y costos.xlsx]]
  - Soporte contable usado para investigar diferencias y localizar partidas atípicas o mal clasificadas.

#### Documento principal del auditor
- [[SOP - Josefina.md]]
  - Documento principal para entender y ejecutar la variante de Josefina.

#### Resultado
- `resultado/`
  - Carpeta reservada para output final real autónomo cuando exista.
  - En esta variante no quedó confirmado un resultado autónomo separado adicional al papel de trabajo y al SOP.

## Documentos obligatorios para cerrar la prueba
**Obligatorios siempre:**
- [[documentos/Lista de raya anualizada.xlsx]]
- [[documentos/Balanza de comprobación anual.xlsx]]
- hoja de conciliación nóminas vs contabilidad dentro del papel de trabajo real de la prueba

**Obligatorios según el caso:**
- [[documentos/Auxiliar de gastos y costos.xlsx]], cuando existan diferencias que no se resuelven con la balanza sola
- reporte de finiquitos, indemnizaciones o pagos fuera de nómina, cuando esos pagos existan y no vengan integrados dentro de la nómina normal
- pestaña `Diferencias`, cuando exista diferencia distinta de cero que deba explicarse o concluirse
- hoja `TM`, cuando haga falta ampliar comentarios, referencias o explicaciones de puntos específicos del papel de trabajo

## Dónde vive la data relevante dentro de los documentos

### 1) `documentos/Lista de raya anualizada.xlsx`
**Tipo:** raw / fuente del cliente  
**Formato:** Excel

#### Qué contiene
Contiene la nómina anualizada de la empresa.

#### Dónde vive la data relevante
Normalmente:
- la información útil está en la hoja 1;
- cada concepto viene por columna;
- existen subtotales por departamento;
- al final existe un total por concepto.

#### Qué se extrae
Se toman principalmente:
- los conceptos de nómina;
- sus importes acumulados;
- el total final por concepto.

Ejemplos de conceptos que pueden aparecer:
- sueldos
- aguinaldo
- vacaciones
- prima vacacional
- gratificación
- día festivo
- premio de puntualidad
- premio de asistencia
- otros conceptos propios de la empresa

#### Cómo se usa
- la nómina anualizada se pega tal cual en la pestaña `Nómina` del papel de trabajo;
- no se rehace la base;
- se ignoran los subtotales intermedios;
- se toma como dato útil el total final por concepto.

#### Regla importante cuando hay varios registros patronales
Si la empresa usa Nomipaq, la nómina puede venir segregada por registro patronal, pero al final el mismo archivo arroja el total consolidado.

Para la variante de Josefina:
- la prueba se corre sobre la conciliación anualizada consolidada.

### 2) `documentos/Balanza de comprobación anual.xlsx`
**Tipo:** raw / fuente contable del cliente  
**Formato:** Excel

#### Qué contiene
Contiene la balanza del ejercicio con las cuentas y sus saldos.

#### Dónde vive la data relevante
- se revisa la columna de nombre o descripción de cuenta;
- el dato que termina alimentando la conciliación es el saldo final;
- en el archivo / estructura levantada para esta prueba, el saldo que alimenta la conciliación está en la columna G.

#### Qué se extrae
- cuentas relacionadas con conceptos de nómina;
- saldo final por cuenta;
- cuentas que pueden corresponder a gastos de nómina;
- cuentas separadas por centro de costo cuando un concepto no está en una sola cuenta.

#### Cómo se usa
- la balanza se pega en la pestaña `Balanza` del papel de trabajo;
- se identifican manualmente las cuentas que corresponden a los conceptos de nómina;
- el criterio no es coincidencia automática por nombre exacto;
- se revisan nombres alternos, abreviaturas y agrupaciones distintas.

#### Regla importante
En balanza normalmente no hay desglose por registro patronal.
Normalmente un concepto aparece en una sola cuenta.
Si aparece en varias, normalmente es por centro de costo y no por registro patronal.

Cuando un concepto está repartido en varias cuentas:
- lo correcto es hacer primero una suma visible;
- esta suma puede hacerse en la misma hoja, en la parte inferior;
- después se manda un solo resultado a la conciliación;
- esto se hace para dejar claro qué cuentas se están agrupando.

### 3) `documentos/Auxiliar de gastos y costos.xlsx`
**Tipo:** soporte contable / raw complementario  
**Formato:** Excel

#### Qué contiene
Detalle individual de movimientos contables de gastos.

#### Qué se revisa
- registros contables individuales de cada cuenta donde se identifique una diferencia;
- partidas atípicas;
- registros que no correspondan a nómina normal;
- movimientos de otros periodos;
- pagos especiales o complementos.

#### Cómo se usa
Es el primer corte normal de revisión cuando existe una diferencia.
Si la diferencia no se entiende con la balanza:
- primero se baja al auxiliar contable;
- si no basta, se continúa con revisión mes a mes.

## Variables exactas que se extraen
Las variables principales de esta prueba son:
- concepto de nómina
- importe anual según nómina
- cuenta o cuentas contables relacionadas
- importe según balanza
- diferencia
- explicación de la diferencia
- conclusión por diferencia
- conclusión global

Cuando existen pagos especiales, también se usan:
- empleado
- número de empleado
- fecha de baja
- conceptos del pago especial
- importes
- total
- mes

## Estructura del papel de trabajo base
Pestañas identificadas para esta variante:
- `Concil. nóminas vs contabilidad`
- `Diferencias`
- `Nómina`
- `Balanza`
- `Auxiliar de gastos`

De manera general todas se usan normalmente.

### Hoja TM
`TM` significa TickMark.

Es una hoja que se usa para:
- explicaciones más amplias;
- referencias;
- comentarios;
- diferencias;
- otros puntos relevantes del papel de trabajo.

No es obligatoria en todos los casos.
En la práctica de Josefina:
- se agrega solo cuando hace falta ampliar información;
- en el archivo base de esta variante no fue necesario incluirla.

## Dónde vive la lógica dentro del papel de trabajo
En la pestaña `Concil. nóminas vs contabilidad`:
- columna B = concepto de nómina
- columna C = referencia / celda / resultado que direcciona el importe contable a conciliar
- columna D = total de nómina
- columna G = concepto de balanza
- columna L = total balanza
- columna M = diferencia

En la pestaña `Nómina`:
- la conciliación usa tanto las columnas por concepto como la fila de totales.

En la pestaña `Balanza`:
- el dato que alimenta la conciliación está contenido en la columna G del archivo levantado.

En la pestaña `Diferencias`:
- cada renglón representa una diferencia por concepto.

## Proceso paso a paso

### Paso 1. Reunir el universo documental
Tener listos:
- nómina anualizada
- balanza de comprobación del ejercicio
- papel de trabajo base de la 5.10
- auxiliar de gastos, si hay diferencias
- reporte de finiquitos / indemnizaciones / pagos fuera de nómina, si aplica

### Paso 2. Confirmar la base de nómina
Lo primero es contar con la nómina anualizada.

Escenarios:
- si el cliente ya la entrega anualizada, se usa esa base;
- si el archivo viene segregado por registro patronal, se usa el total final consolidado;
- en la práctica de Josefina, la conciliación se trabaja de forma anualizada.

### Paso 3. Cargar la nómina en la pestaña `Nómina`
- la nómina anualizada se pega tal cual en Excel;
- no se rehace la base;
- se trabaja con la estructura que arroja el sistema;
- lo que interesa es el total final por concepto.

### Paso 4. Identificar el dato útil de nómina
El dato relevante de esta prueba es:
- el total por concepto de nómina.

No se usan los subtotales intermedios.

### Paso 5. Cargar la balanza en la pestaña `Balanza`
- se pega la balanza del ejercicio;
- se identifica manualmente qué cuentas corresponden a gastos de nómina;
- se revisa la columna de nombre o descripción de cuenta;
- el importe que se toma para conciliar es el saldo final.

### Paso 6. Hacer el amarre entre nómina y contabilidad
El match no es automático.

Se hace así:
- revisar el concepto de nómina;
- buscar en balanza la cuenta o cuentas que pueden corresponder;
- considerar abreviaturas, nombres distintos o agrupaciones diferentes;
- si un concepto cae en varias cuentas, agruparlas primero.

#### Criterio correcto cuando hay varias cuentas
Si un concepto está dividido en varias cuentas por centro de costo:
- hacer primero una suma visible;
- dejar claro qué cuentas se agrupan;
- mandar un solo resultado a la conciliación.

### Paso 7. Alimentar la conciliación
En la pestaña `Concil. nóminas vs contabilidad`:
- el total de nómina está en la columna D;
- el total de balanza está en la columna L;
- la diferencia está en la columna M.

La columna C se usa para direccionar el importe contable que va a compararse.

### Paso 8. Revisar la diferencia
Si la diferencia es cero:
- el concepto queda conciliado.

Si la diferencia no es cero:
- se investiga.

## Orden mental de revisión de diferencias
Cuando Josefina detecta una diferencia, su orden mental de revisión es:

1. pago especial como finiquito o indemnización  
2. cuenta contable incorrecta  
3. concepto no registrado  
4. periodo incorrecto  

## Cómo se investigan las diferencias

### Primer corte
Primero se revisa:
- el auxiliar contable

Se busca si hay:
- finiquitos
- indemnizaciones
- complementos de nómina
- movimientos fuera de la generalidad del concepto
- registros que no correspondan a nómina
- registros de otros periodos

### Segundo corte
Si con el auxiliar no basta:
- se revisa mes a mes;
- se compara la nómina del mes contra el registro contable del mismo mes;
- se busca en qué mes nace la diferencia.

### Bifurcación por disponibilidad del detalle mensual
Si la hoja de nómina ya trae el desglose mes a mes:
- la revisión mensual puede hacerse en el mismo papel de trabajo.

Si la hoja solo trae acumulado anual:
- se arma otro papel de trabajo desde cero;
- con estructura similar a la hoja de nómina;
- pero con dato mensual en vez de dato anual.

## Tratamiento de casos especiales

### 1) Finiquitos, indemnizaciones y pagos fuera de nómina
También se revisan dentro de esta prueba cuando existen.

#### Si ya vienen en la nómina
- se consideran dentro de la conciliación normal.

#### Si no vienen en la nómina
- se agrega una pestaña adicional, por ejemplo `finiquitos`;
- ahí se captura el total;
- ese total se suma al total de nómina;
- así la conciliación queda completa.

#### Documento necesario
El reporte que entrega la compañía debe traer al menos:
- empleado
- número de empleado
- fecha de baja
- conceptos
- importes
- total
- información por empleado y por mes

#### Tratamiento operativo
Si se detecta que la diferencia proviene de un pago especial:
- no solo se explica;
- sí se ajusta la conciliación agregando pestaña y total.

### 2) Cuenta contable incorrecta
Si el problema es que la empresa registró mal el concepto:
- no basta con corregir el amarre;
- también se deja documentado que el concepto fue registrado incorrectamente;
- el hallazgo se lleva a carta de observaciones y recomendaciones.

### 3) Concepto no registrado
Si falta el registro de un concepto:
- se propone el ajuste a la compañía;
- se corrige el importe dentro de la lógica de conciliación;
- se documenta;
- también se lleva a carta de observaciones y recomendaciones.

### 4) Desfase mensual
Si el problema es un desfase mensual dentro del ejercicio:
- se deja la explicación del timing;
- normalmente no implica ajustar la base de la prueba;
- también se lleva a carta de observaciones y recomendaciones.

## Cómo se documentan las diferencias
La pestaña `Diferencias` trabaja por concepto.

La estructura mínima real debe contener:
- concepto
- importe según nómina
- importe según balanza
- diferencia
- TM, como explicación del motivo de la diferencia
- conclusión

También quedó mencionada esta lógica de desglose / lectura dentro de diferencias:
- saldo en nómina
- prima de balanza no registrada en nómina
- total nómina
- saldo en balanza
- prima de nómina no registrada en balanza
- registros duplicados en balanza
- total balanza

## Criterio de documentación de diferencias
No todas las diferencias se documentan al mismo nivel de detalle.

### Regla práctica
- si la diferencia es relevante, sí se documenta puntualmente;
- si la empresa normalmente no tiene diferencias, cualquier diferencia llama la atención y se revisa a fondo;
- si la empresa normalmente trae diferencias pequeñas y recurrentes, puede no entrarse a tanto detalle;
- cuando la materialidad es baja, puede no documentarse a detalle.

## Criterio de razonabilidad
La razonabilidad depende del juicio del auditor.

Para esta variante:
- se considera como referencia principal un máximo de 3%;
- en términos generales, las diferencias aceptadas fluctúan en un porcentaje no mayor al 5%.

### Base contra la que se mide
En la 5.10 este porcentaje se mide contra:
- el total anual de la nómina.

## Conclusiones
La prueba debe cerrar con dos niveles de conclusión:

### 1) Conclusión global
Debe existir una conclusión global de toda la cédula.

Ejemplo típico:
> Los importes reflejados en los saldos contables de la compañía se consideran razonablemente correctos después de comprobarlos contra las nóminas.

### 2) Conclusiones por diferencia
Además:
- cada diferencia relevante debe quedar explicada;
- cada diferencia relevante debe tener su propia conclusión por concepto.

## Output final de la prueba
### Output operativo
El resultado de la prueba es una conciliación anualizada por concepto entre:
- lado nómina
- lado contabilidad

### Output de validación
De esta prueba salen:
- los conceptos de nómina ya validados;
- los importes conciliados contra contabilidad.

## Relación con otras pruebas
Esta prueba alimenta directamente:
- la prueba global de razonabilidad

Lo que pasa hacia esa prueba es:
- todos los conceptos de nómina ya validados con sus importes conciliados.

## Relación con entregables finales
La 5.10 también se usa para validar la Plantilla de Información Patronal, específicamente:
- la hoja de remuneraciones pagadas.

Aquí se validan:
- los conceptos;
- los montos anuales por concepto.

## Relación con carta de observaciones y recomendaciones
Cuando existen hallazgos relevantes, también se llevan a carta de observaciones y recomendaciones, por ejemplo:
- cuenta contable incorrecta;
- concepto no registrado;
- desfase mensual;
- otros hallazgos que ameriten dejar observación formal.

## Errores comunes o alertas
- usar subtotales en vez del total final por concepto;
- asumir que el nombre de balanza coincidirá exactamente con el nombre de nómina;
- no agrupar correctamente cuentas separadas por centro de costo;
- no revisar auxiliar contable cuando la balanza no explica la diferencia;
- dejar fuera pagos especiales que no vienen dentro de la nómina regular;
- no distinguir entre diferencia material y diferencia menor habitual de la empresa;
- no documentar ni llevar a observaciones los hallazgos relevantes;
- cerrar la prueba solo con diferencia baja, sin aplicar juicio de razonabilidad.

## Resumen de la prueba
La 5.10 de Josefina consiste en tomar la nómina anualizada, tomar la balanza del ejercicio, identificar por concepto qué importes de nómina deben existir en contabilidad y conciliarlos dentro del papel de trabajo. Si existe una diferencia, primero se revisa si proviene de pagos especiales, después si hay cuenta contable incorrecta, luego si falta registrar un concepto y finalmente si existe un desfase mensual. Cuando el caso lo requiere, la diferencia se documenta por concepto, se concluye, se ajusta la conciliación o se lleva a carta de observaciones y recomendaciones. El resultado final es una base anualizada de conceptos de nómina validados contra contabilidad que alimenta la prueba global de razonabilidad y valida la hoja de remuneraciones pagadas de la Plantilla de Información Patronal.

## Fuentes y variante documentada
Este SOP documenta únicamente la variante operativa de Josefina. No compara contra otros auditores ni consolida criterio oficial.

## Pendientes reales de cierre
Pendientes reales identificados:
- no se compartió un ejemplo real de reporte de finiquitos / pagos fuera de nómina porque no fue necesario para cerrar esta variante;
- no se compartió un ejemplo específico de diferencia ya elevada a observaciones, pero sí quedó documentada la lógica de tratamiento;
- fuera de eso, la lógica operativa y el paquete documental base de esta variante quedaron suficientemente cerrados para ejecución y consulta.
