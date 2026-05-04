# Examples

## Prompt: New TEST

```text
Usa imss-add-task-specific sobre CONTRIBUTION-2026-05-03-rsm-cuotas.
La oficina es RSM Merida y quiero crear un TEST nuevo para Cuotas pagadas al Instituto
dentro de la metodologia RSM Merida. Produce drafts en skill_outputs/task-specific/.
No generes PROPs.
```

Expected output folder:

```text
skill_outputs/task-specific/TEST-rsm-merida-cuotas-pagadas/
├── README.md
├── evidence_sources.md
├── workpaper_model.md
├── sop.md
├── dict_mapping.md
├── insights_captured.md
└── notes.md
```

## Prompt: New METH

```text
Usa imss-add-task-specific sobre CONTRIBUTION-2026-05-03-rsm-merida-metodologia.
Quiero crear una metodologia nueva METH para RSM Merida. Produce drafts en
skill_outputs/task-specific/. No generes PROPs.
```

Expected output folder:

```text
skill_outputs/task-specific/METH-rsm-merida/
├── README.md
├── office_context.md
├── relation_to_dict.md
├── test_inventory.md
└── notes.md
```

## Blocking Example

If the user asks to write directly into `05 Benford Brain IMSS Mexico`, stop:

```text
No puedo escribir canónicos desde esta skill. El flujo correcto es:
skill_outputs/task-specific -> Proposal Builder -> Router -> Canonical Editor.
```
