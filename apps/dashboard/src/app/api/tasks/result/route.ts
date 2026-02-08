import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// POST /api/tasks/result - Receive task result with bearer auth
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

    if (!token || token !== process.env.OPENCLAW_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, result, status, error } = body ?? {};

    if (!taskId || typeof taskId !== "string") {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    }

    if (typeof result !== "string") {
      return NextResponse.json({ error: "result is required" }, { status: 400 });
    }

    if (status !== "completed" && status !== "failed") {
      return NextResponse.json(
        { error: "status must be 'completed' or 'failed'" },
        { status: 400 }
      );
    }

    if (error !== undefined && typeof error !== "string") {
      return NextResponse.json(
        { error: "error must be a string when provided" },
        { status: 400 }
      );
    }

    const response = await convex.mutation(api.taskExecution.receiveResult, {
      taskId: taskId as Id<"tasks">,
      result,
      status,
      error,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[API] Failed to receive task result:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
