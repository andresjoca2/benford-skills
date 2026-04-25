# Pendientes de hilar — DOC-cedula_determinacion_bimestral

Estos son los placeholders y referencias que quedaron sin resolver en los archivos de este documento. Requieren contexto de la bóveda completa para hilarse correctamente.

## En 01 - Spec.md

- **Fuente normativa:** "Pendiente: Verificar artículos específicos de la LSS y reglamentos del IMSS que obligan la emisión de esta cédula."
  - Ubicación: Sección 2.6 "Fuente normativa"
  - Acción: Investigar Ley del Seguro Social (LSS) artículos sobre obligación de generación y entrega de cédulas bimestrales por el IMSS. Incluir referencias precisas.

- **DOC-cedula_determinacion_mensual:** Asumido pero no validado que existe en la bóveda.
  - Ubicación: Sección 1 "Relación con otros documentos"
  - Acción: Confirmar slug canónico y validar que exista en la bóveda.

- **DOC-comprobante_pago_sua:** Asumido pero no validado que existe en la bóveda.
  - Ubicación: Sección 1 "Relación con otros documentos"
  - Acción: Confirmar slug canónico.

- **DOC-emision_idse:** Asumido pero no validado que existe en la bóveda.
  - Ubicación: Sección 1 "Relación con otros documentos"
  - Acción: Confirmar slug canónico (puede ser DOC-emision_idse_ema o similar).

- **PRUEBA-IMSS-051:** Referencia a prueba "Vaciado de Liquidaciones" sin confirmación de ID exacto.
  - Ubicación: Sección 2.5 "Bloqueos si falta" y Sección 3.1 "Roles en pruebas"
  - Acción: Validar el ID exacto de la prueba en la bóveda de pruebas IMSS. Puede ser 5.1, 5.1.1, etc.

- **PRUEBA-METH-vaciado-liquidaciones:** Referencia metodológica sin validar.
  - Ubicación: Sección 4.2 "Pruebas de METODOLOGÍA"
  - Acción: Confirmar ID canónico de la prueba metodológica en la bóveda.

## En 02 - Schema.md

- **Foreign key a DOC-cedula_determinacion_mensual:** Asumida pero sin validar.
  - Ubicación: Sección "Claves y trazabilidad"
  - Acción: Confirmar que existe en schema del otro documento la columna que recibe esta FK.

- **Foreign key a DOC-comprobante_pago_sua:** Asumida pero sin validar.
  - Ubicación: Sección "Claves y trazabilidad"
  - Acción: Ídem anterior.

- **Catálogos de enumeraciones:** `area_geografica` tiene valores "A", "B", "C" sin especificar el significado completo.
  - Ubicación: Sección "Enumeraciones usadas"
  - Acción: Obtener catálogo completo de áreas geográficas homologadas del IMSS.

- **Rangos de patrón:** Algunos formatos de RP pueden variar (ej: si existe formato sin folio de subordinada).
  - Ubicación: Field `registro_patronal`, regex pattern
  - Acción: Validar si existe variante de RP de 3 o 5 dígitos (RP simplificado) vs completo.

## En 03 - Parser config.md

- Sin pendientes de hilar. Parser está completamente definido sobre la última página del PDF de ejemplo.

## Pendientes reales de revisión (no hilar)

- **Múltiples variantes de período:** El SOP de Rubén menciona que los períodos bimestrales pueden variar según liquidación. Confirmar si el parser maneja correctamente todas las variantes observadas en production.

- **Campos opcionales en encabezado:** `rfc`, `delegacion_imss`, `subdelegacion_imss`, `actividad_economica` se marcaron como nullable. Validar si el IMSS siempre los reporta o si hay cédulas simplificadas que los omiten.

- **Precisión de amortización:** El campo `amortizacion_creditos_vivienda` aparece en la última página pero no en todas las páginas intermedias (detalle por cotizante). Confirmar si el resumen final es la única fuente autorizada o si se debe validar contra sumas de detalle cuando exista.

- **Componentes RCV desglosados:** El schema captura retiro + cesantía-vejez, pero no captura prima de riesgo de trabajo (RT) por separado. Verificar si RT debe incluirse como campo del schema o si forma parte de otro documento (cédula mensual).
