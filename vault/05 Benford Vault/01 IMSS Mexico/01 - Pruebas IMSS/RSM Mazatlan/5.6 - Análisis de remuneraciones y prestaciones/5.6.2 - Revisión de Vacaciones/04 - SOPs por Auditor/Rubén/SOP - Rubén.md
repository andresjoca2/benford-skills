# SOP - Rubén

## Prueba
`5.6.2 Revisión de Vacaciones`

## Objetivo de la prueba
Revisar que las vacaciones pagadas a los trabajadores durante el ejercicio correspondan a la antigüedad del trabajador y al número de días que le toca disfrutar conforme al factor aplicable, y que el importe pagado por la empresa sea consistente con ese cálculo.

La prueba también busca identificar diferencias y distinguir si corresponden a:
- faltantes por disfrutar
- vacaciones de ejercicios anteriores
- excedentes de vacaciones

## Cuándo aplica esta forma de ejecutar la prueba
Esta forma aplica cuando:
- existe un acumulado de nómina con detalle suficiente de vacaciones
- existe una tabla de factor o archivo con días por antigüedad
- existe un papel de trabajo final `5.6.2 - Revisión de Vacaciones`
- puede analizarse el pago acumulado de vacaciones por trabajador en el ejercicio

## Factores que pueden cambiar el proceso
- si el registro corresponde a vacaciones o no
- si el registro es finiquito (`F`) y debe excluirse
- si el trabajador está o no en la muestra maestra
- si existen varios pagos de vacaciones en el ejercicio para el mismo trabajador
- si se cuenta o no con control de vacaciones del cliente
- si la diferencia corresponde a vacaciones del ejercicio o a ejercicios anteriores
- si existe excedente de vacaciones que deba escalarse a otra prueba
- si existe soporte documental suficiente para aclarar diferencias

## Documentos y archivos que necesitas
### 1. Acumulado de nómina
Archivo fuente principal de cálculo.

**Archivo en esta carpeta:**
- `5.10.2.1_SAP_ACUM_DE_NOM_CON_FOR_2024-1.xlsx`

**Ruta relativa:**
- `./5.10.2.1_SAP_ACUM_DE_NOM_CON_FOR_2024-1.xlsx`

#### Hoja usada
- `ACUMULADO 2024`

#### Lo que sí sabemos con certeza de Rubén
- se filtra por registros de vacaciones
- se excluyen finiquitos con `F` en columna `B`
- se excluyen trabajadores fuera de la muestra maestra
- no se depende siempre de que existan días de vacaciones en el acumulado
- sí se trabaja con el importe de vacaciones pagadas

#### Hallazgo técnico del archivo revisado
En el ejemplo revisado aparece una columna:
- `AG = VACACIONES_120`

Eso sugiere que en esta empresa el concepto de vacaciones vive ahí, pero este punto no debe tratarse todavía como regla confirmada de Rubén sin validación adicional.

### 2. Catálogo de períodos
Se usa para obtener la fecha de pago / vacaciones a partir del período de pago.

**Ejemplo de archivo trabajado:**
- pendiente de confirmar el nombre exacto del archivo de catálogo de períodos

### 3. Tabla de factor de vacaciones
Se usa para convertir antigüedad a días de vacaciones.

**Ejemplo de archivo trabajado:**
- pendiente de confirmar el nombre exacto del archivo de factor / tabla de vacaciones

### 4. Control de vacaciones del cliente
Documento relevante para aclarar diferencias y distinguir vacaciones del ejercicio vs ejercicios anteriores.

**Ejemplo de archivo trabajado:**
- pendiente de recibir ejemplo real

### 5. CFDI / recibos de nómina / recibos de vacaciones
Funciona como evidencia documental, no como base principal del cálculo.

**Ejemplo de archivo trabajado:**
- pendiente de recibir ejemplo real

### 6. Muestra maestra de trabajadores seleccionados
Se usa para delimitar el universo a revisar.

**Ejemplo de archivo trabajado:**
- pendiente de confirmar el archivo exacto de muestra

### 7. Resultado real de la prueba
Output real autónomo de esta variante.

**Archivo en esta carpeta:**
- `Resultado - 5.6.2 Revisión de Vacaciones.xlsx`

**Ruta relativa:**
- `./Resultado - 5.6.2 Revisión de Vacaciones.xlsx`

## Datos que debes extraer
### Del acumulado
- número de nómina
- nombre del trabajador
- registro patronal
- NSS
- puesto
- fecha de ingreso
- período de pago
- cuota diaria
- importe de vacaciones pagadas por la compañía

### Del catálogo de períodos
- fecha de pago / fecha de vacaciones correspondiente al período

### De la tabla de factor
- días de vacaciones según antigüedad

### Del papel final
- antigüedad
- vacaciones pagadas
- vacaciones auditoría
- diferencia en días
- vacaciones pagadas compañía
- vacaciones auditoría en importe
- diferencia en importe
- observación
- CFDI / importe CFDI

