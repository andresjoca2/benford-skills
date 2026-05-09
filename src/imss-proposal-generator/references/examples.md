# Examples

## Entrada minima

```text
01 Contribuciones/01 Internal Team/CONTRIBUTION-2026-05-03-smoke-explicit-knowledge/
├── contribution_map.md
├── materials/
└── skill_outputs/explicit_knowledge/DOL-smoke-articulo-15/
    ├── spec_draft.md
    ├── document_transcript_draft.md
    └── notes.md
```

Si `notes.md` dice que no debe canonizarse, no crear PROP. Reporta el bloqueo.

## PROP-DOL minima

```md
# PROP-DOL-0001

## Identificacion
| Campo | Valor |
|---|---|
| ID | PROP-0001 |
| Tipo | PROP-DOL |
| Estado | draft |
| Fecha creacion | 2026-05-03 |
| Ultima actualizacion | 2026-05-03 |
| Owner operativo | Proposal Builder |
| Contribution origen | CONTRIBUTION-2026-05-03-articulo-15-lss |
| Tipo de cambio | new |
| Target canonico ID | DOL-ley-seguro-social-art-15 |
| Target canonico path | 05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOL Documentos de Leyes/DOL-ley-seguro-social-art-15/ |
| Riesgo inicial | medium |
| Capa | explicit_knowledge |
| Canonical type | DOL |

## Campos para routing
| Campo | Prioridad | Valor |
|---|---|---|
| Contribution origen | M | CONTRIBUTION-2026-05-03-articulo-15-lss |
| Tipo de cambio | M | new |
| Target canonico ID | M | DOL-ley-seguro-social-art-15 |
| Target canonico path | M | 05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOL Documentos de Leyes/DOL-ley-seguro-social-art-15/ |
| Evidencia minima disponible | M | si |
| Toca canon existente | M | no |
| Contradiccion detectada | M | unknown |
| Riesgo inicial | M | medium |
| Requiere humano sugerido | D | unknown |

## Cambio propuesto
Crear un canonico `DOL-*` para el Articulo 15 de la Ley del Seguro Social, soportado por fuente oficial y transcripcion revisada.

## Evidencia usada
| Evidencia | Ubicacion | Uso |
|---|---|---|
| Fuente oficial consultada | `materials/articulo-15-lss.md` | Base normativa |

## Ejemplos raw documents
| Ejemplo | Empresa / fuente | Ubicacion en contribution | Tipo / variante | Variante canonica destino | Uso en el canonico | Destino canonico sugerido |
|---|---|---|---|---|---|---|
| Articulo 15 LSS fuente oficial | IMSS / fuente oficial | `materials/articulo-15-lss.md` | documento legal | no_aplica | ejemplo_real | `examples/raw_documents/articulo-15-lss.md` |

## Materiales canonicos a copiar
| Accion | Origen en contribution | Variante canonica destino | Destino canonico esperado | Tipo | Preservar estructura | Nota |
|---|---|---|---|---|---|---|
| copiar archivo | `materials/articulo-15-lss.md` | no_aplica | `examples/raw_documents/articulo-15-lss.md` | ejemplo_real | no | Fuente oficial usada como ejemplo raw |

## Drafts usados
| Draft | Ubicacion | Archivo canonico destino |
|---|---|---|
| spec_draft.md | `skill_outputs/explicit_knowledge/DOL-articulo-15/spec_draft.md` | spec.md |
| document_transcript_draft.md | `skill_outputs/explicit_knowledge/DOL-articulo-15/document_transcript_draft.md` | document_transcript.md |

## Riesgos o dudas
Vigencia y reforma deben ser verificadas por Router o humano si la evidencia no incluye fecha oficial.

## Archivos canonicos esperados
| Accion | Canonical ID | Path esperado | Nota |
|---|---|---|---|
| crear | DOL-ley-seguro-social-art-15/spec.md | `05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOL Documentos de Leyes/DOL-ley-seguro-social-art-15/spec.md` | Contrato funcional legal |
| crear | DOL-ley-seguro-social-art-15/document_transcript.md | `05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOL Documentos de Leyes/DOL-ley-seguro-social-art-15/document_transcript.md` | Transcripcion controlada |
| copiar | DOL-ley-seguro-social-art-15/examples/raw_documents/articulo-15-lss.md | `05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOL Documentos de Leyes/DOL-ley-seguro-social-art-15/examples/raw_documents/articulo-15-lss.md` | Material canonico a copiar |
```

## Bloqueo por falta de evidencia

No crear PROP si:

- la contribution contiene solo una conversacion vaga sin material fuente;
- los drafts dicen explicitamente "no generar PROP";
- el cambio no tiene ruta de evidencia;
- no se puede distinguir si el output corresponde a `DOC`, `DVC`, `DOL`, `METH` o `TEST`;
- el proposal requeriria inventar campos, documentos, llaves, tolerancias o criterios;
- los raw documents relevantes solo existen como rutas externas y no fueron
  copiados a `materials/`.

Respuesta esperada:

```text
No cree PROP porque el output no es trazable a evidencia suficiente. El bloqueo esta en:
- skill_outputs/.../notes.md: canonizacion baja
- materials/...: fuente sintetica/no oficial

Para crear PROP hace falta una fuente oficial o una indicacion humana que acepte convertir esto en propuesta experimental de bajo nivel.
```

## Ejemplos reales por empresa

Cuando la contribution trae documentos de empresas o clientes distintos, la PROP
debe conservar esa diversidad como ejemplos trazables, sin copiar los archivos a
la carpeta PROP:

```md
## Ejemplos raw documents
| Ejemplo | Empresa / fuente | Ubicacion en contribution | Tipo / variante | Variante canonica destino | Uso en el canonico | Destino canonico sugerido |
|---|---|---|---|---|---|---|
| SUA cliente A enero-febrero | Cliente A | `materials/cliente-a/sua-ene-feb.pdf` | SUA PDF | no_aplica | muestra_layout | `examples/cliente-a/sua-ene-feb.pdf` |
| SUA cliente B enero-febrero | Cliente B | `materials/cliente-b/sua-ene-feb.xlsx` | SUA Excel export | no_aplica | fixture | `examples/cliente-b/sua-ene-feb.xlsx` |
```

Si la empresa, cliente o variante no esta documentada, usa `Pendiente` y deja la
duda en `Riesgos o dudas`.

## Materiales copiables por empresa

Cuando las carpetas de ejemplos deban llegar al canonico, declaralas dos veces:
primero como contrato de copia y despues como output esperado.

```md
## Materiales canonicos a copiar
| Accion | Origen en contribution | Variante canonica destino | Destino canonico esperado | Tipo | Preservar estructura | Nota |
|---|---|---|---|---|---|---|
| copiar carpeta | `materials/source_documents/examples/Selim/` | no_aplica | `Examples/Selim/` | ejemplo_real | si | PDFs reales por periodo |
| copiar carpeta | `materials/source_documents/examples/Delta Tech/` | no_aplica | `Examples/Delta Tech/` | ejemplo_real | si | PDFs reales por periodo |
| copiar archivo | `materials/source_documents/legacy_markdown/PENDIENTES - cedula_determinacion_mensual.md` | no_aplica | `PENDIENTES - cedula_determinacion_mensual.md` | legacy_markdown | no | Pendientes heredados |

## Archivos canonicos esperados
| Accion | Canonical ID | Path esperado | Nota |
|---|---|---|---|
| crear | DOC-cedula-determinacion-mensual/spec.md | `05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-cedula-determinacion-mensual/spec.md` | Contrato funcional |
| crear | DOC-cedula-determinacion-mensual/schema.md | `05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-cedula-determinacion-mensual/schema.md` | Schema inicial |
| crear | DOC-cedula-determinacion-mensual/parser_config.md | `05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-cedula-determinacion-mensual/parser_config.md` | Parser inicial |
| crear | DOC-cedula-determinacion-mensual/changelog.md | `05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-cedula-determinacion-mensual/changelog.md` | Changelog inicial |
| copiar | DOC-cedula-determinacion-mensual/Examples/Selim/ | `05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-cedula-determinacion-mensual/Examples/Selim/` | Copiar carpeta preservando estructura |
| copiar | DOC-cedula-determinacion-mensual/Examples/Delta Tech/ | `05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-cedula-determinacion-mensual/Examples/Delta Tech/` | Copiar carpeta preservando estructura |
| copiar | DOC-cedula-determinacion-mensual/PENDIENTES - cedula_determinacion_mensual.md | `05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-cedula-determinacion-mensual/PENDIENTES - cedula_determinacion_mensual.md` | Copiar legacy markdown |
```

## Atomicidad

Separar:

- una `PROP-DOL` para crear fundamento legal;
- una `PROP-DOC` para crear documento fuente estable;
- una `PROP-DVC` para una variante de cliente;
- una `PROP-TEST` para una prueba ejecutable que usa esos documentos.

No crear una sola PROP que mezcle ley, layout, prueba y metodologia.

## DVC con ejemplos por variante

Cuando una `PROP-DVC` tenga varias variantes, cada carpeta de ejemplos debe
asignarse a una variante concreta. Este mapeo debe repetirse en
`Ejemplos raw documents`, `Materiales canonicos a copiar` y
`Archivos canonicos esperados`.

