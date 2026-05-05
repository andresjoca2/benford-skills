# Contract Map

## Vault Contracts

Read these before producing outputs:

```text
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/00 Sistema/contrato-metadata-minima.md
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/00 Sistema/contrato-artefactos-operativos.md
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/00 Sistema/convenciones-nombrado.md
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/00 Sistema/roles-skills-agentes.md
```

## Live Task Specific Templates

Use these as source templates:

```text
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/02 Task Specific/Templates METH y TEST/METH-0000_template/
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/05 Benford Brain IMSS Mexico/02 Task Specific/Templates METH y TEST/TEST-0000_template/
```

## Allowed Output Root

Contribution preparation can copy source evidence into:

```text
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/01 Contribuciones/<source>/CONTRIBUTION-*/materials/<copied-source-file>
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/01 Contribuciones/<source>/CONTRIBUTION-*/session_transcript.md
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/01 Contribuciones/<source>/CONTRIBUTION-*/contribution_map.md
```

These paths require the vault write gate. `session_transcript.md` stores the
operational conversation transcript when that conversation is evidence.
`call_transcript.md` is reserved for real call transcripts supplied by the user.
`contribution_map.md` may only be updated to reflect copied source materials and
executed skills, not canonical decisions.

If copied source materials must also travel to a future canonical target,
declare that in `contribution_map.md` under `## Materiales canonicos sugeridos`
instead of creating a separate manifest. `Destino canonico esperado` is relative
to the target canonical folder.

`contribution_map.md` must include `Estado` and `Estado automation` in
`## Identificacion`. The default value while the contribution is being assembled
is `draft` for both; they may only change to `drafts-ready` / `ready` as the
final action after explicit user approval to publish the contribution to the
runner. Any `Estado automation` value other than `ready`, including a missing
field, must be treated as not ready for automation. Do not leave `Estado` =
`drafts-ready` with `Estado automation` = `draft`.

Minimum required block:

```md
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

Draft outputs live in:

```text
${BENFORD_ROOT}/05 Benford Vault/Benford Vault V3/01 Contribuciones/<source>/CONTRIBUTION-*/skill_outputs/task-specific/
```

## METH Draft Files

```text
METH-slug/
├── README.md
├── office_context.md
├── relation_to_dict.md
├── test_inventory.md
└── notes.md
```

## TEST Draft Files

```text
TEST-slug/
├── README.md
├── evidence_sources.md
├── workpaper_model.md
├── sop.md
├── dict_mapping.md
├── insights_captured.md
└── notes.md
```

## Forbidden Outputs

Do not produce:

- `delivery.md`
- `reconciliation.md`
- `changelog.md`
- `proposal.md`
- `applied_record.md`
- canonical files under Benford Brain
