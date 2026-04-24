---
name: imss-document-spec-builder
description: >-
  Documenta formalmente tipos de documentos usados en auditorías IMSS (como
  comprobantes de pago SUA, cédulas de determinación, emisiones IDSE, discos
  SUA, etc.) generando o actualizando un paquete canónico de 4 archivos
  Markdown a partir de ejemplos reales y SOPs cuando existan. Usa esta skill
  siempre que el usuario quiera documentar, especificar, modelar o fichar un
  tipo de documento para la bóveda de auditoría IMSS, incluso si no menciona
  las palabras exactas spec o template.
---

# IMSS Document Spec Builder

## Propósito

Esta skill convierte un tipo de documento usado en auditorías IMSS en un paquete canónico de 4 archivos Markdown que alimenta una bóveda de conocimiento. Los archivos generados son consumidos por sistemas de AI que necesitan entender qué es cada documento, qué datos contiene, cómo parsearlo y con qué otros documentos se relaciona.

## Integración con Codex y Benford AI Audit

- En Codex, esta skill debe escribir archivos directamente dentro del filesystem real del usuario. No uses rutas efímeras ni `/mnt/user-data/outputs`.
- Antes de hacer cualquier trabajo sustantivo, localiza la carpeta raíz llamada exactamente `Benford AI Audit`.
- Búscala en este orden:
  1. `/root/benford_drive/Benford AI Audit`
  2. el workspace actual si ya estás dentro de una ruta que termina en `Benford AI Audit`
  3. una ruta local sincronizada de Google Drive u otra ubicación equivalente en la máquina del usuario
- Si no puedes localizar esa carpeta raíz, detente y pide la ruta correcta.

## Templates vivos: carga obligatoria por sesión

Siempre que inicies una sesión con esta skill, carga de nuevo los 4 templates fuente desde la carpeta viva del Drive porque pueden cambiar.

Con `BENFORD_ROOT` ya localizado, la fuente de verdad es:

- `${BENFORD_ROOT}/05 Benford Vault/Templates/Documents/Spec.md`
- `${BENFORD_ROOT}/05 Benford Vault/Templates/Documents/Schema.md`
- `${BENFORD_ROOT}/05 Benford Vault/Templates/Documents/Parser_config.md`
- `${BENFORD_ROOT}/05 Benford Vault/Templates/Documents/Change_log.md`

Reglas:

- Estos 4 templates vivos son la fuente principal de estructura y headings.
- No sustituyas estos outputs por un solo Data Model narrativo.
- No produzcas otro output principal por default.
- No uses los templates empaquetados en `references/template-*.md` como fuente principal; trátalos solo como material legacy de respaldo si los templates vivos no estuvieran disponibles.

## Inputs requeridos

Antes de generar nada, el mínimo requerido es:

1. **Identificación del documento a trabajar** — qué documento específico se quiere fichar.
2. **Al menos un ejemplo real del documento** (PDF, XLS, archivo binario, etc.). Sin ejemplo, no se puede generar el paquete.

Inputs opcionales pero muy útiles:

- **SOPs** que describan cómo se usa el documento en una prueba de auditoría.
- notas operativas, sesiones, comentarios del usuario o contexto de carpeta.

Si hay SOP, úsalo como fuente fuerte de contexto.
Si no hay SOP, no te detengas por eso: continúa apoyándote en los ejemplos, el contexto de carpetas, nombres de archivo, documentos hermanos y preguntas mínimas de aclaración.

## Flujo de trabajo

### Fase 1: Entender el documento

1. Localiza `BENFORD_ROOT`.
2. Carga los 4 templates vivos del Drive.
3. Lee los ejemplos reales del documento (si es binario como `.xls` o `.sua`, usa las herramientas apropiadas para inspeccionarlo).
4. Lee los SOPs que existan y sean relevantes, si los hay.
5. Si no hay SOP, reconstruye el contexto desde:
   - la carpeta donde vive el ejemplo
   - documentos vecinos
   - nombres de archivo
   - la prueba IMSS o flujo al que parece pertenecer
   - preguntas mínimas al usuario
6. Identifica qué datos se extraen, con qué otros documentos se cruza, en qué pruebas se usa y qué reglas aplica.

### Fase 2: Preguntas de alcance

Pregunta al usuario lo mínimo necesario para resolver ambigüedades de diseño. Típicas preguntas según el caso:

- **Slug del documento** (ID corto, snake-case): propón uno con base en el nombre, pero confirma.
- **Alcance del documento**: ¿cubre todas las variantes (ej: todos los bancos) o es uno por variante?
- **Uno o varios documentos**: si el SOP menciona varios nombres juntos (ej: "EMA/EBA"), ¿son un solo DOC o varios? Propón tu análisis y pregunta.
- **Campos relevantes**: si el documento tiene muchos campos pero solo algunos alimentan pruebas, confirma qué incluir.
- **Decisiones de diseño específicas**: primary key del schema, granularidad, manejo de campos opcionales, etc.

No hagas preguntas cuya respuesta sea obvia del contexto. Propón con criterio y confirma.

### Fase 3: Aplicar los 4 principios

