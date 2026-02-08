"use client";

import { useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useShortcuts, useRegisterShortcut } from "@/components/shortcuts-provider";
import { useToast } from "@/components/toast";
import { useStableData } from "@/lib/hooks";
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
} from "lucide-react";

const typeIcon: Record<string, React.ReactNode> = {
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
  const events = useStableData(useQuery(api.events.recent, { limit: 20 }));

  const { setShowHelp } = useShortcuts();
  const { addToast } = useToast();
  const [selectedTaskId, setSelectedTaskId] = useState<Id<"tasks"> | null>(null);

  const handleSync = useCallback(async () => {
    try {
      const res = await fetch("/api/agents/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) addToast(data.message || "Synced", "success");
      else addToast(data.error || "Sync failed", "error");
    } catch { addToast("Network error", "error"); }
  }, [addToast]);
  useRegisterShortcut("refresh", handleSync);

  const isLoading = !templates || !tasks || !projects;
  const activeTasks = tasks?.filter((t) => t.status === "running" || t.status === "assigned") ?? [];
  const stuckTasks = tasks?.filter(
    (t) => t.status === "running" && t.startedAt && Date.now() - t.startedAt > 2 * 60 * 60 * 1000
  ) ?? [];
  const reviewItems = pendingReview ?? [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const completedToday = tasks?.filter(
    (t) => t.status === "completed" && t.completedAt && t.completedAt >= today.getTime()
  ).length ?? 0;
  const totalTemplates = templates?.length ?? 0;
  const hasWork = activeTasks.length > 0;

  // Group active tasks by project
  const tasksByProject = new Map<string, { projectName: string; tasks: typeof activeTasks }>();
  for (const task of activeTasks) {
    const key = task.projectId ?? "unassigned";
    const projectName = task.projectId
      ? projects?.find((p) => p._id === task.projectId)?.name ?? "Unknown"
      : "Unassigned";
    if (!tasksByProject.has(key)) tasksByProject.set(key, { projectName, tasks: [] });
    tasksByProject.get(key)!.tasks.push(task);
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#faf9f6]">
      {/* Tight header */}
      <header className="flex-shrink-0 bg-white px-6 py-3 border-b border-[#e8e5de]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-[#1a1a1a]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Command Center
            </h1>
            <div className="flex items-center gap-4 text-[12px] text-[#9c9590] border-l border-[#e8e5de] pl-4"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <span>{activeTasks.length} active</span>
              <span>{completedToday} done today</span>
              <span>{totalTemplates} workers</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHelp(true)}
              className="p-1.5 text-[#9c9590] hover:text-[#1a1a1a] rounded hover:bg-[#f0ede6]"
            >
              <Keyboard className="w-4 h-4" />
            </button>
            <span className="w-2 h-2 rounded-full bg-green-500" />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-[#f0ede6] rounded-lg animate-shimmer" />)}
          </div>
        ) : hasWork ? (
          /* ═══ ACTIVE STATE: work is happening ═══ */
          <div className="flex h-full">
            {/* Main: task list */}
            <div className="flex-1 overflow-y-auto border-r border-[#e8e5de]">
              {/* Attention bar */}
              {(stuckTasks.length > 0 || reviewItems.length > 0) && (
                <div className="px-5 py-2.5 bg-[#c2410c]/5 border-b border-[#c2410c]/10 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#c2410c]" />
                  <span className="text-[12px] font-medium text-[#c2410c]">
                    {stuckTasks.length + reviewItems.length} item{stuckTasks.length + reviewItems.length > 1 ? "s" : ""} need attention
                  </span>
                </div>
              )}
              {Array.from(tasksByProject.entries()).map(([key, group]) => (
                <div key={key}>
                  <div className="px-5 py-2 bg-[#f5f3ee] border-b border-[#e8e5de] sticky top-0 z-10">
                    <span className="text-[11px] font-semibold text-[#6b6560] uppercase tracking-wider">
                      {group.projectName}
                    </span>
                  </div>
                  {group.tasks.map((task) => {
                    const elapsed = task.startedAt ? Date.now() - task.startedAt : 0;
                    return (
                      <button
                        key={task._id}
                        onClick={() => setSelectedTaskId(task._id)}
                        className="w-full px-5 py-3.5 border-b border-[#f0ede6] hover:bg-white transition-colors flex items-center gap-3 text-left"
                      >
                        <span className="text-[#9c9590]">{typeIcon[task.taskType ?? "general"]}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-[14px] font-medium text-[#1a1a1a] truncate block">{task.title}</span>
                          <div className="flex items-center gap-3 mt-0.5 text-[11px] text-[#9c9590]"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {task.agent && <span>{task.agent.name}</span>}
                            <span>{task.taskType ?? "general"}</span>
                            {elapsed > 0 && <span>{formatElapsed(elapsed)}</span>}
                          </div>
                        </div>
                        {task.status === "running" && (
                          <span className="w-2 h-2 rounded-full bg-[#c2410c] animate-pulse flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Side: activity feed */}
            <div className="w-72 flex-shrink-0 overflow-y-auto bg-white">
              <div className="px-4 py-2.5 border-b border-[#e8e5de] sticky top-0 bg-white z-10">
                <span className="text-[11px] font-semibold text-[#6b6560] uppercase tracking-wider">Activity</span>
              </div>
              {events?.map((event) => (
                <div key={event._id} className="px-4 py-2 border-b border-[#f0ede6]">
                  <p className="text-[12px] text-[#1a1a1a] leading-snug">{event.message}</p>
                  <span className="text-[10px] text-[#9c9590]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatTime(event.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ═══ IDLE STATE: system ready, nothing running ═══ */
          <div className="p-6 space-y-6">
            {/* System status — the "readiness" view */}
            <div className="bg-white border border-[#e8e5de] rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-[#f0ede6]">
                <span className="text-sm font-semibold text-[#1a1a1a]">System Status</span>
              </div>
              <div className="divide-y divide-[#f0ede6]">
                {(templates ?? []).map((template) => (
                  <div key={template._id} className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[#9c9590]">{typeIcon[template.taskTypes[0]] ?? <Zap className="w-3.5 h-3.5" />}</span>
                      <div>
                        <span className="text-[13px] font-medium text-[#1a1a1a] block">{template.displayName}</span>
                        <span className="text-[11px] text-[#9c9590]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {template.model} · {template.skills.length} skills · ×{template.maxParallel}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">Ready</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects overview */}
            {projects && projects.length > 0 && (
              <div className="bg-white border border-[#e8e5de] rounded-lg overflow-hidden">
                <div className="px-5 py-3 border-b border-[#f0ede6] flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1a1a1a]">Projects</span>
                  <button
                    onClick={() => router.push("/projects")}
                    className="text-[11px] text-[#c2410c] font-medium hover:underline"
                  >
                    View all
                  </button>
                </div>
                <div className="divide-y divide-[#f0ede6]">
                  {projects.slice(0, 5).map((project) => {
                    const projectTasks = tasks?.filter((t) => t.projectId === project._id) ?? [];
                    const done = projectTasks.filter((t) => t.status === "completed").length;
                    const total = projectTasks.length;
                    return (
                      <button
                        key={project._id}
                        onClick={() => router.push("/projects")}
                        className="w-full px-5 py-3 flex items-center justify-between hover:bg-[#faf9f6] transition-colors text-left"
                      >
                        <div>
                          <span className="text-[13px] font-medium text-[#1a1a1a] block">{project.name}</span>
                          <span className="text-[11px] text-[#9c9590]">{project.status}</span>
                        </div>
                        {total > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1 bg-[#f0ede6] rounded-full overflow-hidden">
                              <div className="h-full bg-[#c2410c] rounded-full" style={{ width: `${(done / total) * 100}%` }} />
                            </div>
                            <span className="text-[10px] text-[#9c9590]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                              {done}/{total}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Activity feed — full width when idle */}
            <div className="bg-white border border-[#e8e5de] rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-[#f0ede6] flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1a1a1a]">Recent Activity</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[10px] text-[#9c9590]">live</span>
                </div>
              </div>
              <div className="divide-y divide-[#f0ede6] max-h-[320px] overflow-y-auto">
                {events && events.length > 0 ? events.map((event) => (
                  <div key={event._id} className="px-5 py-2.5">
                    <p className="text-[13px] text-[#1a1a1a]">{event.message}</p>
                    <span className="text-[10px] text-[#9c9590]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                )) : (
                  <div className="p-6 text-center text-[13px] text-[#9c9590]">No activity yet</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedTaskId && (
        <TaskDetailPanel taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
      )}
    </div>
  );
}

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h${m % 60}m`;
}
