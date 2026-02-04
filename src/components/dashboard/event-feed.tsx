"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatTimestamp } from "@/lib/utils";
import { cn } from "@/lib/utils";

const eventTypeConfig: Record<string, { icon: string; color: string }> = {
  agent_created: { icon: "✦", color: "text-cyan-400" },
  agent_removed: { icon: "✕", color: "text-zinc-400" },
  status_change: { icon: "◉", color: "text-zinc-400" },
  task_created: { icon: "+", color: "text-cyan-400" },
  task_assigned: { icon: "→", color: "text-amber-400" },
  task_started: { icon: "▶", color: "text-amber-400" },
  task_completed: { icon: "✓", color: "text-emerald-400" },
  task_failed: { icon: "!", color: "text-red-400" },
  message_sent: { icon: "◇", color: "text-purple-400" },
  heartbeat: { icon: "♥", color: "text-pink-400" },
  error: { icon: "⚠", color: "text-red-400" },
};

export function EventFeed() {
  const events = useQuery(api.events.recent, { limit: 30 });

  return (
    <Card className="h-full flex flex-col" glow="cyan">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
            </span>
            Live Feed
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
        {!events ? (
          <div className="p-5">
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-zinc-800/30 rounded animate-pulse" />
              ))}
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="p-5 text-center text-zinc-500 text-sm">
            No events yet
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/30">
            {events.map((event, index) => {
              const config = eventTypeConfig[event.type] || {
                icon: "•",
                color: "text-zinc-400",
              };

              return (
                <div
                  key={event._id}
                  className={cn(
                    "px-5 py-3 hover:bg-zinc-800/20 transition-colors",
                    "animate-slide-up"
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex-shrink-0 w-5 h-5 flex items-center justify-center",
                        "font-mono text-sm",
                        config.color
                      )}
                    >
                      {config.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-300 break-words">
                        {event.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-zinc-600 font-mono">
                          {formatTimestamp(event.timestamp)}
                        </span>
                        {event.agent && (
                          <>
                            <span className="text-zinc-700">•</span>
                            <span className="text-xs text-zinc-500">
                              {event.agent.avatar || "🤖"} {event.agent.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
