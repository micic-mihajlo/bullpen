import { NextRequest, NextResponse } from "next/server";
import { getOpenClawClient } from "@/lib/openclaw";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// POST /api/tasks/[id]/dispatch - Dispatch task to agent via OpenClaw sessions_spawn
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
    
    // Build the task prompt for the spawned agent
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

Use exec to run the curl command. Replace YOUR_RESULT_HERE with your actual deliverable (escaped for JSON).

Begin working on this task now.`;

    // Spawn an isolated sub-agent session directly
    const spawnResult = await client.spawnSession({
      task: taskPrompt,
      label: `bullpen-task-${taskId}`,
      model: agent.model || undefined,
      timeoutSeconds: 300, // 5 min timeout for spawn acknowledgment
      runTimeoutSeconds: 1800, // 30 min max runtime
    });

    // Update task status to running
    await convex.mutation(api.tasks.start, { id: taskId });

    // Log the dispatch event
    await convex.mutation(api.events.create, {
      agentId: task.assignedAgentId,
      type: "task_dispatched",
      message: `Spawned isolated session for "${task.title}"`,
      data: { 
        taskId, 
        sessionKey: spawnResult.sessionKey,
        runId: spawnResult.runId,
        model: agent.model 
      },
    });

    return NextResponse.json({
      success: true,
      message: "Task dispatched via sessions_spawn",
      sessionKey: spawnResult.sessionKey,
      runId: spawnResult.runId,
      model: agent.model,
    });
  } catch (error) {
    console.error("[API] Failed to dispatch task:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
