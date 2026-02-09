import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * POST /api/tasks/[id]/review-step
 *
 * Approve or reject a step on a task.
 *
 * Body: { stepIndex: number, action: "approved" | "rejected", note?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const body = await request.json();
    const { stepIndex, action, note } = body;

    if (stepIndex === undefined || !action) {
      return NextResponse.json(
        { error: "stepIndex and action are required" },
        { status: 400 }
      );
    }
    if (action !== "approved" && action !== "rejected") {
      return NextResponse.json(
        { error: 'action must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    // 1. Call reviewStep mutation (handles step update, currentStep advance, agentMessage)
    await convex.mutation(api.tasks.reviewStep, {
      id: taskId as Id<"tasks">,
      stepIndex,
      action,
      reviewNote: note,
    });

    // 2. Re-read task to check if we need to advance or complete
    const task = await convex.query(api.tasks.get, {
      id: taskId as Id<"tasks">,
    });
    if (!task || !task.steps) {
      return NextResponse.json({ success: true, allStepsComplete: false });
    }

    let allStepsComplete = false;

    if (action === "approved") {
      const nextStepIndex = stepIndex + 1;

      if (nextStepIndex < task.steps.length) {
        // Advance: set next step to in_progress
        const updatedSteps = task.steps.map((s, i) => {
          if (i === nextStepIndex) {
            return { ...s, status: "in_progress" as const, startedAt: Date.now() };
          }
          return s;
        });
        await convex.mutation(api.tasks.updateSteps, {
          id: taskId as Id<"tasks">,
          steps: updatedSteps,
        });
      } else {
        // All steps done — complete the task
        allStepsComplete = true;
        await convex.mutation(api.tasks.complete, {
          id: taskId as Id<"tasks">,
          result: "All steps completed and approved",
        });
      }
    }

    return NextResponse.json({ success: true, allStepsComplete });
  } catch (error) {
    console.error("[ReviewStep] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
