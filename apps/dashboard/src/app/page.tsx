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

const taskTypeIcons: Record<string, React.ReactNode> = {
  coding: <Code2 className="w-3.5 h-3.5" />,
  automation: <GitBranch className="w-3.5 h-3.5" />,
  research: <Search className="w-3.5 h-3.5" />,
  design: <Palette className="w-3.5 h-3.5" />,
  review: <FileCheck2 className="w-3.5 h-3.5" />,
  general: <Zap className="w-3.5 h-3.5" />,
};

export default function CommandCenterPage() {
  const router = useRouter();
  const templates = useStableData(useQuery(api.workerTemplates.list));
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

  const isLoading = !templates || !tasks || !projects;

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

  const stuckTasks = tasks?.filter(
    (t) => t.status === "running" && t.startedAt && Date.now() - t.startedAt > 2 * 60 * 60 * 1000
  ) ?? [];
  const reviewItems = pendingReview ?? [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedToday = tasks?.filter(
    (t) => t.status === "completed" && t.completedAt && t.completedAt >= today.getTime()
  ).length ?? 0;
  const totalTemplates = templates?.length ?? 0;
  const utilization = totalTemplates > 0 ? Math.round((activeTasks.length / totalTemplates) * 100) : 0;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-white px-6 py-4" style={{ borderBottom: '1px solid #e8e5de' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1a1a1a]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Command Center
            </h1>
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
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Connected
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Metrics strip — top, always visible */}
        {!isLoading && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-[#e8e5de] rounded-lg px-5 py-4 card-elevated">
              <span className="text-[11px] font-medium text-[#9c9590] uppercase tracking-wide block mb-1">Utilization</span>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-semibold text-[#1a1a1a]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {utilization}%
                </span>
              </div>
              <div className="mt-2 w-full h-1 bg-[#f0ede6] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#c2410c] transition-all duration-500"
                  style={{ width: `${Math.max(utilization, 2)}%` }}
                />
              </div>
              <span className="text-[10px] text-[#9c9590] mt-1.5 block">{activeTasks.length}/{totalTemplates} workers active</span>
            </div>
            <div className="bg-white border border-[#e8e5de] rounded-lg px-5 py-4 card-elevated">
              <span className="text-[11px] font-medium text-[#9c9590] uppercase tracking-wide block mb-1">Completed Today</span>
              <span className="text-2xl font-semibold text-[#1a1a1a]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {completedToday}
              </span>
              <span className="text-[10px] text-[#9c9590] mt-1.5 block">tasks finished</span>
            </div>
            <div className="bg-white border border-[#e8e5de] rounded-lg px-5 py-4 card-elevated">
              <span className="text-[11px] font-medium text-[#9c9590] uppercase tracking-wide block mb-1">Active Now</span>
              <span className={cn(
                "text-2xl font-semibold",
                activeTasks.length > 0 ? "text-[#c2410c]" : "text-[#1a1a1a]"
              )} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {activeTasks.length}
              </span>
              <span className="text-[10px] text-[#9c9590] mt-1.5 block">tasks in progress</span>
            </div>
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left: Active Work */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-[#e8e5de] rounded-lg overflow-hidden card-elevated">
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#f0ede6]">
                <span className="text-sm font-semibold text-[#1a1a1a]">Active Work</span>
                {activeTasks.length > 0 && (
                  <span className="text-[11px] font-medium text-[#c2410c]">{activeTasks.length} running</span>
                )}
              </div>

              {isLoading ? (
                <SkeletonList count={3} />
              ) : activeTasks.length === 0 ? (
                <div className="py-16 px-6 text-center">
                  <p className="text-[15px] font-medium text-[#1a1a1a] mb-1">All workers standing by</p>
                  <p className="text-[13px] text-[#9c9590]">Dispatch a task to put them to work</p>
                </div>
              ) : (
                <div className="divide-y divide-[#f0ede6]">
                  {Array.from(tasksByProject.entries()).map(([key, group]) => (
                    <div key={key}>
                      <div className="px-5 py-2 bg-[#faf9f6]">
                        <span className="text-[10px] font-semibold text-[#9c9590] uppercase tracking-wider">
                          {group.projectName}
                        </span>
                      </div>
                      {group.tasks.map((task) => {
                        const taskType = task.taskType ?? "general";
                        const icon = taskTypeIcons[taskType] ?? taskTypeIcons.general;
                        const elapsed = task.startedAt ? Date.now() - task.startedAt : 0;
                        return (
                          <button
                            key={task._id}
                            onClick={() => setSelectedTaskId(task._id)}
                            className="w-full px-5 py-3.5 hover:bg-[#faf9f6] transition-colors flex items-center gap-3 text-left"
                          >
                            <span className="text-[#6b6560] flex-shrink-0">{icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[14px] font-medium text-[#1a1a1a] truncate">{task.title}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f5f3ee] text-[#6b6560] font-medium flex-shrink-0">
                                  {taskType}
                                </span>
                                {task.status === "running" && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c] animate-pulse flex-shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-0.5 text-[11px] text-[#9c9590]">
                                {task.agent && (
                                  <span className="flex items-center gap-1">
                                    <Bot className="w-3 h-3" />
                                    {task.agent.name}
                                  </span>
                                )}
                                {elapsed > 0 && (
                                  <span className="flex items-center gap-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
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

          {/* Right: Feed + Attention */}
          <div className="lg:col-span-2 space-y-4">
            {/* Needs Attention */}
            {(stuckTasks.length > 0 || reviewItems.length > 0) && (
              <div className="bg-white border border-[#e8e5de] rounded-lg overflow-hidden card-elevated">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0ede6]">
                  <AlertTriangle className="w-4 h-4 text-[#c2410c]" />
                  <span className="text-sm font-semibold text-[#1a1a1a]">Needs Attention</span>
                  <span className="text-[10px] bg-[#c2410c] text-white px-1.5 py-0.5 rounded font-medium ml-auto">
                    {stuckTasks.length + reviewItems.length}
                  </span>
                </div>
                <div className="divide-y divide-[#f0ede6] max-h-[200px] overflow-y-auto">
                  {stuckTasks.map((task) => (
                    <button
                      key={task._id}
                      onClick={() => setSelectedTaskId(task._id)}
                      className="w-full px-4 py-2.5 hover:bg-[#faf9f6] transition-colors flex items-center gap-2 text-left"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#c2410c] flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[13px] font-medium text-[#1a1a1a] truncate block">{task.title}</span>
                        <span className="text-[10px] text-[#9c9590]">Running {formatElapsed(Date.now() - task.startedAt!)}</span>
                      </div>
                    </button>
                  ))}
                  {reviewItems.map((item) => (
                    <div key={item._id} className="px-4 py-2.5 hover:bg-[#faf9f6] transition-colors flex items-center gap-2">
                      <FileCheck2 className="w-3.5 h-3.5 text-[#6b6560] flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[13px] font-medium text-[#1a1a1a] truncate block">{item.title}</span>
                        <span className="text-[10px] text-[#9c9590]">{item.project?.name ?? "Unknown"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Feed */}
            <div className="bg-white border border-[#e8e5de] rounded-lg overflow-hidden card-elevated">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0ede6]">
                <span className="text-sm font-semibold text-[#1a1a1a]">Activity</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[10px] text-[#9c9590]">live</span>
                </div>
              </div>
              <div className="max-h-[400px] overflow-y-auto divide-y divide-[#f0ede6]">
                {!events ? (
                  <SkeletonList count={5} />
                ) : events.length === 0 ? (
                  <div className="p-6 text-[13px] text-[#9c9590] text-center">No activity yet</div>
                ) : (
                  events.map((event) => (
                    <div key={event._id} className="px-4 py-2.5 hover:bg-[#faf9f6] transition-colors">
                      <p className="text-[13px] text-[#1a1a1a] leading-relaxed">{event.message}</p>
                      <span className="text-[10px] text-[#9c9590]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {formatTime(event.timestamp)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedTaskId && (
        <TaskDetailPanel taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
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
  return `${hours}h ${minutes % 60}m`;
}
