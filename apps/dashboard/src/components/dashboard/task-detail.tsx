"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

interface Agent {
  _id: string;
  name: string;
  avatar?: string;
  status: string;
}

interface Task {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  status: "pending" | "assigned" | "running" | "review" | "completed" | "failed";
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
  pending: { label: "Pending", color: "text-[#888]" },
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
  const [editingResult, setEditingResult] = useState(false);
  const [resultText, setResultText] = useState(task?.result || "");
  const [saving, setSaving] = useState(false);

  if (!task) return null;

  const status = statusLabel[task.status];
  const hasTaskError = Boolean(task.error) || task.status === "failed";

  useEffect(() => {
    setEditingResult(false);
    setResultText(task.result || "");
  }, [task._id, task.result]);

  const handleSaveResult = async () => {
    setSaving(true);
    try {
      await fetch(`/api/tasks/${task._id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result: resultText }),
      });
      setEditingResult(false);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-mc-bg-secondary border border-mc-border rounded-lg w-full max-w-lg max-h-[80vh] flex flex-col shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0ede6] bg-white">
          <div className="text-[13px] font-semibold text-[#1a1a1a] flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("text-[10px] font-semibold uppercase font-mono-jb tracking-wide", status.color)}>{status.label}</span>
              {task.priority && <span className="text-[10px] text-[#666] font-mono-jb">P{task.priority}</span>}
            </div>
            <h2 className="text-sm font-medium leading-snug text-[#ddd]">{task.title}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded flex-shrink-0 ml-auto transition-colors">
            <X className="w-4 h-4 text-[#666]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {task.description && (
            <div>
              <div className="text-[10px] text-mc-text-secondary uppercase mb-1 font-mono-jb tracking-wider">Description</div>
              <p className="text-sm text-mc-text">{task.description}</p>
            </div>
          )}

          {task.agent && (
            <div>
              <div className="text-[10px] text-mc-text-secondary uppercase mb-1 font-mono-jb tracking-wider">Assigned to</div>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-mc-bg-tertiary rounded text-sm text-mc-text">
                <span>{task.agent.avatar || "🤖"}</span>
                <span>{task.agent.name}</span>
              </div>
            </div>
          )}

          <div>
            <div className="text-[10px] text-mc-text-secondary uppercase mb-1 font-mono-jb tracking-wider">Timeline</div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-mc-text-secondary text-xs">Created</span>
                <span className="text-mc-text font-mono-jb text-[10px]">{formatTime(task.createdAt)}</span>
              </div>
              {task.startedAt && (
                <div className="flex justify-between">
                  <span className="text-mc-text-secondary text-xs">Started</span>
                  <span className="text-mc-text font-mono-jb text-[10px]">{formatTime(task.startedAt)}</span>
                </div>
              )}
              {task.completedAt && (
                <div className="flex justify-between">
                  <span className="text-mc-text-secondary text-xs">Completed</span>
                  <span className="text-mc-text font-mono-jb text-[10px]">
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

          {/* Output section - editable for running tasks */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] text-mc-text-secondary uppercase font-mono-jb tracking-wider">Output</div>
              {(task.status === "running" || task.status === "assigned") && !editingResult && (
                <button
                  onClick={() => { setResultText(task.result || ""); setEditingResult(true); }}
                  className="text-[10px] text-mc-accent hover:underline font-mono-jb"
                >
                  Add result
                </button>
              )}
            </div>
            {editingResult ? (
              <div className="space-y-2">
                <textarea
                  value={resultText}
                  onChange={(e) => setResultText(e.target.value)}
                  placeholder="Paste the task output here..."
                  rows={8}
                  className="w-full p-3 bg-mc-bg border border-mc-border rounded text-sm font-mono-jb text-mc-text focus:outline-none focus:border-mc-accent resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingResult(false)}
                    className="px-3 py-1 text-xs text-mc-text-secondary hover:text-mc-text transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveResult}
                    disabled={saving}
                    className="px-3 py-1 text-xs bg-mc-accent-green text-white rounded hover:bg-mc-accent-green/90 disabled:opacity-50 font-mono-jb uppercase tracking-wider"
                  >
                    {saving ? "Saving..." : "Save & Complete"}
                  </button>
                </div>
              </div>
            ) : task.result ? (
              <pre className="p-3 bg-mc-bg border border-mc-border rounded text-xs whitespace-pre-wrap break-words overflow-x-auto max-h-64 overflow-y-auto font-mono-jb">
                <code className={cn("block font-mono-jb", hasTaskError ? "text-mc-accent-red" : "text-mc-text")}>
                  {task.result}
                </code>
              </pre>
            ) : (
              <div className="p-3 bg-mc-bg-tertiary rounded text-[10px] text-mc-muted italic font-mono-jb">
                No output yet
              </div>
            )}
          </div>

          {task.error && (
            <div>
              <div className="text-[10px] text-mc-accent-red uppercase mb-1 font-mono-jb tracking-wider">Error</div>
              <pre className="p-3 bg-mc-accent-red/10 border border-mc-accent-red/30 rounded text-xs text-mc-accent-red whitespace-pre-wrap break-words font-mono-jb">
                {task.error}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
