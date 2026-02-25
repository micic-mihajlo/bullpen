"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";
import { Plus, Send } from "lucide-react";
import { TaskDetail } from "./task-detail";
import { Id } from "../../../convex/_generated/dataModel";
import { useStableData } from "@/lib/hooks";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/toast";
import { useRegisterShortcut } from "@/components/shortcuts-provider";

type Task = {
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
  agent?: { _id: string; name: string; avatar?: string; status: string };
};

type TaskStatus = "pending" | "assigned" | "running" | "completed" | "failed";

const columns: { status: TaskStatus; label: string; cls: string }[] = [
  { status: "pending", label: "Inbox", cls: "column-pending" },
  { status: "running", label: "In Progress", cls: "column-running" },
  { status: "completed", label: "Done", cls: "column-completed" },
  { status: "failed", label: "Failed", cls: "column-failed" },
];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function TaskBoard() {
  const tasks = useStableData(useQuery(api.tasks.list));
  const agents = useStableData(useQuery(api.workerTemplates.list));
  const createTask = useMutation(api.tasks.create);
  const assignTask = useMutation(api.tasks.assign);
  const startTask = useMutation(api.tasks.start);
  const completeTask = useMutation(api.tasks.complete);

  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const { addToast } = useToast();

  // Register keyboard shortcut for new task
  const openModal = useCallback(() => setShowModal(true), []);
  useRegisterShortcut("newTask", openModal);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsCreating(true);
    try {
      await createTask({ title: newTitle.trim(), description: newDesc.trim() || undefined });
      addToast("Task created", "success");
      setNewTitle("");
      setNewDesc("");
      setShowModal(false);
    } catch {
      addToast("Failed to create task", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDispatch = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDispatchingId(taskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}/dispatch`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        addToast(`Task dispatched (${data.model?.split("/")[1] || "agent"})`, "success");
      } else {
        addToast(data.error || "Failed to dispatch task", "error");
      }
    } catch {
      addToast("Network error dispatching task", "error");
    } finally {
      setDispatchingId(null);
    }
  };

  const getByStatus = (status: TaskStatus) => {
    if (!tasks) return [];
    if (status === "pending") return tasks.filter((t) => t.status === "pending" || t.status === "assigned");
    return tasks.filter((t) => t.status === status);
  };

  const onlineAgents = agents?.filter((a) => a.status === "active") ?? [];

  return (
    <>
      <div className="h-full flex flex-col bg-mc-bg-secondary border border-mc-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-2.5 border-b border-mc-border flex items-center justify-between">
          <span className="text-[10px] font-semibold text-mc-text-secondary uppercase tracking-wider font-mono-jb">
            Tasks ({tasks?.length ?? 0})
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] bg-mc-accent text-white rounded hover:bg-mc-accent-hover font-mono-jb uppercase tracking-wider transition-colors"
          >
            <Plus className="w-3 h-3" />
            New
          </button>
        </div>

        {/* Columns */}
        <div className="flex-1 overflow-hidden p-2.5">
          <div className="grid grid-cols-4 gap-2 h-full">
            {columns.map((col) => (
              <div key={col.status} className={cn("flex flex-col rounded bg-mc-bg/50 overflow-hidden", col.cls)}>
                <div className="px-2.5 py-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-mc-text-secondary uppercase tracking-wide font-mono-jb">{col.label}</span>
                  <span className="text-[10px] text-mc-text-secondary/60 font-mono-jb">{getByStatus(col.status).length}</span>
                </div>
                <div className="flex-1 overflow-y-auto px-1.5 pb-1.5 space-y-1.5">
                  {getByStatus(col.status).map((task) => (
                    <div
                      key={task._id}
                      onClick={() => setSelectedTask(task as Task)}
                      className="p-2.5 rounded bg-mc-bg-secondary border border-mc-border hover:border-mc-accent/30 cursor-pointer group transition-colors"
                    >
                      <p className="text-sm font-medium mb-1 line-clamp-2 text-mc-text">{task.title}</p>
                      <div className="flex items-center justify-between text-[10px] text-mc-text-secondary font-mono-jb">
                        <span>{timeAgo(task.createdAt)}</span>
                        {task.result && <span className="text-mc-accent-green font-semibold">✓</span>}
                      </div>

                      {/* Assign dropdown on pending */}
                      {(task.status === "pending" || task.status === "assigned") && onlineAgents.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-mc-border opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex flex-wrap gap-1 mb-1.5">
                            {onlineAgents.slice(0, 3).map((a) => (
                              <button
                                key={a._id}
                                onClick={(e) => { e.stopPropagation(); assignTask({ taskId: task._id, agentId: a._id }); }}
                                className="px-1.5 py-0.5 text-[10px] bg-mc-bg rounded hover:bg-mc-bg-tertiary font-mono-jb transition-colors"
                              >
                                {a.displayName}
                              </button>
                            ))}
                          </div>
                          {task.status === "assigned" && (
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); startTask({ id: task._id }); }}
                                className="flex-1 px-2 py-1 text-[10px] bg-mc-accent-yellow/20 text-mc-accent-yellow rounded hover:bg-mc-accent-yellow/30 font-mono-jb font-semibold uppercase tracking-wide transition-colors"
                              >
                                Start
                              </button>
                              <button
                                onClick={(e) => handleDispatch(task._id, e)}
                                disabled={dispatchingId === task._id}
                                className="flex-1 px-2 py-1 text-[10px] bg-mc-accent/20 text-mc-accent rounded hover:bg-mc-accent/30 flex items-center justify-center gap-1 disabled:opacity-50 font-mono-jb font-semibold uppercase tracking-wide transition-colors"
                              >
                                <Send className="w-3 h-3" />
                                {dispatchingId === task._id ? "..." : "Dispatch"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {task.status === "running" && (
                        <div className="mt-2 pt-2 border-t border-mc-border opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); completeTask({ id: task._id, result: "Completed" }); }}
                            className="w-full px-2 py-1 text-[10px] bg-mc-accent-green/20 text-mc-accent-green rounded hover:bg-mc-accent-green/30 font-mono-jb font-semibold uppercase tracking-wide transition-colors"
                          >
                            Complete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {getByStatus(col.status).length === 0 && (
                    <div className="p-4 text-[10px] text-mc-text-secondary/50 text-center font-mono-jb">Empty</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedTask && <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} />}

      {/* Create Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Task" size="sm">
        <form onSubmit={handleCreate} className="p-3 space-y-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent"
            autoFocus
          />
          <textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent resize-none"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-xs text-mc-text-secondary hover:text-mc-text transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!newTitle.trim() || isCreating} className="px-4 py-1.5 text-xs bg-mc-accent text-white rounded hover:bg-mc-accent-hover disabled:opacity-50 font-mono-jb uppercase tracking-wider">
              {isCreating ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
