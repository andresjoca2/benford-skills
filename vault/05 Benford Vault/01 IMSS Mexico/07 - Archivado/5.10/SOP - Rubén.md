# SOP - Rubén

Volver a: [[../../00 - Resumen de la Prueba]]

## Prueba
**5.10 - Conciliación de Nómina vs. Contabilidad**  
**Auditor / variante:** Rubén

## Objetivo
Conciliar la información de nómina contra la contabilidad de la empresa para validar que la nómina entregada esté completa, que los conceptos estén correctamente contabilizados y que la base de trabajo sea confiable para continuar con las demás pruebas del dictamen IMSS.

## Archivos trabajados en esta variante
### Entregable final
- [[5.10.1 - Conciliación de nóminas vs contabilidad.xlsx]]

### Lado nómina
- [[5.10.2 - Acumulado de Nóminas.xlsx]]
- [[5.10.2.1 - SAP ACUM DE NOM CON FOR 2024.xlsx]]
- [[NOMINA ENERO.xlsx]]
- [[NOMINA MARZO.xlsx]]
- [[RESUMEN DE NÓMINA A EXCEL MAY-JUN.xlsx]]

### Lado contabilidad
- [[SAP balanza dic 2024 con ajustes definitivo.xlsx]]
- [[SAP Auxiliares 2024.xlsx]]

### Validación adicional
- [[5.10.3 - SAP timbres 2024.xlsx]]

## Criterio de salida
La prueba queda cerrada cuando cada concepto de nómina queda conciliado contra su equivalente contable y la columna de diferencias queda en cero o con centavos no representativos. Si aparecen diferencias relevantes, Rubén no avanza hasta rastrear su causa.

## Proceso operativo
### 1. Reunir el universo documental
Juntar todas las listas de raya / nóminas por periodo del ejercicio, incluyendo corridas ordinarias, finiquitos y extraordinarias cuando existan.

### 2. Consolidar nómina del año
Usar macro para pegar todos los archivos del año en un solo Excel, agregando metadatos mínimos como empresa, tipo de periodo y número de periodo.

### 3. Limpiar la nómina cruda
Eliminar encabezados repetidos, totales por departamento, totales generales, total percepciones, neto a pagar, filas vacías y filas sin número de empleado.

### 4. Extraer metadata del trabajador
Bajar como columnas la información del trabajador para que cada fila de concepto quede contextualizada con NSS, clave, nombre, RFC, CURP, fecha de alta, puesto, salario y demás campos necesarios.

### 5. Linealizar percepciones y deducciones
Convertir la estructura lateral de la lista de raya a un formato lineal: un concepto por fila, importe asociado, periodo y marca de tipo `P` o `D`.

### 6. Formatear el acumulado
Normalizar NSS, RFC, fechas, salarios e importes. El resultado es el acumulado trabajable de nómina.

### 7. Asignar mes y bimestre
Correlacionar el periodo contra el catálogo de periodos para asignar mes y bimestre correctos.

### 8. Generar resumen mensual
Agrupar por concepto y mes hasta llegar al total anual por concepto que alimenta el lado nómina de la conciliación.

### 9. Preparar contabilidad
Tomar la balanza y los auxiliares, reformatear auxiliares para que cada movimiento quede tabular y cruzar balanza contra auxiliares para identificar cuentas afectables.

### 10. Seleccionar cuentas de nómina
Revisar las cuentas afectables y decidir cuáles corresponden al universo de nómina.

### 11. Asignar IDs
Asignar IDs cortos a las cuentas contables para homologar conceptos equivalentes y poder consolidarlos vía `SUMIF`.

### 12. Consolidar lado contable
Listar IDs únicos y obtener el total contable por ID.

### 13. Conciliar
Comparar total anual por concepto de nómina contra total contable homologado en [[Anexos/5.10.1 - Conciliación de nóminas vs contabilidad.xlsx]].

### 14. Resolver diferencias
Antes de escalar con la empresa, revisar si la diferencia proviene de cuenta omitida, mala clasificación, error en contabilidad, nómina incompleta o periodo faltante.

## Notas operativas
- El periodo es la unidad mínima real del lado nómina.
- Los CFDI timbrados son validación adicional, no la base principal de la prueba.
- La PTU tiene tratamiento especial y no se agota dentro de esta conciliación.
- Si la contabilidad no cuadra, Rubén no avanza con otras pruebas.
