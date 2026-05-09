# Contract Map

## Contratos del vault
Leer cuando haga falta:

```text
05 Benford Vault/Benford Vault V3/00 Sistema/contrato-metadata-minima.md
05 Benford Vault/Benford Vault V3/00 Sistema/contrato-artefactos-operativos.md
05 Benford Vault/Benford Vault V3/00 Sistema/convenciones-nombrado.md
05 Benford Vault/Benford Vault V3/00 Sistema/roles-skills-agentes.md
```

## Ruta de salida
Cada corrida que escriba debe crear una contribution nueva. No editar ni buscar
contributions existentes.

La preparacion de contribution puede crear/copiar evidencia dentro de:

```text
05 Benford Vault/Benford Vault V3/01 Contribuciones/<grupo>/CONTRIBUTION-*/materials/<archivo-fuente-copiado>
05 Benford Vault/Benford Vault V3/01 Contribuciones/<grupo>/CONTRIBUTION-*/session_conversation.md
05 Benford Vault/Benford Vault V3/01 Contribuciones/<grupo>/CONTRIBUTION-*/contribution_map.md
```

Estas rutas requieren el gate de escritura del vault. `session_conversation.md`
guarda la conversacion operativa de la sesion cuando esa conversacion sea
evidencia. `call_transcript.md` queda reservado para transcripciones de llamada
reales entregadas por el usuario. `contribution_map.md` solo puede actualizarse
en la nueva contribution de la corrida, para reflejar materiales copiados y
skills ejecutadas; no para registrar decisiones canonicas.

Cuando materiales fuente copiados deban viajar tambien al canonico target,
declaralo en `contribution_map.md` bajo `## Materiales canonicos sugeridos`. No
crees un manifiesto separado para materiales fuente DOC o DOL.

Columnas requeridas:

```md
| Origen en contribution | Destino canonico esperado | Tipo | Copiar | Nota |
|---|---|---|---|---|
| materials/Reg_LSS_MACERF.pdf | source_documents/Reg_LSS_MACERF.pdf | fuente_legal_original | si | PDF fuente usado para transcripcion DOL. |
```

`Destino canonico esperado` es relativo a la carpeta canonica target. Para
`DOL-*`, usa `source_documents/<archivo>` para PDFs legales fuente.
Si el output es `DOL-*` y hay un PDF, Word, HTML o TXT legal completo en
`materials/`, no marques la contribution como `ready` hasta declarar esa copia
en `Materiales canonicos sugeridos`.

`contribution_map.md` debe incluir `Estado` y `Estado automation` en
`## Identificacion`. El valor default durante armado es `draft` para ambos; solo
pueden cambiar a `drafts-ready` / `ready` como ultima accion despues de
aprobacion explicita del usuario para publicar la contribution al runner.
Cualquier valor de `Estado automation` distinto de `ready`, incluyendo ausencia
del campo, debe ser tratado como no listo para automatizacion. No dejes
`Estado` = `drafts-ready` con `Estado automation` = `draft`.

Bloque minimo obligatorio:

```md
## Identificacion

| Campo | Valor |
|---|---|
| ID | CONTRIBUTION-YYYY-MM-DD-slug |
| Estado | draft |
| Estado automation | draft |
| Fecha creacion | YYYY-MM-DD |
| Ultima actualizacion | YYYY-MM-DD |
| Owner operativo | imss-add-explicit-knowledge |
```

La salida de la skill vive dentro de una contribution:

```text
05 Benford Vault/Benford Vault V3/01 Contribuciones/<grupo>/CONTRIBUTION-*/skill_outputs/explicit_knowledge/TYPE-slug/
```

## Outputs por tipo
| Tipo | Outputs esperados |
|---|---|
| `DOC` | `spec_draft.md`, `schema_draft.md`, `parser_config_draft.md`, `notes.md` |
| `DVC` | `spec_draft.md`, `notes.md`, `source_documents_map.md` si existen ejemplos fisicos, y por variante: `<Variante>/raw_schema_draft.md`, `<Variante>/mapping_draft.md`, `<Variante>/parser_config_draft.md` |
| `DOL` | `spec_draft.md`, `document_transcript_draft.md`, `notes.md` |

Para `DOL`, `document_transcript_draft.md` es el output primario cuando el
material fuente es una ley, reglamento o documento normativo completo. Debe
contener la transcripcion del texto fuente. Extractos o transcripcion parcial
solo son validos si el usuario lo aprobo explicitamente antes de escribir.

## Metadata minima
Esta metadata no es un template documental. No reemplaza la estructura canonica
de `DOC-0000_template`, `DVC-0000_template` o `DOL-0000_template`.

