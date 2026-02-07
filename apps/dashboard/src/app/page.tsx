"use client";

import { useQuery } from "convex/react";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { useShortcuts, useRegisterShortcut } from "@/components/shortcuts-provider";
import { useToast } from "@/components/toast";
import { useStableData } from "@/lib/hooks";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { SkeletonStats, SkeletonList } from "@/components/ui/skeleton";
import { formatTime } from "@/lib/utils";
import {
  FolderKanban,
  CheckSquare,
  Bot,
  FileCheck2,
  Plus,
  Keyboard,
  Zap,
  ArrowRight,
} from "lucide-react";

const eventIcons: Record<string, string> = {
  task_created: "+",
  task_assigned: "→",
  task_started: "▶",
  task_dispatched: "🚀",
  task_completed: "✓",
  task_failed: "✗",
  agent_created: "👤",
  status_change: "•",
  session_linked: "⚡",
  project_created: "📁",
  project_status_changed: "📋",
  deliverable_created: "📄",
  deliverable_submitted: "📤",
  deliverable_approved: "✅",
  deliverable_rejected: "❌",
  client_created: "👥",
};

export default function OverviewPage() {
  const router = useRouter();
  const agents = useStableData(useQuery(api.agents.list));
  const tasks = useStableData(useQuery(api.tasks.list));
  const projects = useStableData(useQuery(api.projects.list));
  const pendingReview = useStableData(useQuery(api.deliverables.pendingReview));
  const events = useStableData(useQuery(api.events.recent, { limit: 10 }));

  const { setShowHelp } = useShortcuts();
  const { addToast } = useToast();

  const handleSync = useCallback(async () => {
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
    }
  }, [addToast]);

  useRegisterShortcut("refresh", handleSync);

  const stats = {
    activeProjects: projects?.filter((p) => p.status === "active" || p.status === "review").length ?? 0,
    pendingTasks: tasks?.filter((t) => t.status === "pending" || t.status === "assigned").length ?? 0,
    runningTasks: tasks?.filter((t) => t.status === "running").length ?? 0,
    agentsOnline: agents?.filter((a) => a.status === "online" || a.status === "busy").length ?? 0,
    reviewQueue: pendingReview?.length ?? 0,
  };

  const activeProjects = projects?.filter((p) => p.status === "active" || p.status === "review") ?? [];

  const isLoading = !agents || !tasks || !projects || !pendingReview;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-[#e8e5de] bg-white/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1a1a1a]" style={{ fontFamily: 'Inter, sans-serif' }}>Overview</h1>
            <p className="text-[12px] text-[#9c9590] mt-0.5">Dashboard overview</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHelp(true)}
              className="p-1.5 text-[#9c9590] hover:text-[#1a1a1a] rounded-lg hover:bg-[#f0ede6] transition-colors"
              title="Keyboard shortcuts (?)"
            >
              <Keyboard className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 text-xs text-[#6b6560]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Connected
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats row */}
        {isLoading ? (
          <SkeletonStats />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Active Projects"
              value={stats.activeProjects}
              icon={<FolderKanban className="w-4 h-4" />}
              accent="blue"
            />
            <StatCard
              label="Pending Tasks"
              value={stats.pendingTasks + stats.runningTasks}
              icon={<CheckSquare className="w-4 h-4" />}
              accent="yellow"
            />
            <StatCard
              label="Agents Online"
              value={stats.agentsOnline}
              icon={<Bot className="w-4 h-4" />}
              accent="green"
            />
            <StatCard
              label="Pending Review"
              value={stats.reviewQueue}
              icon={<FileCheck2 className="w-4 h-4" />}
              accent={stats.reviewQueue > 0 ? "red" : "purple"}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Active Projects */}
          <div className="lg:col-span-2 bg-white border border-[#e8e5de] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0ede6]">
              <span className="text-[13px] font-semibold text-[#1a1a1a]">Active Projects</span>
              <button
                onClick={() => router.push("/projects")}
                className="text-xs text-[#c2410c] hover:text-[#9a3412] transition-colors flex items-center gap-1 font-medium"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-[#f0ede6]">
              {!projects ? (
                <SkeletonList count={3} />
              ) : activeProjects.length === 0 ? (
                <EmptyState
                  icon={<FolderKanban className="w-8 h-8" />}
                  title="No active projects"
                  description="Create a project to start tracking work"
                  action={{ label: "New Project", onClick: () => router.push("/projects") }}
                />
              ) : (
                activeProjects.slice(0, 5).map((project) => (
                  <div
                    key={project._id}
                    onClick={() => router.push("/projects")}
                    className="px-4 py-3 hover:bg-[#faf9f6] transition-colors cursor-pointer flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate text-[#1a1a1a]">{project.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          project.status === "active"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="text-xs text-[#6b6560] mt-0.5">
                        {project.client?.name ?? "Unknown client"}
                        {project.deadline && ` · Due ${new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                      </div>
                    </div>
                    <span className="text-[11px] text-[#9c9590] font-mono-jb">{project.type}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="bg-white border border-[#e8e5de] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#f0ede6]">
                <span className="text-[13px] font-semibold text-[#1a1a1a]">Quick Actions</span>
              </div>
              <div className="p-2 space-y-0.5">
                <button
                  onClick={() => router.push("/projects")}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#6b6560] hover:text-[#1a1a1a] hover:bg-[#faf9f6] rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Project</span>
                  <kbd className="ml-auto text-[10px] text-[#9c9590] font-mono-jb bg-[#f5f3ee] px-1.5 py-0.5 rounded">P</kbd>
                </button>
                <button
                  onClick={() => router.push("/tasks")}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#6b6560] hover:text-[#1a1a1a] hover:bg-[#faf9f6] rounded-lg transition-colors"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>New Task</span>
                  <kbd className="ml-auto text-[10px] text-[#9c9590] font-mono-jb bg-[#f5f3ee] px-1.5 py-0.5 rounded">N</kbd>
                </button>
                <button
                  onClick={() => router.push("/agents")}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#6b6560] hover:text-[#1a1a1a] hover:bg-[#faf9f6] rounded-lg transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  <span>Dispatch Agent</span>
                  <kbd className="ml-auto text-[10px] text-[#9c9590] font-mono-jb bg-[#f5f3ee] px-1.5 py-0.5 rounded">A</kbd>
                </button>
                {stats.reviewQueue > 0 && (
                  <button
                    onClick={() => router.push("/review")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#c2410c] hover:bg-[#c2410c]/5 rounded-lg transition-colors font-medium"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>{stats.reviewQueue} awaiting review</span>
                    <ArrowRight className="ml-auto w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-[#e8e5de] rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0ede6]">
                <span className="text-[13px] font-semibold text-[#1a1a1a]">Recent Activity</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </div>
              <div className="divide-y divide-[#f0ede6] max-h-[300px] overflow-y-auto">
                {!events ? (
                  <SkeletonList count={5} />
                ) : events.length === 0 ? (
                  <div className="p-4 text-xs text-[#9c9590] text-center">No activity yet</div>
                ) : (
                  events.map((event) => (
                    <div key={event._id} className="px-3 py-2 hover:bg-[#faf9f6] transition-colors">
                      <div className="flex items-start gap-2">
                        <span className="w-5 text-center flex-shrink-0 text-xs mt-0.5">
                          {eventIcons[event.type] || "•"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#1a1a1a] leading-relaxed truncate">{event.message}</p>
                          <span className="text-[10px] text-[#9c9590] font-mono-jb">{formatTime(event.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
