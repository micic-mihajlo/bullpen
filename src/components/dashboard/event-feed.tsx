"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ChevronRight, Clock } from "lucide-react";

type FeedFilter = "all" | "tasks" | "agents";

const eventTypeConfig: Record<string, { icon: string; color: string; highlight?: boolean }> = {
  agent_created: { icon: "🎉", color: "text-mc-accent-cyan" },
  agent_removed: { icon: "👋", color: "text-mc-text-secondary" },
  status_change: { icon: "🔔", color: "text-mc-text-secondary" },
  task_created: { icon: "📋", color: "text-mc-accent-pink", highlight: true },
  task_assigned: { icon: "👤", color: "text-mc-accent-yellow" },
  task_started: { icon: "▶️", color: "text-mc-accent-yellow" },
  task_completed: { icon: "✅", color: "text-mc-accent-green", highlight: true },
  task_failed: { icon: "❌", color: "text-mc-accent-red", highlight: true },
  message_sent: { icon: "💬", color: "text-mc-accent" },
  heartbeat: { icon: "💓", color: "text-mc-accent-pink" },
  error: { icon: "⚠️", color: "text-mc-accent-red" },
};

export function EventFeed() {
  const events = useQuery(api.events.recent, { limit: 50 });
  const [filter, setFilter] = useState<FeedFilter>("all");

  const filteredEvents = events?.filter((event) => {
    if (filter === "all") return true;
    if (filter === "tasks") {
      return ["task_created", "task_assigned", "task_started", "task_completed", "task_failed"].includes(event.type);
    }
    if (filter === "agents") {
      return ["agent_created", "agent_removed", "status_change", "message_sent", "heartbeat"].includes(event.type);
    }
    return true;
  });

  return (
    <aside className="h-full bg-mc-bg-secondary border border-mc-border rounded-xl flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-mc-border">
        <div className="flex items-center gap-2 mb-3">
          <ChevronRight className="w-4 h-4 text-mc-text-secondary" />
          <span className="text-sm font-medium uppercase tracking-wider">Live Feed</span>
          <span className="relative flex h-2 w-2 ml-1">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mc-accent-green opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-mc-accent-green" />
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1">
          {(["all", "tasks", "agents"] as FeedFilter[]).map((tab) => (
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

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {!events ? (
          <div className="space-y-2 p-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-mc-bg-tertiary/50 rounded animate-pulse" />
            ))}
          </div>
        ) : filteredEvents?.length === 0 ? (
          <div className="text-center py-8 text-mc-text-secondary text-sm">
            No events yet
          </div>
        ) : (
          filteredEvents?.map((event) => {
            const config = eventTypeConfig[event.type] || { icon: "📌", color: "text-mc-text-secondary" };

            return (
              <div
                key={event._id}
                className={cn(
                  "p-2 rounded border-l-2 animate-slide-in",
                  config.highlight
                    ? "bg-mc-bg-tertiary border-mc-accent-pink"
                    : "bg-transparent border-transparent hover:bg-mc-bg-tertiary"
                )}
              >
                <div className="flex items-start gap-2">
                  <span className="text-sm flex-shrink-0">{config.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm break-words", config.highlight ? "text-mc-accent-pink" : "text-mc-text")}>
                      {event.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs text-mc-text-secondary">
                        <Clock className="w-3 h-3" />
                        {formatTime(event.timestamp)}
                      </div>
                      {event.agent && (
                        <>
                          <span className="text-mc-border">•</span>
                          <span className="text-xs text-mc-text-secondary">
                            {event.agent.avatar || "🤖"} {event.agent.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
