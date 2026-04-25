# Agent Swarm Playbook (TestBoss-Orchestrated)

## 1. Purpose
Stand up a two-tier agent swarm where **TestBoss** (orchestrator) converts business context from Obsidian/OpenClaw into precise prompts for specialized coding agents (Codex, Claude, Gemini). Zoe scopes the work, feeds sanitized customer/state data, and TestBoss supervises delivery, QA, and deploy.

## 2. Proof Points & Why Orchestration Matters
- **Throughput:** 94 commits/day peak, ~50/day average; 7 PRs shipped in 30 minutes without opening the editor.
- **Commits → MRR:** Founder-led sales + instant feature fulfillment converts leads into paying customers.
- **Cost:** Start ~$20/month; scale to ~$190/month (Claude ~$100 + Codex ~$90) once running multiple parallel agents.
- **Context bandwidth:** Codex/Claude can’t hold full business + code simultaneously. OpenClaw carries history (customer data, meeting notes, wins/fails) and injects only what each agent needs.
- **Strategic separation:** Stripe’s “Minions” proved the model; this implementation runs locally on a Mac mini with OpenClaw as control plane.

## 3. Roles & Responsibilities
| Role | Owner | Responsibilities |
| --- | --- | --- |
| **Orchestrator** | **TestBoss** | Maintain global context, authorize work, spawn/stop agents, enforce Definition of Done, coordinate QA/deploy, log learnings.
| **Product/Scoping (Zoe)** | Zoe agent | Ingest customer requests, reference Obsidian, outline solution, top-up credits, pull prod read-only data, craft prompts, babysit retries.
| **Coding Agents** | Codex (gpt-5.3), Claude Opus 4.5, Gemini | Implement features/bugfixes inside isolated worktrees, run tests, comment on PRs. No prod access.
| **Automated Reviewers** | Codex reviewer, Gemini Code Assist, Claude Code reviewer | Post PR feedback automatically; block merge until passing.
| **Human Reviewer** | TestBoss/Menen | Final approval after bots + CI pass.

## 4. System Inputs & State
- **Knowledge base:** Obsidian vault (auto-synced meeting notes, customer history, retros).
- **Repos:** Medialyst mono-repo + worktree directory `~/Documents/GitHub/medialyst-worktrees`.
- **Agent launchers:** `~/.codex-agent/run-agent.sh`, Codex CLI, Claude CLI, Gemini spec generator.
- **Task registry:** `.clawdbot/active-tasks.json` tracks agent metadata, tmux session, status, PR, CI and reviewer checks.
- **Monitoring scripts:** `.clawdbot/check-agents.sh` cron every 10 min (agent babysitter / Ralph Loop v2).

## 5. Full 8-Step Workflow

### Step 1 – Customer Request → Scoping with Zoe
1. Customer asks (e.g., agency wants reusable configs).
2. Meeting notes auto-land in Obsidian → no recap. TestBoss + Zoe align on solution (template system, etc.).
3. Zoe immediate actions:
   - **Credits:** Tops up customer credits via admin API to unblock work.
   - **Prod snapshot:** Uses read-only prod DB access to pull current config (agents never touch prod).
   - **Brief:** Writes structured spec (problem, success criteria, config excerpt, constraints, acceptance tests, rollout notes) and stores it in Obsidian + links in repo issue/task.

### Step 2 – Spawn the Agent(s)
1. **Isolated worktree + deps:**
   ```bash
   git worktree add ../feat-custom-templates -b feat/custom-templates origin/main
   cd ../feat-custom-templates && pnpm install
   ```
2. **Tmux session per agent:**
   ```bash
   tmux new-session -d \
     -s "codex-templates" \
     -c "~/Documents/GitHub/medialyst-worktrees/feat-custom-templates" \
     "$HOME/.codex-agent/run-agent.sh templates gpt-5.3-codex high"
   ```
3. **Launch commands:**
   ```bash
   # Codex workhorse
   codex --model gpt-5.3-codex \
     -c "model_reasoning_effort=high" \
     --dangerously-bypass-approvals-and-sandbox \
     "<prompt from Zoe/TestBoss>"

   # Claude Code (UI/git ops)
   claude --model claude-opus-4.5 \
     --dangerously-skip-permissions \
     -p "<prompt>"
   ```
4. **Mid-task steering via tmux:**
   ```bash
   # Course-correct
   tmux send-keys -t codex-templates "Stop. Focus on the API layer first." Enter
   tmux send-keys -t codex-templates "Schema lives in src/types/template.ts." Enter
   ```
5. **Task registry entry (.clawdbot/active-tasks.json):**
   ```json
   {
     "id": "feat-custom-templates",
     "tmuxSession": "codex-templates",
     "agent": "codex",
     "description": "Custom email templates for agency customer",
     "repo": "medialyst",
     "worktree": "feat-custom-templates",
     "branch": "feat/custom-templates",
     "startedAt": 1740268800000,
     "status": "running",
     "notifyOnComplete": true
   }
   ```
6. **Parallelization:** spin as many as needed; each agent gets unique worktree, branch, tmux.

### Step 3 – Monitoring Loop (Cron)
- Cron (`.clawdbot/check-agents.sh`) every 10 min; deterministic, token-light.
- Reads JSON registry, does not poll LLMs directly.
- Checks:
  - tmux session alive
  - PR exists for branch (`gh pr list`)
  - CI status via `gh run list`
  - Reviewer statuses / failure reasons
- Auto-respawns failed agents (≤3 attempts) if CI/review critical fails.
- Alerts TestBoss only when human attention required. Otherwise silent running.

