---
id: DOC-balanza-comprobacion-anual/parser
type: parser-config
parent_doc: DOC-balanza-comprobacion-anual
parser_kind: excel
encoding: null
delimiter: null
version: 1
---

# Balanza de comprobación anual — Parser config

## Método de extracción

El parser lee un archivo Excel (.xlsx o .xls) y extrae una tabla tabular de cuentas contables. El layout físico varía según el ERP del cliente; el parser detecta la variante por inspección de encabezados y aplica el mapeo raw→canónico correspondiente.

### Estrategia general

1. Abrir el archivo con la librería apropiada según extensión (`openpyxl` para .xlsx, `xlrd` para .xls legacy).
2. Identificar la hoja canónica (la que contiene la tabla del ERP original, no las hojas de papel de trabajo del auditor).
3. Localizar la fila de encabezados dentro de la hoja (puede no ser la fila 1; los ERPs a veces incluyen metadatos de razón social, RFC, rango de fechas antes de la tabla).
4. Detectar la variante de layout (ver sección "Detección de variantes").
5. Aplicar el mapeo raw→canónico de esa variante.
6. Enriquecer cada fila con campos calculados (`nivel`, `cuenta_padre`, `longitud_numero`).
7. Construir el `balanza_header` a partir de metadatos detectables + nombre de archivo.
8. Validar integridad mínima (ver sección "Validación post-parseo").

### Detalles específicos del formato

#### Hojas relevantes y cómo identificarlas

- Preferir la hoja que contenga una tabla con encabezados que incluyan **al menos**: una columna de número de cuenta + una columna de saldo final + una columna de cargos.
- **Ignorar hojas secundarias típicas del auditor**: hojas con nombres genéricos (`Sheet1`, `Sheet2`), hojas con columnas recalculadas (`Len`, `Nivel`, `SI`, `D`, `H`, `SF`), hojas con catálogos auxiliares de clasificación.
- Si el archivo tiene **una sola hoja**, esa es la canónica por defecto.
- Si tiene varias, preferir la que tenga **más filas** y encabezados oficiales del ERP (sin columnas recalculadas).

#### Fila de encabezados

No siempre es la fila 1. Estrategia:

- Escanear las primeras 15 filas buscando una fila que contenga al menos 4 de los siguientes tokens (case-insensitive, acentos-insensitive): `numero`, `cuenta`, `descripcion`, `nombre`, `saldo`, `cargos`, `abonos`, `ctacompleta`.
- La primera fila que cumple es la fila de encabezados.
- Las filas anteriores (si existen) se tratan como metadatos del header (razón social, RFC, rango de fechas).

#### Rango de datos

- Desde la fila siguiente a encabezados hasta la última fila con `numero_cuenta` no vacío.
- Parar al encontrar una fila completamente vacía después de la primera fila vacía intermedia (algunos exports tienen separadores).

## Detección de variantes

El parser soporta múltiples variantes de ERP. Cada una tiene una configuración propia de mapeo raw→canónico.

### Variante: `sap`

**Señales de detección:**
- Encabezados en fila 1
- Columnas (en orden): `Numero de cuenta`, `Descripcion`, `Saldo Inicial`, `Cargos Periodo`, `Abonos Periodo`, `Saldo Actual`
- Seis columnas canónicas, sin columna de naturaleza
- Abonos vienen **con signo negativo** en el raw
- Saldos de cuentas acreedoras (pasivos, capital) vienen con signo negativo

**Mapeo raw → canónico:**

| campo raw | columna del schema | transformación |
|-----------|--------------------|----------------|
| `Numero de cuenta` | `balanza_cuentas.numero_cuenta` | cast a string; trim |
| `Descripcion` | `balanza_cuentas.descripcion` | trim (las descripciones suelen tener padding de espacios) |
| `Saldo Inicial` | `balanza_cuentas.saldo_inicial` | cast a decimal; preservar signo |
| `Cargos Periodo` | `balanza_cuentas.cargos` | cast a decimal; preservar signo |
| `Abonos Periodo` | `balanza_cuentas.abonos` | cast a decimal; preservar signo |
| `Saldo Actual` | `balanza_cuentas.saldo_final` | cast a decimal; preservar signo |
| — | `balanza_cuentas.naturaleza` | null (no lo provee) |
| — | `balanza_cuentas.cod_establecimiento` | null (no lo provee) |

