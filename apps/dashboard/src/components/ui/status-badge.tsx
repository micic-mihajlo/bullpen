"use client";

import { cn } from "@/lib/utils";

type Status = "online" | "offline" | "busy" | "standby" | "pending" | "assigned" | "running" | "completed" | "failed";

const statusConfig: Record<Status, { bg: string; text: string; pulse?: boolean }> = {
  online: { bg: "bg-green-50", text: "text-green-700", pulse: true },
  standby: { bg: "bg-amber-50", text: "text-amber-700" },
  offline: { bg: "bg-gray-100", text: "text-gray-500" },
  busy: { bg: "bg-amber-50", text: "text-amber-700", pulse: true },
  pending: { bg: "bg-gray-100", text: "text-gray-600" },
  assigned: { bg: "bg-blue-50", text: "text-blue-700" },
  running: { bg: "bg-amber-50", text: "text-amber-700", pulse: true },
  completed: { bg: "bg-green-50", text: "text-green-700" },
  failed: { bg: "bg-red-50", text: "text-red-700" },
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
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize",
        config.bg,
        config.text,
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
    online: "bg-green-500",
    standby: "bg-gray-400",
    offline: "bg-red-400",
    busy: "bg-amber-500",
    pending: "bg-gray-400",
    assigned: "bg-blue-500",
    running: "bg-amber-500",
    completed: "bg-green-500",
    failed: "bg-red-500",
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
