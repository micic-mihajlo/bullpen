import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * POST /api/webhooks/step-progress
 *
 * Webhook for workers to report step completion.
 *
 * Body: { taskId, stepIndex, status, output?, error?, workerName? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, stepIndex, status, output, workerName } = body;

    if (!taskId || stepIndex === undefined || !status) {
      return NextResponse.json(
        { error: "taskId, stepIndex, and status are required" },
        { status: 400 }
      );
    }

    // 1. Get the task
    const task = await convex.query(api.tasks.get, {
      id: taskId as Id<"tasks">,
    });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    if (!task.steps) {
      return NextResponse.json(
        { error: "Task has no steps" },
        { status: 400 }
      );
    }

    if (stepIndex < 0 || stepIndex >= task.steps.length) {
      return NextResponse.json({ error: "Invalid stepIndex" }, { status: 400 });
    }

    // Enforce strict sequencing: workers may only report completion for current in-progress step
    if (task.currentStep !== undefined && stepIndex !== task.currentStep) {
      return NextResponse.json(
        {
          error: `Out-of-order step completion. Expected stepIndex ${task.currentStep}, got ${stepIndex}`,
        },
        { status: 409 }
      );
    }

    const targetStep = task.steps[stepIndex];
    if (targetStep.status !== "in_progress") {
      return NextResponse.json(
        { error: `Step ${stepIndex + 1} is not in progress (status: ${targetStep.status})` },
        { status: 409 }
      );
    }

    // 2. Clone steps and update the target step
    const updatedSteps = task.steps.map((s, i) => {
      if (i === stepIndex) {
        return {
          ...s,
          status: "review" as const,
          agentOutput: output || s.agentOutput,
          completedAt: Date.now(),
        };
      }
      return s;
    });

    // 3. Write back
    await convex.mutation(api.tasks.updateSteps, {
      id: taskId as Id<"tasks">,
      steps: updatedSteps,
    });

    // 4. Post agent message
    const stepName = task.steps[stepIndex]?.name ?? `Step ${stepIndex + 1}`;
    const preview = output ? output.slice(0, 120) : "No output provided";
    const fromName = workerName || "worker";

    await convex.mutation(api.agentMessages.send, {
      taskId: taskId as Id<"tasks">,
      fromAgent: fromName,
      toAgent: "orchestrator",
      message: `Step ${stepIndex + 1} completed: ${preview}`,
      messageType: "update",
    });

    // 5. Log event
    await convex.mutation(api.events.create, {
      type: "step_completed",
      message: `Step "${stepName}" ready for review`,
      data: { taskId, stepIndex, status },
    });

    // 6. Notify orchestrator to auto-review this step
    const OPENCLAW_BASE =
      process.env.OPENCLAW_GATEWAY_URL?.replace(/^ws/, "http") ||
      "http://localhost:18789";
    const OPENCLAW_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

    try {
      const reviewerTask = `You are the Bullpen orchestrator reviewer. Review exactly one step and decide approved/rejected.\n\nTask: "${task.title}" (ID: ${taskId})\nStep ${stepIndex + 1}/${task.steps.length}: "${stepName}"\nStep Description: ${task.steps[stepIndex]?.description || "No description"}\n\nWorker Output:\n${output || "No output provided"}\n\nRules:\n1) Reject if output is incomplete, vague, or not clearly aligned with the step description.\n2) Approve only when the step deliverable is concrete and sufficient.\n3) Write a concise but specific review note.\n\nThen call:\nPOST http://localhost:3001/api/tasks/${taskId}/auto-review\nBody: { "stepIndex": ${stepIndex}, "decision": "approved"|"rejected", "note": "specific assessment" }\n\nDo this now.`;

      const notifyResp = await fetch(`${OPENCLAW_BASE}/tools/invoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENCLAW_TOKEN}`,
        },
        body: JSON.stringify({
          tool: "sessions_spawn",
          args: {
            label: `review-${taskId.slice(-6)}-${stepIndex + 1}`,
            model: "openai-codex/gpt-5.3-codex",
            task: reviewerTask,
          },
        }),
      });

      if (!notifyResp.ok) {
        const txt = await notifyResp.text();
        console.error("[StepProgress] Failed to spawn reviewer:", notifyResp.status, txt);
      }
    } catch (notifyErr) {
      console.error("[StepProgress] Failed to spawn reviewer:", notifyErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[StepProgress] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/step-progress — health check
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/webhooks/step-progress",
    status: "ok",
  });
}
