---
id: DOC-cedula_determinacion_bimestral/parser
type: parser-config
parent_doc: DOC-cedula_determinacion_bimestral
parser_kind: pdf-text
encoding: UTF-8
delimiter: null
version: 1
---

# Cédula de Determinación Bimestral — Parser config

## Método de extracción

El parser extrae información de un PDF nativo generado por el IMSS. El documento contiene encabezado descriptivo (págs 1-N) y un resumen consolidado en las últimas página(s). El parser enfoca exclusivamente en la **última página** donde se consolidan los totales principales (Total a Pagar RCV, Total a Pagar INFONAVIT, amortizaciones, Total Consolidado).

### Estrategia general

1. **Localizar la última página** del PDF (usar pdfinfo o equivalente para obtener page count).
2. **Extraer text** de la última página preservando layout de líneas.
3. **Usar anclas de texto** para encontrar campos clave:
   - Encabezado: "Registro Patronal:", "RFC:", "Bimestre de Proceso:", "Fecha de Proceso:", etc.
   - Resumen: "Total de Cotizantes:", "Total a Pagar de RCV", "Aportación Patronal S/Crédito:", "Aportación Patronal C/Crédito:", "Total a Pagar de INFONAVIT", "Amortización", "Total a Pagar RCV e INFONAVIT".
4. **Parsear valores** inmediatamente después de anclas usando regex para capturar números decimales.
5. **Validar coherencia** aritmética (suma de componentes = total consolidado).

### Detalles específicos del formato

#### Parser_kind: pdf-text

- **Páginas relevantes:** Última página del PDF (donde se consolida el resumen).
- **Método de extracción:**
  - **Campos de encabezado** (RP, RFC, periodo, fecha, delegación): Búsqueda lineal de ancla de texto en encabezado del documento (primeras páginas típicamente).
  - **Campos de resumen** (totales RCV, INFONAVIT, etc.): Búsqueda de anclas en texto de última página.
  - **Valores numéricos:** Regex para capturar números con posibles comas/puntos de separadores de miles.

**Anclas específicas y patrones:**

| Campo | Ancla de búsqueda | Patrón regex para valor |
|-------|-------------------|------------------------|
| registro_patronal | "Registro Patronal:" | `[A-Z0-9]+-\d+-\d+-\d+` |
| rfc | "RFC:" | `[A-Z0-9]{10,13}` |
| periodo_bimestral | "Bimestre de Proceso:" | `[A-Za-z]+-\d{4}` |
| fecha_proceso | "Fecha de Proceso:" | `\d{2}/\w+/\d{4}` (convertir a YYYY-MM-DD) |
| delegacion_imss | "Delegación IMSS:" | `[A-Z]+ \d+` |
| subdelegacion_imss | "Subdelegación IMSS:" | `.+` (capturar hasta fin de línea) |
| actividad_economica | "Actividad:" | `.+` (capturar hasta fin de línea) |
| area_geografica | "Area Geográfica:" | `[A-Z]` |
| total_cotizantes | "Total de Cotizantes:" | `\d+(?:,\d+)*` |
| total_acreditados | "Total de Acreditados:" | `\d+(?:,,\d+)*` |
| total_a_pagar_rcv | "Total a Pagar de RCV" | `[\d,.]+` (después de ancla) |
| aportacion_infonavit_sin_credito | "Aportación Patronal S/Crédito:" | `[\d,.]+` |
| aportacion_infonavit_con_credito | "Aportación Patronal C/Crédito:" | `[\d,.]+` |
| amortizacion_creditos_vivienda | "Amortización" + "AMORTIZACION DE CREDITOS" | `[\d,.]+` (valor de amortización total) |
| total_a_pagar_infonavit | "Total a Pagar de INFONAVIT" | `[\d,.]+` |
| fundemex | "FUNDEMEX" | `[\d,.]+` |
| total_a_pagar_consolidado | "Total a Pagar RCV e INFONAVIT" O suma manual | `[\d,.]+` |
| una_umk | "Unidad de Medida y Actualización:" | `[\d.]+` |
| salario_minimo_df | "Salario Mínimo del D.F.:" | `[\d.]+` |
| factor_descuento | "Factor de Descuento" | `[\d.]+` |

---

## Mapeo raw → schema

