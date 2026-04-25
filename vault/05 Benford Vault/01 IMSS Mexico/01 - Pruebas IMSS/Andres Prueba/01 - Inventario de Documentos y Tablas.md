# 01 - Inventario de Documentos y Tablas

## Propósito
Este documento registra, a nivel metodología, los documentos fuente, las tablas internas y los outputs estructurados que van apareciendo en los procedimientos de `Andres Prueba`.

La idea es que no todo ese conocimiento quede enterrado dentro de SOPs aislados.

---

## Cómo usar este documento
Cada vez que se documente un SOP nuevo, revisar si hay que agregar o actualizar alguna fila de este inventario.

Este inventario debe ayudar a responder:
- qué documento entra,
- de dónde viene,
- a qué tabla raw se traduce,
- qué transformación se le aplica,
- qué output produce,
- y si ese output puede reutilizarse en otros procedimientos.

---

## Tabla base de inventario

| Documento / activo | Tipo | Origen de datos | Procedimiento que lo usa o genera | Tabla raw interna | Tabla transformada / intermedia | Output estructurado | Reutilizable | Procedimientos relacionados | Notas |
|---|---|---|---|---|---|---|---|---|---|
| Disco de pago SUA (`.sua`) | documento del cliente | cliente / SUA | Prueba de vaciado de liquidaciones | datos vaciados por macro en `PARTE A`, `PARTE B`, `PARTE C`, `PARTE D` | fila consolidada por folio en `amarre` | base de amarre por folio | Sí | ACUMSUA, vaciado de liquidaciones | fuente base del folio, RP, periodo, trabajadores, días e importes |
| `5.1 - Vaciado de liquidaciones - amarre.xlsx` | documento generado por el auditor | auditor | Prueba de vaciado de liquidaciones | n/a | `amarre` | tabla de amarre por folio | Sí | Cuotas pagadas al Instituto | workbook central de la prueba |
| Comprobante bancario de pago SUA | documento del cliente | banco / cliente | Prueba de vaciado de liquidaciones | n/a | validación contra fila de `amarre` | evidencia de pago por fila | No | vaciado de liquidaciones | se localiza por RP + periodo + Total a Pagar |
| Cédula de determinación mensual | documento del cliente | SUA / cliente | Prueba de vaciado de liquidaciones | n/a | validación bloque IMSS | soporte del bloque IMSS | No | vaciado de liquidaciones | se usa principalmente la tabla resumen de la última página |
| Cédula de determinación bimestral | documento del cliente | SUA / cliente | Prueba de vaciado de liquidaciones | n/a | validación bloque RCV / INFONAVIT | soporte del bloque RCV / INFONAVIT | No | vaciado de liquidaciones | aplica para meses pares |
| Emisión IDSE (EMA / EBA) | documento del cliente | IDSE | Prueba de vaciado de liquidaciones | n/a | captura de EMA | soporte del análisis RT / EMA / AUD | Posible | vaciado de liquidaciones | refleja la prima emitida por el sistema |
| Declaración anual de prima de riesgo de trabajo | documento del cliente | cliente / IMSS | Prueba de vaciado de liquidaciones | n/a | construcción de AUD | soporte del análisis de prima | Posible | vaciado de liquidaciones | aporta prima anterior y prima declarada |
| Alta del seguro de riesgos de trabajo | documento del cliente | IMSS / cliente | Prueba de vaciado de liquidaciones | n/a | construcción de AUD en primer año | soporte de clase, fracción y prima media | Posible | vaciado de liquidaciones | se usa cuando no existe declaración utilizable |
| Tarjeta de Identificación Patronal | documento del cliente | IMSS / cliente | Prueba de vaciado de liquidaciones | n/a | confirmación de RP | soporte de identificación patronal | Posible | vaciado de liquidaciones | se usa en escenario de primer año / alta |

---

## Reglas de clasificación
### Tipo
Usar, cuando aplique:
- documento del cliente,
- documento generado por el auditor,
- documento derivado de otro procedimiento,
- tabla raw interna,
- tabla transformada,
- output estructurado.

### Reutilizable
Usar:
- `Sí`
- `No`
- `Posible`
- `Pendiente`
