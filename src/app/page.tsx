"use client";

import { AgentList } from "@/components/dashboard/agent-list";
import { EventFeed } from "@/components/dashboard/event-feed";
import { TaskBoard } from "@/components/dashboard/task-board";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                <span className="text-zinc-950 font-bold text-sm">B</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-zinc-100">
                  Bullpen
                </h1>
                <p className="text-xs text-zinc-500 -mt-0.5">
                  Agent Orchestration
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs text-zinc-400 font-medium">
                  Connected
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="max-w-[1800px] mx-auto h-[calc(100vh-8rem)]">
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Left sidebar - Agents */}
            <div className="col-span-3 h-full">
              <AgentList />
            </div>

            {/* Center - Task Board */}
            <div className="col-span-6 h-full">
              <TaskBoard />
            </div>

            {/* Right sidebar - Event Feed */}
            <div className="col-span-3 h-full">
              <EventFeed />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
