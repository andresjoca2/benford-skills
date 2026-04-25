# SOP - Rubén

## Prueba
- **Prueba:** 5.1 - Vaciado de liquidaciones
- **Auditor:** Rubén
- **Tipo:** Prueba principal
- **Objetivo operativo:** reconstruir y amarrar por folio de liquidación, por registro patronal, lo que se debía pagar al IMSS/RCV/INFONAVIT contra lo efectivamente pagado y dejar la salida lista para poblar la hoja **Cuotas pagadas al Instituto** de la Plantilla fuente de Información Patronal.

## Qué valida esta prueba
La prueba 5.1 valida que, por cada folio de liquidación y por cada registro patronal, lo que se debía pagar al IMSS/RCV/INFONAVIT según la evidencia operativa coincida con:
- lo pagado realmente,
- lo soportado por las cédulas,
- y lo que después se reporta en la Plantilla fuente de Información Patronal, en la parte de **Cuotas pagadas al Instituto**.

## Cuándo consideras que la prueba quedó bien hecha
La prueba está bien hecha cuando se cumplen todas estas condiciones:
- ya se reconstruyó el amarre completo por **folio**, no solo por mes;
- **Total a Pagar** e **Importe Comprobante** cuadran exactamente;
- **Comprobación = 0** en cada fila;
- la fila queda soportada con sus documentos fuente;
- la comparación **RT / EMA / AUD** queda visible para análisis;
- la salida queda lista para trasladarse a **Cuotas pagadas al Instituto**.

## Por qué importa esta prueba
Esta prueba importa porque reconstruye la evidencia de pago a nivel de folio y evita que se cargue a la Plantilla fuente una salida incompleta, mal soportada o mal amarrada contra los pagos reales. Si aquí algo no cuadra, se contamina la hoja **Cuotas pagadas al Instituto** y se rompe la trazabilidad hacia el dictamen.

## Unidad real de trabajo
No se trabaja por mes consolidado.

La lógica correcta es:
- **RP** = unidad de organización documental;
- **Periodo** = unidad de búsqueda y cruce de evidencia;
- **Folio** = unidad real de amarre y validación.

La fila de control final es una **fila por folio**.

## Factores que cambian el proceso
La forma de ejecutar la prueba cambia principalmente por:
- número de registros patronales;
- cantidad de folios por periodo;
- tipo de periodo;
- disponibilidad y forma de los comprobantes;
- diferencia entre mensual y bimestral;
- pagos extemporáneos, complementarios o aclaraciones;
- diferencias de prima de riesgo entre RT, EMA y AUD;
- existencia o no de Declaración de Prima de Riesgo;
- estructura corporativa con varios RFC o empresas relacionadas.

## Documentos que usa la prueba

### Raw / fuente del cliente
- Disco de pago SUA (`.sua`)
  - **Archivo en esta carpeta:** `Disco de pago SUA.sua`
  - **Ruta:** `01 - Pruebas IMSS/5.1 - Vaciado de liquidaciones/04 - SOPs por Auditor/Rubén/Disco de pago SUA.sua`
- Cédula mensual (`.pdf`)
  - **Archivo en esta carpeta:** `Cédula de determinación mensual.pdf`
  - **Ruta:** `01 - Pruebas IMSS/5.1 - Vaciado de liquidaciones/04 - SOPs por Auditor/Rubén/Cédula de determinación mensual.pdf`
- Cédula bimestral (`.pdf`)
  - **Archivo en esta carpeta:** `Cédula de determinación bimestral.pdf`
  - **Ruta:** `01 - Pruebas IMSS/5.1 - Vaciado de liquidaciones/04 - SOPs por Auditor/Rubén/Cédula de determinación bimestral.pdf`
- Comprobantes bancarios (`.pdf`)
  - **Archivo en esta carpeta:** `Comprobantes bancarios de pago SUA.pdf`
  - **Ruta:** `01 - Pruebas IMSS/5.1 - Vaciado de liquidaciones/04 - SOPs por Auditor/Rubén/Comprobantes bancarios de pago SUA.pdf`
