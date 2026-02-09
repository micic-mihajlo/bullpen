import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * POST /api/tasks/[id]/dispatch
 *
 * Dispatch a pending task to a worker:
 * 1. Read task
 * 2. Find matching worker template by taskType
 * 3. Spawn worker
 * 4. Update task status to running, set first step to in_progress
 * 5. Update worker status to active
 * 6. Post agent message
 * 7. Log event
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;

    // 1. Read the task
    const task = await convex.query(api.tasks.get, {
      id: taskId as Id<"tasks">,
    });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    if (task.status !== "pending" && task.status !== "assigned") {
      return NextResponse.json(
        { error: `Task is already ${task.status}` },
        { status: 400 }
      );
    }

    // 2. Find matching worker template
    const templates = await convex.query(api.workerTemplates.list);
    const taskType = task.taskType || "general";

    let template = templates.find((t) => t.taskTypes.includes(taskType));
    if (!template && templates.length > 0) {
      template = templates[0];
    }
    if (!template) {
      return NextResponse.json(
        { error: "No worker template found for this task type" },
        { status: 400 }
      );
    }

    // 3. Create worker via spawn
    const sessionKey = `worker-${taskId}-${Date.now()}`;
    const workerId = await convex.mutation(api.workers.spawn, {
      templateId: template._id,
      taskId: taskId as Id<"tasks">,
      sessionKey,
      model: template.model,
    });

    // 4. Update task: status → running, startedAt
    await convex.mutation(api.taskExecution.dispatchTask, {
      taskId: taskId as Id<"tasks">,
    });

    // Set first step to in_progress
    if (task.steps && task.steps.length > 0) {
      const updatedSteps = task.steps.map((s, i) => {
        if (i === 0) {
          return { ...s, status: "in_progress" as const, startedAt: Date.now() };
        }
        return s;
      });
      await convex.mutation(api.tasks.updateSteps, {
        id: taskId as Id<"tasks">,
        steps: updatedSteps,
        currentStep: 0,
      });
    }

    // 5. Update worker status to active
    await convex.mutation(api.workers.updateStatus, {
      id: workerId,
      status: "active",
    });

    // 6. Post agent message
    const stepName = task.steps?.[0]?.name ?? "first step";
    await convex.mutation(api.agentMessages.send, {
      taskId: taskId as Id<"tasks">,
      fromAgent: template.displayName,
      toAgent: "orchestrator",
      message: `Worker spawned. Starting step 1: ${stepName}`,
      messageType: "update",
    });

    // 7. Log event
    await convex.mutation(api.events.create, {
      type: "task_dispatched",
      message: `Dispatched "${task.title}" → ${template.displayName}`,
      data: {
        taskId,
        templateName: template.name,
        workerId,
        sessionKey,
        model: template.model,
      },
    });

    // 8. Spawn real work by messaging the orchestrator session
    const OPENCLAW_BASE =
      process.env.OPENCLAW_GATEWAY_URL?.replace(/^ws/, "http") ||
      "http://localhost:18789";
    const OPENCLAW_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

    const stepList = (task.steps || [])
      .map((s, i) => `${i + 1}. ${s.name}: ${s.description}`)
      .join("\n");

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
          Authorization: `Bearer ${OPENCLAW_TOKEN}`,
        },
        body: JSON.stringify({ message: spawnMessage }),
      });
    } catch (err) {
      console.error("[Dispatch] Failed to notify orchestrator:", err);
      // Don't fail the dispatch — worker record is created, orchestrator can pick it up
    }

    return NextResponse.json({
      success: true,
      workerId,
      workerTemplate: template.displayName,
    });
  } catch (error) {
    console.error("[Dispatch] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
