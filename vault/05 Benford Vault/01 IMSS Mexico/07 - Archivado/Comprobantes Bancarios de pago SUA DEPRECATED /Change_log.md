# Change log

- Versión
  - v1
- Fecha
  - 2026-04-23
- Qué cambió
  - Alta inicial del tipo documental `Comprobantes Bancarios de pago SUA`.
- Por qué cambió
  - Se necesitaba estandarizar este documento para reconocerlo, parsearlo y llevarlo a Excel o tabla estructurada.
- Fuente del cambio
  - Ejemplos reales de comprobantes bancarios compartidos por Menen.
  - Contexto operativo recuperado de SOPs de RSM Mazatlán 5.1, RSM Mérida, Traust ACUMSUA, Traust DGE y Traust Confronta.
- Impacto en schema
  - Se definió grain de 1 fila por comprobante.
  - Se fijaron campos mínimos y opcionales por variante.
- Impacto en parser
  - Se definieron patrones de reconocimiento por logotipo bancario y vocabulario típico.
- Aprobado por
  - 
