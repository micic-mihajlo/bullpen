import { NextRequest, NextResponse } from "next/server";
import { getOpenClawClient } from "@/lib/openclaw";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// POST /api/tasks/[id]/dispatch - Dispatch task to agent via OpenClaw
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskId = id as Id<"tasks">;

    // Get the task
    const task = await convex.query(api.tasks.get, { id: taskId });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (!task.assignedAgentId) {
      return NextResponse.json(
        { error: "Task not assigned to an agent" },
        { status: 400 }
      );
    }

    // Get the agent
    const agent = await convex.query(api.agents.get, { id: task.assignedAgentId });
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (!agent.sessionKey) {
      return NextResponse.json(
        { error: "Agent not connected to OpenClaw session" },
        { status: 400 }
      );
    }

    // Connect to OpenClaw and send the task
    const client = getOpenClawClient();

    if (!client.isConnected()) {
      try {
        await client.connect();
      } catch (error) {
        console.error("[API] Failed to connect to OpenClaw:", error);
        return NextResponse.json(
          { error: "Failed to connect to OpenClaw Gateway" },
          { status: 503 }
        );
      }
    }

    // Format the task as a message to the agent
    const taskMessage = `📋 **New Task Assigned**

**Title:** ${task.title}
${task.description ? `**Description:** ${task.description}` : ""}
**Priority:** ${task.priority || 3}/5

Please work on this task and report back when complete.`;

    await client.sendMessage(agent.sessionKey, taskMessage);

    // Update task status to running
    await convex.mutation(api.tasks.start, { id: taskId });

    return NextResponse.json({
      success: true,
      message: "Task dispatched to agent",
      sessionKey: agent.sessionKey,
    });
  } catch (error) {
    console.error("[API] Failed to dispatch task:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
