---
id: DOC-comprobante-pago-sua/schema
type: doc-schema
parent_doc: DOC-comprobante-pago-sua
format: key-value
grain: "un row = un evento de pago SUA (un RP + un periodo + un comprobante bancario)"
tables:
  - comprobante_pago_sua
version: 1
breaking_change_of: null
---

# Comprobante bancario de pago SUA — Schema

## Grain

Cada row representa **un evento de pago SUA único**: un pago ejecutado por un registro patronal, para un periodo específico, documentado por un comprobante bancario. En casos de pagos complementarios para el mismo RP + periodo, cada comprobante genera un row independiente.

## Claves y trazabilidad

- **Primary key del documento:** `linea_captura`
  (la línea de captura es el identificador único del pago ante el IMSS y distingue pagos originales de complementarios para el mismo RP + periodo)
- **Claves alternas de cruce con otros documentos:**
  - `(registro_patronal, periodo_año, periodo_mes)` → usado cuando no hay folio SUA
  - `folio_sua` → cruce directo con [[DOC-disco-sua]] cuando está disponible
- **Foreign keys hacia otros DOC-*:**
  - `registro_patronal` → [[DOC-disco-sua]]`.registro_patronal`
  - `folio_sua` → [[DOC-disco-sua]]`.folio_sua` (nullable)

## Tabla: `comprobante_pago_sua`

**Grain:** un row = un evento de pago SUA documentado por un comprobante bancario

| columna | tipo | nullable | pk/fk | descripción | ejemplo |
|---------|------|----------|-------|-------------|---------|
| linea_captura | string | no | pk | identificador único del pago ante el IMSS | M2V2MTKC4C6A22L8B566000M4BI900YTEPB00FQMMT00JO7URN303 |
| registro_patronal | string | no | fk | registro patronal del pago, normalizado sin guiones | E5355462105 |
| periodo_año | integer | no | | año al que corresponde el pago | 2024 |
| periodo_mes | integer | no | | mes al que corresponde el pago (1-12) | 12 |
| folio_sua | string | sí | fk | folio de la liquidación SUA, cuando el comprobante lo exhibe | 259956 |
| importe_imss | decimal(14,2) | no | | componente IMSS del pago | 0.00 |
| importe_rcv | decimal(14,2) | no | | componente RCV (Retiro, Cesantía y Vejez) del pago | 649170.78 |
| importe_vivienda | decimal(14,2) | no | | componente de aportación patronal a vivienda del pago | 272709.73 |
| importe_acv | decimal(14,2) | no | | componente de amortización de crédito de vivienda del pago | 526129.67 |
| importe_total | decimal(14,2) | no | | importe total pagado | 1448010.18 |
| fecha_pago | date | no | | fecha en que se aplicó el pago | 2025-01-15 |
| banco | string | no | | institución bancaria emisora del comprobante, normalizada | citibanamex |

### Campos calculados

| columna | expresión | depende de | descripción |
|---------|-----------|------------|-------------|
| periodo_ym | `format(periodo_año, '04d') + '-' + format(periodo_mes, '02d')` | periodo_año, periodo_mes | representación canónica del periodo para joins y ordenamiento |
| suma_componentes | `importe_imss + importe_rcv + importe_vivienda + importe_acv` | importes individuales | usado por VR-CPSUA-004 para validar consistencia contra importe_total |

### Enumeraciones usadas en esta tabla

**`banco`:** catálogo abierto, se normaliza a lowercase sin espacios (ej: `santander`, `citibanamex`, `bbva`, `banorte`). No se restringe a un conjunto fijo porque pueden aparecer comprobantes de cualquier institución bancaria autorizada para recibir pagos SUA.

## Relaciones entre tablas internas

No aplica. El schema tiene una sola tabla porque el grain del documento es plano: un comprobante = un row.

## Trazabilidad inversa

- `comprobante_pago_sua.linea_captura`: extraído del campo "Línea de Captura" o "Línea de Captura SIPARE" del comprobante
- `comprobante_pago_sua.registro_patronal`: extraído del campo "Registro Patronal", normalizado eliminando guiones
- `comprobante_pago_sua.periodo_año` y `periodo_mes`: extraídos del campo "Período de Pago" (formato variable: `Mes MM Año AAAA`, `AAAAMM`, `MM-AAAA`), normalizados a enteros
- `comprobante_pago_sua.folio_sua`: extraído del campo "Folio SUA" cuando está presente
- `comprobante_pago_sua.importe_*`: extraídos de los campos "Importe IMSS", "Importe RCV", "Importe Vivienda", "Importe ACV", "Importe Total", limpiando separadores y símbolo de moneda
- `comprobante_pago_sua.fecha_pago`: extraída del campo "Fecha y Hora", "Fecha de aplicación de pago" o equivalente, truncada a fecha
- `comprobante_pago_sua.banco`: inferido del logotipo, encabezado o plataforma bancaria del comprobante

## JSON Schema (para consumo automático)

```yaml
$schema: "http://json-schema.org/draft-07/schema#"
type: object
properties:
  comprobante_pago_sua:
    type: array
    items:
      type: object
      properties:
        linea_captura: {type: string, minLength: 1}
        registro_patronal: {type: string, pattern: "^[A-Z0-9]+$"}
        periodo_año: {type: integer, minimum: 2000, maximum: 2100}
        periodo_mes: {type: integer, minimum: 1, maximum: 12}
        folio_sua: {type: ["string", "null"], pattern: "^[0-9]+$"}
        importe_imss: {type: number, minimum: 0}
        importe_rcv: {type: number, minimum: 0}
        importe_vivienda: {type: number, minimum: 0}
        importe_acv: {type: number, minimum: 0}
        importe_total: {type: number, minimum: 0}
        fecha_pago: {type: string, format: date}
        banco: {type: string, minLength: 1}
      required:
        - linea_captura
        - registro_patronal
        - periodo_año
        - periodo_mes
        - importe_imss
        - importe_rcv
        - importe_vivienda
        - importe_acv
        - importe_total
        - fecha_pago
        - banco
required: [comprobante_pago_sua]
```

## Notas de implementación

- Todos los importes se almacenan en decimal con 2 posiciones fraccionarias. No usar float para evitar errores de redondeo en las validaciones de tolerancia 0.01.
- El campo `registro_patronal` se normaliza eliminando guiones y pasando a mayúsculas, para permitir joins consistentes entre documentos que lo presentan con formato distinto.
- El campo `banco` se normaliza a lowercase sin espacios para servir como discriminador del parser.
- `linea_captura` es case-sensitive y se almacena tal cual aparece en el comprobante.

## Cambios de schema

Este archivo solo se modifica vía el pipeline de propuestas. Ver [[04 - Change log]] para el histórico.
