# SOP - Rubén

## Prueba
- **Prueba:** 5.1 - Vaciado de liquidaciones
- **Auditor:** Rubén
- **Tipo:** Prueba principal

## Objetivo de la prueba
La prueba 5.1 busca reconstruir y amarrar, por **folio de liquidación** y por **registro patronal**, lo que se debía pagar al IMSS, RCV e INFONAVIT contra lo efectivamente pagado, para dejar la salida lista para poblar la hoja **Cuotas pagadas al Instituto** de la Plantilla fuente de Información Patronal.

## La prueba está bien hecha cuando:
- el amarre se reconstruye por **folio**, no por mes consolidado;
- **Total a Pagar** e **Importe Comprobante** cuadran exactamente;
- **Comprobación = 0**;
- la fila queda soportada documentalmente;
- el análisis **RT / EMA / AUD** queda visible para revisión;
- el resultado ya puede trasladarse a la plantilla fuente.

## Cuándo aplica esta forma de ejecutar la prueba
Esta forma aplica cuando el auditor trabaja con:
- uno o varios registros patronales;
- pagos mensuales y bimestrales que deben amarrarse contra SUA, cédulas y comprobantes;
- un workbook de amarre alimentado por macro desde el archivo SUA;
- validación final a nivel de **folio** como unidad real de control.

## Factores que cambian la ejecución:
- número de registros patronales;
- cantidad de folios por periodo;
- estructura de comprobantes bancarios;
- pagos complementarios o extemporáneos;
- diferencias entre **RT**, **EMA** y **AUD**;
- disponibilidad de Declaración de Prima de Riesgo;
- si es o no el primer año del cliente / RP.

## Documentos y archivos necesarios

### Raw relevantes usados en esta variante
Los siguientes archivos quedaron duplicados dentro de esta misma carpeta para que el paquete sea autocontenido:

- `Alta de Seguro.pdf`
  - Ruta: `01 - Pruebas IMSS/5.1 - Vaciado de liquidaciones/04 - SOPs por Auditor/Ruben 2/Alta de Seguro.pdf`
- `Tarjeta de Identificacion Patronal.pdf`
  - Ruta: `01 - Pruebas IMSS/5.1 - Vaciado de liquidaciones/04 - SOPs por Auditor/Ruben 2/Tarjeta de Identificacion Patronal.pdf`
- `Disco de pago SUA.sua`
  - Ruta: `01 - Pruebas IMSS/5.1 - Vaciado de liquidaciones/04 - SOPs por Auditor/Ruben 2/Disco de pago SUA.sua`
- `Cédula de determinación mensual.pdf`
  - Ruta: `01 - Pruebas IMSS/5.1 - Vaciado de liquidaciones/04 - SOPs por Auditor/Ruben 2/Cédula de determinación mensual.pdf`
- `Cédula de determinación bimestral.pdf`
  - Ruta: `01 - Pruebas IMSS/5.1 - Vaciado de liquidaciones/04 - SOPs por Auditor/Ruben 2/Cédula de determinación bimestral.pdf`
- `Comprobantes bancarios de pago SUA.pdf`
  - Ruta: `01 - Pruebas IMSS/5.1 - Vaciado de liquidaciones/04 - SOPs por Auditor/Ruben 2/Comprobantes bancarios de pago SUA.pdf`
- `Emisión IDSE (EMA - EBA).xls`
  - Ruta: `01 - Pruebas IMSS/5.1 - Vaciado de liquidaciones/04 - SOPs por Auditor/Ruben 2/Emisión IDSE (EMA - EBA).xls`
- `Declaración anual de prima de riesgo de trabajo.pdf`
  - Ruta: `01 - Pruebas IMSS/5.1 - Vaciado de liquidaciones/04 - SOPs por Auditor/Ruben 2/Declaración anual de prima de riesgo de trabajo.pdf`

### Papel de trabajo real del auditor
- `5.1 - Vaciado de liquidaciones - amarre - Rubén.xlsx`
  - Ruta: `01 - Pruebas IMSS/5.1 - Vaciado de liquidaciones/04 - SOPs por Auditor/Ruben 2/5.1 - Vaciado de liquidaciones - amarre - Rubén.xlsx`
  - Es el workbook real de metodología / amarre que usa Rubén para ejecutar esta prueba.

### Documentos obligatorios para cerrar la prueba
**Obligatorios siempre:**
- Disco de pago SUA
- Cédula de determinación mensual
- Cédula de determinación bimestral
- Comprobantes bancarios de pago SUA
- Emisión IDSE (EMA / EBA)
- Workbook de amarre de Rubén

**Obligatorios según el caso:**
- Declaración anual de prima de riesgo de trabajo
- Alta del seguro de riesgos de trabajo, solo cuando es primer año del cliente o no existe declaración utilizable
- Tarjeta de Identificacion Patronal, cuando aplica escenario de alta / primer año y se necesita confirmar el registro patronal

## Dónde está la data relevante dentro de esos documentos

### 1) Disco de pago SUA
**Tipo:** raw / fuente del cliente  
**Formato:** `.sua`

