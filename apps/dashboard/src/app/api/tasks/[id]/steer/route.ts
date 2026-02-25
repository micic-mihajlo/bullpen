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
 *
 * Body: { message: string, stepIndex?: number }
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

    // 1. Get the task
    const task = await convex.query(api.tasks.get, {
      id: taskId as Id<"tasks">,
    });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // 2. Post agent message
    await convex.mutation(api.agentMessages.send, {
      taskId: taskId as Id<"tasks">,
      fromAgent: "orchestrator",
      toAgent: "worker",
      message,
      messageType: "steering",
    });

    // 3. If worker has sessionKey, try to send to OpenClaw
    let sentToWorker = false;
    if (task.workerId) {
      const workers = await convex.query(api.workers.getByTask, {
        taskId: taskId as Id<"tasks">,
      });
      const activeWorker = workers.find(
        (w) => w.status === "active" || w.status === "spawning"
      );
      if (activeWorker?.sessionKey) {
        try {
          const steerMessage = stepIndex !== undefined
            ? `[ORCHESTRATOR STEERING — Step ${stepIndex + 1}]\n\n${message}`
            : `[ORCHESTRATOR STEERING]\n\n${message}`;

          await fetch(
            `${OPENCLAW_HTTP_BASE}/api/sessions/${encodeURIComponent(activeWorker.sessionKey)}/send`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENCLAW_BEARER_TOKEN}`,
              },
              body: JSON.stringify({ message: steerMessage }),
            }
          );
          sentToWorker = true;
        } catch (err) {
          console.error("[Steer] Failed to send to OpenClaw:", err);
        }
      }
    }

    // 4. Log event
    await convex.mutation(api.events.create, {
      type: "task_steered",
      message: `Orchestrator steered "${task.title}": ${message.slice(0, 100)}`,
      data: { taskId, stepIndex, sentToWorker },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Steer] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
