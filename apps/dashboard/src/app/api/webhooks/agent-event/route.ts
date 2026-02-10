import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * POST /api/webhooks/agent-event
 *
 * Webhook for OpenClaw hooks to report agent lifecycle events.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, action, sessionKey, timestamp, context } = body;

    if (!type || !action) {
      return NextResponse.json(
        { error: "type and action are required" },
        { status: 400 }
      );
    }

    // Filter out ALL noisy agent lifecycle events during demo
    // These cause convex real-time re-renders which refresh the page
    return NextResponse.json({ success: true, skipped: true, reason: "agent events disabled for stability" });

    let eventType: string;
    let message: string;

    switch (key) {
      case "command:new":
        eventType = "session_new";
        message = `New session${sessionKey ? ` (${sessionKey})` : ""}`;
        break;
      case "command:reset":
        eventType = "session_reset";
        message = `Session reset${sessionKey ? ` (${sessionKey})` : ""}`;
        break;
      case "command:stop":
        eventType = "session_stop";
        message = `Session stopped${sessionKey ? ` (${sessionKey})` : ""}`;
        break;
      case "gateway:startup":
        eventType = "gateway_startup";
        message = "Gateway started";
        break;
      default:
        eventType = `${type}_${action}`;
        message = `${type}:${action}${sessionKey ? ` (${sessionKey})` : ""}`;
    }

    await convex.mutation(api.events.create, {
      type: eventType,
      message,
      data: {
        sessionKey,
        timestamp,
        commandSource: context?.commandSource,
        senderId: context?.senderId,
      },
    });

    return NextResponse.json({
      success: true,
      eventType,
      message: `Event logged: ${message}`,
    });
  } catch (error) {
    console.error("[Webhook] Failed to process agent event:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/webhooks/agent-event",
    method: "POST",
    description: "Receive agent lifecycle events from OpenClaw hooks",
  });
}
