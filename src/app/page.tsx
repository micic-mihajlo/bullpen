"use client";

import { AgentList } from "@/components/dashboard/agent-list";
import { EventFeed } from "@/components/dashboard/event-feed";
import { TaskBoard } from "@/components/dashboard/task-board";

export default function Dashboard() {
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
          <div className="flex items-center gap-1.5 text-sm text-mc-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-mc-accent-green" />
            <span>connected</span>
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
