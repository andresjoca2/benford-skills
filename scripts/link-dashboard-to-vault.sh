#!/usr/bin/env bash
# Crea Dashboard.html dentro del Benford Vault como symlink al dashboard del repo.
# Cada usuario corre esto una vez después de clonar el repo (es per-machine).
#
# Uso:
#   bun run dashboard:link
#   bun run dashboard:link -- --vault-root "/path/to/Benford Vault V3"
#
# Resolución del vault (en orden):
#   1) --vault-root <path>
#   2) BENFORD_VAULT_ROOT env var
#   3) vaultRoot en .benford-router.json

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DASHBOARD_HTML="$REPO_ROOT/dashboard/index.html"

VAULT_ROOT=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --vault-root)
      VAULT_ROOT="$2"
      shift 2
      ;;
    *)
      echo "Opción desconocida: $1" >&2
      exit 1
      ;;
  esac
done

if [[ -z "$VAULT_ROOT" && -n "${BENFORD_VAULT_ROOT:-}" ]]; then
  VAULT_ROOT="$BENFORD_VAULT_ROOT"
fi

if [[ -z "$VAULT_ROOT" && -f "$REPO_ROOT/.benford-router.json" ]]; then
  VAULT_ROOT="$(python3 -c "import json,sys; d=json.load(open('$REPO_ROOT/.benford-router.json')); print(d.get('vaultRoot',''))" 2>/dev/null || echo "")"
fi

if [[ -z "$VAULT_ROOT" ]]; then
  echo "ERROR: no encontré el path al vault." >&2
  echo "  Opciones:" >&2
  echo "    bun run dashboard:link -- --vault-root '/path/to/Benford Vault V3'" >&2
  echo "    BENFORD_VAULT_ROOT='...' bun run dashboard:link" >&2
  echo "    bun run router -- init --vault-root '...'  (deja .benford-router.json)" >&2
  exit 1
fi

if [[ ! -d "$VAULT_ROOT" ]]; then
  echo "ERROR: vault no existe: $VAULT_ROOT" >&2
  exit 1
fi

if [[ ! -f "$DASHBOARD_HTML" ]]; then
  echo "ERROR: dashboard no existe: $DASHBOARD_HTML" >&2
  echo "  Asegúrate de tener el repo completo." >&2
  exit 1
fi

LINK_PATH="$VAULT_ROOT/Dashboard.html"

# Si ya existe, confirma antes de sobreescribir
if [[ -e "$LINK_PATH" || -L "$LINK_PATH" ]]; then
  echo "Ya existe $LINK_PATH (será reemplazado)"
  rm -f "$LINK_PATH"
fi

ln -s "$DASHBOARD_HTML" "$LINK_PATH"
echo "✓ Creado symlink:"
echo "  $LINK_PATH"
echo "  → $DASHBOARD_HTML"
echo ""
echo "Doble-click sobre Dashboard.html en Finder para abrirlo."
echo "Para refrescar el snapshot: bun run dashboard:refresh"
