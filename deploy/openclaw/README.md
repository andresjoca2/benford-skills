# OpenClaw Automation Runner

This deploys one central Benford automation runner on OpenClaw.

The runner does not make OpenClaw the source of truth. The source of truth
remains the shared `Benford Vault V3` folder. OpenClaw only observes the Vault
and invokes the deterministic engines in this repo.

## What This Runner Does

- Detects `CONTRIBUTION-*` folders with supported skill outputs and no
  generated PROP.
- Runs the deterministic `IMSS-Proposal-Generator` for supported contributions.
- Detects `02 Proposals/01 Draft/PROP-*`.
- Runs the deterministic Router Engine in write mode for draft proposals.
- Leaves `02 Needs Human Decision` waiting for a human.
- Runs the deterministic Canonical Editor for supported approved proposals in
  `03 Approved for Editor`.

The runner performs safe automatic proposal routing and applies supported
approved `PROP-DOC` packages through the deterministic Canonical Editor. It also
creates supported `PROP-DOC`, `PROP-DVC`, and `PROP-DOL` draft packages from
contributions automatically. Non-`PROP-DOC` proposals can be routed, but remain
pending until a compatible editor handler exists.

## Requirements

- OpenClaw can read and write the shared `Benford Vault V3` folder.
- `bun` is installed on OpenClaw.
- This repo is cloned on OpenClaw.
- The service user has permission to write operational files under
  `02 Proposals`.

## Install

Clone the repo on OpenClaw:

```bash
mkdir -p ~/benford
cd ~/benford
git clone https://github.com/andresjoca2/benford-skills.git
cd benford-skills
bun install
```

If the automation changes are not merged to `main` yet, use the active PR
branch:

```bash
git fetch origin
git switch codex/contribution-automation
bun install
```

Create an environment file:

```bash
mkdir -p ~/.config/benford
nano ~/.config/benford/automation.env
```

Example:

```bash
BENFORD_VAULT_ROOT=/path/to/Benford Vault V3
BENFORD_SKILLS_ROOT=/home/openc/benford/benford-skills
BENFORD_AUTOMATION_INTERVAL_MS=5000
# Optional if systemd cannot find bun:
# BUN_BIN=/root/.bun/bin/bun
```

Test manually first:

```bash
cd "$BENFORD_SKILLS_ROOT"
bun run automations -- check --vault-root "$BENFORD_VAULT_ROOT"
bun run automations -- run --vault-root "$BENFORD_VAULT_ROOT"
```

Only after the dry-run output looks right, test write mode:

```bash
bun run automations -- run --write --vault-root "$BENFORD_VAULT_ROOT"
```

## systemd User Service

Copy the service template:

```bash
mkdir -p ~/.config/systemd/user
cp deploy/openclaw/benford-automation.service ~/.config/systemd/user/
```

Edit the service if your repo is not under `~/benford/benford-skills`:

```bash
nano ~/.config/systemd/user/benford-automation.service
```

Enable and start:

```bash
systemctl --user daemon-reload
systemctl --user enable --now benford-automation.service
systemctl --user status benford-automation.service
```

Follow logs:

```bash
journalctl --user -u benford-automation.service -f
```

## Operational Notes

- Run only one central watcher against the shared Vault.
- Do not run laptop watchers at the same time.
- The runner is idempotent at the queue level: once a draft proposal is moved,
  it no longer appears in `01 Draft`.
- The contribution generator updates `contribution_map.md` after creating a
  `PROP-*`, and also checks existing proposals to avoid duplicates.
- If `systemctl --user status benford-automation.service` exits with
  `status=127`, systemd cannot find `bun`. Run `command -v bun`, then add
  `BUN_BIN=/absolute/path/to/bun` to `~/.config/benford/automation.env`.
