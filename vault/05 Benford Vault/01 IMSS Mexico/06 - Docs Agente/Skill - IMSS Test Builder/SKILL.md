---
name: imss-test-builder
description: Construir una prueba IMSS específica desde la pestaña del Excel oficial del dictamen, la oficina/firma, los documentos canónicos y el papel de trabajo del auditor; usar cuando se necesite definir qué documentos entran, qué tablas y variables se amarran, cómo fluye la data al entregable final y redactar `delivery_<firma>_<oficina>.md` y `reconciliation_<firma>-<oficina>.md` para Obsidian. No usar si falta `01 - Spec.md` o `02 - Schema.md` de algún documento requerido.
---

# IMSS Test Builder

## Propósito
Armar la esencia operativa de una prueba IMSS: qué documentos entran, qué variables se cruzan, cómo se hacen los amarres, qué llega al dictamen IMSS y qué queda solo como soporte para el entregable final del cliente.

La unidad de trabajo es una sola prueba. En este sistema, la prueba se identifica por una pestaña del workbook oficial. Ver `references/pestanas-dictamen-imss.md`.

## Reglas no negociables
- Trabajar siempre sobre una sola prueba o pestaña a la vez.
- Preguntar al usuario en un solo bloque, con resúmenes cortos y sugerencias concretas.
- No meter documentos candidatos al contexto sin permiso explícito.
- Antes de cargar documentos, confirmar o proponer la lista final.
- Si falta `01 - Spec.md` o `02 - Schema.md` de cualquier documento requerido, pausar y no continuar.
- No referenciar celdas de Excel (`F13`, `Amarre!H17`) en ningún output.
- Describir la metodología como operaciones sobre tablas y campos con wiki-links `[[DOC-<slug>/02 - Schema#<tabla>.<columna>]]`.
- Cualquier variable del delivery debe poder trazarse a un `DOC-*` canónico.
- `status: draft` por default.
- Subir a Obsidian solo con confirmación explícita.
- Antes de imprimir en Obsidian, mostrar qué archivos se van a crear y en qué ruta.

## Estilo de preguntas
- Empezar con un solo bloque corto de preguntas.
- Incluir sugerencias cuando el usuario pueda escoger entre varias opciones.
- Evitar bloques largos salvo que realmente falten varias definiciones base al mismo tiempo.
- No gastar turnos repitiendo lo ya entendido; resumir y seguir.

## Rutas y plantillas
Antes de redactar outputs, leer `references/rutas-y-plantillas.md`.

## Flujo obligatorio

### Paso 1 - Definir la prueba
Primer bloque de preguntas mínimo:
- qué prueba vamos a hacer: nombre literal de la pestaña del Excel oficial
- qué oficina
- qué firma
- si el usuario ya trae lista de documentos o si va a compartir un SOP o papel de trabajo para inferirla

Si el usuario no sabe el nombre exacto de la prueba, sugerir opciones usando la lista de pestañas.

### Paso 2 - Identificar documentos requeridos
Objetivo: cerrar la lista de documentos que participan en la prueba.

Forma de trabajo:
- partir de lo que diga el usuario
- si hace falta, sugerir documentos probables según la prueba
- si el usuario comparte un SOP, leerlo para proponer lista de documentos
- antes de cargar documentos al contexto, pedir confirmación explícita de la lista final

Después de la confirmación:
- por cada documento aprobado, cargar `01 - Spec.md` y `02 - Schema.md` en `05 Benford Vault/01 IMSS Mexico/02 - Documentos y Ejemplos/<Documento>/`
- no basta con uno de los dos
- si el archivo existe con variante de nombre como `01 - Spec (1).md`, usar el archivo real disponible y señalar la desviación
- si falta cualquiera de los dos, detenerse y reportar exactamente qué documento está incompleto

Sugerencias típicas por familia de prueba:
- liquidaciones y cuotas: cédulas mensuales, cédulas bimestrales, disco SUA, comprobantes de pago SUA, EMA, EBA
- nómina y contabilidad: acumulado de nómina, balanza, auxiliares, CFDI, lista de raya
- remuneraciones y variables: nómina detallada, factores de integración, papeles de trabajo de prestaciones, bajas o finiquitos

