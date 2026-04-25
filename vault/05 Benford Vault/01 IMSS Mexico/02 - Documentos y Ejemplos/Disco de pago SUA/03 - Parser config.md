---
id: DOC-disco-sua/parser
type: parser-config
parent_doc: DOC-disco-sua
parser_kind: binary-fixed-width
encoding: ASCII
delimiter: null
version: 2
---

# Disco de pago SUA — Parser config

## Método de extracción

El input canónico es el archivo crudo `.sua/.SUA`. En los ejemplos confirmados,
el archivo:

- es texto ASCII
- viene en una sola línea larga
- usa registros de longitud fija
- en la versión observada `W300` usa `295 bytes por registro`
- mezcla tipos de registro `02`, `03`, `04`, `05` y `06` dentro del mismo
  stream

### Si `parser_kind: binary-fixed-width`

Layout por tipo de registro:

#### Registro tipo `02` (cabecera patronal)

| campo | offset | length | tipo binario | interpretación |
|-------|--------|--------|--------------|----------------|
| tipo | 0 | 2 | ascii | discriminador `02` |
| registro_patronal | 2 | 11 | ascii | RP del archivo |
| separador | 13 | 1 | ascii | espacio fijo |
| rfc_patron | 14 | 12 | ascii | RFC del patrón |
| periodo | 26 | 6 | ascii-num | periodo `YYYYMM` |
| folio_sua | 32 | 6 | ascii-num | folio SUA |
| razon_social | 38 | 50 | ascii | razón social |
| domicilio | 88 | 40 | ascii | domicilio |
| poblacion | 128 | 40 | ascii | población |
| entidad | 168 | 2 | ascii-num | entidad |
| codigo_postal | 170 | 5 | ascii-num | CP |
| telefono | 175 | 15 | ascii | teléfono |
| prima_riesgo_trabajo | 190 | 7 | ascii-num | dividir entre `100000` |
| fecha_prima_periodo | 197 | 6 | ascii-num | periodo `YYYYMM` |
| actividad_economica | 203 | 40 | ascii | actividad económica |
| delegacion | 243 | 2 | ascii-num | delegación |
| subdelegacion | 245 | 2 | ascii-num | subdelegación |
| area_geografica | 247 | 1 | ascii | área geográfica |
| porcentaje_aportacion | 248 | 2 | ascii-num | porcentaje |
| convenio_reembolso | 250 | 1 | ascii | flag |
| tipo_empresa | 251 | 1 | ascii | tipo de empresa |
| total_dias | 252 | 7 | ascii-num | total días del archivo |
| total_trabajadores | 259 | 9 | ascii-num | total de trabajadores |
| tipo_documento | 268 | 2 | ascii-num | código observado |
| numero_credito_header | 270 | 10 | ascii-num | crédito o ceros |
| filler | 280 | 15 | ascii | ignorar |

#### Registro tipo `03` (detalle por trabajador)