```md
## Target canonico
| Campo | Valor |
|---|---|
| DVC ID | DVC-auxiliar-contable-gastos |
| Variantes | imt-plana-cuenta-externa, saplayasj-aplanada-cuenta-renglon, selim-agrupada-cuenta-header |

## Mapeo ejemplos a variantes DVC
| Ejemplo / fuente | Ubicacion en contribution | Variante canonica destino | Destino canonico esperado | Evidencia del mapeo |
|---|---|---|---|---|
| IMT (Ruben) | `materials/source_documents/examples/IMT (Ruben)/` | `imt-plana-cuenta-externa` | `imt-plana-cuenta-externa/source_documents/examples/IMT (Ruben)/` | draft de variante IMT |
| Selim | `materials/source_documents/examples/Selim/` | `selim-agrupada-cuenta-header` | `selim-agrupada-cuenta-header/source_documents/examples/Selim/` | draft de variante Selim |
| Servicios Administrativos Playa San Jose | `materials/source_documents/examples/Servicios Administrativos Playa San Jose/` | `saplayasj-aplanada-cuenta-renglon` | `saplayasj-aplanada-cuenta-renglon/source_documents/examples/Servicios Administrativos Playa San Jose/` | draft de variante SAP |

## Materiales canonicos a copiar
| Accion | Origen en contribution | Variante canonica destino | Destino canonico esperado | Tipo | Preservar estructura | Nota |
|---|---|---|---|---|---|---|
| copiar carpeta | `materials/source_documents/examples/IMT (Ruben)/` | `imt-plana-cuenta-externa` | `imt-plana-cuenta-externa/source_documents/examples/IMT (Ruben)/` | ejemplo_real | si | Copiar a la variante IMT |
| copiar carpeta | `materials/source_documents/examples/Selim/` | `selim-agrupada-cuenta-header` | `selim-agrupada-cuenta-header/source_documents/examples/Selim/` | ejemplo_real | si | Copiar a la variante Selim |
| copiar carpeta | `materials/source_documents/examples/Servicios Administrativos Playa San Jose/` | `saplayasj-aplanada-cuenta-renglon` | `saplayasj-aplanada-cuenta-renglon/source_documents/examples/Servicios Administrativos Playa San Jose/` | ejemplo_real | si | Copiar a la variante SAP |

## Archivos canonicos esperados
| Accion | Canonical ID | Path esperado | Nota |
|---|---|---|---|
| copiar | DVC-auxiliar-contable-gastos/imt-plana-cuenta-externa/source_documents/examples/IMT (Ruben)/ | `05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-auxiliar-contable-gastos/imt-plana-cuenta-externa/source_documents/examples/IMT (Ruben)/` | Copiar carpeta preservando estructura |
| copiar | DVC-auxiliar-contable-gastos/selim-agrupada-cuenta-header/source_documents/examples/Selim/ | `05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-auxiliar-contable-gastos/selim-agrupada-cuenta-header/source_documents/examples/Selim/` | Copiar carpeta preservando estructura |
| copiar | DVC-auxiliar-contable-gastos/saplayasj-aplanada-cuenta-renglon/source_documents/examples/Servicios Administrativos Playa San Jose/ | `05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-auxiliar-contable-gastos/saplayasj-aplanada-cuenta-renglon/source_documents/examples/Servicios Administrativos Playa San Jose/` | Copiar carpeta preservando estructura |
```

Incorrecto para DVC:

```md
| Accion | Origen en contribution | Variante canonica destino | Destino canonico esperado | Tipo | Preservar estructura | Nota |
|---|---|---|---|---|---|---|
| copiar carpeta | `materials/source_documents/examples/Selim/` | `selim-agrupada-cuenta-header` | `imt-plana-cuenta-externa/source_documents/examples/Selim/` | ejemplo_real | si | Destino no inicia con la variante declarada |
```

Esa fila debe bloquear la PROP: Selim requiere su variante explicita
`selim-agrupada-cuenta-header`.

## README DVC generado

Para DVC, no dupliques `spec_draft.md` como origen directo de `README.md`.

```md
## Drafts usados
| Draft | Ubicacion | Archivo canonico destino |
|---|---|---|
| spec_draft.md | `skill_outputs/explicit_knowledge/DVC-auxiliar-contable-gastos/spec_draft.md` | spec.md |
| indice_generado_desde_spec_y_variantes | `skill_outputs/explicit_knowledge/DVC-auxiliar-contable-gastos/` | README.md |

## Archivos canonicos esperados
| Accion | Canonical ID | Path esperado | Nota |
|---|---|---|---|
| crear | DVC-auxiliar-contable-gastos/README.md | `05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-auxiliar-contable-gastos/README.md` | Indice generado del DVC y sus variantes |
```