Los principios están documentados en detalle en `references/principles.md`. **Léelo antes de generar los archivos**. Resumen:

1. **No personalizar por auditor**: nunca menciones "Rubén dice X" o "Josefina dice Y". El documento es neutro. Si hay variación de uso, decir "puede variar según el flujo".
2. **Solo info que alimenta pruebas**: no incluir datos "bonitos" del documento si no se consumen en amarres, cálculos o validaciones. Si el usuario pide conservar algo específico, hacerlo.
3. **Razonar con criterio propio sin inventar**: puedes redactar con tus palabras, conectar ideas, modelar con criterio de arquitecto en el Schema y el Parser. Pero los datos factuales (reglas, importes, campos que existen) salen de los SOPs y ejemplos — no te los inventes.
4. **Ignorar anotaciones de auditor en archivos raw**: si un ejemplo tiene columnas o marcas que fueron agregadas por el auditor para su papel de trabajo (no son del archivo oficial del emisor), el parser canónico las ignora. Típicamente se documentan como EC (casos límite).

### Fase 4: Generar los outputs canónicos

Los outputs canónicos se llenan a partir de los templates vivos del Drive. Sigue la estructura actual de esos templates; no inventes un formato paralelo.

Los outputs principales por default son exactamente estos 4:

1. `Spec.md`
2. `Schema.md`
3. `Parser_config.md`
4. `Change_log.md`

Además, crea una carpeta `Ejemplos/` dentro del bundle del documento y guarda ahí copia de los documentos ejemplo que se usaron.

Reglas:

- No generes `PENDIENTES - <slug>.md` por default.
- No sustituyas estos 4 archivos por una sola nota narrativa.
- Si hay pendientes o huecos de información, déjalos explícitos dentro del archivo que corresponda y resúmelos en la respuesta final.

### Fase 5: Entregar

Guarda los 4 archivos y la carpeta de ejemplos directamente dentro del Drive localizado.

Con `BENFORD_ROOT`, usa por defecto esta ruta:

- `${BENFORD_ROOT}/05 Benford Vault/01 IMSS Mexico/02 - Documentos y Ejemplos/<Nombre canónico del documento>/Spec.md`
- `${BENFORD_ROOT}/05 Benford Vault/01 IMSS Mexico/02 - Documentos y Ejemplos/<Nombre canónico del documento>/Schema.md`
- `${BENFORD_ROOT}/05 Benford Vault/01 IMSS Mexico/02 - Documentos y Ejemplos/<Nombre canónico del documento>/Parser_config.md`
- `${BENFORD_ROOT}/05 Benford Vault/01 IMSS Mexico/02 - Documentos y Ejemplos/<Nombre canónico del documento>/Change_log.md`
- `${BENFORD_ROOT}/05 Benford Vault/01 IMSS Mexico/02 - Documentos y Ejemplos/<Nombre canónico del documento>/Ejemplos/`

Si la carpeta canónica del documento ya existe, actualiza esos archivos en sitio. No crees un output alterno por slug separado.
Si la carpeta tiene archivos legacy con nombres numerados, no los tomes como formato fuente; usa los templates vivos actuales como estándar y evita duplicar sin avisar.

Después de generar o actualizar los archivos, enlázalos en la respuesta y escribe un breve resumen (3-5 puntos) explicando:
- Las decisiones clave de diseño que tomaste
- Qué asumiste y qué dejaste como pendiente de hilar
- Si hay algo que el usuario debería revisar con atención

## Convenciones técnicas

### IDs internos de reglas y casos

- Reglas de validación: `VR-<SLUG-MAYUS>-NNN` (ej: `VR-CPSUA-001`, `VR-EMA-001`)
- Casos límite: `EC-<SLUG-MAYUS>-NNN` (ej: `EC-CPSUA-001`)
- Usa una abreviación del slug razonable y consistente. No importa que sea súper corta; lo importante es que sea única por documento.

### Nombres de hojas, campos y labels

Preserva exactamente como aparecen en los ejemplos reales. Incluye tildes, mayúsculas, espacios tal cual. Los parsers son sensibles a esto.

### Manejo de pendientes

Si quedan huecos, marca explícitamente:
- referencias a otros `DOC-*` cuyo slug canónico no conoces
- referencias a `PRUEBA-IMSS-*` o `PRUEBA-METH-*` cuyo ID exacto no conoces
- la `Fuente normativa` si no está citada
- catálogos de enumeraciones faltantes

Pero hazlo dentro del archivo relevante y en tu resumen final; no generes un archivo principal adicional por default.

## Ejemplos de decisiones tomadas en fichados previos

Ver `references/workflow-examples.md` para casos reales de cómo se resolvieron ambigüedades al fichar documentos previos (comprobante de pago SUA, EMA, EBA). Útil como referencia de qué tipo de criterio aplicar.

## Archivos de referencia

- `references/principles.md` — Los 4 principios detallados con ejemplos
- `references/workflow-examples.md` — Decisiones de diseño de fichados previos
- `references/template-*.md` — snapshots legacy; no reemplazan a los templates vivos del Drive
