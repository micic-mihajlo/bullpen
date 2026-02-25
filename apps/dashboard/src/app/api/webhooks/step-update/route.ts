import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * POST /api/webhooks/step-update
 *
 * Webhook for worker agents to report step progress.
 * Called after each step is completed.
 *
 * Body:
 * {
 *   taskId: string,           // Convex task ID
 *   stepIndex: number,        // 0-indexed step number
 *   status: "review" | "question" | "in_progress",
 *   output: string,           // What the agent did/produced
 *   agentName?: string,       // Worker name for logging
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, stepIndex, status, output, agentName } = body;

    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    }
    if (stepIndex === undefined || stepIndex === null) {
      return NextResponse.json({ error: "stepIndex is required" }, { status: 400 });
    }
    if (!status) {
      return NextResponse.json({ error: "status is required" }, { status: 400 });
    }

    // Get the task
    const task = await convex.query(api.tasks.get, {
      id: taskId as Id<"tasks">,
    });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Update the step
    if (task.steps && stepIndex < task.steps.length) {
      const updatedSteps = [...task.steps];
      const stepStatus = status === "question" ? "review" : status;

      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        status: stepStatus as "pending" | "in_progress" | "review" | "approved" | "rejected",
        agentOutput: output || updatedSteps[stepIndex].agentOutput,
        ...(stepStatus === "review" || stepStatus === "in_progress"
          ? { startedAt: updatedSteps[stepIndex].startedAt || Date.now() }
          : {}),
      };

      await convex.mutation(api.tasks.updateSteps, {
        id: taskId as Id<"tasks">,
        steps: updatedSteps,
        currentStep: stepIndex,
      });

      // If step is ready for review, update task status
      if (stepStatus === "review") {
        // Task goes to review state so orchestrator sees it
        // (We don't change to "review" status since the task is still running — 
        //  the review queue picks up steps with status "review")
      }
    }

    // Post agent message
    const messageType = status === "question" ? "question" : "update";
    await convex.mutation(api.agentMessages.send, {
      taskId: taskId as Id<"tasks">,
      fromAgent: agentName || "worker",
      toAgent: "orchestrator",
      message: output || `Step ${stepIndex + 1} ${status}`,
      messageType: messageType as "update" | "question",
    });

    // Update worker lastActivityAt
    if (task.workerId) {
      try {
        await convex.mutation(api.workers.updateStatus, {
          id: task.workerId,
          status: "active",
        });
      } catch {
        // Worker may not exist, that's ok
      }
    }

    // Log event
    const stepName = task.steps?.[stepIndex]?.name || `Step ${stepIndex + 1}`;
    await convex.mutation(api.events.create, {
      type: status === "question" ? "step_question" : "step_update",
      message: status === "question"
        ? `${agentName || "Worker"} needs help on "${stepName}"`
        : `${agentName || "Worker"} completed step "${stepName}" — awaiting review`,
      data: { taskId, stepIndex, status, output: output?.slice(0, 500) },
    });

    return NextResponse.json({
      success: true,
      taskId,
      stepIndex,
      status,
      message: `Step ${stepIndex + 1} updated to ${status}`,
    });
  } catch (error) {
    console.error("[Webhook] step-update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/webhooks/step-update",
    method: "POST",
    description: "Report step progress from worker agents",
    body: {
      taskId: "string (required)",
      stepIndex: "number (required, 0-indexed)",
      status: "'review' | 'question' | 'in_progress' (required)",
      output: "string (what the agent did/produced)",
      agentName: "string (optional)",
    },
  });
}
