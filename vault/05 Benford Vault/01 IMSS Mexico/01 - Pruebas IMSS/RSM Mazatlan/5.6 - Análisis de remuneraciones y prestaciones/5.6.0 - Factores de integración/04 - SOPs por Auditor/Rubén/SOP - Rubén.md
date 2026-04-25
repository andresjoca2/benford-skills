# SOP - Rubén

## Subprueba
`5.6.0 - Factores de integración`

## Objetivo de la prueba
Validar que los factores de integración usados por la empresa correspondan a las prestaciones fijas que realmente aplican a cada categoría o grupo de colaboradores, y que dichas prestaciones estén correctamente reflejadas según la antigüedad.

Esta prueba no busca validar si a cada trabajador se le asignó el contrato correcto. Lo que valida es que las prestaciones aplicadas sí correspondan al contrato, categoría o grupo, y que el factor de integración esté bien construido con base en esas prestaciones y la antigüedad.

## Cuándo aplica esta forma de ejecutar la prueba
Esta forma de ejecutar la prueba aplica cuando la empresa:
- entrega un archivo de factores de integración ya armado
- maneja prestaciones de ley o prestaciones superiores
- tiene categorías o grupos con prestaciones distintas
- puede tener personal sindicalizado o de confianza
- requiere validar la tabla de factores contra contrato individual, contrato colectivo o tabla de puestos

## Resultado correcto
La prueba queda correcta cuando:
- las tablas de factores proporcionadas por la empresa fueron revisadas
- las prestaciones incluidas en esas tablas cuadran con el contrato aplicable
- la variación por antigüedad está correctamente reflejada
- cualquier diferencia o caso particular quedó documentado en observaciones
- se puede dar visto bueno a la empresa

## Resumen corto de la prueba
La empresa entrega su archivo 5.6.0 con tablas de factores. Rubén revisa las prestaciones que usa esa tabla, las compara contra el contrato individual o colectivo aplicable y valida que cambien bien según la antigüedad. Si algo no cuadra, lo aclara con la empresa. Si todo cuadra, deja observaciones cuando aplique y da visto bueno.

## Documentos y archivos necesarios

### Documentos obligatorios siempre
1. `5.6.0 - Factores de integración.xlsx`
   - Papel de trabajo principal y archivo final de validación.
2. `Contrato ejemplo - prestaciones y factor de integración.pdf`
   - Se usa como ejemplo real de cómo se identifican prestaciones, reglas por antigüedad y condiciones contractuales.

### Documentos obligatorios según el caso
3. Contrato colectivo vigente del caso auditado
   - Obligatorio cuando existe sindicato o prestaciones contractuales especiales.
4. Contrato individual vigente del caso auditado
   - Obligatorio cuando la validación se sostiene en condiciones individuales o de personal de confianza.
5. Tabla de puestos o listado de puestos con categoría / tipo
   - Obligatorio cuando la empresa tiene grupos con prestaciones distintas y el puesto define el tipo de factor.
6. Tabla de factores de integración proporcionada por la empresa
   - Si falta un contrato específico, la empresa debe proporcionar la tabla para poder cotejar.

### Documentos que hoy sí forman parte del paquete final de esta variante
- `5.6.0 - Factores de integración.xlsx`
- `Contrato ejemplo - prestaciones y factor de integración.pdf`
- `Notas complementarias - percepciones fijas y variables - 5.6.0.txt`

## Distinción entre tipos de documento
### Raw / fuente del cliente
- `5.6.0 - Factores de integración.xlsx`
- contrato colectivo o contrato individual del caso, cuando exista
- tabla de puestos de la empresa, cuando exista

### Documento soporte
- `Contrato ejemplo - prestaciones y factor de integración.pdf`
- `Notas complementarias - percepciones fijas y variables - 5.6.0.txt`

### Papel de trabajo real del auditor
- En esta variante, el mismo archivo `5.6.0 - Factores de integración.xlsx` funciona como papel de trabajo principal, porque sobre ese archivo se valida la lógica de prestaciones, antigüedad y factor.

### Output final de la prueba
- No se separa un archivo adicional por default.
- El resultado queda en la validación del propio `5.6.0 - Factores de integración.xlsx` y en las observaciones que sustentan el visto bueno o la aclaración con la empresa.

## Dónde vive la data relevante dentro de los documentos

### En `5.6.0 - Factores de integración.xlsx`
#### Hoja `TABLAS` / `TABLAS2023` / `TABLAS2024` / `TABLA FACTOR 2024`
Aquí vive la lógica principal del factor. Se localizan columnas como:
- `ID`
- `Tipo`
- `Años de Servicio`
- `Días de vacaciones`
- `Prima Vacacional`
- `Aguinaldo`
- `Factor de Integración`

