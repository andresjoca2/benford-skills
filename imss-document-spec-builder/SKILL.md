---
name: imss-document-spec-builder
description: >-
  Documenta formalmente tipos de documentos usados en auditorías IMSS (como
  comprobantes de pago SUA, cédulas de determinación, emisiones IDSE, discos
  SUA, etc.) generando un paquete canónico de 4 archivos Markdown (Spec,
  Schema, Parser config, Pendientes) que alimenta una bóveda de conocimiento
  consumida por sistemas de AI. Usa esta skill siempre que el usuario quiera
  documentar, especificar, modelar o fichar un tipo de documento para la
  bóveda de auditoría IMSS, incluso si no menciona las palabras exactas spec
  o template. Triggers típicos incluyen frases como documentar el tipo de
  documento, armar los specs para X, vamos con la cédula bimestral, replica
  el proceso para Y documento, necesito documentar este doc para la bóveda.
---

# IMSS Document Spec Builder

## Propósito

Esta skill convierte un tipo de documento usado en auditorías IMSS en un paquete canónico de 4 archivos Markdown que alimenta una bóveda de conocimiento. Los archivos generados son consumidos por sistemas de AI que necesitan entender qué es cada documento, qué datos contiene, cómo parsearlo y con qué otros documentos se relaciona.

## Inputs requeridos

Antes de generar nada, el usuario debe proveer:

1. **Al menos un SOP** (Procedimiento Operativo Estándar) que describa cómo se usa el documento en una prueba de auditoría. Los SOPs son la fuente autoritativa del contenido factual.
2. **Al menos un ejemplo real del documento** (PDF, XLS, archivo binario, etc.). Sin ejemplo, no se puede generar el paquete — exige al usuario que lo provea antes de continuar. Los ejemplos son necesarios para definir correctamente el schema, el parser, y detectar variantes.
3. **Identificación del documento a trabajar** — qué documento específico quiere fichar de entre los que aparecen en los SOPs.

Si falta cualquiera de estos tres, detente y pídelos antes de avanzar.

## Flujo de trabajo

### Fase 1: Entender el documento

1. Lee todos los SOPs que te compartieron para entender el contexto completo.
2. Lee los ejemplos reales del documento (si es binario como .xls, usa las librerías apropiadas para inspeccionarlo).
3. Identifica en los SOPs las menciones específicas al documento a fichar: qué datos se extraen, con qué otros documentos se cruza, en qué pruebas se usa, qué reglas aplica.

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

### Fase 4: Generar los 4 archivos

Los templates canónicos están en `references/`. **Nunca modifiques la estructura de los templates** — siempre son los mismos. Lo que cambia es el contenido que llenas dentro.

1. `references/template-01-spec.md` → `01 - Spec.md`
2. `references/template-02-schema.md` → `02 - Schema.md`
3. `references/template-03-parser.md` → `03 - Parser config.md`
4. `references/template-pendientes.md` → `PENDIENTES - <slug>.md`

**Nota importante sobre el Change log**: el template existe en la bóveda (04 - Change log.md) pero esta skill NO lo genera. Es append-only y se mantiene por separado cuando hay cambios reales al documento canónico.

### Fase 5: Entregar

Guarda los 4 archivos en una carpeta con el slug del documento (ej: `/mnt/user-data/outputs/<slug>/01 - Spec.md`, etc.) y usa `present_files` para ponerlos en el chat.

Después de presentar los archivos, escribe un breve resumen (3-5 puntos) explicando:
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

### Pendientes comunes

Siempre que generes un archivo, marca como pendiente:
- Referencias a otros `DOC-*` cuyo slug canónico no conoces (ponlo con tu mejor guess y márcalo)
- Referencias a `PRUEBA-IMSS-*` o `PRUEBA-METH-*` cuyo ID exacto no conoces
- La `Fuente normativa` si no está citada en los SOPs (es común que no lo esté)
- Catálogos de enumeraciones (ej: códigos de tipo de movimiento del IMSS)

Todos los pendientes también van al archivo `PENDIENTES - <slug>.md` por separado.

## Ejemplos de decisiones tomadas en fichados previos

Ver `references/workflow-examples.md` para casos reales de cómo se resolvieron ambigüedades al fichar documentos previos (comprobante de pago SUA, EMA, EBA). Útil como referencia de qué tipo de criterio aplicar.

## Archivos de referencia

- `references/principles.md` — Los 4 principios detallados con ejemplos
- `references/template-01-spec.md` — Template canónico del Spec
- `references/template-02-schema.md` — Template canónico del Schema
- `references/template-03-parser.md` — Template canónico del Parser
- `references/template-pendientes.md` — Template canónico de Pendientes
- `references/workflow-examples.md` — Decisiones de diseño de fichados previos
