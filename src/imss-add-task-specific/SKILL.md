---
name: imss-add-task-specific
description: >-
  Captura conocimiento Task Specific de auditoria IMSS y produce drafts METH-* o
  TEST-* dentro de CONTRIBUTION-*/skill_outputs/task-specific/. Usala cuando se
  necesite documentar una metodologia de firma/oficina, una prueba IMSS
  individual, un papel de trabajo, un SOP operativo, evidencia requerida,
  mapeos TEST-DICT-METH-AIM o reglas de cuadre sin crear canonicos ni PROPs.
---

# IMSS-Add-Task-Specific

## Proposito

Esta skill captura como una firma, oficina o auditor ejecuta una metodologia
IMSS (`METH-*`) o una prueba individual (`TEST-*`) y la convierte en drafts
operativos dentro de una contribution.

No publica canonicos. No genera PROPs. No toca legacy.

## Integracion con Benford Vault V3

Antes de hacer trabajo sustantivo, localiza la carpeta raiz `Benford AI Audit`.

Usa `BENFORD_ROOT` para resolver rutas.

Fuentes vivas que debes leer segun el caso:

- Contratos V3:
  - `${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/00 Sistema/contrato-metadata-minima.md`
  - `${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/00 Sistema/contrato-artefactos-operativos.md`
  - `${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/00 Sistema/convenciones-nombrado.md`
  - `${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/00 Sistema/roles-skills-agentes.md`
- Templates vivos:
  - `${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/02 Task Specific/Templates METH y TEST/METH-0000_template/`
  - `${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/02 Task Specific/Templates METH y TEST/TEST-0000_template/`

Lee `references/contract-map.md` antes de escribir outputs.
Lee `references/examples.md` solo cuando necesites ejemplos de forma.

## Preparacion de contribution

Cuando el usuario entregue rutas de archivos fuente que esten fuera de la
`CONTRIBUTION-*`, esos archivos son materiales candidatos. Antes de usarlos como
evidencia de una metodologia o prueba, la skill debe pedir el gate de escritura
del vault para copiarlos dentro de:

```text
CONTRIBUTION-*/materials/
```

Reglas de copia:

- copiar cada archivo fuente indicado por el usuario a `materials/`, preservando
  el nombre original cuando no haya conflicto;
- si ya existe un archivo con el mismo nombre, no sobrescribirlo sin aprobacion
  explicita; proponer un sufijo claro como `_v2` o la fecha `YYYY-MM-DD`;
- despues de copiar, usar la copia dentro de `materials/` como evidencia
  primaria de la corrida;
- registrar en los outputs la ruta dentro de `materials/` y, cuando sea util,
  la ruta fuente original como procedencia;
- no copiar carpetas completas salvo que el usuario haya autorizado
  explicitamente esa carpeta como material fuente.

Cuando la conversacion de la sesion sea evidencia para la contribution, guardar
un transcript operativo en:

```text
CONTRIBUTION-*/session_transcript.md
```

`call_transcript.md` solo se crea o usa cuando el usuario entregue una
transcripcion de llamada real. Si no existe transcripcion de llamada, no
inventarla ni bloquear la contribution por esa ausencia.

## Estado de automatizacion de contribution
Toda `contribution_map.md` creada o preparada por esta skill debe incluir en
`## Identificacion` el campo:

```md
| Estado | draft |
| Estado automation | draft |
```

Plantilla minima obligatoria para `contribution_map.md`:

```md
# Contribution Map - CONTRIBUTION-YYYY-MM-DD-slug

## Identificacion

| Campo | Valor |
|---|---|
| ID | CONTRIBUTION-YYYY-MM-DD-slug |
| Estado | draft |
| Estado automation | draft |
| Fecha creacion | YYYY-MM-DD |
| Ultima actualizacion | YYYY-MM-DD |
| Owner operativo | imss-add-task-specific |
```

Reglas:

- `draft` significa que la contribution esta en armado y cualquier automation
  runner debe ignorarla aunque ya existan archivos bajo `skill_outputs/`;
- `drafts-ready` solo puede usarse junto con `Estado automation` = `ready`;
  no dejes una contribution en `Estado` = `drafts-ready` y
  `Estado automation` = `draft`, porque el runner la va a ignorar aunque parezca
  lista para el operador;
- la skill puede copiar `materials/`, guardar `session_transcript.md`, actualizar
  `contribution_map.md` y escribir drafts manteniendo `Estado automation` en
  `draft`;