Usarla solo de estas formas:

- en `notes.md`;
- en manifests operativos de la contribution;
- dentro de un draft tecnico solo cuando el template canonico ya tenga un bloque
  compatible de identificacion.

No insertar estos bloques para reemplazar la jerarquia de secciones de
`spec_draft.md`, `schema_draft.md`, `raw_schema_draft.md`,
`mapping_draft.md`, `parser_config_draft.md` ni
`document_transcript_draft.md`.

Cuando aplique, la metadata minima es:

```md
## Identificacion

| Campo | Valor |
|---|---|
| ID | Pendiente |
| Tipo | skill_output |
| Estado | draft |
| Fecha creacion | YYYY-MM-DD |
| Ultima actualizacion | YYYY-MM-DD |
| Owner operativo | imss-add-explicit-knowledge |
| Contribution origen | CONTRIBUTION-* |
| Skill origen | imss-add-explicit-knowledge |
| Output tipo | doc_draft / dvc_draft / dol_draft / schema_draft / raw_schema_draft / mapping_draft / parser_config_draft / document_transcript_draft / notes |
```

## Templates canonicos relevantes
Abrirlos antes de redactar. Usarlos como fuente de estructura, no escribirlos
directamente. La skill debe conservar headings, orden de secciones, tablas base
y placeholders del template correspondiente.

### DOC
```text
05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-0000_template/spec.md
05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-0000_template/schema.md
05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOC Documentos y Ejemplos/DOC-0000_template/parser_config.md
```

### DVC
```text
05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-0000_template/README.md
05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-0000_template/spec.md
05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-0000_template/Variante x/raw_schema.md
05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-0000_template/Variante x/mapping.md
05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DVC Documentos Variables Cliente/DVC-0000_template/Variante x/parser_config.md
```

Para DVC, `README.md` define la estructura de familia y la separacion entre
documento variable y variante. Los outputs no tienen que crear un README draft
salvo instruccion explicita; deben usarlo como guia estructural.

La salida DVC debe preservar esa separacion:

```text
DVC-<slug-documento>/
  spec_draft.md
  notes.md
  source_documents_map.md  # obligatorio si existen ejemplos fisicos
  <Variante A>/
    raw_schema_draft.md
    mapping_draft.md
    parser_config_draft.md
  <Variante B>/
    raw_schema_draft.md
    mapping_draft.md
    parser_config_draft.md
```

No crear `DVC-<slug>-<variante>` como canonico separado cuando las variantes
pertenecen al mismo documento variable.

Si la contribution tiene ejemplos bajo `materials/source_documents/examples/`,
`source_documents_map.md` es obligatorio antes de publicar al runner. El
Proposal Generator usa este archivo como fuente de verdad y no infiere variante
por nombre de carpeta.

Formato minimo:

```md
## Mapa de ejemplos por variante

| Variante | Origen en materials | Copiar como ejemplo | Nota |
|---|---|---|---|
| Variante A | materials/source_documents/examples/Cliente A | si | Carpeta completa de la variante A. |
| Variante B | materials/source_documents/examples/Cliente Mixto/archivo-b.xlsx | si | Archivo especifico de la variante B. |
```

Reglas:

- `Variante` debe coincidir con una carpeta de variante del output DVC;
- `Origen en materials` debe existir dentro de la contribution;
- cuando una carpeta fuente contiene archivos de varias variantes, crear filas
  por archivo;
- no marcar `Estado automation` como `ready` si hay ejemplos fisicos y falta
  este manifiesto o alguna asignacion esta dudosa.

### DOL
```text
05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOL Documentos de Leyes/DOL-0000_template/spec.md
05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOL Documentos de Leyes/DOL-0000_template/document_transcript.md
```

Reglas DOL:

- `spec_draft.md` interpreta alcance, vigencia, relaciones y riesgos.
- `document_transcript_draft.md` transcribe la fuente; no resume ni interpreta.
- Si la fuente es PDF, preservar UTF-8 y marcar paginas o fragmentos trazables.
- No normalizar a ASCII.
- No omitir articulos por relevancia auditora salvo aprobacion explicita.
- Si no hay texto extraible, detenerse y pedir autorizacion para OCR.

## Fuera de alcance
`AIM` y `DICT` no se procesan con esta skill. Si el material parece target
oficial, card, pestana, prueba, seccion o entregable del dictamen, detenerse y
explicar que no aplica aqui.

## Regla de no bypass
La skill no crea PROPs ni canonicos.

El paso siguiente siempre es Proposal Builder.
