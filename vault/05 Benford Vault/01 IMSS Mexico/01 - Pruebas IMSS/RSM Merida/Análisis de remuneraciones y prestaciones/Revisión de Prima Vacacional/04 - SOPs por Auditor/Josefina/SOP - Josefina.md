# SOP - Jorge

## Subprueba
`5.6.3 - Revisión de Prima Vacacional`

## Objetivo de la prueba
Verificar que el saldo registrado en contabilidad por concepto de prima vacacional coincida con los importes reflejados en los CFDI de nómina y con la información de nómina de la compañía. La prueba busca detectar diferencias entre esas tres bases y se considera correctamente ejecutada cuando las diferencias son cero o cuando cualquier diferencia queda claramente explicada.

## Cuándo aplica esta forma de ejecutar la prueba
Esta versión aplica cuando el auditor trabaja la subprueba 5.6.3 como un amarre mensual de totales globales entre nómina, CFDI y contabilidad, usando un papel de trabajo central en Excel y tomando como base la antigüedad de los trabajadores y el cálculo esperado de la prima vacacional.

## Documentos y archivos necesarios
### Documentos obligatorios siempre
Todos estos archivos ya forman parte del paquete autocontenido de esta variante:

- `documentos/Revisión de Prima Vacacional.xls`
  - Papel de trabajo real del auditor.
  - Contiene las hojas `Revisión de Prima Vacacional`, `CFDI`, `nóminas` y `nómina finiquito`.
- `documentos/Balanza.xlsx`
  - Raw contable del cliente para ubicar el saldo final registrado por prima vacacional.
- `documentos/Catálogo de trabajadores.xlsx`
  - Raw base del cliente para obtener los datos de identificación y relación laboral de los trabajadores.
- `documentos/Concentrado CFDI de nómina - 5.6.3.xls`
  - Duplicado documental del concentrado usado para soportar la hoja `CFDI` del papel de trabajo.
- `documentos/Nómina y finiquitos - 5.6.3.xls`
  - Duplicado documental del raw usado para soportar las hojas `nóminas` y `nómina finiquito` del papel de trabajo.

### Output final
- No se identificó un output final autónomo separado que valga la pena guardar en `resultado/`.
- La carpeta `resultado/` se conserva creada para respetar el layout obligatorio, pero queda vacía por ahora.

## Distinción entre tipos de documento
### Raw del cliente
- `documentos/Balanza.xlsx`
- `documentos/Catálogo de trabajadores.xlsx`
- `documentos/Concentrado CFDI de nómina - 5.6.3.xls`
- `documentos/Nómina y finiquitos - 5.6.3.xls`

### Papel de trabajo real del auditor
- `documentos/Revisión de Prima Vacacional.xls`

### Output real de la prueba
- No se identificó un output real autónomo separado. El trabajo final queda concentrado en el papel de trabajo y en el amarre mensual dentro de ese archivo.

## Dónde está la data relevante dentro de los documentos
### Vista compacta
- **Catálogo de trabajadores**
  - Hoja: `catálogo de trabajadores`
  - Columnas usadas: `B`, `C`, `D`, `F`, `G`, `J`
- **Balanza**
  - Hoja: `BC`
  - Columna `C`: nombre de cuenta
  - Columna `G`: saldo final
- **CFDI**
  - Hoja: `CFDI` dentro de `documentos/Revisión de Prima Vacacional.xls`
  - Columnas clave: `prima vacacional grabada`, `prima vacacional exenta`
- **Nómina**
  - Hojas: `nóminas` y `nómina finiquito` dentro de `documentos/Revisión de Prima Vacacional.xls`
  - Conceptos clave: `Prima de vacaciones a tiempo` y `prima vacacional` en finiquito
- **Amarre final**
  - Hoja: `Revisión de Prima Vacacional` dentro de `documentos/Revisión de Prima Vacacional.xls`
  - Ahí se cargan trabajadores, se calcula antigüedad, se determina la prima esperada y se comparan las tres bases

### Detalle por documento
#### 1) `documentos/Catálogo de trabajadores.xlsx`
Hoja: `catálogo de trabajadores`

Variables exactas que se extraen:
- Columna `B`: número de nómina
- Columna `C`: nombre del trabajador
- Columna `D`: cuota diaria
- Columna `F`: número de seguridad social
- Columna `G`: RFC
- Columna `J`: fecha de ingreso

Notas:
- La categoría no se usa en esta prueba.
- Este archivo alimenta la selección del universo de trabajadores y el cálculo de antigüedad.

#### 2) `documentos/Revisión de Prima Vacacional.xls`
##### Hoja `Revisión de Prima Vacacional`
Se usa para:
- cargar a los trabajadores contemplados para la prueba
- calcular antigüedad
- determinar días de vacaciones
- calcular prima vacacional esperada
- llevar el amarre final

