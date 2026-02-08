"use client";

import { useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useShortcuts, useRegisterShortcut } from "@/components/shortcuts-provider";
import { useToast } from "@/components/toast";
import { useStableData } from "@/lib/hooks";
import { SkeletonList } from "@/components/ui/skeleton";
import { TaskDetailPanel } from "@/components/task-detail-panel";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Bot,
  Keyboard,
  AlertTriangle,
  Clock,
  Code2,
  GitBranch,
  Search,
  Palette,
  FileCheck2,
  Zap,
  CheckCircle2,
  BarChart3,
  TrendingUp,
} from "lucide-react";

const taskTypeConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  coding: { icon: <Code2 className="w-3 h-3" />, label: "Coding", color: "text-blue-600 bg-blue-50" },
  automation: { icon: <GitBranch className="w-3 h-3" />, label: "Automation", color: "text-purple-600 bg-purple-50" },
  research: { icon: <Search className="w-3 h-3" />, label: "Research", color: "text-emerald-600 bg-emerald-50" },
  design: { icon: <Palette className="w-3 h-3" />, label: "Design", color: "text-pink-600 bg-pink-50" },
  review: { icon: <FileCheck2 className="w-3 h-3" />, label: "Review", color: "text-amber-600 bg-amber-50" },
  general: { icon: <Zap className="w-3 h-3" />, label: "General", color: "text-[#6b6560] bg-[#f0ede6]" },
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

const eventTimelineColor: Record<string, string> = {
  task_completed: "bg-green-400",
  deliverable_approved: "bg-green-400",
  task_started: "bg-amber-400",
  task_dispatched: "bg-amber-400",
  task_assigned: "bg-amber-400",
  task_failed: "bg-red-400",
  deliverable_rejected: "bg-red-400",
  task_created: "bg-blue-400",
  project_created: "bg-blue-400",
  agent_created: "bg-purple-400",
  status_change: "bg-[#9c9590]",
  session_linked: "bg-cyan-400",
  deliverable_created: "bg-blue-400",
  deliverable_submitted: "bg-amber-400",
  project_status_changed: "bg-blue-400",
  client_created: "bg-purple-400",
};

