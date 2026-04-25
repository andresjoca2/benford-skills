---
id: DOC-disco-sua/schema
type: doc-schema
parent_doc: DOC-disco-sua
format: tabular
grain: "depende de la tabla: cabecera patronal por folio, detalle por trabajador, detalle por movimiento, sumario económico y validación de control"
tables:
  - disco_sua_empresa
  - disco_sua_trabajador
  - disco_sua_movimiento
  - disco_sua_sumario
  - disco_sua_validacion
version: 2
breaking_change_of: 1
---

# Disco de pago SUA — Schema

## Grain

- `disco_sua_empresa`: un row = la cabecera patronal del archivo para un
  `registro_patronal + periodo + folio_sua`
- `disco_sua_trabajador`: un row = un trabajador dentro del archivo
- `disco_sua_movimiento`: un row = un slot de movimiento expandido del bloque
  `04`
- `disco_sua_sumario`: un row = el resumen económico del folio
- `disco_sua_validacion`: un row = la capa de control/validación del mismo
  folio

## Claves y trazabilidad

- **Primary key del documento:** `(registro_patronal, periodo, folio_sua)` como
  llave lógica compartida entre `empresa`, `sumario` y `validacion`
- **Foreign keys hacia otros DOC-*:**
  - `(registro_patronal, periodo, folio_sua)` → [[DOC-comprobante-pago-sua]]
    cuando el comprobante expone el folio
  - `(registro_patronal, periodo)` → [[DOC-comprobante-pago-sua]] para búsquedas
    por periodo e importe
  - `(registro_patronal, periodo)` → [[DOC-cedula-determinacion-mensual]]
  - `(registro_patronal, periodo)` → [[DOC-cedula_determinacion_bimestral]]
  - `(registro_patronal, periodo)` → [[DOC-emision-ema]] y [[DOC-emision-eba]]
- **Claves internas de detalle:**
  - `disco_sua_trabajador.secuencia_trabajador`
  - `disco_sua_movimiento.(record_index, slot_index)`

## Tabla: `disco_sua_empresa`

**Grain:** un row = la cabecera patronal del folio

| columna | tipo | nullable | pk/fk | descripción | ejemplo | fuente raw |
|---------|------|----------|-------|-------------|---------|------------|
| registro_patronal | string | no | pk | RP del archivo | 03010513103 | `02[2:13]` |
| periodo | string | no | pk | periodo `YYYYMM` del archivo | 202405 | `02[26:32]` |
| folio_sua | string | no | pk | folio de liquidación | 636440 | `02[32:38]` |
| rfc_patron | string | no | | RFC del patrón | PDO850228KN5 | `02[14:26]` |
| razon_social | string | sí | | razón social patronal | PINTURAS DOAL SA DE CV MATRIZ | `02[38:88]` |
| domicilio | string | sí | | domicilio capturado en el header | CARRETERA A SANMIGUEL KM 1 SN JARDINES D | `02[88:128]` |
| poblacion | string | sí | | población / ciudad | GUADALUPE | `02[128:168]` |
| entidad | string | sí | | entidad del domicilio | 19 | `02[168:170]` |
| codigo_postal | string | sí | | código postal | 67110 | `02[170:175]` |
| telefono | string | sí | | teléfono como viene en el archivo | 8181311100  363 | `02[175:190]` |
| prima_riesgo_trabajo | decimal(10,5) | sí | | prima RT del header | 0.50000 | `02[190:197]` |
| fecha_prima_periodo | string | sí | | periodo de la prima en formato `YYYYMM` | 202403 | `02[197:203]` |
| actividad_economica | string | sí | | actividad económica del patrón | FAB Y VENTA DE PINTURA | `02[203:243]` |
| delegacion | string | sí | | delegación IMSS | 20 | `02[243:245]` |
| subdelegacion | string | sí | | subdelegación IMSS | 08 | `02[245:247]` |
| area_geografica | string | sí | | zona o área geográfica | B | `02[247:248]` |
| porcentaje_aportacion | integer | sí | | porcentaje de aportación | 50 | `02[248:250]` |
| convenio_reembolso | string | sí | | convenio de reembolso | N | `02[250:251]` |
| tipo_empresa | string | sí | | código de tipo de empresa | 3 | `02[251:252]` |
| total_dias | integer | sí | | total de días del archivo | 7809 | `02[252:259]` |
| total_trabajadores | integer | sí | | total de trabajadores del archivo | 259 | `02[259:268]` |
| tipo_documento | string | sí | | código de tipo de documento observado en el header | 01 | `02[268:270]` |
| numero_credito_header | string | sí | | número de crédito de header cuando venga poblado | 0000000000 | `02[270:280]` |

