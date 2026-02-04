import type { HookHandler } from "openclaw/hooks";

const BULLPEN_URL = process.env.BULLPEN_WEBHOOK_URL || "http://localhost:3001";

const handler: HookHandler = async (event) => {
  const payload = {
    type: event.type,
    action: event.action,
    sessionKey: event.sessionKey,
    timestamp: event.timestamp.toISOString(),
    context: {
      workspaceDir: event.context?.workspaceDir,
      commandSource: event.context?.commandSource,
      senderId: event.context?.senderId,
    },
  };

  try {
    const res = await fetch(`${BULLPEN_URL}/api/webhooks/agent-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`[bullpen-sync] Failed to send event: ${res.status}`);
    }
  } catch (err) {
    // Don't crash on network errors - bullpen might be down
    console.error(`[bullpen-sync] Network error:`, err);
  }
};

export default handler;