- Emisión EMA/EBA
  - **Archivo en esta carpeta:** `Emisión EMA-EBA.xls`
  - **Ruta:** `01 - Pruebas IMSS/5.1 - Vaciado de liquidaciones/04 - SOPs por Auditor/Rubén/Emisión EMA-EBA.xls`
- Declaración de Prima de Riesgo de Trabajo
  - **Archivo en esta carpeta:** `Declaración de Prima de Riesgo de Trabajo.pdf`
  - **Ruta:** `01 - Pruebas IMSS/5.1 - Vaciado de liquidaciones/04 - SOPs por Auditor/Rubén/Declaración de Prima de Riesgo de Trabajo.pdf`
- Alta del seguro
  - **Archivo en esta carpeta:** `Alta de Seguro.pdf`
  - **Ruta:** `01 - Pruebas IMSS/5.1 - Vaciado de liquidaciones/04 - SOPs por Auditor/Rubén/Alta de Seguro.pdf`
- Tarjeta de Identificacion Patronal
  - **Archivo en esta carpeta:** `Tarjeta de Identificacion Patronal.pdf`
  - **Ruta:** `01 - Pruebas IMSS/5.1 - Vaciado de liquidaciones/04 - SOPs por Auditor/Rubén/Tarjeta de Identificacion Patronal.pdf`

### Papel de trabajo real del auditor
- Workbook de metodología / amarre que usa Rubén
  - **Archivo en esta carpeta:** `Resultado - 5.1.xlsx`
  - **Equivale al papel de trabajo real originalmente llamado:** `5.1 - Vaciado de liquidaciones - amarre - Rubén.xlsx`
  - **Ruta:** `01 - Pruebas IMSS/5.1 - Vaciado de liquidaciones/04 - SOPs por Auditor/Rubén/Resultado - 5.1.xlsx`

## Documentos obligatorios para cerrar la prueba

La lógica de cierre documental correcta es esta:

### Obligatorios siempre
- Disco de pago SUA
- Cédula mensual
- Cédula bimestral
- Comprobante bancario
- Emisión EMA/EBA
- Workbook de Rubén

### Obligatorios según el caso
- Declaración de Prima de Riesgo de Trabajo, cuando aplique análisis completo de prima
- Alta del seguro, solo si es el primer año del cliente en auditoría IMSS y no existe información histórica suficiente o no existe declaración utilizable

## Fuentes y variante documentada
Este SOP documenta únicamente la **variante operativa de Rubén** para la prueba 5.1.
No compara con otros auditores ni consolida criterio oficial.

## Ejemplos reales ya identificados en esta sesión
Sí se identificaron ejemplos reales de:
- disco de pago SUA;
- cédula mensual;
- cédula bimestral;
- emisión EMA/EBA;
- comprobante bancario;
- declaración de prima de riesgo;
- workbook de metodología / amarre de Rubén.

Sigue faltando ejemplo real de:
- alta del seguro.

## Dónde vive la data en cada documento

### 1) Disco de pago SUA
- **Tipo documental:** raw / fuente del cliente
- **Formato real:** archivo `.sua`, tratado como fuente estructurada
- **Obligatoriedad:** prácticamente obligatorio para ejecutar la 5.1 completa
- **Llave operativa:** `registro patronal + periodo + folio`

#### Qué se extrae
- folio de liquidación;
- registro patronal;
- periodo / fin de mes;
- trabajadores;
- días cotizados;
- días de ausentismo;
- días de incapacidad;
- componentes IMSS;
- componentes RCV;
- componentes INFONAVIT;
- Total IMSS;
- Total RCV;
- Total INFONAVIT;
- Total a Pagar.

#### Dónde está
- **PARTE A:** identificación general del registro / folio / periodo y trabajadores;
- **PARTE B:** días cotizados, ausentismo e incapacidad;
- **PARTE D:** bloque económico que luego alimenta el amarre.

#### Qué no resuelve por sí solo
No resuelve de forma suficiente la separación fina patronal / obrero por ramo. Para eso se siguen usando cédulas mensual y bimestral.

## 2) Cédula mensual
- **Tipo documental:** raw / fuente del cliente
- **Formato real:** PDF
- **Obligatoriedad:** obligatoria

