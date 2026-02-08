import { NextRequest, NextResponse } from "next/server";
import { getOpenClawClient } from "@/lib/openclaw";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// POST /api/tasks/[id]/dispatch - Dispatch task via OpenClaw
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskId = id as Id<"tasks">;

    const task = await convex.query(api.tasks.get, { id: taskId });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Connect to OpenClaw
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

    const webhookUrl = process.env.BULLPEN_WEBHOOK_URL || "http://localhost:3001/api/webhooks/task-result";

    const taskPrompt = `## Task: ${task.title}
${task.description ? `\n${task.description}\n` : ""}
Task ID: ${taskId}

## Instructions
1. Complete this task thoroughly
2. When done, report your result via the webhook below

## Reporting Results
\`\`\`bash
curl -X POST ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"taskId": "${taskId}", "status": "completed", "result": "YOUR_RESULT_HERE"}'
\`\`\`

Begin working on this task now.`;

    // Update task status to running
    await convex.mutation(api.tasks.start, { id: taskId });

    await convex.mutation(api.events.create, {
      type: "task_dispatched",
      message: `Dispatched task "${task.title}"`,
      data: { taskId },
    });

    return NextResponse.json({
      success: true,
      message: `Task dispatched`,
    });
  } catch (error) {
    console.error("[API] Failed to dispatch task:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
