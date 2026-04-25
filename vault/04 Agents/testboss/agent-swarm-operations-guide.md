# Agent Swarm Operations Guide

## 1. How to Engage TestBoss (Orchestrator)
- **Primary command:** Send requests directly to TestBoss via the OpenClaw session (e.g., “TestBoss: build X feature for customer Y”).
- **What to include:** business goal, customer, urgency, any guardrails. If missing, TestBoss/Zoe will pull context from Obsidian or ask follow-ups.
- **Expectation:** You receive a status update only when milestones are hit (scope ready, PR bundle ready, blockers).

## 2. Swarm Capabilities
| Pillar | Description | Example Commands |
| --- | --- | --- |
| Feature shipping | Parallel Codex/Claude agents implement scoped features end-to-end. | “Ship reusable campaign templates for Acme.” |
| Bug triage | Zoe scans Sentry/logs, spawns agents to reproduce/fix critical errors. | “Eliminate 500 error on billing webhook.” |
| Documentation & comms | Claude/Gemini update changelog, customer docs, release notes once PRs merge. | “Draft customer email + changelog for today’s release.” |
| Design-first UI | Gemini creates HTML/CSS spec, Claude implements components. | “New dashboard layout with KPI cards.” |
| Ops automation | Cron + `.clawdbot` monitor agents, respawn failures, clean worktrees. | “Keep 5 agents running overnight on backlog.” |

## 3. Engagement Lifecycle
1. **Request intake** → TestBoss scopes with Zoe; builds brief (customer data, success criteria, acceptance tests).
2. **Agent spawn** → Worktree + tmux per task, run `codex`/`claude` launch commands with structured prompts.
3. **Monitoring** → `.clawdbot/check-agents.sh` every 10 min; only alerts on human-needed events.
4. **Definition of Done** → PR + CI + 3 AI reviewers + screenshots (if UI) before Telegram ping.
5. **Human review** → 5–10 min per bundle via summary+screenshots; merges; cron cleans up; Obsidian/CRM updated.

## 4. Example Interaction
```
You: TestBoss, necesitamos un analizador de reportes PDF para Cliente Atlas. Debe subir cuentas a >50MB y estar listo mañana.
TestBoss: Recibo. Scoping con Zoe → generamos prompt con historial de Atlas, SLA, specs. Spawneo 2 agentes (Codex backend, Claude UI). Te aviso cuando haya PRs listos.
```
Telegram later: “3 PRs listos: ETL parser, UI upload, docs. CI ✅, reviewers ✅, screenshots adjuntos.”

## 5. Quick Reference Commands
- Open playbook: `code agent-swarm-playbook.md`
- Operations guide: `code agent-swarm-operations-guide.md`
- Spawn agent manually: `swarm spawn <slug>` (wrapper once scripted)
- Monitor registry: `cat .clawdbot/active-tasks.json`

## 6. When to Ping TestBoss
- New customer ask or priority shift.
- Blocker surfaced by `.clawdbot` alerts.
- Need status bundle (PRs ready, deployments completed).

Use this guide to align expectations: you talk to TestBoss, TestBoss runs the swarm.
