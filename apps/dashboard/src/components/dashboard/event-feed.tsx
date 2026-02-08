"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { useStableData } from "@/lib/hooks";

type FeedFilter = "all" | "tasks" | "agents";

const icons: Record<string, string> = {
  agent_created: "👤",
  agent_removed: "—",
  status_change: "•",
  task_created: "＋",
  task_assigned: "→",
  task_started: "▶",
  task_dispatched: "🚀",
  task_completed: "✓",
  task_failed: "✗",
  session_linked: "⚡",
  message_sent: "💬",
};

const taskTypes = ["task_created", "task_assigned", "task_started", "task_dispatched", "task_completed", "task_failed"];
const agentTypes = ["agent_created", "agent_removed", "status_change", "session_linked"];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export function EventFeed() {
  const events = useStableData(useQuery(api.events.recent, { limit: 50 }));
  const [filter, setFilter] = useState<FeedFilter>("all");

  const filtered = events?.filter((e) => {
    if (filter === "all") return true;
    if (filter === "tasks") return taskTypes.includes(e.type);
    return agentTypes.includes(e.type);
  });

  return (
    <div className="h-full flex flex-col bg-mc-bg-secondary border border-mc-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-2.5 border-b border-mc-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-mc-text-secondary uppercase tracking-wider font-mono-jb">
            Activity
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-mc-accent-green animate-pulse" />
        </div>
        <div className="flex gap-0.5">
          {(["all", "tasks", "agents"] as FeedFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "px-2 py-1 text-[10px] rounded transition-colors font-mono-jb capitalize",
                filter === tab
                  ? "bg-mc-accent/10 text-mc-accent border border-mc-accent/30 font-medium"
                  : "text-mc-text-secondary hover:text-mc-text hover:bg-mc-bg-tertiary"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Events */}
      <div className="flex-1 overflow-y-auto">
        {!events ? (
          <div className="p-3 text-[10px] text-mc-text-secondary font-mono-jb">Loading...</div>
        ) : filtered?.length === 0 ? (
          <div className="p-4 text-[10px] text-mc-text-secondary text-center font-mono-jb">No activity</div>
        ) : (
          <div className="divide-y divide-mc-border">
            {filtered?.map((event) => {
              const icon = icons[event.type] || "•";
              const isTask = taskTypes.includes(event.type);
              const isComplete = event.type === "task_completed";
              const isFail = event.type === "task_failed";

              return (
                <div key={event._id} className="px-3 py-1.5 hover:bg-mc-bg-tertiary/50 transition-colors">
                  <div className="flex items-start gap-2">
                    <span className={cn(
                      "w-5 text-center flex-shrink-0 text-sm",
                      isComplete ? "text-mc-accent-green" :
                      isFail ? "text-mc-accent-red" :
                      isTask ? "text-mc-accent-yellow" : "text-mc-text-secondary"
                    )}>
                      {icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-mc-text leading-snug break-words">
                        {event.message}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-mc-muted font-mono-jb">
                        <span>{timeAgo(event.timestamp)}</span>
                        {event.agent && (
                          <>
                            <span>·</span>
                            <span>{event.agent.name}</span>
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
      </div>
    </div>
  );
}
