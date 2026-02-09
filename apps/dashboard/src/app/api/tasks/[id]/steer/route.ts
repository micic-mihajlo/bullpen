import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const OPENCLAW_HTTP_BASE =
  process.env.OPENCLAW_GATEWAY_URL?.replace(/^ws/, "http") || "http://localhost:18789";
const OPENCLAW_BEARER_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

/**
 * POST /api/tasks/[id]/steer
 *
 * Send a steering message to a running worker agent.
 * Used by the orchestrator to course-correct workers mid-task.
 *
 * Body:
 * {
 *   message: string,         // The steering instruction
 *   stepIndex?: number,      // Which step this relates to (optional)
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const body = await request.json();
    const { message, stepIndex } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    // Get the task
    const task = await convex.query(api.tasks.get, {
      id: taskId as Id<"tasks">,
    });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Get the worker to find the session key
    let sessionKey: string | null = null;
    if (task.workerId) {
      const workers = await convex.query(api.workers.getByTask, {
        taskId: taskId as Id<"tasks">,
      });
      const activeWorker = workers.find(
        (w) => w.status === "active" || w.status === "spawning"
      );
      if (activeWorker) {
        sessionKey = activeWorker.sessionKey;
      }
    }

    if (!sessionKey) {
      return NextResponse.json(
        { error: "No active worker session found for this task" },
        { status: 400 }
      );
    }

    // Send steering message to the worker via OpenClaw
    const steerMessage = stepIndex !== undefined
      ? `[ORCHESTRATOR STEERING — Step ${stepIndex + 1}]\n\n${message}`
      : `[ORCHESTRATOR STEERING]\n\n${message}`;

    const sendResponse = await fetch(
      `${OPENCLAW_HTTP_BASE}/api/sessions/${encodeURIComponent(sessionKey)}/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENCLAW_BEARER_TOKEN}`,
        },
        body: JSON.stringify({ message: steerMessage }),
      }
    );

    if (!sendResponse.ok) {
      const errText = await sendResponse.text();
      console.error("[Steer] Failed to send to worker:", sendResponse.status, errText);
      return NextResponse.json(
        { error: "Failed to send steering message", details: errText },
        { status: 502 }
      );
    }

    // Log the steering message in Convex
    await convex.mutation(api.agentMessages.send, {
      taskId: taskId as Id<"tasks">,
      fromAgent: "orchestrator",
      toAgent: "worker",
      message,
      messageType: "steering",
    });

    // Log event
    await convex.mutation(api.events.create, {
      type: "task_steered",
      message: `Orchestrator steered "${task.title}": ${message.slice(0, 100)}`,
      data: { taskId, sessionKey, stepIndex },
    });

    return NextResponse.json({
      success: true,
      taskId,
      sessionKey,
      message: "Steering message sent",
    });
  } catch (error) {
    console.error("[Steer] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
