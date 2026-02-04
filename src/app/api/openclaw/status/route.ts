import { NextResponse } from "next/server";
import { getOpenClawClient } from "@/lib/openclaw";

// GET /api/openclaw/status - Get gateway status
export async function GET() {
  try {
    const client = getOpenClawClient();

    if (!client.isConnected()) {
      try {
        await client.connect();
      } catch (error) {
        console.error("[API] Failed to connect to OpenClaw:", error);
        return NextResponse.json(
          { connected: false, error: "Failed to connect to OpenClaw Gateway" },
          { status: 503 }
        );
      }
    }

    const status = await client.getStatus();
    return NextResponse.json({ connected: true, status });
  } catch (error) {
    console.error("[API] Failed to get status:", error);
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
