---
name: IMSS-Proposal-Generator
description: >-
  Construye propuestas atomicas PROP-* para Benford Vault V3 a partir de una
  CONTRIBUTION-* y sus skill_outputs, sintetizando drafts de Explicit Knowledge,
  Task Specific o Experimental Knowledge en proposal.md dentro de
  02 Proposals/01 Draft/. Usa esta skill cuando el usuario quiera convertir
  outputs de IMSS-Add-Explicit-Knowledge o IMSS-Add-Task-Specific en propuestas
  canonicas revisables, sin aprobar, rutear ni escribir canonicos.
---

# IMSS Proposal Generator

## Responsabilidad

Convierte una `CONTRIBUTION-*` completa en una o mas PROPs atomicas para el flujo V3.

La skill no decide si el cambio entra al canon. Solo crea solicitudes formales de cambio:

```text
Contribution -> skill_outputs -> Proposal Builder -> 02 Proposals/01 Draft/PROP-*/proposal.md -> Router Engine
```

## Regla de vault

El vault `05 Benford Vault/` es canonico y requiere aprobacion explicita del usuario antes de cualquier escritura.

Antes de crear o actualizar una PROP dentro de `02 Proposals/01 Draft/`, debes:

1. decir exactamente que carpeta `PROP-*` y archivo `proposal.md` quieres crear o modificar;
2. explicar por que esa salida pertenece a `02 Proposals/01 Draft/` y no a una carpeta temporal;
3. esperar aprobacion explicita del usuario en la misma sesion.

Puedes leer el vault sin pedir aprobacion.

## Puede leer

- `CONTRIBUTION-*/contribution_map.md`
- `CONTRIBUTION-*/materials/`
- `CONTRIBUTION-*/call_transcript.md`
- `CONTRIBUTION-*/session_transcript.md`
- `CONTRIBUTION-*/session_conversation.md` solo como alias legacy de lectura si
  ya existe en una contribution antigua
- `CONTRIBUTION-*/skill_outputs/`
- canonicos existentes relacionados en `05 Benford Brain IMSS Mexico/`
- templates vivos en `02 Proposals/00 Templates/`
- contratos vivos en `00 Sistema/`

## Puede escribir

Solo con aprobacion explicita del usuario:

```text
05 Benford Vault/Benford Vault V3/02 Proposals/01 Draft/PROP-*/proposal.md
```

Puede actualizar `CONTRIBUTION-*/contribution_map.md` solo para registrar PROPs generadas, y solo si el usuario lo aprueba expresamente.

## No puede escribir

- `02 Proposals/02 Needs Human Decision/`
- `02 Proposals/03 Approved for Editor/`
- `02 Proposals/04 Applied/`
- `02 Proposals/05 Rejected/`
- `05 Benford Brain IMSS Mexico/`
- `06 Benford Brain EF Mexico/`
- carpetas legacy como `01 IMSS Mexico/`
- `router_decision.md`
- `analysis_report.md`
- `questions_for_human.md`
- `decision_record.md`
- `applied_record.md`
- `skill_outputs/`

## Workflow

1. Localiza `Benford Vault V3` y la `CONTRIBUTION-*` origen.
2. Lee `contribution_map.md`, materiales, conversaciones y `skill_outputs/`.
3. Lee `references/contract-map.md` y los contratos vivos del vault.
4. Inventaria candidatos a cambio canonico.
5. Busca canonicos existentes relacionados antes de asumir que algo es nuevo.
6. Inventaria ejemplos reales de documentos crudos en `materials/` que soportan
   cada cambio canonico candidato.
7. Decide el tipo de PROP: `PROP-AIM`, `PROP-DICT`, `PROP-DOC`, `PROP-DVC`, `PROP-DOL`, `PROP-METH`, `PROP-TEST`, `PROP-PEOP`, `PROP-FIRM` o `PROP-FIELD`.
8. Aplica reglas de atomicidad y separa una PROP por cambio conceptual.
9. Lee el template vivo correspondiente en `02 Proposals/00 Templates/`.
   El template es piso, no techo: si le faltan `Ejemplos raw documents` o
   `Materiales canonicos a copiar`, agregalos de todos modos.
10. Prepara `proposal.md` sintetizado: no pegues drafts crudos completos.
11. Agrega la seccion `## Ejemplos raw documents` con rutas a ejemplos reales
    en `materials/` y destino canonico sugerido. Para `PROP-DVC`, cada ejemplo
    debe declarar `Variante canonica destino`; no infieras destinos usando la
    primera variante disponible.
