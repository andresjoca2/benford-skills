#!/usr/bin/env bash
set -euo pipefail

: "${BENFORD_VAULT_ROOT:?BENFORD_VAULT_ROOT is required}"

BENFORD_SKILLS_ROOT="${BENFORD_SKILLS_ROOT:-$HOME/benford/benford-skills}"
BENFORD_AUTOMATION_INTERVAL_MS="${BENFORD_AUTOMATION_INTERVAL_MS:-5000}"
BUN_BIN="${BUN_BIN:-}"
export PATH="$HOME/.bun/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

if [[ -z "$BUN_BIN" ]]; then
  BUN_BIN="$(command -v bun)"
else
  export PATH="$(dirname "$BUN_BIN"):$PATH"
fi

cd "$BENFORD_SKILLS_ROOT"

exec "$BUN_BIN" run automations -- watch --write \
  --interval-ms "$BENFORD_AUTOMATION_INTERVAL_MS" \
  --vault-root "$BENFORD_VAULT_ROOT"