- no cambiar `Estado automation` a `ready` mientras falten materiales, drafts,
  revision de gaps, validacion final o aprobacion explicita del usuario;
- solo al final, despues de mostrar el resumen de rutas finales y recibir
  aprobacion explicita del usuario para publicar la contribution al runner,
  puede actualizar `contribution_map.md` a:

```md
| Estado | drafts-ready |
| Estado automation | ready |
```

El valor exacto que activa automatizacion es `ready`. Si el campo falta o tiene
cualquier otro valor, el runner debe ignorar la contribution.

## Permisos

Puede leer:

- `CONTRIBUTION-*/contribution_map.md`
- `CONTRIBUTION-*/materials/`
- `CONTRIBUTION-*/call_transcript.md`
- `CONTRIBUTION-*/session_transcript.md`
- `CONTRIBUTION-*/session_conversation.md` solo como alias legacy de lectura si
  ya existe en una contribution antigua
- canónicos `METH-*`, `TEST-*`, `DICT-*`, `AIM-*`, `DOC-*`, `DVC-*`, `DOL-*` relacionados
- templates vivos `METH-0000_template` y `TEST-0000_template`
- contratos en `00 Sistema/`

Durante preparacion de contribution, puede escribir solo estas rutas, siempre
despues del gate de escritura del vault:

```text
01 Contribuciones/CONTRIBUTION-*/materials/<archivo-fuente-copiado>
01 Contribuciones/CONTRIBUTION-*/session_transcript.md
01 Contribuciones/CONTRIBUTION-*/contribution_map.md
```

Durante generacion de drafts, puede escribir solo dentro de:

```text
01 Contribuciones/CONTRIBUTION-*/skill_outputs/task-specific/
```

Antes de cualquier escritura dentro de `05 Benford Vault/`, incluso dentro de
`01 Contribuciones`, debe aplicar el gate de escritura del vault:

1. listar las rutas exactas que quiere crear o modificar;
2. explicar por que esas rutas pertenecen a esa contribution y no a una carpeta temporal;
3. esperar aprobacion explicita del usuario en esa misma sesion.

Sin esa aprobacion, la skill solo puede producir preview o registrar el bloqueo en
la conversacion. No debe escribir archivos.

Puede actualizar `contribution_map.md` solo bajo estas condiciones:

- la aprobacion explicita de escritura al vault ya fue otorgada;
- la actualizacion se limita a agregar o corregir renglones de `Materiales
  fuente` para archivos copiados a `materials/`, y/o a la tabla `Skills
  ejecutadas`;
- no cambia el `Estado` generico, `Canonicos potencialmente afectados`,
  `Proposals generadas` ni decisiones;
- mantiene `Estado automation` en `draft` durante el armado;
- solo cambia `Estado automation` a `ready` como ultima accion, despues de una
  aprobacion explicita separada del usuario para activar el runner;
- cuando cambia `Estado automation` a `ready`, tambien cambia `Estado` a
  `drafts-ready`; esos dos campos deben mantenerse sincronizados;
- antes de escribir, muestra el diff o los renglones exactos que agregara.

No puede escribir:

- `02 Proposals/`
- `05 Benford Brain IMSS Mexico/`
- `06 Benford Brain EF Mexico/`
- carpetas legacy como `01 IMSS Mexico/`
- templates vivos
- `.codex/skills/` durante una corrida normal

## Workflow

1. Identifica la contribution origen.
2. Lee `contribution_map.md` e inventaria materiales fuente.
3. Si el usuario dio rutas externas, pide gate del vault, copia esos archivos a
   `materials/` y usa solo esas copias como evidencia primaria.
4. Si la sesion contiene evidencia no repetible, pide gate del vault y guarda
   `session_transcript.md`.
5. Si copia materiales, pide gate del vault y actualiza solo los renglones
   correspondientes de `Materiales fuente` en `contribution_map.md`.
6. Confirma el ambito: `METH nueva`, `METH existente`, `TEST nuevo` o `TEST existente`.
7. Identifica firma, oficina, auditor fuente, DICT target y METH target cuando apliquen.
8. Lee el template vivo correspondiente.
9. Si es enriquecimiento, lee tambien el canónico existente.
10. Separa hechos observados, criterio auditor, inferencias y dudas.
11. Traduce papeles de trabajo a operaciones sobre fuentes, tablas, campos, llaves, cruces, validaciones y outputs.
12. Antes de escribir drafts, ejecuta el gate de escritura del vault y espera aprobacion explicita.
13. Produce drafts en `skill_outputs/task-specific/`.
14. Mantiene `Estado` y `Estado automation` en `draft` mientras valida outputs.
15. Deja en `notes.md` que PROPs podria generar Proposal Builder.
16. Muestra resumen final de rutas creadas, gaps y readiness; pregunta
    explicitamente si debe cambiar `Estado automation` a `ready`.