#### Qué se extrae
- registro patronal;
- periodo;
- importes del bloque IMSS;
- desglose por ramos de IMSS;
- separación patronal y obrero;
- RT tomada en la liquidación cuando ya viene reflejada.

#### Dónde está
Rubén la toma principalmente de la **tabla resumen de la última página**.

#### Qué alimenta
- bloque de IMSS;
- Total IMSS;
- lectura de RT efectivamente usada en el pago.

#### Qué sí demuestra
- detalle mensual del bloque IMSS;
- separación patronal vs obrero por ramos de IMSS;
- lo efectivamente tomado para el pago mensual de IMSS.

#### Qué no resuelve por sí sola
- RCV;
- INFONAVIT;
- comprobante bancario;
- Emisión;
- Declaración de Prima.

## 3) Cédula bimestral
- **Tipo documental:** raw / fuente del cliente
- **Formato real:** PDF
- **Obligatoriedad:** obligatoria

#### Qué se extrae
- registro patronal;
- periodo bimestral;
- importes de RCV;
- aportaciones;
- amortizaciones;
- importes de INFONAVIT;
- datos del pago real bimestral.

#### Dónde está
Rubén la toma principalmente de la **tabla resumen de la última página**.

#### Qué alimenta
- Total RCV;
- Total INFONAVIT;
- soporte del componente bimestral del Total a Pagar.

#### Qué sí demuestra
- bloque RCV + INFONAVIT del bimestre;
- aportaciones y amortizaciones;
- lo efectivamente tomado para el pago bimestral de RCV e INFONAVIT.

#### Qué no resuelve por sí sola
- detalle fino mensual del bloque IMSS;
- comprobante bancario;
- Emisión;
- Declaración de Prima.

## 4) Comprobante bancario
- **Tipo documental:** raw / fuente del cliente
- **Formato real:** PDF / impresión PDF / comprobante portal bancario / imagen legible
- **Obligatoriedad:** obligatorio para cerrar la fila

#### Qué se extrae
- importe pagado;
- fecha de pago;
- referencia visible, si existe;
- banco / cuenta / canal como contexto;
- datos que permitan asociarlo al RP o al periodo cuando vengan visibles.

#### Dónde está
- importe: bloque principal del movimiento;
- fecha: encabezado o detalle de operación;
- referencia / concepto: cuerpo del comprobante;
- banco / cuenta / estatus: encabezado o resumen.

#### Cómo se localiza el comprobante correcto
No se busca por folio SUA. Se busca por:
- **RP + periodo + importe total a pagar**.

#### Regla crítica
Si el importe no coincide exacto con el **Total a Pagar**, la fila no cierra.

## 5) Emisión EMA/EBA
- **Tipo documental:** raw / fuente del cliente
- **Formato real:** archivo descargado del portal / Excel de emisión
- **Obligatoriedad:** idealmente sí; si no existe, la prueba puede avanzar pero queda incompleta en la validación de prima esperada

#### Qué se extrae
- prima de riesgo aplicable al RP en ese periodo.

#### Dónde está
- fila o bloque del Excel correspondiente al RP y al periodo.

#### Qué representa EMA
**EMA** = la prima emitida por IDSE para ese RP y periodo.

## 6) Declaración de Prima de Riesgo de Trabajo
- **Tipo documental:** raw / fuente del cliente
- **Formato real:** PDF / acuse
- **Obligatoriedad:** obligatoria cuando la empresa ya tiene declaración anual utilizable

#### Qué se extrae
- registro patronal;
- clase;
- fracción;
- periodo de revisión;
- prima anterior;
- prima declarada.

#### Dónde está
- clase y fracción: bloque superior de datos del RP;
- prima anterior, prima declarada y periodo: sección **Datos base para la determinación**.

#### Qué representa AUD
**AUD** = la prima correcta para auditoría derivada de la declaración.

Regla operativa de Rubén:
- enero y febrero = prima anterior;
- marzo a diciembre = prima declarada.

## 7) Alta del seguro / alta patronal y Tarjeta de Identificacion Patronal
- **Tipo documental:** raw / fuente del cliente
- **Formato real:** documento de alta patronal + tarjeta de identificación patronal
- **Uso:** caso condicional