### Step 4 – Agent Creates PR (Definition of Done gate)
Agent must:
1. Commit + push branch.
2. `gh pr create --fill` with Zoe scope attached.
3. Ensure branch rebased on latest main (no conflicts).
4. CI passing (lint, TS, unit, E2E, Playwright).
5. AI reviews queued (Codex, Gemini, Claude) and posting comments.
6. UI change? Screenshot in PR description (new CI rule). Missing screenshot ⇒ CI fail.

### Step 5 – Automated Code Review Stack
- **Codex Reviewer:** Edge cases, complex logic, race conditions. Treat its feedback as primary.
- **Gemini Code Assist:** Free; catches security + scalability gaps, suggests concrete fixes.
- **Claude Code Reviewer:** Conservative; ignore non-critical “consider…” suggestions. Only action critical flags.
- All three comment directly on PR for async traceability.

### Step 6 – Automated Testing Pipeline
- CI runs lint, TypeScript, unit, E2E, Playwright against preview env identical to prod.
- Screenshot rule enforced via CI check.
- Agents include test logs in PR comment/autogenerated summary.

### Step 7 – Human Review & Telegram Notification
- Once DoD met, registry entry updates:
  ```json
  {
    "status": "done",
    "pr": 341,
    "completedAt": 1740275400000,
    "checks": {
      "prCreated": true,
      "ciPassed": true,
      "claudeReviewPassed": true,
      "geminiReviewPassed": true
    },
    "note": "All checks passed. Ready to merge."
  }
  ```
- Telegram ping: “PR #341 ready for review.” Packet incluye resumen, link al diff, estado de CI, revisores y screenshots. En ciclos con múltiples entregables, Zoe sintetiza el bundle (e.g., “7 PRs listos: 3 features, 4 bugfixes”) para que Menen/TestBoss puedan revisar en bloque tras cualquier interrupción.
- Human review averages 5–10 minutes. Often merges happen without reading the underlying code because screenshots + reviewer comments already provide sufficient confidence.

### Step 8 – Merge & Cleanup
1. Merge PR (fast-forward or merge commit per policy).
2. Daily cron removes orphaned worktrees/branches, clears task registry entries.
3. Obsidian + CRM updated with shipped feature + customer impact (commit → MRR logging).
4. Lessons learned appended to memory (prompt tweaks, agent pairing success).

## 6. Prompt Template (Structured)
```
You are a coding agent focused purely on implementation.
Business context:
- Customer: <name>, size, urgency, pain.
- Request summary: <goal>.
- Current configuration: <sanitized JSON dump>.
Technical context:
- Repo/worktree: <path>.
- Key files: <list>.
- Architecture constraints: <guidelines>.
Definition of done:
1. Implement <feature>.
2. Tests: <commands>.
3. Screenshots required? <yes/no>.
4. Update docs/changelog? <details>.
Deliverables:
- Summary of approach.
- Diff (files + rationale).
- Test output.
Guardrails:
- No prod credentials.
- Keep feature behind <flag>.
- Follow coding standards listed in docs/<style>.
```

## 7. Operational Notes
- **Execution mode:** Direct CLI (`codex exec`, `claude -p`) is deprecated; always run agents inside tmux per worktree for persistent logs + interactive steering.
- **PR visibility:** Agents must comment on their PR with summary, tests, screenshots, blockers.
- **Security:** Only Zoe/TestBoss have prod read-only access; agents work off provided dumps.
- **Monitoring:** `.clawdbot/check-agents.sh` acts as Ralph Loop v2—deterministic, cheap, auto-respawns, notifies only on issues.
- **Zoe’s dynamic prompting:** On failure she rewrites prompts with additional business context instead of re-running same instruction (core improvement over basic Ralph Loop).
- **Proactive work sourcing:**
  - Morning: Zoe escanea Sentry, levanta agentes Codex para errores críticos.
  - Post-meetings: Revisa notas en Obsidian, genera solicitudes cliente → spawns Codex.
  - Evening: Analiza `git log` y dispara Claude Code para actualizar changelog + documentación de clientes automáticamente.
### Choosing the Right Agent
- **Codex 5.3:** Backend logic, multi-file refactors, complex bugs, reasoning-heavy tasks. Default workhorse (~90% of builds).
- **Claude Code:** Frontend/UI polish + git operations; faster iteration, fewer permission issues.
- **Gemini:** Design sensibility. Generate HTML/CSS specs or dashboards; then Claude implements components based on Gemini’s spec.

- **Cost ceiling:** Monitor per-agent runtime to keep monthly spend within target.
- **Learning archive & reward signals:** Zoe registra éxitos/fracasos con tres señales: ✅ CI, ✅ reviewers automáticos, ✅ merge humano. Cada éxito guarda patrones concretos ("esta estructura funciona para billing", "Codex necesita los type defs al inicio", "siempre incluye rutas de test"). Cualquier fallo reenciende el loop con un prompt mejorado que aprovecha lo aprendido.

## 8. How to Set This Up (10-Minute Bootstrap)
1. **Copy the full article/playbook** into an OpenClaw session.
2. **Command:** `"Implement this agent swarm setup for my codebase."`
3. OpenClaw scaffolds directories, scripts (`run-agent.sh`, `.clawdbot/check-agents.sh`), cron entries, and worktree/tmux wrappers automatically.
4. Review generated files, customize repo paths/model names, then run initial smoke test (spawn dummy agent, ensure registry+cron update).

## 9. Next Actions
1. Verify Obsidian sync + Zoe permissions (admin API, prod read-only, Telegram alerts).
2. Package worktree/tmux/provisioning + task registry updates into a single CLI (`swarm spawn <slug>`).
3. Document CI commands + screenshot enforcement inside repo README para agentes.
4. Build commits→MRR dashboard y agrega el update al Step 8.
5. Entrena reviewers humanos para interpretar comentarios de AI + aprobaciones basadas en screenshots.
