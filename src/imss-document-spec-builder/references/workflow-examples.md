# Decisiones de diseño en fichados previos

Ejemplos reales de cómo se resolvieron ambigüedades al fichar documentos. Útil como referencia de qué tipo de criterio aplicar en casos similares.

## Caso 1: Comprobante bancario de pago SUA

### Situación
Dos SOPs describían el mismo documento con distinto nivel de criticidad. Había ejemplos de 2 bancos distintos (Santander y Citibanamex) con layouts muy diferentes pero campos similares.

### Decisiones clave

**Primary key del schema = `linea_captura`** (no folio SUA)
Razón: el folio SUA no siempre viene en el comprobante, pero la línea de captura sí es universal y es el identificador único del pago ante el IMSS. Eso también resuelve limpio el caso de pagos complementarios.

**Schema con una sola tabla**
El grain es plano (un comprobante = un row), no tiene sentido normalizar más.

**`banco` como catálogo abierto, no enum cerrado**
El comprobante puede venir de cualquier banco autorizado. Cerrar el enum rompería parseo al aparecer uno nuevo.

**Parser por anclas de texto, no por coordenadas**
Layouts completamente distintos entre bancos pero las etiquetas de campo son similares. Anclas mucho más robustas.

**Qué NO incluir** (decisión conjunta con el usuario):
- Número de operación, medio de presentación, usuario, cuenta de cargo → no alimentan pruebas
- Qué SÍ incluir explícitamente aunque no alimenta cálculo directo: `banco` y `linea_captura` (por utilidad de trazabilidad e identificación)

## Caso 2: Emisión IDSE (EMA + EBA)

### Situación
Los SOPs mencionaban "EMA/EBA" como un paquete. Los archivos físicos del portal IDSE contienen ambas secciones cuando el mes cierra bimestre, y solo EMA en los demás meses.

### Decisiones clave

**Primera iteración: un solo DOC con 3 tablas internas.**
Razón inicial: es el mismo .xls descargado juntos, separarlos duplicaría metadata.

**Iteración corregida: dos DOCs separados (`DOC-emision-ema` y `DOC-emision-eba`).**
Razón: el parser es distinto (set de columnas distinto, distintas anclas), la periodicidad es distinta (mensual vs bimestral), y las pruebas los consumen de forma distinta. El acoplamiento por "archivo físico" era falso — lo que importa es la **lógica de extracción sobre un input**, no si el input está junto a otro.

**Cómo manejan el archivo físico compartido:**
Cada parser es autosuficiente. Cuando un archivo bimestral llega, el sistema corre los dos parsers sobre el mismo archivo y cada uno extrae solo su sección, ignorando el resto. Documentado como EC-EMA-001 y EC-EBA-001.

**EBA lee RP y periodo de la sección IMSS del resumen.**
Porque la sección RCV no los repite. Esa decisión (cross-section read) quedó documentada explícitamente en el Parser config de EBA.

**EBA es `mandatory_level: conditional`**; EMA es `mandatory`.
Porque EBA solo aplica cuando el mes cierra bimestre.

**Anotaciones del auditor ignoradas.**
Algunos ejemplos tenían columnas extra (`sua`, `dif`, `ausencia`, `incapacidad`) y columnas de resumen agregadas. El parser canónico lee solo las primeras N columnas por posición y punto. Documentado como EC.

**NSS como string, no integer.**
Puede empezar con ceros (ej: `02169003486`), convertir a número los rompe.

**`prima_riesgo_trabajo` con `decimal(10,5)`** mientras el resto usa `decimal(14,2)`.
Porque la prima viene con 5 posiciones (ej: `0.57474`).

**`valor_descuento` (INFONAVIT) se preserva como string, no decimal.**
Viene con coma de miles (ej: `"5,706.91"`) y su semántica depende de `tipo_descuento` — puede ser factor, porcentaje o monto. Preservarlo literal es más seguro.

## Patrones generales aprendidos

### Cuándo separar en múltiples DOCs vs unir

- **Separa** si: parsers distintos, periodicidades distintas, lógicas de negocio distintas, pueden existir uno sin el otro.
- **Une** si: es genuinamente un único documento con variantes menores (ej: comprobantes de distintos bancos que tienen el mismo propósito y campos similares).

La pregunta clave: **¿el parser y el schema son sustancialmente distintos?** Si sí, separar.

### Qué hacer con información que varía entre SOPs

- Si es variación de **uso** (unos la consumen, otros no): redactar en general sin atribuir.
- Si es variación de **interpretación** (unos dicen A, otros dicen B): documentar como caso límite con ambos escenarios, sin atribuir.
- Si es variación de **criticidad**: decir que "depende del flujo".

### Cómo identificar anotaciones del auditor

Comparar múltiples ejemplos del mismo documento. Las columnas/marcas que aparecen en unos y no en otros, especialmente si tienen nombres abreviados/informales o contenido derivado de otros documentos, son del auditor.

### Campos "bonitos" vs campos útiles

Regla: ¿se usa este campo en algún amarre, cálculo, validación o cruce? Si la respuesta es no, fuera. Excepción: campos de identificación/trazabilidad (RP, folio, línea de captura) siempre entran.
