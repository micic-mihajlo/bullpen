import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// POST /api/tasks/[id]/complete - Mark task as complete with result
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskId = id as Id<"tasks">;
    const body = await request.json();
    const { result, error } = body;

    // Get the task
    const task = await convex.query(api.tasks.get, { id: taskId });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (error) {
      // Mark as failed
      await convex.mutation(api.tasks.fail, { id: taskId, error });
      return NextResponse.json({ success: true, status: "failed" });
    }

    // Mark as complete
    await convex.mutation(api.tasks.complete, { 
      id: taskId, 
      result: result || "Completed" 
    });

    return NextResponse.json({ success: true, status: "completed" });
  } catch (error) {
    console.error("[API] Failed to complete task:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
