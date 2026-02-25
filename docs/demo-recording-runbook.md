# Demo Recording Runbook (Local Machine)

Use this when capturing the Bullpen product demo on your laptop/desktop (not on the VPS).

## Why local only

The VPS is headless and cannot do smooth GUI capture. Recording should happen on a local machine with a real display + OBS (or Screen Studio).

## 1) Start stack

From the repo root:

```bash
pnpm dev:all
```

Expected:
- Landing: `http://127.0.0.1:3000`
- Dashboard: `http://127.0.0.1:3001`

## 2) Run preflight

```bash
./scripts/demo-preflight.sh
```

This checks:
- Dashboard reachable
- Landing reachable
- n8n reachable (optional)
- Current git branch + dirty state
- `BULLPEN_API_TOKEN` presence in shell

## 3) Capture settings (OBS / Screen Studio)

- Resolution: **1280×800**
- FPS: **60**
- Cursor: visible
- Mouse movement: slow and deliberate
- Disable OS notifications / DND mode ON

## 4) Perform the demo flow

Primary script: `docs/demo-script.md` (30-second loop)

Fastest workflow (recommended):
```bash
./scripts/demo-take.sh --open-tabs --scripted-cues
```
This runs preflight, opens landing + dashboard tabs, gives a short countdown, then starts cue timing with inline action/narration prompts at each beat.

Manual pacing helper (if you want separate control):
```bash
./scripts/demo-cues.sh --duration 30 --scripted
```
Run this in a separate terminal while recording to hit beat transitions with prompt reminders.
For timing-only mode: `./scripts/demo-cues.sh --duration 30`.

Order:
1. Command Center
2. Task Detail panel
3. Review + Steering
4. Pipeline + Projects
5. Close on Command Center header

## 5) Takes strategy

Record 3 takes:
- **Take A:** clean no-voice (for social cuts)
- **Take B:** with narration
- **Take C:** slower backup

Pick best timeline in post, keep final at ~30s.

## 6) Troubleshooting

- Landing 3000 down: verify `pnpm dev:all` is running and no port conflicts
- Dashboard stale data: refresh once before recording and wait for entrance animations
- Jank: close extra browser tabs + disable battery saver
- Cursor too fast: lower mouse DPI temporarily
