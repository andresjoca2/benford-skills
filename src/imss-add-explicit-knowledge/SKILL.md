---
name: imss-add-explicit-knowledge
description: >-
  Guia la captura de conocimiento explicito IMSS para Benford Vault V3 y, solo
  cuando existan materiales autorizados y el usuario apruebe crear una nueva
  CONTRIBUTION, pide al usuario elegir explicitamente si el material es DOC,
  DVC o DOL y genera drafts sin tocar canonicos.
  Usa esta skill cuando el usuario quiera documentar documentos fuente,
  documentos legales, documentos fuente genericos o layouts/documentos variables
  al flujo V3 de IMSS.
---

# IMSS Add Explicit Knowledge

## Responsabilidad
Convierte materiales fuente de una `CONTRIBUTION-*` en drafts de `01 Explicit Knowledge` para IMSS.

La skill no crea canonicos ni PROPs. Produce materia prima estructurada para Proposal Builder.

Cuando los materiales fuente ya contienen documentos aterrizados, como
`spec.md`, `schema.md`, `parser_config.md`, `raw_schema.md`, `mapping.md` o
transcripciones legales, la responsabilidad principal de la skill es preservar
esos documentos, no reinterpretarlos. En ese modo, la skill debe copiar el
contenido fuente casi intacto y registrar la trazabilidad en `notes.md` o en un
apartado operativo equivalente dentro de `notes.md`.

Flujo:

```text
materials/session_conversation -> skill_outputs/explicit_knowledge -> Proposal Builder -> Router -> Canonical Editor
```

## Modo por defecto: captura guiada
Cuando el usuario pida documentar conocimiento pero no entregue una
ruta fuente, archivos concretos o autorizacion explicita para usar materiales
existentes, opera en modo entrevista guiada.

En modo entrevista guiada:

- no busques respuestas en el vault, legacy, archivados ni Benford Brain;
- no infieras fuentes documentales por coincidencia de nombre;
- no abras documentos antiguos salvo que el usuario indique una ruta o autorice
  usar fuentes existentes;
- guia al usuario con preguntas cortas sobre que es el documento, quien lo crea,
  como se crea, que insumos requiere, que formato produce, que campos importan
  en auditoria y que pruebas, targets o procesos lo consumen;
- produce solo preview en conversacion hasta que exista informacion suficiente y
  aprobacion de escritura.

## Frontera de fuentes
La skill no debe descubrir fuentes por iniciativa propia.

Fuentes permitidas:

- archivos o rutas entregadas explicitamente por el usuario;
- canonicos existentes de Benford Brain IMSS como contexto, no como evidencia
  primaria, cuando la skill necesite comparar estructura o evitar duplicados.
- materiales especificos que el usuario entregue por ruta exacta para copiar a
  la nueva contribution.

Fuentes no permitidas sin autorizacion:

- contributions existentes, incluso si el nombre parece relevante;
- `90 Archive/`;
- legacy `01 IMSS Mexico/`;
- canonicos existentes como evidencia primaria;
- busqueda amplia en el vault sin ruta exacta;
- documentos con nombres parecidos encontrados por busqueda global.

## Preparacion de contribution
Cada corrida que vaya a escribir debe crear una `CONTRIBUTION-*` nueva. No debe
editar una contribution existente ni buscar contributions anteriores.

Cuando el usuario entregue rutas de archivos fuente, esos archivos son
materiales candidatos, no evidencia estable todavia. Antes de extraer
conocimiento desde ellos, la skill debe pedir el gate de escritura del vault
para crear una nueva contribution y copiar los materiales dentro de:

```text
01 Contribuciones/<grupo>/CONTRIBUTION-YYYY-MM-DD-slug/materials/
```

Reglas de copia:

- copiar cada archivo fuente indicado por el usuario a `materials/`, preservando
  el nombre original cuando no haya conflicto;
- cuando el usuario entregue documentos ejemplo o una carpeta de ejemplos,
  copiarlos bajo `materials/source_documents/examples/`;
- si la ruta fuente autorizada contiene una carpeta `Ejemplos/`, copiar esa
  carpeta a `materials/source_documents/examples/`; los documentos de ejemplo
  reales no deben quedar solo como referencia textual ni mezclarse con
  `legacy_explicit_knowledge`;