12. Agrega `## Materiales canonicos a copiar` cuando haya archivos o carpetas
    fisicas que deban imprimirse en el canonico aprobado.
13. Refleja esos materiales tambien en `## Archivos canonicos esperados` con
    accion `copiar`; esa tabla es el contrato operativo para Canonical Editor.
    Las dos secciones deben estar sincronizadas: todo material copiable listado
    en `Materiales canonicos a copiar` debe aparecer tambien como accion
    `copiar` en `Archivos canonicos esperados`, y viceversa.
14. Antes de escribir en el vault, pide aprobacion explicita con ruta exacta.
15. Crea solo `proposal.md` dentro de `02 Proposals/01 Draft/PROP-*/`.
16. Verifica que no se aprobo, no se rutio y no se tocaron canonicos.

## Reglas de atomicidad

Una PROP debe proponer un solo cambio conceptual.

Separa PROPs cuando:

- cambia mas de un canonico sin dependencia directa;
- mezcla alta confianza con baja confianza;
- mezcla nuevo canonico con modificacion de canonico existente;
- mezcla conocimiento documental con metodologia o test;
- mezcla hechos observados con criterio auditor debatible;
- una parte podria aprobarse automaticamente y otra requiere humano;
- el cambio toca capas distintas: `explicit_knowledge`, `task_specific`, `experimental_knowledge`.

## Tipo de PROP

| Tipo | Usar cuando |
|---|---|
| `PROP-AIM` | Dominio o target macro oficial auditable. En IMSS, AIM no es una prueba especifica. |
| `PROP-DICT` | Card, pestana, prueba o entregable oficial del dictamen IMSS. |
| `PROP-DOC` | Documento fuente estable y reusable. |
| `PROP-DVC` | Documento variable por cliente, software, banco, emisor o layout cambiante. |
| `PROP-DOL` | Ley, reglamento, articulo, fundamento normativo o criterio legal documentado. |
| `PROP-METH` | Metodologia completa de firma u oficina. |
| `PROP-TEST` | Prueba individual ejecutable dentro de una metodologia y ligada a un `DICT-*`. |
| `PROP-PEOP` | Persona auditora o fuente humana relevante. |
| `PROP-FIRM` | Firma, oficina o practica contextual. |
| `PROP-FIELD` | Conocimiento de campo o heuristica no limitada a una persona ni firma. |

## Contenido obligatorio

Cada `proposal.md` debe cumplir el template vivo de su tipo y tener al menos:

- `## Identificacion`
- `## Campos para routing`
- `## Contribution source`
- `## Tipo de cambio`
- `## Target canonico`
- `## Cambio propuesto`
- `## Evidencia usada`
- `## Ejemplos raw documents`
- `## Materiales canonicos a copiar`
- `## Drafts usados`
- `## Canonicos relacionados`
- `## Riesgos o dudas`
- `## Archivos canonicos esperados`

No incluyas `Resultado de aplicacion`.

## Criterio de sintesis

- Cita evidencia por ruta o ID.
- Cuando existan documentos fuente reales, incluye una seccion `## Ejemplos raw
  documents` en la PROP. Esta seccion debe listar los archivos copiados dentro
  de `CONTRIBUTION-*/materials/`, no rutas externas.
- No trates documentos fisicos copiables solo como evidencia. Si deben entrar al
  canonico, declaralos en `## Materiales canonicos a copiar` y en `## Archivos
  canonicos esperados`.
- Aunque el template vivo del vault no tenga estas secciones, agregalas. El
  Proposal Generator no puede omitirlas por seguir un template viejo.
- Mantén hechos, inferencias y dudas separados.
- Declara `Riesgo inicial` como `low`, `medium`, `high` o `unknown`.
- Llena `Contradiccion detectada` como `si`, `no` o `unknown`; no resuelvas contradicciones que requieren humano.
- Usa `Target canonico ID` sugerido aunque el path quede `Pendiente`, si el canonico es nuevo.
- Si no hay evidencia minima, no crees PROP; deja reporte verbal y explica el bloqueo.

## Ejemplos raw documents

Las PROPs deben identificar los ejemplos reales que eventualmente alimentaran al
canonico. Esta seccion es inventario y evidencia, no instruccion suficiente de
copia. No copies los documentos crudos dentro de `02 Proposals/`; la carpeta
PROP debe seguir conteniendo solo `proposal.md`. En su lugar, referencia los
archivos que ya viven en `CONTRIBUTION-*/materials/`.

