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
  Keyboard,
  Clock,
  Code2,
  GitBranch,
  Search,
  Palette,
  FileCheck2,
  Zap,
  CheckCircle,
  Circle,
  AlertCircle,
  ArrowRight,
  MessageSquare,
  ChevronRight,
  Eye,
  Loader2,
} from "lucide-react";

const typeIcon: Record<string, React.ReactNode> = {
  coding: <Code2 className="w-3.5 h-3.5" />,
  automation: <GitBranch className="w-3.5 h-3.5" />,
  research: <Search className="w-3.5 h-3.5" />,
  design: <Palette className="w-3.5 h-3.5" />,
  review: <FileCheck2 className="w-3.5 h-3.5" />,
  general: <Zap className="w-3.5 h-3.5" />,
};

const stepStatusIcon: Record<string, React.ReactNode> = {
  pending: <Circle className="w-3 h-3 text-[#d4d0ca]" />,
  in_progress: <Loader2 className="w-3 h-3 text-[#c2410c] animate-spin" />,
  review: <Eye className="w-3 h-3 text-[#c2410c]" />,
  approved: <CheckCircle className="w-3 h-3 text-green-600" />,
  rejected: <AlertCircle className="w-3 h-3 text-red-500" />,
};

export default function CommandCenterPage() {
  const router = useRouter();
  const templates = useStableData(useQuery(api.workerTemplates.list));
  const tasks = useStableData(useQuery(api.tasks.withAgent));
  const projects = useStableData(useQuery(api.projects.list));
  const events = useStableData(useQuery(api.events.recent, { limit: 15 }));

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
  const allTasks = tasks ?? [];
  const activeTasks = allTasks.filter((t) => t.status === "running" || t.status === "assigned");
  const completedTasks = allTasks.filter((t) => t.status === "completed");

  // Steps awaiting review across all tasks
  const reviewQueue: { task: (typeof allTasks)[0]; stepIndex: number; step: { name: string; status: string; description: string } }[] = [];
  for (const task of allTasks) {
    const steps = (task as Record<string, unknown>).steps as Array<{ name: string; status: string; description: string }> | undefined;
    if (steps) {
      steps.forEach((step, i) => {
        if (step.status === "review") {
          reviewQueue.push({ task, stepIndex: i, step });
        }
      });
    }
  }

  // Tasks grouped by status for the pipeline view
  const pendingTasks = allTasks.filter((t) => t.status === "pending");

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const completedToday = completedTasks.filter(
    (t) => t.completedAt && t.completedAt >= today.getTime()
  ).length;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#faf9f6]">
      {/* Header */}
      <header className="flex-shrink-0 bg-white px-6 py-3 border-b border-[#e8e5de] animate-header-enter">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-[#1a1a1a]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Command Center
            </h1>
            {!isLoading && (
              <div className="flex items-center gap-3 text-[12px] border-l border-[#e8e5de] pl-4"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {reviewQueue.length > 0 && (
                  <span className="text-[#c2410c] font-medium">{reviewQueue.length} awaiting review</span>
                )}
                <span className="text-[#9c9590]">{activeTasks.length} active</span>
                <span className="text-[#9c9590]">{completedToday} done today</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHelp(true)} className="p-1.5 text-[#9c9590] hover:text-[#1a1a1a] rounded hover:bg-[#f0ede6]">
              <Keyboard className="w-4 h-4" />
            </button>
            <span className="w-2 h-2 rounded-full bg-green-500" />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-[#f0ede6] rounded-lg animate-shimmer" />)}
          </div>
        ) : (
          <>
            {/* ═══ SECTION 1: Review Queue (primary action) ═══ */}
            {reviewQueue.length > 0 && (
              <section className="animate-section-enter stagger-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-[#c2410c] animate-pulse" />
                  <h2 className="text-sm font-semibold text-[#1a1a1a]">Needs Your Review</h2>
                </div>
                <div className="space-y-2">
                  {reviewQueue.map(({ task, stepIndex, step }) => (
                    <button
                      key={`${task._id}-${stepIndex}`}
                      onClick={() => setSelectedTaskId(task._id)}
                      className="w-full bg-white border border-[#c2410c]/20 rounded-lg px-5 py-3.5 flex items-center gap-4 hover:border-[#c2410c]/40 transition-colors text-left"
                    >
                      <Eye className="w-4 h-4 text-[#c2410c] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-medium text-[#1a1a1a]">{task.title}</span>
                          <ChevronRight className="w-3 h-3 text-[#9c9590]" />
                          <span className="text-[13px] text-[#6b6560]">Step {stepIndex + 1}: {step.name}</span>
                        </div>
                        <span className="text-[11px] text-[#9c9590] mt-0.5 block">{step.description}</span>
                      </div>
                      <span className="text-[11px] font-medium text-[#c2410c] bg-[#c2410c]/5 px-2.5 py-1 rounded flex-shrink-0">
                        Review
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* ═══ SECTION 2: Active Workers — what's running right now ═══ */}
            <section className="animate-section-enter stagger-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#1a1a1a]">
                  {activeTasks.length > 0 ? "Active Workers" : "Workers Standing By"}
                </h2>
                <button
                  onClick={() => router.push("/agents")}
                  className="text-[11px] text-[#c2410c] font-medium hover:underline"
                >
                  All templates →
                </button>
              </div>

              {activeTasks.length > 0 ? (
                <div className="bg-white border border-[#e8e5de] rounded-lg overflow-hidden">
                  {activeTasks.map((task, i) => {
                    const steps = (task as Record<string, unknown>).steps as Array<{ name: string; status: string }> | undefined;
                    const currentStep = (task as Record<string, unknown>).currentStep as number | undefined;
                    const totalSteps = steps?.length ?? 0;
                    const completedSteps = steps?.filter(s => s.status === "approved").length ?? 0;
                    const elapsed = task.startedAt ? Date.now() - task.startedAt : 0;

                    return (
                      <button
                        key={task._id}
                        onClick={() => setSelectedTaskId(task._id)}
                        className={cn(
                          "w-full px-5 py-4 flex items-start gap-4 hover:bg-[#faf9f6] transition-colors text-left",
                          i > 0 && "border-t border-[#f0ede6]"
                        )}
                      >
                        {/* Type icon + status */}
                        <div className="flex flex-col items-center gap-1 pt-0.5">
                          <span className="text-[#6b6560]">{typeIcon[task.taskType ?? "general"]}</span>
                          {task.status === "running" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c] animate-pulse" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Task title + agent */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[14px] font-medium text-[#1a1a1a] truncate">{task.title}</span>
                            {task.agent && (
                              <span className="text-[10px] text-[#9c9590] bg-[#f5f3ee] px-1.5 py-0.5 rounded flex-shrink-0"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                {task.agent.name}
                              </span>
                            )}
                          </div>

                          {/* Step progress */}
                          {totalSteps > 0 ? (
                            <div className="space-y-1.5">
                              {/* Progress bar */}
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-[#f0ede6] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#c2410c] rounded-full transition-all duration-700 ease-out"
                                    style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-[#9c9590] flex-shrink-0"
                                  style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                  {completedSteps}/{totalSteps}
                                </span>
                              </div>
                              {/* Current step */}
                              {currentStep !== undefined && steps && steps[currentStep] && (
                                <div className="flex items-center gap-1.5">
                                  {stepStatusIcon[steps[currentStep].status] ?? stepStatusIcon.pending}
                                  <span className="text-[11px] text-[#6b6560]">
                                    Step {currentStep + 1}: {steps[currentStep].name}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-[11px] text-[#9c9590]"
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                              <span>{task.taskType ?? "general"}</span>
                              {elapsed > 0 && (
                                <>
                                  <span>·</span>
                                  <span>{formatElapsed(elapsed)}</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Chat indicator */}
                        <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                          <MessageSquare className="w-3.5 h-3.5 text-[#d4d0ca]" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Idle state — show templates as ready roster */
                <div className="bg-white border border-[#e8e5de] rounded-lg overflow-hidden">
                  {(templates ?? []).map((template, i) => (
                    <div
                      key={template._id}
                      className={cn(
                        "px-5 py-3 flex items-center justify-between",
                        i > 0 && "border-t border-[#f0ede6]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[#9c9590]">{typeIcon[template.taskTypes[0]] ?? <Zap className="w-3.5 h-3.5" />}</span>
                        <div>
                          <span className="text-[13px] font-medium text-[#1a1a1a]">{template.displayName}</span>
                          <div className="flex items-center gap-2 text-[10px] text-[#9c9590]"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            <span>{template.model}</span>
                            <span>·</span>
                            <span>{template.skills.length} skills</span>
                            <span>·</span>
                            <span>×{template.maxParallel}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded">
                        Ready
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ═══ SECTION 3: Pipeline — pending → active → done ═══ */}
            {(pendingTasks.length > 0 || completedToday > 0) && (
              <section className="animate-section-enter stagger-3">
                <h2 className="text-sm font-semibold text-[#1a1a1a] mb-3">Pipeline</h2>
                <div className="grid grid-cols-3 gap-3">
                  {/* Pending */}
                  <div className="bg-white border border-[#e8e5de] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider">Queue</span>
                      <span className="text-[11px] text-[#9c9590]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {pendingTasks.length}
                      </span>
                    </div>
                    {pendingTasks.length > 0 ? (
                      <div className="space-y-1.5">
                        {pendingTasks.slice(0, 4).map((task) => (
                          <button
                            key={task._id}
                            onClick={() => setSelectedTaskId(task._id)}
                            className="w-full flex items-center gap-2 text-left hover:bg-[#faf9f6] rounded px-1.5 py-1 -mx-1.5 transition-colors"
                          >
                            <Circle className="w-2.5 h-2.5 text-[#d4d0ca] flex-shrink-0" />
                            <span className="text-[12px] text-[#1a1a1a] truncate">{task.title}</span>
                          </button>
                        ))}
                        {pendingTasks.length > 4 && (
                          <span className="text-[10px] text-[#9c9590] pl-5">+{pendingTasks.length - 4} more</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#9c9590]">Empty</span>
                    )}
                  </div>

                  {/* Active */}
                  <div className="bg-white border border-[#e8e5de] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider">Working</span>
                      <span className="text-[11px] text-[#c2410c]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {activeTasks.length}
                      </span>
                    </div>
                    {activeTasks.length > 0 ? (
                      <div className="space-y-1.5">
                        {activeTasks.slice(0, 4).map((task) => (
                          <button
                            key={task._id}
                            onClick={() => setSelectedTaskId(task._id)}
                            className="w-full flex items-center gap-2 text-left hover:bg-[#faf9f6] rounded px-1.5 py-1 -mx-1.5 transition-colors"
                          >
                            <Loader2 className="w-2.5 h-2.5 text-[#c2410c] animate-spin flex-shrink-0" />
                            <span className="text-[12px] text-[#1a1a1a] truncate">{task.title}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#9c9590]">None</span>
                    )}
                  </div>

                  {/* Done today */}
                  <div className="bg-white border border-[#e8e5de] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider">Done Today</span>
                      <span className="text-[11px] text-green-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {completedToday}
                      </span>
                    </div>
                    {completedToday > 0 ? (
                      <div className="space-y-1.5">
                        {completedTasks.filter(t => t.completedAt && t.completedAt >= today.getTime()).slice(0, 4).map((task) => (
                          <button
                            key={task._id}
                            onClick={() => setSelectedTaskId(task._id)}
                            className="w-full flex items-center gap-2 text-left hover:bg-[#faf9f6] rounded px-1.5 py-1 -mx-1.5 transition-colors"
                          >
                            <CheckCircle className="w-2.5 h-2.5 text-green-600 flex-shrink-0" />
                            <span className="text-[12px] text-[#1a1a1a] truncate">{task.title}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#9c9590]">None yet</span>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* ═══ SECTION 4: Projects ═══ */}
            {projects && projects.length > 0 && (
              <section className="animate-section-enter stagger-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-[#1a1a1a]">Projects</h2>
                  <button onClick={() => router.push("/projects")} className="text-[11px] text-[#c2410c] font-medium hover:underline">
                    View all →
                  </button>
                </div>
                <div className="bg-white border border-[#e8e5de] rounded-lg overflow-hidden">
                  {projects.slice(0, 5).map((project, i) => {
                    const projectTasks = allTasks.filter((t) => t.projectId === project._id);
                    const done = projectTasks.filter((t) => t.status === "completed").length;
                    const total = projectTasks.length;
                    const active = projectTasks.filter((t) => t.status === "running").length;
                    return (
                      <button
                        key={project._id}
                        onClick={() => router.push("/projects")}
                        className={cn(
                          "w-full px-5 py-3 flex items-center justify-between hover:bg-[#faf9f6] transition-colors text-left",
                          i > 0 && "border-t border-[#f0ede6]"
                        )}
                      >
                        <div>
                          <span className="text-[13px] font-medium text-[#1a1a1a]">{project.name}</span>
                          <div className="flex items-center gap-2 text-[10px] text-[#9c9590] mt-0.5"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            <span>{project.status}</span>
                            {active > 0 && <span className="text-[#c2410c]">{active} active</span>}
                          </div>
                        </div>
                        {total > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-[#f0ede6] rounded-full overflow-hidden">
                              <div className="h-full bg-[#1a1a1a] rounded-full transition-all duration-700 ease-out" style={{ width: `${(done / total) * 100}%` }} />
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
              </section>
            )}

            {/* ═══ SECTION 5: Activity ═══ */}
            <section className="animate-section-enter stagger-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#1a1a1a]">Activity</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[10px] text-[#9c9590]">live</span>
                </div>
              </div>
              <div className="bg-white border border-[#e8e5de] rounded-lg overflow-hidden max-h-[280px] overflow-y-auto">
                {events && events.length > 0 ? events.map((event, i) => (
                  <div key={event._id} className={cn("px-5 py-2.5", i > 0 && "border-t border-[#f0ede6]")}>
                    <p className="text-[12px] text-[#1a1a1a]">{event.message}</p>
                    <span className="text-[10px] text-[#9c9590]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                )) : (
                  <div className="p-6 text-center text-[12px] text-[#9c9590]">No activity yet</div>
                )}
              </div>
            </section>
          </>
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
