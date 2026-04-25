---
id: DOC-comprobante-pago-sua/parser
type: parser-config
parent_doc: DOC-comprobante-pago-sua
parser_kind: pdf-text
encoding: null
delimiter: null
version: 1
---

# Comprobante bancario de pago SUA — Parser config

## Método de extracción

El documento es un PDF nativo con texto extraíble (no escaneado). La extracción se realiza por **anclas de texto** (labels de los campos) y no por coordenadas fijas, porque el layout varía entre bancos y la extracción por coordenadas sería frágil.

### Estrategia general

1. **Detectar banco emisor** a partir del contenido textual del PDF (ej: presencia de "Santander", "BancaNet Empresarial", "BBVA", etc.).
2. **Seleccionar ruta de extracción por banco** usando un mapa de anclas específico.
3. **Extraer campos** buscando el texto que sigue a cada ancla.
4. **Normalizar y transformar** cada campo al tipo definido en el schema.

### Mapa de anclas por campo (genérico)

Cada campo del schema se extrae buscando una o varias anclas posibles. Si el campo no se encuentra con ninguna ancla, se marca como nulo y la validación decide si abortar o aislar.

| Campo del schema | Anclas posibles en el PDF |
|------------------|---------------------------|
| `linea_captura` | `Línea de Captura`, `Línea de Captura SIPARE`, `LINEA DE CAPTURA SIPARE` |
| `registro_patronal` | `Registro Patronal` |
| `periodo` (raw) | `Período de Pago`, `Periodo de pago` |
| `folio_sua` | `Folio SUA` |
| `importe_imss` | `Importe IMSS` |
| `importe_rcv` | `Importe RCV` |
| `importe_vivienda` | `Importe Vivienda` |
| `importe_acv` | `Importe ACV` |
| `importe_total` | `Importe Total`, `Importe Total MXN` |
| `fecha_pago` | `Fecha y Hora`, `Fecha de aplicación de pago` |
| `banco` | inferido del contenido completo del PDF |

### Detección de banco

El banco se infiere buscando tokens distintivos en el texto del PDF:

| Token presente | Valor `banco` normalizado |
|----------------|---------------------------|
| `Santander` | `santander` |
| `BancaNet Empresarial` o `citibanamex` o `Citibanamex` | `citibanamex` |
| `BBVA` | `bbva` |
| `Banorte` | `banorte` |
| `HSBC` | `hsbc` |
| `Scotiabank` | `scotiabank` |
| (otro) | lowercase del nombre detectado |

Si no se detecta banco, el parser falla con error explícito y no intenta adivinar.

## Mapeo raw → schema

| campo raw (texto extraído) | columna del schema | transformación |
|----------------------------|--------------------|----------------|
| valor de ancla `Línea de Captura` | `comprobante_pago_sua.linea_captura` | trim; preservar case |
| valor de ancla `Registro Patronal` | `comprobante_pago_sua.registro_patronal` | trim + upper + eliminar guiones |
| valor de ancla `Período de Pago` | `comprobante_pago_sua.periodo_año`, `periodo_mes` | parseo de periodo (ver transformaciones) |
| valor de ancla `Folio SUA` | `comprobante_pago_sua.folio_sua` | trim; si vacío → null |
| valor de ancla `Importe IMSS` | `comprobante_pago_sua.importe_imss` | limpiar moneda y separadores → decimal |
| valor de ancla `Importe RCV` | `comprobante_pago_sua.importe_rcv` | limpiar moneda y separadores → decimal |
| valor de ancla `Importe Vivienda` | `comprobante_pago_sua.importe_vivienda` | limpiar moneda y separadores → decimal |
| valor de ancla `Importe ACV` | `comprobante_pago_sua.importe_acv` | limpiar moneda y separadores → decimal |
| valor de ancla `Importe Total` | `comprobante_pago_sua.importe_total` | limpiar moneda y separadores → decimal |
| valor de ancla `Fecha y Hora` / `Fecha de aplicación de pago` | `comprobante_pago_sua.fecha_pago` | parseo de fecha (ver transformaciones) |
| contenido general del PDF | `comprobante_pago_sua.banco` | detección de token + normalización |

## Transformaciones

- **Registro patronal**: `upper(replace(valor, "-", ""))` porque el RP se imprime con o sin guiones según el banco, y todos los demás documentos deben joinear sobre el mismo formato.
- **Periodo**: acepta múltiples formatos y normaliza a `(año, mes)` enteros:
  - `Mes MM Año AAAA` → `(AAAA, MM)`
  - `AAAAMM` → `(AAAA, MM)`
  - `MM-AAAA` o `MM/AAAA` → `(AAAA, MM)`
  - si no se puede parsear, fallar con error
- **Importes**: `decimal(replace(replace(replace(valor, "$", ""), ",", ""), "MXN", "").trim())` porque los bancos imprimen montos con formatos variables (con o sin símbolo, con o sin separador de miles).
- **Fecha de pago**: acepta múltiples formatos y normaliza a `YYYY-MM-DD`:
  - `YYYY-MM-DD HH:MM:SS` → truncar a fecha
  - `DD/MM/YYYY` → reordenar
  - `DD/MM/YYYY (ddmmaaaa)` → tomar la parte `DD/MM/YYYY`
  - si el campo contiene hora, descartar la hora
- **Banco**: `lower(replace(token_detectado, " ", ""))`.

## Casos borde del parser

- **Múltiples ocurrencias de una ancla**: si una ancla aparece más de una vez en el PDF (ej: "Importe Total" en un desglose y en un resumen), tomar la primera ocurrencia en orden de lectura.
- **Importe sin separador de miles**: algunos formatos imprimen `1448010.18` en vez de `$1,448,010.18`; la transformación de limpieza contempla ambos casos sin bifurcación.
- **Campo opcional ausente** (ej: `folio_sua`): si la ancla no aparece, el campo queda nulo y el parser continúa.
- **Campo obligatorio ausente**: si una ancla obligatoria no aparece (ej: `Registro Patronal`), el parser falla con error explícito identificando el campo faltante.
- **PDF escaneado (no nativo)**: el parser detecta ausencia de capa de texto y falla con mensaje indicando que se requiere OCR previo; no intenta OCR en línea.
- **Contenido de marca de agua o exportador** (ej: "Exported with datasnipper"): ignorar; no interfiere con las anclas.

## Dependencias / herramientas sugeridas

- Python: `pdfplumber` o `pypdf` para extracción de texto PDF
- Python: `decimal.Decimal` para importes (evitar float)
- Python: `re` para matching de anclas y limpieza de valores
- Versión mínima requerida: Python 3.10

## Validación post-parseo

- Todos los campos marcados como `nullable: no` en el schema están presentes y con tipo correcto.
- `suma_componentes` coincide con `importe_total` dentro de tolerancia 0.01 (VR-CPSUA-004).
- `periodo_año` y `periodo_mes` están en rangos válidos.
- `fecha_pago` es una fecha válida y no futura respecto a la fecha de parseo.
- `banco` fue detectado (no es nulo ni cadena vacía).

## Versionado del parser

El parser tiene su propia versión (campo `version` en frontmatter). Cuando algún banco modifica el layout de sus comprobantes de pago SUA o entra un banco nuevo sin cobertura en el mapa de detección, se genera un PROP con el ajuste correspondiente.

No editar este archivo a mano. Cualquier cambio pasa por PROP.