- si los ejemplos vienen separados por empresa, cliente, fuente o carpeta
  identificable, preservar esa subcarpeta; si el nombre de empresa esta claro
  pero venia mezclado, separar en `materials/source_documents/examples/<Empresa>/`;
- no renombrar, compactar ni convertir los documentos ejemplo; esos archivos son
  materiales fisicos para que Proposal Generator los declare y Canonical Editor
  los copie al canon;
- si ya existe un archivo con el mismo nombre, no sobrescribirlo sin aprobacion
  explicita; proponer un sufijo claro como `_v2` o la fecha `YYYY-MM-DD`;
- despues de copiar, usar la copia dentro de `materials/` como evidencia
  primaria de la corrida;
- registrar en los outputs la ruta dentro de `materials/` y, cuando sea util,
  la ruta fuente original como procedencia;
- no copiar carpetas completas salvo que el usuario haya autorizado
  explicitamente esa carpeta como material fuente.

Cuando la conversacion de la sesion sea evidencia para la contribution, guardar
un transcript operativo en:

```text
CONTRIBUTION-*/session_conversation.md
```

`call_transcript.md` solo se crea o usa cuando el usuario entregue una
transcripcion de llamada real. Si no existe transcripcion de llamada, no
inventarla ni bloquear la contribution por esa ausencia.

## Estado de automatizacion de contribution
Toda `contribution_map.md` creada por esta skill debe incluir en
`## Identificacion` el campo:

```md
| Estado automation | draft |
```

Plantilla minima obligatoria para `contribution_map.md`:

```md
# Contribution Map - CONTRIBUTION-YYYY-MM-DD-slug

## Identificacion

| Campo | Valor |
|---|---|
| ID | CONTRIBUTION-YYYY-MM-DD-slug |
| Estado | drafts-ready |
| Estado automation | draft |
| Fecha creacion | YYYY-MM-DD |
| Ultima actualizacion | YYYY-MM-DD |
| Owner operativo | imss-add-explicit-knowledge |
```

Reglas:

- `draft` significa que la contribution esta en armado y el automation runner
  debe ignorarla aunque ya existan archivos bajo `skill_outputs/`;
- la skill puede crear carpeta, copiar `materials/`, guardar
  `session_conversation.md`, crear `contribution_map.md` y escribir drafts
  manteniendo `Estado automation` en `draft`;
- no cambiar `Estado automation` a `ready` mientras falten materiales, drafts,
  revision de gaps, validacion final o aprobacion explicita del usuario;
- solo al final, despues de mostrar el resumen de rutas finales y recibir
  aprobacion explicita del usuario para publicar la contribution al runner,
  puede actualizar `contribution_map.md` a:

```md
| Estado automation | ready |
```

El valor exacto que activa automatizacion es `ready`. Si el campo falta o tiene
cualquier otro valor, el runner debe ignorar la contribution.

## Hard Stops
Detente antes de escribir si:

- el usuario no ha aprobado crear una nueva `CONTRIBUTION-*` para esta corrida;
- no hay material fuente real ni transcripcion suficiente;
- el usuario dice que faltan documentos por compartir;
- la ruta de escritura no es `materials/`, `session_conversation.md`,
  `contribution_map.md` bajo las reglas limitadas de esta skill, o
  `skill_outputs/explicit_knowledge/`;
- la tarea pide escribir canonicos directamente;
- la tarea pide modificar legacy `01 IMSS Mexico/`;
- no puedes localizar el Benford Vault V3.

Detente antes de leer o buscar materiales si:

- el usuario no ha proporcionado ruta fuente, archivo, transcripcion o una razon
  concreta para revisar canonicos como contexto;
- el usuario esta describiendo un documento y espera guia o entrevista, no
  extraccion documental;
- la informacion faltante puede obtenerse preguntando al usuario;
- estas a punto de usar una contribution existente, legacy, archivados o busqueda
  global solo porque el nombre se parece al tema.

## Puede Leer
Solo despues de determinar que estas en modo extraccion o de recibir
autorizacion explicita de fuentes:

- la nueva `CONTRIBUTION-*` creada para esta corrida;
- materiales copiados dentro de `CONTRIBUTION-*/materials/`;
- `CONTRIBUTION-*/call_transcript.md`, si el usuario entrego una transcripcion real;
- `CONTRIBUTION-*/session_conversation.md`, si la conversacion de la sesion es evidencia;
- canonicos relacionados en `05 Benford Brain IMSS Mexico` como contexto, no
  como evidencia primaria salvo autorizacion expresa
- templates `DOC`, `DVC`, `DOL`
- contratos de `00 Sistema`

## Templates canonicos obligatorios
Despues de que el usuario elija explicitamente `DOC`, `DVC` o `DOL`, la skill
debe abrir los templates canonicos del tipo elegido antes de redactar cualquier
draft.

Los templates del vault son la fuente de estructura. Eso significa:

- copiar la jerarquia de titulos, orden de secciones, tablas base y placeholders
  del template canonico correspondiente;
- adaptar valores y contenido al material fuente de la contribution, pero sin
  reemplazar la estructura del template por una estructura generica;
- no usar `references/examples.md` como template para drafts tecnicos;
- no usar `contrato-metadata-minima.md` para imponer bloques como `Proposito`,
  `Evidencia usada`, `Contenido producido`, `Limitaciones o dudas` o
  `Sugerencias para Proposal Builder` dentro de `spec_draft.md`,
  `schema_draft.md`, `raw_schema_draft.md`, `mapping_draft.md`,
  `parser_config_draft.md` o `document_transcript_draft.md`;
- usar esos bloques operativos solo en `notes.md` o donde el template canonico
  ya los pida de forma compatible.

Templates obligatorios por tipo:

```text
DOC:
05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-0000_template/spec.md
05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-0000_template/schema.md
05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-0000_template/parser_config.md

DVC:
05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-0000_template/README.md
05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-0000_template/spec.md
05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-0000_template/Variante x/raw_schema.md
05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-0000_template/Variante x/mapping.md
05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-0000_template/Variante x/parser_config.md

DOL:
05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOL Documentos de Leyes/DOL-0000_template/spec.md
05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOL Documentos de Leyes/DOL-0000_template/document_transcript.md
```

Si no puedes abrir los templates del tipo elegido, detente. No redactes con una
estructura recordada, inferida o tomada de otra skill.

## Regla DOL: transcripcion primero
Cuando el tipo confirmado sea `DOL` y el material fuente sea un PDF, Word, HTML,
texto legal o documento normativo completo, `document_transcript_draft.md` debe
ser una transcripcion del documento fuente, no un resumen.

Reglas obligatorias:

- por defecto, transcribir el documento completo;
- usar transcripcion parcial o extractos solo si el usuario lo pide o aprueba
  explicitamente antes de escribir;
- preservar texto UTF-8, acentos, numeracion, titulos, articulos, fracciones,
  transitorios y notas de reforma tal como se extraen de la fuente;
- no normalizar a ASCII;
- no reescribir articulos en lenguaje propio;
- no convertir la ley en tablas de criterios dentro de
  `document_transcript_draft.md`;
- no omitir articulos por relevancia auditora salvo aprobacion explicita del
  usuario;
- separar la transcripcion por paginas, articulos o fragmentos trazables segun
  el documento fuente; si se extrae desde PDF, incluir marcadores de pagina;
- mantener interpretacion, criterios derivados, riesgos y relaciones auditoras
  en `spec_draft.md` o `notes.md`, no dentro del bloque transcrito.

Si el documento es grande y no cabe razonablemente en la conversacion, no lo
resumas. Usa herramienta local de extraccion para generar el archivo Markdown y
reporta numero de paginas, caracteres y cualquier pagina sin texto extraible.

Si el PDF no tiene texto extraible o requiere OCR, detente y pregunta si se debe
usar OCR. No inventes una transcripcion desde lectura visual parcial.

## Puede Escribir
Durante preparacion de contribution, puede escribir solo estas rutas, siempre
despues del gate de escritura del vault:

```text
01 Contribuciones/<grupo>/CONTRIBUTION-YYYY-MM-DD-slug/
01 Contribuciones/CONTRIBUTION-*/materials/<archivo-fuente-copiado>
01 Contribuciones/CONTRIBUTION-*/session_conversation.md
01 Contribuciones/CONTRIBUTION-*/contribution_map.md
```

