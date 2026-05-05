#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
codex_skills_dir="${CODEX_SKILLS_DIR:-$HOME/.codex/skills}"
backup_dir="$codex_skills_dir/_backup-benford-$(date +%Y%m%d-%H%M%S)"

mkdir -p "$backup_dir"

link_skill() {
  local installed_name="$1"
  local source_dir="$2"
  local target="$repo_root/$source_dir"
  local installed="$codex_skills_dir/$installed_name"

  if [[ ! -f "$target/SKILL.md" ]]; then
    echo "Missing skill source: $target/SKILL.md" >&2
    exit 1
  fi

  if [[ -L "$installed" ]]; then
    mv "$installed" "$backup_dir/$installed_name.symlink"
  elif [[ -e "$installed" ]]; then
    mv "$installed" "$backup_dir/$installed_name"
  fi

  ln -s "$target" "$installed"
  echo "$installed_name -> $target"
}

link_skill "IMSS-Add-Explicit-Knowledge" "src/imss-add-explicit-knowledge"
link_skill "IMSS-Add-Task-Specific" "src/imss-add-task-specific"
link_skill "IMSS-Proposal-Generator" "src/imss-proposal-generator"
link_skill "benford-canonical-editor" "src/benford-canonical-editor"
link_skill "benford-router-engine" "src/benford-router-engine"
link_skill "imss-document-spec-builder" "src/imss-document-spec-builder"
link_skill "imss-test-builder" "src/imss-test-builder"

echo "Backup: $backup_dir"
