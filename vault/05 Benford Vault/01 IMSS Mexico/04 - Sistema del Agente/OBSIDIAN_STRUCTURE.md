# OBSIDIAN_STRUCTURE.md

## Propósito
Definir la estructura compartida y las reglas operativas del Obsidian oficial de `Auditoría del IMSS`.

## Carpeta oficial
`/Users/infra/Library/CloudStorage/GoogleDrive-josea.341.jamz@gmail.com/Mi unidad/Audit AI/Audit Ai - Obsidian/Auditoría del IMSS`

## Principios base
- Todo dentro de este Obsidian debe ir en español.
- La prueba es la unidad principal de conocimiento.
- Las diferencias entre auditores o fuentes viven dentro de cada prueba.
- Los documentos se organizan como biblioteca documental por tipo de documento.
- Las sesiones son registro cronológico, no conocimiento final.
- Lo importante debe destilarse a pruebas, documentos o sistema del agente.
- La auditoría IMSS debe modelarse según su flujo real: plantilla fuente, SIDEIMSS y expediente final descargable.
- La trazabilidad entre raw data, transformaciones, pruebas y entregables finales es parte central del sistema.
- La navegación y el linking interno no son opcionales: forman parte del sistema.

## Estructura raíz actual
- `00 - Inicio/`
- `01 - Pruebas IMSS/`
- `02 - Documentos y Ejemplos/`
- `03 - Sesiones/`
- `04 - Sistema del Agente/`
- `05 - Entregables Finales/`
- `90 - Archivado/`

---

## 00 - Inicio
Capa de navegación, orientación y contexto general del sistema.

### Archivos esperados
- `Home.md`
- `Índice General.md`
- `Cómo usar este Obsidian.md`
- `Estado Actual.md`
- `Mapa General del Proyecto.md`
- `Resumen del Proyecto.md`

### Regla
`Inicio` y `Overview` son lo mismo dentro de esta arquitectura.
No debe existir una carpeta separada de `Overview`.

---

## 01 - Pruebas IMSS
Corazón del sistema.
Cada prueba tiene su propia carpeta.

### Estructura mínima por prueba
- `00 - Resumen de la Prueba.md`
- `01 - SOP Oficial.md`
- `02 - Fuentes y Variantes.md`
- `03 - Preguntas Abiertas.md`

### Estructura opcional por prueba
- `SOPs por Auditor/`
- `Notas de Trabajo/`
- `Ejemplos/`
- `04 - Trazabilidad y Entregables.md`

### Regla de contenido
`Fuentes y Variantes.md` debe incluir, como mínimo:
- fuentes consultadas
- documentos utilizados en la prueba
- documentos por variante cuando aplique
- coincidencias
- diferencias
- lectura actual
- links internos a documentos del Obsidian

### Regla de trazabilidad
Para cada prueba, cuando sea posible, debe documentarse:
- raw data de entrada
- limpieza requerida
- transformaciones necesarias
- outputs intermedios
- si alimenta otra prueba
- si alimenta la plantilla fuente
- si impacta componentes posteriores del expediente descargable

### Regla del SOP oficial
El `SOP Oficial.md` puede quedarse vacío mientras la prueba no esté lo suficientemente consolidada.
No se debe forzar una consolidación prematura.

---

## 02 - Documentos y Ejemplos
Biblioteca documental compartida del proyecto.

### Estructura
- `Índice de Documentos.md`
- `Tabla de documentos en pruebas.md`
- una carpeta por tipo de documento

### Regla especial
Los entregables finales importantes pueden seguir teniendo una nota puente aquí, pero su documentación principal debe vivir en `05 - Entregables Finales`.

### Estructura por documento
Ejemplo:
- `Nómina/`
  - `spec.md`
  - `schema.md`
  - `parser_config.md`
  - `change_log.md`
  - `Documentos ejemplo/`

### Regla
Cada tipo de documento debe vivir en su propia carpeta.
Dentro debe existir:
- `spec.md`
- `schema.md`
- `parser_config.md`
- `change_log.md`
- una carpeta `Documentos ejemplo/`

### Regla de mantenimiento
Si cambia la relación entre documentos y pruebas, se debe actualizar:
- `02 - Documentos y Ejemplos/Tabla de documentos en pruebas.md`

### Regla de la tabla
- filas = documentos
- columnas = pruebas
- usar `🟢` cuando un documento se use o esté ligado a una prueba

---

## 03 - Sesiones
Bitácora cronológica del trabajo.

### Estructura
- `Crudo/`
- `Procesado/`
- `Índice de Sesiones.md`

### Regla
Las sesiones no son el conocimiento final.
Lo útil debe destilarse después a:
- `01 - Pruebas IMSS`
- `02 - Documentos y Ejemplos`
- `04 - Sistema del Agente`
- `05 - Entregables Finales`

### Contenido esperado de una sesión procesada
- fecha
- objetivo
- temas tratados
- pruebas afectadas
- documentos afectados
- hallazgos útiles
- preguntas abiertas
- destino sugerido de destilación

---

