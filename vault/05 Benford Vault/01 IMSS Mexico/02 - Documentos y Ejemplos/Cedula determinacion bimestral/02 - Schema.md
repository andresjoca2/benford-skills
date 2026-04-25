---
id: DOC-cedula_determinacion_bimestral/schema
type: doc-schema
parent_doc: DOC-cedula_determinacion_bimestral
format: tabular
grain: "Un row = resumen consolidado de cuotas RCV e INFONAVIT para un registro patronal en un bimestre"
tables:
  - cedula_resumen_bimestral
version: 2
breaking_change_of: 1
---

# Cédula de Determinación Bimestral — Schema

## Grain

Un row = resumen consolidado de cuotas obrero-patronales, aportaciones y amortizaciones para un único registro patronal (RP) en un bimestre calendario (o período irregular de liquidación).

## Claves y trazabilidad

- **Primary key del documento:** `(registro_patronal, periodo_bimestral)`
- **Foreign keys hacia otros DOC-*:**
  - `registro_patronal` → [[DOC-cedula_determinacion_mensual]]`.registro_patronal`
  - `registro_patronal` → [[DOC-comprobante_pago_sua]]`.registro_patronal`

## Tabla: `cedula_resumen_bimestral`

**Grain:** Un row = determinación bimestral completa para un RP.

| columna | tipo | nullable | pk/fk | descripción |
|---------|------|----------|-------|-------------|
| registro_patronal | string | no | pk | RP en formato XX-XXXXX-XX-X (ej: G62-72790-10-5) |
| periodo_bimestral | string | no | pk | Bimestre en formato "MMM-YYYY" o "Mes1-Mes2-YYYY" (ej: "Feb-2024") |
| rfc | string | sí | | RFC del patrón emisor |
| fecha_proceso | date | sí | | Fecha de generación de la cédula por el IMSS (formato YYYY-MM-DD) |
| delegacion_imss | string | sí | | Delegación del IMSS responsable (ej: "YUCATAN 33") |
| subdelegacion_imss | string | sí | | Subdelegación del IMSS (ej: "MERIDA NORTE 01") |
| actividad_economica | string | sí | | Descripción de actividad económica del patrón (ej: "SERV PROT Y CUST") |
| area_geografica | string | sí | | Clave de área geográfica homologada (ej: "A") |
| total_cotizantes | integer | sí | | Número total de trabajadores cotizantes en el período |
| total_acreditados | integer | sí | | Número de trabajadores acreditados (con crédito de vivienda activo) |
| retiro_patronal | decimal(14,2) | sí | | Aportación patronal para fondo de retiro (RCV) |
| retiro_obrero | decimal(14,2) | sí | | Aportación obrera para fondo de retiro (RCV) |
| cesantia_vejez_patronal | decimal(14,2) | sí | | Aportación patronal cesantía y vejez (RCV) |
| cesantia_vejez_obrera | decimal(14,2) | sí | | Aportación obrera cesantía y vejez (RCV) |
| total_a_pagar_rcv | decimal(14,2) | sí | | Principal RCV del periodo: retiro + cesantía-vejez (patronal + obrera), sin accesorios por mora. |
| actualizacion_rcv | decimal(14,2) | sí | | Actualización por pago extemporáneo del componente RCV. Default: 0.00 cuando el pago fue en plazo. |
| recargos_rcv | decimal(14,2) | sí | | Recargos por mora del componente RCV. Default: 0.00 cuando el pago fue en plazo. |
| aportacion_infonavit_sin_credito | decimal(14,2) | sí | | Aportación patronal vivienda sin crédito activo (5% o porcentaje configurado) |
| aportacion_infonavit_con_credito | decimal(14,2) | sí | | Aportación patronal vivienda con crédito activo (5% o porcentaje configurado) |
| amortizacion_creditos_vivienda | decimal(14,2) | sí | | Amortización de créditos de vivienda (descuentos al trabajador) |
| total_a_pagar_infonavit | decimal(14,2) | sí | | Suma INFONAVIT: aportación s/crédito + aportación c/crédito (no incluye amortización) |
| fundemex | decimal(14,2) | sí | | Aportación extraordinaria a FUNDEMEX (si aplica; típicamente 0.00) |
| total_a_pagar_consolidado | decimal(14,2) | sí | | Total a pagar: principal RCV + actualización RCV + recargos RCV + INFONAVIT + amortización + FUNDEMEX |
| una_umk | decimal(10,4) | sí | | Unidad de Medida y Actualización (UMA) vigente al proceso |
| salario_minimo_df | decimal(10,2) | sí | | Salario mínimo de la Ciudad de México vigente (valor de referencia) |
| factor_descuento | decimal(10,4) | sí | | Factor de Descuento para cálculo de vivienda (ej: 100.81) |
| es_liquidacion | boolean | no | | Indicador si es liquidación final o regular (default: false) |

