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
    const { taskId, stepIndex, status, output, error, workerName } = body;

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