| campo raw | columna del schema | transformación |
|-----------|-------------------|----------------|
| texto_registro_patronal | `registro_patronal` | trim + uppercase |
| texto_rfc | `rfc` | trim + uppercase |
| texto_periodo | `periodo_bimestral` | trim + normalizar formato MMM-YYYY |
| texto_fecha | `fecha_proceso` | parsear "DD/MMM/YYYY" → "YYYY-MM-DD" |
| texto_delegacion | `delegacion_imss` | trim |
| texto_subdelegacion | `subdelegacion_imss` | trim |
| texto_actividad | `actividad_economica` | trim |
| texto_area | `area_geografica` | trim + uppercase |
| texto_cotizantes | `total_cotizantes` | remover separadores miles (,) → int |
| texto_acreditados | `total_acreditados` | remover separadores miles (,) → int |
| texto_retiro_patronal | `retiro_patronal` | remover comas miles, convertir a decimal(14,2) |
| texto_retiro_obrero | `retiro_obrero` | remover comas miles, convertir a decimal(14,2) |
| texto_cv_patronal | `cesantia_vejez_patronal` | remover comas miles, convertir a decimal(14,2) |
| texto_cv_obrera | `cesantia_vejez_obrera` | remover comas miles, convertir a decimal(14,2) |
| texto_rcv_total | `total_a_pagar_rcv` | remover comas miles, convertir a decimal(14,2) |
| texto_aport_sin_credito | `aportacion_infonavit_sin_credito` | remover comas miles, convertir a decimal(14,2) |
| texto_aport_con_credito | `aportacion_infonavit_con_credito` | remover comas miles, convertir a decimal(14,2) |
| texto_amortizacion | `amortizacion_creditos_vivienda` | remover comas miles, convertir a decimal(14,2) |
| texto_infonavit_total | `total_a_pagar_infonavit` | remover comas miles, convertir a decimal(14,2) |
| texto_fundemex | `fundemex` | remover comas miles, convertir a decimal(14,2) |
| texto_total_consolidado | `total_a_pagar_consolidado` | remover comas miles, convertir a decimal(14,2) |
| texto_uma | `una_umk` | parsear decimal |
| texto_salario_minimo | `salario_minimo_df` | parsear decimal |
| texto_factor_descuento | `factor_descuento` | parsear decimal |

---

## Transformaciones

- **Separadores de miles:** El PDF usa comas (,) para separar miles. El parser debe removerlas antes de convertir a número.
- **Fechas:** Formato "DD/MMM/YYYY" (ej: "07/mar./2024") debe convertirse a "YYYY-MM-DD" (2024-03-07). Mapear nombres españoles de meses a números.
- **Período:** Preservar exactamente como aparece (ej: "Febrero-2024") pero normalizar a "Feb-2024" en schema.
- **Campos de texto:** Todos los strings deben recibir `trim()` para eliminar espacios iníciales/finales.
- **Valores decimales:** Usar `Decimal` en Python o tipo nativo que preserve precisión; no usar float.

---

## Casos borde del parser

- **Período irregular (liquidación final):** El campo "Bimestre de Proceso:" puede contener un período no estándar (ej: "Enero-Febrero-2024" en lugar de "Feb-2024"). El parser debe detectar esto y setear `es_liquidacion = true`.
- **Cero cotizantes con INFONAVIT:** Si `total_cotizantes = 0` pero `total_a_pagar_infonavit > 0`, esto es válido (crédito antiguo en amortización). El parser debe permitirlo.
- **Amortización sin aportación nueva:** Si `amortizacion_creditos_vivienda > 0` pero `aportacion_infonavit_con_credito = 0`, es válido (retención de crédito antiguo). No lanzar error.
- **Páginas faltantes:** Si el PDF tiene < 1 página, abortar con error claro.
- **Anclas ausentes:** Si no se encuentra una ancla crítica (ej: "Registro Patronal:"), lanzar warning y marcar el campo como null.

---

## Dependencias / herramientas sugeridas

- Python: `pdfplumber` >= 0.9.0 (extracción de texto preservando layout)
- Python: `re` (búsqueda de patrones y captura de valores numéricos)
- Python: `dateutil.parser` (parsing flexible de fechas en español)
- Python: `decimal.Decimal` (aritmética decimal precisa)
- Versión mínima requerida: Python 3.8+

---

## Validación post-parseo

Antes de entregar el resultado del parser, ejecutar estas reglas:

- `registro_patronal != null` AND regex match XX-XXXXX-XX-X
- `periodo_bimestral != null`
- `total_a_pagar_rcv >= 0` (no negativo)
- `total_a_pagar_infonavit >= 0` (no negativo)
- `abs((total_a_pagar_rcv + total_a_pagar_infonavit + amortizacion_creditos_vivienda + fundemex) - total_a_pagar_consolidado) < 0.01` (suma aritmética válida)
- Si `es_liquidacion = true`, permitir período irregular; si no, validar contra lista de bimestres estándar.

Si alguna validación falla, retornar con `status: invalid` y lista de errores.

---

## Versionado del parser

No editar este archivo a mano. Cualquier cambio pasa por PROP.

Versión actual: 1.0
- Soporte para PDF nativo del IMSS (última página)
- Extracción de campos de encabezado y resumen
- Manejo de períodos regulares e irregulares
- Validación post-parseo con tolerancia de redondeo