### Campos calculados

| columna | expresión | depende de | descripción |
|---------|-----------|------------|-------------|
| total_rcv_sin_retencion | `retiro_patronal + retiro_obrero + cesantia_vejez_patronal + cesantia_vejez_obrera` | retiro_*, cesantia_vejez_* | Suma aritmética del principal RCV para validación |
| total_rcv_con_accesorios | `total_a_pagar_rcv + actualizacion_rcv + recargos_rcv` | total_a_pagar_rcv, actualizacion_rcv, recargos_rcv | Total RCV útil para salida a plantilla cuando el pago fue extemporáneo. |
| suma_componentes_principal | `total_rcv_con_accesorios + total_a_pagar_infonavit` | total_rcv_con_accesorios, total_a_pagar_infonavit | Suma de los dos ramos principales, sin amortización ni FUNDEMEX |

### Enumeraciones usadas en esta tabla

**`area_geografica`:**
- `A` — Área homologada desde 2015
- `B`, `C` — Otras áreas (especificar según norma)

---

## Relaciones entre tablas internas

N/A (tabla única)

---

## Trazabilidad inversa

Mapeo columna del schema → ubicación en PDF:

- `registro_patronal`: Encabezado principal, línea "Registro Patronal:"
- `periodo_bimestral`: Encabezado, línea "Bimestre de Proceso:"
- `rfc`: Encabezado, línea "RFC:"
- `fecha_proceso`: Encabezado, línea "Fecha de Proceso:"
- `delegacion_imss`: Encabezado, línea "Delegación IMSS:"
- `subdelegacion_imss`: Encabezado, línea "Subdelegación IMSS:"
- `actividad_economica`: Encabezado, línea "Actividad:"
- `area_geografica`: Encabezado, línea "Area Geográfica:"
- `total_cotizantes`: Resumen final, línea "Total de Cotizantes:"
- `total_acreditados`: Resumen final, línea "Total de Acreditados:"
- `retiro_patronal`: Tabla resumen, sección RCV, columna "Retiro Patronal"
- `retiro_obrero`: Tabla resumen, sección RCV, columna "Retiro Obrero"
- `cesantia_vejez_patronal`: Tabla resumen, sección RCV, columna "C.V. Patronal"
- `cesantia_vejez_obrera`: Tabla resumen, sección RCV, columna "C.V. Obrera"
- `total_a_pagar_rcv`: Resumen final, principal RCV antes de accesorios; se obtiene del subtotal del bloque retiro + cesantía y vejez
- `actualizacion_rcv`: Resumen final, fila o label "Actualización" asociada al bloque RCV, cuando exista; no observado en los ejemplos en plazo revisados
- `recargos_rcv`: Resumen final, fila o label "Recargos" asociada al bloque RCV, cuando exista; no observado en los ejemplos en plazo revisados
- `aportacion_infonavit_sin_credito`: Resumen final, línea "Aportación Patronal S/Crédito:"
- `aportacion_infonavit_con_credito`: Resumen final, línea "Aportación Patronal C/Crédito:"
- `amortizacion_creditos_vivienda`: Tabla resumen, sección INFONAVIT, valor bajo "Amortización"
- `total_a_pagar_infonavit`: Resumen final, línea "Total a Pagar de INFONAVIT"
- `fundemex`: Resumen final, línea "FUNDEMEX" (típicamente 0.00)
- `total_a_pagar_consolidado`: Resumen final, línea "Total a Pagar RCV e INFONAVIT..." o suma de totales principales
- `una_umk`: Pie de página, línea "Unidad de Medida y Actualización:"
- `salario_minimo_df`: Pie de página, línea "Salario Mínimo del D.F.:"
- `factor_descuento`: Pie de página, línea "Factor de Descuento"

