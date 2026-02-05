import { NextResponse } from "next/server";
import { getOpenClawClient } from "@/lib/openclaw";

/**
 * GET /api/status
 * Health check and status endpoint
 */
export async function GET() {
  const client = getOpenClawClient();
  let openclawConnected = false;

  try {
    if (!client.isConnected()) {
      await client.connect();
    }
    openclawConnected = client.isConnected();
  } catch {
    openclawConnected = false;
  }

  return NextResponse.json({
    status: "ok",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
    services: {
      convex: !!process.env.NEXT_PUBLIC_CONVEX_URL,
      openclaw: openclawConnected,
    },
    endpoints: {
      tasks: "/api/tasks",
      sessions: "/api/openclaw/sessions",
      webhooks: "/api/webhooks/task-result",
    },
  });
}
