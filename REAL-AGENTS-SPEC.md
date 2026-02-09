# Real Agent Spawning + Auto-Review Spec

## Problem
1. Dispatch creates a worker record but doesn't spawn a REAL OpenClaw sub-agent
2. Step approvals require manual human clicks — the orchestrator (Clawdfather) should auto-review
3. Workers are fake — no real work is being done

## Fix Overview
Two changes:
A) Dispatch actually spawns a real sub-agent via OpenClaw sessions_spawn  
B) Add an auto-review endpoint that the orchestrator calls to review completed steps

## A. Real Agent Dispatch

**File:** `apps/dashboard/src/app/api/tasks/[id]/dispatch/route.ts`

After creating the worker record (existing code is fine), ADD a real OpenClaw agent spawn.

The OpenClaw gateway exposes an HTTP API. To spawn a sub-agent, we send a message to the MAIN session telling the orchestrator to spawn a worker.

Actually, simpler approach: use the OpenClaw RPC API to send a chat message to the main session. The main session IS the orchestrator (Clawdfather), so we tell ourselves to handle the task.

Add after the existing worker creation code:

```typescript
// Spawn real work by messaging the orchestrator session
const OPENCLAW_BASE = process.env.OPENCLAW_GATEWAY_URL?.replace(/^ws/, "http") || "http://localhost:18789";
const OPENCLAW_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

// Build the task prompt for the sub-agent
const stepList = (task.steps || []).map((s, i) => `${i + 1}. ${s.name}: ${s.description}`).join("\n");

const spawnMessage = `[SYSTEM: AUTO-DISPATCH]
A task has been dispatched and needs execution. Spawn a sub-agent using sessions_spawn with these details:

Task: "${task.title}"
Task ID: ${taskId}
Type: ${taskType}
Worker Template: ${template.displayName}
Model: ${template.model}

Description: ${task.description || "No description provided"}

Steps:
${stepList}

Instructions for the sub-agent:
- Work through each step sequentially
- After completing each step, report back by calling the webhook: POST http://localhost:3001/api/webhooks/step-progress with body: { "taskId": "${taskId}", "stepIndex": <n>, "status": "completed", "output": "<what you did>" }
- Be thorough but efficient
- Follow the worker template personality: ${template.name}

After spawning, auto-review any completed steps.`;

try {
  await fetch(`${OPENCLAW_BASE}/api/sessions/main/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENCLAW_TOKEN}`,
    },
    body: JSON.stringify({ message: spawnMessage }),
  });
} catch (err) {
  console.error("[Dispatch] Failed to notify orchestrator:", err);
  // Don't fail the dispatch — worker record is created, orchestrator can pick it up
}
```

## B. Auto-Review Endpoint

**File:** `apps/dashboard/src/app/api/tasks/[id]/auto-review/route.ts` (NEW)

POST endpoint that the orchestrator calls to automatically review a completed step.

```
POST /api/tasks/[id]/auto-review
Body: {
  stepIndex: number,
  decision: "approved" | "rejected",
  note?: string
}
```

Handler:
1. Get task from Convex
2. Call existing `api.tasks.reviewStep` mutation with the decision
3. If approved and next step exists:
   - Update next step to "in_progress"
   - Post agent message: "Step N approved. Moving to step N+1: {name}"
4. If approved and all steps done:
   - Call `api.tasks.complete`
   - Post agent message: "All steps completed. Task done."
   - Create a deliverable via `api.deliverables.create` (if task has projectId)
5. If rejected:
   - Post agent message with the rejection reason
   - The sub-agent should receive this and redo the step
6. Return { success: true, nextStep: number | null, taskComplete: boolean }

## C. Update Task Detail Panel — Remove Manual Approve for Non-Final Steps

**File:** `apps/dashboard/src/components/task-detail-panel.tsx`

The approve/reject buttons should ONLY show on the FINAL step or on deliverable review. 
For non-final steps, show a read-only status: "Auto-reviewed by orchestrator" with a checkmark.

Actually, keep the approve/reject buttons but label them differently:
- For in-progress steps: no buttons (agent is working)
- For steps in "review" status: show "Orchestrator reviewing..." with a spinner (auto-review happens automatically)
- For approved steps: show green checkmark + the review note
- For rejected steps: show red X + the reason
- For the FINAL deliverable: show "Approve for client" / "Request changes" buttons (these are human-facing)

## D. Wire Step Progress Webhook to Trigger Auto-Review

**File:** `apps/dashboard/src/app/api/webhooks/step-progress/route.ts`

After recording the step completion, automatically trigger the auto-review by messaging the orchestrator:

Add at the end of the handler:
```typescript
// Notify orchestrator to auto-review this step
try {
  await fetch(`${OPENCLAW_BASE}/api/sessions/main/send`, {
    method: "POST", 
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENCLAW_TOKEN}`,
    },
    body: JSON.stringify({ 
      message: `[SYSTEM: STEP-COMPLETE] Task "${task.title}" (${taskId}) — Step ${stepIndex + 1} completed. Output: ${output?.slice(0, 500) || "No output"}. Review this step and call POST http://localhost:3001/api/tasks/${taskId}/auto-review with { "stepIndex": ${stepIndex}, "decision": "approved" } if acceptable, or "rejected" with a note if not.`
    }),
  });
} catch (err) {
  console.error("[StepProgress] Failed to notify orchestrator:", err);
}
```

## Build Constraints
- Build must pass: `pnpm run build` in apps/dashboard/
- Don't modify convex/schema.ts
- Don't touch apps/landing/
- Use existing convex mutations (tasks.reviewStep, tasks.updateSteps, tasks.complete, workers.updateStatus, agentMessages.send, events.create)
