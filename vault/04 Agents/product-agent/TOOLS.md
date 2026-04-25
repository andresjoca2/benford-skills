# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Contacts

### Contact handling rule
- Whenever Menen provides a **name + email** or **name + phone**, save/update that person in the Airtable contacts base/table.
- Do not leave contact info only in chat history; persist it in Airtable.

### Calendar scheduling rule
- Use **gog** for calendar operations by default.
- Do **not** request access to or rely on the Mac Calendar app unless Menen explicitly asks for that path.
- Base calendar/account Clo can actively manage: **menen341agent@gmail.com**.
- Visible reference calendars (view-only context): **josea.341.jamz@gmail.com** and **jose@konta.com**.
- When Menen asks to create a meeting, first infer whether it is **personal** or **Konta**.
- **Default classification is personal** unless Menen says otherwise.
- For personal meetings, invite the relevant personal email/contact.
- For Konta meetings, invite the corresponding Konta/work email/contact.
- Current rule from Menen: conversations with the **RSM** team should be treated as **personal** for now, until a separate calendar exists.
- When building Menen's day and assigning time blocks, create those blocks on the appropriate calendar through **menen341agent@gmail.com** based on the classification above.

## Agent session shortcuts
- **New session for any agent:** `openclaw tui --session agent:<agent-id>:setup`
  - Example (scraper): `openclaw tui --session agent:scraper-agent:setup`
  - To adapt: replace `scraper-agent` with the target agent name (e.g., `sdr-agent`).

## Obsidian
- Local mounted Benford Google Drive root on this server: `/root/benford_drive`
- The working documentation root for this agent is: `/root/benford_drive/Audit AI`
- The Obsidian vault used for this workflow lives inside that mounted drive.
- Current canonical path to use when reading/writing project documentation: `/root/benford_drive/Audit AI`
- This mounted path is persistent on the VPS and reflects the shared Benford Google Drive.
- When documenting tests, SOPs, auditor variants, source materials, and outputs, operate inside `/root/benford_drive/Audit AI` rather than older `/root/Drive/...` paths.
- `obsidian-cli` is available on this server as a compatibility wrapper for the OpenClaw `obsidian` skill.
- Supported `obsidian-cli` commands here: `print-default`, `set-default`, `search`, `search-content`, `create`, `move`, `delete`
- Current limitation: `obsidian-cli move` on this server renames files but does not rewrite wikilinks across the vault.

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

## TTS Preferences
- ElevenLabs voice ID for Menen notes: `m7yTemJqdIqrcNleANfX`
