# Bullpen Demo Script (30-Second Loop)

_Target: Quick walkthrough showing the dashboard in action. Can be used for screen recording or live demo._

See also: `docs/demo-recording-runbook.md` for local-machine setup + preflight checks.

## Setup (Before Recording)

1. Ensure Convex backend is running with seed data (`pnpm dev:dashboard`)
2. Have at least: 2 active tasks (one with steps), 3 worker templates, 2 projects, some events
3. Browser at 1280×800, sidebar expanded

## Demo Flow (30s)

### Beat 1: Command Center (0s–8s)
- **Start** on Command Center. Camera sees: header stats, review queue (orange pulse), active workers with progress bars.
- **Hover** over an active worker row → highlight effect. Note the step progress bar filling and current step label.
- _Narration: "This is your command center. Active workers, step progress, and anything needing your review — all at a glance."_

### Beat 2: Task Detail (8s–16s)
- **Click** an active task → slide-in panel animates from right.
- Panel shows: task type badge, status, elapsed time, step checklist with status icons (✓ approved, ⏳ in progress, 👁 review).
- Scroll to **thread** showing agent messages (update, decision types).
- _Narration: "Click into any task to see step-by-step progress, agent output, and the full conversation thread."_

### Beat 3: Review + Steering (16s–22s)
- Click a **review queue** item (or scroll to a step marked "review").
- Show the approve/reject buttons on the step.
- Type a quick **steering message** in the input box at the bottom.
- _Narration: "Review agent work, approve steps, or steer the worker mid-task with natural language."_

### Beat 4: Pipeline + Projects (22s–28s)
- Close the panel. Scroll down to **Pipeline** section (Queue → Working → Done Today columns).
- Quick glance at **Projects** section showing progress bars.
- _Narration: "Track your pipeline from queue to done, across all client projects."_

### Beat 5: Close (28s–30s)
- Scroll back up to Command Center header. Green status dot visible.
- _Narration: "Bullpen. Your AI workforce, managed."_

## Key Visual Highlights

- **Orange accent** (#c2410c) — ties everything together, signals action needed
- **Staggered entrance animations** — sections cascade in on load
- **Step progress bars** — smooth fill animations
- **Live activity feed** — green "live" indicator with timestamped events
- **JetBrains Mono** for data/stats — professional, technical feel

## Recording Tips

- Use OBS or Screen Studio at 60fps, 1280×800
- Slow, deliberate mouse movements (not rushed)
- Let animations complete before next action
- One-command take helper: `./scripts/demo-take.sh --open-tabs --scripted-cues`
- Manual cues with beat prompts: `./scripts/demo-cues.sh --duration 30 --scripted`
- Manual timing-only cues: `./scripts/demo-cues.sh --duration 30`
- Can loop: after Beat 5, refresh page to replay entrance animations