## 04 - Sistema del Agente
Documentos que definen cómo debe operar el agente dentro de este proyecto.

### Archivos esperados
- `OBSIDIAN_STRUCTURE.md`
- `SOP_TEMPLATE.md`
- `KNOWLEDGE_MODEL.md`
- `MISSION.md`
- `OPERATING_RULES.md`
- `INTERVIEW_PLAYBOOK.md`
- `MODELO_DE_ENTREGABLES.md`
- `Taxonomía de pruebas IMSS.md`
- `Clasificación de documentos.md`
- `TEMPLATE - Trazabilidad y Entregables por prueba.md`

### Regla
Este bloque contiene reglas del sistema y del agente, no conocimiento operativo de auditoría en sí.

---

## 05 - Entregables Finales
Capa dedicada a los entregables finales del sistema.

### Estructura esperada
- `00 - Overview de Entregables Finales.md`
- `01 - Plantilla fuente de Información Patronal.md`
- `02 - Expediente final descargable del portal.md`
- `03 - Atestiguamientos.md`
- `04 - Aviso y acuses del dictamen.md`
- `05 - Opinión final.md`
- `Mapa global de pruebas a entregables.md`
- `Información patronal - Plantilla fuente/`
- `Expediente final descargable/`

### Regla
Los entregables finales no deben tratarse solo como documentos sueltos. Deben documentarse como sistemas de salida con estructura propia, secciones internas y trazabilidad desde pruebas y documentos fuente.

### Regla operativa importante
La principal responsabilidad del agente dentro de esta capa es ayudar a dejar correctamente preparada la **Plantilla fuente de Información Patronal**. El resto del expediente descargable también debe entenderse y mapearse, pero sin confundirlo con la plantilla fuente.

---

## 90 - Archivado
Lugar para estructuras anteriores, residuos del sistema viejo, notas descartadas o versiones viejas que no deben vivir en la arquitectura activa.

### Regla
Cuando algo ya no encaja con la arquitectura vigente, pero conviene conservarlo, debe moverse aquí en vez de contaminar las carpetas activas.

---

## Regla de linking interno
Para evitar nodos huérfanos, mantener el graph navegable y conservar trazabilidad visible en Obsidian, cada bloque importante del sistema debe incluir enlaces internos mínimos obligatorios.

### Principio general
Si una nota importante queda aislada, el sistema está incompleto.
El linking interno es parte de la documentación, no un adorno.

### Regla por prueba
Cada `00 - Resumen de la Prueba.md` debe funcionar como hub y enlazar, al menos, a:
- `[[01 - SOP Oficial]]`
- `[[02 - Fuentes y Variantes]]`
- `[[03 - Preguntas Abiertas]]`
- `[[04 - Trazabilidad y Entregables]]` cuando exista
- `[[SOPs por Auditor/...]]` cuando existan SOPs por auditor

Y los archivos principales de la prueba deben enlazar de regreso al resumen.

### Regla por documento
Cada paquete documental debe enlazar, cuando aplique, a:
- `Tabla de documentos en pruebas`
- pruebas relacionadas
- entregables finales relacionados
- su nota puente o nota principal cuando haya migración de ubicación

### Regla por entregable final
Cada entregable final importante debe incluir navegación clara hacia:
- overview
- estructura general
- mapa desde pruebas
- variables o criterios globales
- todas sus secciones internas, sheets o componentes
- entregables hermanos cuando aplique

### Regla por índices y mapas
Todo índice, mapa u overview debe actuar como hub real.
No debe contener solo texto descriptivo; debe tener links hacia las notas importantes que organiza.

### Regla de homogeneidad
No dejar navegación fuerte solo en algunas notas “prioritarias”.
Si existe una colección importante de elementos del mismo tipo, el hub debe enlazarlos de forma completa y ordenada.

### Regla de mantenimiento continuo
Cada vez que se cree o mueva una nota importante, revisar si también hay que actualizar:
- overview correspondiente
- índice correspondiente
- mapa correspondiente
- links de ida y vuelta

Si no se hace esto, el graph y la navegación del sistema se degradan.

---

## Reglas operativas generales
1. No modificar Obsidian sin aprobación previa de Menen/Antonio cuando el cambio implique estructura o contenido importante.
2. Todo en este Obsidian debe estar en español.
3. La prueba es la unidad principal del sistema.
4. Las diferencias entre auditores o fuentes se documentan dentro de cada prueba.
5. Los documentos deben ligarse internamente desde las pruebas.
6. Si cambia una relación documento-prueba, actualizar la tabla de documentos en pruebas.
7. Las sesiones deben destilarse a conocimiento estructurado.
8. Lo viejo o fuera de estructura se mueve a `90 - Archivado`.
9. Toda prueba debe entenderse también por su relación con la plantilla fuente y, cuando aplique, con los outputs posteriores del expediente final descargable.
10. Toda nota importante debe quedar integrada a la red de navegación y linking interno del Obsidian.

## Skill operativa principal para extracción de pruebas
- [[SKILL - imss-pruebas-extraccion-conocimiento]]
