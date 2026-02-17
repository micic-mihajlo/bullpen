import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * POST /api/tasks/[id]/dispatch
 *
 * Dispatch a pending task to a worker:
 * 1. Read task
 * 2. Find matching worker template by taskType
 * 3. Spawn worker
 * 4. Update task status to running, set first step to in_progress
 * 5. Update worker status to active
 * 6. Post agent message
 * 7. Log event
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;

    // 1. Read the task
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

    // Dependency gate: do not dispatch tasks with unmet prerequisites
    if (task.dependsOn && task.dependsOn.length > 0) {
      const dependencyStates = await Promise.all(
        task.dependsOn.map(async (depId) => {
          const depTask = await convex.query(api.tasks.get, { id: depId });
          return {
            id: depId,
            title: depTask?.title ?? "Unknown task",
            status: depTask?.status ?? "missing",
          };
        })
      );

      const blockedBy = dependencyStates.filter((d) => d.status !== "completed");
      if (blockedBy.length > 0) {
        return NextResponse.json(
          {
            error: "Task is blocked by dependencies",
            blockedBy,
          },
          { status: 409 }
        );
      }
    }

    // 2. Find matching worker template
    const templates = await convex.query(api.workerTemplates.list);
    const taskType = task.taskType || "general";

    let template = templates.find((t) => t.taskTypes.includes(taskType));
    if (!template && templates.length > 0) {
      template = templates[0];
    }
    if (!template) {
      return NextResponse.json(
        { error: "No worker template found for this task type" },
        { status: 400 }
      );
    }

    // 3. Create worker via spawn
    const sessionKey = `worker-${taskId}-${Date.now()}`;
    const workerId = await convex.mutation(api.workers.spawn, {
      templateId: template._id,
      taskId: taskId as Id<"tasks">,
      sessionKey,
      model: template.model,
    });

    // 4. Update task: status → running, startedAt
    await convex.mutation(api.taskExecution.dispatchTask, {
      taskId: taskId as Id<"tasks">,
    });

    // Set first step to in_progress
    if (task.steps && task.steps.length > 0) {
      const updatedSteps = task.steps.map((s, i) => {
        if (i === 0) {
          return { ...s, status: "in_progress" as const, startedAt: Date.now() };
        }
        return s;
      });
      await convex.mutation(api.tasks.updateSteps, {
        id: taskId as Id<"tasks">,
        steps: updatedSteps,
        currentStep: 0,
      });
    }

    // 5. Keep worker in spawning until real sub-agent spawn succeeds

    // 6. Post agent message
    const stepName = task.steps?.[0]?.name ?? "first step";
    await convex.mutation(api.agentMessages.send, {
      taskId: taskId as Id<"tasks">,
      fromAgent: template.displayName,
      toAgent: "orchestrator",
      message: `Worker spawned. Starting step 1: ${stepName}`,
      messageType: "update",
    });

    // 7. Log event
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

    // 8. Spawn a real sub-agent directly via OpenClaw gateway
    //    Uses /tools/invoke to call sessions_spawn — no orchestrator middleman.
    const OPENCLAW_BASE =
      process.env.OPENCLAW_GATEWAY_URL?.replace(/^ws/, "http") ||
      "http://localhost:18789";
    const OPENCLAW_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

    const stepList = (task.steps || [])
      .map((s, i) => `${i}. ${s.name}: ${s.description}`)
      .join("\n");

    // Get project info for context
    let projectBrief = "";
    if (task.projectId) {
      try {
        const project = await convex.query(api.projects.get, {
          id: task.projectId as Id<"projects">,
        });
        projectBrief = project?.brief || "";
      } catch {
        // non-fatal
      }
    }

    // Map task types to skills for deterministic invocation
    const skillForTaskType: Record<string, string> = {
      coding: "coding-agent",
      automation: "n8n-workflow-patterns",
      research: "", // no specific skill — uses web_search + web_fetch
      review: "coding-agent",
      design: "frontend-design",
      general: "",
    };
    const skillDirective = skillForTaskType[taskType]
      ? `\n\nIMPORTANT: Use the "${skillForTaskType[taskType]}" skill for this task. Load its SKILL.md and follow its procedures.`
      : "";

    // Standardized output path
    const projectSlug = (projectBrief || task.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
    const outputDir = `/home/mihbot/deliverables/${projectSlug}`;

    const agentTask = `You are a ${template.displayName} working on: "${task.title}"

Project context: ${projectBrief || "No additional context"}${skillDirective}

Your job: Complete each step below sequentially. After completing EACH step, you MUST report progress by running:

curl -s -X POST http://localhost:3001/api/webhooks/step-progress -H "Content-Type: application/json" -d '{"taskId":"${taskId}","stepIndex":STEP_INDEX,"status":"completed","output":"DESCRIPTION_OF_WHAT_YOU_DID","workerName":"${template.displayName}"}'

Replace STEP_INDEX with the 0-based step number and DESCRIPTION_OF_WHAT_YOU_DID with a concise summary of your output.

Steps:
${stepList}

Guidelines:
- Be thorough but efficient
- Produce real, usable output (actual code, actual files, actual research)
- Write ALL deliverable artifacts to ${outputDir}/ — this is the standard output directory
- For code projects: initialize repos inside ${outputDir}/
- For research: write reports to ${outputDir}/
- For automation: write workflow JSON and docs to ${outputDir}/
- Report each step completion via the webhook above — this is critical for tracking`;

    try {
      // Direct spawn via Gateway Tools Invoke API — no orchestrator middleman
      // POST /tools/invoke calls sessions_spawn directly, returns childSessionKey
      const spawnResp = await fetch(`${OPENCLAW_BASE}/tools/invoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENCLAW_TOKEN}`,
        },
        body: JSON.stringify({
          tool: "sessions_spawn",
          args: {
            task: agentTask,
            label: `worker-${taskId.slice(-8)}`,
          },
        }),
      });

      if (!spawnResp.ok) {
        const body = await spawnResp.text();
        await convex.mutation(api.workers.updateStatus, {
          id: workerId,
          status: "failed",
        });
        await convex.mutation(api.tasks.fail, {
          id: taskId as Id<"tasks">,
          error: `Worker spawn failed (${spawnResp.status}): ${body.slice(0, 300)}`,
        });

        return NextResponse.json(
          {
            error: "Failed to spawn worker session",
            details: body,
          },
          { status: 503 }
        );
      }

      const spawnResult = await spawnResp.json();
      const childKey = spawnResult?.result?.details?.childSessionKey;

      if (!childKey) {
        await convex.mutation(api.workers.updateStatus, {
          id: workerId,
          status: "failed",
        });
        await convex.mutation(api.tasks.fail, {
          id: taskId as Id<"tasks">,
          error: "Worker spawn failed: missing childSessionKey",
        });

        return NextResponse.json(
          { error: "Failed to spawn worker session (no child session key)" },
          { status: 503 }
        );
      }

      // Store the child session key on the worker for tracking and mark active
      await convex.mutation(api.workers.updateStatus, {
        id: workerId,
        status: "active",
        sessionKey: childKey,
      });
      console.log(`[Dispatch] Agent spawned: ${childKey}`);

      return NextResponse.json({
        success: true,
        workerId,
        workerTemplate: template.displayName,
        sessionKey: childKey,
      });
    } catch (err) {
      console.error("[Dispatch] Failed to spawn agent:", err);
      await convex.mutation(api.workers.updateStatus, {
        id: workerId,
        status: "failed",
      });
      await convex.mutation(api.tasks.fail, {
        id: taskId as Id<"tasks">,
        error: `Worker spawn exception: ${err instanceof Error ? err.message : "unknown"}`,
      });

      return NextResponse.json(
        { error: "Worker spawn exception" },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("[Dispatch] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