#### Cuándo entra
Solo cuando se trata de la **primera auditoría del cliente** o del **primer año del registro patronal**.
En ese escenario, este proceso se hace una sola vez para ese registro patronal.

La lógica correcta es esta:
- si la empresa o el registro patronal **todavía no ha estado registrado del 1° de enero al 31 de diciembre**, no está obligada a presentar Declaración de Prima de Riesgo de Trabajo;
- por lo tanto, la información de clasificación y riesgo se debe tomar de estos documentos;
- si la empresa o el registro patronal **ya tiene más de un año**, entonces sí está obligada a presentar la Declaración de Prima de Riesgo de Trabajo;
- en ese caso, la información ya se toma de la **Declaración de Prima de Riesgo de Trabajo** y no de estos documentos base.

#### Qué aporta cada documento
### Alta del seguro / alta patronal
El registro de alta patronal viene a nombre de la empresa y muestra cómo se constituye la empresa.
En la **hoja 4** se puede apreciar:
- división;
- grupo;
- fracción;
- clase de riesgo;
- prima media del seguro de riesgos de trabajo.

### Tarjeta de Identificacion Patronal
De la **Tarjeta de Identificacion Patronal** se extrae el:
- registro patronal.

Ese dato no se toma del alta patronal.

#### Qué se extrae
Del alta patronal:
- división;
- grupo;
- fracción;
- clase;
- prima media de riesgo de trabajo.

De la Tarjeta de Identificacion Patronal:
- registro patronal.

#### Dónde está
### Alta del seguro / alta patronal
- hoja 4 del documento de alta patronal;
- bloque de clasificación de la actividad económica / clasificación para el Seguro de Riesgos de Trabajo.

### Tarjeta de Identificacion Patronal
- bloque principal de identificación patronal;
- campo de **Número de Registro Patronal**.

#### Cómo se usa en `Resultado - 5.1.xlsx`
En la pestaña **amarre** del documento `Resultado - 5.1.xlsx`:
- la **fracción** se coloca en la columna **AM** (`Fracción`);
- la **clase** se coloca en la columna **AN** (`Clase`);
- el **riesgo de trabajo / prima media** se coloca en la columna **AO** (`RT`).

El **registro patronal** se toma de la **Tarjeta de Identificacion Patronal** cuando aplica este escenario de primera auditoría / primer año.

#### Archivos en esta carpeta
- **Emisión EMA-EBA:** `Emisión EMA-EBA.xls`
  - `01 - Pruebas IMSS/5.1 - Vaciado de liquidaciones/04 - SOPs por Auditor/Rubén/Emisión EMA-EBA.xls`
- **Tarjeta de Identificacion Patronal:** `Tarjeta de Identificacion Patronal.pdf`
  - `01 - Pruebas IMSS/5.1 - Vaciado de liquidaciones/04 - SOPs por Auditor/Rubén/Tarjeta de Identificacion Patronal.pdf`

#### Qué sí resuelve
- división;
- grupo;
- fracción;
- clase;
- RT cuando es la primera auditoría del cliente;
- registro patronal cuando aplica el escenario de primera creación / primer año.

#### Qué no resuelve
- prima anterior;
- prima declarada;
- AUD completa cuando ya existe Declaración de Prima de Riesgo de Trabajo.

## Papel de trabajo real del auditor

### Workbook de metodología / amarre de Rubén
- **Tipo documental:** papel de trabajo real del auditor
- **Función:** transforma la información del SUA, organiza el cruce técnico y deja la tabla final de amarre por folio

#### Hojas relevantes
- **PARTE A:** identificación del folio y contexto del RP / periodo;
- **PARTE B:** detalle de trabajadores, días y conceptos base;
- **PARTE D:** bloque económico por folio;
- **amarre:** consolidación final para llegar a Total IMSS, Total RCV, Total INFONAVIT, Total a Pagar, Importe Comprobante, Comprobación y análisis RT / EMA / AUD.

#### Cómo se alimenta
Se llena por **macro** a partir del `.sua`.

#### Qué se revisa antes del amarre
- que PARTE A, B y D sí correspondan al RP y periodo correctos;
- que trabajadores, días e importes se vean coherentes;
- que el vaciado no esté corrido, incompleto o incoherente.

