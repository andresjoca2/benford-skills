# IMSS Dictamen, Hojas y Variables

## Propósito

Este documento mapea el workbook del dictamen IMSS hoja por hoja para entender:

- cuáles son las secciones reales del entregable final,
- qué variables o columnas se capturan en cada una,
- cuáles aplican de forma general,
- cuáles aplican de forma condicional,
- y qué tipo de información parece exigir cada pestaña.

Este documento sirve como base para que el `product-agent` pueda ligar SOPs, documentos, procedimientos y origen de datos con el dictamen final del IMSS.

---

## Resumen general del workbook

- Archivo analizado: `Plantilla_Informacion_Patronal_v10.1_2`
- Total de hojas detectadas: **28**
- Naturaleza del archivo:
  - workbook estructurado del dictamen IMSS,
  - con una mezcla de hojas de captura operativa,
  - hojas de clasificación/contexto,
  - hojas condicionales para REPSE/subcontratación/construcción,
  - y una hoja de control de versión.

---

# 1. Hojas generales que aplican a todas las empresas

## 1.1 Registros Patronales
**Tipo:** base de identificación patronal

**Variables visibles detectadas:**
- No fue posible detectar la fila completa de columnas con la corrida automática actual.
- Sí se confirmó que es una hoja base del workbook y que requiere revisión puntual posterior.

**Notas:**
- conviene revisar esta hoja manualmente o con extracción específica posterior
- probablemente sirve como base de registros patronales a dictaminar

---

## 1.2 Remuneraciones pagadas
**Tipo:** captura operativa detallada por trabajador

**Variables visibles detectadas (52):**
- Consecutivo
- RP
- Primer apellido
- Segundo apellido
- Nombre(s)
- NSS
- RFC
- CURP
- Fecha de ingreso del trabajador
- Sueldos y Salarios Rayas y Jornales
- Gratificación Anual (Aguinaldo)
- Participación de los Trabajadores en las Utilidades PTU
- Reembolso de Gastos Médicos Dentales y Hospitalarios
- Fondo de ahorro patrón
- Fondo de ahorro trabajador
- Caja de ahorro
- Contribuciones a Cargo del Trabajador Pagadas por el Patrón
- Premios por puntualidad
- Prima de Seguro de vida
- Seguro de Gastos Médicos Mayores
- Cuotas Sindicales Pagadas por el Patrón
- Subsidios por incapacidad
- Becas para trabajadores y/o hijos
- Hora extra
- Prima dominical
- Prima vacacional
- Prima por antigüedad
- Pagos por separación
- Seguro de retiro
- Indemnizaciones
- Reembolso por funeral
- Cuotas de seguridad social pagadas por el patrón
- Comisiones
- Vales de despensa
- Vales de restaurante
- Vales de gasolina
- Vales de ropa
- Ayuda para renta
- Ayuda para artículos escolares
- Ayuda para anteojos
- Ayuda para transporte
- Ayuda para gastos de funeral
- Otros ingresos por salarios
- Jubilaciones, pensiones o haberes de retiro
- Jubilaciones, pensiones o haberes de retiro en parcialidades
- Ingresos en acciones o títulos valor que representan bienes
- Alimentación
- Habitación
- Premios por asistencia
- Viáticos
- Total
- Excedentes por salario tope

**Notas:**
- esta hoja es una de las más críticas para la metodología
- requiere fuerte trazabilidad documental, de nómina, de acumulados y de transformaciones previas

---

## 1.3 Prestaciones otorgadas
**Tipo:** captura operativa de prestaciones

**Variables visibles detectadas (11):**
- Consecutivo
- Instrumentos de trabajo
- Cantidades aportadas para fines sociales
- Alimentación
- Habitación
- Aportaciones adicionales por RCV
- Cuota obrera pagada por el patrón
- Cuotas pagadas al INFONAVIT
- Fondo de pensiones
- Otras prestaciones
- Total

---

