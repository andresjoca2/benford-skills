# KNOWLEDGE_MODEL.md

## Propósito
Definir los objetos principales de conocimiento dentro de `Auditoría del IMSS` y cómo se relacionan entre sí.

## Objetos principales

### 1. Prueba
La unidad principal de organización.
Una prueba representa una verificación o revisión específica dentro de la auditoría IMSS.

Cada prueba puede contener:
- resumen
- fuentes y variantes
- SOP oficial
- preguntas abiertas
- SOPs por auditor
- trazabilidad hacia entregables finales

### 2. Fuente
Cualquier origen de información sobre una prueba.
Ejemplos:
- entrevista con auditor
- transcript
- documento metodológico
- workbook
- archivo ejemplo
- nota interna de V1

Una fuente es un input, no una verdad automática.

### 3. Variante
Una manera distinta en que una fuente dice que se ejecuta una prueba.
Las variantes viven dentro de la prueba correspondiente.

### 4. SOP Oficial
La versión operativa estandarizada de una prueba.
Debe ser clara, explícita y entendible para un lector junior.
Puede permanecer vacía mientras la prueba no esté suficientemente madura.

### 5. SOP por auditor
Una versión específica de una fuente o auditor.
Sirve cuando ya existe un patrón operativo coherente, aunque todavía no haya SOP oficial consolidado.

### 6. Tipo de documento
Una categoría reutilizable de documento usada en una o más pruebas.
Cada tipo de documento debe vivir en la biblioteca documental como:
- una carpeta
- `spec.md`
- `schema.md`
- `parser_config.md`
- `change_log.md`
- una carpeta `Documentos ejemplo`

### 7. Relación documento-prueba
Una relación documentada entre un documento y las pruebas en que se utiliza.
Debe reflejarse en:
- `Tabla de documentos en pruebas.md`

### 8. Sesión
Un registro cronológico de trabajo, descubrimiento o discusión.
La sesión no es el conocimiento final; es una capa intermedia que luego alimenta pruebas, documentos, entregables o reglas del sistema.

### 9. Plantilla fuente de Información Patronal
El principal entregable fuente que el agente debe ayudar a preparar.
Es el input canónico estructurado antes de generar `.txt` por macros y antes de la carga manual en SIDEIMSS.

### 10. Expediente final descargable
El paquete de archivos descargados o producidos después del procesamiento en SIDEIMSS.
Puede incluir:
- información patronal descargada
- atestiguamientos
- aviso de dictamen patronal
- acuses
- opinión
- PDFs técnicos o parciales

### 11. Relación de trazabilidad
Una relación documentada que muestra cómo una prueba se conecta con:
- raw data
- transformaciones
- outputs intermedios
- otras pruebas
- la plantilla fuente
- outputs posteriores del expediente descargable

### 12. Pregunta abierta
Cualquier incertidumbre no resuelta.
Debe quedar explícita.

### 13. Regla del sistema del agente
Una regla que define cómo debe operar el agente dentro de este proyecto.
Estas viven en `Sistema del Agente`.

## Relaciones
- Una **prueba** tiene muchas **fuentes**.
- Una **prueba** puede tener múltiples **variantes**.
- Una **prueba** puede producir un **SOP oficial**.
- Una **prueba** también puede tener varios **SOPs por auditor**.
- Una **prueba** usa uno o más **tipos de documento**.
- Las **relaciones documento-prueba** deben reflejarse en la tabla.
- Las **sesiones** alimentan pruebas, documentos, entregables y reglas del sistema.
- Las **pruebas** deben mapearse a la plantilla fuente y a los outputs posteriores del expediente cuando sea posible.
- Las **preguntas abiertas** evitan falsa certeza.

## Reglas de modelado
- No organizar el sistema alrededor de metodologías completas por persona.
- Organizar alrededor de pruebas.
- Capturar diferencias específicas por fuente dentro de la prueba correspondiente.
- Tratar la biblioteca documental como infraestructura compartida entre pruebas.
- Tratar las sesiones como inputs cronológicos, no como artefactos finales.
- Tratar la trazabilidad a entregables como conocimiento de primera clase.
- Distinguir claramente entre plantilla fuente y expediente descargable.

## Regla práctica
Cuando aparezca información nueva, preguntar:
1. ¿Esto pertenece a una prueba específica?
2. ¿Es documento, fuente, variante, sesión, pregunta, relación de trazabilidad o regla?
3. ¿Conecta con la plantilla fuente, con outputs del expediente, con otra prueba o con un output intermedio?
4. ¿Dónde vive dentro de la arquitectura activa?
5. ¿Hay que actualizar la tabla de documentos en pruebas?
