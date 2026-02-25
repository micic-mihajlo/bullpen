# Orchestration Wiring Spec

Wire up the end-to-end orchestration loop: project → task decomposition → worker spawn → step progress → review → steering → completion.

## Context

- Repo root: `/home/mihbot/bullpen`, app at `apps/dashboard/`
- Schema is in `convex/schema.ts` — DO NOT MODIFY IT
- Worker templates, workers table, tasks with steps, agentMessages — all exist
- OpenClaw gateway: `http://localhost:18789`, token from env `OPENCLAW_GATEWAY_TOKEN`
- Dashboard: port 3001, Convex deployment: `ceaseless-hedgehog-380`

## What to Build

### 1. Project Decomposition API Route

**File:** `apps/dashboard/src/app/api/projects/[id]/decompose/route.ts`

POST endpoint that:
1. Reads the project from Convex (by ID from URL params)
2. Based on project.type, creates hardcoded tasks with steps:
   - type "code" → 5 tasks: "Set up project structure" (coding, 3 steps), "Build core pages" (coding, 4 steps), "Build API/backend" (coding, 4 steps), "Design review" (review, 3 steps), "QA testing" (review, 3 steps)
   - type "automation" → 3 tasks: "Design workflow architecture" (automation, 3 steps), "Build and test workflow" (automation, 4 steps), "QA and monitoring" (review, 3 steps)
   - type "research" → 3 tasks: "Initial research sweep" (research, 4 steps), "Deep dive analysis" (research, 3 steps), "Compile report" (general, 3 steps)
   - default → 3 tasks: "Planning" (general, 3 steps), "Execution" (general, 4 steps), "Review" (review, 3 steps)
3. Each step has: name, description, status "pending"
4. Creates tasks via `api.tasks.create` mutation with projectId, taskType, steps, currentStep: 0
5. Logs an event via `api.events.create`
6. Returns { success: true, taskIds: [...] }

Use ConvexHttpClient from convex/browser. Import api from the _generated directory.

### 2. Task Dispatch API Route (REWRITE existing)

**File:** `apps/dashboard/src/app/api/tasks/[id]/dispatch/route.ts`

Rewrite to:
1. Read task from Convex via `api.tasks.get`
2. Find matching worker template: query `api.workerTemplates.list`, find first where `template.taskTypes.includes(task.taskType)`
3. Create worker via `api.workers.spawn` mutation (templateId, taskId, sessionKey: `worker-${taskId}-${Date.now()}`, model: template.model)
4. Update task: status → "running", startedAt → Date.now(), set first step to "in_progress"
   - Use `api.taskExecution.dispatchTask` for the status update
   - Then use `api.tasks.updateSteps` to set step 0 status to "in_progress" and startedAt
5. Update worker status to "active" via `api.workers.updateStatus`
6. Post an agentMessage (type "update", from template.displayName): "Worker spawned. Starting step 1: {stepName}"
7. Log event
8. Return { success: true, workerId, workerTemplate: template.displayName }

### 3. Step Progress Webhook

**File:** `apps/dashboard/src/app/api/webhooks/step-progress/route.ts`

NEW POST endpoint:
```
Body: {
  taskId: string,
  stepIndex: number,
  status: "completed" | "failed",
  output?: string,
  error?: string,
  workerName?: string
}
```

Handler:
1. Get task via `api.tasks.get`
2. Get current steps array from task
3. Update the step at stepIndex: status → "review", agentOutput → output, completedAt → Date.now()
4. Write back via `api.tasks.updateSteps`
5. Post an agentMessage (type "update"): "Step {n} completed: {output preview}"
6. Log event: "Step {name} ready for review"
7. Return { success: true }

Also add GET handler for health check.

### 4. Steering API Route

**File:** `apps/dashboard/src/app/api/tasks/[id]/steer/route.ts`

POST endpoint:
```
Body: {
  message: string,
  stepIndex?: number
}
```

Handler:
1. Get task from Convex
2. Post an agentMessage (type "steering", fromAgent "orchestrator", toAgent "worker")
3. If worker has sessionKey, try to send to OpenClaw: POST `http://localhost:18789/api/sessions/{sessionKey}/send` with auth header
4. Log event
5. Return { success: true }

### 5. Step Review API Route

**File:** `apps/dashboard/src/app/api/tasks/[id]/review-step/route.ts`

POST endpoint:
```
Body: {
  stepIndex: number,
  action: "approved" | "rejected",
  note?: string
}
```

Handler:
1. Call `api.tasks.reviewStep` mutation (it already handles step update, advancing currentStep, and logging agentMessage)
2. If approved and next step exists: update next step to "in_progress" via `api.tasks.updateSteps`
3. If approved and all steps done: call `api.tasks.complete` to mark task done
4. If rejected: just return (the reviewStep mutation handles the status)
5. Return { success: true, allStepsComplete: boolean }

### 6. Dashboard UI Updates

#### 6a. Projects page: Add "Decompose" button

**File:** `apps/dashboard/src/app/projects/page.tsx`

Add to each project card/row:
- A "Decompose into tasks" button (only show if project has no tasks yet, or always show)
- On click: POST to `/api/projects/{projectId}/decompose`
- Show loading spinner while request is in flight
- After success, show a toast "Created X tasks"

#### 6b. Task Detail Panel: Wire up real controls

**File:** `apps/dashboard/src/components/task-detail-panel.tsx`

This file exists but uses mock data. Update it to:
- Show REAL steps from the task data (task.steps array)
- For each step show: status icon, name, description
- For steps with status "review": show Approve and Reject buttons
  - Approve: POST `/api/tasks/{taskId}/review-step` with { stepIndex, action: "approved" }
  - Reject: prompt for note, then POST with { stepIndex, action: "rejected", note }
- For pending tasks: show a "Dispatch Worker" button
  - POST `/api/tasks/{taskId}/dispatch`
- Show the agent chat thread using `useQuery(api.agentMessages.listByTask, { taskId })`
- Add steering input at the bottom:
  - Text input + Send button
  - POST `/api/tasks/{taskId}/steer` with { message }
  - After send, the message appears in the chat via real-time Convex subscription

### 7. Clean Up Agent Bootstrap Spam

**File:** `apps/dashboard/src/app/api/webhooks/agent-event/route.ts`

Skip logging for "agent:bootstrap" events. Just return 200 OK without inserting into Convex events table. Keep logging for: session_new, session_reset, gateway_startup.

## Build and Verify

1. Run `pnpm run build` in apps/dashboard/ — must pass with zero errors
2. Don't modify convex/schema.ts
3. Don't touch apps/landing/

When completely done and build passes, run:
```
openclaw gateway wake --text 'Done: Orchestration loop wired end-to-end' --mode now
```
