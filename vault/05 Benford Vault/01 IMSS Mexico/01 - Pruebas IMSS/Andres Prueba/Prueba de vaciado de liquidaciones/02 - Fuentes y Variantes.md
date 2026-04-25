# 02 - Fuentes y Variantes

## Fuente principal levantada
- Auditor de la metodología `Andres Prueba` en sesión de levantamiento operativo para la **Prueba de vaciado de liquidaciones**.

## Nombre operativo de la prueba
- Prueba de vaciado de liquidaciones

## Documentos obligatorios siempre
- Disco de pago SUA (`.sua`)
- Cédula de determinación mensual (PDF)
- Cédula de determinación bimestral (PDF)
- Comprobantes bancarios de pago SUA
- Emisión IDSE (EMA / EBA)
- Workbook de amarre

## Documentos obligatorios según el caso
- Declaración anual de prima de riesgo de trabajo, cuando existe y es utilizable
- Alta del seguro de riesgos de trabajo, cuando es primer año del cliente o del RP, o cuando no existe declaración utilizable
- Tarjeta de Identificación Patronal, en ese mismo escenario de primer año / alta

## Workbook de trabajo
`5.1 - Vaciado de liquidaciones - amarre.xlsx`

## Hojas esenciales del workbook
- `PARTE A`  → identificación general
- `PARTE B`  → días
- `PARTE D`  → bloque económico
- `amarre`   → consolidación y validación por folio

## Hoja mencionada pero no entendida aún
- `PARTE C` aparece poblada por la macro, pero su contenido y uso no quedaron documentados.

## Lógica observada de la prueba
- El flujo arranca con el `.sua`.
- La macro distribuye la información en varias hojas del workbook.
- La validación inicial ocurre antes de abrir otros documentos.
- La hoja `amarre` es la hoja central de trabajo.
- El comprobante bancario no se localiza por folio SUA, sino por **RP + periodo + Total a Pagar**.
- Las diferencias entre RT, EMA y AUD se dejan visibles como hallazgo, no se corrigen en automático.

## Variantes / bifurcaciones levantadas
### Pago complementario
Aparece un folio adicional para el mismo RP y periodo. Se abre fila nueva. No se mezcla con la fila original.

### Pago extemporáneo
La fila sigue amarrada al periodo liquidado, no al mes en que se pagó.

### Pago en partes
Se requieren todos los comprobantes para cerrar la fila.

### Primer año del cliente o del RP
Si no hay Declaración anual utilizable, entran el Alta del seguro de riesgos de trabajo y la Tarjeta de Identificación Patronal.

### Varios registros patronales
Cada RP organiza su propio set documental y sus propias filas.

### Faltan comprobantes o soportes
El amarre técnico puede avanzar, pero la fila no se cierra.

### Diferencias RT / EMA / AUD
No impiden necesariamente cerrar la fila técnicamente. Se dejan visibles como hallazgo.

## Lectura actual
La prueba no es solo un vaciado de importes. Es un procedimiento de reconstrucción de pago por folio con doble capa:
- cierre técnico del amarre
- y preparación de salida formal hacia **Cuotas pagadas al Instituto**

## Pendientes
- Confirmar el uso de `PARTE C`.
- Confirmar si existe variante adicional cuando un comprobante trae referencias insuficientes para identificar claramente RP y periodo.
