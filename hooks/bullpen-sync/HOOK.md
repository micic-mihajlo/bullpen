---
name: bullpen-sync
description: "Sync agent lifecycle events to Bullpen dashboard"
metadata:
  openclaw:
    emoji: "🎯"
    events:
      - command:new
      - command:reset
      - command:stop
      - agent:bootstrap
      - gateway:startup
---

# Bullpen Sync Hook

Sends agent lifecycle events to the Bullpen orchestration dashboard in real-time.

## What It Does

- Fires on session commands (`/new`, `/reset`, `/stop`)
- Fires on agent bootstrap (session start)
- Fires on gateway startup
- POSTs event data to Bullpen webhook endpoint

## Configuration

Set `BULLPEN_WEBHOOK_URL` environment variable, or defaults to `http://localhost:3001`.

## Events Sent

```json
{
  "type": "command|agent|gateway",
  "action": "new|reset|stop|bootstrap|startup",
  "sessionKey": "agent:main:discord:...",
  "timestamp": "2026-02-04T21:56:00.000Z",
  "context": {
    "workspaceDir": "~/.openclaw/workspace",
    "commandSource": "discord"
  }
}
```