## Tabla: `disco_sua_trabajador`

**Grain:** un row = un trabajador dentro del disco

| columna | tipo | nullable | pk/fk | descripción | ejemplo | fuente raw |
|---------|------|----------|-------|-------------|---------|------------|
| secuencia_trabajador | integer | no | pk | orden de aparición del `03` en el archivo | 1 | ordinal del record `03` |
| registro_patronal | string | no | fk | RP del archivo padre | 03010513103 | `03[2:13]` |
| periodo | string | no | fk | periodo `YYYYMM` del archivo padre | 202405 | `03[26:32]` |
| folio_sua | string | no | fk | folio heredado de `disco_sua_empresa` | 636440 | join lógico con `02/05/06` |
| nss | string | no | | número de afiliación | 01139122509 | `03[32:43]` |
| rfc_trabajador | string | sí | | RFC del trabajador | CAZY9106267Y4 | `03[43:56]` |
| curp | string | sí | | CURP del trabajador | CAZY910626MSPSMR02 | `03[56:74]` |
| numero_credito | string | sí | | crédito INFONAVIT | null | `03[74:84]` |
| fecha_inicio_credito | date | sí | | fecha de inicio del crédito | null | `03[84:92]` |
| numero_movimientos | integer | no | | número de movimientos del trabajador en el periodo | 1 | `03[92:94]` |
| nombre_trabajador | string | sí | | nombre tal como aparece en el raw | CASTILLO$ZAMORA$YURIDIA | `03[94:144]` |
| ultimo_salario | decimal(12,2) | no | | salario base observado | 619.29 | `03[144:151]` |
| tipo_trabajador | string | sí | | código de tipo de trabajador | 1 | `03[151:152]` |
| jor_sem | string | sí | | código jornada / semana | 0 | `03[152:153]` |
| dias_mes | integer | sí | | días del mes | 31 | `03[153:155]` |
| dias_incapacidad_mes | integer | sí | | incapacidad del mes | 0 | `03[155:157]` |
| dias_ausentismo_mes | integer | sí | | ausentismo del mes | 0 | `03[157:159]` |
| cuota_fija | decimal(12,2) | sí | | cuota fija mensual | 686.60 | `03[159:166]` |
| cuota_excedente_patronal | decimal(12,2) | sí | | cuota excedente patronal | 136.51 | `03[166:173]` |
| prestaciones_dinero_patronal | decimal(12,2) | sí | | prestaciones en dinero patronal | 182.38 | `03[173:180]` |
| gastos_medicos_pensionados_patronal | decimal(12,2) | sí | | gastos médicos pensionados patronal | 273.57 | `03[180:187]` |
| riesgos_trabajo | decimal(12,2) | sí | | riesgos de trabajo | 95.99 | `03[187:194]` |
| invalidez_vida_patronal | decimal(12,2) | sí | | invalidez y vida patronal | 455.95 | `03[194:201]` |
| guarderias_prestaciones_sociales | decimal(12,2) | sí | | guarderías y prestaciones sociales | 191.98 | `03[201:208]` |
| cola_economica_raw_03 | string | sí | | tramo económico posterior del `03` que alimenta columnas bimestrales, obreras y de actualización en la traducción a Excel | 0000000000000000000000000000000000000000000000000000000000000000000000 | `03[208:278]` |
| municipio | string | sí | | municipio o clave equivalente al final del registro | 030 | `03[292:295]` |

### Campos calculados (no vienen directo del raw)

