"use client";

import { cn } from "@/lib/utils";

type Status = "online" | "offline" | "busy" | "pending" | "running" | "completed" | "failed" | "assigned";

const statusConfig: Record<Status, { color: string; pulse?: boolean; label?: string }> = {
  online: { color: "bg-emerald-500", pulse: true },
  offline: { color: "bg-zinc-500" },
  busy: { color: "bg-amber-500", pulse: true },
  pending: { color: "bg-zinc-500" },
  assigned: { color: "bg-cyan-500" },
  running: { color: "bg-amber-500", pulse: true },
  completed: { color: "bg-emerald-500" },
  failed: { color: "bg-red-500" },
};

interface StatusBadgeProps {
  status: Status;
  showLabel?: boolean;
  className?: string;
}

export function StatusBadge({ status, showLabel = false, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.offline;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="relative flex h-2.5 w-2.5">
        {config.pulse && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              config.color
            )}
          />
        )}
        <span
          className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", config.color)}
        />
      </span>
      {showLabel && (
        <span className="text-xs text-zinc-400 capitalize">{status}</span>
      )}
    </div>
  );
}
