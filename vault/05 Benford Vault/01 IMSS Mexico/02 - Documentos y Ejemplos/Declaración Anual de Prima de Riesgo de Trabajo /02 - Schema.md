---
id: DOC-declaracion-prima-rt/schema
type: doc-schema
parent_doc: DOC-declaracion-prima-rt
format: key-value
grain: "un row = una declaración anual de prima RT de un registro patronal para un periodo de revisión"
tables:
  - declaracion_prima_rt
version: 1
breaking_change_of: null
---

# Declaración Anual de Prima de Riesgo de Trabajo — Schema

## Grain

Un row = una declaración anual de prima RT de un registro patronal para un periodo de revisión (año calendario).

El documento es de una sola hoja y representa una única instancia. No hay sub-tablas.

## Claves y trazabilidad

- **Primary key del documento:** `(registro_patronal, periodo_revision)` — llave compuesta.
- **Unique secundario:** `folio` — identifica el trámite administrativo individual ante el IMSS. Se preserva pero no es PK porque en escenarios de re-envío por corrección pueden existir múltiples folios para el mismo RP+periodo.
- **Foreign keys hacia otros DOC-*:**
  - `registro_patronal` → [[DOC-emision-ema]]`.registro_patronal`
  - `registro_patronal` → [[DOC-cedula-determinacion-mensual]]`.registro_patronal`

## Tabla: `declaracion_prima_rt`

**Grain:** un row = una declaración anual de un RP para un periodo de revisión.

| columna | tipo | nullable | pk/fk | descripción |
|---------|------|----------|-------|-------------|
| registro_patronal | string(11) | no | pk | RP de 11 caracteres alfanuméricos. Tal cual viene del PDF. |
| periodo_revision | string(4) | no | pk | Año calendario revisado, 4 dígitos. String porque es identificador, no número operable. |
| folio | string | no | unique | Folio del acuse notarial. Preserva ceros iniciales y guiones tal cual (ej: `03-08500280`). |
| fecha_transaccion | date | no | | Fecha en que se transmitió el archivo al IMSS. Se usa para elegir el acuse más reciente cuando hay re-envío (ver EC-DPRT-002). |
| razon_social | string | no | | Razón social completa del patrón. Sanity check de que el documento corresponde al cliente correcto. |
| clase | integer | no | | Clase de riesgo de trabajo (1 a 5). Alimenta columna AN del análisis de prima. |
| fraccion | string | no | | Fracción de la actividad económica según catálogo RACERF. String para preservar ceros iniciales. Alimenta columna AM del análisis de prima. |
| prima_anterior | decimal(10,5) | no | | Prima que venía aplicando antes de esta declaración. Precisión de 5 decimales (ej: 0.53406). Alimenta columna AUD (enero-febrero). |
| prima_declarada | decimal(10,5) | no | | Prima que el patrón declara para el siguiente periodo. Precisión de 5 decimales. Alimenta columna AUD (marzo-diciembre). |

### Campos calculados

| columna | expresión | depende de | descripción |
|---------|-----------|------------|-------------|
| anio_aplicacion | int(periodo_revision) + 1 | periodo_revision | Año calendario en el que aplican estas primas. `periodo_revision` es el año revisado; las primas rigen el siguiente. |
| prima_ene_feb | prima_anterior | prima_anterior | Prima que se usa en enero y febrero del año de aplicación (columna AUD). |
| prima_mar_dic | prima_declarada | prima_declarada | Prima que se usa de marzo a diciembre del año de aplicación (columna AUD). |

### Enumeraciones usadas en esta tabla

**`clase`:**
- `1` — Clase I
- `2` — Clase II
- `3` — Clase III
- `4` — Clase IV
- `5` — Clase V

## Trazabilidad inversa

Mapeo columna del schema → de dónde sale en el PDF:

- `registro_patronal`: valor a la derecha del label "Registro Patronal :" en la tabla de identificación.
- `folio`: valor a la derecha del label "Folio:".
- `fecha_transaccion`: valor a la derecha del label "Fecha de transacción:" en formato `DD-MM-YYYY`.
- `razon_social`: valor a la derecha del label "Razón Social:".
- `clase`: valor a la derecha del label "Clase :".
- `fraccion`: valor a la derecha del label "Fracción :".
- `periodo_revision`: label "Periodo Revisión:" (bloque derecho de la tabla de Datos base).
- `prima_anterior`: label "Prima Anterior:".
- `prima_declarada`: label "Prima Declarada:".

## JSON Schema (para consumo automático)

```yaml
$schema: "http://json-schema.org/draft-07/schema#"
type: object
properties:
  declaracion_prima_rt:
    type: array
    items:
      type: object
      properties:
        registro_patronal: {type: string, pattern: "^[A-Z0-9]{11}$"}
        periodo_revision: {type: string, pattern: "^[0-9]{4}$"}
        folio: {type: string}
        fecha_transaccion: {type: string, format: date}
        razon_social: {type: string}
        clase: {type: integer, minimum: 1, maximum: 5}
        fraccion: {type: string}
        prima_anterior: {type: number, minimum: 0}
        prima_declarada: {type: number, minimum: 0}
      required: [registro_patronal, periodo_revision, folio, fecha_transaccion, razon_social, clase, fraccion, prima_anterior, prima_declarada]
required: [declaracion_prima_rt]
```

## Notas de implementación

- **Primas como decimales con 5 decimales.** Las primas en el PDF vienen con 5 posiciones decimales (`00.53406`, `00.55257`). Convertir a `decimal(10,5)` preserva precisión. Nunca truncar a 4 decimales — eso cambia el cálculo del análisis AUD.
- **Ceros iniciales en valores numéricos.** Las primas vienen con ceros a la izquierda por formato de impresión (`00.53406`). Los numéricos se convierten a número descartando los ceros; los identificadores (folio) se preservan como string con los ceros y guiones.
- **Fracción como string.** Puede tener ceros iniciales según catálogo RACERF (ej: `860` en el ejemplo). Mantener string.
- **Periodo como string.** Aunque sea un año, se guarda como string de 4 caracteres para que forme parte natural de la PK compuesta.
- **Fechas como date puro.** No traen hora; se guardan como `date` (no timestamp).

## Cambios de schema

Este archivo solo se modifica vía el pipeline de propuestas. Ver [[04 - Change log]] para el histórico.