Durante generacion de drafts, puede escribir solo dentro de:

```text
01 Contribuciones/CONTRIBUTION-*/skill_outputs/explicit_knowledge/
```

Antes de cualquier escritura dentro de `05 Benford Vault/`, incluso dentro de
`01 Contribuciones`, debe aplicar el gate de escritura del vault:

1. listar las rutas exactas que quiere crear o modificar;
2. explicar por que esas rutas pertenecen a esa contribution y no a una carpeta temporal;
3. esperar aprobacion explicita del usuario en esa misma sesion.

Sin esa aprobacion, la skill solo puede producir preview o registrar el bloqueo en
la conversacion. No debe escribir archivos.

Puede escribir `contribution_map.md` solo bajo estas condiciones:

- la aprobacion explicita de escritura al vault ya fue otorgada;
- el archivo pertenece a la nueva contribution de esta corrida;
- registra los renglones de `Materiales fuente` para archivos copiados a
  `materials/`, y/o la tabla `Skills ejecutadas`;
- no registra decisiones canonicas ni PROPs generadas;
- mantiene `Estado automation` en `draft` durante el armado;
- solo cambia `Estado automation` a `ready` como ultima accion, despues de una
  aprobacion explicita separada del usuario para activar el runner;
- antes de escribir, muestra los renglones exactos que agregara.

Salida esperada:

```text
TYPE-slug/
├── spec_draft.md
├── schema_draft.md              # si aplica a DOC
├── parser_config_draft.md       # si aplica a DOC/DVC
├── document_transcript_draft.md # si aplica a DOL
├── <Variante>/                  # si aplica a DVC
│   ├── raw_schema_draft.md
│   ├── mapping_draft.md
│   └── parser_config_draft.md
└── notes.md
```

Para `DVC-*`, `TYPE-slug/` es el documento variable padre. No crees un
`DVC-*` separado por variante. El DVC padre comparte `spec_draft.md` y
`notes.md`; cada variante vive en su propia carpeta interna con
`raw_schema_draft.md`, `mapping_draft.md` y `parser_config_draft.md`.

Si la contribution DVC contiene ejemplos fisicos bajo
`materials/source_documents/examples/`, la salida DVC debe incluir tambien:

```text
DVC-<slug-documento>/source_documents_map.md
```

Este manifiesto es obligatorio antes de marcar `Estado automation` como
`ready`. Proposal Generator no debe inferir a que variante pertenece cada
ejemplo por nombre de carpeta. Si incluyes metadata operativa, coloca la tabla
bajo `## Mapa de ejemplos por variante`. La tabla minima es:

```md
| Variante | Origen en materials | Copiar como ejemplo | Nota |
|---|---|---|---|
| Variante SAP | materials/source_documents/examples/Servicios Administrativos Playa San Jose | si | Ejemplo SAP. |
| Variante generico con naturaleza | materials/source_documents/examples/IMT (Ruben) | si | Ejemplo generico. |
| Variante Selim deudor acreedor | materials/source_documents/examples/Selim/SEL BC 012024.xlsx | si | Layout Selim deudor/acreedor. |
```

Reglas del manifiesto DVC:

- `Variante` debe coincidir exactamente con una carpeta de variante creada bajo
  el output DVC;
- `Origen en materials` debe apuntar a una ruta real dentro de la contribution,
  normalmente bajo `materials/source_documents/examples/`;
- usa una fila por archivo cuando una misma carpeta fuente contiene archivos de
  mas de una variante;
- una carpeta `Ejemplos` canonica no debe mezclar materiales de variantes
  distintas;
- si no puedes mapear cada ejemplo a una variante, conserva
  `Estado automation` en `draft` y registra el bloqueo en `notes.md`.

## Regla copy-through para documentos ya aterrizados

Si una fuente autorizada ya trae documentos estructurados y aterrizados, la
skill debe operar en modo `copy-through`.

Ejemplos de documentos aterrizados:

- `spec.md` o equivalente;
- `schema.md` o equivalente;
- `parser_config.md` o equivalente;
- `raw_schema.md`;
- `mapping.md`;
- `document_transcript.md`;
- cualquier Markdown que el usuario identifique como documento oficial,
  aprobado, terminado o "el bueno".