Se extrae:
- folio de liquidación;
- registro patronal;
- periodo;
- trabajadores;
- días cotizados;
- días de ausentismo;
- días de incapacidad;
- componentes IMSS;
- componentes RCV;
- componentes INFONAVIT;
- Total a Pagar.

La data relevante se usa así en el workbook:
- **PARTE A:** identificación general del registro, folio, periodo y trabajadores;
- **PARTE B:** días cotizados, ausentismo e incapacidad;
- **PARTE D:** bloque económico que alimenta el amarre.

### 2) Cédula de determinación mensual
**Tipo:** raw / fuente del cliente  
**Formato:** PDF

Se toma principalmente de la **tabla resumen de la última página**.  
Variables clave:
- registro patronal;
- periodo;
- importes del bloque IMSS;
- separación patronal / obrero;
- RT usada en el pago cuando ya viene reflejada.

### 3) Cédula de determinación bimestral
**Tipo:** raw / fuente del cliente  
**Formato:** PDF

Se toma principalmente de la **tabla resumen de la última página**.  
Variables clave:
- registro patronal;
- periodo bimestral;
- RCV;
- aportaciones;
- amortizaciones;
- INFONAVIT.

### 4) Comprobantes bancarios de pago SUA
**Tipo:** raw / fuente del cliente  
**Formato:** PDF / impresión / comprobante bancario legible

Se extrae:
- importe pagado;
- fecha de pago;
- referencia visible si existe;
- datos contextuales para asociarlo al RP o al periodo.

No se busca por folio SUA. Se localiza por:
- **RP + periodo + importe total a pagar**.

### 5) Emisión IDSE (EMA / EBA)
**Tipo:** raw / fuente del cliente  
**Formato:** Excel / emisión descargada

Se extrae la **prima de riesgo** emitida por IDSE para ese RP y periodo.  
Eso representa **EMA**.

### 6) Declaración anual de prima de riesgo de trabajo
**Tipo:** raw / fuente del cliente  
**Formato:** PDF / acuse

Se extrae:
- registro patronal;
- clase;
- fracción;
- periodo de revisión;
- prima anterior;
- prima declarada.

La parte clave está en la sección **Datos base para la determinación**.

### 7) Alta del seguro de riesgos de trabajo y Tarjeta de Identificacion Patronal
**Tipo:** raw / fuente del cliente  
**Formato:** PDF

**Uso:** caso condicional.

Esto entra cuando:
- es la primera auditoría del cliente;
- es el primer año del registro patronal; o
- no existe una Declaración anual de prima de riesgo de trabajo utilizable.

#### Qué se extrae
Del `Alta de Seguro.pdf`:
- división;
- grupo;
- fracción;
- clase;
- prima media de riesgo de trabajo.

De `Tarjeta de Identificacion Patronal.pdf`:
- registro patronal.

#### Dónde está la data
En el alta del seguro / alta patronal:
- **hoja 4**;
- bloque de clasificación de la actividad económica / clasificación para el Seguro de Riesgos de Trabajo.

En la Tarjeta de Identificacion Patronal:
- bloque principal de identificación patronal;
- campo de **Número de Registro Patronal**.

#### Cómo juega en el amarre
Cuando aplica este escenario:
- la **fracción** se lleva a la columna **AM**;
- la **clase** se lleva a la columna **AN**;
- la **prima media / RT** se lleva a la columna **AO**.

En ese mismo escenario, el **registro patronal** se confirma desde `Tarjeta de Identificacion Patronal.pdf`.

## Variables exactas que se extraen
Las variables centrales de esta prueba son:
- Registro patronal
- Folio
- Periodo
- Trabajadores
- Días cotizados
- Días de ausentismo
- Días de incapacidad
- Total IMSS
- Total RCV
- Total INFONAVIT
- Total a Pagar
- Importe Comprobante
- Comprobación
- RT
- EMA
- AUD
- Clase
- Fracción

Regla operativa de primas:
- **RT** = prima realmente usada en la cédula / pago
- **EMA** = prima emitida por IDSE
- **AUD** = prima correcta según auditoría

Para **AUD**:
- enero y febrero = prima anterior
- marzo a diciembre = prima declarada

## Proceso paso a paso

### Paso 1. Conseguir el SUA correcto
Rubén obtiene el archivo `.sua` correcto del RP y del periodo.

### Paso 2. Cargar el SUA al workbook
Carga el archivo al workbook `5.1 - Vaciado de liquidaciones - amarre - Rubén.xlsx` para que la macro vacíe la información en:
- `PARTE A`
- `PARTE B`
- `PARTE C`
- `PARTE D`
- `amarre`

Para esta prueba se usan principalmente:
- `PARTE A`
- `PARTE B`
- `PARTE D`
- `amarre`

### Paso 3. Revisar que el vaciado sea confiable
Antes de seguir, revisa:
- en `PARTE A`: folio, RP, periodo, trabajadores;
- en `PARTE B`: días cotizados, ausentismo e incapacidad;
- en `PARTE D`: bloque económico y totales.

Si el vaciado está corrido, incompleto o incoherente, no se cierra la prueba con esa corrida.

