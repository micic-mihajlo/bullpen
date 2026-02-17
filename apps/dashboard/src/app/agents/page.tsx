"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useStableData, useNow } from "@/lib/hooks";
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
  Zap,
  ChevronRight,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, React.ReactNode> = {
  coding: <Code2 className="w-3.5 h-3.5" />,
  automation: <GitBranch className="w-3.5 h-3.5" />,
  research: <Search className="w-3.5 h-3.5" />,
  design: <Palette className="w-3.5 h-3.5" />,
  review: <FileCheck2 className="w-3.5 h-3.5" />,
};

const workerStatusStyles: Record<string, { dot: string; label: string }> = {
  spawning: { dot: "bg-[#c2410c] animate-pulse", label: "Spawning" },
  active: { dot: "bg-green-600 animate-pulse", label: "Working" },
  paused: { dot: "bg-[#9c9590]", label: "Paused" },
  completed: { dot: "bg-[#d4d0ca]", label: "Done" },
  failed: { dot: "bg-red-500", label: "Failed" },
};

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h${minutes % 60}m`;
}

export default function WorkersPage() {
  const now = useNow();
  const templates = useStableData(useQuery(api.workerTemplates.list));
  const workers = useStableData(useQuery(api.workers.list, {}));
  const tasks = useStableData(useQuery(api.tasks.list));

  const activeWorkers = workers?.filter((w) => w.status === "spawning" || w.status === "active" || w.status === "paused") ?? [];

  const getTaskTitle = (taskId: string) => tasks?.find((t) => t._id === taskId)?.title ?? "Unknown task";
  const getTemplateName = (templateId: string) => templates?.find((t) => t._id === templateId)?.displayName ?? "Unknown";

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-[#e8e5de] bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1a1a1a] tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
              Workers
            </h1>
            <p className="text-[13px] text-[#6b6560] mt-0.5">
              {templates?.length ?? 0} templates · {activeWorkers.length} active
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">

        {/* ─── TEMPLATE GALLERY ─── */}
        <section className="animate-section-enter stagger-1">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-[#9c9590]" />
            <h2 className="text-sm font-semibold text-[#1a1a1a]">Template Gallery</h2>
          </div>

          {!templates ? (
            <SkeletonList count={3} />
          ) : templates.length === 0 ? (
            <div className="border border-dashed border-[#d4d0ca] rounded-lg p-10 text-center">
              <p className="text-sm font-medium text-[#1a1a1a]">No templates configured</p>
              <p className="text-[13px] text-[#9c9590] mt-1">Run the seed script to populate worker templates</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {templates.map((template) => {
                const activeCount = activeWorkers.filter((w) => w.templateId === template._id).length;
                return (
                  <div
                    key={template._id}
                    className={cn(
                      "bg-white rounded-lg border transition-all duration-150",
                      activeCount > 0
                        ? "border-[#c2410c]/30 shadow-sm"
                        : "border-[#e8e5de] hover:border-[#d4d0ca]"
                    )}
                  >
                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#faf9f6] border border-[#e8e5de] flex items-center justify-center text-[#6b6560] flex-shrink-0">
                            {typeIcons[template.taskTypes[0]] ?? <Zap className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <h3 className="text-[14px] font-semibold text-[#1a1a1a]">{template.displayName}</h3>
                            <p className="text-[12px] text-[#6b6560] leading-snug mt-0.5">{template.role}</p>
                          </div>
                        </div>
                        {activeCount > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-[#c2410c]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c] animate-pulse" />
                            {activeCount}
                          </span>
                        )}
                      </div>

                      {/* Task Types */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {template.taskTypes.map((tt) => (
                          <span
                            key={tt}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-[#faf9f6] border border-[#e8e5de] text-[#6b6560] font-medium"
                          >
                            {typeIcons[tt]}
                            {tt}
                          </span>
                        ))}
                      </div>

                      {/* Skills */}
                      <div className="mb-3">
                        <p className="text-[10px] font-medium text-[#9c9590] uppercase tracking-wider mb-1.5">Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {template.skills.map((skill) => (
                            <span
                              key={skill}
                              className="text-[11px] px-1.5 py-0.5 bg-[#f5f3ee] text-[#4a4540] rounded"
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#f0ede6] text-[11px] text-[#9c9590]"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        <div className="flex items-center gap-1">
                          <Cpu className="w-3 h-3" />
                          {template.model}
                        </div>
                        <div className="flex items-center gap-2">
                          <span>review/{template.reviewEvery}</span>
                          <span>×{template.maxParallel}</span>
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
        <section className="animate-section-enter stagger-2">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[#9c9590]" />
            <h2 className="text-sm font-semibold text-[#1a1a1a]">Active Workers</h2>
            {activeWorkers.length > 0 && (
              <span className="text-[10px] font-medium text-white bg-[#c2410c] px-1.5 py-0.5 rounded">
                {activeWorkers.length}
              </span>
            )}
          </div>

          {!workers ? (
            <SkeletonList count={2} />
          ) : activeWorkers.length === 0 ? (
            <div className="border border-dashed border-[#d4d0ca] rounded-lg p-8 text-center">
              <p className="text-sm font-medium text-[#1a1a1a]">All workers standing by</p>
              <p className="text-[13px] text-[#9c9590] mt-1">Workers spawn automatically when tasks are dispatched</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeWorkers.map((worker) => {
                const elapsed = now - worker.spawnedAt;
                const st = workerStatusStyles[worker.status] ?? workerStatusStyles.active;
                return (
                  <div
                    key={worker._id}
                    className="bg-white border border-[#e8e5de] rounded-lg px-5 py-3.5 flex items-center gap-4"
                  >
                    {/* Status */}
                    <span className={cn("w-2 h-2 rounded-full flex-shrink-0", st.dot)} />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium text-[#1a1a1a]">
                          {getTemplateName(worker.templateId)}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-[#f5f3ee] text-[#6b6560] rounded font-medium">
                          {st.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[12px] text-[#6b6560] mt-0.5">
                        <ChevronRight className="w-3 h-3 text-[#9c9590]" />
                        <span className="truncate">{getTaskTitle(worker.taskId)}</span>
                      </div>
                    </div>

                    {/* Model */}
                    <div className="flex items-center gap-1 text-[11px] text-[#9c9590] flex-shrink-0"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      <Cpu className="w-3 h-3" />
                      {worker.model}
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-1 text-[11px] text-[#9c9590] flex-shrink-0 tabular-nums"
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
