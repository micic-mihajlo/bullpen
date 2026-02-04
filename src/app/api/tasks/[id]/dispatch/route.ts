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

    // Extract role from soul
    const role = agent.soul?.match(/Role:\s*(.+)/)?.[1] || "Assistant";
    
    // Webhook URL for reporting results
    const webhookUrl = process.env.BULLPEN_WEBHOOK_URL || "http://localhost:3001/api/webhooks/task-result";
    
    // Build the task prompt with webhook callback instructions
    const taskPrompt = `You are ${agent.name}, a ${role}.

## Task: ${task.title}
${task.description ? `\n${task.description}\n` : ""}
Priority: ${task.priority || 3}/5
Task ID: ${taskId}

## Instructions
1. Complete this task thoroughly
2. When done, report your result via the webhook below
3. Your result should be a clear, useful deliverable

## Reporting Results
When finished, call the webhook to report completion:

\`\`\`bash
curl -X POST ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"taskId": "${taskId}", "status": "completed", "result": "YOUR_RESULT_HERE", "agentName": "${agent.name}"}'
\`\`\`

If the task fails, report the error:
\`\`\`bash
curl -X POST ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"taskId": "${taskId}", "status": "failed", "error": "ERROR_DESCRIPTION", "agentName": "${agent.name}"}'
\`\`\`

Use exec to run the curl command. Replace YOUR_RESULT_HERE with your actual deliverable (escaped for JSON).`;

    // Use cron.add with immediate execution for isolated agent run
    // This spawns a fresh session that will announce results back
    const cronResult = await client.call<{ id: string }>("cron.add", {
      name: `task-${taskId.slice(-8)}`,
      schedule: { kind: "at", atMs: Date.now() + 1000 }, // Run in 1 second
      sessionTarget: "isolated",
      payload: {
        kind: "agentTurn",
        message: taskPrompt,
        model: agent.model || "cerebras/zai-glm-4.7", // Use agent's preferred model
        deliver: false, // Don't deliver to channel, just run
      },
    });

    // Update task status to running
    await convex.mutation(api.tasks.start, { id: taskId });

    // Log the dispatch event
    await convex.mutation(api.events.create, {
      agentId: task.assignedAgentId,
      type: "task_dispatched",
      message: `Dispatched "${task.title}" to ${agent.name}`,
      data: { taskId, cronJobId: cronResult.id, model: agent.model },
    });

    return NextResponse.json({
      success: true,
      message: "Task dispatched via isolated agent run",
      cronJobId: cronResult.id,
      model: agent.model || "cerebras/zai-glm-4.7",
    });
  } catch (error) {
    console.error("[API] Failed to dispatch task:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
