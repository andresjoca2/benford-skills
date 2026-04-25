---
id: DOC-emision-ema/parser
type: parser-config
parent_doc: DOC-emision-ema
parser_kind: excel
encoding: null
delimiter: null
version: 1
---

# Emisión Mensual Anticipada (EMA) — Parser config

## Método de extracción

El archivo es un Excel binario (.xls) descargado del portal IDSE. El parser de EMA extrae **únicamente las hojas y columnas que le corresponden**, ignorando cualquier contenido adicional (ej: secciones RCV o hojas EBA presentes en meses bimestrales).

### Estrategia general

1. **Localizar hoja de resumen** por patrón de nombre.
2. **Localizar hoja de movimientos EMA** por patrón de nombre.
3. **Extraer `emision_ema_resumen`** buscando labels conocidos en la hoja de resumen y tomando el valor adyacente (columna A → columna B).
4. **Extraer `movimientos_ema`** iterando filas desde la posición 5 de la hoja de movimientos, tomando únicamente las primeras 19 columnas.
5. **Normalizar y validar** cada campo según el schema.

### Hojas esperadas

| Tabla del schema | Patrón del nombre de hoja | Obligatoria |
|------------------|---------------------------|-------------|
| `emision_ema_resumen` | `^Emisión\s+[A-Za-záéíóú]+\s+\d{4}$` | sí |
| `movimientos_ema` | `^Movimientos\s+EMA\s+[A-Za-záéíóú]+\s+\d{4}$` | sí |

Cualquier otra hoja presente en el archivo (p.ej. `Movimientos EBA [mes] [año]`) no pertenece a este documento y debe ser ignorada por este parser.

### Hoja de resumen — mapa de anclas (labels)

Labels en columna A, valores en columna B. La sección de RCV (columnas D-E) no pertenece a este documento y debe ser ignorada.

| Label en col A | Campo del schema |
|----------------|------------------|
| `Periodo Mensual` | (parsea a `periodo_año`, `periodo_mes`) |
| `Registro Patronal` | `registro_patronal` |
| `Número de Propuesta IMSS` | `numero_propuesta_imss` |
| `Días` | `dias` |
| `Total Cotizantes IMSS` | `total_cotizantes_imss` |
| `Prima de Riesgos de Trabajo` | `prima_riesgo_trabajo` |
| `Tipo de Documento` | `tipo_documento` |
| `Cuota Fija` | `cuota_fija` |
| `Excedente Patronal` | `excedente_patronal` |
| `Excedente Obrero` | `excedente_obrero` |
| `Prestaciones en Dinero Patronal` | `prestaciones_dinero_patronal` |
| `Prestaciones en Dinero Obrero` | `prestaciones_dinero_obrero` |
| `Gastos Médicos y Pensionados Patronal` | `gastos_medicos_pensionados_patronal` |
| `Gastos Médicos y Pensionados Obrero` | `gastos_medicos_pensionados_obrero` |
| `Riesgos de Trabajo` | `riesgos_trabajo` |
| `Invalidez y Vida Patronal` | `invalidez_vida_patronal` |
| `Invalidez y Vida Obrero` | `invalidez_vida_obrero` |
| `Guarderías y Prestaciones Sociales` | `guarderias_prestaciones_sociales` |
| `Total` (en columna A) | `total_imss` |

**`razon_social`**: se extrae de la celda A3.

### Hoja de movimientos — mapa por posición

Fila 4 (0-indexed) contiene encabezados. Datos desde fila 5. Se leen únicamente las columnas 0-18 por posición; cualquier columna adicional (agregada por el auditor en papel de trabajo) se ignora.