| campo | offset | length | tipo binario | interpretación |
|-------|--------|--------|--------------|----------------|
| tipo | 0 | 2 | ascii | discriminador `03` |
| registro_patronal | 2 | 11 | ascii | RP del archivo |
| separador | 13 | 1 | ascii | espacio fijo |
| rfc_patron | 14 | 12 | ascii | RFC del patrón |
| periodo | 26 | 6 | ascii-num | periodo `YYYYMM` |
| nss | 32 | 11 | ascii-num | NSS |
| rfc_trabajador | 43 | 13 | ascii | RFC trabajador |
| curp | 56 | 18 | ascii | CURP |
| numero_credito | 74 | 10 | ascii | crédito INFONAVIT |
| fecha_inicio_credito | 84 | 8 | ascii-num | fecha `YYYYMMDD` |
| numero_movimientos | 92 | 2 | ascii-num | número de movimientos |
| nombre_trabajador | 94 | 50 | ascii | nombre del trabajador |
| ultimo_salario | 144 | 7 | ascii-num | dividir entre `100` |
| tipo_trabajador | 151 | 1 | ascii | código SUA |
| jor_sem | 152 | 1 | ascii | código SUA |
| dias_mes | 153 | 2 | ascii-num | días del mes |
| dias_incapacidad_mes | 155 | 2 | ascii-num | incapacidad del mes |
| dias_ausentismo_mes | 157 | 2 | ascii-num | ausentismo del mes |
| cuota_fija | 159 | 7 | ascii-num | dividir entre `100` |
| cuota_excedente_patronal | 166 | 7 | ascii-num | dividir entre `100` |
| prestaciones_dinero_patronal | 173 | 7 | ascii-num | dividir entre `100` |
| gastos_medicos_pensionados_patronal | 180 | 7 | ascii-num | dividir entre `100` |
| riesgos_trabajo | 187 | 7 | ascii-num | dividir entre `100` |
| invalidez_vida_patronal | 194 | 7 | ascii-num | dividir entre `100` |
| guarderias_prestaciones_sociales | 201 | 7 | ascii-num | dividir entre `100` |
| cola_economica_raw_03 | 208 | 70 | ascii-num | cola económica del trabajador; en el raw mensual confirmado viene en cero |
| checksum_y_filler | 278 | 14 | ascii | ignorar |
| municipio | 292 | 3 | ascii-num | municipio o clave equivalente |

Notas del `03`:

- El tramo `208:278` alimenta la traducción operativa a columnas bimestrales,
  obreras y de actualización equivalentes a `Datos Trabajador`.
- En el set confirmado, el raw validado directo del ejemplo Nelly es mensual y
  ese tramo viene en cero. La semántica de esa cola se confirmó contra la
  traducción a Excel y contra helpers operativos, pero la microasignación
  byte-a-byte para un raw bimestral no quedó observada directamente en esta
  corrida.

#### Registro tipo `04` (movimientos empaquetados)

Cabecera fija del `04`:

| campo | offset | length | tipo binario | interpretación |
|-------|--------|--------|--------------|----------------|
| tipo | 0 | 2 | ascii | discriminador `04` |
| registro_patronal | 2 | 11 | ascii | RP del archivo |

Cada `04` contiene hasta 7 slots de 38 bytes a partir del offset `13`.

Layout de cada slot:

| campo | offset relativo | length | tipo binario | interpretación |
|-------|------------------|--------|--------------|----------------|
| nss | 0 | 11 | ascii-num | NSS del trabajador |
| tipo_movimiento | 11 | 2 | ascii | código de movimiento |
| fecha_movimiento | 13 | 8 | ascii-num | fecha `YYYYMMDD` |
| folio_incapacidad | 21 | 8 | ascii | folio de incapacidad si existe |
| valor_movimiento_raw | 29 | 9 | ascii-num | payload del slot |

Regla de expansión:

- slot `n` comienza en `13 + (n - 1) * 38`
- si `nss` viene vacío o en ceros, el slot se ignora
- si `folio_incapacidad` viene poblado o el `tipo_movimiento` es de incidencia,
  `valor_movimiento_raw` se interpreta como `dias`
- en movimientos salariales observados (`00`, `07`) el `valor_movimiento_raw`
  se interpreta como `salario / 100`
- en todos los casos se preserva `valor_movimiento_raw` para no perder
  trazabilidad

Filler final del `04`:

| campo | offset | length | tipo binario | interpretación |
|-------|--------|--------|--------------|----------------|
| filler | 279 | 16 | ascii | ignorar |

#### Registro tipo `05` (sumario económico)

