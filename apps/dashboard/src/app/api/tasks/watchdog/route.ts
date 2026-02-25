import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// POST /api/tasks/watchdog
// Fails stale running tasks that have no worker activity/progress heartbeat.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const staleMinutes = Math.max(1, Math.min(120, Number(body?.staleMinutes ?? 8)));
    const now = Date.now();
    const staleMs = staleMinutes * 60_000;

    const tasks = await convex.query(api.tasks.list, {});
    const running = tasks.filter((t) => t.status === "running");

    const failed: Array<{ id: string; title: string; reason: string }> = [];

    for (const task of running) {
      const workers = await convex.query(api.workers.getByTask, {
        taskId: task._id as Id<"tasks">,
      });

      const worker = workers[0];
      const step = task.steps?.[(task.currentStep ?? 0) as number];
      const lastSignal = Math.max(
        task.startedAt ?? 0,
        step?.startedAt ?? 0,
        step?.completedAt ?? 0,
        worker?.lastActivityAt ?? 0
      );

      if (now - lastSignal > staleMs) {
        const reason = `Watchdog timeout: no progress heartbeat for ${staleMinutes}m`;
        await convex.mutation(api.tasks.fail, {
          id: task._id as Id<"tasks">,
          error: reason,
        });
        failed.push({ id: task._id, title: task.title, reason });
      }
    }

    return NextResponse.json({
      success: true,
      staleMinutes,
      scanned: running.length,
      failed,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/tasks/watchdog",
    method: "POST",
    body: {
      staleMinutes: "number (optional, default 8, range 1-120)",
    },
  });
}
