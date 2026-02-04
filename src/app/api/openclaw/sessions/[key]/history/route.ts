import { NextRequest, NextResponse } from "next/server";
import { getOpenClawClient } from "@/lib/openclaw";

// GET /api/openclaw/sessions/[key]/history - Get session message history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const client = getOpenClawClient();

    if (!client.isConnected()) {
      try {
        await client.connect();
      } catch (error) {
        console.error("[API] Failed to connect to OpenClaw:", error);
        return NextResponse.json(
          { error: "Failed to connect to OpenClaw Gateway", messages: [] },
          { status: 503 }
        );
      }
    }

    const messages = await client.getSessionHistory(key);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("[API] Failed to get session history:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        messages: [],
      },
      { status: 500 }
    );
  }
}
