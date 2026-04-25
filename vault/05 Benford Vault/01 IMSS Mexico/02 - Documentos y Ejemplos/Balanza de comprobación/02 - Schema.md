---
id: DOC-balanza-comprobacion-anual/schema
type: doc-schema
parent_doc: DOC-balanza-comprobacion-anual
format: tabular
grain: "una cuenta contable dentro de la balanza de un ejercicio específico de una empresa"
tables:
  - balanza_header
  - balanza_cuentas
version: 1
breaking_change_of: null
---

# Balanza de comprobación anual — Schema

## Grain

- `balanza_header`: un header = una instancia de balanza entregada (empresa + ejercicio + versión/etiqueta).
- `balanza_cuentas`: una fila = una cuenta contable con sus saldos, dentro de una instancia de balanza.

## Claves y trazabilidad

- **Primary key del documento:** `balanza_header.balanza_id` (identificador interno generado al parsear); naturalmente identificable por `(rfc_empresa, ejercicio, version_etiqueta)`.
- **Foreign keys hacia otros DOC-*:**
  - Ninguna directa. El mapeo cuenta→control-de-amarre (IMSS, RCV, INFONAVIT, sueldos) vive en una entidad externa por auditoría/cliente y no forma parte de este schema.

## Tabla: `balanza_header`

**Grain:** un row = una instancia de balanza (empresa + ejercicio + versión).

| columna | tipo | nullable | pk/fk | descripción |
|---------|------|----------|-------|-------------|
| balanza_id | string | no | pk | identificador interno único de la instancia |
| razon_social | string | sí | | razón social de la empresa, cuando aparece en metadatos |
| rfc_empresa | string | sí | | RFC de la empresa, cuando aparece en metadatos |
| ejercicio | integer | no | | año del ejercicio fiscal (ej: 2024) |
| fecha_inicial | date | sí | | fecha inicial del rango (típicamente 1-ene del ejercicio) |
| fecha_final | date | sí | | fecha final del rango (típicamente 31-dic del ejercicio) |
| alcance_temporal | string | no | | `anual` \| `mensual` \| `rango` — ver enum abajo |
| mes_cubierto | integer | sí | | 1-12 cuando `alcance_temporal = mensual`, null en otros casos |
| version_etiqueta | string | sí | | etiqueta textual de versión si aparece en el nombre o metadatos (ej: "definitivo", "con ajustes", "original") |
| sistema_origen | string | sí | | variante de ERP detectada por el parser (ej: `sap`, `generico_con_naturaleza`, `desconocido`) |
| archivo_fuente | string | no | | nombre del archivo del que se extrajo |
| hoja_fuente | string | no | | nombre de la hoja del Excel de la que se extrajo |
| fecha_parseo | datetime | no | | cuándo se parseó |

### Enumeraciones usadas en esta tabla

**`alcance_temporal`:**
- `anual` — cubre el ejercicio fiscal completo (1-ene al 31-dic)
- `mensual` — cubre un solo mes
- `rango` — cubre un rango distinto a mes o año completo

## Tabla: `balanza_cuentas`

**Grain:** un row = una cuenta contable dentro de una instancia de balanza.

| columna | tipo | nullable | pk/fk | descripción |
|---------|------|----------|-------|-------------|
| balanza_id | string | no | fk → balanza_header.balanza_id | instancia a la que pertenece la fila |
| numero_cuenta | string | no | pk (compuesta con balanza_id) | número de cuenta tal cual viene del ERP; se preserva como string porque puede tener ceros a la izquierda y distintas longitudes |
| descripcion | string | sí | | nombre/descripción de la cuenta, con whitespace recortado |
| naturaleza | string | sí | | `D` (deudora) \| `A` (acreedora) cuando el sistema origen lo provee; null cuando no aplica |
| saldo_inicial | decimal(18,2) | no | | saldo al inicio del periodo, tal cual viene del sistema origen (preserva signo del raw) |
| cargos | decimal(18,2) | no | | movimientos a cargo del periodo, tal cual vienen del sistema origen |
| abonos | decimal(18,2) | no | | movimientos a abono del periodo, tal cual vienen del sistema origen |
| saldo_final | decimal(18,2) | no | | saldo al cierre del periodo, tal cual viene del sistema origen |
| nivel | integer | no | | nivel jerárquico calculado (1 = mayor, niveles sucesivos según catálogo del cliente) |
| cuenta_padre | string | sí | | número de cuenta del padre directo en la jerarquía, null para nivel 1 |
| longitud_numero | integer | no | | longitud del string `numero_cuenta`, usada para derivar jerarquía |
| cod_establecimiento | string | sí | | código de establecimiento/sucursal si el sistema lo provee (ej: `T` en algunos ERPs) |

### Campos calculados

| columna | expresión | depende de | descripción |
|---------|-----------|------------|-------------|
| nivel | rank del `longitud_numero` dentro del conjunto de longitudes distintas presentes en la balanza | longitud_numero | jerarquía ordinal derivada del catálogo del cliente |
| cuenta_padre | cuenta cuya longitud es inmediatamente menor y que es prefijo de `numero_cuenta` | numero_cuenta, longitud_numero | padre directo en la jerarquía |
| longitud_numero | `len(numero_cuenta)` | numero_cuenta | longitud útil para ordenar jerarquía |

