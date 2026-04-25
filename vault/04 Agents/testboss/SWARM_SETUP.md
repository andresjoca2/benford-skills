# Swarm Setup (TestBoss = Zoe)

This workspace now ships a minimal implementation of the swarm workflow from `agent-swarm-playbook.md`. TestBoss acts as Zoe: scopes requests, injects context into prompts, spawns coding agents, and monitors their sessions.

## Directory Layout

```
.clawdbot/
  active-tasks.json   # Registry of live/finished agents
  check-agents.sh     # Monitor loop (manual or cron)
scripts/
  swarm_spawn.sh      # Main entry point to launch agents
worktrees/            # Auto-created sibling dir next to each repo root (per task)
```

## Workflow

1. **Prep prompt + repo context.**
   - Save the agent instruction under `prompts/<slug>.md` (or any path).
   - Ensure the target repo is clean (no uncommitted work) and synced with the base branch (default `origin/main`).

2. **Spawn an agent.**
   ```bash
   scripts/swarm_spawn.sh \
     --slug lunar-offers \
     --repo ~/Projects/medialyst \
     --prompt-file prompts/lunar-offers.md \
     --notes "Landing page revamp"
   ```
   What it does:
   - Creates a git worktree `../worktrees/lunar-offers` off `origin/main` (override via `--base`).
   - Copies your prompt into `.swarm/prompt.txt` inside the worktree.
   - Generates `.swarm/run-agent.sh` with the right Codex/Claude command.
   - Starts a tmux session (`swarm-lunar-offers`) running that script.
   - Appends an entry to `.clawdbot/active-tasks.json` with metadata + status `running`.

   Options:
   - `--agent claude` (default `codex`).
   - `--model <name>` overrides CLI model flag.
   - `--command "custom CLI"` bypasses presets (set `--agent custom`).
   - `--branch feat/my-branch` to force branch name.
   - `--worktrees-root <dir>` to customize where worktrees live.

3. **Monitor / babysit.**
   - Manual check: `./.clawdbot/check-agents.sh` prints each slug’s status and, if a tmux session exited, flips it to `awaiting_review` with a timestamp.
   - Cron suggestion (every 10 min):
     ```bash
     */10 * * * * cd /Users/infra/.openclaw/workspace-testboss && ./.clawdbot/check-agents.sh >> /tmp/swarm-check.log 2>&1
     ```

4. **Interact with agents.**
   - Attach: `tmux attach -t swarm-lunar-offers` (use `Ctrl+b d` to detach).
   - Send corrections: `tmux send-keys -t swarm-lunar-offers "Focus on API first." Enter`

5. **Wrap up.**
   - When a task is done (PR ready, etc.), detach/destroy the tmux session (`tmux kill-session -t swarm-lunar-offers`).
   - Update the registry entry manually if desired (e.g., change `status` to `done`, add `pr` number). For lightweight management, edit `.clawdbot/active-tasks.json` or extend the scripts.
   - Remove worktree once merged: `git -C <repo> worktree remove ../worktrees/lunar-offers`.

## Acting as Zoe/TestBoss

- You (TestBoss) still scope requests, prep prompts, and call `swarm_spawn`. This matches the playbook’s expectation that Zoe orchestrates.
- Need multiple agents? Run `swarm_spawn` per slug; each gets its own worktree + tmux session + registry entry.
- Want the full Ralph Loop automation (CI checks, PR tracking)? Extend `check-agents.sh` to query GitHub/CI and post to Telegram—hooks are now centralized through the registry file.

## Next Extensions

1. Add `scripts/swarm_complete.sh` to mark entries as `done` + capture PR/test metadata.
2. Wire `.clawdbot/check-agents.sh` into launchd/cron for continuous babysitting.
3. Teach `swarm_spawn.sh` to template prompts (inject customer context) using the memory files.
4. Layer in reviewer bots (Codex/Gemini/Claude) once CI hooks are ready.

For now, this gives us the repeatable skeleton: worktree isolation, tmux-based agents, and a single source of truth for task state. Whenever you assign a request, I’ll prep the prompt and use these scripts to run the swarm end-to-end.
