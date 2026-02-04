import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * POST /api/webhooks/agent-event
 * 
 * Webhook for OpenClaw hooks to report agent lifecycle events.
 * Called by the bullpen-sync hook on command:new, command:reset, etc.
 * 
 * Body:
 * {
 *   type: "command" | "agent" | "gateway",
 *   action: "new" | "reset" | "stop" | "bootstrap" | "startup",
 *   sessionKey: string,
 *   timestamp: string (ISO),
 *   context?: {
 *     workspaceDir?: string,
 *     commandSource?: string,
 *     senderId?: string,
 *   }
 * }
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

    // Try to find agent by sessionKey
    let agentId: string | undefined;
    if (sessionKey) {
      const agents = await convex.query(api.agents.list);
      const agent = agents.find((a) => a.sessionKey === sessionKey);
      agentId = agent?._id;

      // Update agent lastSeen if found
      if (agent) {
        await convex.mutation(api.agents.updateStatus, {
          id: agent._id,
          status: action === "stop" ? "offline" : "online",
        });
      }
    }

    // Determine event type for logging
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

    // Log event
    await convex.mutation(api.events.create, {
      agentId,
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
      agentId: agentId || null,
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

// GET for health check / discovery
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/webhooks/agent-event",
    method: "POST",
    description: "Receive agent lifecycle events from OpenClaw hooks",
    body: {
      type: "'command' | 'agent' | 'gateway' (required)",
      action: "'new' | 'reset' | 'stop' | 'bootstrap' | 'startup' (required)",
      sessionKey: "string (optional)",
      timestamp: "ISO string (optional)",
      context: {
        workspaceDir: "string (optional)",
        commandSource: "string (optional)",
        senderId: "string (optional)",
      },
    },
  });
}