| campo | offset | length | tipo binario | interpretación |
|-------|--------|--------|--------------|----------------|
| tipo | 0 | 2 | ascii | discriminador `05` |
| registro_patronal | 2 | 11 | ascii | RP |
| separador | 13 | 1 | ascii | espacio fijo |
| rfc_patron | 14 | 12 | ascii | RFC patrón |
| periodo | 26 | 6 | ascii-num | periodo `YYYYMM` |
| folio_sua | 32 | 6 | ascii-num | folio SUA |
| reservado | 38 | 21 | ascii-num | ignorar en v2 |
| cuota_fija | 59 | 9 | ascii-num | remover cero final de padding y dividir entre `100` |
| cuota_excedente | 68 | 9 | ascii-num | remover cero final de padding y dividir entre `100` |
| prestaciones_dinero | 77 | 9 | ascii-num | remover cero final de padding y dividir entre `100` |
| gastos_medicos_pensionados | 86 | 9 | ascii-num | remover cero final de padding y dividir entre `100` |
| riesgos_trabajo | 95 | 9 | ascii-num | remover cero final de padding y dividir entre `100` |
| invalidez_vida | 104 | 9 | ascii-num | remover cero final de padding y dividir entre `100` |
| guarderias_prestaciones_sociales | 113 | 9 | ascii-num | remover cero final de padding y dividir entre `100` |
| cola_sumario_raw_05 | 122 | 173 | ascii-num | cola económica del sumario; se decodifica contra la traducción `Datos Sumarios` para poblar subtotales, accesorios, RCV, INFONAVIT y folio de requerimiento |

#### Registro tipo `06` (control y validación)

| campo | offset | length | tipo binario | interpretación |
|-------|--------|--------|--------------|----------------|
| tipo | 0 | 2 | ascii | discriminador `06` |
| registro_patronal | 2 | 11 | ascii | RP |
| separador | 13 | 1 | ascii | espacio fijo |
| rfc_patron | 14 | 12 | ascii | RFC patrón |
| periodo | 26 | 6 | ascii-num | periodo `YYYYMM` |
| folio_sua | 32 | 6 | ascii-num | folio SUA |
| suma_tasa_actualizacion_recargos | 38 | 15 | ascii-num | dividir entre `100` |
| bytes_declarados | 53 | 5 | ascii-num | tamaño del archivo |
| fecha_limite_pago | 58 | 8 | ascii-num | fecha `YYYYMMDD` |
| numero_discos | 66 | 2 | ascii-num | contador |
| version_sua | 68 | 4 | ascii | versión del layout |
| reservado | 72 | 4 | ascii-num | ignorar en v2 |
| total_imss | 76 | 9 | ascii-num | remover cero final de padding y dividir entre `100` |
| total_rcv | 85 | 9 | ascii-num | remover cero final de padding y dividir entre `100` |
| total_aportacion | 94 | 9 | ascii-num | remover cero final de padding y dividir entre `100` |
| total_amortizacion | 103 | 9 | ascii-num | remover cero final de padding y dividir entre `100` |
| cola_control_no_modelada | 112 | 183 | ascii-num | factores de reversión y control no consumidos por pruebas confirmadas |

## Mapeo raw → schema

| campo raw | columna del schema | transformación |
|-----------|--------------------|----------------|
| `02.registro_patronal` | `disco_sua_empresa.registro_patronal` | trim + upper |
| `02.periodo` | `disco_sua_empresa.periodo` | preservar `YYYYMM` |
| `02.folio_sua` | `disco_sua_empresa.folio_sua` | preservar como string |
| `02.prima_riesgo_trabajo` | `disco_sua_empresa.prima_riesgo_trabajo` | `int(valor) / 100000` |
| `03.ultimo_salario` | `disco_sua_trabajador.ultimo_salario` | `int(valor) / 100` |
| `03.cuota_fija ... 03.guarderias_prestaciones_sociales` | `disco_sua_trabajador.*` | `int(valor) / 100` |
| `03.cola_economica_raw_03` | columnas bimestrales / obreras derivadas | decodificación por layout cuando aplique |
| `04.slot.valor_movimiento_raw` | `disco_sua_movimiento.valor_movimiento_raw` | preservar string |
| `04.slot.valor_movimiento_raw` | `disco_sua_movimiento.salario` | `int(valor) / 100` cuando el slot es salarial |
| `04.slot.valor_movimiento_raw` | `disco_sua_movimiento.dias` | `int(valor)` cuando el slot es de incidencia |
| `05.cuota_fija ... 05.guarderias_prestaciones_sociales` | `disco_sua_sumario.*` | `int(valor[:-1]) / 100` en el layout `W300` observado |
| `05.cola_sumario_raw_05` | columnas restantes de `disco_sua_sumario` | decodificación alineada con la traducción `Datos Sumarios` del set confirmado |
| `06.suma_tasa_actualizacion_recargos` | `disco_sua_validacion.suma_tasa_actualizacion_recargos` | `int(valor) / 100` |
| `06.bytes_declarados` | `disco_sua_validacion.bytes_declarados` | `int(valor)` |
| `06.fecha_limite_pago` | `disco_sua_validacion.fecha_limite_pago` | `parse_date("%Y%m%d")` |
| `06.total_*` | `disco_sua_validacion.total_*` | `int(valor[:-1]) / 100` en el layout `W300` observado |

