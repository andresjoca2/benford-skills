# SOP - MAPF - Melanie

## Prueba
MAPF, Movimientos de Afiliación y Personas Físicas

## Auditor
Melanie

## Metodología
Traust

## Objetivo
Validar que los movimientos afiliatorios presentados por la empresa ante IMSS estén correctamente reflejados entre el SUA pagado empresa, la emisión IMSS EVA/EBA y, cuando aplique, el respaldo documental mediante acuse.

La prueba revisa principalmente:
- altas
- bajas
- modificaciones o variables

## Insumos de trabajo
- SUA del cliente
- ACUMSUA, como papel de trabajo derivado del SUA
- Excel de emisiones EVA/EBA
- Programa MAPF
- acuses, cuando existan

## Preparación de información base

### Desde ACUMSUA
En la hoja de movimientos del ACUMSUA se trabajan solo los cortes bimestrales:
- febrero
- abril
- junio
- agosto
- octubre
- diciembre

Se filtra por tipo de movimiento:
- 1 y 8 = altas
- 2 = bajas
- 7 = modificaciones o variables

Con eso se separa la información para alimentar el programa MAPF.

## Estructura general del programa MAPF
El programa se trabaja por registro patronal.

Las pestañas principales son:
- MAPF-1-1, altas
- MAPF-2-1, bajas
- MAPF-3, modificaciones o variables

---

## MAPF-1-1, Altas

### Carga lado SUA pagado empresa
En el bloque **SUA pagado empresa** se vacía la información del SUA a nivel:
- registro patronal
- trabajador

Los datos principales que se usan son:
- Número IMSS
- Fecha de movimiento
- S.D.I.

### Carga lado CD emitido IMSS
En el bloque **CD emitido IMSS** se vacía la información tomada del EVA/EBA.

Del Excel de emisión se trae:
- Número IMSS
- Fecha de movimiento
- Salario diario

El salario diario viene de la columna G del EVA.

### Cruce
Se hace un cruce tipo VLOOKUP o búsqueda por Número IMSS para traer al programa MAPF:
- la fecha de movimiento
- el salario diario

### Qué se revisa
Se compara principalmente:
- fecha SUA vs fecha emisión
- SDI o salario SUA vs salario emisión

### Si hay diferencia
Cuando hay diferencia:
- se pide acuse para validar qué fue lo realmente presentado ante IMSS
- si la empresa no tiene acuse o se equivocó, se deja comentario en el dictamen
- el comentario va orientado a que tengan más atención en la captura y en el amarre contra emisión y SIDEIMSS

---

## MAPF-2-1, Bajas

### Origen
Se usa el mismo Excel de emisiones, filtrando por tipo de movimiento 2, que corresponde a bajas.

### Carga lado SUA pagado empresa
En el bloque **SUA pagado empresa** se vacía la baja por:
- registro patronal
- trabajador

Se usa principalmente:
- Número IMSS
- Fecha de movimiento
- S.D.I.

### Carga lado CD emitido IMSS
En el bloque **CD emitido IMSS** se vacía la información de bajas proveniente del EVA/EBA.

### Qué se revisa
En bajas se revisa principalmente:
- fecha de movimiento
- salario

Regla importante:
- cuando es baja, el salario en emisión debe venir en 0
- por eso aquí se revisa que en SUA no hayan puesto salario

### Si hay diferencia
Si la fecha no coincide:
- sí se pide acuse
- esto sirve para validar cuál fue la fecha realmente presentada ante IMSS

Además:
- también se deja comentario de que la fecha en SUA difiere contra la presentada o emitida

Si no hay acuse o hubo error:
- también se comenta al final en el dictamen

---

## MAPF-3, Modificaciones o Variables

### Alcance
Aquí no se trabaja trabajador por trabajador.

Aquí solo se pone el total de modificaciones por registro patronal.

### Lado SUA
En la columna I se captura el total de modificaciones de variables del SUA para estas fechas:
- 1 de enero
- 1 de marzo
- 1 de mayo
- 1 de julio
- 1 de septiembre
- 1 de noviembre

### Lado EVA
En la emisión se identifican los movimientos con tipo de movimiento 7.

Esos totales se colocan en la columna F de la pestaña MAPF-3 para las mismas fechas:
- 1 de enero
- 1 de marzo
- 1 de mayo
- 1 de julio
- 1 de septiembre
- 1 de noviembre

### Comparación
Se compara:
- columna F, EVA
- contra columna I, SUA

De ahí sale la diferencia.

### Si hay diferencia
Cuando hay diferencia:
- se verifica con la empresa
- si existe, también se usa el acuse de movimientos afiliatorios como respaldo

---

## Criterio de salida de la prueba
La prueba busca identificar si:
- el movimiento sí fue presentado correctamente
- el SUA coincide con la emisión IMSS
- existe respaldo documental suficiente
- o si debe dejarse observación en dictamen por error o falta de control

## Resumen operativo corto
1. sacar del ACUMSUA:
   - altas
   - bajas
   - modificaciones
2. cargar en el programa:
   - MAPF-1-1 para altas
   - MAPF-2-1 para bajas
   - MAPF-3 para modificaciones
3. cruzar contra EVA/EBA
4. comparar principalmente:
   - Número IMSS
   - Fecha de movimiento
   - Salario o SDI
   - y en modificaciones, totales tipo 7
5. cuando hay diferencia:
   - validar con la empresa
   - pedir acuse
   - y si no se justifica, dejar observación en dictamen