##### Hoja `CFDI`
Se usa para:
- identificar trabajadores con pago de prima vacacional
- tomar la fecha del CFDI emitido
- obtener el total de `prima vacacional grabada` + `prima vacacional exenta`

Regla operativa:
- si cualquiera de esas columnas trae un importe distinto de cero, se entiende que hubo pago de prima vacacional

##### Hoja `nóminas`
Se usa para:
- ubicar el concepto `Prima de vacaciones a tiempo`
- llevar ese importe al amarre mensual

##### Hoja `nómina finiquito`
Se usa para:
- ubicar el concepto `prima vacacional`
- integrar pagos por finiquito al amarre mensual

#### 3) `documentos/Balanza.xlsx`
Hoja: `BC`

Variables exactas que se extraen:
- Columna `C`: nombre o concepto de cuenta
- Columna `G`: saldo final

Regla operativa:
- buscar el concepto `prima vacacional` o alguna abreviación similar, por ejemplo `PRIM VACA` o cualquier nombre suficientemente parecido que identifique esa cuenta

#### 4) `documentos/Concentrado CFDI de nómina - 5.6.3.xls`
Es el soporte documental del concentrado generado desde XML de nómina mediante AdminXML. Sirve para sostener el contenido de la hoja `CFDI` del papel de trabajo.

#### 5) `documentos/Nómina y finiquitos - 5.6.3.xls`
Es el soporte documental base de nómina y finiquitos que se consolida en el archivo de trabajo para sostener las hojas `nóminas` y `nómina finiquito`.

## Variables exactas que se extraen
- número de nómina
- nombre del trabajador
- número de seguridad social
- RFC
- cuota diaria
- fecha de ingreso
- fecha de pago de prima vacacional
- prima vacacional grabada
- prima vacacional exenta
- importe por concepto de `Prima de vacaciones a tiempo`
- importe por concepto de `prima vacacional` en finiquito
- nombre de cuenta contable relacionada con prima vacacional
- saldo final contable

## Proceso paso a paso
1. Abrir `documentos/Revisión de Prima Vacacional.xls`.
2. Ir a la hoja `Revisión de Prima Vacacional`.
3. Cargar en esa hoja a los trabajadores que se van a contemplar para la prueba.
4. Tomar esos trabajadores desde `documentos/Catálogo de trabajadores.xlsx`, hoja `catálogo de trabajadores`.
5. Traer para cada trabajador su número de nómina, nombre, NSS, RFC, cuota diaria y fecha de ingreso.
6. Ir a la hoja `CFDI` del papel de trabajo.
7. Identificar a los trabajadores que tengan pagos de prima vacacional.
8. Para identificarlos, revisar las columnas `prima vacacional grabada` y `prima vacacional exenta`.
9. Si cualquiera de esas columnas trae un valor distinto de cero, considerar que ese trabajador sí tuvo pago de prima vacacional.
10. Tomar de esa misma fila la fecha del CFDI emitido. Esa fecha se usa como fecha de pago de prima vacacional.
11. Regresar a la hoja `Revisión de Prima Vacacional`.
12. Calcular la antigüedad del trabajador con la fórmula:

`(fecha de pago de prima vacacional - fecha de ingreso) / 365`

13. Con esa antigüedad, determinar cuántos días de vacaciones le corresponden al trabajador conforme a la tabla de la Ley Federal del Trabajo.
14. Multiplicar los días de vacaciones por la cuota diaria del trabajador.
15. Aplicar el 25% al resultado anterior para calcular la prima vacacional esperada.
16. La fórmula práctica queda así:

`prima vacacional esperada = días de vacaciones × cuota diaria × 25%`

17. Ir a la hoja `nóminas` y ubicar el concepto `Prima de vacaciones a tiempo`.
18. Ir a la hoja `nómina finiquito` y ubicar el concepto `prima vacacional`.
19. Llevar esos importes a la hoja principal para la base de nómina.
20. Sumar en CFDI el total de `prima vacacional grabada` + `prima vacacional exenta` por trabajador cuando aplique.
21. Obtener de `documentos/Balanza.xlsx`, hoja `BC`, el saldo final contable de la cuenta de prima vacacional o su abreviación equivalente.
22. En la hoja principal del papel de trabajo, formar el amarre entre las tres bases:
   - nómina
   - CFDI
   - contabilidad
23. Hacer el amarre en totales globales por mes.
24. Calcular la diferencia entre las tres bases para identificar si existen discrepancias.
25. Concluir la prueba cuando las diferencias sean cero o queden aclaradas.

## Validaciones clave
- que el trabajador sí tenga pago de prima vacacional en CFDI
- que la fecha de ingreso sea correcta
- que la fecha de pago usada para la antigüedad corresponda al CFDI emitido
- que la cuota diaria sea correcta
- que el concepto de nómina tomado sí corresponda a prima vacacional
- que el concepto contable elegido en balanza sí sea realmente el más cercano a prima vacacional
- que el amarre mensual entre nómina, CFDI y contabilidad no arroje diferencias, o que las diferencias queden explicadas