### Enumeraciones usadas en esta tabla

**`naturaleza`:**
- `D` — cuenta de naturaleza deudora
- `A` — cuenta de naturaleza acreedora

Catálogo abierto: puede ser null cuando el sistema origen no incluye esta columna.

## Relaciones entre tablas internas

- `balanza_cuentas.balanza_id` → `balanza_header.balanza_id` (relación N:1 — muchas cuentas por balanza)
- `balanza_cuentas.cuenta_padre` → `balanza_cuentas.numero_cuenta` (auto-referencia jerárquica dentro de la misma balanza)

## Trazabilidad inversa

Mapeo columna del schema → ubicación en el archivo raw (varía según variante detectada; los nombres exactos están en el Parser config):

- `balanza_header.razon_social`: metadatos en fila de encabezado del archivo, si existe
- `balanza_header.rfc_empresa`: metadatos en fila de encabezado del archivo, si existe
- `balanza_header.fecha_inicial` / `fecha_final`: metadatos del filtro/rango del reporte, si existen
- `balanza_header.hoja_fuente`: nombre de la hoja del Excel donde vive la tabla canónica
- `balanza_cuentas.numero_cuenta`: columna de número de cuenta (varía: `Numero de cuenta`, `ctacompleta`, `Cuenta`, etc.)
- `balanza_cuentas.descripcion`: columna de descripción (varía: `Descripcion`, `nombre`, etc.)
- `balanza_cuentas.saldo_inicial`: columna `Saldo Inicial` o equivalente
- `balanza_cuentas.cargos`: columna `Cargos Periodo` / `cargos`
- `balanza_cuentas.abonos`: columna `Abonos Periodo` / `Abonos`
- `balanza_cuentas.saldo_final`: columna `Saldo Actual` / `Saldo`
- `balanza_cuentas.naturaleza`: columna `Naturaleza` (D/A), presente solo en algunos ERPs
- `balanza_cuentas.cod_establecimiento`: columna `cod_estab` o equivalente, presente solo en algunos ERPs

## JSON Schema (para consumo automático)

```yaml
$schema: "http://json-schema.org/draft-07/schema#"
type: object
properties:
  balanza_header:
    type: object
    properties:
      balanza_id: {type: string}
      razon_social: {type: [string, "null"]}
      rfc_empresa: {type: [string, "null"], pattern: "^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$"}
      ejercicio: {type: integer, minimum: 2000, maximum: 2100}
      fecha_inicial: {type: [string, "null"], format: date}
      fecha_final: {type: [string, "null"], format: date}
      alcance_temporal: {type: string, enum: [anual, mensual, rango]}
      mes_cubierto: {type: [integer, "null"], minimum: 1, maximum: 12}
      version_etiqueta: {type: [string, "null"]}
      sistema_origen: {type: [string, "null"]}
      archivo_fuente: {type: string}
      hoja_fuente: {type: string}
      fecha_parseo: {type: string, format: date-time}
    required: [balanza_id, ejercicio, alcance_temporal, archivo_fuente, hoja_fuente, fecha_parseo]
  balanza_cuentas:
    type: array
    items:
      type: object
      properties:
        balanza_id: {type: string}
        numero_cuenta: {type: string, minLength: 1}
        descripcion: {type: [string, "null"]}
        naturaleza: {type: [string, "null"], enum: [D, A, null]}
        saldo_inicial: {type: number}
        cargos: {type: number}
        abonos: {type: number}
        saldo_final: {type: number}
        nivel: {type: integer, minimum: 1}
        cuenta_padre: {type: [string, "null"]}
        longitud_numero: {type: integer, minimum: 1}
        cod_establecimiento: {type: [string, "null"]}
      required: [balanza_id, numero_cuenta, saldo_inicial, cargos, abonos, saldo_final, nivel, longitud_numero]
required: [balanza_header, balanza_cuentas]
```

## Notas de implementación

- **Preservación de signos:** los campos de saldos/cargos/abonos se guardan **tal cual vienen del sistema origen**. No se normalizan a convención contable estándar. La interpretación del signo depende de `naturaleza` cuando está presente o del sistema origen cuando no. Esto es deliberado para no perder información del raw.
- **`numero_cuenta` como string:** siempre string, nunca integer. Puede tener ceros a la izquierda en algunos ERPs y su longitud es semánticamente relevante para la jerarquía.
- **Precisión decimal:** `decimal(18,2)` da suficiente rango para balanzas de empresas grandes (hasta billones de pesos con dos decimales).
- **`cuenta_padre` puede ser null:** para cuentas de nivel 1 (mayores tipo ACTIVO, PASIVO, CAPITAL) no hay padre.
- **`alcance_temporal = mensual`** se preserva aunque el DOC canónico es anual: así el sistema puede aceptar balanzas mensuales como input de investigación sin rechazarlas, marcándolas como no aptas para cerrar el amarre anual.

## Cambios de schema

Este archivo solo se modifica vía el pipeline de propuestas. Ver
[[04 - Change log]] para el histórico.
