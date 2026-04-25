# SOP - Josefina

## Objetivo de la prueba
Validar que el aguinaldo pagado en el ejercicio se haya calculado correctamente, se haya pagado de forma correcta y completa, y se haya timbrado correctamente en CFDI.

## Estructura de esta carpeta
### SOP principal
- [[SOP - Josefina]]

### Resultado
- [[Resultado/5.6.1 Revisión de Aguinaldo.xlsx]]
- [[Resultado/Índice de documentos del cliente - Josefina]]

### Documentos del cliente
- [[Documentos/README - Documentos]]

## Cuándo aplica esta forma de ejecutar la prueba
Aplica cuando la revisión del aguinaldo se trabaja como evento específico dentro del análisis de remuneraciones y prestaciones, y cuando el objetivo es confirmar tres cosas:
- que el cálculo sea correcto
- que el pago sea completo
- que el timbrado en CFDI sea correcto

## Resultado de la prueba integrado en esta carpeta
En esta variante, el resultado principal queda integrado en la carpeta `Resultado`.

### Archivo central
- [[Resultado/5.6.1 Revisión de Aguinaldo.xlsx]]

Ese archivo funciona al mismo tiempo como:
- papel de trabajo principal
- soporte operativo central
- resultado final de la prueba

### Índice del resultado
- [[Resultado/Índice de documentos del cliente - Josefina]]

## Documentos y archivos necesarios
### Documentos fuente del cliente
Los documentos del cliente de esta variante deben cargarse en la carpeta:
- [[Documentos/README - Documentos]]

Documentos identificados:
- Catálogo de trabajadores
- Nómina de aguinaldos
- Resumen de finiquitos
- CFDI/XML de nómina del ejercicio
- Balanza de comprobación
- Política de aguinaldo de la empresa

### Documento procesado derivado
- resultado procesado de CFDI/XML obtenido desde Admin XML
- en esta variante, ese resultado está reflejado dentro del archivo principal, en la pestaña `CFDI`

### Papel de trabajo real del auditor
- [[Resultado/5.6.1 Revisión de Aguinaldo.xlsx]]

## Qué valida exactamente esta prueba
Esta prueba valida que el aguinaldo:
1. haya sido calculado conforme a la política de la empresa
2. haya sido pagado correctamente al trabajador
3. haya sido timbrado correctamente en CFDI

## Qué errores busca detectar
- aguinaldo pagado de más a un trabajador
- cálculo incorrecto del aguinaldo
- timbrado incorrecto del aguinaldo en CFDI
- diferencias que puedan afectar el factor fijo de integración cuando provienen de los días de aguinaldo otorgados

## Dónde está la data relevante dentro del archivo principal
La data principal de la variante vive en:
- [[Resultado/5.6.1 Revisión de Aguinaldo.xlsx]]

### Pestaña `Aguinaldo`
- Columna `B`: número de nómina
- Columna `G`: fecha de ingreso
- Columna `H`: días de aguinaldo
- Columna `I`: cálculo proporcional con base en fecha de ingreso y cierre del ejercicio
- Columna `N`: importe aguinaldo pagado s/ recibo compañía
- Columna `O`: importe aguinaldo auditoría
- Columna `P`: diferencia en pagos

### Pestaña `Nóminas`
- Columna `C`: total de aguinaldo

### Pestaña `Nominas finiquit`
- Columna `K`: monto pagado

### Pestaña `CFDI`
- Columnas `BX` y `BY`: aguinaldo exento y aguinaldo gravado

### Pestaña `Amarre`
- Columna `D`: total de aguinaldo según nómina
- Columna `E`: total de aguinaldo según CFDI
- Columna `F`: saldo contable de aguinaldos según balanza

## Variables exactas que se extraen
- número de nómina
- fecha de ingreso
- fecha de baja, cuando exista
- días de aguinaldo según política
- salario diario
- días laborados en el año
- importe pagado de aguinaldo
- aguinaldo exento
- aguinaldo gravado
- saldo contable de aguinaldos

