"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, Send, RefreshCw } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { useToast } from "@/components/toast";

interface Agent {
  _id: Id<"agents">;
  name: string;
  avatar?: string;
  status: string;
  soul?: string;
  model?: string;
  sessionKey?: string;
}

interface Message {
  role: string;
  content: string;
  timestamp?: number;
}

interface AgentDetailProps {
  agent: Agent;
  onClose: () => void;
}

export function AgentDetail({ agent, onClose }: AgentDetailProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { addToast } = useToast();

  const fetchHistory = async () => {
    if (!agent.sessionKey) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/openclaw/sessions/${encodeURIComponent(agent.sessionKey)}/history`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent.sessionKey]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !agent.sessionKey) return;
    setSending(true);
    try {
      const res = await fetch(`/api/openclaw/sessions/${encodeURIComponent(agent.sessionKey)}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage.trim() }),
      });
      if (res.ok) {
        addToast("Message sent", "success");
        setNewMessage("");
        await fetchHistory();
      } else {
        const data = await res.json();
        addToast(data.error || "Failed to send", "error");
      }
    } catch (error) {
      addToast("Network error", "error");
    } finally {
      setSending(false);
    }
  };

  const role = agent.soul?.match(/Role:\s*(.+)/)?.[1];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-mc-bg-secondary border border-mc-border rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-mc-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{agent.avatar || "🤖"}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{agent.name}</span>
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  agent.status === "online" ? "bg-mc-accent-green" :
                  agent.status === "busy" ? "bg-mc-accent-yellow" : "bg-mc-border"
                )} />
              </div>
              <div className="text-sm text-mc-text-secondary">
                {role || "Agent"}
                {agent.model && ` · ${agent.model.includes("cerebras") ? "⚡ Cerebras" : "🧠 " + agent.model.split("/")[1]}`}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-mc-bg-tertiary rounded">
            <X className="w-5 h-5 text-mc-text-secondary" />
          </button>
        </div>

        {/* Session Info */}
        {agent.sessionKey ? (
          <>
            <div className="p-3 border-b border-mc-border bg-mc-bg/50 flex items-center justify-between">
              <div className="text-xs text-mc-text-secondary font-mono truncate">{agent.sessionKey}</div>
              <button
                onClick={fetchHistory}
                disabled={loading}
                className="p-1.5 hover:bg-mc-bg-tertiary rounded"
              >
                <RefreshCw className={cn("w-4 h-4 text-mc-text-secondary", loading && "animate-spin")} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading && messages.length === 0 ? (
                <div className="text-sm text-mc-text-secondary text-center py-8">Loading...</div>
              ) : messages.length === 0 ? (
                <div className="text-sm text-mc-text-secondary text-center py-8">No messages yet</div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-3 rounded text-sm",
                      msg.role === "user" ? "bg-mc-accent/10 ml-8" : "bg-mc-bg mr-8"
                    )}
                  >
                    <div className="text-xs text-mc-text-secondary mb-1">
                      {msg.role === "user" ? "User" : agent.name}
                      {msg.timestamp && ` · ${new Date(msg.timestamp).toLocaleTimeString()}`}
                    </div>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                ))
              )}
            </div>

            {/* Send Message */}
            <form onSubmit={handleSend} className="p-3 border-t border-mc-border flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Send a message..."
                className="flex-1 bg-mc-bg border border-mc-border rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-accent"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-4 py-2 bg-mc-accent text-white rounded hover:bg-mc-accent/90 disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {sending ? "..." : "Send"}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center text-mc-text-secondary">
              <div className="text-sm mb-2">No OpenClaw session linked</div>
              <div className="text-xs">Link a session to view history and send messages</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