### Paso 3 - Entender el delivery del dictamen IMSS
Objetivo: entender solo la pestaña seleccionada del workbook oficial.

Reglas:
- usar el workbook oficial indicado en `references/rutas-y-plantillas.md`
- cargar al contexto únicamente la pestaña de la prueba actual
- identificar variables o columnas que se llenan en esa pestaña
- mapear cada variable a su fuente documental canónica con wiki-links a schema
- si alguna variable no existe en ningún schema de documento, detenerse y pedir que primero se complete la biblioteca documental

Preguntas que sí hay que resolver:
- qué variable pide el dictamen
- de qué documento sale
- de qué tabla y campo sale
- qué transformación o agregación se hace antes de llegar al dictamen
- si el campo alimenta directo al IMSS o solo soporte interno

### Paso 4 - Entender el amarre del auditor
Objetivo: conectar el papel de trabajo real con los schemas de documentos y con el delivery.

Forma de trabajo:
- pedir el Excel o papel de trabajo con el que el auditor hace el amarre
- hacer las preguntas necesarias para ligar sus columnas y variables con tablas y campos de los `DOC-*`
- distinguir si el amarre:
  - llena una parte del delivery IMSS
  - valida otra prueba
  - solo alimenta soporte o hallazgos para el PDF final del cliente

Nunca describir la lógica del amarre con referencias de celdas. Traducirlo siempre a:
- inputs documentales
- transformaciones
- cruces
- validaciones
- outputs

### Paso 5 - Sintetizar los dos documentos objetivo
Cuando ya exista suficiente contexto, redactar dos artefactos listos para Obsidian usando las plantillas oficiales:
- `delivery_<firma>_<oficina>.md`
- `reconciliation_<firma>-<oficina>.md`

Reglas:
- la carpeta destino es `05 Benford Vault/01 IMSS Mexico/01 - Pruebas IMSS/Pruebas IMSS Oficial/<Nombre literal de la pestaña>/`
- usar como base `05 Benford Vault/05 Templates/Pruebas IMSS/delivery.md`
- usar como base `05 Benford Vault/05 Templates/Pruebas IMSS/reconciliation.md`
- conservar `status: draft` hasta que el usuario pida lo contrario
- si una parte de la prueba no pega al dictamen pero sí al PDF final, documentarlo explícitamente en `reconciliation` como soporte, hallazgo o output intermedio
- si el `delivery` para esa prueba queda idéntico entre oficinas, aun así documentarlo con el nombre acordado por este sistema, salvo que el usuario indique cambiar la convención

## Criterio de suficiencia antes de pedir confirmación
No pedir confirmación de subida a Obsidian hasta poder explicar con claridad:
- qué prueba es y qué pestaña corresponde
- qué documentos entran
- cuáles `Spec` y `Schema` se cargaron
- qué variables del dictamen se llenan
- de qué tablas y campos salen
- cómo se hace el amarre
- qué output llega al dictamen IMSS
- qué output queda solo para soporte del PDF final, si aplica

## Bloque de confirmación antes de imprimir en Obsidian
Cuando ya esté listo, cerrar con un resumen corto y pedir confirmación explícita.

Ese resumen debe decir:
- prueba o pestaña elegida
- oficina y firma
- documentos canónicos usados
- archivos que se van a crear
- ruta exacta de la carpeta en Obsidian

Formato esperado:
- carpeta: `.../Pruebas IMSS Oficial/<Pestaña>`
- archivos: `delivery_<firma>_<oficina>.md` y `reconciliation_<firma>-<oficina>.md`

## Qué evitar
- avanzar con documentos no aprobados por el usuario
- seguir si falta `Spec` o `Schema`
- referenciar celdas de Excel
- preguntar demasiadas cosas de golpe sin necesidad
- hablar mucho de lo ya entendido
- subir a Obsidian sin confirmación explícita
