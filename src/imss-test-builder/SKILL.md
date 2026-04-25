---
name: imss-test-builder
description: >-
  Construye una prueba IMSS específica a partir de una pestaña del workbook
  oficial, una oficina/firma, los documentos canónicos y el papel de trabajo
  real del auditor. Úsala cuando se necesite definir qué documentos entran,
  qué tablas y variables se amarran, cómo fluye la data al dictamen IMSS y cómo
  redactar `delivery_<firma>_<oficina>.md` y
  `reconciliation_<firma>-<oficina>.md` listos para Obsidian.
---

# IMSS Test Builder

## Propósito

Esta skill aterriza una prueba IMSS en dos capas:

1. el `delivery`, que explica cómo se llena la pestaña oficial del dictamen IMSS (o, en pruebas globales, qué outputs canónicos produce sin llenar pestaña directa).
2. el `reconciliation`, que **describe el algoritmo data-first sobre los schemas canónicos** — operaciones tipo SQL/CTE explícitas sobre tablas DOC-*. **NO replica la metodología Excel del auditor; la reemplaza.**

La unidad de trabajo es siempre una sola prueba a la vez (salvo cuando el usuario activa workflow de batch paralelo — ver anexo compartido).

### Diferencia crítica: data-first vs traducción de SOP

El reconciliation **no** es:
- una traducción paso a paso de lo que hace el auditor en Excel
- una descripción narrativa del flujo del SOP
- una réplica con wiki-links de las celdas del workbook del auditor

El reconciliation **sí** es:
- el algoritmo que genera los mismos resultados que el auditor, pero usando los schemas canónicos como entrada
- operaciones explícitas: tablas intermedias, joins, agregaciones, comparaciones
- una "segunda capa" sobre los DOC-*: cómo nuestro sistema replica el resultado del SOP

El SOP del auditor se usa como **referencia para entender el resultado esperado**, no como receta a copiar.

## Pruebas globales (no llenan pestaña directa)

Algunas pruebas son **globales** — no llenan una pestaña específica del dictamen, sino que producen una base certificada que alimenta otras pruebas downstream y/o soporta el PDF final del cliente.

Cuando reconozcas una prueba global:
- En el frontmatter del delivery, marca `es_prueba_global: true` y `pestaña_excel: "n/a (prueba global)"`.
- Documenta los outputs canónicos como datasets que alimentan downstream.
- Lista explícitamente qué reconciliations downstream consumen estos outputs (`feeds_downstream`).

## Lenguaje neutro obligatorio

**Nunca uses números de prueba** como `5.10`, `5.6.0`, `5.6.1`, etc. en el contenido de los archivos generados.

- Usa el **nombre completo de la prueba** (ej: "Prestaciones otorgadas a los trabajadores", "Conciliación de nóminas, contabilidad, balanza, dictamen y CFDI").
- Cuando referencies otras pruebas downstream/upstream, usa también nombre o descripción funcional, no número.
- Los nombres literales de archivos del auditor (`5.10.2.1.xlsx`, etc.) pueden mencionarse 1-2 veces como "equivalente operativo" pero **no como ciudadano principal**.

## Integración con Benford AI Audit

Antes de hacer trabajo sustantivo, localiza la carpeta raíz llamada exactamente `Benford AI Audit`.

Búscala en este orden:
1. `/root/benford_drive/Benford AI Audit`
2. el workspace actual si ya estás dentro de una ruta que termina en `Benford AI Audit`
3. una ruta local sincronizada de Google Drive u otra ubicación equivalente en la máquina del usuario

Si no puedes localizar esa carpeta, detente y pide la ruta correcta.

Usa `BENFORD_ROOT` para resolver todas las rutas vivas del vault.

## Fuentes vivas obligatorias por sesión

Siempre que inicies una sesión con esta skill, vuelve a cargar estas fuentes porque pueden cambiar:

- `${BENFORD_ROOT}/05 Benford Vault/01 IMSS Mexico/01 - Pruebas IMSS/Plantilla_Informacion_Patronal_v10.1 2.xlsm`
- `${BENFORD_ROOT}/05 Benford Vault/05 Templates/Pruebas IMSS/delivery.md`
- `${BENFORD_ROOT}/05 Benford Vault/05 Templates/Pruebas IMSS/reconciliation.md`

