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

    // 8. Spawn a real sub-agent directly via OpenClaw gateway
    //    This bypasses the orchestrator — no waiting for me to be available.
    const OPENCLAW_BASE =
      process.env.OPENCLAW_GATEWAY_URL?.replace(/^ws/, "http") ||
      "http://localhost:18789";
    const OPENCLAW_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

    const stepList = (task.steps || [])
      .map((s, i) => `${i}. ${s.name}: ${s.description}`)
      .join("\n");

    // Get project info for context
    let projectBrief = "";
    if (task.projectId) {
      try {
        const project = await convex.query(api.projects.get, {
          id: task.projectId as Id<"projects">,
        });
        projectBrief = project?.brief || "";
      } catch {
        // non-fatal
      }
    }

    const agentTask = `You are a ${template.displayName} working on: "${task.title}"

Project context: ${projectBrief || "No additional context"}

Your job: Complete each step below sequentially. After completing EACH step, you MUST report progress by running:

curl -s -X POST http://localhost:3001/api/webhooks/step-progress -H "Content-Type: application/json" -d '{"taskId":"${taskId}","stepIndex":STEP_INDEX,"status":"completed","output":"DESCRIPTION_OF_WHAT_YOU_DID","workerName":"${template.displayName}"}'

Replace STEP_INDEX with the 0-based step number and DESCRIPTION_OF_WHAT_YOU_DID with a concise summary of your output.

Steps:
${stepList}

Guidelines:
- Be thorough but efficient
- Produce real, usable output (actual code, actual files, actual research)
- Write deliverable artifacts to /home/mihbot/ (repos, reports, workflows)
- Report each step completion via the webhook above — this is critical for tracking`;

    try {
      // Direct spawn via gateway RPC — no orchestrator middleman
      const spawnResp = await fetch(`${OPENCLAW_BASE}/api/sessions/main/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENCLAW_TOKEN}`,
        },
        body: JSON.stringify({
          message: `[SYSTEM: SPAWN-AGENT-NOW] Immediately spawn a sub-agent for this task. Do not wait or ask — just call sessions_spawn right now.

sessions_spawn task: ${JSON.stringify(agentTask)}
sessions_spawn label: worker-${taskId.slice(-8)}`,
        }),
      });

      if (!spawnResp.ok) {
        console.error("[Dispatch] Gateway spawn failed:", spawnResp.status);
      }
    } catch (err) {
      console.error("[Dispatch] Failed to spawn agent:", err);
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
