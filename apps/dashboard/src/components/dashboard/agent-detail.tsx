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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-mc-bg-secondary border border-mc-border rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="terminal-header">
          <div className="terminal-header-text flex items-center gap-3 flex-1">
            <span className="text-2xl">{agent.avatar || "🤖"}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-[#ddd]">{agent.name}</span>
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  agent.status === "online" ? "bg-mc-accent-green" :
                  agent.status === "busy" ? "bg-mc-accent-yellow" : "bg-[#555]"
                )} />
              </div>
              <div className="text-[10px] text-[#888] font-mono-jb uppercase tracking-wider">
                {role || "Agent"}
                {agent.model && ` · ${agent.model.includes("cerebras") ? "⚡ Cerebras" : agent.model.split("/")[1]}`}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded ml-auto transition-colors">
            <X className="w-5 h-5 text-[#666]" />
          </button>
        </div>

        {/* Session Info */}
        {agent.sessionKey ? (
          <>
            <div className="px-3 py-2 border-b border-mc-border bg-mc-bg-tertiary/50 flex items-center justify-between">
              <div className="text-[10px] text-mc-muted font-mono-jb truncate">{agent.sessionKey}</div>
              <button
                onClick={fetchHistory}
                disabled={loading}
                className="p-1.5 hover:bg-mc-bg-tertiary rounded transition-colors"
              >
                <RefreshCw className={cn("w-3.5 h-3.5 text-mc-text-secondary", loading && "animate-spin")} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loading && messages.length === 0 ? (
                <div className="text-xs text-mc-text-secondary text-center py-8 font-mono-jb">Loading...</div>
              ) : messages.length === 0 ? (
                <div className="text-xs text-mc-text-secondary text-center py-8 font-mono-jb">No messages yet</div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-2.5 rounded text-sm",
                      msg.role === "user" ? "bg-mc-accent/10 ml-8 border border-mc-accent/20" : "bg-mc-bg-tertiary mr-8"
                    )}
                  >
                    <div className="text-[10px] text-mc-text-secondary mb-1 font-mono-jb uppercase tracking-wide">
                      {msg.role === "user" ? "User" : agent.name}
                      {msg.timestamp && ` · ${new Date(msg.timestamp).toLocaleTimeString()}`}
                    </div>
                    <div className="whitespace-pre-wrap text-mc-text text-sm">{msg.content}</div>
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
                className="flex-1 bg-mc-bg border border-mc-border rounded px-3 py-2 text-sm text-mc-text focus:outline-none focus:border-mc-accent"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-4 py-2 bg-mc-accent text-white rounded hover:bg-mc-accent-hover disabled:opacity-50 flex items-center gap-2 text-xs font-mono-jb uppercase tracking-wider"
              >
                <Send className="w-3.5 h-3.5" />
                {sending ? "..." : "Send"}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center text-mc-text-secondary">
              <div className="text-sm mb-2">No OpenClaw session linked</div>
              <div className="text-[10px] text-mc-muted font-mono-jb">Link a session to view history and send messages</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