## Transformaciones

- `registro_patronal`, `folio_sua`, `nss`, `numero_credito` y códigos de
  movimiento se preservan como strings para no perder ceros a la izquierda
- los importes monetarios confirmados del `03` se interpretan como enteros
  implícitos con dos decimales
- los importes monetarios confirmados del `05` y de los totales del `06` se
  leen como celdas de 9 bytes con un cero final de padding observado en `W300`;
  la regla práctica es `int(valor[:-1]) / 100`
- la cola `05[122:295]` se preserva y se decodifica con apoyo de la traducción
  `Datos Sumarios`; en esta corrida no se cerró una tabla byte-a-byte robusta
  para cada subcampo posterior a `guarderias_prestaciones_sociales`
- `prima_riesgo_trabajo` del `02` se interpreta con cinco decimales implícitos
- fechas `YYYYMMDD` se convierten a `date`
- campos llenos con espacios o ceros de relleno se convierten a `null` cuando
  sean opcionales
- nombres con `$` se preservan tal cual porque forman parte del raw y la
  traducción confirmada

## Casos borde del parser

- Archivo con tamaño no múltiplo de 295 para `W300` → abortar
- Stream sin `05` o `06` → abortar
- Slots vacíos dentro del `04` → ignorar
- `valor_movimiento_raw` ambiguo en `04` → preservar el valor crudo y derivar
  `dias` o `salario` solo cuando la semántica sea observable
- Cola económica del `03` no cero en un raw bimestral no validado directo →
  materializar `cola_economica_raw_03`, emitir warning y contrastar contra la
  traducción a Excel si existe

## Dependencias / herramientas sugeridas

- Python: `decimal`, `datetime`, `pathlib`
- CLI fallback: cualquier lector binario/texto que preserve offsets exactos
- Versión mínima requerida: soporte para slicing por bytes y validación de
  ASCII

## Validación post-parseo

- `count(02)=1`, `count(03)>=1`, `count(05)=1`, `count(06)=1`
- `file_size_bytes = disco_sua_validacion.bytes_declarados`
- `count(03) = disco_sua_empresa.total_trabajadores` cuando el campo exista
- `disco_sua_sumario.total_imss_sumario = disco_sua_validacion.total_imss`
  dentro de `0.01`
- `disco_sua_sumario.total_rcv_sumario = disco_sua_validacion.total_rcv` dentro
  de `0.01`
- todos los rows derivados de `04` deben provenir de slots con `nss` poblado

## Versionado del parser

El parser tiene su propia versión (campo `version` en frontmatter). Cuando el
IMSS cambia el layout oficial:

1. Se crea un PROP tipo `modify` con el diff de offsets / coords / selectors
2. El curador evalúa y emite DEC-NNNN
3. Si se acepta, se bumpea `version` y se registra en [[04 - Change log]]
4. Si el cambio rompe compatibilidad con versiones anteriores del documento,
   marcar `breaking_change_of: <versión anterior>` en frontmatter

No editar este archivo a mano. Cualquier cambio pasa por PROP.
