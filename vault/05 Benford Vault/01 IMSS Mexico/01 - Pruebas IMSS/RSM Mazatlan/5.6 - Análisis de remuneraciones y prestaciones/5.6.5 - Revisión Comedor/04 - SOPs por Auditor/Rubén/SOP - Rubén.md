# SOP - Rubén

## Prueba
- **Prueba madre:** 5.6 - Análisis de remuneraciones y prestaciones
- **Subprueba:** 5.6.5 - Revisión Comedor
- **Auditor:** Rubén

## Objetivo de la subprueba
Validar si la alimentación otorgada a los trabajadores es **onerosa** para efectos de la **Ley del Seguro Social**, conforme al **artículo 27 fracción V**, verificando que al trabajador se le descuente **al menos el 20% de la UMA vigente por cada alimento**.

La cédula también permite identificar si, al no cumplirse la onerosidad, el concepto **debe integrarse al salario** y si la empresa reflejó correctamente esa integración en relación con **5.6.0 Factores de integración**.

## Resultado esperado
La subprueba está correcta cuando el **descuento de comedor** aplicado al trabajador es **igual o mayor** al mínimo requerido calculado con base en la UMA y el número de alimentos.

Si el descuento es menor al mínimo requerido:
- la prestación **no cumple** con la onerosidad mínima
- **debe integrarse al salario**
- y la diferencia se debe corroborar contra **5.6.0 Factores de integración**

## Relación con otras pruebas
- **5.10.2.1**: de aquí sale el dato fuente de **DESCUENTO_COMEDOR_314**
- **5.6.0 Factores de integración**: se usa para corroborar si la empresa integró correctamente cuando existe diferencia

## Documentos usados en esta variante
### Resultado final de la subprueba
- `resultado/resultado-5.6.5 revisión comedor.xlsx`
  - Entregable final de la subprueba
  - Contiene la cédula de revisión, fórmulas, diferencias y conclusión por trabajador

### Papel de trabajo fuente
- `documentación/5.10.2.1 - Papel de trabajo fuente para 5.6.5.xlsx`
  - Papel de trabajo fuente reutilizado desde 5.10.2.1
  - De aquí sale el dato de **DESCUENTO_COMEDOR_314** usado para construir la prueba

## Documentos soporte ideales que podrían existir
Aunque en este caso no se tuvieron, idealmente esta subprueba podría apoyarse también en:
- papeleta de alimentos
- control del comedor de empleados
- recibo de nómina con número de alimentos descontados

## Faltantes reales de cierre de este caso
En este caso la empresa **no cuenta** con:
- papeleta de alimentos
- control de comedor
- número de alimentos reflejado en recibos de nómina

Esto debe quedar explícito en observaciones al cierre de la prueba.

## Dónde vive la data relevante
### En el entregable final `5.6.5 - Revisión Comedor.xlsx`
Las columnas relevantes visibles en la cédula son:
- Número nómina
- Nombre del trabajador
- Registro patronal
- Cuota diaria
- Fecha
- Periodo
- UMA vigente
- Número de alimentos en el periodo
- Monto a descontar auditoría
- Descuento efectuado por comedor
- Debe integrar al salario
- % integrado por empresa
- Cantidad a integrar
- Costo comida
- Observaciones
- NSS CFDI
- Importe CFDI
- Diferencia

### En el papel de trabajo fuente `5.10.2.1 - Papel de trabajo fuente para 5.6.5.xlsx`
El dato clave que alimenta la subprueba es:
- **DESCUENTO_COMEDOR_314**

## Lógica de cálculo
### Regla principal
Por cada alimento, el trabajador debe pagar **por lo menos el 20% de la UMA vigente del periodo**.

### Número de alimentos
En este caso, como no existe papeleta o control formal del comedor, el número de alimentos se infiere con la política de la empresa:

**Número de alimentos = descuento total / (UMA × 20%)**

En el entregable final aparece una fórmula equivalente a:

**ROUND(Descuento comedor / UMA / 0.2, 0)**

### Mínimo requerido
Una vez determinado el número de alimentos, se calcula:

**Mínimo requerido = número de alimentos × UMA vigente × 20%**

### Comparación principal
Se compara:
- **mínimo requerido**
vs
- **descuento real de comedor (`DESCUENTO_COMEDOR_314`)**

### Si cumple
Si el descuento real es mayor o igual al mínimo requerido:
- la prestación se considera **onerosa**
- no debe integrar al salario por esta causa
- la diferencia es 0

### Si no cumple
Si el descuento real es menor al mínimo requerido:
- la prestación **no cumple** con la onerosidad mínima
- **debe integrar al salario**
- se calcula la diferencia
- y se corrobora con **5.6.0 Factores de integración**

## Procedimiento paso a paso
1. Abrir el archivo de resultado `resultado/resultado-5.6.5 revisión comedor.xlsx`.
2. Abrir el archivo fuente `documentación/5.10.2.1 - Papel de trabajo fuente para 5.6.5.xlsx`.
3. Seleccionar una muestra de trabajadores **a criterio del auditor**, buscando cubrir **distintos periodos**.
4. Si existen varios registros patronales, tomar muestra **por cada registro patronal**.
5. Para cada trabajador seleccionado, identificar y capturar:
   - número de nómina
   - nombre del trabajador
   - registro patronal
   - cuota diaria
   - fecha final del periodo
   - número de periodo
   - UMA vigente del periodo
   - descuento de comedor
6. Ubicar en el papel de trabajo fuente el descuento real en el campo **DESCUENTO_COMEDOR_314**.
7. Validar la UMA vigente correcta del periodo revisado.
8. Determinar el número de alimentos:
   - si existiera papeleta, control de comedor o recibo con número de alimentos, tomarlo de ahí
   - si no existe soporte, inferirlo con la política de la empresa: **descuento / (UMA × 20%)**
9. Calcular el mínimo requerido: **número de alimentos × UMA × 20%**.
10. Comparar el mínimo requerido contra el descuento real.
11. Si el descuento real es menor al mínimo requerido, marcar que **debe integrar al salario**.
12. Calcular la cantidad a integrar como la diferencia faltante.
13. Corroborar esa situación contra **5.6.0 Factores de integración**, revisando si la empresa integró correctamente el **8.33%** conforme al tratamiento aplicable.
14. Si existe diferencia, dejarla visible en la cédula y revisarla con la empresa.
15. Documentar en observaciones cualquier faltante de soporte o criterio aplicado para inferir el número de alimentos.

## Bifurcaciones / variantes por caso
### Si existe soporte del número de alimentos
Si hay papeleta, control de comedor o recibo con número de alimentos, ese dato se toma directamente del soporte.

### Si no existe soporte del número de alimentos
Si no existe soporte, como en este caso, el número de alimentos se infiere con la política de la empresa a partir del descuento y la UMA.

### Si hay varios registros patronales
El cálculo no cambia, pero la muestra debe cubrir trabajadores de cada RP.

## Criterio de cierre
La subprueba queda correctamente documentada cuando permite responder si la alimentación otorgada a los trabajadores es **onerosa** para efectos de la LSS y, cuando no lo es, deja clara la diferencia y su relación con **5.6.0 Factores de integración**.

## Observaciones finales de este caso
- La empresa no proporcionó papeleta de alimentos.
- La empresa no proporcionó control de comedor.
- El número de alimentos no viene reflejado en los recibos de nómina.
- En consecuencia, para este caso el número de alimentos se infiere conforme a la política de la empresa y a la fórmula de la propia cédula.
- Si existe diferencia, se deja documentada y se revisa con la empresa.
