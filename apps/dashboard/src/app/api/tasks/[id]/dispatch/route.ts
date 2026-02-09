import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const OPENCLAW_HTTP_BASE =
  process.env.OPENCLAW_GATEWAY_URL?.replace(/^ws/, "http") || "http://localhost:18789";
const OPENCLAW_BEARER_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3001";

/**
 * POST /api/tasks/[id]/dispatch
 *
 * The orchestration endpoint. This:
 * 1. Reads the task and its project context
 * 2. Finds the right worker template based on taskType
 * 3. Spawns a real OpenClaw sub-agent via sessions_spawn
 * 4. Creates a worker record in Convex
 * 5. Updates the task status to "running"
 *
 * The spawned agent receives:
 * - Task description and steps
 * - Worker SOUL (from template systemPrompt)
 * - Instructions to report progress via webhooks
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;

    // 1. Get the task
    const task = await convex.query(api.tasks.get, {
      id: taskId as Id<"tasks">,
    });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    if (task.status !== "pending" && task.status !== "assigned") {
      return NextResponse.json(
        { error: `Task is already ${task.status}` },
        { status: 400 }
      );
    }

    // 2. Get project context if available
    let projectContext = "";
    if (task.projectId) {
      const project = await convex.query(api.projects.get, {
        id: task.projectId,
      });
      if (project) {
        projectContext = `Project: ${project.name}\nBrief: ${project.brief || "No brief provided"}\nType: ${project.type}`;
      }
    }

    // 3. Find the right worker template
    const templates = await convex.query(api.workerTemplates.list);
    const taskType = task.taskType || "general";

    let template = templates.find((t) =>
      t.taskTypes.includes(taskType)
    );
    // Fallback to first active template if no match
    if (!template && templates.length > 0) {
      template = templates[0];
    }
    if (!template) {
      return NextResponse.json(
        { error: "No worker template found for this task type" },
        { status: 400 }
      );
    }

    // 4. Build the task prompt for the spawned agent
    const stepsText = task.steps
      ? task.steps
          .map(
            (s: { name: string; description: string }, i: number) =>
              `  Step ${i + 1}: ${s.name} — ${s.description}`
          )
          .join("\n")
      : "  No steps defined — work through the task and report your approach.";

    const webhookUrl = `${DASHBOARD_URL}/api/webhooks/step-update`;
    const resultUrl = `${DASHBOARD_URL}/api/webhooks/task-result`;

    const agentPrompt = `${template.systemPrompt}

---

## Your Task

**Task ID:** ${taskId}
**Title:** ${task.title}
**Type:** ${taskType}
**Description:** ${task.description || "No description provided"}

${projectContext ? `## Project Context\n${projectContext}\n` : ""}

## Steps
${stepsText}

## Reporting

After completing each step, report your progress by calling this webhook:

\`\`\`bash
curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "taskId": "${taskId}",
    "stepIndex": <STEP_NUMBER_0_INDEXED>,
    "status": "review",
    "output": "<WHAT_YOU_DID_AND_PRODUCED>"
  }'
\`\`\`

When the entire task is complete:

\`\`\`bash
curl -X POST "${resultUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "taskId": "${taskId}",
    "status": "completed",
    "result": "<FINAL_DELIVERABLE_SUMMARY>",
    "agentName": "${template.displayName}"
  }'
\`\`\`

If you encounter a blocking issue:

\`\`\`bash
curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "taskId": "${taskId}",
    "stepIndex": <CURRENT_STEP>,
    "status": "question",
    "output": "<WHAT_YOU_NEED_HELP_WITH>"
  }'
\`\`\`

## Rules
- Work through steps in order
- Report after EACH step — do not skip reporting
- Wait for review before proceeding to the next step if instructed
- If something is unclear, ask via the question webhook — don't guess
- Be thorough but concise in your output reports
`;

    // 5. Spawn the sub-agent via OpenClaw /v1/chat/completions (fire-and-forget)
    // We use streaming mode so the request starts immediately and we don't block
    const sessionKey = `bullpen-worker-${taskId}-${Date.now()}`;

    // Fire and forget — don't await. The agent will report back via webhooks.
    fetch(`${OPENCLAW_HTTP_BASE}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENCLAW_BEARER_TOKEN}`,
      },
      body: JSON.stringify({
        model: template.model === "claude-opus-4-6"
          ? "anthropic/claude-opus-4-6"
          : template.model === "claude-sonnet-4.5"
          ? "anthropic/claude-sonnet-4-5-20250514"
          : "anthropic/claude-sonnet-4-5-20250514",
        messages: [
          {
            role: "system",
            content: template.systemPrompt,
          },
          {
            role: "user",
            content: agentPrompt,
          },
        ],
        stream: true,
        user: sessionKey,
      }),
    }).catch((err) => {
      console.error("[Dispatch] Background spawn failed:", err);
    });

    // 6. Create worker record in Convex
    const workerId = await convex.mutation(api.workers.spawn, {
      templateId: template._id,
      taskId: taskId as Id<"tasks">,
      sessionKey,
      model: template.model,
    });

    // 7. Update task status
    await convex.mutation(api.taskExecution.dispatchTask, {
      taskId: taskId as Id<"tasks">,
    });

    // Link workerId to task
    // (workers.spawn already does this via patch)

    // 8. Log the dispatch event
    await convex.mutation(api.events.create, {
      type: "task_dispatched",
      message: `Dispatched "${task.title}" → ${template.displayName}`,
      data: {
        taskId,
        templateName: template.name,
        workerId,
        sessionKey,
        model: template.model,
      },
    });

    // 9. Post initial agent message
    await convex.mutation(api.agentMessages.send, {
      taskId: taskId as Id<"tasks">,
      fromAgent: "orchestrator",
      toAgent: template.displayName,
      message: `Task dispatched to ${template.displayName}. Worker spawned with model ${template.model}.`,
      messageType: "handoff",
    });

    return NextResponse.json({
      success: true,
      taskId,
      workerId,
      sessionKey,
      template: template.name,
      model: template.model,
    });
  } catch (error) {
    console.error("[Dispatch] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