| columna | expresión | depende de | descripción |
|---------|-----------|------------|-------------|
| es_acreditado_infonavit | `numero_credito not in [null, '', '000000000', '0000000000']` | numero_credito | bandera útil para salidas derivadas tipo `ACREDITADOS` |
| cuota_excedente_obrera | `decode_from_cola_economica_raw_03(...)` | cola_economica_raw_03 | columna derivada cuando el layout tenga la cola económica poblada |
| prestaciones_dinero_obrera | `decode_from_cola_economica_raw_03(...)` | cola_economica_raw_03 | columna derivada cuando el layout tenga la cola económica poblada |
| gastos_medicos_pensionados_obrera | `decode_from_cola_economica_raw_03(...)` | cola_economica_raw_03 | columna derivada cuando el layout tenga la cola económica poblada |
| invalidez_vida_obrera | `decode_from_cola_economica_raw_03(...)` | cola_economica_raw_03 | columna derivada cuando el layout tenga la cola económica poblada |
| actualizacion_recargos_imss | `decode_from_cola_economica_raw_03(...)` | cola_economica_raw_03 | columna derivada para la traducción `Datos Trabajador` |
| dias_bimestre | `decode_from_cola_economica_raw_03(...)` | cola_economica_raw_03 | columna derivada para flujos bimestrales |
| dias_incapacidad_bimestre | `decode_from_cola_economica_raw_03(...)` | cola_economica_raw_03 | columna derivada para flujos bimestrales |
| dias_ausentismo_bimestre | `decode_from_cola_economica_raw_03(...)` | cola_economica_raw_03 | columna derivada para flujos bimestrales |
| retiro | `decode_from_cola_economica_raw_03(...)` | cola_economica_raw_03 | columna derivada para flujos bimestrales |
| actualizacion_recargos_retiro | `decode_from_cola_economica_raw_03(...)` | cola_economica_raw_03 | columna derivada para flujos bimestrales |
| cesantia_vejez_patronal | `decode_from_cola_economica_raw_03(...)` | cola_economica_raw_03 | columna derivada para flujos bimestrales |
| cesantia_vejez_obrera | `decode_from_cola_economica_raw_03(...)` | cola_economica_raw_03 | columna derivada para flujos bimestrales |
| actualizacion_recargos_cesantia_vejez | `decode_from_cola_economica_raw_03(...)` | cola_economica_raw_03 | columna derivada para flujos bimestrales |
| aportacion_voluntaria | `decode_from_cola_economica_raw_03(...)` | cola_economica_raw_03 | columna derivada para flujos bimestrales |
| aportacion_patronal | `decode_from_cola_economica_raw_03(...)` | cola_economica_raw_03 | columna derivada para flujos bimestrales |
| amortizacion | `decode_from_cola_economica_raw_03(...)` | cola_economica_raw_03 | columna derivada para flujos bimestrales |

### Enumeraciones usadas en esta tabla

**`tipo_trabajador`:**
- `1` — código operativo SUA; se preserva como string
- `2` — código operativo SUA; se preserva como string

**`jor_sem`:**
- `0` — código operativo SUA; se preserva como string

## Tabla: `disco_sua_movimiento`

**Grain:** un row = un slot expandido de movimiento del bloque `04`

| columna | tipo | nullable | pk/fk | descripción | ejemplo | fuente raw |
|---------|------|----------|-------|-------------|---------|------------|
| record_index | integer | no | pk | ordinal del registro `04` dentro del archivo | 1 | ordinal del record `04` |
| slot_index | integer | no | pk | slot 1-7 dentro del mismo registro `04` | 1 | posición relativa dentro del `04` |
| registro_patronal | string | no | fk | RP del archivo padre | 03010513103 | `04[2:13]` |
| periodo | string | no | fk | periodo `YYYYMM` heredado del folio | 202405 | join lógico con `02/05/06` |
| folio_sua | string | no | fk | folio heredado del archivo padre | 636440 | join lógico con `02/05/06` |
| nss | string | no | | NSS del trabajador | 01139122509 | `slot[0:11]` |
| tipo_movimiento | string | no | | código del movimiento | 07 | `slot[11:13]` |
| fecha_movimiento | date | sí | | fecha del movimiento | 2024-05-01 | `slot[13:21]` |
| folio_incapacidad | string | sí | | folio de incapacidad cuando exista | C0854202 | `slot[21:29]` |
| valor_movimiento_raw | string | sí | | payload crudo del slot; su semántica depende del `tipo_movimiento` | 000061929 | `slot[29:38]` |
| dias | integer | sí | | días interpretados del payload cuando el movimiento es de incidencia | 31 | derivado de `valor_movimiento_raw` |
| salario | decimal(12,2) | sí | | salario interpretado del payload cuando el movimiento es salarial | 619.29 | derivado de `valor_movimiento_raw` |