## Proceso paso a paso
1. Abrir [[Resultado/5.6.1 Revisión de Aguinaldo.xlsx]].
2. Identificar la política de aguinaldo de la empresa.
3. Confirmar si los días de aguinaldo cambian por antigüedad o tipo de trabajador.
4. Ubicar en la pestaña `Aguinaldo` el universo de trabajadores a revisar.
5. Tomar como llave el número de nómina de la columna `B`.
6. Determinar los días de aguinaldo que corresponden al trabajador.
7. Obtener el salario diario correcto.
   - En teoría debe salir de la nómina anterior al pago de aguinaldo.
   - En el caso trabajado, se usó el catálogo de trabajadores porque la nómina no traía ese dato.
8. Revisar si el trabajador laboró todo el año.
9. Si no laboró todo el año, calcular la parte proporcional.
10. Calcular en la columna `O` el `Importe aguinaldo auditoría`.
11. Traer el importe pagado desde la pestaña `Nóminas` o `Nominas finiquit`.
12. Comparar el importe calculado contra el importe pagado.
13. Revisar la columna `P diferencia en pagos`.
14. Validar en la pestaña `CFDI` que el aguinaldo esté timbrado correctamente mediante los importes exento y gravado.
15. Validar en la pestaña `Amarre` que nómina, CFDI y balanza coincidan.
16. Si existen diferencias, explicarlas y determinar si afectan o no el factor fijo de integración.

## Validaciones clave
- la columna `P diferencia en pagos` debe quedar en cero o explicada
- el amarre de nómina, CFDI y balanza debe quedar en cero o explicado
- el cálculo debe respetar la política de la empresa
- el salario diario debe ser el correcto y el más actualizado aplicable
- la proporcionalidad debe estar bien calculada para altas y bajas

## Casos especiales y bifurcaciones
- empresas con diferente número de días de aguinaldo por tipo de trabajador
- empresas con diferente número de días por antigüedad
- trabajadores con ingreso en el ejercicio
- trabajadores con baja o finiquito
- casos donde la nómina no trae salario diario y hay que tomarlo de otra fuente

## Qué revisar cuando hay diferencias
1. primero revisar proporcionalidad por ingreso o baja
2. después revisar si el salario diario utilizado era el correcto
3. después revisar si los días de aguinaldo asignados al trabajador eran los correctos

## Criterio de cierre de la prueba
La prueba queda bien hecha cuando:
- en la pestaña `Aguinaldo`, la columna `P diferencia en pagos` queda en cero o con diferencias explicadas
- en la pestaña `Amarre`, la diferencia entre nómina, CFDI y balanza también queda en cero o explicada

## Output final de la prueba
- si no hay diferencias, queda [[Resultado/5.6.1 Revisión de Aguinaldo.xlsx]] como evidencia de revisión satisfactoria
- si hay diferencias, el resultado es una observación basada en el importe correcto según auditoría o la diferencia determinada
- el output final documentado en esta carpeta vive en `Resultado`

## Relación con otras pruebas y entregables
- toma como antecedente la revisión previa de integración de nómina
- no alimenta directamente otra prueba específica
- la diferencia solo se considera relevante para posible efecto en factor fijo de integración cuando proviene de los días de aguinaldo otorgados al trabajador

## Documentos obligatorios siempre
- catálogo de trabajadores
- nómina de aguinaldos
- resumen de finiquitos
- CFDI/XML de nómina
- resultado procesado de CFDI
- balanza de comprobación

## Carga documental pendiente
Los CFDI/XML raw originales y demás documentos del cliente deben cargarse en:
- [[Documentos/README - Documentos]]

## Resumen corto para alguien junior
1. revisa cuántos días de aguinaldo le tocan al trabajador
2. usa el salario diario correcto
3. calcula la parte proporcional si no trabajó todo el año
4. compara lo que debió recibir contra lo que sí recibió
5. revisa que también esté timbrado en CFDI
6. amarra el total contra nómina y balanza
7. si no hay diferencias, la prueba está bien
8. si sí hay diferencias, explícalas y revisa si afectan integración
