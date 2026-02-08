import { NextResponse } from "next/server";

/**
 * POST /api/agents/sync
 *
 * Legacy endpoint — agents table has been replaced by workerTemplates.
 * Kept for backward compat, returns a no-op response.
 */
export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Agent sync is deprecated — workers are now managed via workerTemplates",
  });
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/agents/sync",
    method: "POST",
    description: "Deprecated — use workerTemplates instead",
  });
}
