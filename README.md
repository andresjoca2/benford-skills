# benford-skills

Portable Benford skills and deterministic local engines.

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

## Validation

```bash
bun run test:router
bun run lint:router
bun run typecheck
```
