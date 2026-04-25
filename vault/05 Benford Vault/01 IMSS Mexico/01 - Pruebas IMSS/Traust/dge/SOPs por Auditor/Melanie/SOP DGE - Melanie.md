# SOP - Melanie

## Objetivo de la prueba
La prueba 02 DGE busca validar que los pagos bancarios de cuotas obrero patronales coincidan con los importes del ACUMSUA, dejando visible por mes qué se pagó por parte del patrón y qué se pagó por parte del trabajador. La revisión se hace por registro patronal y por mes. Si existe soporte bancario, la prueba debe cuadrar contra ese comprobante. Si todavía no existe soporte, la prueba puede quedar capturada y pendiente de confirmación de la empresa.

## Cuándo aplica esta forma de ejecutar la prueba
Esta es la forma normal en que Melanie y Andrés ejecutan la 02 DGE en RSM. Ambos confirmaron que la hacen igual. Aplica cuando ya se tiene el ACUMSUA del cliente y el archivo de trabajo DGE para capturar por empresa, por RP y por periodo.

## Documentos y archivos necesarios
### Documentos obligatorios siempre
- `documentos/ACUMSUA - ejemplo real usado en 02 DGE.xlsx`
- `documentos/DGE - archivo de trabajo con DGE-1 DGE-2 y DGE-3.xlsx`

### Documentos obligatorios cuando existen o cuando la empresa ya los mandó
- `documentos/Comprobante bancario de pago SUA - ejemplo real.pdf`

### Documentos de apoyo para entender conceptos y estructura
- `documentos/Imagen de conceptos de ACUMSUA - encabezados usados en DGE-2.png`
- `documentos/Imagen de conceptos y cantidades por trabajador - ejemplo real.png`

## Dónde está la data relevante dentro de esos documentos
### ACUMSUA
Archivo: `documentos/ACUMSUA - ejemplo real usado en 02 DGE.xlsx`

Hojas relevantes:
- `Datos Trabajador`: base principal para llenar DGE-2 y también para tomar total de trabajadores, días cotizados, días de ausentismo y días de incapacidad.
- `Datos Sumarios`: base para folio SUA y para DGE-3.

Ubicación de data confirmada:
- `Datos Sumarios`, columna `D`: folio SUA.
- `Datos Sumarios`, columnas `W:Y`: datos para DGE-3.
- `Datos Trabajador`, bloque `N:AK`: universo de columnas usadas en DGE-2 según si el periodo es mensual o bimestral.
- Para mensual en DGE-2:
  - bloque base `O:T`
  - menos bloque `AG:AJ`
  - la resta se hace **columna por columna** y **por concepto**, guiándose por el nombre del encabezado.

Conceptos visibles confirmados en encabezados del ACUMSUA:
- Días mes
- Días incapacidad
- Días ausentismo
- Cuota fija
- Cuota excedente
- Prestaciones en dinero
- Gastos médicos
- Riesgos de trabajo
- Invalidez y vida
- Guarderías
- Actualización
- Retiro
- Cesantía y vejez
- Aportación
- Amortización

### Archivo DGE
Archivo: `documentos/DGE - archivo de trabajo con DGE-1 DGE-2 y DGE-3.xlsx`

Hojas funcionales:
- `DGE-1`: datos del registro patronal. Se trabaja una hoja por RP.
- `DGE-2`: pagos de IMSS y RCV, con desglose obrero y patronal, incluyendo normales y complementarias.
- `DGE-3`: aportación y amortización, con normales y complementarias.

### Comprobante bancario
Archivo: `documentos/Comprobante bancario de pago SUA - ejemplo real.pdf`

Campos útiles confirmados:
- Registro Patronal
- Periodo de pago
- Folio SUA
- Línea de captura SIPARE
- Importe IMSS / importe total
- Fecha de aplicación de pago

Los campos de `fecha de pago` y `lugar de pago` en DGE dependen de este comprobante. Si no existe, se dejan en blanco.

## Variables exactas que se extraen
### Desde Datos Trabajador
- total de trabajadores por mes
- días cotizados
- días de ausentismo
- días de incapacidad
- conceptos de cuotas para DGE-2
- importes por concepto para IMSS
- bloque ampliado para meses bimestrales cuando entra RCV

### Desde Datos Sumarios
- folio SUA, columna D
- importes para DGE-3, columnas W a Y

### Desde comprobante bancario
- fecha de pago
- lugar de pago
- total pagado
- validación del periodo y del RP

## Proceso paso a paso
1. **Iniciar la prueba únicamente cuando ya se tiene el ACUMSUA**.
2. **Abrir el archivo DGE** y capturar los datos generales de la empresa:
   - nombre
   - registros patronales
   - año a dictaminar
3. **Identificar cuántos RP tiene el cliente**. Si hay varios, trabajar cada registro por separado. Lo normal es que la empresa mande cada RP por carpeta. Aun así, verificarlo contra los datos de empresa para no mezclar información.
4. **Llenar DGE-1** con la información específica de cada registro patronal.
5. **Llenar DGE-2 mes por mes** usando `Datos Trabajador`.
6. Para cada mes en DGE-2:
   - tomar el concepto según el nombre de la columna
   - si es mensual, usar la lógica de resta por concepto:
     - base `O:T`
     - menos `AG:AJ`
   - capturar el resultado desglosado en la tabla de DGE-2
   - si el caso corresponde a pago normal, ponerlo en normales
   - si corresponde a ajuste posterior, ponerlo en complementaria