| Posición | Campo del schema |
|----------|------------------|
| 0 | `nss` |
| 1 | `nombre` |
| 2 | `origen_movimiento` |
| 3 | `tipo_movimiento` |
| 4 | `fecha_movimiento` |
| 5 | `dias` |
| 6 | `salario_diario` |
| 7 | `cuota_fija` |
| 8 | `excedente_patronal` |
| 9 | `excedente_obrero` |
| 10 | `prestaciones_dinero_patronal` |
| 11 | `prestaciones_dinero_obrero` |
| 12 | `gastos_medicos_pensionados_patronal` |
| 13 | `gastos_medicos_pensionados_obrero` |
| 14 | `riesgos_trabajo` |
| 15 | `invalidez_vida_patronal` |
| 16 | `invalidez_vida_obrero` |
| 17 | `guarderias_prestaciones_sociales` |
| 18 | `total` |

## Mapeo raw → schema

| campo raw | columna del schema | transformación |
|-----------|--------------------|----------------|
| valor junto a label `Periodo Mensual` | `periodo_año`, `periodo_mes` | parsear `M/YYYY` o `MM/YYYY` → (año, mes) |
| valor junto a label `Registro Patronal` | `registro_patronal` | trim + upper + eliminar guiones |
| valor junto a label `Prima de Riesgos de Trabajo` | `prima_riesgo_trabajo` | parsear como decimal (5 posiciones) |
| valores de importe en resumen | componentes monetarios | parsear como decimal (2 posiciones) |
| col 4 de movimientos (Fecha del Movimiento) | `fecha_movimiento` | si es `-`, null; si es `D/MMM/AAAA`, parsear |
| col 0 de movimientos (NSS) | `nss` | trim; preservar como string |
| cualquier importe en movimientos | componente monetario del schema | parsear como decimal (2 posiciones) |

## Transformaciones

- **Registro patronal**: `upper(replace(valor, "-", ""))` para normalización consistente entre documentos.
- **Periodo Mensual**: el valor viene como `M/YYYY` o `MM/YYYY` (ej: `10/2025`, `8/2024`); parsear split por `/` y convertir a enteros.
- **Fecha del Movimiento**: formato `D/MMM/AAAA` con mes abreviado en mayúsculas en español (ej: `4/OCT/2025`, `25/OCT/2025`). Si el valor es `-`, devolver null. Mapeo de meses abreviados español → número.
- **NSS**: se preserva como string aunque sea solo dígitos, para no perder ceros iniciales (ej: `02169003486`).
- **Prima de riesgo**: viene como string con notación decimal (ej: `"0.57474"`); parsear a decimal preservando precisión de 5 posiciones.

## Casos borde del parser

- **Hoja con columnas adicionales agregadas por auditor**: leer únicamente las posiciones canónicas; ignorar columnas posteriores.
- **Hoja de resumen con columnas RCV presentes (mes bimestral)**: ignorar las columnas D-E por completo; pertenecen al documento DOC-emision-eba.
- **Hoja Movimientos EBA presente en el archivo**: ignorar totalmente; no pertenece a este documento.
- **Celda vacía donde se esperaba número**: si una celda de importe viene vacía, tratar como 0.00 (el resumen IMSS siempre tiene valor, aunque sea cero).
- **Label no encontrado**: si un label obligatorio del resumen no aparece, emitir error explícito identificando el label faltante.
- **Fila de movimientos con NSS vacío**: saltar la fila y continuar; el parser no debe abortar por una fila inválida en medio.

## Dependencias / herramientas sugeridas

- Python: `xlrd` para lectura de archivos .xls legacy
- Python: `decimal.Decimal` para importes
- Python: `re` para matching de patrones de nombre de hoja
- Versión mínima requerida: Python 3.10

## Validación post-parseo

- `emision_ema_resumen` tiene exactamente 1 row.
- Todos los campos no nullable del schema están presentes.
- `movimientos_ema` tiene al menos 1 row.
- `periodo_año` y `periodo_mes` en rangos válidos.

## Versionado del parser

Si el portal IDSE modifica el formato del archivo, se crea un PROP con el ajuste y se bumpea version.

No editar este archivo a mano.