## Casos especiales y bifurcaciones
### 1) Vacaciones parcialmente disfrutadas
Puede haber diferencia si el trabajador solo disfrutó una parte de las vacaciones que le correspondían en el periodo revisado.

Cómo se detecta:
- se calcula primero la prima esperada con los días teóricos por antigüedad
- si el pago real no coincide, una primera revisión es validar si el trabajador solo disfrutó una parte de sus vacaciones

Cómo se aterriza operativamente:
- se puede inferir el número de días realmente disfrutados con la fórmula:

`importe de prima vacacional pagada ÷ cuota diaria ÷ 25%`

### 2) Dos periodos vacacionales en el mismo ejercicio
Puede existir diferencia cuando en el ejercicio auditado el trabajador disfrutó dos periodos vacacionales correspondientes a distintos aniversarios por su antigüedad laboral.

Tratamiento:
- la diferencia no necesariamente se considera error
- se deja observación expresa de la situación identificada
- la diferencia queda aclarada si la explicación es consistente con ese doble disfrute

### 3) Variación entre empresas
La principal variación detectada entre empresas es el factor práctico ligado al otorgamiento de prima vacacional a sus trabajadores. Sin embargo, en esta revisión concreta Jorge trabaja con un 25% fijo para el cálculo esperado.

## Qué hacer si no cuadra
1. Revisar primero si el trabajador disfrutó solo una parte de las vacaciones.
2. Revisar después si en el ejercicio auditado hubo dos periodos vacacionales por aniversarios distintos.
3. Confirmar que la cuota diaria utilizada sea correcta.
4. Confirmar que el concepto de nómina sí sea el correcto.
5. Confirmar que la cuenta contable localizada en balanza sí corresponde a prima vacacional.
6. Si la diferencia persiste, dejar observación de la situación identificada y su explicación.

## Resultado de la prueba
El resultado de la prueba es un amarre mensual de totales globales entre:
- nómina
- CFDI
- contabilidad

La prueba queda bien soportada cuando:
- las diferencias son cero, o
- las diferencias tienen aclaración suficiente y explícita

## Relación con entregables finales y otras pruebas
### Relación con otras pruebas
- Usa como antecedente lógico la prueba `5.7 - Catálogo de trabajadores`, porque de ahí sale el archivo base para obtener el universo y los datos de cada trabajador.
- Aunque la subprueba vive dentro del proceso `5.6`, Jorge indicó que esta variante no se conecta operativamente con otra subprueba de 5.6 para su cierre.

### Relación con la Plantilla fuente y entregables finales
- En esta variante, Jorge indicó que esta subprueba **no alimenta de manera directa** la Plantilla fuente de Información Patronal, el dictamen, otra cédula final o un entregable final posterior.
- Su función principal es de soporte y validación interna del amarre entre bases.

## Evidencia mínima de cierre
Para considerar esta prueba cerrada documentalmente deben existir dentro del paquete:
- `documentos/Revisión de Prima Vacacional.xls`
- `documentos/Balanza.xlsx`
- `documentos/Catálogo de trabajadores.xlsx`
- `documentos/Concentrado CFDI de nómina - 5.6.3.xls`
- `documentos/Nómina y finiquitos - 5.6.3.xls`

## Pendientes reales de cierre
- No se identificó un archivo de output final autónomo separado; por eso `resultado/` queda vacía.
- Fuera de eso, con los documentos actualmente reunidos, la carpeta del auditor ya queda autocontenida para entender y ejecutar esta variante.

## Errores comunes o alertas
- tomar una fecha de pago incorrecta
- asumir vacaciones completas cuando solo se disfrutó una parte
- no detectar dos periodos vacacionales en el mismo ejercicio
- usar una cuota diaria equivocada
- tomar una cuenta contable parecida pero incorrecta
- mezclar los importes de nómina ordinaria y finiquito sin distinguir el concepto correspondiente

## Resumen secuencial muy claro
1. Toma del catálogo al trabajador, su cuota diaria y su fecha de ingreso.
2. Busca en CFDI si tuvo pago de prima vacacional y toma la fecha del CFDI.
3. Calcula la antigüedad con esa fecha contra la fecha de ingreso.
4. Según la antigüedad, determina los días de vacaciones que le corresponden.
5. Multiplica días por cuota diaria y luego por 25% para sacar la prima esperada.
6. Revisa en nómina y finiquito cuánto se pagó realmente.
7. Revisa en balanza cuánto quedó registrado en contabilidad.
8. Amarra mensualmente nómina, CFDI y contabilidad.
9. Si todo da cero, la prueba está correcta.
10. Si no da cero, explica la diferencia antes de cerrar.
