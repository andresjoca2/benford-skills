---
id: DOC-emision-eba/parser
type: parser-config
parent_doc: DOC-emision-eba
parser_kind: excel
encoding: null
delimiter: null
version: 1
---

# Emisión Bimestral Anticipada (EBA) — Parser config

## Método de extracción

El archivo es un Excel binario (.xls) descargado del portal IDSE. El parser de EBA extrae **únicamente las hojas y columnas que le corresponden**, ignorando la sección IMSS del resumen y la hoja de Movimientos EMA que típicamente están presentes en el mismo archivo.

### Estrategia general

1. **Localizar hoja de resumen** por patrón de nombre.
2. **Localizar hoja de movimientos EBA** por patrón de nombre. Si no existe, el archivo no contiene datos EBA (no corresponde a un bimestre) y el parser no produce output.
3. **Extraer `emision_eba_resumen`**:
   - Los campos de identificación (RP, periodo) se leen desde la sección IMSS del resumen (columnas A-B), ya que la sección RCV no los repite.
   - Los campos de negocio RCV/INFONAVIT se leen desde la sección RCV (columnas D-E).
4. **Extraer `movimientos_eba`** iterando filas desde la posición 5, tomando únicamente las primeras 18 columnas.
5. **Normalizar y validar** cada campo según el schema.

### Hojas esperadas

| Tabla del schema | Patrón del nombre de hoja | Obligatoria |
|------------------|---------------------------|-------------|
| `emision_eba_resumen` | `^Emisión\s+[A-Za-záéíóú]+\s+\d{4}$` | sí |
| `movimientos_eba` | `^Movimientos\s+EBA\s+[A-Za-záéíóú]+\s+\d{4}$` | sí |

Si la hoja de Movimientos EBA no existe, el archivo no corresponde a un mes bimestral y este documento no aplica.

### Hoja de resumen — mapa de anclas (labels)

La hoja de resumen tiene dos secciones horizontales. La sección IMSS (columnas A-B) **no** pertenece a este documento, salvo para los campos de identificación (RP y periodo) que solo están ahí.

**Desde la sección IMSS (columna A → columna B):**

| Label en col A | Campo del schema |
|----------------|------------------|
| `Periodo Mensual` | (parsea a `periodo_año`, `periodo_mes`) |
| `Registro Patronal` | `registro_patronal` |

**Desde la sección RCV (columna D → columna E):**

| Label en col D | Campo del schema |
|----------------|------------------|
| `Número de Propuesta RCV` | `numero_propuesta_rcv` |
| `Total Cotizantes RCV` | `total_cotizantes_rcv` |
| `Tipo de Documento` | `tipo_documento` |
| `Número de acreditados` | `numero_acreditados` |
| `Total Aportación Pat. Infonavit` | `total_aportacion_patronal_infonavit` |
| `Aportación Pat. S/C Infonavit` | `aportacion_patronal_sc_infonavit` |
| `Aportación Pat. C/C Infonavit` | `aportacion_patronal_cc_infonavit` |
| `Amortización` | `amortizacion` |
| `Aport. Pat. C/C Det. Infonavit mas Amort.` | `aportacion_patronal_cc_det_mas_amort` |
| `Suma Infonavit` | `suma_infonavit` |
| `Retiro` | `retiro` |
| `Cesantía y vejez Patronal` | `cesantia_vejez_patronal` |
| `Cesantía y vejez Obrero` | `cesantia_vejez_obrero` |
| `Suma RCV` | `suma_rcv` |
| `Total` (en columna D) | `total_rcv` |

**`razon_social`**: se extrae de la celda A3.

### Hoja de movimientos — mapa por posición

Fila 4 (0-indexed) contiene encabezados. Datos desde fila 5. Se leen únicamente las columnas 0-17 por posición; cualquier columna adicional se ignora.

