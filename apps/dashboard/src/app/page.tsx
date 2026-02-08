"use client";

import { useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useShortcuts, useRegisterShortcut } from "@/components/shortcuts-provider";
import { useToast } from "@/components/toast";
import { useStableData } from "@/lib/hooks";
import { SkeletonStats, SkeletonList } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { TaskDetailPanel } from "@/components/task-detail-panel";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Bot,
  Keyboard,
  AlertTriangle,
  Clock,
  Code2,
  Cog,
  Search,
  Palette,
  FileCheck2,
  FileText,
  Activity,
  CheckCircle2,
  BarChart3,
  TrendingUp,
} from "lucide-react";

const taskTypeIcons: Record<string, React.ReactNode> = {
  coding: <Code2 className="w-3 h-3" />,
  automation: <Cog className="w-3 h-3" />,
  research: <Search className="w-3 h-3" />,
  design: <Palette className="w-3 h-3" />,
  review: <FileCheck2 className="w-3 h-3" />,
  general: <FileText className="w-3 h-3" />,
};

const taskTypeMini: Record<string, (ctx?: Record<string, unknown>) => string> = {
  coding: (ctx) => ctx?.filesChanged ? `${ctx.filesChanged} files changed` : "coding",
  automation: (ctx) => ctx?.nodeCount ? `${ctx.nodeCount}-node pipeline` : "automation",
  research: (ctx) => ctx?.sourcesFound ? `${ctx.sourcesFound} sources found` : "research",
  design: (ctx) => ctx?.revisionCount ? `${ctx.revisionCount} revisions` : "design",
  review: () => "review",
  general: () => "general",
};

const eventIcons: Record<string, string> = {
  task_created: "+",
  task_assigned: "\u2192",
  task_started: "\u25B6",
  task_dispatched: "\u{1F680}",
  task_completed: "\u2713",
  task_failed: "\u2717",
  agent_created: "\u{1F464}",
  status_change: "\u2022",
  session_linked: "\u26A1",
  project_created: "\u{1F4C1}",
  project_status_changed: "\u{1F4CB}",
  deliverable_created: "\u{1F4C4}",
  deliverable_submitted: "\u{1F4E4}",
  deliverable_approved: "\u2705",
  deliverable_rejected: "\u274C",
  client_created: "\u{1F465}",
};

