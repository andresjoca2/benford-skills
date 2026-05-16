#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
ssh_target="${OPENCLAW_SSH_TARGET:-openclaw}"
remote_workspace="${OPENCLAW_PROSPECTING_WORKSPACE:-/root/.openclaw/workspace-prospecting-agent}"
local_skills_dir="$root_dir/apps/backoffice/openclaw-skills"
local_agents_dir="$root_dir/apps/backoffice/openclaw-agents"
remote_skills_dir="$remote_workspace/skills"
agent_id="${OPENCLAW_PROSPECTING_AGENT_ID:-prospecting-agent}"
local_agent_dir="$local_agents_dir/$agent_id"

ssh -o ClearAllForwardings=yes "$ssh_target" "mkdir -p '$remote_skills_dir'"
rsync -az --delete -e "ssh -o ClearAllForwardings=yes" "$local_skills_dir/" "$ssh_target:$remote_skills_dir/"

if [ -d "$local_agent_dir" ]; then
  rsync -az -e "ssh -o ClearAllForwardings=yes" "$local_agent_dir/SOUL.md" "$ssh_target:$remote_workspace/SOUL.md"
  rsync -az -e "ssh -o ClearAllForwardings=yes" "$local_agent_dir/TOOLS.md" "$ssh_target:$remote_workspace/TOOLS.md"
fi

echo "Synced OpenClaw skills to $ssh_target:$remote_skills_dir"
echo "Synced OpenClaw agent profile $agent_id to $ssh_target:$remote_workspace"

if [ "${OPENCLAW_REFRESH_AGENT_CONTEXT:-0}" = "1" ]; then
  remote_sessions_dir="/root/.openclaw/agents/$agent_id/sessions"
  ssh -o ClearAllForwardings=yes "$ssh_target" "set -euo pipefail
    stamp=\$(date +%Y%m%d%H%M%S)
    mkdir -p '$remote_sessions_dir/backups'
    [ -f '$remote_sessions_dir/sessions.json' ] && cp '$remote_sessions_dir/sessions.json' '$remote_sessions_dir/backups/sessions.json.bak-before-sync-'\$stamp || true
    find '$remote_sessions_dir' -maxdepth 1 -type f -name '*.jsonl' -exec cp {} '$remote_sessions_dir/backups/' \\; 2>/dev/null || true
    printf '{}\n' > '$remote_sessions_dir/sessions.json'
    openclaw gateway restart >/tmp/backoffice-openclaw-gateway-restart.log 2>&1 || true
  "
  echo "Refreshed OpenClaw session context for $agent_id; previous sessions were backed up under $remote_sessions_dir/backups"
fi
