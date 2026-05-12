#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
ssh_target="${OPENCLAW_SSH_TARGET:-openclaw}"
remote_workspace="${OPENCLAW_PROSPECTING_WORKSPACE:-/root/.openclaw/workspace-prospecting-agent}"
local_skills_dir="$root_dir/apps/backoffice/openclaw-skills"
remote_skills_dir="$remote_workspace/skills"

ssh -o ClearAllForwardings=yes "$ssh_target" "mkdir -p '$remote_skills_dir'"
rsync -az --delete -e "ssh -o ClearAllForwardings=yes" "$local_skills_dir/" "$ssh_target:$remote_skills_dir/"

echo "Synced OpenClaw skills to $ssh_target:$remote_skills_dir"