| Posición | Campo del schema |
|----------|------------------|
| 0 | `nss` |
| 1 | `nombre` |
| 2 | `origen_movimiento` |
| 3 | `tipo_movimiento` |
| 4 | `fecha_movimiento` |
| 5 | `dias` |
| 6 | `salario_diario` |
| 7 | `retiro` |
| 8 | `cesantia_vejez_patronal` |
| 9 | `cesantia_vejez_obrero` |
| 10 | `subtotal_rcv` |
| 11 | `aportacion_patronal` |
| 12 | `tipo_descuento` |
| 13 | `valor_descuento` |
| 14 | `numero_credito` |
| 15 | `amortizacion` |
| 16 | `subtotal_infonavit` |
| 17 | `total` |

## Mapeo raw → schema

| campo raw | columna del schema | transformación |
|-----------|--------------------|----------------|
| valor junto a label `Periodo Mensual` (sección IMSS) | `periodo_año`, `periodo_mes` | parsear `M/YYYY` o `MM/YYYY` → (año, mes) |
| valor junto a label `Registro Patronal` (sección IMSS) | `registro_patronal` | trim + upper + eliminar guiones |
| valores de importe en sección RCV del resumen | componentes monetarios | parsear como decimal (2 posiciones) |
| col 4 de movimientos (Fecha del Movimiento) | `fecha_movimiento` | si es `-`, null; si es `D/MMM/AAAA`, parsear |
| col 0 de movimientos (NSS) | `nss` | trim; preservar como string |
| cols 12-14 de movimientos (campos de crédito) | `tipo_descuento`, `valor_descuento`, `numero_credito` | si es `-` o vacío, null; sino preservar como string |
| cualquier importe en movimientos | componente monetario del schema | parsear como decimal (2 posiciones) |

## Transformaciones

- **Registro patronal**: `upper(replace(valor, "-", ""))` para normalización consistente.
- **Periodo Mensual**: el valor viene como `M/YYYY` o `MM/YYYY`; parsear split por `/` y convertir a enteros.
- **Fecha del Movimiento**: formato `D/MMM/AAAA` con mes abreviado en mayúsculas en español. Si es `-`, null.
- **NSS**: preservar como string para no perder ceros iniciales.
- **Campos de crédito INFONAVIT** (`tipo_descuento`, `valor_descuento`, `numero_credito`): si el valor es `-` o cadena vacía, devolver null. `valor_descuento` se preserva como string con coma (no se convierte a decimal) porque su semántica depende de `tipo_descuento`.

## Casos borde del parser

- **Hoja con columnas adicionales agregadas por auditor**: leer únicamente las posiciones canónicas; ignorar columnas posteriores.
- **Hoja Movimientos EMA y sección IMSS del resumen presentes**: ignorar la hoja EMA completa; de la hoja de resumen leer solo los campos de identificación desde la sección IMSS y todos los campos de negocio desde la sección RCV.
- **Hoja Movimientos EBA ausente**: el archivo no corresponde a un bimestre; el parser no produce output para este documento (no es un error, es un no-aplica).
- **Celda vacía donde se esperaba número**: si una celda de importe en resumen RCV viene vacía, emitir error (esas celdas deben tener valor cuando la sección RCV existe).
- **Label no encontrado en sección RCV**: si un label obligatorio no aparece, emitir error explícito identificando el label faltante.
- **Fila de movimientos con NSS vacío**: saltar la fila y continuar.
- **Amortización cero en trabajador sin crédito**: valor válido, se preserva como `0.00`.

## Dependencias / herramientas sugeridas

- Python: `xlrd` para lectura de archivos .xls legacy
- Python: `decimal.Decimal` para importes
- Python: `re` para matching de patrones de nombre de hoja
- Versión mínima requerida: Python 3.10

## Validación post-parseo

- `emision_eba_resumen` tiene exactamente 1 row.
- Todos los campos no nullable del schema están presentes.
- `movimientos_eba` tiene al menos 1 row.
- `periodo_año` y `periodo_mes` en rangos válidos.

## Versionado del parser

Si el portal IDSE modifica el formato del archivo, se crea un PROP con el ajuste y se bumpea version.

No editar este archivo a mano.
