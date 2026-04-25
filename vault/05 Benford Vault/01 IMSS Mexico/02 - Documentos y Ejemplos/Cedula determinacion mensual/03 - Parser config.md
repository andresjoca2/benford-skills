---
id: DOC-cedula-determinacion-mensual/parser
type: parser-config
parent_doc: DOC-cedula-determinacion-mensual
parser_kind: pdf-text
encoding: UTF-8
delimiter: null
version: 1
---

# Cédula de Determinación de Cuotas (Mensual) — Parser config

## Método de extracción

El archivo es un PDF de texto nativo (no escaneado). El parser extrae datos desde la **última página del PDF**, que contiene la tabla resumen consolidada de cuotas. Las páginas previas (1 a N-1) contienen detalle por trabajador y son ignoradas deliberadamente.

### Estrategia general

1. **Cargar el PDF** usando una librería de parseo de texto (ej: pypdf, pdfplumber).
2. **Detectar la última página** del documento (índice = total_pages - 1).
3. **Extraer texto completo de la última página**.
4. **Parsear por anclaje de etiquetas** — buscar labels (ej: "Registro Patronal:", "Total a pagar:") y extraer valores adyacentes.
5. **Normalizar y validar** valores extraídos (tipos, rangos, formatos).
6. **Mapear a schema** y retornar un documento JSON/dict con los campos definidos.

### Detalles específicos del formato

#### Sección de identidad del documento (encabezado superior)

Buscar las siguientes etiquetas en la última página:

- **"Registro Patronal:"** → valor será el RP (ej: "G.P.S. I.V. Obr Patronal G62-72790-10-5" o variante)
  - Normalizar: Extraer solo la parte numérica (ej: "G62-72790-10-5"), remover "G.P.S. I.V. Obr Patronal" si lo precede.
- **"Nombre o Razón Social:"** → razón social del patrón.
- **"RFC/CURP"** o **"RFC:"** → identificador fiscal (si aplica).
- **"Domicilio:"** → dirección registrada.
- **"Código Postal:"** → CP.
- **"Entidad:"** → estado/entidad federativa.
- **"Delegación IMSS:" y/o "SubDelegación IMSS:"** → localidad del IMSS responsable.
- **"Actividad:"** → sector económico.
- **"Prima de R.T."** → porcentaje de prima de riesgo (ej: "0.51160%"). Convertir "0.51160%" → 0.51160 (decimal).

#### Sección de período y fechas

Buscar:

- **"Período de Proceso:"** → texto como "Enero-2024" o "January-2024"
  - Convertir a formato "2024-01" (YYYY-MM).
- **"Fecha de Proceso:"** → fecha de emisión (ej: "16/feb./2024")
  - Convertir a formato ISO date "2024-02-16".

#### Sección de líneas de cotización (datos agregados)

Buscar estas etiquetas (pueden estar en formato de tabla o lista):

- **"Total de Cotizantes:"** → número de trabajadores (ej: "292,005.77" o "292")
  - Convertir a número decimal/integer.
- **"Total de Días cotizados"** (o variante similar) → número de días (ej: "13,798")
  - Convertir a integer.
- **"S.M.G.D.F.:"** → Salario Mínimo General Diario Federal (dato de referencia, ej: "575,591.56")
- **"U. M. A.:"** → Unidad de Medida y Actualización (ej: "103.74")

#### Sección de componentes de cuotas (tabla resumen)

Buscar filas con estas etiquetas y sus valores en columna "SUMA" o columna final:

| Etiqueta en PDF | Campo del schema | Notas |
|-----------------|------------------|-------|
| "Cuota Fija" | `cuota_fija` | Importe de la cuota fija patronal. |
| "Excedente Patronal" | `excedente_patronal` | Excedente sobre la cuota fija, parte patronal. |
| "Excedente Obrera" | `excedente_obrero` | Excedente, parte obrera. |
| "Prestaciones en Dinero Patronal" | `prestaciones_dinero_patronal` | Prestaciones en dinero, patronal. |
| "Prestaciones en Dinero Obrera" | `prestaciones_dinero_obrera` | Prestaciones en dinero, obrera. |
| "Gastos Médicos Pensionados Patronal" | `gastos_medicos_pensionados_patronal` | GMP, patronal. |
| "Gastos Médicos Pensionados Obrera" | `gastos_medicos_pensionados_obrera` | GMP, obrera. |
| "Riesgos de Trabajo" | `riesgos_trabajo` | Prima de riesgo de trabajo. |
| "Invalidez y Vida Patronal" | `invalidez_vida_patronal` | I.V., patronal. |
| "Invalidez y Vida Obrera" | `invalidez_vida_obrera` | I.V., obrera. |
| "Guarderias y Prestaciones Sociales" | `guarderias_prestaciones_sociales` | GPS (guarderías). |

Buscar luego:

- **"Total a pagar:"** → suma consolidada de todas las cuotas (debe ser > 0)

## Mapeo raw → schema

