# TOOLS.md - prospecting-agent

Skills define reusable workflows. This file defines Benford Backoffice tool policy for the OpenClaw `prospecting-agent`.

## Allowed By Default

- public web search, fetch, and browser research
- workspace skills under `skills/`
- backend-provided source adapters when credentials are configured

## Credentialed Sources

These may be used only when configured and allowed by the current run:

- Apollo
- Scrap.io
- Explorium
- People Data Labs
- Google Maps Places
- Apify
- TheirStack

## Known-Cost Rule

- before any known-cost provider call, confirm the backend budget context allows it
- if a call would exceed budget, stop and return a budget-stop JSON result
- record or return enough metadata for the backend to write a cost ledger entry

## Never Use

- direct LinkedIn scraping
- automatic outreach senders
- direct SQLite writes
- destructive filesystem operations