## 1.4 Cuotas pagadas al Instituto
**Tipo:** captura operativa de cuotas IMSS

**Variables visibles detectadas (29):**
- Consecutivo
- RP
- Cotizantes reportados
- Días cotizados
- Días de ausentismo
- Días de incapacidad
- Cuota fija
- Cuota excedente patrón
- Cuota excedente obrero
- Prestaciones en dinero patrón
- Prestaciones en dinero obrero
- Gastos médicos pensionados patrón
- Gastos médicos pensionados obrero
- Riesgos de trabajo
- Guarderías y prestaciones sociales
- Invalidez y vida patrón
- Invalidez y vida obrero
- Suerte principal COP
- Actualización
- Recargos
- Total de COP
- Retiro
- Cesantía y vejez patrón
- Cesantía y vejez obrero
- Suerte principal RCV
- Actualización
- Recargos
- Total RCV
- INFONAVIT pagado

---

## 1.5 Personas físicas
**Tipo:** captura de operaciones con personas físicas

**Variables visibles detectadas (10):**
- Consecutivo
- RFC
- CURP
- Primer apellido
- Segundo apellido
- Nombre(s)
- Número de seguridad social
- Actividad o trabajo desempeñado por la persona física
- No. de meses en los que operó
- Monto de operaciones

---

## 1.6 Sección A. Procesos de trabajo
**Tipo:** clasificación empresarial

**Variables visibles detectadas (5):**
- Consecutivo
- RP
- Procesos iniciales
- Procesos intermedios
- Procesos finales

**Notas:**
- esta hoja es especialmente importante para el modelo futuro
- coincide con la lógica de procesos iniciales, intermedios y finales

---

## 1.7 Sección B. Bienes y materias
**Tipo:** clasificación empresarial

**Variables visibles detectadas (4):**
- Consecutivo
- RP
- Bienes elaborados o servicios prestados
- Materias primas y materiales utilizados

---

## 1.8 Sección C. Maquinaria y equipo
**Tipo:** clasificación empresarial

**Variables visibles detectadas (7):**
- Consecutivo
- RP
- No. de unidades
- Nombre
- Uso
- Forma de operación
- Capacidad o potencia

---

## 1.9 Sección D. Equipo de transporte
**Tipo:** clasificación empresarial

**Variables visibles detectadas (7):**
- Consecutivo
- RP
- No. de unidades
- Nombre
- Uso
- Combustible o energía
- Capacidad o potencia

---

## 1.10 Sección E. Personal
**Tipo:** clasificación empresarial

**Variables visibles detectadas (4):**
- Consecutivo
- RP
- No. de trabajadores
- Oficio u ocupación

---

## 1.11 C.E. Act. complementarias
**Tipo:** clasificación empresarial complementaria

**Variables visibles detectadas (23):**
- Consecutivo
- RP
- Distribución o entrega de mercancías
- Servicios de instalación
- Servicios de almacenaje
- ¿Otorgó seguro de gastos médicos mayores a los Trabajadores?
- Clase
- Fracción
- Prima 1(Ene-Feb)
- Prima 2(Mzo-Dic)
- Prima 3(Otra)
- Observaciones
- ¿El Registro patronal se encuentra ubicado en la clase y fracción que le corresponde de acuerdo al catálogo de actividades para la clasificación de las empresas en el seguro de riesgos de trabajo, contenido en el Reglamento del Seguro Social en materia de Afiliación, Clasificación de Empresas, Recaudación y Fiscalización?
- División
- Grupo
- Fracción
- Clase de riesgo
- Prima media
- Fecha del cambio de actividad
- Fecha de presentación del AM-SRT
- Notas relevantes de la nueva clasificación
- ¿Presentó escrito de desacuerdo o medio de defensa derivado de la notificación de una resolución de rectificación de la clasificación?
- 5

---

## 1.12 Balanza de comprobación
**Tipo:** hoja contable base

