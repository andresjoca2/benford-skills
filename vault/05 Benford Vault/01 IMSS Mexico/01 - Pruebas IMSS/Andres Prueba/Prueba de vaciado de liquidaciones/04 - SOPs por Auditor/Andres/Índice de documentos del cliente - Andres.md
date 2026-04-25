# Índice de documentos del cliente - Andres

## Prueba
Prueba de vaciado de liquidaciones

## Documentos fuente del cliente / sistema usados en esta prueba

### Obligatorios siempre
- Disco de pago SUA (`.sua`)
- Cédula de determinación mensual (PDF)
- Cédula de determinación bimestral (PDF)
- Comprobantes bancarios de pago SUA
- Emisión IDSE (EMA / EBA)

### Obligatorios según el caso
- Declaración anual de prima de riesgo de trabajo
- Alta del seguro de riesgos de trabajo
- Tarjeta de Identificación Patronal

## Documento de trabajo del auditor
- `5.1 - Vaciado de liquidaciones - amarre.xlsx`

## Uso resumido por documento
| Documento | Rol en la prueba | Variables / uso principal |
|---|---|---|
| Disco de pago SUA (`.sua`) | fuente base | folio, RP, periodo, trabajadores, días, componentes IMSS/RCV/INFONAVIT, Total a Pagar |
| Cédula de determinación mensual | validación IMSS | importes IMSS, RT usada, RP, periodo |
| Cédula de determinación bimestral | validación RCV / INFONAVIT | RCV, aportaciones, amortizaciones, INFONAVIT, RP, periodo bimestral |
| Comprobante bancario de pago SUA | evidencia de pago | Importe Comprobante, fecha de pago, asociación RP + periodo + importe |
| Emisión IDSE (EMA / EBA) | validación de prima emitida | EMA |
| Declaración anual de prima de riesgo de trabajo | construcción de AUD | prima anterior, prima declarada, clase, fracción |
| Alta del seguro de riesgos de trabajo | construcción de AUD en primer año | división, grupo, fracción, clase, prima media |
| Tarjeta de Identificación Patronal | confirmación de RP | registro patronal |

## Notas
- El comprobante bancario no se localiza por folio SUA.
- La llave operativa de búsqueda del comprobante es: **RP + periodo + Total a Pagar**.
- `PARTE C` del workbook sigue pendiente de clasificación funcional.
