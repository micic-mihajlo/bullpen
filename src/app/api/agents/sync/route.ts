import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { getOpenClawClient } from "@/lib/openclaw";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * POST /api/agents/sync
 * 
 * Syncs agent statuses from OpenClaw sessions.
 * Agents with matching sessionKeys are marked online/busy,
 * others are marked offline.
 */
export async function POST() {
  try {
    const client = getOpenClawClient();

    // Connect if not connected
    if (!client.isConnected()) {
      try {
        await client.connect();
      } catch (error) {
        console.error("[Sync] Failed to connect to OpenClaw:", error);
        return NextResponse.json(
          { error: "Failed to connect to OpenClaw Gateway" },
          { status: 503 }
        );
      }
    }

    // Get OpenClaw sessions
    const sessions = await client.listSessions();
    const activeSessionKeys = new Set(sessions.map((s) => s.key));

    // Get all agents from Convex
    const agents = await convex.query(api.agents.list);
    
    // Track updates
    const updates: { name: string; status: string; wasStatus: string }[] = [];

    // Update each agent's status based on session presence
    for (const agent of agents) {
      const isActive = agent.sessionKey && activeSessionKeys.has(agent.sessionKey);
      const newStatus = isActive ? "online" : "offline";
      
      if (agent.status !== newStatus) {
        await convex.mutation(api.agents.updateStatus, {
          id: agent._id,
          status: newStatus as "online" | "offline" | "busy",
        });
        updates.push({
          name: agent.name,
          status: newStatus,
          wasStatus: agent.status,
        });
      }
    }

    return NextResponse.json({
      success: true,
      sessionCount: sessions.length,
      agentCount: agents.length,
      updates,
      message: updates.length > 0 
        ? `Synced ${updates.length} agent(s)` 
        : "All agents already in sync",
    });
  } catch (error) {
    console.error("[Sync] Failed to sync agents:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// GET for health check
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/agents/sync",
    method: "POST",
    description: "Sync agent statuses from OpenClaw sessions",
  });
}
