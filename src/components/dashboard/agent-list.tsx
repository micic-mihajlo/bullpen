"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function AgentList() {
  const agents = useQuery(api.agents.list);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle>Agents</CardTitle>
          <span className="text-xs text-zinc-500 font-mono">
            {agents?.filter((a) => a.status === "online").length ?? 0} online
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
        {!agents ? (
          <div className="p-5">
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-zinc-800/30 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ) : agents.length === 0 ? (
          <div className="p-5 text-center text-zinc-500 text-sm">
            No agents yet
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {agents.map((agent, index) => (
              <div
                key={agent._id}
                className={cn(
                  "px-5 py-4 hover:bg-zinc-800/30 transition-colors cursor-pointer",
                  "animate-slide-up"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-lg">
                    {agent.avatar || "🤖"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-100 truncate">
                        {agent.name}
                      </span>
                      <StatusBadge status={agent.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                      <span className="font-mono">{formatTime(agent.lastSeen)}</span>
                      {agent.currentTaskId && (
                        <>
                          <span>•</span>
                          <span className="text-amber-500">working on task</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