### Variante: `generico_con_naturaleza`

**Señales de detección:**
- Encabezados **no** en fila 1 (típicamente fila 7-10); filas previas contienen razón social, RFC, rango de fechas
- Presencia de columna `Naturaleza` con valores `D` o `A`
- Presencia típica de columnas `ctacompleta`, `ID CUENTA`, `cod_estab`
- Columna `#` secuencial al inicio
- Abonos y saldos en **valores absolutos** (sin signo negativo); el signo se deriva de `Naturaleza`

**Mapeo raw → canónico:**

| campo raw | columna del schema | transformación |
|-----------|--------------------|----------------|
| `ctacompleta` | `balanza_cuentas.numero_cuenta` | cast a string; trim; remover puntos si los hay |
| `nombre` | `balanza_cuentas.descripcion` | trim |
| `Naturaleza` | `balanza_cuentas.naturaleza` | upper; validar que sea `D` o `A` |
| `Saldo_inicial` | `balanza_cuentas.saldo_inicial` | cast a decimal; preservar signo tal cual viene |
| `cargos` | `balanza_cuentas.cargos` | cast a decimal; preservar signo |
| `Abonos` | `balanza_cuentas.abonos` | cast a decimal; preservar signo |
| `Saldo` | `balanza_cuentas.saldo_final` | cast a decimal; preservar signo |
| `cod_estab` | `balanza_cuentas.cod_establecimiento` | trim; null si vacío |

**Metadatos del header** (filas antes de encabezados):
- Razón social: primera fila con contenido textual que no incluye "Balanza", "Filtro", "Fecha", "Cuenta"
- RFC: fila que contenga el patrón `R.F.C:` seguido del RFC
- Fecha inicial / final: fila que contenga `Fecha inicial` y `Fecha final`

### Variante: `desconocido`

Si ninguna variante conocida hace match:

- Intentar extracción heurística: buscar columnas que contengan en el nombre las keywords (`cuenta`, `descripción`/`nombre`, `saldo inicial`, `cargos`, `abonos`, `saldo`/`saldo actual`).
- Si se encuentran al menos 5 de 6, proceder con mapeo best-effort y marcar `sistema_origen = desconocido`.
- Si no, abortar con error `VR-BC-005`.

## Metadatos del header

Extracción del `balanza_header`:

- `ejercicio`: primer año de 4 dígitos encontrado en (a) nombre del archivo, (b) metadatos de rango de fechas en encabezado, (c) parámetro explícito del auditor si se provee.
- `fecha_inicial` / `fecha_final`: parseadas de los metadatos del filtro si existen; si no, inferidas como 1-ene / 31-dic del `ejercicio`.
- `alcance_temporal`:
  - `anual` si `fecha_inicial = 01-01-XXXX` y `fecha_final = 31-12-XXXX`
  - `mensual` si ambas fechas están dentro del mismo mes
  - `rango` en otro caso
- `mes_cubierto`: llenado solo si `alcance_temporal = mensual`.
- `version_etiqueta`: extraída del nombre del archivo buscando patrones como `definitivo`, `con ajustes`, `final`, `original`, `preliminar`. Si no hay match, null.
- `sistema_origen`: variante detectada (`sap`, `generico_con_naturaleza`, `desconocido`).
- `archivo_fuente`: nombre del archivo.
- `hoja_fuente`: nombre de la hoja canónica.
- `fecha_parseo`: timestamp del parseo.
- `razon_social`, `rfc_empresa`: extraídos de metadatos del header cuando aplique; null si el archivo no los trae.

## Campos calculados por fila

Después del mapeo raw→canónico, para cada fila de `balanza_cuentas`:

