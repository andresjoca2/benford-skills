# Los 4 Principios del Fichado

Estos principios son innegociables. Cada documento generado debe respetarlos siempre.

## 1. No personalizar por auditor

El documento canónico es neutral. Distintos auditores usan los documentos de formas distintas y los SOPs reflejan eso, pero en los archivos generados **nunca se menciona a un auditor por nombre ni se presenta una metodología como "la correcta"**.

### Cómo aplicarlo

- Si dos SOPs describen usos distintos del mismo documento, redacta diciendo "el uso puede variar según el flujo" o "dependiendo de la metodología aplicada".
- No escribas frases como "Rubén usa este documento para...", "en la metodología de Josefina...", "Según auditor X...".
- Si los SOPs tienen conflicto real en una regla, prefiere la redacción más general que no endose ninguna metodología. Si la diferencia es crítica, documéntala como caso límite (EC) describiendo los dos escenarios sin atribuir a personas.

### Ejemplo

❌ Mal:
> "Rubén exige que el comprobante cuadre exactamente; Josefina permite avanzar sin él."

✅ Bien:
> "El nivel de criticidad del comprobante depende del flujo de uso. En flujos donde el amarre se construye contra el comprobante, sin este documento la fila no puede cerrarse; en flujos donde el amarre es contable-operativo, su ausencia debilita la trazabilidad sin bloquear la prueba."

## 2. Solo info que alimenta pruebas

El schema, el parser y las reglas de validación solo deben contener **información que efectivamente se consume** en algún amarre, cálculo, validación o cruce entre documentos. No incluyas campos por completitud o porque "se ven en el documento".

### Cómo aplicarlo

- Revisa los SOPs para identificar qué datos específicos se extraen del documento y se usan en papeles de trabajo, reportes o pruebas.
- Si un campo aparece en el documento pero los SOPs no lo mencionan nunca, probablemente no lo necesitamos.
- Si el usuario pide explícitamente conservar un campo que no alimenta pruebas (ej: "guarda el banco por si acaso"), hacerlo.
- Los campos que sirven para **identificación o trazabilidad** sí cuentan como "alimentan pruebas" (ej: número de folio, línea de captura, RP, periodo).

### Ejemplo

Para un comprobante bancario SUA, los campos típicos son muchos (número de operación, medio de presentación, usuario, cuenta de cargo, etc.). Pero solo estos alimentan las pruebas:
- RP, periodo, folio SUA, importe total, importes desglosados, fecha de pago, línea de captura, banco

El resto queda fuera a menos que el usuario indique lo contrario.

## 3. Razonar con criterio propio sin inventar

Puedes y debes aplicar criterio de redacción y diseño:

- **Spec**: redacta con tus palabras, conecta ideas, explica riesgos, infiere relaciones entre documentos. Pero los datos factuales (qué campos tiene, qué reglas aplica, qué pruebas bloquea) salen de los SOPs o ejemplos.
- **Schema**: diseña el modelo de datos con criterio de arquitecto. Decide grain, PKs, FKs, nullables, tipos, campos calculados. Los SOPs no te dictan el schema, tú lo modelas.
- **Parser config**: decide la estrategia de parseo (anclas vs posiciones, detección de variantes, transformaciones). Los SOPs no te dictan el parser, tú lo diseñas.

### Qué NO inventes

- Reglas de negocio específicas que no están en los SOPs
- Valores, códigos, o catálogos que no viste en ejemplos reales
- Referencias normativas (Ley X, Art. Y) que no están citadas explícitamente
- Comportamientos de bancos/formatos que no observaste

Si no sabes algo, márcalo como pendiente. Es preferible a inventar.

## 4. Ignorar anotaciones de auditor en archivos raw

Los ejemplos reales del documento frecuentemente son **papeles de trabajo** que el auditor ya anotó: columnas agregadas, comparativos, fórmulas adicionales, filas con comentarios. Esto **no es parte del documento canónico**.

### Cómo aplicarlo

- Cuando inspecciones un ejemplo, distingue entre el contenido que viene del emisor oficial (IMSS, banco, portal IDSE) y el que agregó el auditor.
- Señales típicas de anotaciones del auditor:
  - Columnas al final con nombres como `sua`, `dif`, `ausencia`, `incapacidad`
  - Columnas comparativas con valores calculados contra otro documento
  - Fórmulas de Excel en hojas que deberían ser solo datos
  - Celdas coloreadas, notas al margen
- El parser canónico **lee solo las columnas del formato oficial**, ignorando las agregadas.
- Documenta el fenómeno como un caso límite (EC) para que quede claro que el parser está deliberadamente ignorando ese contenido.

### Ejemplo

En archivos de emisión IDSE, algunos ejemplos venían con columnas extra (`sua`, `dif`, `ausencia`, `incapacidad`) al final de la hoja de movimientos EMA. Esas columnas no existen en el archivo original del portal IDSE — son del papel de trabajo. El parser canónico lee las primeras 19 columnas y punto.

Si todos los ejemplos tuvieran esas columnas, podría ser confuso pensar que son parte del documento. La forma de detectar que son del auditor es: (a) inconsistencia entre ejemplos, (b) nombres informales/abreviados, (c) contenido que depende de otro documento (ej: diferencias calculadas contra SUA).
