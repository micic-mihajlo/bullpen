"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Send, Clock, Zap, MessageCircle, X } from "lucide-react";

interface OpenClawSession {
  key: string;
  kind: string;
  displayName?: string;
  channel?: string;
  groupChannel?: string;
  chatType?: string;
  updatedAt: number;
  model?: string;
  modelProvider?: string;
  totalTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  contextTokens?: number;
}

interface Message {
  role: "user" | "assistant" | "system" | "toolResult" | "toolCall";
  content: string | Array<{ type: string; text?: string; thinking?: string }>;
  timestamp?: number;
}

// Extract text content from message
function getMessageText(msg: Message): string {
  if (typeof msg.content === "string") return msg.content;
  if (Array.isArray(msg.content)) {
    return msg.content
      .filter((c) => c.type === "text" && c.text)
      .map((c) => c.text)
      .join("\n") || "(no text content)";
  }
  return "(unknown format)";
}

interface SessionDetailProps {
  session: OpenClawSession | null;
  onClose?: () => void;
}

export function SessionDetail({ session, onClose }: SessionDetailProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const sessionKey = session?.key;

  useEffect(() => {
    if (!sessionKey) {
      setMessages([]);
      return;
    }

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/openclaw/sessions/${encodeURIComponent(sessionKey)}/history`);
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [sessionKey]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !session || sending) return;

    setSending(true);
    try {
      await fetch(`/api/openclaw/sessions/${encodeURIComponent(session.key)}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      setInput("");
      // Optimistically add to messages
      setMessages((prev) => [...prev, { role: "user", content: input }]);
    } catch (err) {
      console.error("Failed to send:", err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ts?: number) => {
    if (!ts) return "unknown";
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  const formatTokens = (tokens?: number) => {
    if (!tokens) return "0";
    if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
    if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
    return tokens.toString();
  };

  if (!session) {
    return (
      <div className="h-full bg-mc-bg-secondary border border-mc-border rounded-lg flex flex-col items-center justify-center text-mc-text-secondary">
        <MessageCircle className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">Select a session to view details</p>
      </div>
    );
  }

  const sessionName = session.groupChannel || session.displayName || session.key.split(":").pop();

  return (
    <div className="h-full bg-mc-bg-secondary border border-mc-border rounded-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-mc-border bg-mc-bg-secondary">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-lg tracking-wider text-mc-text uppercase">{sessionName}</h2>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-mc-bg-tertiary rounded transition-colors">
              <X className="w-4 h-4 text-mc-text-secondary" />
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-[10px] text-mc-text-secondary font-mono-jb">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(session.updatedAt)}
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {formatTokens(session.totalTokens)} tokens
          </span>
          {session.model && (
            <span className="px-1.5 py-0.5 bg-mc-bg-tertiary rounded text-[10px]">
              {session.model}
            </span>
          )}
          {session.channel && (
            <span className="px-1.5 py-0.5 bg-mc-accent/15 text-mc-accent rounded text-[10px]">
              {session.channel}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-mc-bg-tertiary/50 rounded animate-pulse" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-mc-text-secondary text-sm font-mono-jb">
            No messages yet
          </div>
        ) : (
          messages
            .filter((msg) => msg.role === "user" || msg.role === "assistant")
            .slice(-20)
            .map((msg, i) => {
              const text = getMessageText(msg);
              if (!text || text === "(no text content)") return null;

              return (
                <div
                  key={i}
                  className={cn(
                    "p-2.5 rounded text-sm",
                    msg.role === "user"
                      ? "bg-mc-accent/10 border border-mc-accent/20 ml-8"
                      : "bg-mc-bg-tertiary mr-8"
                  )}
                >
                  <div className="text-[10px] text-mc-text-secondary mb-1 uppercase font-mono-jb tracking-wide">
                    {msg.role}
                  </div>
                  <div className="whitespace-pre-wrap break-words text-mc-text">
                    {text.length > 500 ? text.slice(0, 500) + "..." : text}
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-mc-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Send a message..."
            disabled={sending}
            className={cn(
              "flex-1 bg-mc-bg border border-mc-border rounded px-3 py-2 text-sm text-mc-text",
              "focus:outline-none focus:border-mc-accent",
              "placeholder:text-mc-muted",
              "disabled:opacity-50"
            )}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="px-4 py-2 bg-mc-accent text-white rounded hover:bg-mc-accent-hover disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