Importante: un archivo listado solo en `## Ejemplos raw documents` no queda
autorizado para imprimirse en el canonico. Para que Canonical Editor deba
copiarlo, el mismo archivo o carpeta debe aparecer tambien en `## Materiales
canonicos a copiar` y en `## Archivos canonicos esperados` con accion `copiar`.

Incluye esta seccion cuando la PROP trate documentos, layouts, variantes,
pruebas o metodologias soportadas por papeles reales:

```md
## Ejemplos raw documents
| Ejemplo | Empresa / fuente | Ubicacion en contribution | Tipo / variante | Variante canonica destino | Uso en el canonico | Destino canonico sugerido |
|---|---|---|---|---|---|---|
| Pendiente | Pendiente | `materials/...` | Pendiente | Pendiente / no_aplica | ejemplo_real / fixture / muestra_layout / evidencia_contextual | Pendiente |
```

Reglas:

- cada ejemplo debe apuntar a una copia dentro de `materials/`;
- si el usuario dio una ruta externa y el archivo no fue copiado a `materials/`,
  no lo uses en la PROP; reporta bloqueo o pide preparar la contribution;
- identifica empresa, firma, oficina, sistema, banco o variante solo si aparece
  en `contribution_map.md`, en el nombre/ruta del material, o en los outputs;
- no inventes empresas ni anonimices cambiando hechos; si no se sabe, usa
  `Pendiente` o `unknown`;
- para `PROP-DOC` y `PROP-DVC`, esta seccion debe existir siempre que haya
  documentos crudos disponibles;
- para `PROP-TEST` y `PROP-METH`, incluye los papeles de trabajo o documentos
  fuente reales que prueban como se ejecuta la metodologia;
- para tipos no DVC, el destino canonico sugerido puede ser
  `examples/raw_documents/`, `examples/<empresa-o-variante>/`, `fixtures/` o
  `Pendiente`, segun el template canonico aplicable y sin crear esos archivos;
- para `PROP-DVC`, aplica la regla estricta de variantes DVC de la siguiente
  seccion.

## Regla DVC para ejemplos por variante

En `PROP-DVC`, los ejemplos fisicos no viven en un folder generico ni en la
primera variante encontrada. Cada ejemplo debe mapearse a una variante canonica
explicita.

Incluye este bloque cuando la PROP tenga mas de una variante o cuando existan
carpetas de ejemplos por empresa, cliente, sistema o layout:

```md
## Mapeo ejemplos a variantes DVC
| Ejemplo / fuente | Ubicacion en contribution | Variante canonica destino | Destino canonico esperado | Evidencia del mapeo |
|---|---|---|---|---|
| Pendiente | `materials/...` | `<variante-id>` | `<variante-id>/source_documents/examples/<fuente>/` | draft de variante / contribution_map / nombre de carpeta |
```

Reglas obligatorias para `PROP-DVC`:

- `Variante canonica destino` debe coincidir exactamente con una variante
  declarada en `Target canonico`, en `Detalle DVC` o en los folders de
  `skill_outputs/explicit_knowledge/DVC-*/`;
- el destino de cada ejemplo debe iniciar con la variante declarada, por
  ejemplo `<variante-id>/source_documents/examples/<fuente>/` o
  `<variante-id>/fixtures/<fuente>/`;
- no uses rutas raiz como `Examples/<fuente>/`, `Ejemplos/<fuente>/` o
  `fixtures/<fuente>/` para DVC con variantes;
- no coloques ejemplos de varias empresas bajo una misma variante salvo que la
  evidencia diga explicitamente que esas empresas usan esa misma variante;
- si `materials/source_documents/examples/Selim/` corresponde a
  `selim-agrupada-cuenta-header`, el destino debe ser
  `selim-agrupada-cuenta-header/source_documents/examples/Selim/`; no lo pongas bajo
  `imt-plana-cuenta-externa/source_documents/examples/Selim/`;
- si no puedes determinar la variante de un ejemplo, no inventes destino:
  marca `Pendiente`, deja la duda en `Riesgos o dudas` y detente antes de
  escribir la PROP si ese material seria copiable.

## Materiales canonicos a copiar

Esta seccion es el contrato explicito para que Canonical Editor copie archivos o
carpetas fisicas desde la contribution hacia el canonico aprobado. Si no aparece
esta seccion, el editor puede interpretar los raw documents solo como evidencia.

