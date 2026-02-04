"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

interface Agent {
  _id: Id<"agents">;
  name: string;
  avatar?: string;
  status: string;
}

interface Task {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  status: "pending" | "assigned" | "running" | "completed" | "failed";
  priority?: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  result?: string;
  error?: string;
  agent?: Agent;
}

interface TaskDetailProps {
  task: Task | null;
  onClose: () => void;
}

const statusLabel: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "text-mc-text-secondary" },
  assigned: { label: "Assigned", color: "text-mc-accent-yellow" },
  running: { label: "Running", color: "text-mc-accent" },
  completed: { label: "Completed", color: "text-mc-accent-green" },
  failed: { label: "Failed", color: "text-mc-accent-red" },
};

function formatTime(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

function formatDuration(start: number, end: number) {
  const ms = end - start;
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export function TaskDetail({ task, onClose }: TaskDetailProps) {
  if (!task) return null;

  const status = statusLabel[task.status];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-mc-bg-secondary border border-mc-border rounded-lg w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3 border-b border-mc-border flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("text-xs font-medium uppercase", status.color)}>{status.label}</span>
              {task.priority && <span className="text-xs text-mc-text-secondary">P{task.priority}</span>}
            </div>
            <h2 className="text-sm font-medium leading-snug">{task.title}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-mc-bg-tertiary rounded flex-shrink-0">
            <X className="w-4 h-4 text-mc-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {task.description && (
            <div>
              <div className="text-xs text-mc-text-secondary uppercase mb-1">Description</div>
              <p className="text-sm">{task.description}</p>
            </div>
          )}

          {task.agent && (
            <div>
              <div className="text-xs text-mc-text-secondary uppercase mb-1">Assigned to</div>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-mc-bg rounded text-sm">
                <span>{task.agent.avatar || "🤖"}</span>
                <span>{task.agent.name}</span>
              </div>
            </div>
          )}

          <div>
            <div className="text-xs text-mc-text-secondary uppercase mb-1">Timeline</div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-mc-text-secondary">Created</span>
                <span>{formatTime(task.createdAt)}</span>
              </div>
              {task.startedAt && (
                <div className="flex justify-between">
                  <span className="text-mc-text-secondary">Started</span>
                  <span>{formatTime(task.startedAt)}</span>
                </div>
              )}
              {task.completedAt && (
                <div className="flex justify-between">
                  <span className="text-mc-text-secondary">Completed</span>
                  <span>
                    {formatTime(task.completedAt)}
                    {task.startedAt && (
                      <span className="text-mc-accent-green ml-2">
                        ({formatDuration(task.startedAt, task.completedAt)})
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {task.result && (
            <div>
              <div className="text-xs text-mc-text-secondary uppercase mb-1">Output</div>
              <pre className="p-3 bg-mc-bg rounded text-xs whitespace-pre-wrap break-words overflow-x-auto max-h-64 overflow-y-auto">
                {task.result}
              </pre>
            </div>
          )}

          {task.error && (
            <div>
              <div className="text-xs text-mc-accent-red uppercase mb-1">Error</div>
              <pre className="p-3 bg-mc-accent-red/10 border border-mc-accent-red/30 rounded text-xs text-mc-accent-red whitespace-pre-wrap break-words">
                {task.error}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
