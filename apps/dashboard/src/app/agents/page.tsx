"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useStableData } from "@/lib/hooks";
import { SkeletonList } from "@/components/ui/skeleton";
import {
  Cpu,
  Activity,
  Clock,
  Code2,
  GitBranch,
  Search,
  Palette,
  FileCheck2,
  Shield,
  Zap,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── type → icon mapping ── */
const typeIcons: Record<string, React.ReactNode> = {
  coding: <Code2 className="w-4 h-4" />,
  automation: <GitBranch className="w-4 h-4" />,
  research: <Search className="w-4 h-4" />,
  design: <Palette className="w-4 h-4" />,
  review: <FileCheck2 className="w-4 h-4" />,
};

/* ── worker template → accent color ── */
const templateAccents: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  "frontend-builder": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  "backend-engineer": { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-500" },
  "automation-builder": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  "researcher": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  "design-reviewer": { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200", dot: "bg-pink-500" },
  "qa-tester": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
};

const defaultAccent = { bg: "bg-stone-50", text: "text-stone-600", border: "border-stone-200", dot: "bg-stone-400" };

const workerStatusStyles: Record<string, { dot: string; label: string }> = {
  spawning: { dot: "bg-blue-400 animate-pulse", label: "Spawning" },
  active: { dot: "bg-green-500 animate-pulse", label: "Working" },
  paused: { dot: "bg-amber-400", label: "Paused" },
  completed: { dot: "bg-stone-300", label: "Done" },
  failed: { dot: "bg-red-400", label: "Failed" },
};

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;
  return `${hours}h${remainMinutes}m`;
}

export default function WorkersPage() {
  const templates = useStableData(useQuery(api.workerTemplates.list));
  const workers = useStableData(useQuery(api.workers.list, {}));
  const tasks = useStableData(useQuery(api.tasks.list));

  const activeWorkers = workers?.filter((w) => w.status === "spawning" || w.status === "active" || w.status === "paused") ?? [];

  const getTaskTitle = (taskId: string) => tasks?.find((t) => t._id === taskId)?.title ?? "Unknown task";
  const getTemplateName = (templateId: string) => templates?.find((t) => t._id === templateId)?.displayName ?? "Unknown";
  const getTemplateKey = (templateId: string) => templates?.find((t) => t._id === templateId)?.name ?? "";

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-[#e8e5de] bg-white/60 backdrop-blur-md px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#1a1a1a] tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                Workers
              </h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#faf9f6] border border-[#e8e5de] rounded-full">
                <span className="text-xs font-semibold text-[#1a1a1a] tabular-nums">{templates?.length ?? 0}</span>
                <span className="text-[11px] text-[#9c9590]">templates</span>
                <span className="w-px h-3 bg-[#e8e5de]" />
                <span className={cn(
                  "text-xs font-semibold tabular-nums",
                  activeWorkers.length > 0 ? "text-green-600" : "text-[#1a1a1a]"
                )}>{activeWorkers.length}</span>
                <span className="text-[11px] text-[#9c9590]">active</span>
              </div>
            </div>
            <p className="text-[13px] text-[#6b6560] mt-1">
              Specialist agents deployed on-demand for each task
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">

        {/* ─── TEMPLATE GALLERY ─── */}
        <section>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-6 h-6 rounded-md bg-[#1a1a1a] flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="text-[15px] font-bold text-[#1a1a1a] tracking-tight">Template Gallery</h2>
            <span className="text-[11px] text-[#9c9590] ml-1">Deployable worker types</span>
          </div>

          {!templates ? (
            <SkeletonList count={3} />
          ) : templates.length === 0 ? (
            <div className="border-2 border-dashed border-[#e8e5de] rounded-2xl p-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#f0ede6] flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-[#9c9590]" />
              </div>
              <p className="text-[15px] font-medium text-[#1a1a1a]">No templates configured</p>
              <p className="text-[13px] text-[#9c9590] mt-1">Run the seed script to populate worker templates</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {templates.map((template) => {
                const accent = templateAccents[template.name] ?? defaultAccent;
                const activeCount = activeWorkers.filter((w) => w.templateId === template._id).length;
                return (
                  <div
                    key={template._id}
                    className={cn(
                      "group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden",
                      activeCount > 0
                        ? `${accent.border} shadow-sm`
                        : "border-[#e8e5de] hover:border-[#d4d0ca] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
                    )}
                  >
                    {/* Top accent line */}
                    <div className={cn("h-1 w-full", accent.dot)} />

                    <div className="p-5">
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            accent.bg
                          )}>
                            <span className={accent.text}>
                              {typeIcons[template.taskTypes[0]] ?? <Zap className="w-4 h-4" />}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-[15px] font-bold text-[#1a1a1a] tracking-tight">
                              {template.displayName}
                            </h3>
                            <p className="text-[12px] text-[#6b6560] leading-snug mt-0.5 max-w-[200px]">
                              {template.role}
                            </p>
                          </div>
                        </div>
                        {activeCount > 0 && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 border border-green-200 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-semibold text-green-700">{activeCount} active</span>
                          </div>
                        )}
                      </div>

                      {/* Task Types */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {template.taskTypes.map((tt) => (
                          <span
                            key={tt}
                            className={cn(
                              "inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium",
                              accent.bg, accent.text
                            )}
                          >
                            {typeIcons[tt]}
                            {tt}
                          </span>
                        ))}
                      </div>

                      {/* Skills */}
                      <div className="mb-4">
                        <p className="text-[10px] font-semibold text-[#9c9590] uppercase tracking-wider mb-1.5">Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {template.skills.map((skill) => (
                            <span
                              key={skill}
                              className="text-[11px] px-2 py-0.5 bg-[#faf9f6] border border-[#e8e5de] text-[#4a4540] rounded-md"
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer stats */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#f0ede6]">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#6b6560]">
                          <Cpu className="w-3 h-3 text-[#9c9590]" />
                          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{template.model}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-[#9c9590]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          <span>review/{template.reviewEvery}steps</span>
                          <span className="w-px h-3 bg-[#e8e5de]" />
                          <span>×{template.maxParallel} max</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ─── ACTIVE WORKERS ─── */}
        <section>
          <div className="flex items-center gap-2.5 mb-4">
            <div className={cn(
              "w-6 h-6 rounded-md flex items-center justify-center",
              activeWorkers.length > 0 ? "bg-green-600" : "bg-[#9c9590]"
            )}>
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="text-[15px] font-bold text-[#1a1a1a] tracking-tight">Active Workers</h2>
            {activeWorkers.length > 0 && (
              <span className="text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                {activeWorkers.length} running
              </span>
            )}
          </div>

          {!workers ? (
            <SkeletonList count={2} />
          ) : activeWorkers.length === 0 ? (
            <div className="border-2 border-dashed border-[#e8e5de] rounded-2xl p-10 text-center">
              <div className="flex justify-center gap-2 mb-4">
                {(templates ?? []).slice(0, 4).map((t) => {
                  const ac = templateAccents[t.name] ?? defaultAccent;
                  return (
                    <div key={t._id} className={cn("w-8 h-8 rounded-lg flex items-center justify-center opacity-40", ac.bg)}>
                      <span className={ac.text}>{typeIcons[t.taskTypes[0]] ?? <Zap className="w-3.5 h-3.5" />}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[15px] font-medium text-[#1a1a1a]">All workers standing by</p>
              <p className="text-[13px] text-[#9c9590] mt-1">
                Workers spawn automatically when tasks are dispatched
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeWorkers.map((worker) => {
                const elapsed = Date.now() - worker.spawnedAt;
                const templateKey = getTemplateKey(worker.templateId);
                const accent = templateAccents[templateKey] ?? defaultAccent;
                const st = workerStatusStyles[worker.status] ?? workerStatusStyles.active;
                return (
                  <div
                    key={worker._id}
                    className={cn(
                      "bg-white border rounded-xl px-5 py-4 flex items-center gap-4 transition-all hover:shadow-sm",
                      accent.border
                    )}
                  >
                    {/* Status dot + type icon */}
                    <div className="relative flex-shrink-0">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", accent.bg)}>
                        <span className={accent.text}>
                          {typeIcons[templates?.find(t => t._id === worker.templateId)?.taskTypes[0] ?? ""] ?? <Zap className="w-4 h-4" />}
                        </span>
                      </div>
                      <span className={cn(
                        "absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                        st.dot
                      )} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-semibold text-[#1a1a1a]">
                          {getTemplateName(worker.templateId)}
                        </span>
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-medium",
                          worker.status === "active" ? "bg-green-50 text-green-700 border border-green-200" :
                          worker.status === "spawning" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                          "bg-[#f0ede6] text-[#6b6560] border border-[#e8e5de]"
                        )}>
                          {st.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-[#6b6560] mt-0.5">
                        <ChevronRight className="w-3 h-3 text-[#9c9590]" />
                        <span className="truncate">{getTaskTitle(worker.taskId)}</span>
                      </div>
                    </div>

                    {/* Model */}
                    <div className="flex items-center gap-1.5 text-[11px] text-[#9c9590] flex-shrink-0"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      <Cpu className="w-3 h-3" />
                      {worker.model}
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-1.5 text-[11px] text-[#9c9590] flex-shrink-0 tabular-nums"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      <Clock className="w-3 h-3" />
                      {formatElapsed(elapsed)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
