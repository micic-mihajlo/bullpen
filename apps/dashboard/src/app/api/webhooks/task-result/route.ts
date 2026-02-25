import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type EvidenceMap = Record<string, unknown>;

function validateEvidence(task: any, result?: string, evidence?: EvidenceMap): string | null {
  const contract = task.executionContract;
  if (!contract) return null;

  if (typeof contract.minResultChars === "number") {
    const len = (result || "").trim().length;
    if (len < contract.minResultChars) {
      return `Result too short: expected at least ${contract.minResultChars} chars, got ${len}`;
    }
  }

  if (!Array.isArray(contract.requiredEvidence) || contract.requiredEvidence.length === 0) {
    return null;
  }

  if (!evidence || typeof evidence !== "object") {
    return "Missing evidence object required by task contract";
  }

  for (const req of contract.requiredEvidence) {
    const val = evidence[req.key];
    if (val === undefined || val === null || String(val).trim() === "") {
      return `Missing required evidence: ${req.key}`;
    }

    const strVal = String(val).trim();
    if (req.type === "url") {
      if (!/^https?:\/\//i.test(strVal)) {
        return `Evidence ${req.key} must be a valid URL`;
      }
    } else if (req.type === "number") {
      if (!Number.isFinite(Number(strVal))) {
        return `Evidence ${req.key} must be numeric`;
      }
    } else if (req.type === "file") {
      if (!fs.existsSync(strVal)) {
        return `Evidence file not found for ${req.key}: ${strVal}`;
      }
    }
  }

  return null;
}

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
    const { taskId, status, result, error, agentName, evidence } = body;

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

    // Idempotency/safety guard: ignore late failure/completion after terminal completion
    if (task.status === "completed") {
      return NextResponse.json({
        success: true,
        taskId,
        status: task.status,
        message: "Ignored duplicate task-result webhook; task already completed",
      });
    }
    if (task.status === "failed" && status === "failed") {
      return NextResponse.json({
        success: true,
        taskId,
        status: task.status,
        message: "Ignored duplicate task-result webhook; task already failed",
      });
    }

    // Update task based on status
    if (status === "completed") {
      const evidenceError = validateEvidence(task, result, evidence);
      if (evidenceError) {
        return NextResponse.json(
          {
            error: evidenceError,
            hint: "Provide required evidence fields in task-result payload.",
          },
          { status: 409 }
        );
      }

      try {
        await convex.mutation(api.tasks.complete, {
          id: taskId as Id<"tasks">,
          result: result || "Completed",
        });

        if (task.executionContract) {
          await convex.mutation(api.taskExecution.updateLiveContext, {
            taskId: taskId as Id<"tasks">,
            liveContext: {
              ...(task.liveContext || {}),
              completionEvidence: evidence || null,
              completionReportedBy: agentName || "Agent",
              completionReportedAt: Date.now(),
            },
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Completion rejected";
        return NextResponse.json(
          {
            error: msg,
            hint: "All task steps must be approved by orchestrator before marking task completed.",
          },
          { status: 409 }
        );
      }
    } else {
      if (!error || !String(error).trim()) {
        return NextResponse.json(
          { error: "error is required when status=failed" },
          { status: 400 }
        );
      }

      await convex.mutation(api.tasks.fail, {
        id: taskId as Id<"tasks">,
        error: String(error),
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
      evidence: "object (optional, required when task has executionContract.requiredEvidence)",
    },
  });
}
