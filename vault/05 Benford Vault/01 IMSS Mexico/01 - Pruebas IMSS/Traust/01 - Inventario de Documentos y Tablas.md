# 01 - Inventario de Documentos y Tablas

## Propósito
Este documento registra, a nivel metodología, los documentos fuente, las tablas internas y los outputs estructurados que van apareciendo en los procedimientos de `Traust`.

La idea es que no todo ese conocimiento quede enterrado dentro de SOPs aislados.

---

## Cómo usar este documento
Cada vez que se documente un SOP nuevo, revisar si hay que agregar o actualizar alguna fila de este inventario.

Este inventario debe ayudar a responder:
- qué documento entra,
- de dónde viene,
- a qué tabla raw se traduce,
- qué transformación se le aplica,
- qué output produce,
- y si ese output puede reutilizarse en otros procedimientos.

---

## Tabla base de inventario

| Documento / activo | Tipo | Origen de datos | Procedimiento que lo usa o genera | Tabla raw interna | Tabla transformada / intermedia | Output estructurado | Reutilizable | Procedimientos relacionados | Notas |
|---|---|---|---|---|---|---|---|---|---|
| SUA / UAS mensual o bimestral | Documento del cliente | Cliente | `acumsua` (por confirmar alcance exacto) | Pendiente | Pendiente | Pendiente | Sí, probablemente | `acumsua` y procedimientos posteriores ligados a cuotas/remuneraciones | Caso ejemplo mencionado para la metodología; requiere aterrizaje fino cuando se documente el SOP |

---

## Reglas de clasificación
### Tipo
Usar, cuando aplique:
- documento del cliente,
- documento generado por el auditor,
- documento derivado de otro procedimiento,
- tabla raw interna,
- tabla transformada,
- output estructurado.

### Reutilizable
Usar:
- `Sí`
- `No`
- `Posible`
- `Pendiente`

---

## Criterio mínimo por registro
Intentar capturar, como mínimo:
- nombre del documento o activo,
- si viene del cliente o del auditor,
- qué procedimiento lo toca,
- cómo se traduce a tabla,
- y si puede alimentar otros procedimientos.

---

## Pendientes actuales
- aclarar cuáles carpetas de `Traust` son pruebas formales y cuáles procedimientos/transversales,
- poblar este inventario con los primeros casos reales,
- homogeneizar naming de tablas internas cuando empiecen a documentarse de forma consistente.