Usa `references/official-workbook-sheets.md` solo como snapshot de apoyo. Si el workbook vivo contradice ese snapshot, manda el workbook vivo.

Antes de redactar outputs, lee también `references/output-rules.md`.

## Reglas duras

- Trabaja sobre una sola prueba o pestaña a la vez.
- Haz preguntas al usuario en un solo bloque, con resumen corto y sugerencias concretas.
- Puedes sugerir documentos probables, pero no los cargues al contexto sin aprobación explícita.
- No continúes si falta `01 - Spec.md` o `02 - Schema.md` de cualquier documento requerido.
- Nunca describas la metodología con referencias a celdas de Excel.
- Toda lógica debe expresarse como operaciones sobre tablas y campos canónicos con wiki-links `[[DOC-<slug>/02 - Schema#<tabla>.<columna>]]`.
- Si una variable del delivery no existe en ningún `DOC-*`, detente y señala el gap documental.
- `status: draft` por default.
- Solo escribe en Obsidian con confirmación explícita del usuario.

## Flujo de trabajo

### Fase 1: Definir la prueba

Pregunta lo mínimo indispensable:

- qué pestaña del workbook oficial se va a trabajar
- qué oficina
- qué firma
- si el usuario ya trae lista de documentos o si va a compartir un SOP o papel de trabajo para inferirla

Si el usuario no sabe el nombre exacto de la pestaña, propone opciones usando el workbook vivo y, como apoyo, `references/official-workbook-sheets.md`.

### Fase 2: Cerrar la lista de documentos

Parte de una de estas fuentes:

- lista dada por el usuario
- SOP compartido por el usuario
- papel de trabajo real del auditor
- sugerencias tuyas según la naturaleza de la prueba

Sugerencias típicas:

- liquidaciones y cuotas: cédulas mensuales, cédulas bimestrales, EMA, EBA, disco SUA, comprobantes de pago SUA
- nómina y contabilidad: acumulado de nómina, balanza, auxiliares, CFDI, lista de raya
- remuneraciones y variables: nómina detallada, factores de integración, papeles de trabajo de prestaciones, bajas y finiquitos

Antes de cargar documentos, presenta la lista propuesta y pide confirmación explícita.

### Fase 3: Validar la biblioteca documental

Por cada documento aprobado, busca su carpeta en:

- `${BENFORD_ROOT}/05 Benford Vault/01 IMSS Mexico/02 - Documentos y Ejemplos/<Documento>/`

La skill solo puede seguir si existen ambos archivos:

- `01 - Spec.md`
- `02 - Schema.md`

Si existe una variante real de nombre como `01 - Spec (1).md`, puedes usarla, pero debes dejarlo señalado como desviación.

Si falta cualquiera de los dos, detente y reporta exactamente qué documento quedó incompleto.

### Fase 4: Entender el delivery IMSS

Carga únicamente la pestaña seleccionada del workbook oficial.

Resuelve para esa pestaña:

- qué variables o columnas se llenan
- cuál es el grain del output
- de qué documento sale cada variable
- de qué tabla y campo sale
- qué agregación o transformación ocurre antes de llegar al dictamen
- si la variable pega directo al dictamen o solo a soporte interno

Si una variable no existe en ningún schema de documento, detente. No inventes el mapeo.

### Fase 5: Entender el amarre del auditor

Pide el Excel o papel de trabajo real con el que el auditor hace la prueba.

Traduce su lógica a:

- inputs documentales
- transformaciones
- cruces
- validaciones
- outputs

Además, determina si ese amarre:

- llena una parte del delivery IMSS
- valida otra prueba
- solo alimenta hallazgos o soporte para el PDF final del cliente

Nunca describas esa lógica con coordenadas de Excel.

### Fase 6: Redactar los artefactos

Cuando ya exista suficiente contexto, prepara los archivos según el patrón aplicable.

#### Patrón A — Una pestaña, un procedimiento (delivery + 1 reconciliation)

```
delivery_<firma>_<oficina>.md
reconciliation_<firma>-<oficina>.md
```

#### Patrón B — Una pestaña, múltiples procedimientos (delivery + N reconciliations)

Cuando una sola pestaña del dictamen requiere varios procedimientos distintos para alimentarla (ej: "Prestaciones otorgadas" requiere factor de integración + aguinaldo + vacaciones + prima vacacional + comedor + despensa + ...):

