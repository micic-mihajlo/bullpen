# 🐂 Bullpen

**Multi-agent orchestration dashboard for [OpenClaw](https://github.com/openclaw/openclaw).**

Bullpen gives you a visual command center for managing AI agents — assign tasks, track progress, and watch your agent swarm work in real-time.

![Status](https://img.shields.io/badge/status-alpha-orange)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- **🤖 Agent Registry** — Create and manage AI agents with custom personas, models, and capabilities
- **📋 Task Board** — Kanban-style task management with priority, assignment, and status tracking
- **📡 Live Event Feed** — Real-time activity stream from all agents via WebSocket
- **🔗 OpenClaw Integration** — Direct gateway connection for session management and dispatch
- **🎯 Lifecycle Hooks** — Automatic agent status sync via OpenClaw hooks
- **🔔 Webhook API** — Programmatic task completion for automation pipelines

## 🎬 How It Works

Drop tasks into Bullpen, watch AI agents complete them in real-time.

```
You                    Bullpen                 OpenClaw                Agent
 │                        │                        │                      │
 ├─ Create task ─────────▶│                        │                      │
 │                        │                        │                      │
 ├─ Assign to agent ─────▶│                        │                      │
 │                        │                        │                      │
 ├─ Click "Dispatch" ────▶│                        │                      │
 │                        ├── sessions_spawn ─────▶│                      │
 │                        │    (isolated session)  ├─ Start agent ───────▶│
 │                        │                        │                      │
 │                        │                        │                 ┌────┴────┐
 │                        │                        │                 │  Work   │
 │                        │                        │                 └────┬────┘
 │                        │                        │                      │
 │                        │◀───────────── Webhook: task complete ─────────┤
 │                        │                        │                      │
 │◀─ See result ──────────│                        │                      │
 │   in real-time         │                        │                      │
```

### The Flow

1. **Create a task** — Title, description, priority (1-5)
2. **Assign to an agent** — Pick from your agent registry
3. **Dispatch** — Bullpen spawns an isolated OpenClaw session directly
4. **Work happens** — Agent runs in isolation with configured model
5. **Result delivered** — Agent calls webhook, task marked complete
6. **See it live** — Dashboard updates in real-time via Convex

### Why This Matters

- **Visual task tracking** — See what's running, what's done, what failed
- **Direct dispatch** — No coordinator middleman, sessions_spawn goes straight to work
- **Agent specialization** — Route tasks to the right agent (researcher, coder, reviewer)
- **Audit trail** — Every action logged in the event feed
- **Webhook integration** — Plug into any automation pipeline

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Bullpen Dashboard                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Agents    │  │   Tasks     │  │      Event Feed         │  │
│  │  Registry   │  │   Board     │  │   (real-time)           │  │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘  │
└─────────┼────────────────┼──────────────────────┼───────────────┘
          │                │                      │
          ▼                ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Convex (Real-time DB)                    │
│         agents • tasks • events • messages                       │
└─────────────────────────────────────────────────────────────────┘
          ▲                                      ▲
          │ WebSocket RPC                        │ Webhooks
          │                                      │
┌─────────┴───────────────────────────┐  ┌──────┴──────────────────┐
│         OpenClaw Gateway            │  │   bullpen-sync hook     │
│  ┌─────────┐ ┌─────────┐ ┌───────┐  │  │  (lifecycle events)     │
│  │ Discord │ │Telegram │ │ Cron  │  │  └─────────────────────────┘
│  │ Session │ │ Session │ │ Jobs  │  │
│  └─────────┘ └─────────┘ └───────┘  │
└─────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- OpenClaw gateway running
- Convex account (free tier works)

### Installation

```bash
# Clone
git clone https://github.com/micic-mihajlo/bullpen.git
cd bullpen

# Install dependencies
pnpm install  # or npm install

# Configure environment
cp .env.example .env.local
```

Edit `.env.local`:
```bash
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
OPENCLAW_GATEWAY_URL=ws://localhost:18789
OPENCLAW_GATEWAY_TOKEN=your-gateway-token
BULLPEN_WEBHOOK_URL=http://localhost:3001  # for hook callbacks
```

### Run

```bash
# Terminal 1: Convex backend
npx convex dev

# Terminal 2: Next.js dashboard
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001)

## 🔌 OpenClaw Hook Setup

Bullpen includes a lifecycle hook that syncs agent events automatically.

### Install the hook

```bash
# Copy hook to OpenClaw managed hooks
cp -r hooks/bullpen-sync ~/.openclaw/hooks/

# Or create manually:
mkdir -p ~/.openclaw/hooks/bullpen-sync
# Add HOOK.md and handler.ts (see hooks/bullpen-sync/)
```

### Enable it

```bash
openclaw hooks enable bullpen-sync
openclaw gateway restart  # or restart your gateway
```

Now Bullpen receives real-time events for:
- `command:new` — session started
- `command:reset` — session reset
- `command:stop` — session stopped
- `agent:bootstrap` — agent initialized
- `gateway:startup` — gateway came online

## 📡 API Reference

### Webhooks

#### `POST /api/webhooks/task-result`
Agent reports task completion.

```bash
curl -X POST http://localhost:3001/api/webhooks/task-result \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "jh79...",
    "status": "completed",
    "result": "Task output here",
    "agentName": "Clawdfather"
  }'
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `taskId` | string | ✅ | Convex task ID |
| `status` | `"completed"` \| `"failed"` | ✅ | Result status |
| `result` | string | | Output for completed tasks |
| `error` | string | | Error message for failed tasks |
| `agentName` | string | | For logging |

#### `POST /api/webhooks/agent-event`
OpenClaw hook reports lifecycle events.

```bash
curl -X POST http://localhost:3001/api/webhooks/agent-event \
  -H "Content-Type: application/json" \
  -d '{
    "type": "command",
    "action": "new",
    "sessionKey": "agent:main:discord:...",
    "timestamp": "2026-02-04T21:57:00.000Z"
  }'
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"command"` \| `"agent"` \| `"gateway"` | ✅ | Event category |
| `action` | string | ✅ | Event action (new, reset, stop, etc.) |
| `sessionKey` | string | | OpenClaw session identifier |
| `timestamp` | string | | ISO timestamp |
| `context` | object | | Additional context (commandSource, senderId) |

### OpenClaw Proxy

#### `GET /api/openclaw/sessions`
List active OpenClaw sessions.

#### `GET /api/openclaw/sessions/[key]/history`
Get message history for a session.

#### `POST /api/openclaw/sessions/[key]/send`
Send a message to a session.

### Health

#### `GET /api/status`
Service health check.

```json
{
  "status": "ok",
  "version": "0.1.0",
  "services": {
    "convex": true,
    "openclaw": true
  }
}
```

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `n` | New task |
| `a` | New agent |
| `r` | Refresh data |
| `Esc` | Close modal |

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Database**: [Convex](https://convex.dev/) (real-time, serverless)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Font**: JetBrains Mono
- **Integration**: OpenClaw Gateway (WebSocket RPC)

## 📦 Deployment

### PM2 (recommended for VPS)

```bash
# Build
pnpm build

# Start with PM2
pm2 start npm --name bullpen -- start

# Or use ecosystem file
pm2 start ecosystem.config.js
```

### Vercel

```bash
vercel deploy
```

Set environment variables in Vercel dashboard.

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🗺️ Roadmap

- [x] Agent registry with Convex
- [x] Task board (kanban)
- [x] Webhook task completion
- [x] OpenClaw session integration
- [x] Lifecycle hook sync
- [x] Task dispatch via sessions_spawn
- [ ] Agent-to-agent messaging
- [ ] Analytics dashboard
- [ ] Multi-workspace support

## 🤝 Contributing

PRs welcome! Please open an issue first to discuss major changes.

## 📄 License

MIT © 2026