17. Solo si el usuario aprueba esa publicacion final, actualiza
    `contribution_map.md` a `Estado | drafts-ready |` y
    `Estado automation | ready |`.

## Outputs

Para `METH-*`:

```text
skill_outputs/task-specific/METH-slug/
├── README.md
├── office_context.md
├── relation_to_dict.md
├── test_inventory.md
└── notes.md
```

Para `TEST-*`:

```text
skill_outputs/task-specific/TEST-slug/
├── README.md
├── evidence_sources.md
├── workpaper_model.md
├── sop.md
├── dict_mapping.md
├── insights_captured.md
└── notes.md
```

No produzcas `delivery.md` ni `reconciliation.md`. Si la evidencia usa esos
terminos legacy, traducelos asi:

| Termino legacy | Salida V3 |
|---|---|
| delivery | variables, outputs auditados y mapeos en `README.md`, `dict_mapping.md` o `workpaper_model.md` |
| reconciliation | cruces, validaciones y criterios de cierre en `sop.md` y `workpaper_model.md` |

## Metadata minima

Todo output debe incluir:

```md
## Identificacion

| Campo | Valor |
|---|---|
| ID | Pendiente |
| Tipo | skill_output |
| Estado | draft |
| Fecha creacion | YYYY-MM-DD |
| Ultima actualizacion | YYYY-MM-DD |
| Owner operativo | IMSS-Add-Task-Specific |
| Contribution origen | CONTRIBUTION-* |
| Skill origen | IMSS-Add-Task-Specific |
| Output tipo | meth_draft / test_draft / evidence_sources / workpaper_model / sop / dict_mapping / insights / notes |
```

Bloques requeridos:

- `Proposito`
- `Evidencia usada`
- `Contenido producido`
- `Limitaciones o dudas`
- `Sugerencias para Proposal Builder`

## Hard stops

Detente o produce solo `notes.md` con bloqueo si:

- falta `contribution_map.md`;
- no hay evidencia fuente real ni transcripcion suficiente;
- no queda claro si el trabajo es `METH` o `TEST`;
- falta el template vivo correspondiente;
- el usuario pide escribir canónicos, PROPs o legacy;
- la tarea requiere resolver contradiccion canonica sin decision humana;
- falta spec/schema de un documento requerido y el output dependeria de campos inventados.

## Reglas de calidad

- No inventes metodologia, documentos, campos, tolerancias ni criterios de cierre.
- Si el usuario nombra documentos concretos, esa lista es el universo inicial autorizado.
- No uses documentos fuera de la lista autorizada sin pedir aprobacion.
- Si los documentos autorizados vienen de rutas externas, no los trates como
  evidencia primaria hasta copiarlos a `materials/` con gate del vault.
- No documentes logica con celdas, rangos, filas o columnas de Excel.
- Traduce coordenadas de Excel a tablas, campos, llaves, cruces, validaciones y outputs.
- Si una relacion `TEST -> DICT -> METH -> AIM` no puede cerrarse, dejala como gap.
- Mantén dudas separadas de conclusiones.

## Validacion Final

Antes de terminar, confirma:

- todos los drafts creados viven en `skill_outputs/task-specific/`;
- si se usaron rutas externas, sus copias viven en `materials/` y las rutas de
  evidencia apuntan a esas copias;
- si la conversacion fue evidencia, existe `session_transcript.md`;
- `contribution_map.md` contiene `Estado automation`;
- si la contribution no fue aprobada explicitamente para runner, `Estado` y
  `Estado automation` siguen en `draft`;
- si el usuario aprobo publicar al runner, `Estado` quedo en `drafts-ready` y
  `Estado automation` quedo en `ready`;
- si se actualizo `contribution_map.md`, solo cambiaron `Materiales fuente`,
  `Skills ejecutadas` y, cuando hubo aprobacion final separada, `Estado` /
  `Estado automation`;
- no se escribio en Benford Brain;
- no se escribio en `02 Proposals`;
- no se toco legacy.
