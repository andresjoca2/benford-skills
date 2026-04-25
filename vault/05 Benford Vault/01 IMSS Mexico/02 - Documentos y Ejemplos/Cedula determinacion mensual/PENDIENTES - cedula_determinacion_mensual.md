# Pendientes de hilar — DOC-cedula-determinacion-mensual

Estos son los placeholders y referencias que quedaron sin resolver en los archivos de este documento. Requieren contexto de la bóveda completa para hilarse correctamente.

---

## En 01 - Spec.md

### Pendiente: Citación normativa exacta
- **Ubicación:** Sección "Fuente normativa" (línea 116 aprox)
- **Qué falta:** Referencias específicas a artículos de la Ley del Seguro Social (LSS) y el Reglamento de Inscripción, Afiliación y Recaudación (RIAR) que justifiquen la obligatoriedad y estructura de la Cédula de Determinación Mensual.
- **Por qué:** Los SOPs no incluyen citas normativas explícitas. Se infiere de contexto que existe normativa IMSS, pero los artículos exactos no están documentados.
- **Cómo resolver:** Consultar sitio web oficial IMSS o documentos normativos internos; actualizar referencias cuando se obtengan.

### Pendiente: Referencia a DOC-disco-pago-sua
- **Ubicación:** Sección "Relación con otros documentos" (línea 69-73) y "related_docs" en frontmatter
- **Qué falta:** Confirmar slug canónico exacto de "Disco de Pago SUA". Se asume `DOC-disco-pago-sua` pero puede variar.
- **Cómo resolver:** Verificar en la bóveda cuál es el slug definido para este documento; ajustar referencias.

### Pendiente: Referencia a DOC-comprobante-pago-sua
- **Ubicación:** Sección "Relación con otros documentos"
- **Qué falta:** Confirmar slug canónico. Se asume `DOC-comprobante-pago-sua`.
- **Cómo resolver:** Verificar en la bóveda; ajustar si slug es distinto.

### Pendiente: Referencia a DOC-cedula-determinacion-bimestral
- **Ubicación:** Sección "Relación con otros documentos"
- **Qué falta:** Confirmar slug canónico y si existe como DOC separado. Se asume sí.
- **Cómo resolver:** Revisar si está ya documentada en la bóveda; si no, priorizar su fichado.

### Pendiente: Referencia a DOC-emision-ema
- **Ubicación:** Sección "Relación con otros documentos"
- **Qué falta:** Confirmar slug y relación. Se menciona porque la prima de RT puede validarse contra emisión IDSE.
- **Cómo resolver:** Verificar en la bóveda.

### Pendiente: IDs de pruebas IMSS exactos
- **Ubicación:** Sección "Bloqueos si falta" (línea 113), frontmatter `blocks_pruebas`
- **Qué falta:** Se asume `PRUEBA-IMSS-5.1` existe. Necesita confirmación de formato y ID exacto.
- **Cómo resolver:** Verificar ID canónico en registro de pruebas IMSS; ajustar si es necesario.

---

## En 02 - Schema.md

### Pendiente: Catálogo de entidades federativas y delegaciones IMSS
- **Ubicación:** Sección "Enumeraciones usadas en esta tabla" (línea 73-80)
- **Qué falta:** Catálogo completo de estados mexicanos y de delegaciones/subdelegaciones del IMSS. Solo se incluyó un ejemplo ("YUCATAN").
- **Por qué:** El PDF ejemplo solo muestra Yucatán. Para validación completa, necesitamos listado oficial.
- **Cómo resolver:** Obtener catálogo IMSS oficial de delegaciones y estados; documentar como enumeración o como tabla de referencia anexa.

### Pendiente: Validación de patrón RP
- **Ubicación:** Sección "JSON Schema", línea 121
- **Qué falta:** Regex exacto para validar formato de RP. El propuesto (`^[A-Z][0-9]{2}[A-Z0-9]{6}[0-9]{2}-[0-9]{2}$`) es una aproximación.
- **Por qué:** Los RPs pueden tener variantes; el patrón puede ser más flexible o más específico según normativa IMSS.
- **Cómo resolver:** Obtener especificación oficial del formato de RP del IMSS; ajustar regex.

---

## En 03 - Parser config.md

### Sin pendientes de hilar.

El parser está completamente especificado para la última página del PDF. Las únicas consideraciones futuras serían:
- Soporte para OCR si el IMSS emite PDFs escaneados (hoy es texto nativo).
- Cambios en formato de tabla si el IMSS reestructura la Cédula.

Estos se documentarían como cambios de versión cuando ocurran.

---

## Pendientes generales de la bóveda

### Falta: Especificación de DOC-cedula-determinacion-bimestral
- **Impacto:** Esta especificación de CDM (mensual) la referencia, pero la bimestral aún no está documentada.
- **Prioridad:** Alta — se mencionan juntas en SOPs y ambas alimentan Prueba 5.1.
- **Cómo resolver:** Crear DOC-cedula-determinacion-bimestral en paralelo.

### Falta: Catálogo oficial IMSS de delegaciones
- **Impacto:** Para validación robusta del campo `delegacion_imss`.
- **Prioridad:** Media — no bloquea funcionamiento actual, solo validación.
- **Cómo resolver:** Obtener del IMSS o documentar como referencia externa.

### Falta: Especificación de prueba PRUEBA-IMSS-5.1
- **Impacto:** Esta especificación referencias PRUEBA-IMSS-5.1 como la prueba que bloquea si CDM está ausente.
- **Prioridad:** Media — contextual.
- **Cómo resolver:** Verificar que PRUEBA-IMSS-5.1 esté documentada en su forma canónica.

---

## Resumen ejecutivo

**Total pendientes:** 9
- **Críticos:** 0 (los archivos están completos y funcionales sin estos pendientes)
- **Altos:** 2 (referencias a otros DOCs, CDM bimestral)
- **Medios:** 4 (catálogos, validaciones, normativa)
- **Bajos:** 3 (confirmaciones de slug, referencias internas)

El paquete está listo para uso operativo. Los pendientes se resuelven en futuras iteraciones o a medida que se documentan otros artefactos relacionados.