export default function CommandCenterPage() {
  const router = useRouter();
  const agents = useStableData(useQuery(api.agents.list));
  const tasks = useStableData(useQuery(api.tasks.withAgent));
  const projects = useStableData(useQuery(api.projects.list));
  const pendingReview = useStableData(useQuery(api.deliverables.pendingReview));
  const events = useStableData(useQuery(api.events.recent, { limit: 15 }));

  const { setShowHelp } = useShortcuts();
  const { addToast } = useToast();

  const [selectedTaskId, setSelectedTaskId] = useState<Id<"tasks"> | null>(null);

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

  const isLoading = !agents || !tasks || !projects;

  // Active tasks grouped by project
  const activeTasks = tasks?.filter((t) => t.status === "running" || t.status === "assigned") ?? [];
  const tasksByProject = new Map<string, { projectName: string; tasks: typeof activeTasks }>();
  for (const task of activeTasks) {
    const key = task.projectId ?? "unassigned";
    const projectName = task.projectId
      ? projects?.find((p) => p._id === task.projectId)?.name ?? "Unknown"
      : "Unassigned";
    if (!tasksByProject.has(key)) {
      tasksByProject.set(key, { projectName, tasks: [] });
    }
    tasksByProject.get(key)!.tasks.push(task);
  }

  // Action queue: stuck tasks + review items
  const stuckTasks = tasks?.filter(
    (t) => t.status === "running" && t.startedAt && Date.now() - t.startedAt > 2 * 60 * 60 * 1000
  ) ?? [];
  const reviewItems = pendingReview ?? [];

  // Metrics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedToday = tasks?.filter(
    (t) => t.status === "completed" && t.completedAt && t.completedAt >= today.getTime()
  ).length ?? 0;
  const busyAgents = agents?.filter((a) => a.status === "busy").length ?? 0;
  const totalAgents = agents?.length ?? 0;
  const utilization = totalAgents > 0 ? Math.round((busyAgents / totalAgents) * 100) : 0;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-[#e8e5de] bg-white/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1a1a1a]" style={{ fontFamily: 'Inter, sans-serif' }}>Command Center</h1>
            <p className="text-[12px] text-[#9c9590] mt-0.5">Real-time operations view</p>
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
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Agent Status Strip */}
        {isLoading ? (
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-32 bg-[#f0ede6] rounded-lg animate-shimmer" />
            ))}
          </div>
        ) : agents && agents.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {agents.map((agent) => {
              const currentTask = activeTasks.find((t) => t.assignedAgentId === agent._id);
              return (
                <button
                  key={agent._id}
                  onClick={() => router.push(`/agents`)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-[#e8e5de] rounded-lg hover:border-[#c2410c]/30 transition-colors flex-shrink-0"
                >
                  <span className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    agent.status === "busy" ? "bg-green-500 animate-pulse" :
                    agent.status === "online" ? "bg-amber-400" :
                    "bg-red-400"
                  )} />
                  <span className="text-xs font-medium text-[#1a1a1a] truncate max-w-[80px]">
                    {agent.name}
                  </span>
                  {currentTask && (
                    <span className="text-[10px] text-[#9c9590] truncate max-w-[100px] font-mono">
                      {currentTask.title}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : null}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Left: Active Work (60%) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="bg-white border border-[#e8e5de] rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0ede6]">
                <span className="text-[13px] font-semibold text-[#1a1a1a]">
                  Active Work
                  {activeTasks.length > 0 && (
                    <span className="ml-1.5 text-[#9c9590] font-normal">({activeTasks.length})</span>
                  )}
                </span>
              </div>

              {isLoading ? (
                <SkeletonList count={3} />
              ) : activeTasks.length === 0 ? (
                <EmptyState
                  icon={<Activity className="w-8 h-8" />}
                  title="No active tasks"
                  description="All agents are idle — dispatch a task to get started"
                />
              ) : (
                <div className="divide-y divide-[#f0ede6]">
                  {Array.from(tasksByProject.entries()).map(([key, group]) => (
                    <div key={key}>
                      <div className="px-4 py-1.5 bg-[#faf9f6]">
                        <span className="text-[10px] font-semibold text-[#9c9590] uppercase tracking-wider">
                          {group.projectName}
                        </span>
                      </div>
                      {group.tasks.map((task) => {
                        const taskType = task.taskType ?? "general";
                        const miniPreview = taskTypeMini[taskType]?.(
                          task.liveContext as Record<string, unknown> | undefined
                        ) ?? taskType;
                        const elapsed = task.startedAt ? Date.now() - task.startedAt : 0;
                        return (
                          <button
                            key={task._id}
                            onClick={() => setSelectedTaskId(task._id)}
                            className="w-full px-4 py-3 hover:bg-[#faf9f6] transition-colors flex items-center gap-3 text-left"
                          >
                            <span className="text-[#9c9590]">{taskTypeIcons[taskType]}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-[#1a1a1a] truncate">{task.title}</span>
                                <span className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                                  task.status === "running" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                                )}>
                                  {task.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#6b6560]">
                                {task.agent && (
                                  <span className="flex items-center gap-1">
                                    <Bot className="w-3 h-3" />
                                    {task.agent.name}
                                  </span>
                                )}
                                <span className="text-[#9c9590] font-mono">{miniPreview}</span>
                                {elapsed > 0 && (
                                  <span className="flex items-center gap-0.5 font-mono text-[#9c9590]">
                                    <Clock className="w-3 h-3" />
                                    {formatElapsed(elapsed)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Action Queue + Feed (40%) */}
          <div className="lg:col-span-2 space-y-3">
            {/* Needs Attention */}
            {(stuckTasks.length > 0 || reviewItems.length > 0) && (
              <div className="bg-white border border-[#e8e5de] rounded-lg overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#f0ede6]">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[13px] font-semibold text-[#1a1a1a]">Needs Attention</span>
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full font-medium ml-auto">
                    {stuckTasks.length + reviewItems.length}
                  </span>
                </div>
                <div className="divide-y divide-[#f0ede6] max-h-[240px] overflow-y-auto">
                  {stuckTasks.map((task) => (
                    <button
                      key={task._id}
                      onClick={() => setSelectedTaskId(task._id)}
                      className="w-full px-4 py-2.5 hover:bg-[#faf9f6] transition-colors flex items-center gap-2 text-left"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-medium text-[#1a1a1a] truncate block">{task.title}</span>
                        <span className="text-[10px] text-amber-600">
                          Running for {formatElapsed(Date.now() - task.startedAt!)}
                        </span>
                      </div>
                    </button>
                  ))}
                  {reviewItems.map((item) => (
                    <div
                      key={item._id}
                      className="px-4 py-2.5 hover:bg-[#faf9f6] transition-colors flex items-center gap-2"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-[#c2410c] flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-medium text-[#1a1a1a] truncate block">{item.title}</span>
                        <span className="text-[10px] text-[#6b6560]">{item.project?.name ?? "Unknown project"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Feed */}
            <div className="bg-white border border-[#e8e5de] rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0ede6]">
                <span className="text-[13px] font-semibold text-[#1a1a1a]">Activity Feed</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </div>
              <div className="divide-y divide-[#f0ede6] max-h-[360px] overflow-y-auto">
                {!events ? (
                  <SkeletonList count={5} />
                ) : events.length === 0 ? (
                  <div className="p-4 text-xs text-[#9c9590] text-center">No activity yet</div>
                ) : (
                  events.map((event) => (
                    <div key={event._id} className="px-3 py-2 hover:bg-[#faf9f6] transition-colors">
                      <div className="flex items-start gap-2">
                        <span className="w-5 text-center flex-shrink-0 text-xs mt-0.5">
                          {eventIcons[event.type] || "\u2022"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#1a1a1a] leading-relaxed truncate">{event.message}</p>
                          <span className="text-[10px] text-[#9c9590] font-mono">{formatTime(event.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Metrics Strip */}
        {!isLoading && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-[#e8e5de] rounded-lg px-4 py-3 flex items-center gap-3">
              <BarChart3 className="w-4 h-4 text-[#c2410c] opacity-60" />
              <div>
                <span className="text-[10px] text-[#9c9590] block">Agent Utilization</span>
                <span className="text-lg font-mono font-medium text-[#1a1a1a]">{utilization}%</span>
              </div>
            </div>
            <div className="bg-white border border-[#e8e5de] rounded-lg px-4 py-3 flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-600 opacity-60" />
              <div>
                <span className="text-[10px] text-[#9c9590] block">Completed Today</span>
                <span className="text-lg font-mono font-medium text-[#1a1a1a]">{completedToday}</span>
              </div>
            </div>
            <div className="bg-white border border-[#e8e5de] rounded-lg px-4 py-3 flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-blue-600 opacity-60" />
              <div>
                <span className="text-[10px] text-[#9c9590] block">Active Tasks</span>
                <span className="text-lg font-mono font-medium text-[#1a1a1a]">{activeTasks.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task Detail Slide-over */}
      {selectedTaskId && (
        <TaskDetailPanel
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;
  return `${hours}h ${remainMinutes}m`;
}
