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

    let eventType: string;
    let message: string;

    switch (`${type}:${action}`) {
      case "command:new":
        eventType = "session_new";
        message = "Started new session";
        break;
      case "command:reset":
        eventType = "session_reset";
        message = "Reset session context";
        break;
      case "command:stop":
        eventType = "session_stop";
        message = "Stopped session";
        break;
      case "agent:bootstrap":
        eventType = "agent_bootstrap";
        message = "Agent bootstrapped";
        break;
      case "gateway:startup":
        eventType = "gateway_startup";
        message = "Gateway started";
        break;
      default:
        eventType = `${type}_${action}`;
        message = `${type}:${action}`;
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