- `longitud_numero` = `len(numero_cuenta)`.
- `nivel` = rank ordinal del `longitud_numero` dentro del conjunto de longitudes distintas presentes en la balanza. Ejemplo: si las longitudes presentes son {1, 2, 4, 7, 9, 11}, entonces longitud 1 → nivel 1, longitud 2 → nivel 2, ..., longitud 11 → nivel 6.
- `cuenta_padre` = número de cuenta con la longitud inmediatamente menor que `longitud_numero` y que sea prefijo de `numero_cuenta`; null para cuentas de nivel 1.

## Transformaciones

- `descripcion`: siempre `trim()` porque los ERPs devuelven strings con padding de espacios a la derecha.
- `numero_cuenta`: siempre preservar como string; eliminar separadores de miles si los hay (algunos sistemas usan puntos como separador visual: `1001.001` → `1001001`).
- Saldos: preservar signo tal cual viene del raw.
- `naturaleza`: upper-case (`d` → `D`).

## Casos borde del parser

1. **Archivo con múltiples hojas de trabajo del auditor.** Identificar la hoja canónica por heurística de encabezados originales (sin columnas como `Len`, `Nivel`, `SI`, `D`, `H`, `SF`). Si hay ambigüedad, preferir la hoja con nombre descriptivo (ej: `Catalogo`, `Mpolizas_contables`) sobre `Sheet1`/`Sheet2`.
2. **Columnas extra agregadas por el auditor en la hoja canónica.** Columnas como `ID`, `MID`, `ID SUELDOS`, `Len` agregadas al final de la tabla del ERP. Ignorarlas; leer solo las columnas del mapeo canónico de la variante detectada.
3. **Valores `#N/A` de fórmulas de Excel.** Tratar como null/vacío al parsear columnas no canónicas. No deben aparecer en columnas canónicas; si aparecen, tratar como error de la fila.
4. **Número de cuenta con separadores visuales.** Algunos ERPs exportan `1001.001` en vez de `1001001`. Limpiar quitando puntos antes de guardar como string canónico, siempre que la parte antes y después del punto sean numéricas.
5. **Filas con `numero_cuenta` vacío pero descripción presente.** Típicamente son filas de sub-total o separadores visuales. Ignorar.
6. **Múltiples hojas que parecen canónicas (ej: una por mes).** Si son varias con la misma estructura y el archivo es claramente un consolidado, procesar cada una como una instancia distinta de `balanza_header` (mensual) o pedir intervención del auditor.
7. **Descripciones duplicadas entre cuentas padre e hija.** Es normal: la cuenta `10` (nivel 2) puede tener la misma descripción que `1000` (nivel 4) si son padres consecutivos. No colapsar por descripción duplicada.

## Dependencias / herramientas sugeridas

- Python: `openpyxl` (para .xlsx), `xlrd==1.2.0` (para .xls legacy), `pandas` (opcional, para manejo tabular).
- Versión mínima Python: 3.9

## Validación post-parseo

Antes de entregar el resultado, el parser debe verificar:

1. `balanza_header.ejercicio` no es null.
2. `balanza_cuentas` contiene al menos una fila.
3. Para cada fila de `balanza_cuentas`:
   - `numero_cuenta` no es null ni vacío.
   - `saldo_inicial`, `cargos`, `abonos`, `saldo_final` son números (no null).
   - Aplicar VR-BC-001 (integridad contable por cuenta). Marcar filas que no pasen.
4. Unicidad de `numero_cuenta` dentro de la balanza (VR-BC-003).
5. Si se detecta una variante conocida pero el mapeo produce menos del 95% de filas válidas, reportar warning de posible layout no documentado.

## Versionado del parser

El parser bumpea versión cuando:
- Se agrega soporte para una nueva variante de ERP (patch).
- Se cambia el mapeo raw→canónico de una variante existente (minor).
- Se cambia la estrategia de detección de hoja canónica o variante (minor).
- Se rompe compatibilidad con una variante antigua (major, requiere DEC).

No editar este archivo a mano. Cualquier cambio pasa por PROP.
