# 🐂 Bullpen

Multi-agent orchestration dashboard for OpenClaw.

## Features

- **Agent Management**: Create, configure, and monitor AI agents
- **Task Board**: Kanban-style task management with assignment and dispatch
- **Live Event Feed**: Real-time activity stream from all agents
- **OpenClaw Integration**: Direct connection to OpenClaw gateway for session management
- **Model Selection**: Choose between Cerebras (fast/cheap) and Opus (powerful)
- **Webhook API**: Programmatic task completion for automation

## Tech Stack

- **Frontend**: Next.js 16, React, Tailwind CSS
- **Backend**: Convex (real-time database)
- **Integration**: OpenClaw Gateway (WebSocket RPC)

## Setup

1. Clone and install:
```bash
git clone https://github.com/micic-mihajlo/bullpen.git
cd bullpen
npm install
```

2. Configure environment:
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

Required env vars:
- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- `OPENCLAW_GATEWAY_URL` - OpenClaw gateway WebSocket URL
- `OPENCLAW_GATEWAY_TOKEN` - Gateway auth token

3. Run Convex:
```bash
npx convex dev
```

4. Start the dashboard:
```bash
npm run dev
```

## API Endpoints

### Tasks
- `POST /api/tasks/[id]/dispatch` - Dispatch task to assigned agent
- `POST /api/tasks/[id]/complete` - Mark task as complete with result

### Webhooks
- `POST /api/webhooks/task-result` - Agent reports task completion
  ```json
  {
    "taskId": "...",
    "status": "completed" | "failed",
    "result": "output text",
    "error": "error message"
  }
  ```

### OpenClaw
- `GET /api/openclaw/sessions` - List active sessions
- `GET /api/openclaw/sessions/[key]/history` - Get session message history
- `POST /api/openclaw/sessions/[key]/send` - Send message to session

### Status
- `GET /api/status` - Health check and service status

## Keyboard Shortcuts

- `n` - New task
- `a` - New agent
- `r` - Refresh
- `Esc` - Close modals

## License

MIT
