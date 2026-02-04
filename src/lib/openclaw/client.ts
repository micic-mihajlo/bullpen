/**
 * OpenClaw Gateway WebSocket Client
 * Connects to the OpenClaw gateway and provides RPC methods for session management.
 */

import { EventEmitter } from "events";

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "ws://127.0.0.1:18789";
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

export interface OpenClawSession {
  key: string;
  label?: string;
  channel?: string;
  peer?: string;
  model?: string;
  lastActivity?: number;
  messageCount?: number;
}

export interface OpenClawMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
}

type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
};

export class OpenClawClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private connected = false;
  private authenticated = false;
  private connecting: Promise<void> | null = null;
  private token: string;
  private url: string;

  constructor(url: string = GATEWAY_URL, token: string = GATEWAY_TOKEN) {
    super();
    this.url = url;
    this.token = token;
    // Prevent Node.js from throwing on unhandled 'error' events
    this.on("error", () => {});
  }

  async connect(): Promise<void> {
    if (this.connected && this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    if (this.connecting) {
      return this.connecting;
    }

    this.connecting = new Promise((resolve, reject) => {
      try {
        // Clean up existing connection
        if (this.ws) {
          this.ws.onclose = null;
          this.ws.onerror = null;
          this.ws.onmessage = null;
          this.ws.onopen = null;
          if (
            this.ws.readyState === WebSocket.OPEN ||
            this.ws.readyState === WebSocket.CONNECTING
          ) {
            this.ws.close();
          }
          this.ws = null;
        }

        // Connect with token in URL
        const wsUrl = new URL(this.url);
        if (this.token) {
          wsUrl.searchParams.set("token", this.token);
        }

        console.log("[OpenClaw] Connecting to gateway...");
        this.ws = new WebSocket(wsUrl.toString());

        const connectionTimeout = setTimeout(() => {
          if (!this.connected) {
            this.ws?.close();
            reject(new Error("Connection timeout"));
          }
        }, 10000);

        this.ws.onopen = () => {
          console.log("[OpenClaw] WebSocket opened, waiting for challenge...");
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          this.connected = false;
          this.authenticated = false;
          this.connecting = null;
          console.log(
            `[OpenClaw] Disconnected (code: ${event.code}, reason: "${event.reason}")`
          );
          this.emit("disconnected");
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error("[OpenClaw] WebSocket error:", error);
          this.emit("error", error);
          if (!this.connected) {
            this.connecting = null;
            reject(new Error("Failed to connect to OpenClaw Gateway"));
          }
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data as string);

            // Handle challenge-response authentication
            if (data.type === "event" && data.event === "connect.challenge") {
              console.log("[OpenClaw] Challenge received, authenticating...");
              const requestId = crypto.randomUUID();

              const response = {
                type: "req",
                id: requestId,
                method: "connect",
                params: {
                  minProtocol: 3,
                  maxProtocol: 3,
                  client: {
                    id: "gateway-client",
                    version: "1.0.0",
                    platform: "node",
                    mode: "backend",
                  },
                  auth: { token: this.token },
                },
              };

              this.pendingRequests.set(requestId, {
                resolve: () => {
                  clearTimeout(connectionTimeout);
                  this.connected = true;
                  this.authenticated = true;
                  this.connecting = null;
                  console.log("[OpenClaw] Authenticated successfully");
                  this.emit("connected");
                  resolve();
                },
                reject: (error: Error) => {
                  this.connecting = null;
                  this.ws?.close();
                  reject(new Error(`Authentication failed: ${error.message}`));
                },
              });

              this.ws!.send(JSON.stringify(response));
              return;
            }

            // Handle RPC responses
            this.handleMessage(data);
          } catch (err) {
            console.error("[OpenClaw] Failed to parse message:", err);
          }
        };
      } catch (err) {
        this.connecting = null;
        reject(err);
      }
    });

    return this.connecting;
  }

  private handleMessage(data: {
    type?: string;
    id?: string;
    ok?: boolean;
    payload?: unknown;
    error?: { message: string };
    method?: string;
    params?: unknown;
  }): void {
    // Handle ResponseFrame format
    if (data.type === "res" && data.id) {
      const pending = this.pendingRequests.get(data.id);
      if (pending) {
        this.pendingRequests.delete(data.id);
        if (data.ok === false && data.error) {
          pending.reject(new Error(data.error.message));
        } else {
          pending.resolve(data.payload);
        }
        return;
      }
    }

    // Handle events/notifications
    if (data.method) {
      this.emit("notification", data);
      this.emit(data.method, data.params);
    }
  }

  async call<T = unknown>(
    method: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    if (!this.ws || !this.connected || !this.authenticated) {
      throw new Error("Not connected to OpenClaw Gateway");
    }

    const id = crypto.randomUUID();
    const message = { type: "req", id, method, params };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request timeout: ${method}`));
        }
      }, 30000);

      this.ws!.send(JSON.stringify(message));
    });
  }

  // Session management methods
  async listSessions(): Promise<OpenClawSession[]> {
    const result = await this.call<{ sessions: OpenClawSession[] }>(
      "sessions.list"
    );
    return result.sessions || [];
  }

  async getSessionHistory(sessionKey: string): Promise<OpenClawMessage[]> {
    const result = await this.call<{ messages: OpenClawMessage[] }>("chat.history", {
      sessionKey,
      limit: 50,
    });
    return result.messages || [];
  }

  async sendMessage(sessionKey: string, message: string): Promise<void> {
    const idempotencyKey = crypto.randomUUID();
    await this.call("chat.send", { sessionKey, message, idempotencyKey });
  }

  async getStatus(): Promise<unknown> {
    return this.call("status");
  }

  // Spawn a background sub-agent session
  async spawnSession(params: {
    task: string;
    label?: string;
    model?: string;
    agentId?: string;
    timeoutSeconds?: number;
    runTimeoutSeconds?: number;
  }): Promise<{ sessionKey: string; runId?: string }> {
    return this.call("sessions.spawn", params);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.authenticated = false;
    this.connecting = null;
  }

  isConnected(): boolean {
    return (
      this.connected &&
      this.authenticated &&
      this.ws?.readyState === WebSocket.OPEN
    );
  }
}

// Singleton instance for server-side usage
let clientInstance: OpenClawClient | null = null;

export function getOpenClawClient(): OpenClawClient {
  if (!clientInstance) {
    clientInstance = new OpenClawClient();
  }
  return clientInstance;
}
