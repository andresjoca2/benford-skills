---
id: DOC-declaracion-prima-rt/parser
type: parser-config
parent_doc: DOC-declaracion-prima-rt
parser_kind: pdf-text
encoding: UTF-8
delimiter: null
version: 1
---

# Declaración Anual de Prima de Riesgo de Trabajo — Parser config

## Método de extracción

El PDF es nativo (generado por el portal IMSS "IMSS Desde su empresa"), una sola página, layout fijo con dos tablas de labels a la izquierda y valores a la derecha.

La estrategia canónica es **extracción por anclas de texto**, no por coordenadas. El layout del IMSS es estable pero las coordenadas exactas pueden desplazarse mínimamente entre generaciones del portal; los labels son siempre literales y únicos, así que anclar por label es más robusto.

### Estrategia general

1. Abrir el PDF y extraer todo el texto de la página 1 con un extractor que preserve el orden de lectura (ej: `pdfplumber.Page.extract_text()`).
2. Para cada campo del schema, buscar su label exacto (incluyendo tildes, espacios, mayúsculas y el signo ":" o " :" tal cual aparece) y capturar el siguiente token/tokens hasta el próximo label o hasta el final de línea.
3. Aplicar las transformaciones documentadas en la sección "Mapeo raw → schema".

### Detalles específicos del formato

#### `parser_kind: pdf-text`

- **Páginas relevantes:** página 1 únicamente. El documento canónico es de una sola página; si el PDF trae más, ignorarlas.

- **Método de extracción por campo (anchor por texto):**

  | campo | ancla (label literal) | captura |
  |-------|------------------------|---------|
  | registro_patronal | `Registro Patronal :` | siguiente token alfanumérico |
  | folio | `Folio:` | siguiente token no-whitespace |
  | fecha_transaccion | `Fecha de transacción:` | siguiente token con patrón `DD-MM-YYYY` |
  | razon_social | `Razón Social:` | hasta el siguiente label (`Actividad Económica:`) |
  | clase | `Clase :` | siguiente número entero |
  | fraccion | `Fracción :` | siguiente token (preservar como string) |
  | periodo_revision | `Periodo Revisión:` | siguiente número de 4 dígitos |
  | prima_anterior | `Prima Anterior:` | siguiente número decimal (5 decimales) |
  | prima_declarada | `Prima Declarada:` | siguiente número decimal (5 decimales) |

## Mapeo raw → schema

| campo raw | columna del schema | transformación |
|-----------|--------------------|----------------|
| texto tras "Registro Patronal :" | `declaracion_prima_rt.registro_patronal` | strip + upper |
| texto tras "Folio:" | `declaracion_prima_rt.folio` | strip (preservar guiones y ceros) |
| texto tras "Fecha de transacción:" | `declaracion_prima_rt.fecha_transaccion` | parse `DD-MM-YYYY` → ISO date |
| texto tras "Razón Social:" | `declaracion_prima_rt.razon_social` | strip |
| texto tras "Clase :" | `declaracion_prima_rt.clase` | int |
| texto tras "Fracción :" | `declaracion_prima_rt.fraccion` | strip (preservar como string) |
| texto tras "Periodo Revisión:" | `declaracion_prima_rt.periodo_revision` | string(4) |
| texto tras "Prima Anterior:" | `declaracion_prima_rt.prima_anterior` | decimal(10,5) |
| texto tras "Prima Declarada:" | `declaracion_prima_rt.prima_declarada` | decimal(10,5) |

## Transformaciones

- `registro_patronal`: `upper()` porque el formato IMSS es mayúsculas y algunos flujos pueden venir minúsculas.
- `folio`, `fraccion`: preservar como string literal sin conversión numérica porque pueden tener ceros iniciales o guiones significativos.
- `prima_anterior`, `prima_declarada`: descartar ceros de impresión a la izquierda (`00.53406` → `0.53406`) pero **preservar los 5 decimales de precisión**. No truncar a 4 decimales — eso cambia el valor.
- `fecha_transaccion`: el PDF usa `DD-MM-YYYY`; convertir a ISO `YYYY-MM-DD`.

## Casos borde del parser

- **Espaciado variable en labels con `:`:** los labels a veces aparecen con un espacio antes del `:` (`Registro Patronal :`, `Clase :`, `Fracción :`) y a veces sin él. El parser debe ser tolerante: buscar `<label>\s*:`.
- **Valores numéricos con ceros de impresión:** `00.53406`, `00.55257`, etc. El parser debe aceptar y convertir correctamente; nunca interpretar ceros como octal.
- **Orden de lectura del PDF:** los labels de la tabla derecha (`Periodo Revisión`, `Prima Anterior`, `Prima Declarada`) pueden aparecer intercalados con los de la izquierda según cómo el extractor lea el PDF. No asumir orden lineal; siempre anclar por label.
- **Campos faltantes o vacíos:** si un label existe pero el valor está vacío, capturar como `null`. Si el label no existe, reportar como error de parseo.
- **Acentos en labels:** los labels tienen tildes (`Revisión`, `Económica`, `Fracción`). El parser debe preservar encoding UTF-8 durante la extracción y comparar exactamente.
- **Labels adicionales en el PDF que el parser ignora:** el PDF contiene muchos otros campos (delegación, subdelegación, lote, representante legal, denominación del trámite, días subsidiados, porcentajes, defunciones, trabajadores promedio, años promedio vida activa, factor de prima, prima mínima, días del año, acreditación STyPS, actividad económica, cadena original, sello digital) que el parser canónico **lee y descarta**. No alimentan ninguna prueba.

## Dependencias / herramientas sugeridas

- Python: `pdfplumber` (preferido por su precisión en PDFs con tablas y layout estable) o `pypdf` como alternativa más ligera.
- Versión mínima requerida: `pdfplumber >= 0.10` o `pypdf >= 4.0`.

## Validación post-parseo

El parser debe verificar antes de entregar el resultado:

- Todos los campos requeridos están presentes: `registro_patronal`, `periodo_revision`, `folio`, `fecha_transaccion`, `razon_social`, `clase`, `fraccion`, `prima_anterior`, `prima_declarada`.
- `registro_patronal` cumple `^[A-Z0-9]{11}$`.
- `periodo_revision` cumple `^[0-9]{4}$` y es un año razonable (entre 2000 y el año actual).
- `prima_anterior` y `prima_declarada` son decimales no negativos menores a 15.0.
- `clase` está entre 1 y 5.
- `fecha_transaccion` no es posterior a la fecha actual.

Si alguna falla, el parser marca el documento con `status: needs_review` y adjunta las reglas VR-DPRT-* que fallaron.

## Versionado del parser

La versión del parser bumpea cuando:

- Cambia el layout del PDF por actualización del portal IMSS (labels nuevos, labels renombrados, orden alterado).
- Se agrega o quita un campo al schema que requiere nueva ancla.
- Se corrige un bug en una transformación.

Cambios de estrategia (anclas → coordenadas, o viceversa) son breaking y requieren bump mayor.

No editar este archivo a mano. Cualquier cambio pasa por PROP.
