"use client";

import { cn } from "@/lib/utils";

type Status = "online" | "offline" | "busy" | "standby" | "pending" | "assigned" | "running" | "completed" | "failed";

const statusConfig: Record<Status, { class: string; pulse?: boolean }> = {
  online: { class: "status-online", pulse: true },
  standby: { class: "status-standby" },
  offline: { class: "status-offline" },
  busy: { class: "status-working", pulse: true },
  pending: { class: "status-standby" },
  assigned: { class: "status-working" },
  running: { class: "status-working", pulse: true },
  completed: { class: "status-online" },
  failed: { class: "status-offline" },
};

interface StatusBadgeProps {
  status: Status;
  showLabel?: boolean;
  className?: string;
}

export function StatusBadge({ status, showLabel = true, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.standby;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs uppercase font-medium",
        config.class,
        config.pulse && "animate-pulse-soft",
        className
      )}
    >
      {showLabel && status}
    </span>
  );
}

interface StatusDotProps {
  status: Status;
  className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
  const colors: Record<Status, string> = {
    online: "bg-mc-accent-green",
    standby: "bg-mc-text-secondary",
    offline: "bg-mc-accent-red",
    busy: "bg-mc-accent-yellow",
    pending: "bg-mc-text-secondary",
    assigned: "bg-mc-accent-yellow",
    running: "bg-mc-accent-yellow",
    completed: "bg-mc-accent-green",
    failed: "bg-mc-accent-red",
  };

  const isPulsing = ["online", "busy", "running"].includes(status);

  return (
    <span className={cn("relative flex h-2.5 w-2.5", className)}>
      {isPulsing && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            colors[status]
          )}
        />
      )}
      <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", colors[status])} />
    </span>
  );
}
