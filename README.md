# benford-skills

Portable Benford skills and deterministic local engines.

## Vault Location

This repo must not contain a `vault/` copy. The source of truth is each user's
local Google Drive / Drive-synced `Benford Vault V3` folder.

Use this repo for:

- Codex skills
- deterministic engines
- tests and fixtures
- operational wrappers

Do not use this repo for canonical Benford Brain content.

## Local Codex Skill Install

Codex reads local skills from `~/.codex/skills`. For Benford skills, keep this
repo as the source of truth and make the installed skill folders symlinks to
`src/*`.

One-time setup:

```bash
bun run link:local
```

After that, updating the repo updates the installed skills:

```bash
git pull --ff-only
```

`git fetch origin` only downloads refs; it does not change local files. Use
`git pull --ff-only` when you want Codex to read the latest checked-out version.

## Benford Router Engine

The router is a deterministic CLI for Benford Vault V3 proposal queues. The code lives in this repo; each user points it at their own local `Benford Vault V3` folder.

```bash
bun install

# one-time local config, not committed
bun run router -- init --vault-root "/path/to/Benford Vault V3"

# inspect draft queue
bun run router -- check

# dry-run is the default and writes nothing
bun run router -- run --proposal PROP-0001

# write mode creates router_decision.md, analysis_report.md,
# questions_for_human.md when needed, and moves the PROP folder
bun run router -- run --proposal PROP-0001 --write
bun run router -- run --all-draft --write
```

You can also skip local config and use `BENFORD_VAULT_ROOT` or pass `--vault-root` on every command.

The engine only writes operational files inside the processed `PROP-*` package and only moves proposal folders between proposal queues. It does not write to canonical Benford Brain folders.

In normal use, humans should not need to run these commands manually. Skills and
agents should invoke the CLI through `src/benford-router-engine/SKILL.md`,
using dry-run first and `--write` only when the user has approved the queue move
or when a trusted backoffice action triggers it.

## Proposal Automations

Proposal automations are a light orchestration layer over Vault folders. They do
not add a database. The Vault remains the source of truth, and contribution
status plus queue membership drive the next action.

Current rules:

- `01 Contribuciones/**/CONTRIBUTION-*` with `Estado automation=ready` in
  `contribution_map.md`, supported `DOC-*`, `DVC-*`, or `DOL-*` skill outputs,
  and no generated PROP for that target -> run deterministic
  `IMSS-Proposal-Generator`.
- `DVC-*` outputs with physical examples under
  `materials/source_documents/examples/` must include
  `source_documents_map.md`; otherwise the contribution is reported as skipped
  instead of guessing variant destinations.
- `02 Proposals/01 Draft` -> run the deterministic Router Engine.
- `02 Proposals/02 Needs Human Decision` -> wait for a human decision.
- `02 Proposals/03 Approved for Editor` -> run the deterministic Canonical
  Editor for supported approved PROPs.
- `02 Proposals/04 Applied` and `02 Proposals/05 Rejected` -> terminal queues.

Humans should normally interact through `src/benford-proposal-automation/SKILL.md`.
The CLI is the portable mechanism that skill and backoffice actions call.

```bash
bun run automations -- check --vault-root "/path/to/Benford Vault V3"
bun run automations -- run --vault-root "/path/to/Benford Vault V3"
bun run automations -- run --write --vault-root "/path/to/Benford Vault V3"
bun run automations -- watch --interval-ms 5000 --vault-root "/path/to/Benford Vault V3"
```

`check` also reports skipped contributions with supported outputs, including
missing or non-ready `Estado automation`, so incomplete contribution maps do not
fail silently.
For DVC outputs it also reports missing `source_documents_map.md` when examples
exist, because example folders can contain files for multiple variants.

## Canonical Editor Engine

The Canonical Editor CLI applies supported approved PROPs to canonical Brain
folders. It supports new `PROP-DOC`, `PROP-DVC`, and `PROP-DOL` packages in
`03 Approved for Editor` whose drafts are listed in `Drafts usados` and whose
approval is recorded by `router_decision.md` or `decision_record.md`.

For DVC, the canonical shape follows
`DVC Documentos Variables Cliente/DVC-0000_template`: one parent DVC folder with
shared `README.md`, `spec.md`, and `changelog.md`, plus one subfolder per
variant containing `raw_schema.md`, `mapping.md`, and `parser_config.md`.
Example materials are copied per variant from the proposal's
`Materiales canonicos a copiar`, which is generated from
`source_documents_map.md`.

```bash
# dry-run is the default and writes nothing
bun run canonical-editor -- run --proposal PROP-0001 --vault-root "/path/to/Benford Vault V3"

# write mode creates canonical files, applied_record.md, and moves the PROP
bun run canonical-editor -- run --proposal PROP-0001 --write --vault-root "/path/to/Benford Vault V3"
bun run canonical-editor -- run --all-approved --write --vault-root "/path/to/Benford Vault V3"
```

## Validation

```bash
bun run test:router
bun run test:automations
bun run test:canonical-editor
bun run lint:router
bun run lint:automations
bun run lint:canonical-editor
bun run typecheck
```