**Variables visibles detectadas (8):**
- Consecutivo
- Nivel
- Número de cuenta
- Nombre de la cuenta o subcuenta
- Saldo inicial
- Debe
- Haber
- Saldo final

---

## 1.13 Diferencias por dictamen
**Tipo:** cédula de pagos por dictamen

**Variables visibles detectadas (34):**
- Consecutivo
- RP
- Período pagado
- Folio SUA
- Fecha de pago
- Cuota fija
- Cuota excedente patrón
- Cuota excedente obrero
- Prestaciones en dinero patrón
- Prestaciones en dinero obrero
- Gastos médicos pensionados patrón
- Gastos médicos pensionados obrero
- Riesgos de trabajo
- Guarderías y prestaciones sociales
- Invalidez y vida patrón
- Invalidez y vida obrero
- Suerte principal COP
- Actualización
- Recargos
- Total de COP
- Retiro
- Cesantía y vejez patrón
- Cesantía y vejez obrero
- Suerte principal RCV
- Actualización
- Recargos
- Total RCV
- Altas o reingresos
- Bajas
- Modificaciones de salario
- Total de movimientos afiliatorios
- Promedio de trabajadores del ejercicio dictaminado
- Trabajadores revisados
- Trabajadores regularizados

---

## 1.14 Variables de remuneraciones
**Tipo:** análisis de conceptos variables

**Variables visibles detectadas (4):**
- Consecutivo
- Conceptos variables reportados en remuneraciones
- Importe total de percepciones variables del sexto bimestre anterior al ejercicio dictaminado
- Importe total de percepciones variables del sexto bimestre del ejercicio dictaminado

---

## 1.15 Variables pagos por separación
**Tipo:** análisis de pagos por separación

**Variables visibles detectadas (4):**
- Consecutivo
- Conceptos considerados en pagos por separación
- Importe considerado en pagos por separación que fueron variables del sexto bimestre anterior al ejercicio dictaminado
- Importe considerado en pagos por separación que fueron variables del sexto bimestre del ejercicio dictaminado

---

## 1.16 Variables otros ingresos
**Tipo:** análisis de otros ingresos por salario

**Variables visibles detectadas (4):**
- Consecutivo
- Conceptos considerados en otros ingresos por salario
- Importe considerado en otros ingresos por salarios que fueron variables del sexto bimestre anterior al ejercicio dictaminado
- Importe considerado en otros ingresos por salarios que fueron variables del sexto bimestre del ejercicio dictaminado

---

## 1.17 Cédula de variables por bajas
**Tipo:** trabajadores con baja

**Variables visibles detectadas (9):**
- Consecutivo
- NSS
- Primer apellido
- Segundo apellido
- Nombre(s)
- RFC
- RP en el que causó baja
- Fecha de baja
- SBC con el que causó baja

---

## 1.18 Cédula de proveedores
**Tipo:** operaciones con proveedores

**Variables visibles detectadas (8):**
- Consecutivo
- RFC del retenedor
- RFC del retenido
- Nombre, denominación y razón social
- Tipo de tercero
- Bien o servicio proveído
- Número de operaciones
- Valor de las operaciones

---

# 2. Hojas condicionales para empresas REPSE prestadoras

## 2.1 Prestación de servicios especializados
**Tipo:** contratos y condiciones de prestación especializada

**Variables visibles detectadas (18):**
- Consecutivo
- Nombre, denominación o razón social
- RFC
- RP
- Objeto del contrato
- Inicio del contrato
- Conclusión del contrato
- No. de trabajadores
- ¿El personal asignado, realizó los trabajos con elementos propios del prestador de servicios especializados?
- ¿El beneficiario es responsable de la dirección, supervisión o capacitación del personal de servicios especializados asignado?
- Costo anual de nómina
- Folio del registro REPSE
- Fecha del registro REPSE
- Estatus del registro REPSE
- Actividad económica especializada manifestada en REPSE
- Folio del contrato reportado en ICSOE
- Folio ICSOE
- Fecha de presentación ICSOE

