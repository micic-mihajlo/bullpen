import { NextResponse } from "next/server";
import { getOpenClawClient } from "@/lib/openclaw";

// GET /api/openclaw/sessions - List OpenClaw sessions
export async function GET() {
  try {
    const client = getOpenClawClient();

    if (!client.isConnected()) {
      try {
        await client.connect();
      } catch (error) {
        console.error("[API] Failed to connect to OpenClaw:", error);
        return NextResponse.json(
          { error: "Failed to connect to OpenClaw Gateway", sessions: [] },
          { status: 503 }
        );
      }
    }

    const sessions = await client.listSessions();
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("[API] Failed to list sessions:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        sessions: [],
      },
      { status: 500 }
    );
  }
}