---

## JSON Schema (para consumo automático)

```yaml
$schema: "http://json-schema.org/draft-07/schema#"
type: object
properties:
  cedula_resumen_bimestral:
    type: array
    items:
      type: object
      properties:
        registro_patronal:
          type: string
          pattern: "^[A-Z0-9]+-[0-9]+-[0-9]+-[0-9]+$"
        periodo_bimestral:
          type: string
          pattern: "^[A-Za-z]+-[0-9]{4}$"
        rfc:
          type: string
          minLength: 10
        fecha_proceso:
          type: string
          format: date
        delegacion_imss:
          type: string
        subdelegacion_imss:
          type: string
        actividad_economica:
          type: string
        area_geografica:
          type: string
        total_cotizantes:
          type: integer
          minimum: 0
        total_acreditados:
          type: integer
          minimum: 0
        retiro_patronal:
          type: number
          minimum: 0
        retiro_obrero:
          type: number
          minimum: 0
        cesantia_vejez_patronal:
          type: number
          minimum: 0
        cesantia_vejez_obrera:
          type: number
          minimum: 0
        total_a_pagar_rcv:
          type: number
          minimum: 0
        actualizacion_rcv:
          type: number
          minimum: 0
          default: 0.0
        recargos_rcv:
          type: number
          minimum: 0
          default: 0.0
        aportacion_infonavit_sin_credito:
          type: number
          minimum: 0
        aportacion_infonavit_con_credito:
          type: number
          minimum: 0
        amortizacion_creditos_vivienda:
          type: number
          minimum: 0
        total_a_pagar_infonavit:
          type: number
          minimum: 0
        fundemex:
          type: number
          minimum: 0
        total_a_pagar_consolidado:
          type: number
          minimum: 0
        una_umk:
          type: number
        salario_minimo_df:
          type: number
        factor_descuento:
          type: number
        es_liquidacion:
          type: boolean
      required: [registro_patronal, periodo_bimestral, total_a_pagar_consolidado]
required: [cedula_resumen_bimestral]
```

---

## Notas de implementación

- **Precisión decimal:** RCV e INFONAVIT usan `decimal(14,2)` para mantener compatibilidad con importes anuales típicos (hasta 99,999,999.99).
- **Período:** Se almacena como string "Mes-YYYY" para preservar exactamente como aparece en el PDF. El parser debe detectar bimestres regulares (Feb, Apr, Jun, Ago, Oct, Dic) vs. irregulares.
- **Campos opcionales:** `rfc`, `delegacion_imss`, `subdelegacion_imss`, `actividad_economica` pueden estar ausentes en cédulas simplificadas o extraídas parcialmente. El schema permite nullable para estos.
- **Accesorios RCV:** `actualizacion_rcv` y `recargos_rcv` deben defaultear a `0.00` cuando el PDF no los exhiba o el pago haya sido en plazo. Los ejemplos PDF revisados corresponden a pagos en plazo y no exhiben esos renglones.
- **Total a Pagar consolidado:** Debe validarse contra suma aritmética de componentes (`total_a_pagar_rcv + actualizacion_rcv + recargos_rcv + total_a_pagar_infonavit + amortizacion_creditos_vivienda + fundemex`) con tolerancia de 0.01 por redondeo.

---

## Cambios de schema

Este archivo solo se modifica vía el pipeline de propuestas. Ver [[04 - Change log]] para el histórico.
