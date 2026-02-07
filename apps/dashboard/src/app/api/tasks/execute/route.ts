import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const OPENCLAW_HTTP_BASE =
  process.env.OPENCLAW_GATEWAY_URL?.replace(/^ws/, "http") || "http://localhost:18789";
const OPENCLAW_BEARER_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

// POST /api/tasks/execute - Send a task to an assigned OpenClaw session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, agentId, description, projectContext } = body ?? {};

    if (!taskId || typeof taskId !== "string") {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    }

    if (!agentId || typeof agentId !== "string") {
      return NextResponse.json({ error: "agentId is required" }, { status: 400 });
    }

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "description is required" },
        { status: 400 }
      );
    }

    const agent = await convex.query(api.agents.get, {
      id: agentId as Id<"agents">,
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (!agent.sessionKey) {
      return NextResponse.json(
        { error: "Assigned agent does not have a sessionKey" },
        { status: 400 }
      );
    }

    const message = [
      `Task ID: ${taskId}`,
      "",
      "Description:",
      description,
      ...(projectContext
        ? [
            "",
            "Project Context:",
            typeof projectContext === "string"
              ? projectContext
              : JSON.stringify(projectContext, null, 2),
          ]
        : []),
    ].join("\n");

    const sendResponse = await fetch(
      `${OPENCLAW_HTTP_BASE}/api/sessions/${encodeURIComponent(agent.sessionKey)}/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENCLAW_BEARER_TOKEN}`,
        },
        body: JSON.stringify({ message }),
      }
    );

    if (!sendResponse.ok) {
      const responseBody = await sendResponse.text();
      console.error("[API] OpenClaw send failed:", sendResponse.status, responseBody);
      return NextResponse.json(
        {
          error: "Failed to send task to OpenClaw session",
          details: responseBody || `HTTP ${sendResponse.status}`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, sessionKey: agent.sessionKey });
  } catch (error) {
    console.error("[API] Failed to execute task:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
