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

La salida de la skill vive dentro de una contribution:

```text
05 Benford Vault/Benford Vault V3/01 Contribuciones/<grupo>/CONTRIBUTION-*/skill_outputs/explicit_knowledge/TYPE-slug/
```

## Outputs por tipo
| Tipo | Outputs esperados |
|---|---|
| `DOC` | `spec_draft.md`, `schema_draft.md`, `parser_config_draft.md`, `notes.md` |
| `DVC` | `spec_draft.md`, `raw_schema_draft.md`, `mapping_draft.md`, `parser_config_draft.md`, `notes.md` |
| `DOL` | `spec_draft.md`, `document_transcript_draft.md`, `notes.md` |

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

### DOL
```text
05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOL Documentos de Leyes/DOL-0000_template/spec.md
05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/01 Explicit Knowledge/DOL Documentos de Leyes/DOL-0000_template/document_transcript.md
```

## Fuera de alcance
`AIM` y `DICT` no se procesan con esta skill. Si el material parece target
oficial, card, pestana, prueba, seccion o entregable del dictamen, detenerse y
explicar que no aplica aqui.

## Regla de no bypass
La skill no crea PROPs ni canonicos.

El paso siguiente siempre es Proposal Builder.