7. **Tomar el folio SUA** desde `Datos Sumarios`, columna `D`, y colocarlo en DGE-2 o DGE-3 según corresponda.
8. **Llenar también en DGE los datos operativos por mes** que salen de `Datos Trabajador`:
   - total de trabajadores
   - días cotizados
   - días de ausentismo
   - días de incapacidad
9. **Cuando el periodo es bimestral**, usar el bloque necesario de `N:AK`, porque en esa parte el RCV ya viene desglosado entre patrón y obrero.
10. **Llenar DGE-3** desde `Datos Sumarios`, arrastrando los meses bimestrales y sin fórmulas. Aquí se cargan aportación y amortización.
11. **Capturar fecha y lugar de pago** únicamente cuando ya exista el comprobante bancario correspondiente al mes.
12. **Comparar contra el comprobante bancario** cuando la empresa lo haya mandado:
   - validar que el periodo sea el correcto
   - validar que el RP sea el correcto
   - validar que el total pagado cuadre con lo capturado en la DGE
13. **Si no cuadra**, revisar en este orden:
   - que sea el archivo `.SUA` correcto
   - que no exista error de captura
   - que la empresa no haya mandado un comprobante de otro pago
14. **Si falta comprobante**, dejar en blanco los campos dependientes del soporte, sobre todo:
   - fecha de pago
   - lugar de pago
   y continuar con el siguiente mes.
15. **Repetir el proceso por cada mes y por cada RP** hasta terminar toda la empresa.

## Validaciones clave
Al final, la revisión mínima cruza tres frentes:
1. lo capturado en la DGE
2. los totales de `Datos Sumarios` del ACUMSUA
3. el comprobante bancario / total pagado

La prueba se considera bien armada cuando:
- ya están todos los datos capturados
- los meses ya fueron llenados
- el total cuadra con comprobante cuando existe
- y, si no existe comprobante todavía, queda explícitamente pendiente de confirmación por la empresa

## Casos especiales y bifurcaciones
### Si hay varios registros patronales
- trabajar cada RP por separado
- normalmente la empresa los manda por carpeta
- verificar el RP contra los datos de empresa para no revolver meses ni importes

### Si es mensual
- usar solo la parte de IMSS
- hacer la resta `O:T - AG:AJ`
- hacerla **concepto por concepto**, no como una sola resta global

### Si es bimestral
- usar las columnas necesarias de `N:AK`
- incluir RCV porque ya viene desglosado entre patrón y obrero

### Si es complementaria
Va a complementaria cuando:
- ya existía un `.SUA` pagado completo del periodo
- y después aparece otro `.SUA` del mismo periodo / mismos trabajadores
- porque faltó agregar algo
- o porque llegó una notificación del IMSS

### Si falta comprobante
- no se detiene la prueba
- se deja pendiente fecha y lugar de pago
- se sigue con el siguiente mes

## Output final de la prueba
El resultado directo es una DGE capturada por RP y por mes, con:
- datos del registro patronal
- pagos de IMSS y RCV en DGE-2
- pagos de aportación y amortización en DGE-3
- normales y complementarias cuando existan
- validación contra comprobante cuando el soporte ya fue recibido

No se identificó un archivo autónomo final distinto que deba ir en `resultado/`, por lo que esa carpeta se deja creada pero vacía.

## Relación con plantilla fuente / atestiguamientos / cédulas / otras pruebas
Esta prueba documenta y soporta la conciliación de pagos realizados contra lo determinado en el ACUMSUA. Funciona como base de evidencia para la parte de cuotas pagadas y para la consistencia del expediente de seguridad social. También se conecta con:
- el flujo de pagos al Instituto dentro de la documentación del dictamen
- la trazabilidad del RP y del periodo pagado
- otras pruebas donde haga falta amarrar lo determinado con lo efectivamente pagado

## Errores comunes o alertas
Errores comunes confirmados por los auditores:
- equivocarse en la fecha de pago
- equivocarse en el año
- capturar mal un número por error de dedo
- usar un `.SUA` que no corresponde
- usar un comprobante de otro mes o de otro pago

Alertas operativas:
- no hacer una resta global, sino por concepto
- no mezclar RP cuando el cliente tiene varios
- no llenar fecha o lugar de pago sin soporte
- revisar manualmente aunque el PDF traiga un total, porque ahí es donde más se equivocan por dedo

## Resumen secuencial muy corto para un junior
1. Ten listo el ACUMSUA.
2. Abre la DGE y llena empresa, RP y año.
3. Trabaja un RP a la vez.
4. En DGE-2 ve mes por mes desde `Datos Trabajador`.
5. Si es mensual, resta `O:T` menos `AG:AJ`, concepto por concepto.
6. Si es bimestral, usa el bloque necesario porque RCV ya viene desglosado.
7. Toma el folio SUA de `Datos Sumarios`, columna D.
8. Llena también trabajadores, días cotizados, ausentismos e incapacidades.
9. DGE-3 se llena desde `Datos Sumarios`, sin fórmulas.
10. Si tienes comprobante, compara y llena fecha/lugar.
11. Si no tienes comprobante, deja eso en blanco y sigue.
12. Al final, revisa que DGE, Datos Sumarios y comprobante cuadren entre sí.
