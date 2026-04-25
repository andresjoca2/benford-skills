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

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

## Workflow Rules

### Airtable

- Si el usuario ya indicó que la salida o el registro va en Airtable, no volver a preguntar "¿en dónde lo guardo?" o equivalente.
- Asumir Airtable como destino por defecto para ese flujo hasta que el usuario diga lo contrario.
- Si falta un dato variable para ejecutar la búsqueda, preguntar solo los parámetros de control mínimos:
  - presupuesto máximo de la búsqueda, o
  - cuántas empresas/resultados quiere.
- Si ambos parámetros ya fueron definidos antes en la conversación o en instrucciones guardadas, no volver a pedirlos.
- Cuando falte elegir entre ambos, preferir preguntar por presupuesto o límite de empresas, no preguntas genéricas sobre el destino.

Add whatever helps you do your job. This is your cheat sheet.
