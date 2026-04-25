# SOP - Rubén

## Prueba
- **Prueba madre:** 5.6 - Análisis de remuneraciones y prestaciones
- **Subprueba:** 5.6.6 - Revisión de Despensa
- **Auditor:** Rubén Partida

## Objetivo de la subprueba
Validar que la **despensa otorgada** a los trabajadores no rebase el límite de **40% de la UMA diaria** aplicable para efectos del IMSS y, además, corroborar que la **despensa pagada en nómina** del periodo amarre contra las **facturas de Sí Vale** revisadas.

La subprueba busca detectar dos cosas:
1. si el **importe facturado** de despensa coincide con la **despensa pagada en nómina** del periodo correspondiente
2. si, a nivel individual, la despensa entregada a ciertos trabajadores **rebasa el límite permitido** y por tanto genera **excedente integrable al SBC**

## Resultado esperado
La subprueba está correcta cuando:
- las **3 facturas revisadas** amarran contra la nómina del periodo correspondiente
- en el análisis individual, la despensa pagada por trabajador **no excede** el límite de **UMA diaria × 40% × días del periodo**, salvo casos explicados
- si existe excedente real, este queda **documentado**, **observado** e **integrado al salario base de cotización**

## Relación con otras pruebas
- **5.6.2.1**: de aquí sale la lógica de selección de las facturas que se revisan para la subprueba
- **5.10.2.1**: papel de trabajo fuente reutilizado para obtener periodo, despensa pagada y días del periodo
- **5.6**: esta subprueba forma parte del análisis de remuneraciones y prestaciones

## Documentos usados en esta variante
### Resultado final de la subprueba
- `resultado/resultado-5.6.6 revisión despensa.xlsx`
  - Entregable final real de la subprueba
  - La hoja clave es **VD**
  - Se divide en **análisis global** y **análisis individual**

### Papeles de trabajo y raw relevantes
- `documentos/5.10.2.1 - Papel de trabajo fuente para 5.6.6.xlsx`
  - Papel de trabajo fuente reutilizado desde 5.10.2.1
  - De aquí salen los datos base para armar la revisión global e individual
- `documentos/Factura Si Vale - Despensa 01.pdf`
- `documentos/Factura Si Vale - Despensa 02.pdf`
- `documentos/Factura Si Vale - Despensa 03.pdf`
  - Facturas reales de Sí Vale revisadas para la subprueba

## Documentos obligatorios para ejecutar y cerrar esta variante
1. **3 facturas de Sí Vale** correspondientes a distintos periodos de revisión
2. **5.10.2.1** como acumulado de nómina reutilizado
3. **Cédula final de la subprueba 5.6.6**
4. **Hoja VD** como hoja de trabajo y conclusión dentro del entregable final

## Dónde vive la data relevante
### En las facturas de Sí Vale
El dato clave para el amarre global se toma del:
- **campo “Importe”** del concepto **“DESPENSA CARGA DE SALDOS”**

No se usa para el amarre de despensa:
- comisión
- IVA
- total a cobrar

### En el archivo `5.10.2.1 - Papel de trabajo fuente para 5.6.6.xlsx`
Las columnas clave para esta subprueba son:
- **B** = tipo de nómina, se prefieren registros con **Q**
- **C** = periodo
- **HG** = despensa pagada
- **AM** = despensa pagada
- **HJ** = días del periodo

### En el entregable final `resultado-5.6.6 revisión despensa.xlsx`
La hoja clave es:
- **VD**

Esta hoja se divide en dos bloques:
- **análisis global**
- **análisis individual**

En ambos bloques se llenan las columnas de la cédula con información obtenida principalmente de **5.10.2.1** y de las **facturas de Sí Vale**.

## Lógica general de la subprueba
La subprueba tiene dos bloques.

### Bloque 1. Análisis global
Se revisan **3 facturas** de **3 periodos**.

Para cada factura:
1. se identifica el **periodo** de la factura seleccionada
2. en **5.10.2.1** se filtra el mismo periodo por la **columna C**
3. se suma la despensa pagada del periodo usando **HG + AM**
4. ese total se compara contra el **Importe** del concepto **DESPENSA CARGA DE SALDOS** de la factura
5. la diferencia, si existe, queda visible en la cédula

### Bloque 2. Análisis individual
Se hace una **revisión aleatoria de trabajadores** tomados del archivo **5.10.2.1**.

Para seleccionar trabajadores:
- la selección es **aleatoria**
- se busca que sean de **diferentes periodos**
- la selección es **independiente** de las facturas
- se prefieren registros de nómina **quincenal**, identificados por **Q** en la **columna B**
- solo entran trabajadores con **despensa pagada**, es decir, cuando **HG + AM > 0**

## Fórmula del análisis individual
La lógica es:

**Excedente = despensa pagada - (UMA diaria × 40% × días del periodo)**

Donde:
- **despensa pagada** = **HG + AM**
- **UMA diaria** = valor vigente tomado de **INEGI**
- **días del periodo** = **HJ**

La fórmula se aplica **por cada trabajador seleccionado**.

## Procedimiento paso a paso
1. Abrir el archivo `resultado/resultado-5.6.6 revisión despensa.xlsx`.
2. Ir a la hoja **VD**.
3. Identificar los dos bloques de trabajo: **análisis global** y **análisis individual**.
4. Abrir el archivo `documentos/5.10.2.1 - Papel de trabajo fuente para 5.6.6.xlsx`.
5. Abrir también las 3 facturas de Sí Vale dentro de `documentos/`.