### Campos calculados (no vienen directo del raw)

| columna | expresión | depende de | descripción |
|---------|-----------|------------|-------------|
| semantica_valor | `case when folio_incapacidad not null or tipo_movimiento in ['11', '30'] then 'dias' else 'salario' end` | tipo_movimiento, folio_incapacidad | regla práctica observada en los insumos confirmados |

### Enumeraciones usadas en esta tabla

**`tipo_movimiento`:**
- `00` — código operativo SUA conservado como string
- `01` — alta
- `02` — baja
- `07` — movimiento afiliatorio / salario
- `08` — alta o variante de alta observada en filtros operativos
- `11` — incidencia observada en helper operativo
- `30` — incapacidad / incidencia observada en helper operativo

## Tabla: `disco_sua_sumario`

**Grain:** un row = el sumario económico del folio (`05`)

| columna | tipo | nullable | pk/fk | descripción | ejemplo | fuente raw |
|---------|------|----------|-------|-------------|---------|------------|
| registro_patronal | string | no | pk | RP del archivo | 03010513103 | `05[2:13]` |
| periodo | string | no | pk | periodo `YYYYMM` | 202405 | `05[26:32]` |
| folio_sua | string | no | pk | folio SUA | 636440 | `05[32:38]` |
| rfc_patron | string | no | | RFC del patrón | PDO850228KN5 | `05[14:26]` |
| cuota_fija | decimal(14,2) | no | | cuota fija | 172956.75 | `05[59:68]` |
| cuota_excedente | decimal(14,2) | no | | cuota excedente | 44110.66 | `05[68:77]` |
| prestaciones_dinero | decimal(14,2) | no | | prestaciones en dinero | 52099.80 | `05[77:86]` |
| gastos_medicos_pensionados | decimal(14,2) | no | | gastos médicos pensionados | 78149.62 | `05[86:95]` |
| riesgos_trabajo | decimal(14,2) | no | | riesgos de trabajo | 27420.86 | `05[95:104]` |
| invalidez_vida | decimal(14,2) | no | | invalidez y vida | 130249.37 | `05[104:113]` |
| guarderias_prestaciones_sociales | decimal(14,2) | no | | guarderías y prestaciones sociales | 54841.81 | `05[113:122]` |
| subtotal_imss | decimal(14,2) | no | | subtotal IMSS | 559828.87 | `05.tail decode` |
| actualizacion_imss | decimal(14,2) | no | | actualización IMSS | 0.00 | `05.tail decode` |
| recargos_imss | decimal(14,2) | no | | recargos IMSS | 0.00 | `05.tail decode` |
| retiro | decimal(14,2) | no | | retiro | 0.00 | `05.tail decode` |
| cesantia_vejez | decimal(14,2) | no | | cesantía y vejez | 0.00 | `05.tail decode` |
| subtotal_rcv | decimal(14,2) | no | | subtotal RCV | 0.00 | `05.tail decode` |
| actualizacion_rcv | decimal(14,2) | no | | actualización RCV | 0.00 | `05.tail decode` |
| recargos_rcv | decimal(14,2) | no | | recargos RCV | 0.00 | `05.tail decode` |
| aportacion_voluntaria | decimal(14,2) | no | | aportación voluntaria | 0.00 | `05.tail decode` |
| aportacion_patronal_cta_individual | decimal(14,2) | no | | aportación patronal cuenta individual | 0.00 | `05.tail decode` |
| aportacion_patronal_amortizacion | decimal(14,2) | no | | aportación patronal amortización | 0.00 | `05.tail decode` |
| amortizacion | decimal(14,2) | no | | amortización INFONAVIT | 0.00 | `05.tail decode` |
| actualizacion_infonavit | decimal(14,2) | no | | actualización INFONAVIT | 0.00 | `05.tail decode` |
| recargos_infonavit | decimal(14,2) | no | | recargos INFONAVIT | 0.00 | `05.tail decode` |
| aportaciones_complementarias | decimal(14,2) | no | | aportaciones complementarias | 0.00 | `05.tail decode` |
| multas_infonavit | decimal(14,2) | no | | multas INFONAVIT | 0.00 | `05.tail decode` |
| donativo_fundemex | decimal(14,2) | no | | donativo FUNDemex | 0.00 | `05.tail decode` |
| folio_requerimiento | string | sí | | folio de requerimiento cuando exista | null | `05.tail decode` |