## Flujo operativo paso a paso

### Paso 1. Conseguir el SUA correcto
Rubén obtiene el archivo `.sua` correcto del RP y del periodo.

### Paso 2. Cargar el SUA al workbook
Carga el `.sua` en el workbook para que la macro lo descomponga y lo vacíe en:
- PARTE A
- PARTE B
- PARTE C
- PARTE D

Para esta prueba se usan:
- PARTE A
- PARTE B
- PARTE D

PARTE C no forma parte del output de la 5.1.

### Paso 3. Revisar que el vaciado sea confiable
Antes de confiar en el amarre, Rubén revisa:
- en PARTE A: folio, RP, periodo, trabajadores;
- en PARTE B: días cotizados, ausentismo, incapacidad;
- en PARTE D: bloque económico y totales que alimentarán IMSS, RCV, INFONAVIT y Total a Pagar.

Si el parser o macro falla, el amarre no se considera confiable y no se debe cerrar la prueba con esa corrida.

### Paso 4. Pasar al amarre
En la hoja **amarre** se arrastran:
- de PARTE A: identificación y trabajadores;
- de PARTE B: días cotizados, ausentismo e incapacidad;
- de PARTE D: el bloque económico.

El workbook calcula automáticamente:
- Total IMSS;
- Total RCV;
- Total INFONAVIT;
- Total a Pagar;
- Comprobación.

### Paso 5. Buscar el comprobante bancario correcto
Con la fila ya armada, Rubén busca el comprobante por:
- RP + periodo + importe total a pagar.

No busca por folio SUA.

### Paso 6. Validar contra comprobante
Captura o valida:
- Importe Comprobante;
- Comprobación.

La regla es estricta:
- si **Importe Comprobante ≠ Total a Pagar**, la fila no se cierra;
- si **Comprobación ≠ 0**, la fila no está terminada.

### Paso 7. Validar con cédulas
Usa:
- **cédula mensual** para el bloque IMSS;
- **cédula bimestral** para RCV e INFONAVIT.

Con eso soporta técnicamente lo que el SUA vació en el papel de trabajo.

### Paso 8. Completar análisis de prima
Incorpora:
- **RT** = prima realmente usada en la cédula / pago;
- **EMA** = prima emitida por IDSE;
- **AUD** = prima correcta según auditoría.

También alimenta:
- Clase;
- Fracción;
- comparación Cía vs EMA, Cía vs AUD y EMA vs AUD.

### Paso 9. Resolver o documentar diferencias
Si algo no cuadra, Rubén revisa:
- si el comprobante elegido es el correcto;
- si falta otro comprobante;
- si hubo pago complementario;
- si hubo pago extemporáneo;
- si el set documental está incompleto;
- si el vaciado del SUA está mal;
- si existe diferencia relevante entre RT, EMA y AUD.

Si la causa no queda explicada, la fila no se cierra.

## Qué es automático y qué requiere juicio del auditor

### Automático
- carga del SUA al workbook;
- vaciado a PARTE A / B / D;
- arrastre técnico al amarre;
- cálculo de Total IMSS, Total RCV, Total INFONAVIT, Total a Pagar y Comprobación.

### Requiere juicio
- identificar el comprobante correcto;
- validar si el comprobante sí corresponde a la fila;
- interpretar diferencias RT / EMA / AUD;
- decidir si una diferencia es hallazgo, aclaración, corrección posterior o falta de soporte;
- redactar observaciones y estado de revisión.

## Bifurcaciones y manejo de casos especiales

### Pago complementario
**Señal:** aparece folio adicional para el mismo RP y periodo.

**Regla:**
- si hay folio propio y soporte propio, se abre **fila nueva**;
- no se ajusta una fila existente solo por ser el mismo mes.

### Pago extemporáneo
**Señal:** la fecha del comprobante cae fuera de la ventana normal del periodo.

**Regla:**
- la fila sigue amarrada al periodo liquidado, no al mes de pago;
- el comprobante se identifica por RP + periodo + importe exacto.

### Faltan comprobantes bancarios
Se puede dejar el amarre técnico armado, pero la fila no se marca como cerrada.