### Paso 4. Ir al amarre
En la hoja `amarre` se consolidan los datos de identificación, días e importes.  
Aquí se forman o validan:
- Total IMSS
- Total RCV
- Total INFONAVIT
- Total a Pagar
- Comprobación

### Paso 5. Buscar el comprobante correcto
Con la fila armada, se busca el comprobante por:
- **RP + periodo + importe total a pagar**

No se busca por folio SUA.

### Paso 6. Validar contra comprobante
Se compara:
- **Importe Comprobante** vs **Total a Pagar**
- **Comprobación**

Regla estricta:
- si `Importe Comprobante ≠ Total a Pagar`, la fila no cierra;
- si `Comprobación ≠ 0`, la fila no está terminada.

### Paso 7. Validar con cédulas
Se usa:
- `Cédula de determinación mensual.pdf` para IMSS
- `Cédula de determinación bimestral.pdf` para RCV e INFONAVIT

### Paso 8. Completar análisis de prima
Se incorporan:
- RT
- EMA
- AUD
- Clase
- Fracción

Esto permite revisar si la prima aplicada coincide con la emitida y con la correcta según auditoría.

### Paso 9. Resolver o documentar diferencias
Si algo no cuadra, Rubén revisa:
- si el comprobante sí corresponde;
- si falta otro comprobante;
- si hubo pago complementario;
- si hubo pago extemporáneo;
- si el set documental está incompleto;
- si el vaciado del SUA está mal;
- si hay diferencia relevante entre RT, EMA y AUD.

## Validaciones clave
- la unidad real de control es el **folio**;
- RP organiza documentos;
- periodo sirve para búsqueda y cruce;
- el comprobante correcto se identifica por **RP + periodo + importe**;
- `Importe Comprobante` debe cuadrar exacto contra `Total a Pagar`;
- `Comprobación` debe ser `0`;
- la fila no se cierra si falta soporte documental clave.

## Casos especiales y bifurcaciones

### Pago complementario
Si aparece un folio adicional para el mismo RP y periodo:
- se abre **fila nueva**;
- no se ajusta una fila existente solo por ser el mismo mes.

### Pago extemporáneo
- la fila sigue amarrada al **periodo liquidado**;
- no al mes de pago.

### Faltan comprobantes bancarios
- el amarre técnico puede quedar avanzado;
- la fila no se marca como cerrada.

### Faltan declaración o datos de prima
- si no existe declaración, puede usarse el alta del seguro cuando aplica escenario de primer año;
- el análisis completo de prima queda limitado.

### Diferencias RT / EMA / AUD
No se corrigen en automático. Se dejan visibles y se investigan.

## Output final de la prueba

### Output operativo
Una **tabla de amarre por folio** en la hoja `amarre` del workbook `5.1 - Vaciado de liquidaciones - amarre - Rubén.xlsx`.

### Output formal
Información lista para poblar la hoja **Cuotas pagadas al Instituto** de la Plantilla fuente de Información Patronal.

## Relación con plantilla fuente / atestiguamientos / cédulas / otras pruebas

### Alimenta directamente
La prueba alimenta la sección **Cuotas pagadas al Instituto** con:
- trabajadores;
- días;
- importes IMSS;
- importes RCV;
- importes INFONAVIT;
- totales pagados.

### Queda como soporte
- comprobantes bancarios;
- cédulas mensual y bimestral;
- comparación RT / EMA / AUD;
- análisis de diferencias;
- explicación de complementarios o extemporáneos.

### Relación con otras pruebas
Esta prueba funciona como **prueba base** para otras revisiones posteriores que consumen la salida de cuotas pagadas o sus cruces.

## Errores comunes o alertas
- cerrar una fila porque “se ve razonable”;
- buscar el comprobante por fecha y no por RP + periodo + importe;
- consolidar por mes cuando la unidad real es folio;
- mezclar complementarios con la fila original sin evidencia;
- confiar ciegamente en la macro sin revisar coherencia;
- cerrar sin cédula mensual o bimestral cuando sí aplican;
- asumir que RT, EMA y AUD equivalentes “más o menos” ya cierran el caso.

## Resumen de la prueba
La 5.1 es una prueba principal enfocada en reconstruir y amarrar pagos al IMSS a nivel de folio.  
La lógica correcta es:
- **RP** organiza;
- **periodo** sirve para búsqueda;
- **folio** amarra y valida.

## Fuentes y variante documentada
Este SOP documenta únicamente la **variante operativa de Rubén**.  
No compara contra otros auditores ni consolida criterio oficial.

## Pendientes reales de cierre
Pendientes reales identificados:
- no hay pendiente documental abierto para esta impresión respecto del escenario de alta / primer año, porque en este paquete ya quedaron incluidos `Alta de Seguro.pdf` y `Tarjeta de Identificacion Patronal.pdf`.
- el uso de esos documentos sigue siendo **condicional**, no universal.

Esto significa que:
- cuando exista Declaración anual de prima de riesgo de trabajo utilizable, esa será la fuente principal para el análisis AUD;
- cuando no exista por tratarse de primer año o alta reciente, se usan el alta del seguro y la tarjeta patronal como soporte de clasificación, registro patronal y prima media.