### Parte A. Análisis global
6. Tomar la primera factura revisada.
7. Identificar el periodo que corresponde a esa factura.
8. En `5.10.2.1`, filtrar ese periodo usando la **columna C**.
9. Sumar la despensa pagada del periodo usando **HG + AM**.
10. En la factura, ubicar el **Importe** del concepto **DESPENSA CARGA DE SALDOS**.
11. Comparar el importe de nómina contra el importe de factura.
12. Capturar el resultado en la hoja **VD** dentro del bloque de **análisis global**.
13. Repetir el mismo proceso para las otras dos facturas.
14. Si las 3 facturas amarran, dejar evidenciado que el análisis global cuadra.
15. Si alguna no amarra, dejar visible la diferencia y **verificar con la empresa qué fue lo que pasó**.

### Parte B. Análisis individual
16. En `5.10.2.1`, seleccionar trabajadores de forma **aleatoria**.
17. Procurar tomar trabajadores de **diferentes periodos**.
18. Preferir registros de nómina **Q** en la **columna B**.
19. Tomar solo trabajadores con **despensa pagada**, es decir, donde **HG + AM > 0**.
20. Para cada trabajador seleccionado, recuperar:
   - NSS
   - periodo en **C**
   - despensa pagada en **HG + AM**
   - días del periodo en **HJ**
21. Consultar la **UMA diaria vigente** del año en INEGI.
22. Calcular el límite individual: **UMA × 40% × días del periodo**.
23. Restar ese límite a la despensa pagada para obtener el posible excedente.
24. Si el resultado es menor o igual a cero, no existe excedente real para ese trabajador.
25. Si el resultado es mayor a cero, tratarlo inicialmente como **posible excedente**.
26. Verificar con la empresa si ese excedente es real o si corresponde a un **caso particular**.
27. Documentar el resultado por trabajador dentro del bloque de **análisis individual** en la hoja **VD**.

## Bifurcaciones y manejo de excepciones
### Caso normal
Si la despensa pagada no rebasa el límite calculado:
- no hay excedente
- no hay integración adicional por esta causa
- se deja la revisión soportada en la cédula

### Caso con posible excedente
Si la despensa pagada rebasa el límite calculado:
- se analiza si el excedente **sí es real**
- si sí es real, se debe:
  - documentar en la prueba
  - dejar observación al final
  - explicar por qué se generó la diferencia
  - **integrarlo al salario base de cotización**

### Falso positivo por alta
La excepción principal identificada por Rubén es:
- **desfase por alta**

Cuando un trabajador es de **alta**, la tarjeta de vales puede no quedar lista en el mismo periodo, por lo que la despensa puede pagarse en el **periodo subsecuente**.

Si esto ocurre:
- el aparente excedente o diferencia **puede no corresponder al periodo revisado**
- puede tratarse de despensa correspondiente a un **periodo anterior**
- por eso debe **verificarse con la empresa** antes de concluir que el excedente es real

## Criterio de cierre
La subprueba queda correctamente ejecutada cuando:
- se revisan **3 facturas** de **3 periodos**
- si la prestación es mensual, se revisan **3 meses**
- si es quincenal, se revisan los **periodos correspondientes** a las 3 facturas
- se captura el **análisis global** en la hoja **VD**
- se realiza el **análisis individual** con selección aleatoria desde **5.10.2.1**
- si hay observaciones o diferencias, se documentan en la parte inferior de la cédula y se revisan con la empresa

## Evidencia mínima para darla por bien hecha
- 3 facturas revisadas y amarradas contra la nómina del periodo correspondiente
- análisis global capturado en la hoja **VD**
- análisis individual capturado en la hoja **VD**
- trabajadores seleccionados aleatoriamente desde **5.10.2.1**
- cálculo individual del límite del **40% UMA diaria** por trabajador revisado
- excedentes reales identificados y documentados cuando existan
- observación final documentada cuando exista diferencia

## Relación con entregables finales
Esta subprueba funciona como una **cédula de revisión específica** dentro del análisis de remuneraciones y prestaciones.

Su salida inmediata es la **hoja VD** del entregable final de la subprueba.

Cuando existe excedente real:
- el hallazgo no se queda solo como observación interna
- debe tener efecto en la **integración al salario base de cotización**
- por eso su valor sirve como soporte de la lógica de integración dentro del expediente de trabajo del dictamen

## Observaciones finales de esta variante
- La referencia a la **4.5** se omite en esta versión documental.
- Para esta variante, el análisis individual se documenta como una **revisión aleatoria de trabajadores obtenidos del archivo 5.10.2.1**.
- La selección individual es independiente de las facturas.
- El principal caso de excepción identificado es el **desfase por alta**.
- Si una factura o un trabajador muestran diferencia, la primera acción es **verificar con la empresa qué fue lo que pasó**.

## Resumen operativo ultra corto
1. Abre la hoja **VD** del archivo final.
2. Revisa **3 facturas** de despensa y amárralas contra la nómina del periodo usando **HG + AM** en **5.10.2.1**.
3. Luego toma una muestra **aleatoria** de trabajadores desde **5.10.2.1**.
4. Para cada trabajador, calcula el límite de **UMA × 40% × HJ**.
5. Compáralo contra su despensa pagada **HG + AM**.
6. Si hay excedente, verifica si es real o si se explica por **alta**.
7. Si sí es real, documenta, observa e integra al **SBC**.
8. Deja todo capturado en la hoja **VD**.