Incluyela siempre que la PROP deba promover ejemplos, fixtures, muestras de
layout, legacy markdown o carpetas por empresa al canonico.

```md
## Materiales canonicos a copiar
| Accion | Origen en contribution | Variante canonica destino | Destino canonico esperado | Tipo | Preservar estructura | Nota |
|---|---|---|---|---|---|---|
| copiar archivo / copiar carpeta | `materials/...` | Pendiente / no_aplica | `Examples/...` / `<variante>/source_documents/examples/...` / `fixtures/...` / `PENDIENTES - archivo.md` | ejemplo_real / fixture / legacy_markdown / muestra_layout | si / no | Pendiente |
```

Reglas:

- para `PROP-DOC` y `PROP-DVC`, si hay `materials/source_documents/examples/`
  o equivalentes que deban vivir en el canonico, esta seccion es obligatoria;
- para carpetas por empresa o cliente, declara la carpeta completa con
  `Preservar estructura = si`, no solo archivos sueltos;
- para pendientes o markdown legacy que deban conservarse en el canonico,
  declaralos como `legacy_markdown`;
- cada fila debe tener un destino canonico esperado relativo al target canonico;
- en `PROP-DVC`, cada fila de ejemplo o fixture debe incluir
  `Variante canonica destino` y el destino debe iniciar con esa variante;
- repite cada archivo o carpeta copiable en `## Archivos canonicos esperados`
  con accion `copiar`;
- si `Archivos canonicos esperados` incluye accion `copiar`, debe existir una
  fila correspondiente en `Materiales canonicos a copiar`;
- si `Materiales canonicos a copiar` incluye una fila, debe existir una fila
  correspondiente en `Archivos canonicos esperados`;
- no declares materiales que solo existen en rutas externas fuera de
  `CONTRIBUTION-*/materials/`.

Ejemplo:

```md
## Materiales canonicos a copiar
| Accion | Origen en contribution | Variante canonica destino | Destino canonico esperado | Tipo | Preservar estructura | Nota |
|---|---|---|---|---|---|---|
| copiar carpeta | `materials/source_documents/examples/Selim/` | no_aplica | `Examples/Selim/` | ejemplo_real | si | PDFs reales del cliente Selim |
| copiar carpeta | `materials/source_documents/examples/Delta Tech/` | no_aplica | `Examples/Delta Tech/` | ejemplo_real | si | PDFs reales del cliente Delta Tech |
| copiar archivo | `materials/source_documents/legacy_markdown/PENDIENTES - cedula_determinacion_mensual.md` | no_aplica | `PENDIENTES - cedula_determinacion_mensual.md` | legacy_markdown | no | Pendientes heredados del canon legacy |
```

Ejemplo DVC correcto:

```md
## Mapeo ejemplos a variantes DVC
| Ejemplo / fuente | Ubicacion en contribution | Variante canonica destino | Destino canonico esperado | Evidencia del mapeo |
|---|---|---|---|---|
| IMT (Ruben) | `materials/source_documents/examples/IMT (Ruben)/` | `imt-plana-cuenta-externa` | `imt-plana-cuenta-externa/source_documents/examples/IMT (Ruben)/` | folder de variante y draft IMT |
| Selim | `materials/source_documents/examples/Selim/` | `selim-agrupada-cuenta-header` | `selim-agrupada-cuenta-header/source_documents/examples/Selim/` | folder de variante y draft Selim |
| Servicios Administrativos Playa San Jose | `materials/source_documents/examples/Servicios Administrativos Playa San Jose/` | `saplayasj-aplanada-cuenta-renglon` | `saplayasj-aplanada-cuenta-renglon/source_documents/examples/Servicios Administrativos Playa San Jose/` | folder de variante y draft SAP |

## Materiales canonicos a copiar
| Accion | Origen en contribution | Variante canonica destino | Destino canonico esperado | Tipo | Preservar estructura | Nota |
|---|---|---|---|---|---|---|
| copiar carpeta | `materials/source_documents/examples/IMT (Ruben)/` | `imt-plana-cuenta-externa` | `imt-plana-cuenta-externa/source_documents/examples/IMT (Ruben)/` | ejemplo_real | si | Copiar ejemplos IMT a su variante |
| copiar carpeta | `materials/source_documents/examples/Selim/` | `selim-agrupada-cuenta-header` | `selim-agrupada-cuenta-header/source_documents/examples/Selim/` | ejemplo_real | si | Copiar ejemplos Selim a su variante |
| copiar carpeta | `materials/source_documents/examples/Servicios Administrativos Playa San Jose/` | `saplayasj-aplanada-cuenta-renglon` | `saplayasj-aplanada-cuenta-renglon/source_documents/examples/Servicios Administrativos Playa San Jose/` | ejemplo_real | si | Copiar ejemplos SAP a su variante |
```

