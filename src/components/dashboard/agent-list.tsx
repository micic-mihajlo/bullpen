"use client";

import { useState, useEffect, useCallback } from "react";
import { StatusBadge, StatusDot } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { ChevronRight, RefreshCw, Zap } from "lucide-react";

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
}

type FilterTab = "all" | "online" | "offline";

interface AgentListProps {
  selectedKey?: string | null;
  onSelect?: (session: OpenClawSession) => void;
}

export function AgentList({ selectedKey, onSelect }: AgentListProps) {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [sessions, setSessions] = useState<OpenClawSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setSessionsLoading(true);
      const res = await fetch("/api/openclaw/sessions");
      const data = await res.json();
      setSessions(data.sessions || []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  // Fetch sessions on mount and every 30 seconds
  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  // Filter sessions based on filter state
  const filteredSessions = sessions.filter((session) => {
    if (filter === "all") return true;
    // Consider sessions active if updated in last 5 minutes
    const isActive = Date.now() - session.updatedAt < 5 * 60 * 1000;
    if (filter === "online") return isActive;
    return !isActive;
  });

  // Get session display info
  const getSessionInfo = (session: OpenClawSession) => {
    const keyParts = session.key.split(":");
    const isDiscord = session.channel === "discord";
    const isCron = keyParts.includes("cron");
    const isHeartbeat = session.key.includes("main:main");

    let icon = "🤖";
    let name = session.displayName || session.key;
    
    if (isDiscord && session.groupChannel) {
      icon = "💬";
      name = session.groupChannel;
    } else if (isCron) {
      icon = "⏰";
      name = "Cron Job";
    } else if (isHeartbeat) {
      icon = "💓";
      name = "Heartbeat";
    }

    return { icon, name };
  };

  const formatTokens = (tokens?: number) => {
    if (!tokens) return null;
    if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
    if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`;
    return tokens.toString();
  };

  const activeSessionCount = sessions.filter((s) => Date.now() - s.updatedAt < 5 * 60 * 1000).length;

  return (
    <>
      <aside className="h-full bg-mc-bg-secondary border border-mc-border rounded-xl flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-mc-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-mc-text-secondary" />
              <span className="text-sm font-medium uppercase tracking-wider">Sessions</span>
              <span className="bg-mc-bg-tertiary text-mc-text-secondary text-xs px-2 py-0.5 rounded">
                {sessions.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {activeSessionCount > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-mc-accent-green">
                  <StatusDot status="online" />
                  {activeSessionCount} active
                </span>
              )}
              <button
                onClick={fetchSessions}
                disabled={sessionsLoading}
                className="p-1 hover:bg-mc-bg-tertiary rounded transition-colors"
                title="Refresh sessions"
              >
                <RefreshCw className={cn("w-3.5 h-3.5 text-mc-text-secondary", sessionsLoading && "animate-spin")} />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1">
            {(["all", "online", "offline"] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  "px-3 py-1 text-xs rounded uppercase transition-colors",
                  filter === tab
                    ? "bg-mc-accent text-mc-bg font-medium"
                    : "text-mc-text-secondary hover:bg-mc-bg-tertiary"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessionsLoading && sessions.length === 0 ? (
            <div className="space-y-2 p-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-mc-bg-tertiary/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-mc-text-secondary text-sm">
              No sessions found
            </div>
          ) : (
            filteredSessions.map((session) => {
              const { icon, name } = getSessionInfo(session);
              const isActive = Date.now() - session.updatedAt < 5 * 60 * 1000;
              const tokens = formatTokens(session.totalTokens);

              return (
                <div
                  key={session.key}
                  onClick={() => onSelect?.(session)}
                  className={cn(
                    "w-full rounded-lg hover:bg-mc-bg-tertiary transition-colors cursor-pointer",
                    "animate-slide-in",
                    selectedKey === session.key && "bg-mc-bg-tertiary ring-1 ring-mc-accent"
                  )}
                >
                  <div className="flex items-center gap-3 p-2">
                    {/* Icon */}
                    <div className="text-2xl relative flex-shrink-0">
                      {icon}
                      {isActive && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-mc-accent-green rounded-full border-2 border-mc-bg-secondary" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{name}</span>
                        {session.channel && (
                          <span className="text-xs px-1.5 py-0.5 bg-mc-bg-tertiary rounded text-mc-text-secondary">
                            {session.channel}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-mc-text-secondary">
                        <span className="truncate">{session.model || "unknown"}</span>
                        {tokens && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-0.5">
                              <Zap className="w-3 h-3" />
                              {tokens}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <StatusBadge status={isActive ? "online" : "offline"} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with last refresh time */}
        <div className="p-3 border-t border-mc-border">
          <div className="text-xs text-mc-text-secondary text-center">
            {lastRefresh ? (
              <>Last updated: {lastRefresh.toLocaleTimeString()}</>
            ) : (
              <>Loading sessions...</>
            )}
          </div>
        </div>
      </aside>

    </>
  );
}
