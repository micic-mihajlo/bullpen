"use client";

import { useState } from "react";
import { AgentList } from "@/components/dashboard/agent-list";
import { EventFeed } from "@/components/dashboard/event-feed";
import { SessionDetail } from "@/components/dashboard/session-detail";
import { Settings } from "lucide-react";

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

export default function Dashboard() {
  const [selectedSession, setSelectedSession] = useState<OpenClawSession | null>(null);
  return (
    <div className="min-h-screen flex flex-col bg-mc-bg">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-mc-border bg-mc-bg-secondary">
        <div className="max-w-[1920px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🐂</span>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Bullpen</h1>
                <p className="text-xs text-mc-text-secondary -mt-0.5">
                  Agent Orchestration
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-mc-bg-tertiary border border-mc-border">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mc-accent-green opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-mc-accent-green" />
                </span>
                <span className="text-xs text-mc-text-secondary font-medium">
                  Connected
                </span>
              </div>
              <button className="p-2 hover:bg-mc-bg-tertiary rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-mc-text-secondary" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content - full height layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Sessions */}
        <div className="w-72 flex-shrink-0 p-4 overflow-hidden">
          <AgentList 
            selectedKey={selectedSession?.key}
            onSelect={setSelectedSession}
          />
        </div>

        {/* Center - Session Detail */}
        <div className="flex-1 p-4 pl-0 overflow-hidden">
          <SessionDetail 
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
          />
        </div>

        {/* Right sidebar - Event Feed */}
        <div className="w-80 flex-shrink-0 p-4 pl-0 overflow-hidden">
          <EventFeed />
        </div>
      </main>
    </div>
  );
}