## README en DVC

En `PROP-DVC`, `README.md` es indice canonico del DVC y sus variantes, no una
copia adicional de `spec_draft.md`.

Reglas:

- `spec_draft.md` debe mapearse a `spec.md`;
- si se propone `README.md`, en `Drafts usados` usa un origen explicito como
  `indice_generado_desde_spec_y_variantes` o `README_draft.md`, no una segunda
  fila `spec_draft.md -> README.md`;
- en `Archivos canonicos esperados`, la nota de `README.md` debe decir que es
  indice generado del DVC y sus variantes;
- si no hay informacion suficiente para generar un indice fiel, deja
  `README.md` como `Pendiente` o pide decision humana.

## Hard stops

Detente antes de escribir si:

- no hay `CONTRIBUTION-*` clara;
- falta `contribution_map.md`;
- no hay `skill_outputs/` utiles ni evidencia fuente suficiente;
- la PROP deberia incluir ejemplos raw pero los documentos solo existen como
  rutas externas no copiadas a `materials/`;
- la PROP espera que Canonical Editor copie ejemplos, fixtures, legacy markdown
  o carpetas por empresa, pero no los declara en `Materiales canonicos a copiar`
  y `Archivos canonicos esperados`;
- `Materiales canonicos a copiar` y las acciones `copiar` de `Archivos
  canonicos esperados` no estan sincronizadas;
- una `PROP-DVC` con ejemplos copiables no incluye
  `## Mapeo ejemplos a variantes DVC`;
- una `PROP-DVC` usa `Examples/`, `Ejemplos/` o `fixtures/` en raiz para
  ejemplos de variantes;
- una `PROP-DVC` declara un destino de ejemplo que no inicia con la misma
  variante indicada en `Variante canonica destino`;
- una `PROP-DVC` asigna ejemplos de una fuente a una variante distinta sin
  evidencia explicita;
- una `PROP-DVC` mapea directamente el mismo `spec_draft.md` a `spec.md` y a
  `README.md` sin declarar que `README.md` es un indice generado o sin contar
  con `README_draft.md`;
- el template vivo no trae las secciones nuevas y el agente no puede agregarlas
  manualmente al `proposal.md`;
- el usuario no aprobo la escritura exacta dentro del vault;
- no puedes determinar tipo de PROP;
- el cambio no es trazable a evidencia;
- el output no viviria en `02 Proposals/01 Draft/PROP-*/proposal.md`;
- la tarea pide aprobar, enrutar o aplicar;
- la tarea pide escribir canonicos o legacy;
- la PROP dependeria de documentos, campos, tolerancias o criterios inventados.

## Referencias

Lee `references/contract-map.md` antes de escribir PROPs.

Lee `references/examples.md` cuando necesites ejemplos de formato, bloqueo o atomicidad.

## Validacion final

Antes de terminar, confirma:

- cada PROP creada vive en `02 Proposals/01 Draft/PROP-*/proposal.md`;
- cada `proposal.md` cumple metadata minima y template vivo;
- cada evidencia referenciada existe o esta marcada como gap;
- cada ejemplo raw document referenciado existe dentro de `CONTRIBUTION-*/materials/`
  o esta marcado como bloqueo antes de crear PROP;
- cada material fisico que deba imprimirse en el canonico aparece en
  `Materiales canonicos a copiar` y tambien como accion `copiar` en
  `Archivos canonicos esperados`;
- en `PROP-DVC`, cada ejemplo copiable tiene mapeo fuente -> variante -> destino
  y el destino empieza con la variante declarada;
- no hay acciones `copiar` en `Archivos canonicos esperados` sin fila
  correspondiente en `Materiales canonicos a copiar`;
- no hay `Resultado de aplicacion`;
- no se creo `router_decision.md`, `analysis_report.md`, `questions_for_human.md`, `decision_record.md` ni `applied_record.md`;
- no se movieron colas;
- no se escribio en Benford Brain ni legacy;
- si se actualizo `contribution_map.md`, fue con aprobacion explicita.