### Campos calculados (no vienen directo del raw)

| columna | expresión | depende de | descripción |
|---------|-----------|------------|-------------|
| total_imss_sumario | `subtotal_imss + actualizacion_imss + recargos_imss` | subtotal_imss, actualizacion_imss, recargos_imss | total IMSS que debe empatar contra `disco_sua_validacion.total_imss` |
| total_rcv_sumario | `subtotal_rcv + actualizacion_rcv + recargos_rcv` | subtotal_rcv, actualizacion_rcv, recargos_rcv | total RCV que debe empatar contra `disco_sua_validacion.total_rcv` |
| total_infonavit_sumario | `aportacion_patronal_cta_individual + aportacion_patronal_amortizacion + amortizacion + actualizacion_infonavit + recargos_infonavit + aportaciones_complementarias + multas_infonavit + donativo_fundemex` | columnas INFONAVIT | total INFONAVIT útil para amarre |
| total_a_pagar_sumario | `total_imss_sumario + total_rcv_sumario + total_infonavit_sumario` | total_imss_sumario, total_rcv_sumario, total_infonavit_sumario | total a pagar del folio |

## Tabla: `disco_sua_validacion`

**Grain:** un row = la capa de control del folio (`06`)

| columna | tipo | nullable | pk/fk | descripción | ejemplo | fuente raw |
|---------|------|----------|-------|-------------|---------|------------|
| registro_patronal | string | no | pk | RP del archivo | 03010513103 | `06[2:13]` |
| periodo | string | no | pk | periodo `YYYYMM` | 202405 | `06[26:32]` |
| folio_sua | string | no | pk | folio SUA | 636440 | `06[32:38]` |
| rfc_patron | string | no | | RFC del patrón | PDO850228KN5 | `06[14:26]` |
| suma_tasa_actualizacion_recargos | decimal(16,2) | no | | suma declarada de actualización y recargos | 0.00 | `06[38:53]` |
| bytes_declarados | integer | no | | tamaño físico declarado del archivo | 88795 | `06[53:58]` |
| fecha_limite_pago | date | sí | | fecha límite de pago | 2024-06-17 | `06[58:66]` |
| numero_discos | integer | no | | número de discos del paquete | 1 | `06[66:68]` |
| version_sua | string | no | | versión del layout | W300 | `06[68:72]` |
| total_imss | decimal(14,2) | no | | total IMSS de control | 559828.87 | `06[76:85]` |
| total_rcv | decimal(14,2) | no | | total RCV de control | 0.00 | `06[85:94]` |
| total_aportacion | decimal(14,2) | no | | total aportación INFONAVIT | 0.00 | `06[94:103]` |
| total_amortizacion | decimal(14,2) | no | | total amortización INFONAVIT | 0.00 | `06[103:112]` |

## Relaciones entre tablas internas

- `disco_sua_sumario.(registro_patronal, periodo, folio_sua)` →
  `disco_sua_empresa.(registro_patronal, periodo, folio_sua)` (1:1)
- `disco_sua_validacion.(registro_patronal, periodo, folio_sua)` →
  `disco_sua_empresa.(registro_patronal, periodo, folio_sua)` (1:1)
- `disco_sua_trabajador.(registro_patronal, periodo, folio_sua)` →
  `disco_sua_empresa.(registro_patronal, periodo, folio_sua)` (N:1)
- `disco_sua_movimiento.(registro_patronal, periodo, folio_sua)` →
  `disco_sua_empresa.(registro_patronal, periodo, folio_sua)` (N:1)
- `disco_sua_movimiento.(registro_patronal, periodo, folio_sua, nss)` →
  `disco_sua_trabajador.(registro_patronal, periodo, folio_sua, nss)` por
  llave lógica del trabajador

## Trazabilidad inversa

