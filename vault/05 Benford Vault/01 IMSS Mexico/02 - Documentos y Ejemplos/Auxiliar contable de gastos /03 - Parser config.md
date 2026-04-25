---
id: DOC-balanza-auxiliar-gastos/parser
type: parser-config
parent_doc: DOC-balanza-auxiliar-gastos
parser_kind: excel
encoding: null
delimiter: null
version: 1
---

# Auxiliar contable de gastos — Parser config

## Método de extracción

El auxiliar viene en formatos muy variables según el sistema contable del patrón. El parser canónico abstrae esa variabilidad con tres capas:

1. **Detección de formato:** inspecciona encabezados, hojas y topología para inferir cómo leer el archivo.
2. **Mapeo de columnas:** resuelve los encabezados raw a columnas canónicas mediante un diccionario de aliases.
3. **Resolución de cuenta:** determina la identidad de la cuenta de cada movimiento usando la estrategia más fuerte disponible, cayendo a metadato externo cuando el archivo no trae la cuenta.

El parser emite los registros al schema definido en `02 - Schema`, siempre etiquetando la `fuente_cuenta` para trazabilidad.

### Estrategia general

1. Abrir el archivo y listar hojas. Identificar cuáles contienen movimientos contables y cuáles son auxiliares del auditor (catálogos, notas).
2. En cada hoja candidata, localizar la fila de encabezados: primera fila que matchea al menos tres encabezados canónicos mediante el diccionario de aliases.
3. Aplicar el mapeo de columnas. Encabezados no reconocidos se registran pero no se mapean.
4. Detectar la topología del export usando los indicadores observables descritos abajo.
5. Determinar la estrategia de resolución de cuenta (jerarquía descrita abajo).
6. Iterar renglones, clasificándolos y procesándolos según la topología detectada.
7. Aplicar transformaciones canónicas a cada movimiento válido.
8. Emitir los registros a `auxiliar_movimientos` y, cuando aplique, a `auxiliar_saldos_cuenta`.

### Detección de topología

El parser clasifica el archivo en una de estas topologías, que no son mutuamente excluyentes pero sí ordenadas por especificidad:

- **Aplanada con cuenta por renglón** (EC-BAG-005): existe una columna mapeable a `numero_cuenta` que está poblada en todos o casi todos los renglones de detalle. Ninguna fila separadora.
- **Agrupada con headers por cuenta** (EC-BAG-003): existen filas donde la fecha está vacía y el campo descriptivo contiene el número/nombre de cuenta, seguidas de renglones de detalle, seguidas de una fila de "Totales" o similar. La cuenta se propaga verticalmente.
- **Agrupada por subcuenta sin identidad** (EC-BAG-004): existen filas separadoras ("Saldo Inicial" / "Total SubCuenta" o equivalentes) pero no hay headers con identidad. Los bloques existen pero no se distinguen.
- **Sin estructura de cuenta** (EC-BAG-002): no hay columna de cuenta ni filas separadoras identificables. El archivo es una lista plana de movimientos de una cuenta implícita.

### Resolución de cuenta

El parser aplica la siguiente jerarquía por cada movimiento, en orden. La primera estrategia que resuelve gana y se registra como `fuente_cuenta`:

1. **`columna`:** el renglón tiene valor propio en una columna mapeada a `numero_cuenta`.
2. **`header`:** existe una fila header previa cuyo valor se propaga al movimiento.
3. **`nombre_hoja`:** el nombre de la hoja contiene un patrón parseable como número de cuenta (ej. "Cta 1100-001 Bancos").
4. **`nombre_archivo`:** el nombre del archivo contiene un patrón parseable como número de cuenta.
5. **`metadato_externo`:** la cuenta se proporcionó explícitamente como parámetro en la ingestión.

Si ninguna estrategia aplica, el parser falla con error. El output post-parseo siempre tiene `numero_cuenta` poblado para cumplir VR-BAG-001.

## Mapeo raw → schema