Estas hojas sirven para validar qué prestaciones fijas corresponden a cada año de servicio y a cada tipo de factor.

#### Hoja `Puestos`
Aquí vive la relación entre:
- `Puesto`
- `Tipo de Factor`

Esta hoja permite agrupar cada puesto en su categoría o tipo.

#### Hoja `factores actual`
Aquí se observan datos por colaborador, por ejemplo:
- nombre
- puesto
- registro patronal
- fecha de alta
- factor de integración aplicado
- salario diario

Esta hoja sirve para ver cómo la empresa está aterrizando el factor en trabajadores reales.

### En `Contrato ejemplo - prestaciones y factor de integración.pdf`
La data útil vive en las cláusulas donde se establecen:
- aguinaldo
- vacaciones
- prima vacacional
- reglas por antigüedad
- prestaciones adicionales

Del contrato ejemplo sí se identificó, entre otras cosas:
- aguinaldo de 50 días
- vacaciones anuales
- prima vacacional de 100%
- incrementos por antigüedad en ciertos años

### En `Notas complementarias - percepciones fijas y variables - 5.6.0.txt`
La data útil vive como lógica de validación operativa:
- qué se considera percepción fija
- qué se considera percepción variable
- fórmula de cálculo del factor de integración
- qué hacer cuando falta contrato

## Variables exactas que se extraen
### Del archivo 5.6.0
- tipo de factor
- ID
- años de servicio
- días de vacaciones
- prima vacacional
- aguinaldo
- factor de integración
- puesto
- fecha de alta
- factor aplicado por la empresa
- salario diario

### Del contrato o contrato colectivo
- prestaciones aplicables
- condiciones del primer año
- cambios por antigüedad
- prestaciones superiores a ley
- si se trata de condiciones individuales o colectivas

### De la lógica complementaria
- clasificación entre percepción fija y variable
- fórmula de cálculo del factor de integración
- regla de truncamiento a 4 dígitos

## Percepciones fijas y variables
### Percepciones fijas
Son las que la empresa sabe de antemano que va a pagar. Para esta prueba las principales son:
- vacaciones
- prima vacacional
- aguinaldo
- y cualquier otra prestación fija que aplique en la empresa

### Percepciones variables
Son las que no se sabe con certeza si se otorgarán durante el ejercicio. Ejemplos:
- prima dominical
- compensación
- despensa
- premio de asistencia
- premio de puntualidad
- horas extras

Para esta prueba, el foco principal del factor de integración está en las percepciones fijas.

## Proceso paso a paso
1. Abrir `5.6.0 - Factores de integración.xlsx`.
2. Revisar las tablas de factores proporcionadas por la empresa.
3. Identificar si la empresa opera con prestaciones de ley o con prestaciones diferenciadas por categoría.
4. Identificar si existe sindicato y, por lo tanto, contrato colectivo.
5. Revisar el contrato que mande en el caso:
   - contrato colectivo, cuando haya sindicato
   - contrato individual, cuando aplique por trabajador o categoría
   - tabla de puestos, cuando el puesto defina el tipo de factor
6. Corroborar que las prestaciones del archivo 5.6.0 coincidan con las prestaciones del contrato aplicable.
7. Validar principalmente:
   - vacaciones
   - prima vacacional
   - aguinaldo
   - cualquier otra prestación fija
8. Revisar que la antigüedad esté reflejada correctamente en la tabla por años de servicio.
9. Revisar en la hoja `Puestos` qué tipo de factor le corresponde a cada puesto.
10. Confirmar que el puesto esté agrupado en la categoría correcta, por ejemplo:
    - colaboradores
    - supervisores
    - comité operativo
    - comité ejecutivo
    - sindicalizado
11. Validar que el factor de integración mostrado en la tabla corresponda a las prestaciones y a la antigüedad.
12. Si algo no cuadra, revisar si el puesto empata con una tabla ya existente.
13. Si no empata, pedir a la empresa la tabla o contrato faltante para amarrarlo.
14. Si hace falta, asignar una nueva categoría para ese puesto con sustento documental.
15. Documentar cualquier diferencia en observaciones.
16. Cuando contratos, tablas y antigüedad ya cuadran, dar visto bueno y concluir la prueba.

## Fórmula operativa del factor de integración
La lógica operativa reportada por Rubén es:
1. tomar los días de vacaciones
2. multiplicarlos por la prima vacacional
3. dividir el resultado entre 365
4. sumar la parte proporcional del aguinaldo entre 365
5. sumar la unidad
6. truncar el resultado a 4 dígitos

