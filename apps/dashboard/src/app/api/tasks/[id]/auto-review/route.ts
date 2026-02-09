import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * POST /api/tasks/[id]/auto-review
 *
 * Auto-review endpoint called by the orchestrator to approve/reject a completed step.
 *
 * Body: { stepIndex: number, decision: "approved" | "rejected", note?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const body = await request.json();
    const { stepIndex, decision, note } = body;

    if (stepIndex === undefined || !decision) {
      return NextResponse.json(
        { error: "stepIndex and decision are required" },
        { status: 400 }
      );
    }

    if (decision !== "approved" && decision !== "rejected") {
      return NextResponse.json(
        { error: 'decision must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    // 1. Get task from Convex
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

    // 2. Call existing reviewStep mutation
    await convex.mutation(api.tasks.reviewStep, {
      id: taskId as Id<"tasks">,
      stepIndex,
      action: decision,
      reviewNote: note || (decision === "approved" ? "Auto-approved by orchestrator" : undefined),
    });

    const isLastStep = stepIndex === task.steps.length - 1;
    let taskComplete = false;
    let nextStep: number | null = null;

    if (decision === "approved") {
      if (!isLastStep) {
        // 3. Approved + next step exists: advance to next step
        const nextIdx = stepIndex + 1;
        nextStep = nextIdx;
        const updatedSteps = task.steps.map((s, i) => {
          if (i === stepIndex) {
            return { ...s, status: "approved" as const, reviewNote: note || "Auto-approved by orchestrator" };
          }
          if (i === nextIdx) {
            return { ...s, status: "in_progress" as const, startedAt: Date.now() };
          }
          return s;
        });

        await convex.mutation(api.tasks.updateSteps, {
          id: taskId as Id<"tasks">,
          steps: updatedSteps,
          currentStep: nextIdx,
        });

        const nextStepName = task.steps[nextIdx]?.name ?? `Step ${nextIdx + 1}`;
        await convex.mutation(api.agentMessages.send, {
          taskId: taskId as Id<"tasks">,
          fromAgent: "orchestrator",
          toAgent: "worker",
          message: `Step ${stepIndex + 1} approved. Moving to step ${nextIdx + 1}: ${nextStepName}`,
          messageType: "decision",
        });
      } else {
        // 4. Approved + all steps done: complete the task
        taskComplete = true;

        await convex.mutation(api.tasks.complete, {
          id: taskId as Id<"tasks">,
          result: `All ${task.steps.length} steps completed and approved.`,
        });

        await convex.mutation(api.agentMessages.send, {
          taskId: taskId as Id<"tasks">,
          fromAgent: "orchestrator",
          toAgent: "worker",
          message: "All steps completed. Task done.",
          messageType: "decision",
        });

        // Auto-dispatch next pending task or finalize project
        if (task.projectId) {
          try {
            const projectTasks = await convex.query(api.tasks.byProject, {
              projectId: task.projectId as Id<"projects">,
            });
            const nextPending = projectTasks.find((t) => t.status === "pending");
            if (nextPending) {
              // More tasks to do — dispatch the next one
              const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
              await fetch(`${baseUrl}/api/tasks/${nextPending._id}/dispatch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
              });

              await convex.mutation(api.events.create, {
                type: "task_auto_dispatched",
                message: `Auto-dispatched next task: "${nextPending.title}"`,
                data: { taskId: nextPending._id, projectId: task.projectId },
              });
            } else {
              // All tasks done — create ONE project-level deliverable for human review
              const allDone = projectTasks.every(
                (t) => t._id === (taskId as Id<"tasks">) || t.status === "completed"
              );
              if (allDone) {
                // Compile all task outputs into a single deliverable
                const allTasksWithSteps = await Promise.all(
                  projectTasks.map((t) => convex.query(api.tasks.get, { id: t._id }))
                );
                const content = allTasksWithSteps
                  .filter(Boolean)
                  .map((t) => {
                    const stepOutputs = (t!.steps || [])
                      .map((s, i) => `### Step ${i + 1}: ${s.name}\n${s.agentOutput || "Completed"}`)
                      .join("\n\n");
                    return `## ${t!.title}\n\n${stepOutputs}`;
                  })
                  .join("\n\n---\n\n");

                await convex.mutation(api.deliverables.create, {
                  projectId: task.projectId as Id<"projects">,
                  title: `Project Deliverable — Ready for Review`,
                  content,
                  format: "markdown",
                });

                // Update project status to review
                await convex.mutation(api.projects.updateStatus, {
                  id: task.projectId as Id<"projects">,
                  status: "review",
                });

                await convex.mutation(api.events.create, {
                  type: "project_completed",
                  message: `All tasks completed. Deliverable ready for client review.`,
                  data: { projectId: task.projectId },
                });
              }
            }
          } catch (dispatchErr) {
            console.error("[AutoReview] Failed to auto-dispatch next task:", dispatchErr);
          }
        }
      }
    } else {
      // 5. Rejected: post rejection message
      await convex.mutation(api.agentMessages.send, {
        taskId: taskId as Id<"tasks">,
        fromAgent: "orchestrator",
        toAgent: "worker",
        message: `Step ${stepIndex + 1} rejected. ${note || "Please redo this step."}`,
        messageType: "decision",
      });
    }

    // 6. Log event
    await convex.mutation(api.events.create, {
      type: "step_auto_reviewed",
      message: `Step ${stepIndex + 1} ${decision}${note ? `: ${note}` : ""}`,
      data: { taskId, stepIndex, decision, note: note || null },
    });

    return NextResponse.json({
      success: true,
      nextStep,
      taskComplete,
    });
  } catch (error) {
    console.error("[AutoReview] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
