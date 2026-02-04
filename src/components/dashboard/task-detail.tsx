"use client";

import { cn } from "@/lib/utils";
import { X, Clock, User, CheckCircle, AlertCircle, Play, Inbox } from "lucide-react";
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

const statusConfig = {
  pending: { icon: Inbox, color: "text-mc-text-secondary", bg: "bg-mc-bg-tertiary", label: "Pending" },
  assigned: { icon: User, color: "text-mc-accent-yellow", bg: "bg-mc-accent-yellow/10", label: "Assigned" },
  running: { icon: Play, color: "text-mc-accent", bg: "bg-mc-accent/10", label: "Running" },
  completed: { icon: CheckCircle, color: "text-mc-accent-green", bg: "bg-mc-accent-green/10", label: "Completed" },
  failed: { icon: AlertCircle, color: "text-mc-accent-red", bg: "bg-mc-accent-red/10", label: "Failed" },
};

export function TaskDetail({ task, onClose }: TaskDetailProps) {
  if (!task) return null;

  const config = statusConfig[task.status];
  const StatusIcon = config.icon;

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleString();
  };

  const formatDuration = (start: number, end: number) => {
    const ms = end - start;
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-mc-bg-secondary border border-mc-border rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-mc-border flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("p-1 rounded", config.bg)}>
                <StatusIcon className={cn("w-4 h-4", config.color)} />
              </span>
              <span className={cn("text-xs font-medium uppercase", config.color)}>
                {config.label}
              </span>
              {task.priority && (
                <span className="text-xs text-mc-text-secondary">
                  Priority {task.priority}/5
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold">{task.title}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-mc-bg-tertiary rounded transition-colors">
            <X className="w-5 h-5 text-mc-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-xs font-medium text-mc-text-secondary uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-sm text-mc-text">{task.description}</p>
            </div>
          )}

          {/* Agent */}
          {task.agent && (
            <div>
              <h3 className="text-xs font-medium text-mc-text-secondary uppercase tracking-wider mb-2">
                Assigned To
              </h3>
              <div className="flex items-center gap-2 p-2 bg-mc-bg rounded-lg border border-mc-border inline-flex">
                <span className="text-xl">{task.agent.avatar || "🤖"}</span>
                <span className="font-medium text-sm">{task.agent.name}</span>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="text-xs font-medium text-mc-text-secondary uppercase tracking-wider mb-2">
              Timeline
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-mc-text-secondary" />
                <span className="text-mc-text-secondary">Created:</span>
                <span>{formatTime(task.createdAt)}</span>
              </div>
              {task.startedAt && (
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-mc-accent-yellow" />
                  <span className="text-mc-text-secondary">Started:</span>
                  <span>{formatTime(task.startedAt)}</span>
                </div>
              )}
              {task.completedAt && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-mc-accent-green" />
                  <span className="text-mc-text-secondary">Completed:</span>
                  <span>{formatTime(task.completedAt)}</span>
                  {task.startedAt && (
                    <span className="text-mc-accent-green text-xs">
                      ({formatDuration(task.startedAt, task.completedAt)})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Result */}
          {task.result && (
            <div>
              <h3 className="text-xs font-medium text-mc-text-secondary uppercase tracking-wider mb-2">
                Output
              </h3>
              <div className="p-4 bg-mc-bg rounded-lg border border-mc-border">
                <pre className="text-sm whitespace-pre-wrap break-words font-mono text-mc-text">
                  {task.result}
                </pre>
              </div>
            </div>
          )}

          {/* Error */}
          {task.error && (
            <div>
              <h3 className="text-xs font-medium text-mc-accent-red uppercase tracking-wider mb-2">
                Error
              </h3>
              <div className="p-4 bg-mc-accent-red/10 rounded-lg border border-mc-accent-red/30">
                <pre className="text-sm whitespace-pre-wrap break-words font-mono text-mc-accent-red">
                  {task.error}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
