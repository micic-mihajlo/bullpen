"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useStableData } from "@/lib/hooks";
import { SkeletonList } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import {
  Wrench,
  Cpu,
  Cog,
  Activity,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const taskTypeColors: Record<string, string> = {
  coding: "bg-blue-100 text-blue-700",
  automation: "bg-purple-100 text-purple-700",
  research: "bg-emerald-100 text-emerald-700",
  design: "bg-pink-100 text-pink-700",
  review: "bg-amber-100 text-amber-700",
  general: "bg-[#f0ede6] text-[#6b6560]",
};

const workerStatusColors: Record<string, string> = {
  spawning: "bg-blue-500",
  active: "bg-green-500 animate-pulse",
  paused: "bg-amber-400",
  completed: "bg-gray-300",
  failed: "bg-red-400",
};

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;
  return `${hours}h ${remainMinutes}m`;
}

export default function WorkersPage() {
  const templates = useStableData(useQuery(api.workerTemplates.list));
  const workers = useStableData(useQuery(api.workers.list, {}));
  const tasks = useStableData(useQuery(api.tasks.list));

  const activeWorkers = workers?.filter((w) => w.status === "spawning" || w.status === "active" || w.status === "paused") ?? [];

  const getTaskTitle = (taskId: string) => {
    return tasks?.find((t) => t._id === taskId)?.title ?? "Unknown task";
  };

  const getTemplateName = (templateId: string) => {
    return templates?.find((t) => t._id === templateId)?.displayName ?? "Unknown";
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-[#e8e5de] bg-white/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1a1a1a]" style={{ fontFamily: 'Inter, sans-serif' }}>Workers</h1>
            <p className="text-[12px] text-[#9c9590] mt-0.5">
              {templates?.length ?? 0} templates · {activeWorkers.length} active
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Worker Templates Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Cog className="w-4 h-4 text-[#9c9590]" />
            <h2 className="text-sm font-semibold text-[#1a1a1a]">Worker Templates</h2>
          </div>

          {!templates ? (
            <SkeletonList count={3} />
          ) : templates.length === 0 ? (
            <EmptyState
              icon={<Wrench className="w-10 h-10" />}
              title="No worker templates"
              description="Seed templates to get started"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template._id}
                  className="bg-white border border-[#e8e5de] rounded-xl p-4 hover:border-[#c2410c]/20 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-[15px] font-semibold text-[#1a1a1a]">{template.displayName}</h3>
                      <p className="text-[12px] text-[#6b6560] mt-0.5">{template.role}</p>
                    </div>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider",
                      template.status === "active" ? "bg-green-50 text-green-700" : "bg-[#f0ede6] text-[#9c9590]"
                    )}>
                      {template.status}
                    </span>
                  </div>

                  {/* Model */}
                  <div className="flex items-center gap-1.5 mb-3 text-[11px] text-[#6b6560] font-mono">
                    <Cpu className="w-3 h-3" />
                    {template.model}
                  </div>

                  {/* Task Types */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.taskTypes.map((tt) => (
                      <span
                        key={tt}
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-medium",
                          taskTypeColors[tt] ?? taskTypeColors.general
                        )}
                      >
                        {tt}
                      </span>
                    ))}
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] px-1.5 py-0.5 bg-[#f0ede6] text-[#6b6560] rounded font-mono"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Footer: tools + config */}
                  <div className="flex items-center justify-between text-[10px] text-[#9c9590] font-mono border-t border-[#f0ede6] pt-2.5 mt-1">
                    <div className="flex items-center gap-2">
                      <span>tools: {template.tools.join(", ")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>review/{template.reviewEvery}</span>
                      <span>max:{template.maxParallel}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active Workers Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-[#9c9590]" />
            <h2 className="text-sm font-semibold text-[#1a1a1a]">Active Workers</h2>
            {activeWorkers.length > 0 && (
              <span className="text-[10px] bg-[#c2410c] text-white px-2 py-0.5 rounded-full font-medium">
                {activeWorkers.length}
              </span>
            )}
          </div>

          {!workers ? (
            <SkeletonList count={2} />
          ) : activeWorkers.length === 0 ? (
            <div className="bg-white border border-[#e8e5de] rounded-xl p-8 text-center">
              <p className="text-[14px] text-[#6b6560]">No active workers</p>
              <p className="text-[12px] text-[#9c9590] mt-1">Workers are spawned when tasks are dispatched</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeWorkers.map((worker) => {
                const elapsed = Date.now() - worker.spawnedAt;
                return (
                  <div
                    key={worker._id}
                    className="bg-white border border-[#e8e5de] rounded-lg px-4 py-3 flex items-center gap-4"
                  >
                    {/* Status dot */}
                    <span className={cn(
                      "w-2.5 h-2.5 rounded-full flex-shrink-0",
                      workerStatusColors[worker.status] ?? "bg-gray-300"
                    )} />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium text-[#1a1a1a]">
                          {getTemplateName(worker.templateId)}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-[#f0ede6] text-[#6b6560] rounded font-mono uppercase">
                          {worker.status}
                        </span>
                      </div>
                      <div className="text-[12px] text-[#6b6560] truncate mt-0.5">
                        {getTaskTitle(worker.taskId)}
                      </div>
                    </div>

                    {/* Model */}
                    <div className="flex items-center gap-1 text-[11px] text-[#9c9590] font-mono flex-shrink-0">
                      <Cpu className="w-3 h-3" />
                      {worker.model}
                    </div>

                    {/* Time running */}
                    <div className="flex items-center gap-1 text-[11px] text-[#9c9590] font-mono flex-shrink-0">
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
