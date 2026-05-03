#!/usr/bin/env bash
set -euo pipefail

: "${BENFORD_VAULT_ROOT:?BENFORD_VAULT_ROOT is required}"

BENFORD_SKILLS_ROOT="${BENFORD_SKILLS_ROOT:-$HOME/benford/benford-skills}"
BENFORD_AUTOMATION_INTERVAL_MS="${BENFORD_AUTOMATION_INTERVAL_MS:-5000}"

cd "$BENFORD_SKILLS_ROOT"

exec bun run automations -- watch --write \
  --interval-ms "$BENFORD_AUTOMATION_INTERVAL_MS" \
  --vault-root "$BENFORD_VAULT_ROOT"
