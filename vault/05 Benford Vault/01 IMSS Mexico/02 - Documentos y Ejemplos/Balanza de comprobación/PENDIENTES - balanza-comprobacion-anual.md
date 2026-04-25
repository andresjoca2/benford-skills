# Pendientes de hilar — DOC-balanza-comprobacion-anual

Estos son los placeholders y referencias que quedaron sin resolver en los archivos de este documento. Requieren contexto de la bóveda completa para hilarse correctamente.

## En 01 - Spec.md

- **`blocks_pruebas` en frontmatter** → referencia a `PRUEBA-METH-5-1-vaciado-liquidaciones`. Verificar que el slug coincida con el canónico de la bóveda para la prueba de vaciado de liquidaciones (metodología macro / contable-operativa).
- **`related_docs` en frontmatter** → vacío. Una vez existan en la bóveda, agregar como referencias:
  - `DOC-auxiliar-gastos` — documento complementario de investigación (mencionado en SOP v1).
  - `DOC-cedula-determinacion-mensual` — fuente operativa IMSS para comparación.
  - `DOC-cedula-determinacion-bimestral` — fuente operativa RCV/INFONAVIT.
  - `DOC-comprobante-pago-sua` — soporta pagos reflejados en balanza.
  Verificar que los slugs coincidan con los canónicos.
- **Sección 1 "Relación con otros documentos"** → los links `[[DOC-auxiliar-gastos]]`, `[[DOC-cedula-determinacion-mensual]]`, `[[DOC-cedula-determinacion-bimestral]]`, `[[DOC-comprobante-pago-sua]]` necesitan validarse contra los slugs reales de la bóveda.
- **Sección 2 "Fuente normativa"** → se citaron genéricamente Código de Comercio (Art. 33-38) y Código Fiscal de la Federación (Art. 28). **Los SOPs no citan fuentes normativas explícitas** para la balanza. Confirmar con auditor si estas son las referencias normativas correctas y con qué nivel de detalle se desean citar (artículos exactos, versiones vigentes).
- **Sección 4 "Pruebas IMSS finales impactadas"** → referencia a `PRUEBA-IMSS-5-1`. Verificar ID exacto en la bóveda (puede ser `PRUEBA-IMSS-05-01` u otra convención).
- **Sección 4 "Pruebas METH"** → la referencia a `PRUEBA-METH-5-1-vaciado-liquidaciones` es tentativa; confirmar slug canónico. Evaluar si hay una sola prueba METH para 5.1 o si las dos metodologías documentadas en los SOPs son pruebas METH separadas (en ese caso habría que vincular a la metodología contable-operativa específicamente).

## En 02 - Schema.md

- **Foreign keys hacia otros `DOC-*`** → el schema NO declara FKs por decisión de diseño (el mapeo cuenta→control-de-amarre vive fuera). Confirmar que esa decisión es consistente con cómo otros documentos de la bóveda modelan entidades similares (catálogos, tablas de mapeo externas). Si la bóveda ya tiene un patrón establecido para entidades de mapeo por auditoría, referenciarlo aquí.
- **`balanza_id` como PK generada** → decidir la estrategia exacta de generación (hash de `rfc + ejercicio + version_etiqueta + hoja`, UUID, secuencial). La implementación técnica queda para el equipo de desarrollo.
- **Patrón de RFC en el JSON Schema** → se usó `^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$` genérico. Confirmar si la bóveda tiene un patrón canónico de RFC reutilizable o si este debe quedarse local.

## En 03 - Parser config.md

- **Lista de variantes de ERP** → actualmente soporta `sap` y `generico_con_naturaleza`. Según se reciban balanzas de más clientes con sistemas distintos (Contpaq, Aspel, propietarios), agregar variantes y documentar sus señales de detección y mapeos.
- **Convención de `sistema_origen`** → los nombres `sap` y `generico_con_naturaleza` son provisorios. Si la bóveda tiene un catálogo canónico de sistemas contables, alinear los valores.
- **Detección de `version_etiqueta`** → los patrones (`definitivo`, `con ajustes`, `final`, `original`, `preliminar`) salen de los nombres de archivos observados. Confirmar con auditor si hay etiquetas estándar adicionales o si conviene hacerlo configurable.
- **Hoja canónica cuando hay ambigüedad** → la heurística actual prefiere hojas con nombre descriptivo (`Catalogo`, `Mpolizas_contables`) sobre `Sheet1`/`Sheet2`. Si aparece un ERP que usa nombres genéricos para la hoja original, revisar la regla.
- **Variante `desconocido`** → el comportamiento propuesto es best-effort + marcar. Confirmar con el equipo si esto es aceptable o si se prefiere abortar y requerir documentación de la nueva variante antes de parsear.
