# Convenciones globales de identificadores

Anexo compartido por **`imss-document-spec-builder`** y **`imss-test-builder`**.

Estas convenciones son **obligatorias** en todo schema, parser y reconciliation. Garantizan que joins entre DOC-* funcionen sin transformaciones ad-hoc.

---

## Identificadores de personas

| Campo | Convención | Ejemplo válido | Ejemplo inválido |
|---|---|---|---|
| `nss` | 11 dígitos numéricos, **sin guiones** | `22078202672` | `2207820267-2`, `2207-8202-672` |
| `rfc_trabajador` | 13 caracteres alfanuméricos en uppercase, **sin guiones** | `CURO680828H16` | `CURO-680828-H16` |
| `curp` | 18 caracteres alfanuméricos en uppercase | `CUXR680828MSLNXS02` | `cuxr680828mslnxs02` |
| `clave_trabajador` | string preservando padding de ceros original | `00046`, `181000724` | `46`, `181000724.0` |
| `nombre_trabajador` | string con trim de espacios; preserva mayúsculas, acentos y `Ñ` | `PIÑON AVENDAÑO JAVIER` | `pinon avendano javier ` |

## Identificadores del patrón

| Campo | Convención | Ejemplo |
|---|---|---|
| `rfc_patron` | uppercase, **con guiones tal cual viene** del documento | `SAP-120827-360` |
| `registro_patronal` | string **preservar tal cual viene** (puede traer guiones o no) | `M62-32440-10-8`, `G6272790105` |
| `razon_social` | string con trim, preservando mayúsculas | `Servicios Administrativos Playa San Jose SA de CV` |

## Reglas de normalización

1. **Quitar guiones** solo en `nss`, `rfc_trabajador`, `curp`. En el resto preservar tal cual.
2. **Padding de ceros:** preservar siempre en claves alfanuméricas (`clave_trabajador`, `cuenta_codigo`, etc.). Nunca castear a int.
3. **Uppercase:** aplicar a `rfc_*`, `curp`. No aplicar a nombres ni razones sociales.
4. **Trim:** aplicar a todo string. Algunos sistemas traen trailing spaces.
5. **Caracteres especiales:** preservar `Ñ`, acentos (`á`, `é`, `í`, `ó`, `ú`) y `ü`. No transliterar.

## Casos límite

- **NSS con 10 dígitos:** error de captura. Reportar warning, no autocorregir.
- **RFC genérico SAT** (`XAXX010101000` o `XEXX010101000`): preservar tal cual, marcar warning si aparece en CFDI de nómina.
- **CURP con 17 chars:** error de captura. Reportar warning.
- **Clave `0` o vacía:** indica fila de subtotal o anotación del auditor — ignorar (Principio 4).

## Referencias

Cuando un nuevo DOC-* o reconciliation use cualquiera de estos campos, **debe referirse a este anexo** en su sección de Normalizaciones del Parser config. Ejemplo:

```markdown
- `nss`: ver [convenciones-identificadores](.../_shared/conventions-identificadores.md). 11 dígitos sin guiones.
```

Esto evita que cada doc redefina la convención y crea consistencia para joins.