---

## 2.2 Info Perso servic espec propor
**Tipo:** detalle de trabajadores proporcionados

**Variables visibles detectadas (21):**
- Consecutivo
- RFC del Beneficiario
- RP
- Primer apellido
- Segundo apellido
- Nombre(s)
- NSS
- RFC
- CURP
- Puesto desempeñado
- Tipo de personal
- SBC
- Fecha de ingreso
- Días trabajados o pagados
- Folio del registro REPSE
- Fecha del registro REPSE
- Estatus del registro REPSE
- Actividad económica especializada manifestada en REPSE
- Folio del contrato reportado en ICSOE
- Folio ICSOE
- Fecha de presentación ICSOE

---

# 3. Hojas condicionales para empresas que contratan servicios especializados

## 3.1 Subcontratación de servicios es
**Tipo:** contratos de subcontratación especializada

**Variables visibles detectadas (17):**
- Consecutivo
- Nombre, denominación o razón social
- RFC
- RP
- Objeto del contrato
- Inicio del contrato
- Conclusión del contrato
- No. de trabajadores
- ¿El personal de servicios especializados proporcionado al beneficiario, realizó los trabajos con elementos propios del prestador de servicios?
- ¿El beneficiario del personal de servicios especializados, es responsable de la dirección, supervisión o capacitación del personal proporcionado?
- Folio del registro REPSE
- Fecha del registro REPSE
- Estatus del registro REPSE
- Actividad económica especializada manifestada en REPSE
- Folio del contrato reportado en ICSOE
- Folio ICSOE
- Fecha de presentación ICSOE

---

## 3.2 Info Perso servic espec subcont
**Tipo:** detalle de trabajadores subcontratados

**Variables visibles detectadas (20):**
- Consecutivo
- RP del prestador de servicios especializados
- Primer apellido
- Segundo apellido
- Nombre(s)
- NSS
- RFC
- CURP
- Puesto desempeñado
- Tipo de personal
- SBC
- Fecha de ingreso
- Días trabajados o pagados
- Folio del registro REPSE
- Fecha del registro REPSE
- Estatus del registro REPSE
- Actividad económica especializada manifestada en REPSE
- Folio del contrato reportado en ICSOE
- Folio ICSOE
- Fecha de presentación ICSOE

---

# 4. Hojas condicionales para constructoras

## 4.1 Relación obras const ejer dicta
**Tipo:** catálogo de obras

**Variables visibles detectadas (26):**
- Consecutivo
- RP
- Calle
- No. exterior
- No. interior
- Colonia
- Municipio o alcaldía
- Código postal
- Estado
- No. de registro de obra SATIC / SIROC
- Del
- Al
- Obra pública o privada
- Tipo o fase de obra
- No. de contrato
- Importe contratado sin IVA
- Superficie M2
- No. de trabajadores
- Total de remuneraciones por obra
- Folio del registro REPSE
- Fecha del registro REPSE
- Estatus del registro REPSE
- Actividad económica especializada manifestada en REPSE
- Folio del contrato reportado en ICSOE
- Folio ICSOE
- Fecha de presentación ICSOE

---

## 4.2 Info Personal construcción obra
**Tipo:** personal por obra

**Variables visibles detectadas (16):**
- Consecutivo
- No. de registro de obra SATIC / SIROC
- Primer apellido
- Segundo apellido
- Nombre(s)
- NSS
- RFC
- CURP
- SBC
- Folio del registro REPSE
- Fecha del registro REPSE
- Estatus del registro REPSE
- Actividad económica especializada manifestada en REPSE
- Folio del contrato reportado en ICSOE
- Folio ICSOE
- Fecha de presentación ICSOE

---

## 4.3 Sub obra o Sub ejec obra especi
**Tipo:** subcontratación de obra