El parser mantiene un diccionario de aliases case-insensitive, tolerante a acentos y pluralización. La configuración puede extenderse sin cambio de schema cuando aparecen sistemas nuevos.

| campo raw (ejemplos de alias observados o esperables) | columna del schema | transformación |
|-------------------------------------------------------|--------------------|----------------|
| `No. Cuenta`, `Número de cuenta`, `Cuenta`, `Cta`, `ctacompleta`, `Código` | `auxiliar_movimientos.numero_cuenta` | trim; preservar como string |
| `Nombre de la cuenta`, `Nombre`, `Descripción de cuenta`, `Denominación`, `nombre` | `auxiliar_movimientos.nombre_cuenta` | trim |
| `Fecha`, `Fecha contable`, `Fec.`, `Fecha póliza` | `auxiliar_movimientos.fecha` | parse a datetime ISO 8601 |
| `Poliza`, `Póliza`, `No. Póliza`, `folio`, `Documento`, `Doc.` | `auxiliar_movimientos.poliza` | trim; preservar como string |
| `tipo_poliza`, `Tipo`, `Tipo Póliza`, `TP` | `auxiliar_movimientos.tipo_poliza` | trim |
| `Concepto`, `concepto`, `Texto`, `Descripción`, `Detalle` | `auxiliar_movimientos.concepto` | trim |
| `Descripcion`, `Descripción` (como segunda columna), `Detalle adicional`, `Observación`, `Texto cabecera` | `auxiliar_movimientos.descripcion` | trim |
| `referencia`, `Referencia`, `Ref`, `Documento de referencia`, `Folio alterno` | `auxiliar_movimientos.referencia` | trim |
| `Empresa`, `Sociedad`, `RFC`, `Organización` | `auxiliar_movimientos.empresa` | trim |
| `Cargos`, `Cargo`, `Debe`, `Débitos` | `auxiliar_movimientos.cargo` | parse decimal; normalizar signo |
| `Abonos`, `Abono`, `Haber`, `Créditos` | `auxiliar_movimientos.abono` | parse decimal; normalizar signo |
| `Saldo Mes`, `Saldo Final`, `Saldo`, `Saldo acumulado` | `auxiliar_movimientos.saldo_corrido` | parse decimal |
| `Saldo Inicial` (en fila especial) | `auxiliar_saldos_cuenta.saldo_inicial` | parse decimal, emitir a la tabla de saldos |

El diccionario es extensible. Encabezados no reconocidos se loggean y el parseo continúa sin ese campo.

## Transformaciones

- `numero_cuenta`, `poliza`, `referencia`, `tipo_poliza`: `trim()`. Preservar como string.
- `fecha`: parsear con tolerancia a formatos múltiples (ISO, `DD/MM/YYYY`, `MM/DD/YYYY`, serial de Excel, datetime nativo de Excel). Si el archivo usa `DD/MM` vs `MM/DD` ambiguo, inferir por el rango del ejercicio auditado.
- `cargo` y `abono`:
  - Dos columnas separadas, valores positivos: pasan directo.
  - Dos columnas separadas, abono negativo: aplicar valor absoluto al abono.
  - Una sola columna `Importe` con signo: derivar `cargo = max(importe, 0)` y `abono = max(-importe, 0)`.
- `concepto`, `descripcion`, `nombre_cuenta`: `trim()`.
- `empresa`: `trim()`; null si no existe la columna.
- `orden_en_export`: asignado por el parser como entero creciente a partir de 1, solo sobre los renglones clasificados como movimientos válidos (headers, totales y blancos excluidos).
- `fuente_cuenta`: registrada por la capa de resolución de cuenta.

## Reglas de clasificación de renglones

Para cualquier topología agrupada, cada fila se clasifica en uno de estos tipos antes de decidir qué hacer con ella:

- **header de cuenta:** fecha vacía o trivial, importes vacíos o en cero, y campo descriptivo contiene número o nombre de cuenta. Acción: actualizar el estado de cuenta vigente; puede emitir a `auxiliar_saldos_cuenta` si trae saldo inicial.
- **separador sin identidad:** concepto contiene texto fijo tipo "Saldo Inicial" (en cero) o "Total SubCuenta" sin identificador de cuenta. Acción: delimitar bloque interno pero no modificar la cuenta vigente; puede emitir a saldos si la fila trae totales con valor.
- **total de cuenta:** concepto contiene "Totales" / "Total Cuenta" / "Total SubCuenta" con valores en cargos/abonos. Acción: no emitir a movimientos; emitir a `auxiliar_saldos_cuenta` si se está agregando a nivel de cuenta.
- **fila en blanco:** todas las columnas relevantes vacías. Acción: ignorar.
- **movimiento:** tiene fecha válida y póliza, y al menos uno entre cargo/abono con valor. Acción: resolver cuenta según la jerarquía de resolución, mapear columnas, aplicar transformaciones y emitir a `auxiliar_movimientos`.

## Casos borde del parser

- **EC-BAG-001 — anotaciones del auditor:** ignorar hojas que no contengan movimientos (catálogos, notas) y columnas al final con nombres no canónicos. El parser canónico lee solo columnas del diccionario y hojas que pasan la detección de topología.
- **Fórmulas en celdas:** si una celda es fórmula, se evalúa y se usa su resultado. Resultados de error (`#N/A`, `#REF!`, `#VALUE!`) se tratan como null. Esto típicamente señala anotaciones del auditor (columnas agregadas).
- **Propagación de cuenta en estructura agrupada:** iteración estrictamente ordenada. Cada header actualiza el estado; cada separador sin identidad delimita bloque pero no cambia estado.
- **Cuentas sin movimientos:** bloques con saldo inicial en cero y sin detalle son válidos; se pueden emitir a saldos y no generan nada en movimientos.
- **Reinyección de encabezados:** algunos exports reinsertan la fila de encabezados cada N renglones simulando paginación. El parser los detecta por coincidencia exacta y los descarta.
- **Fechas con datetime nativo de Excel:** manejadas directamente; preservar hora si existe.
- **Fechas con formato ambiguo DD/MM vs MM/DD:** inspeccionar el primer centenar de fechas para inferir patrón; elevar error si hay inconsistencia.
- **Celdas con texto en columnas numéricas:** intentar coerción; si falla, tratar como null y delegar a VR-BAG-004/005.
- **Exports multi-empresa:** preservar `empresa` por movimiento. Downstream filtra si requiere amarre por RFC específico.
- **EC-BAG-008 encabezados engañosos:** cuando un encabezado sugiere un significado que no corresponde con el contenido (ej. una columna nombrada como si fuera área pero contiene texto libre de referencia), no mapear al campo sugerido. Evaluar si concatenarlo al campo de descripción aporta valor; si no, ignorarlo.
- **Validación de cuenta externa:** si la cuenta vino por metadato externo (`fuente_cuenta: metadato_externo` o `nombre_archivo`), el parser emite un warning para que la ingestión confirme manualmente.

## Dependencias / herramientas sugeridas

- Python: `openpyxl` para `.xlsx`, `xlrd` (≤ 1.2.0) para `.xls` antiguos, `pandas` para manipulación tabular y CSV.
- Versión mínima Python: 3.10.

## Validación post-parseo

- VR-BAG-001 a VR-BAG-005 definidas en `01 - Spec`. El parser no las aplica; las emite como input a la capa de validación.
- Reconciliación parser: si al final del parseo algún movimiento no tiene `numero_cuenta` o `fuente_cuenta` asignada, elevar error (indica fallo de la jerarquía de resolución o bug del parser).

## Versionado del parser

La versión incrementa cuando:

- Se agrega una nueva topología detectable.
- Se agrega un nuevo alias en el diccionario de encabezados que altere la resolución en casos previos.
- Cambia la jerarquía de resolución de cuenta.
- Se agrega un nuevo campo canónico al schema y se mapea desde raw.

No editar este archivo a mano. Cualquier cambio pasa por PROP.
