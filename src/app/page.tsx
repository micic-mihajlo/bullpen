"use client";

import { useQuery } from "convex/react";
import { useState, useCallback } from "react";
import { api } from "../../convex/_generated/api";
import { AgentList } from "@/components/dashboard/agent-list";
import { EventFeed } from "@/components/dashboard/event-feed";
import { TaskBoard } from "@/components/dashboard/task-board";
import { useShortcuts, useRegisterShortcut } from "@/components/shortcuts-provider";
import { useToast } from "@/components/toast";
import { Keyboard, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const agents = useQuery(api.agents.list);
  const tasks = useQuery(api.tasks.list);

  const { setShowHelp } = useShortcuts();
  const { addToast } = useToast();
  const [syncing, setSyncing] = useState(false);

  const handleSync = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const res = await fetch("/api/agents/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message || "Synced", "success");
      } else {
        addToast(data.error || "Sync failed", "error");
      }
    } catch {
      addToast("Network error", "error");
    } finally {
      setSyncing(false);
    }
  }, [syncing, addToast]);

  // Register refresh shortcut
  useRegisterShortcut("refresh", handleSync);
  
  const stats = {
    agents: agents?.length ?? 0,
    online: agents?.filter((a) => a.status === "online" || a.status === "busy").length ?? 0,
    tasks: tasks?.length ?? 0,
    running: tasks?.filter((t) => t.status === "running").length ?? 0,
    completed: tasks?.filter((t) => t.status === "completed").length ?? 0,
  };
  return (
    <div className="h-screen flex flex-col bg-mc-bg overflow-hidden">
      {/* Header - minimal */}
      <header className="flex-shrink-0 border-b border-mc-border bg-mc-bg-secondary/50">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐂</span>
            <span className="font-semibold tracking-tight">bullpen</span>
            <span className="text-mc-text-secondary text-sm">/ orchestration</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-mc-text-secondary">
            <span title="Active agents">{stats.online}/{stats.agents} agents</span>
            <span title="Running tasks">⚡ {stats.running} running</span>
            <span title="Completed tasks">✓ {stats.completed} done</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="p-1 text-mc-text-secondary hover:text-mc-text rounded hover:bg-mc-bg-tertiary transition-colors disabled:opacity-50"
              title="Sync agents (R)"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setShowHelp(true)}
              className="p-1 text-mc-text-secondary hover:text-mc-text rounded hover:bg-mc-bg-tertiary transition-colors"
              title="Keyboard shortcuts (?)"
            >
              <Keyboard className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 text-sm text-mc-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-mc-accent-green" />
              <span>connected</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex min-h-0">
        {/* Left - Agents */}
        <div className="w-72 flex-shrink-0 p-4 min-h-0">
          <AgentList />
        </div>

        {/* Center - Tasks */}
        <div className="flex-1 p-4 pl-0 min-h-0">
          <TaskBoard />
        </div>

        {/* Right - Feed */}
        <div className="w-80 flex-shrink-0 p-4 pl-0 min-h-0">
          <EventFeed />
        </div>
      </main>
    </div>
  );
}