**Variables visibles detectadas (19):**
- Consecutivo
- Nombre, denominación o razón social
- RFC
- RP
- No. de registro de obra IMSS del Patrón que subcontrató
- No. de registro de obra IMSS del subcontratista
- Fase de construcción
- Superficie M2
- Importe contratado sin IVA
- Del
- Al
- No. de Trabajadores que intervinieron en la obra
- Folio del registro REPSE
- Fecha del registro REPSE
- Estatus del registro REPSE
- Actividad económica especializada manifestada en REPSE
- Folio del contrato reportado en ICSOE
- Folio ICSOE
- Fecha de presentación ICSOE

---

## 4.4 Presta trabajo ejec obra especi
**Tipo:** obras especializadas prestadas

**Variables visibles detectadas (27):**
- Consecutivo
- RP
- Calle
- No. exterior
- No. interior
- Colonia
- Municipio o alcaldía
- Código postal
- Estado
- No. de registro de obra SATIC / SIROC
- Del
- Al
- Obra pública o privada
- Tipo o fase de obra
- No. de contrato
- Objeto de contrato
- Importe contratado sin IVA
- Superficie M2
- No. de trabajadores
- Total de remuneraciones por obra
- Folio del registro REPSE
- Fecha del registro REPSE
- Estatus del registro REPSE
- Actividad económica especializada manifestada en REPSE
- Folio del contrato reportado en ICSOE
- Folio ICSOE
- Fecha de presentación ICSOE

---

## 4.5 Info Perso ejecu obra especiali
**Tipo:** personal por obra especializada

**Variables visibles detectadas (18):**
- Consecutivo
- No. de registro de obra SATIC / SIROC
- Primer apellido
- Segundo apellido
- Nombre(s)
- NSS
- RFC
- CURP
- SBC
- Fecha de ingreso
- Días trabajados o pagados
- Folio del registro REPSE
- Fecha del registro REPSE
- Estatus del registro REPSE
- Actividad económica especializada manifestada en REPSE
- Folio del contrato reportado en ICSOE
- Folio ICSOE
- Fecha de presentación ICSOE

---

# 5. Hoja de control / soporte del archivo

## Version
**Tipo:** hoja de control técnico del workbook

**Variables visibles detectadas (5):**
- Versión
- Nombre de la hoja
- Fecha de modificación
- Actualización
- Comentarios

---

# Conclusiones iniciales

## 1. El dictamen final combina varios tipos de información
No todas las hojas son equivalentes. El workbook mezcla:
- identificación base,
- captura detallada por trabajador,
- análisis de variables,
- clasificación empresarial,
- contratos y relaciones REPSE,
- datos de construcción,
- hojas de control y validación.

## 2. Hay hojas que claramente demandan trazabilidad documental y de origen de datos
Especialmente:
- Remuneraciones pagadas
- Prestaciones otorgadas
- Cuotas pagadas al Instituto
- Balanza de comprobación
- Diferencias por dictamen
- Variables de remuneraciones
- Variables pagos por separación
- Variables otros ingresos
- Cédula de proveedores
- hojas REPSE
- hojas de construcción

## 3. El `product-agent` deberá poder distinguir entre hojas de captura directa y hojas que dependen de procesos previos complejos
Eso será importante para ligar:
- procedimientos,
- documentos,
- Excels intermedios,
- información proporcionada por cliente,
- y transformaciones internas del auditor.

## 4. La hoja `Sección A. Procesos de trabajo` puede ser especialmente valiosa para el modelo futuro
Porque ya trae la idea de:
- procesos iniciales,
- procesos intermedios,
- procesos finales.

Eso puede ayudar a conectar la metodología del auditor con el dictamen IMSS.

---

# Siguiente uso de este documento

Este catálogo debe servir como base para:
1. redactar el documento marco del dictamen IMSS,
2. ayudar al `product-agent` a entender el objetivo final,
3. empezar a ligar SOPs y documentos con hojas concretas del dictamen,
4. construir la matriz conceptual-operacional futura.
