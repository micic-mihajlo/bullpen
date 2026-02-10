import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/webhooks/agent-event
 *
 * Webhook for OpenClaw hooks to report agent lifecycle events.
 * Disabled during demo to prevent convex writes that cause re-renders.
 */
export async function POST(request: NextRequest) {
  // consume the body to avoid connection issues
  await request.json().catch(() => {});
  return NextResponse.json({ success: true, skipped: true, reason: "agent events disabled for stability" });
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/webhooks/agent-event",
    status: "disabled",
  });
}