## Proceso paso a paso
1. Abrir el acumulado y entrar a `ACUMULADO 2024`.
2. Filtrar registros que correspondan a vacaciones.
3. Excluir registros con `F` en columna `B` porque corresponden a finiquitos.
4. Respetar la muestra maestra de trabajadores seleccionados.
5. Copiar al papel `5.6.2` las columnas operativas base: número de nómina, nombre, registro patronal, NSS, puesto, fecha de ingreso, período de pago, cuota diaria e importe de vacaciones pagadas por compañía.
6. Obtener la fecha de pago / vacaciones desde el catálogo de períodos.
7. Calcular la antigüedad usando fecha de ingreso contra fecha de pago.
8. Redondear la antigüedad hacia arriba para consultar la tabla de factor.
9. Consultar la tabla de factor y obtener los días de vacaciones auditoría.
10. Calcular el importe de vacaciones auditoría: días de auditoría x cuota diaria.
11. Comparar el importe determinado por auditoría contra todas las vacaciones pagadas por la compañía en el ejercicio para ese trabajador.
12. Analizar la diferencia acumulada por trabajador.
13. Clasificar el caso como:
- consistente
- saldo negativo
- saldo positivo por vacaciones de ejercicios anteriores
- saldo positivo por excedente de vacaciones
14. Documentar observaciones y explicación de la empresa cuando existan diferencias.
15. Escalar excedentes confirmados a la prueba posterior de salario base de cotización.

## Validaciones clave
- que el registro sí corresponda a vacaciones
- que se excluyan finiquitos
- que el trabajador esté dentro de la muestra
- que la fecha de pago esté bien amarrada al período
- que la antigüedad se calcule correctamente
- que el redondeo hacia arriba se aplique correctamente
- que los días de auditoría correspondan al factor correcto
- que el importe auditoría esté bien calculado
- que las diferencias se analicen por trabajador acumulado en el ejercicio
- que los excedentes se distingan de vacaciones de ejercicios anteriores

## Casos especiales y bifurcaciones
- movimientos que sí son vacaciones vs otros conceptos
- finiquitos marcados con `F`
- trabajadores fuera de muestra
- múltiples pagos de vacaciones en el mismo ejercicio para un trabajador
- vacaciones de ejercicios anteriores disfrutadas en el ejercicio actual
- excedentes de vacaciones con impacto en prueba posterior
- falta de control de vacaciones del cliente
- falta de soporte documental para aclarar diferencias

## Output inmediato de la prueba
Rubén deja como output inmediato:
- el archivo `Resultado - 5.6.2 Revisión de Vacaciones.xlsx` poblado
- diferencias analizadas a nivel trabajador acumulado en el ejercicio
- observaciones por trabajador
- casos escalados por excedente
- una conclusión general de si la empresa administra correctamente las vacaciones

## Qué no cierra todavía esta prueba
No cuantifica el efecto final del excedente en SBC.
Solo identifica si existe excedente y lo canaliza a la prueba posterior correspondiente.

## Relación con otras pruebas y entregables
- esta prueba identifica excedentes de vacaciones
- los excedentes confirmados se escalan a una prueba posterior de salario base de cotización
- la prima vacacional se revisa en otra cédula usando los mismos trabajadores
- la relación fina con atestiguamientos, cédulas y componentes finales del expediente sigue pendiente de aterrizar mejor

## Errores comunes o alertas
- asumir que todos los registros del acumulado son vacaciones sin filtrar bien
- no excluir finiquitos
- trabajar fuera de la muestra
- calcular mal la antigüedad
- no aplicar correctamente el redondeo hacia arriba
- tratar un pago de ejercicios anteriores como excedente real
- no dejar documentada la explicación de la empresa
- no escalar excedentes a la prueba posterior

## Navegación
- [[../00 - Resumen de la Prueba]]
- [[../02 - Fuentes y Variantes]]
- [[Índice y Pendientes/Cambios a Obsidian - prueba 5.6.2 - Rubén]]
- [[Índice y Pendientes/Preguntas abiertas - prueba 5.6.2 - Rubén]]


## Archivos reales de esta carpeta
### Papel de trabajo / fuente operativa
- `5.10.2.1_SAP_ACUM_DE_NOM_CON_FOR_2024-1.xlsx`
  - ruta relativa: `./5.10.2.1_SAP_ACUM_DE_NOM_CON_FOR_2024-1.xlsx`

### Resultado real de la prueba
- `Resultado - 5.6.2 Revisión de Vacaciones.xlsx`
  - ruta relativa: `./Resultado - 5.6.2 Revisión de Vacaciones.xlsx`

## Navegación extendida
- [[Índice y Pendientes/Índice de documentos del cliente - Rubén]]
- [[Índice y Pendientes/Cambios a Obsidian - prueba 5.6.2 - Rubén]]
- [[Índice y Pendientes/Preguntas abiertas - prueba 5.6.2 - Rubén]]