### Faltan declaración o datos de prima
Si falta la declaración:
- se puede usar alta del seguro para clase y fracción si es primer año;
- el análisis completo de prima auditada queda limitado.

### Diferencia entre RT, EMA y AUD
No se corrige en automático.

Se deja visible y se investiga si puede implicar:
- prima incorrecta aplicada;
- emisión desactualizada;
- corrección posterior.

### Varios comprobantes para un mismo RP y periodo
Se baja al nivel de cada fila y se asigna por importe exacto.

### Un solo comprobante cubre mensual + bimestral
Se asigna a la fila cuyo Total a Pagar ya incluye el bloque completo. No se duplica.

### El parser / macro del SUA falla
Si PARTE A, B o D salen vacías, incompletas o absurdas:
- se revisa si se cargó el SUA correcto;
- se valida si el problema es del archivo o de la macro;
- no se cierra la prueba con esa corrida.

## Output de la prueba

### Output operativo
Una **tabla de amarre por folio** en la hoja **amarre** del workbook.

### Output formal
La información lista para poblar la hoja oficial **Cuotas pagadas al Instituto** de la Plantilla fuente de Información Patronal.

## Columnas finales útiles
Las columnas útiles para la salida son:
- Registro patronal;
- Trabajadores / cotizantes reportados;
- Días cotizados;
- Días de ausentismo;
- Días de incapacidad;
- bloque IMSS;
- Total IMSS / Total COP según traslado;
- Retiro;
- Cesantía y vejez;
- Total RCV;
- importes de INFONAVIT;
- Total INFONAVIT;
- Total a Pagar.

Para control interno de cierre también son críticas:
- Importe Comprobante;
- Comprobación.

## Trazabilidad

### Alimenta directamente la Plantilla fuente de Información Patronal
- trabajadores;
- días;
- importes IMSS;
- importes RCV;
- importes INFONAVIT;
- totales pagados.

### Se queda como soporte o revisión
- comprobante bancario;
- comparación RT / EMA / AUD;
- análisis de diferencias de prima;
- observaciones del auditor;
- explicación de complementarias, extemporáneos o faltantes.

## Errores que un junior no debe cometer
- cerrar una fila porque “se ve razonable”;
- asignar comprobante por cercanía de fecha en vez de por RP + periodo + importe exacto;
- usar un comprobante aproximado;
- consolidar por mes cuando la unidad real es folio;
- mezclar pago complementario con fila existente sin evidencia;
- dar por buena la prima porque RT, EMA y AUD “se parecen”;
- cerrar sin cédula mensual o bimestral cuando sí aplican;
- confiar en la macro sin revisar coherencia;
- llenar la plantilla oficial antes de tener el amarre documentalmente cerrado.

## Criterio exacto de terminado
La 5.1 se considera terminada cuando, para cada RP y para cada folio revisado:
- el vaciado desde SUA es confiable;
- la fila del amarre está completa;
- el bloque IMSS, RCV e INFONAVIT está soportado con sus cédulas correspondientes;
- el comprobante bancario correcto fue localizado;
- Importe Comprobante y Total a Pagar cuadran exactamente;
- Comprobación = 0;
- la comparación RT / EMA / AUD quedó visible y, si difiere, quedó identificada para análisis;
- los datos finales ya pueden trasladarse a Cuotas pagadas al Instituto sin inventar ni ajustar manualmente el resultado.

## Resumen corto para alguien junior
1. Carga el SUA.
2. Revisa que la macro haya llenado bien PARTE A, PARTE B y PARTE D.
3. Pasa al amarre.
4. Confirma trabajadores, días e importes.
5. Revisa el Total a Pagar.
6. Busca el comprobante correcto por RP + periodo + importe.
7. Valida Importe Comprobante.
8. Si Comprobación = 0, el pago cuadró.
9. Revisa cédulas y prima.
10. Si algo no cuadra, no cierres la fila hasta entender por qué.


## Pendientes reales de cierre documental
- Sigue siendo útil conservar ejemplo real de **Alta del seguro** para el escenario de primer año del cliente o del registro patronal.
- No bloquea universalmente el cierre, porque solo aplica cuando no existe Declaración de Prima de Riesgo utilizable.