- `disco_sua_empresa` nace del record `02` y corresponde a la traducción
  `Datos Empresa`
- `disco_sua_trabajador` nace del record `03` y corresponde a la traducción
  `Datos Trabajador`
- `disco_sua_movimiento` nace del record `04` y corresponde a la traducción
  `Datos Movimientos`
- `disco_sua_sumario` nace del record `05` y corresponde a la traducción
  `Datos Sumarios`
- `disco_sua_validacion` nace del record `06` y corresponde a la traducción
  `Datos Validación`
- salidas equivalentes a `PARTE A-D`, `amarre`, `ACREDITADOS`, `ALTAS`,
  `BAJAS` y `MS` son vistas o filtros derivados, no tablas nativas del documento

## JSON Schema (para consumo automático)

```yaml
$schema: "http://json-schema.org/draft-07/schema#"
type: object
properties:
  disco_sua_empresa:
    type: array
    items:
      type: object
      properties:
        registro_patronal: {type: string}
        periodo: {type: string, pattern: "^[0-9]{6}$"}
        folio_sua: {type: string}
      required: [registro_patronal, periodo, folio_sua]
  disco_sua_trabajador:
    type: array
    items:
      type: object
      properties:
        secuencia_trabajador: {type: integer, minimum: 1}
        nss: {type: string}
        numero_movimientos: {type: integer, minimum: 0}
      required: [secuencia_trabajador, registro_patronal, periodo, folio_sua, nss]
  disco_sua_movimiento:
    type: array
    items:
      type: object
      properties:
        record_index: {type: integer, minimum: 1}
        slot_index: {type: integer, minimum: 1, maximum: 7}
        nss: {type: string}
        tipo_movimiento: {type: string}
      required: [record_index, slot_index, registro_patronal, periodo, folio_sua, nss, tipo_movimiento]
  disco_sua_sumario:
    type: array
    items:
      type: object
      properties:
        registro_patronal: {type: string}
        periodo: {type: string, pattern: "^[0-9]{6}$"}
        folio_sua: {type: string}
      required: [registro_patronal, periodo, folio_sua]
  disco_sua_validacion:
    type: array
    items:
      type: object
      properties:
        registro_patronal: {type: string}
        periodo: {type: string, pattern: "^[0-9]{6}$"}
        folio_sua: {type: string}
        version_sua: {type: string}
        bytes_declarados: {type: integer, minimum: 1}
      required: [registro_patronal, periodo, folio_sua, version_sua, bytes_declarados]
required:
  - disco_sua_empresa
  - disco_sua_trabajador
  - disco_sua_movimiento
  - disco_sua_sumario
  - disco_sua_validacion
```

## Notas de implementación

- Este v2 deja de colapsar `02`, `05` y `06` en una sola tabla porque esa
  simplificación ocultaba la relación real entre raw, traducción a Excel y
  salidas derivadas.
- En `disco_sua_sumario`, los siete componentes básicos hasta
  `guarderias_prestaciones_sociales` quedaron validados directo contra el raw;
  la cola posterior del `05` quedó confirmada semánticamente contra
  `Datos Sumarios`, pero no se cerró byte-a-byte en esta corrida.
- La cola `03[208:278]` se preserva explícitamente porque en el set confirmado
  su semántica completa solo puede reconstruirse con seguridad desde la
  traducción a Excel y los helpers operativos; el ejemplo raw validado directo
  es mensual y trae esa cola en cero.
- Si el consumidor necesita una vista consolidada por folio, la vista correcta
  es un join 1:1 de `disco_sua_empresa + disco_sua_sumario + disco_sua_validacion`.
- No se modelaron campos de control tardío del `06` que no alimentan pruebas
  confirmadas en esta corrida.

## Cambios de schema

Este archivo solo se modifica vía el pipeline de propuestas:
1. Una sesión con auditor o una detección automática genera un `PROP`
2. El curador emite `DEC-NNNN`
3. Los cambios aceptados se aplican aquí y se bumpea `version`
4. Si el cambio rompe compatibilidad (eliminar columna, cambiar tipo), se marca
   `breaking_change_of` en frontmatter apuntando a la versión previa

No editar este archivo a mano. Ver [[04 - Change log]] para el histórico.