```
delivery_<firma>_<oficina>.md
reconciliation_<procedimiento1>_<firma>-<oficina>.md
reconciliation_<procedimiento2>_<firma>-<oficina>.md
...
```

`<procedimiento>` es slug corto del procedimiento (ej: `factor-integracion`, `aguinaldo`, `vacaciones`).

Cada reconciliation tiene su propio frontmatter `depends_on` para reflejar dependencias entre procedimientos del mismo delivery.

#### Patrón C — Prueba global (delivery sin pestaña + reconciliations transversales)

Para pruebas globales, el delivery existe pero `pestaña_excel: "n/a"` y describe los outputs canónicos. Los reconciliations típicamente alimentan otras pruebas downstream.

#### Estructura data-first del reconciliation (obligatoria)

Sigue la estructura recomendada (sustituye las narrativas paso a paso del auditor):

1. **Objetivo** y unidad de control
2. **Inputs canónicos** (tabla por DOC-*, con preferencia por outputs canónicos de pruebas upstream cuando existan)
3. **Algoritmo paso a paso** — operaciones tipo SQL/CTE explícitas. Cada paso define una tabla intermedia con su lógica.
4. **Tabla resultado canónica** — la(s) tabla(s) finales, con mapeo a las columnas del PT del auditor para trazabilidad
5. **Reglas de validación** (cierre)
6. **Casos especiales**
7. **Outputs derivados** — qué tablas produce esta reconciliation que otras consumen (cross-link bidireccional)
8. **Notas de mantenimiento**

Cada paso del algoritmo se documenta como pseudo-código SQL/CTE:

```
nombre_tabla :=
  SELECT ...
  FROM ...
  JOIN ...
  WHERE ...
```

Las columnas se referencian con wiki-links: `[[DOC-<slug>/02 - Schema#<tabla>.<columna>]]`.

#### Templates vivos como base estructural

Usa los templates vivos del vault como base de **estructura del frontmatter y headings**. No sustituyas los outputs con una sola nota narrativa. Cuando el template vivo aún no refleje el patrón data-first completo, **adáptalo** sin perder los headings clave.

### Fase 7: Confirmación antes de escribir en Obsidian

Antes de imprimir nada, muestra un resumen corto con:

- prueba o pestaña elegida
- oficina y firma
- documentos canónicos cargados
- ruta exacta de la carpeta destino
- archivos exactos que se van a crear

La ruta de salida por default es:

- `${BENFORD_ROOT}/05 Benford Vault/01 IMSS Mexico/01 - Pruebas IMSS/Pruebas IMSS Oficial/<Nombre literal de la pestaña>/`

Y los archivos:

- `delivery_<firma>_<oficina>.md`
- `reconciliation_<firma>-<oficina>.md`

Solo después de una confirmación explícita del usuario debes escribirlos.

## Criterio mínimo de cierre

No pidas confirmación de subida a Obsidian hasta poder explicar con claridad:

- qué prueba es y qué pestaña corresponde
- qué documentos entran
- cuáles `Spec` y `Schema` se cargaron
- qué variables del dictamen se llenan
- de qué tablas y campos salen
- cómo se hace el amarre
- qué output llega al dictamen IMSS
- qué output queda solo para soporte del PDF final, si aplica

## Qué evitar

- avanzar con documentos no aprobados por el usuario
- seguir si falta `Spec` o `Schema`
- referenciar celdas de Excel
- **traducir el SOP paso a paso en lugar de generar el algoritmo data-first** (ver "Diferencia crítica" arriba)
- **usar números de prueba** (5.10, 5.6.x, etc.) en el contenido
- **modelar reconciliations como narrativa de Excel del auditor** en lugar de operaciones sobre tablas canónicas
- hacer demasiadas preguntas de golpe sin necesidad
- repetirle al usuario lo ya entendido en exceso
- escribir en Obsidian sin confirmación explícita

## Anexos compartidos con `imss-document-spec-builder`

- `../_shared/conventions-identificadores.md` — convenciones globales para NSS, RFC, CURP, claves, etc.
- `../_shared/workflow-batch-paralelo.md` — workflow Fase A/B/C cuando el usuario trae varios reconciliations en una sesión.