## Validaciones clave
- que la tabla usada por la empresa sí corresponda a las prestaciones vigentes
- que el contrato soporte la lógica de prestaciones usada en la tabla
- que el tipo de factor sí corresponda al puesto
- que la antigüedad cambie correctamente los días o condiciones aplicables
- que el factor de integración final esté alineado con las prestaciones fijas

## Casos especiales y bifurcaciones
### Cuando la empresa usa prestaciones de ley
Se usa tabla de ley.

### Cuando la empresa tiene prestaciones superiores o categorías distintas
Se usa tabla especial y se valida contra:
- contrato individual
- contrato colectivo
- tabla de puestos
- o combinación de estos

### Cuando hay contrato colectivo
- implica sindicato
- las prestaciones contractuales suelen revisarse cada dos años
- si cambian las prestaciones, cambian las tablas
- la validación se hace contra el contrato colectivo

### Cuando falta un contrato de una categoría
La empresa debe otorgar una tabla de factores de integración para poder cotejar.

### Cuando un puesto no aparece o no empata
- se revisa si empata con una tabla existente
- se pregunta a la empresa si existe tabla o contrato específico
- se puede asignar una nueva categoría para ese puesto, con sustento

## Evidencia mínima para cierre
- `5.6.0 - Factores de integración.xlsx`
- contrato colectivo o contrato individual aplicable
- contratos o soporte suficiente de las categorías revisadas
- validación de prestaciones fijas
- observaciones documentadas cuando haya diferencias
- visto bueno final de la revisión

## Pendientes reales de cierre
Con los archivos hoy disponibles sí quedó armada la lógica completa de la prueba, pero para un cierre documental perfecto del caso auditado todavía pueden hacer falta, según el caso real:
- contrato colectivo vigente de la empresa auditada
- contrato individual vigente de la categoría específica auditada
- tabla de puestos real del caso auditado

Si esos documentos no existen o no aplican, debe quedar documentado expresamente.

## Output final de la prueba
El resultado de la prueba es la validación de que:
- la tabla de factores de integración de la empresa está correctamente construida
- las prestaciones base corresponden al contrato aplicable
- la antigüedad está correctamente reflejada
- el factor usado tiene sustento suficiente

Cuando hay diferencias, el resultado incluye observaciones y la necesidad de aclaración o ajuste por parte de la empresa.

## Relación con plantilla fuente y otros entregables
Esta prueba sirve como soporte de validación de condiciones laborales y prestaciones que impactan la integración salarial.

Con lo extraído hasta ahora, sí queda claro que la prueba sostiene la lógica de prestaciones y antigüedad que termina impactando la base de integración. Todavía no quedó amarrado con total precisión a una hoja o celda específica de la Plantilla fuente de Información Patronal, así que eso debe mantenerse como punto abierto de trazabilidad fina.

## Relación con otras pruebas
Esta subprueba se relaciona con la familia `5.6 - Análisis de remuneraciones y prestaciones`, especialmente con:
- `5.6.1 - Revisión de Aguinaldo`
- `5.6.2 - Revisión de Vacaciones`
- `5.6.3 - Revisión de Prima Vacacional`

Porque las tres comparten la lógica de prestaciones base que alimentan el factor de integración.

## Fuentes y variante de esta ejecución
### Fuente principal
- explicación operativa de Rubén
- archivo real `5.6.0 - Factores de integración.xlsx`
- contrato ejemplo en PDF compartido durante la extracción
- notas complementarias de percepciones fijas / variables y fórmula

### Lectura actual de la variante
En esta variante, Rubén parte del archivo de factores de integración que entrega la empresa, valida las prestaciones contra contrato y amarra la lógica por puesto, categoría y antigüedad. Si algo no cuadra, lo consulta con la empresa y documenta la observación.

## Errores comunes o alertas
- asumir que el contrato correcto por trabajador es el objetivo principal de la prueba
- no distinguir entre percepciones fijas y variables
- usar tabla de ley cuando la empresa sí tiene prestaciones diferenciadas
- no validar la antigüedad contra la tabla correcta
- dejar puestos sin categoría o sin tipo de factor sustentado
- dar por cerrada la prueba sin observaciones cuando sí hubo diferencias

## Referencias al paquete documental de esta carpeta
- `[[SOP - Rubén]]`
- `[[../Rubén/5.6.0 - Factores de integración.xlsx]]`
- `[[../Rubén/Contrato ejemplo - prestaciones y factor de integración.pdf]]`
- `[[../Rubén/Notas complementarias - percepciones fijas y variables - 5.6.0.txt]]`
