import { NextRequest, NextResponse } from "next/server";
import { getOpenClawClient } from "@/lib/openclaw";

// POST /api/openclaw/sessions/[key]/send - Send message to session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    const client = getOpenClawClient();

    if (!client.isConnected()) {
      try {
        await client.connect();
      } catch (error) {
        console.error("[API] Failed to connect to OpenClaw:", error);
        return NextResponse.json(
          { error: "Failed to connect to OpenClaw Gateway" },
          { status: 503 }
        );
      }
    }

    await client.sendMessage(key, message);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Failed to send message:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