En modo `copy-through`:

- no parafrasees el contenido fuente;
- no compactes secciones;
- no cambies nombres de campos, columnas, reglas, IDs, expresiones, ejemplos ni
  versionado;
- no "mejores" redaccion, formato tecnico, JSON Schema, YAML/frontmatter,
  tablas, anchors ni regex salvo instruccion explicita del usuario;
- no insertes metadata operativa, razonamiento del agente, resumen de proceso,
  justificacion de la corrida ni instrucciones para otros agentes dentro del
  documento copiado;
- no conviertas links internos o IDs legacy a V3 si no estan validados;
- conserva acentos, frontmatter, versionado y bloques de codigo tal como vienen;
- si hay dudas, gaps o relaciones no validadas, registralas en `notes.md`, no
  reescribiendo el documento fuente.

La unica modificacion permitida dentro del archivo copiado, salvo aprobacion
explicita del usuario, es una nota breve de trazabilidad al inicio o al final.
Si agregar esa nota alteraria un archivo tecnico que debe consumirse
automaticamente, no la agregues; registra toda la trazabilidad en `notes.md`.

Los documentos copy-through no tienen que cumplir el bloque `## Identificacion`
si agregarlo rompe la fidelidad del documento fuente.

## No Puede Escribir
- `02 Proposals/`
- `05 Benford Brain IMSS Mexico/`
- `06 Benford Brain EF Mexico/`
- legacy `01 IMSS Mexico/`
- la skill vieja `imss-document-spec-builder`
- `.codex/skills/` durante una corrida normal

## Workflow
1. Determina el modo:
   - `entrevista guiada`: no hay ruta, archivo ni autorizacion
     explicita para buscar.
   - `extraccion`: el usuario dio archivo, carpeta, transcripcion o autorizo
     buscar materiales existentes fuera de contributions.
2. Si es entrevista guiada:
   - pregunta primero por creacion, origen, insumos, formato, uso auditor,
     evidencia disponible y relaciones con pruebas o targets;
   - no leas vault, legacy ni archivados;
   - resume lo capturado y los gaps;
   - solo pasa a drafts cuando el usuario confirme que la informacion es
     suficiente y autorice fuentes o escritura.
3. Si es extraccion:
   - localiza `Benford Vault V3`;
   - propone un ID y ruta para una nueva `CONTRIBUTION-YYYY-MM-DD-slug`;
   - pide gate del vault para crear esa nueva contribution, copiar materiales
     a `materials/` y crear `contribution_map.md`;
   - usa solo las copias dentro de `materials/` como evidencia primaria;
   - si la sesion contiene evidencia no repetible, incluye en el gate guardar
     `session_conversation.md`;
   - si copia materiales, registra los renglones correspondientes de
     `Materiales fuente` en `contribution_map.md`;
   - inventaria solo materiales dentro de la frontera autorizada;
   - confirma que esos materiales son correctos antes de redactar.
4. Propón una clasificacion candidata, explica por que, y pide al usuario elegir explicitamente una de estas opciones antes de continuar: `DOC`, `DVC` o `DOL`.
5. Determina si aplica modo `copy-through`.
   - Si los materiales ya son documentos aterrizados, prepara copias fieles y
     registra trazabilidad en `notes.md`.
   - Si los materiales son evidencia cruda o conversacion, entonces si puedes
     redactar drafts nuevos a partir de las fuentes.
6. Si el tipo elegido es `DOL`, aplica primero la regla `DOL: transcripcion
   primero`. Para PDF legal completo, genera `document_transcript_draft.md` como
   transcripcion completa salvo que el usuario haya autorizado extractos.
7. Lee `references/contract-map.md` y abre todos los templates canonicos V3 del
   tipo seleccionado. Los templates del vault son la estructura fuente; no uses
   `references/examples.md`, `contrato-metadata-minima.md` ni memoria de otra
   skill como template para `spec_draft.md`, `schema_draft.md`,
   `raw_schema_draft.md`, `mapping_draft.md`, `parser_config_draft.md` ni
   `document_transcript_draft.md`.
