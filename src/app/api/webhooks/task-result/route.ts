import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * POST /api/webhooks/task-result
 * 
 * Webhook for OpenClaw agents to report task completion.
 * Called programmatically when an agent finishes work.
 * 
 * Body:
 * {
 *   taskId: string,          // Convex task ID
 *   status: "completed" | "failed",
 *   result?: string,         // Output/deliverable for completed tasks
 *   error?: string,          // Error message for failed tasks
 *   agentName?: string,      // For logging
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, status, result, error, agentName } = body;

    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    }

    if (!status || !["completed", "failed"].includes(status)) {
      return NextResponse.json(
        { error: "status must be 'completed' or 'failed'" },
        { status: 400 }
      );
    }

    // Validate task exists
    const task = await convex.query(api.tasks.get, { id: taskId as Id<"tasks"> });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Update task based on status
    if (status === "completed") {
      await convex.mutation(api.tasks.complete, {
        id: taskId as Id<"tasks">,
        result: result || "Completed",
      });
    } else {
      await convex.mutation(api.tasks.fail, {
        id: taskId as Id<"tasks">,
        error: error || "Unknown error",
      });
    }

    // Log webhook event
    await convex.mutation(api.events.create, {
      agentId: task.assignedAgentId,
      type: status === "completed" ? "task_completed" : "task_failed",
      message: `${agentName || "Agent"} ${status === "completed" ? "completed" : "failed"}: "${task.title}"`,
      data: { taskId, via: "webhook", result: result?.slice(0, 200) },
    });

    return NextResponse.json({
      success: true,
      taskId,
      status,
      message: `Task marked as ${status}`,
    });
  } catch (error) {
    console.error("[Webhook] Failed to process task result:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// GET for health check / discovery
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/webhooks/task-result",
    method: "POST",
    description: "Report task completion from OpenClaw agents",
    body: {
      taskId: "string (required)",
      status: "'completed' | 'failed' (required)",
      result: "string (optional, for completed tasks)",
      error: "string (optional, for failed tasks)",
      agentName: "string (optional, for logging)",
    },
  });
}
