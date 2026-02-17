import type { HookHandler } from "openclaw/hooks";

const BULLPEN_URL = process.env.BULLPEN_WEBHOOK_URL || "http://localhost:3001";

// Throttle configuration
const THROTTLE_MS = parseInt(process.env.BULLPEN_THROTTLE_MS || "1000", 10); // 1 second default
const BATCH_SIZE = parseInt(process.env.BULLPEN_BATCH_SIZE || "10", 10);

// In-memory throttle state
let lastSentAt = 0;
let eventBuffer: Array<{
  type: string;
  action: string;
  sessionKey: string;
  timestamp: string;
  context: Record<string, unknown>;
}> = [];

async function flushBuffer(): Promise<void> {
  if (eventBuffer.length === 0) return;

  const batch = eventBuffer.splice(0, BATCH_SIZE);
  
  try {
    const res = await fetch(`${BULLPEN_URL}/api/webhooks/agent-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batch: batch }),
    });

    if (!res.ok) {
      console.error(`[bullpen-sync] Failed to send batch (${batch.length}): ${res.status}`);
    } else {
      console.log(`[bullpen-sync] Sent batch of ${batch.length} events`);
    }
  } catch (err) {
    console.error(`[bullpen-sync] Network error:`, err);
    // Re-add failed events to buffer (at the front)
    eventBuffer.unshift(...batch);
  }
}

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

  const now = Date.now();
  const timeSinceLastSend = now - lastSentAt;

  if (timeSinceLastSend < THROTTLE_MS) {
    // Throttle: add to buffer instead of sending immediately
    eventBuffer.push(payload);
    
    // Limit buffer size to prevent memory issues
    if (eventBuffer.length > BATCH_SIZE * 10) {
      console.warn(`[bullpen-sync] Buffer overflow (${eventBuffer.length}), dropping oldest`);
      eventBuffer = eventBuffer.slice(-BATCH_SIZE * 5);
    }
    
    // Schedule flush after throttle period
    setTimeout(flushBuffer, THROTTLE_MS - timeSinceLastSend);
    return;
  }

  // Send immediately if not throttled
  lastSentAt = now;
  
  // If there's a buffer, flush it first
  if (eventBuffer.length > 0) {
    await flushBuffer();
  }

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
    console.error(`[bullpen-sync] Network error:`, err);
  }
};

// Handle graceful shutdown - flush any pending events
process.on("beforeExit", async () => {
  if (eventBuffer.length > 0) {
    console.log(`[bullpen-sync] Flushing ${eventBuffer.length} events on shutdown`);
    await flushBuffer();
  }
});

export default handler;
