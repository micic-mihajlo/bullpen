import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Simple bearer token auth for API access
function authenticate(request: Request): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  const expected = process.env.BULLPEN_API_TOKEN;
  if (!expected) return false;
  return token === expected;
}

function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

// GET /api/tasks/pending — poll for pending tasks ready for dispatch
http.route({
  path: "/api/tasks/pending",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!authenticate(request)) return unauthorized();

    const tasks = await ctx.runQuery(api.tasks.pending);

    // Enrich with worker template info for dispatch decisions
    const enriched = await Promise.all(
      tasks.map(async (task) => {
        let workerTemplate = null;
        if (task.workerType) {
          // Find matching template by name
          workerTemplate = await ctx.runQuery(api.workerTemplates.byName, {
            name: task.workerType,
          });
        }
        return { ...task, workerTemplate };
      })
    );

    return new Response(JSON.stringify({ tasks: enriched }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// POST /api/tasks/:id/claim — claim a task for execution (pending → running)
http.route({
  path: "/api/tasks/claim",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!authenticate(request)) return unauthorized();

    const body = await request.json();
    const { taskId, sessionKey, workerTemplateId } = body;

    if (!taskId) {
      return new Response(JSON.stringify({ error: "taskId required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      // Create a worker record (spawn also links worker to task)
      let workerId = null;
      if (workerTemplateId) {
        workerId = await ctx.runMutation(api.workers.spawn, {
          templateId: workerTemplateId,
          taskId,
          sessionKey: sessionKey || "unknown",
          model: "claude-sonnet-4",
        });
      }

      // Dispatch the task (pending → running)
      await ctx.runMutation(api.taskExecution.dispatchTask, { taskId });

      return new Response(
        JSON.stringify({ success: true, taskId, workerId }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// POST /api/tasks/result — submit task result (running → completed/failed)
http.route({
  path: "/api/tasks/result",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!authenticate(request)) return unauthorized();

    const body = await request.json();
    const { taskId, result, status, error } = body;

    if (!taskId || !status) {
      return new Response(
        JSON.stringify({ error: "taskId and status required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      await ctx.runMutation(api.taskExecution.receiveResult, {
        taskId,
        result: result || "",
        status,
        error,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// POST /api/tasks/log — post execution log entry
http.route({
  path: "/api/tasks/log",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!authenticate(request)) return unauthorized();

    const body = await request.json();
    const { taskId, message, type } = body;

    if (!taskId || !message) {
      return new Response(
        JSON.stringify({ error: "taskId and message required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      await ctx.runMutation(api.taskExecution.postLog, {
        taskId,
        message,
        type,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: unknown) {
      const message_str = err instanceof Error ? err.message : String(err);
      return new Response(JSON.stringify({ error: message_str }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// POST /api/tasks/context — update live context
http.route({
  path: "/api/tasks/context",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!authenticate(request)) return unauthorized();

    const body = await request.json();
    const { taskId, liveContext } = body;

    if (!taskId || liveContext === undefined) {
      return new Response(
        JSON.stringify({ error: "taskId and liveContext required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      await ctx.runMutation(api.taskExecution.updateLiveContext, {
        taskId,
        liveContext,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

export default http;
