<!-- Histórico append-only del documento. Sin frontmatter. -->
<!-- Cada cambio al canónico de este DOC-* se registra aquí, más reciente arriba. -->
<!-- Solo se escribe vía el pipeline de propuestas (PROP → DEC → aplica + changelog). -->
<!-- Si alguien edita esto a mano, es un bug de proceso. -->

# Change log — DOC-disco-sua

## v2 — 2026-04-24

- **Decision:** N/A (regularización documental v2 sin DEC histórico cargado)
- **Resolves:** N/A
- **Source:** insumos confirmados de esta corrida (`.sua` de Rubén, SOP de vaciado, workbook de amarre, SOP ACUMSUA, `.sua` de Nelly y traducciones Excel)
- **Cambio:** se rehízo el bundle para alinear el documento al raw observado `W300`, separar las cinco tablas canónicas del documento y explicitar el match contra traducciones tipo `Datos *`, `PARTE A-D`, `amarre` y `ACUMSUA`
- **Archivos afectados:**
  - [[01 - Spec]] § Overview, Contrato funcional, Reglas y Casos límite — se aclaró el alcance neutral del documento y su uso en dos familias de salidas derivadas
  - [[02 - Schema]] — se reemplazó el modelo colapsado por cinco tablas canónicas (`empresa`, `trabajador`, `movimiento`, `sumario`, `validacion`)
  - [[03 - Parser config]] — se documentaron offsets observados para `02`, `04`, `05` y `06`, la parte validada del `03` y la expansión de slots del `04`
  - [[04 - Change log]] — creación inicial del histórico faltante
- **Breaking change:** sí — el schema deja de colapsar `02/05/06` en una sola tabla y ahora explicita la estructura natural del documento
- **Notas:** la cola económica `03[208:278]` queda preservada y semánticamente alineada con la traducción a Excel; su micro-layout bimestral sigue necesitando validación directa sobre un raw bimestral confirmado

---

## v1 — 2026-04-23

- **Source:** bundle inicial previo existente en la carpeta canónica
- **Cambio:** primera creación del paquete para `DOC-disco-sua`
- **Archivos afectados:**
  - [[01 - Spec]] — seed inicial
  - [[02 - Schema]] — seed inicial con modelo colapsado
  - [[03 - Parser config]] — seed inicial sin offsets completos
- **Breaking change:** N/A (primera versión)
- **Notas:** la v1 no incluía `[[04 - Change log]]` y dejaba huecos de diseño en schema y parser