| campo raw | columna del schema | transformación |
|-----------|--------------------|----------------|
| "Registro Patronal: ... G62-72790-10-5" | `registro_patronal` | Extraer parte alfanumérica (remover etiquetas de tipo de registro), normalizar removiendo espacios y guiones innecesarios. Formato final: "G62-72790-10-5" (14 caracteres aprox). |
| "Período de Proceso: Enero-2024" | `periodo` | Parsear mes en español/inglés, convertir a "2024-01" (YYYY-MM). |
| "Fecha de Proceso: 16/feb./2024" | `fecha_proceso` | Parsear formato "DD/mes/YYYY", convertir a "2024-02-16" (ISO date). |
| "Nombre o Razón Social: SELIM SA DE CV" | `nombre_razon_social` | Trim + preserve case. |
| "Prima de R.T. 0.51160%" | `prima_riesgo_trabajo` | Remover símbolo "%", convertir a decimal (0-1 scale, ej: 0.51160). |
| "Total de Cotizantes: 292,005.77" | `total_cotizantes` | Remover separador de miles (","), convertir a decimal. |
| "Total de Días cotizados: 13,798" | `total_dias_cotizados` | Remover separador de miles, convertir a integer. |
| Fila "Cuota Fija" → columna SUMA | `cuota_fija` | Remover separadores de miles, convertir a decimal(14,2). |
| (similar para otros componentes) | `excedente_patronal`, etc. | Remover separadores de miles, convertir a decimal(14,2). |
| "Total a pagar: 575,591.56" | `total_a_pagar` | Remover separadores de miles, convertir a decimal(14,2). |

## Transformaciones

- **Período:** Parsing flexible de meses en español (enero, febrero, ..., diciembre) e inglés (January, February, ..., December). Convertir a índice numérico, formatear como "YYYY-MM".
- **Fecha de proceso:** Soportar formatos "DD/mes/YYYY" y "DD-mes-YYYY" (mes en español o inglés).
- **Prima de RT:** Expresada como porcentaje en el PDF (ej: "0.51160%"), convertir a decimal 0-1 (ej: 0.51160).
- **Importes con separador de miles:** Remover "," antes de convertir a número.
- **Registro patronal:** Remover prefijos informativos (ej: "G.P.S. I.V. Obr Patronal"); mantener solo parte numérica/alfanumérica.

## Casos borde del parser

- **PDF sin última página:** Error fatal; bloquear parseo. Requerir documento completo.
- **Última página sin tabla resumen:** Error fatal; documento incompleto o corrupción. Marcar y requerir re-envío.
- **Período no reconocible:** Warning; intentar inferir del nombre de archivo si es disponible. Si no, marcar como "UNKNOWN-PERIOD".
- **Valores de componentes faltantes:** Warning; registrar como 0.00 o null según el campo. Algunos meses pueden no tener todos los componentes.
- **Prima de RT ausente:** Acceptable; registrar como null. No todos los patrones tienen prima de RT.
- **Formato de RP incompleto o malformado:** Warning; registrar como está. Será validado contra SUA en fase de validación.
- **Importes con espacios en lugar de comas:** Aceptar espacios como separadores de miles (variante regional).

## Dependencias / herramientas sugeridas

- **Python:** `pdfplumber` (recomendado para text extraction), `pypdf` (alternativa ligera), `re` (regex para parsing de etiquetas).
- **Versión mínima requerida:** Python 3.8+

### Pseudocódigo de alto nivel

```python
import pdfplumber
import re
from datetime import datetime

def parse_cedula_mensual(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        # Última página
        last_page = pdf.pages[-1]
        text = last_page.extract_text()
        
        # Extraer por anclaje
        data = {}
        
        # Registro Patronal
        rp_match = re.search(r'Registro Patronal:\s*(.+?)(?:\n|RFC)', text)
        if rp_match:
            rp_raw = rp_match.group(1).strip()
            data['registro_patronal'] = normalize_rp(rp_raw)
        
        # Período
        periodo_match = re.search(r'Período de Proceso:\s*(\w+)-(\d{4})', text)
        if periodo_match:
            mes_texto = periodo_match.group(1)
            año = periodo_match.group(2)
            mes_num = parse_mes(mes_texto)
            data['periodo'] = f"{año}-{mes_num:02d}"
        
        # Componentes (por búsqueda de fila + valor asociado)
        components = ['Cuota Fija', 'Excedente Patronal', ...]
        for comp in components:
            comp_match = re.search(rf'{comp}\s+(\d{{1,3}}(?:,\d{{3}})*(?:\.\d{{2}})?)', text)
            if comp_match:
                value_str = comp_match.group(1).replace(',', '')
                data[schema_map[comp]] = float(value_str)
        
        # Total a pagar
        total_match = re.search(r'Total a pagar:\s*(\d{{1,3}}(?:,\d{{3}})*\.\d{{2}})', text)
        if total_match:
            data['total_a_pagar'] = float(total_match.group(1).replace(',', ''))
        
        return data
```

## Validación post-parseo

Después de extraer todos los campos, ejecutar estas validaciones:

1. **Campos requeridos presentes:** `registro_patronal`, `periodo`, `total_a_pagar` no pueden ser null.
2. **Tipos correctos:** Importes deben ser numéricos (>= 0). Período debe coincidir con formato "YYYY-MM".
3. **Suma de componentes ~= total_a_pagar:** Permitir discrepancia <= 0.01 (redondeo).
4. **Prima de RT en rango:** Si presente, 0 <= prima_rt <= 1.
5. **Documentar warnings:** Si prima_rt ausente, si algunos componentes faltantes, etc.

## Versionado del parser

- **v1** (actual): Extrae tabla resumen de última página. Soporta formato IMSS estándar de Cédula de Determinación Mensual (PDF de texto, no escaneado).
- Bump a v2 si: Formato IMSS cambia sustancialmente, se requiere soporte para PDF escaneado (OCR), se añaden nuevos componentes.

No editar este archivo a mano. Cualquier cambio pasa por propuesta formal.