8. Antes de escribir, ejecuta el gate de escritura del vault y espera aprobacion explicita.
9. Genera drafts dentro de `skill_outputs/explicit_knowledge/TYPE-slug/`.
10. Registra evidencia, dudas, confianza, gaps, riesgos y sugerencias para Proposal Builder en `notes.md`.
11. Si el tipo elegido es `DVC` y hay ejemplos bajo
    `materials/source_documents/examples/`, crea `source_documents_map.md` con
    la asignacion exacta ejemplo -> variante.
12. Mantiene `Estado automation` en `draft` mientras valida outputs.
13. Muestra resumen final de rutas creadas, gaps y readiness; pregunta
    explicitamente si debe cambiar `Estado automation` a `ready`.
14. Solo si el usuario aprueba esa publicacion final, actualiza
    `contribution_map.md` a `Estado automation | ready |`.
15. Verifica que no se crearon PROPs ni canonicos.

## Clasificacion
La skill nunca debe cerrar la clasificacion sola. Siempre debe pedir que el usuario elija explicitamente `DOC`, `DVC` o `DOL` antes de escribir drafts.

Opciones permitidas:

| Tipo | Usar cuando |
|---|---|
| `DOC-*` | Documento fuente estable, reconocible y reusable. |
| `DVC-*` | Documento variable con una o mas variantes por cliente, software, banco, layout, emisor o formato cambiante. |
| `DOL-*` | Documento legal, ley, reglamento, fundamento normativo o criterio legal. |

Opciones fuera de alcance:

| Tipo | Regla |
|---|---|
| `AIM-*` | No aplica en esta skill. |
| `DICT-*` | No aplica en esta skill. |

Si el material parece `AIM` o `DICT`, detente y explica que esta skill solo procesa `DOC`, `DVC` y `DOL`.

Pregunta obligatoria antes de escribir:

```text
Mi lectura candidata es <tipo> porque <razon>.
Elige una clasificacion para este material: DOC, DVC o DOL.
No voy a escribir drafts hasta que me indiques una de esas tres opciones.
```

Si el usuario no elige explicitamente `DOC`, `DVC` o `DOL`, no escribas drafts. Registra solo preview en conversacion.

## Principios
Antes de redactar drafts documentales, lee `references/principles.md`.

Usa `references/contract-map.md` para rutas y outputs esperados.

Usa `references/examples.md` solo para el formato minimo de `notes.md` y casos de bloqueo.

## Validacion Final
Antes de terminar, confirma:

- todos los drafts creados viven en `skill_outputs/explicit_knowledge/`;
- si se usaron rutas externas, sus copias viven en `materials/` y las rutas de
  evidencia apuntan a esas copias;
- si la conversacion fue evidencia, existe `session_conversation.md`;
- `contribution_map.md` contiene `Estado automation`;
- si la contribution no fue aprobada explicitamente para runner, `Estado automation`
  sigue en `draft`;
- si el usuario aprobo publicar al runner, `Estado automation` quedo en `ready`;
- si el output es `DVC` y existen ejemplos fisicos, existe
  `source_documents_map.md` y cada fila apunta a una variante real y a una ruta
  real dentro de `materials/`;
- cada output tecnico redactado por la skill conserva la jerarquia de titulos y
  orden de secciones del template canonico V3 correspondiente listado en
  `references/contract-map.md`;
- ningun output tecnico usa como estructura base los bloques genericos de
  `contrato-metadata-minima.md`;
- cada output redactado por la skill conserva el bloque de identificacion del
  template canonico cuando exista, sin convertirlo en una metadata generica que
  reemplace la estructura del template;
- si el tipo es `DOL` y la fuente fue un documento legal completo, el
  `document_transcript_draft.md` contiene transcripcion completa o registra una
  aprobacion explicita del usuario para transcripcion parcial/extractos;
- `document_transcript_draft.md` no contiene resumen, criterios derivados,
  interpretacion auditora ni tablas de decision como sustituto del texto fuente;
- los outputs en modo `copy-through` fueron preservados fielmente; su metadata
  operativa vive en `notes.md`;
- cada afirmacion relevante apunta a evidencia;
- `notes.md` contiene confianza/gaps/riesgos;
- no se escribio en Benford Brain;
- no se escribio en `02 Proposals`;
- no se toco `01 IMSS Mexico/`;
- no se modifico `imss-document-spec-builder`.