export default function CommandCenterPage() {
  const router = useRouter();
  const agents = useStableData(useQuery(api.workerTemplates.list));
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
  const activeWorkerCount = activeTasks.length;
  const totalTemplates = agents?.length ?? 0;
  const utilization = totalTemplates > 0 ? Math.round((activeWorkerCount / totalTemplates) * 100) : 0;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-white/90 backdrop-blur-sm px-6 py-4" style={{ borderBottom: '1px solid #e8e5de', boxShadow: '0 1px 8px 0 rgba(0,0,0,0.03)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-[#1a1a1a]" style={{ fontFamily: 'Inter, sans-serif' }}>Command Center</h1>
            <p className="text-[13px] text-[#9c9590] mt-0.5">Real-time operations view</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHelp(true)}
              className="p-2 text-[#9c9590] hover:text-[#1a1a1a] rounded-lg hover:bg-[#f0ede6] transition-colors"
              title="Keyboard shortcuts (?)"
            >
              <Keyboard className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 text-[13px] text-[#6b6560]">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Connected
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Worker Templates Strip */}
        {isLoading ? (
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-32 bg-[#f0ede6] rounded-lg animate-shimmer" />
            ))}
          </div>
        ) : agents && agents.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {agents.map((template) => {
              return (
                <button
                  key={template._id}
                  onClick={() => router.push(`/agents`)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all flex-shrink-0 card-elevated bg-white border-[#e8e5de] hover:border-[#c2410c]/30"
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 bg-amber-400 ring-amber-100" />
                  <div className="flex flex-col items-start">
                    <span className="text-[13px] font-medium text-[#1a1a1a] truncate max-w-[100px]">
                      {template.displayName}
                    </span>
                    <span className="text-[10px] text-[#9c9590] leading-tight">
                      {template.model}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left: Active Work (60%) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white border border-[#e8e5de] rounded-xl overflow-hidden card-elevated">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0ede6]">
                <span className="text-sm font-semibold text-[#1a1a1a]">
                  Active Work
                  {activeTasks.length > 0 && (
                    <span className="ml-2 text-[11px] text-white bg-[#c2410c] px-2 py-0.5 rounded-full font-medium">{activeTasks.length}</span>
                  )}
                </span>
              </div>

              {isLoading ? (
                <SkeletonList count={3} />
              ) : activeTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6">
                  <div className="flex items-center gap-2 mb-4">
                    {(agents ?? []).slice(0, 5).map((agent, i) => (
                      <div
                        key={agent._id}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f0ede6] to-[#e8e5de] flex items-center justify-center border border-[#e8e5de]"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <Bot className="w-3.5 h-3.5 text-[#9c9590]" />
                      </div>
                    ))}
                    {(agents?.length ?? 0) > 5 && (
                      <span className="text-xs text-[#9c9590] font-mono ml-1">+{agents!.length - 5}</span>
                    )}
                  </div>
                  <p className="text-[15px] font-medium text-[#1a1a1a] mb-1">All workers standing by</p>
                  <p className="text-[13px] text-[#6b6560] text-center">Ready to deploy — dispatch a task to put them to work</p>
                  <div className="mt-4 w-full max-w-[280px] border-2 border-dashed border-[#e8e5de] rounded-xl py-3 flex items-center justify-center gap-2 text-[#9c9590]">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Awaiting dispatch</span>
                  </div>
                </div>
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
                        const ttConf = taskTypeConfig[taskType] ?? taskTypeConfig.general;
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
                            <span className={cn("flex-shrink-0", ttConf.color.split(" ")[0])}>{ttConf.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[14px] font-medium text-[#1a1a1a] truncate">{task.title}</span>
                                <span className={cn(
                                  "inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0",
                                  ttConf.color
                                )}>
                                  {ttConf.icon}
                                  {ttConf.label}
                                </span>
                                <span className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0",
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
          <div className="lg:col-span-2 space-y-4">
            {/* Needs Attention */}
            {(stuckTasks.length > 0 || reviewItems.length > 0) && (
              <div className="bg-white border border-amber-200/60 rounded-xl overflow-hidden card-elevated-md">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-100 bg-gradient-to-r from-amber-50/60 to-transparent">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-[#1a1a1a]">Needs Attention</span>
                  <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold ml-auto">
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
            <div className="bg-white border border-[#e8e5de] rounded-xl overflow-hidden card-elevated">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0ede6]">
                <span className="text-sm font-semibold text-[#1a1a1a]">Activity Feed</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] text-[#9c9590]">live</span>
                </div>
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                {!events ? (
                  <SkeletonList count={5} />
                ) : events.length === 0 ? (
                  <div className="p-6 text-[13px] text-[#9c9590] text-center">No activity yet</div>
                ) : (
                  <div className="relative">
                    {events.map((event, i) => {
                      const color = eventTimelineColor[event.type] ?? "bg-[#9c9590]";
                      const isLast = i === events.length - 1;
                      return (
                        <div key={event._id} className="flex hover:bg-[#faf9f6] transition-colors">
                          {/* Timeline line + dot */}
                          <div className="relative flex flex-col items-center w-8 flex-shrink-0">
                            {i === 0 && <div className="w-px h-2 bg-transparent" />}
                            {i > 0 && <div className="w-px flex-1 bg-[#e8e5de]" />}
                            <div className={cn("w-2 h-2 rounded-full flex-shrink-0 my-0.5", color)} />
                            {!isLast && <div className="w-px flex-1 bg-[#e8e5de]" />}
                            {isLast && <div className="w-px h-2 bg-transparent" />}
                          </div>
                          {/* Content */}
                          <div className="flex-1 min-w-0 py-2 pr-3">
                            <p className="text-[13px] text-[#1a1a1a] leading-relaxed truncate">{event.message}</p>
                            <span className="text-[10px] text-[#9c9590] font-mono">{formatTime(event.timestamp)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Metrics Strip */}
        {!isLoading && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-[#e8e5de] rounded-xl px-5 py-4 card-elevated-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-[#c2410c]/10">
                  <BarChart3 className="w-4 h-4 text-[#c2410c]" />
                </div>
                <span className="text-[11px] font-medium text-[#6b6560] uppercase tracking-wide">Utilization</span>
              </div>
              <span className="text-2xl font-mono font-semibold text-[#c2410c]">{utilization}%</span>
              <div className="mt-2 w-full h-1.5 bg-[#f0ede6] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${utilization}%`,
                    backgroundColor: utilization > 75 ? '#16a34a' : utilization > 40 ? '#c2410c' : '#9c9590',
                  }}
                />
              </div>
              <span className="text-[10px] text-[#9c9590] mt-1 block">{activeWorkerCount}/{totalTemplates} workers active</span>
            </div>
            <div className="bg-white border border-[#e8e5de] rounded-xl px-5 py-4 card-elevated-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-[11px] font-medium text-[#6b6560] uppercase tracking-wide">Completed Today</span>
              </div>
              <span className="text-2xl font-mono font-semibold text-[#1a1a1a]">{completedToday}</span>
              <span className="text-[10px] text-[#9c9590] mt-1 block">tasks finished</span>
            </div>
            <div className="bg-white border border-[#e8e5de] rounded-xl px-5 py-4 card-elevated-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-[11px] font-medium text-[#6b6560] uppercase tracking-wide">Active Now</span>
              </div>
              <span className={cn(
                "text-2xl font-mono font-semibold",
                activeTasks.length > 0 ? "text-[#c2410c]" : "text-[#1a1a1a]"
              )}>{activeTasks.length}</span>
              <span className="text-[10px] text-[#9c9590] mt-1 block">tasks in progress</span>
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
