"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronRight, Plus, X, Send } from "lucide-react";
import { TaskDetail } from "./task-detail";
import { Id } from "../../../convex/_generated/dataModel";

type Task = {
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
  agent?: {
    _id: Id<"agents">;
    name: string;
    avatar?: string;
    status: string;
  };
};

type TaskStatus = "pending" | "assigned" | "running" | "completed" | "failed";

const columns: { status: TaskStatus; label: string; columnClass: string }[] = [
  { status: "pending", label: "Inbox", columnClass: "column-pending" },
  { status: "running", label: "In Progress", columnClass: "column-running" },
  { status: "completed", label: "Done", columnClass: "column-completed" },
];

export function TaskBoard() {
  const tasks = useQuery(api.tasks.list);
  const agents = useQuery(api.agents.list);
  const createTask = useMutation(api.tasks.create);
  const assignTask = useMutation(api.tasks.assign);
  const startTask = useMutation(api.tasks.start);
  const completeTask = useMutation(api.tasks.complete);

  const [showModal, setShowModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dispatchingTaskId, setDispatchingTaskId] = useState<string | null>(null);

  const handleDispatch = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDispatchingTaskId(taskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}/dispatch`, { method: "POST" });
      const data = await res.json();
      if (!data.success) {
        console.error("Dispatch failed:", data.error);
      }
    } catch (err) {
      console.error("Dispatch error:", err);
    } finally {
      setDispatchingTaskId(null);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsCreating(true);
    try {
      await createTask({
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim() || undefined,
      });
      setNewTaskTitle("");
      setNewTaskDesc("");
      setShowModal(false);
    } finally {
      setIsCreating(false);
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    if (!tasks) return [];
    // Include "assigned" tasks in pending column
    if (status === "pending") {
      return tasks.filter((t) => t.status === "pending" || t.status === "assigned");
    }
    return tasks.filter((t) => t.status === status);
  };

  const onlineAgents = agents?.filter((a) => a.status === "online") ?? [];

  return (
    <>
      <div className="h-full bg-mc-bg-secondary border border-mc-border rounded-xl flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-mc-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-mc-text-secondary" />
            <span className="text-sm font-medium uppercase tracking-wider">Mission Queue</span>
            <span className="bg-mc-bg-tertiary text-mc-text-secondary text-xs px-2 py-0.5 rounded">
              {tasks?.length ?? 0}
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5",
              "bg-mc-accent text-mc-bg rounded-lg text-xs font-medium",
              "hover:bg-mc-accent/90 transition-colors"
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            New Task
          </button>
        </div>

        {/* Kanban columns */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="grid grid-cols-3 gap-4 h-full">
            {columns.map((column) => (
              <div
                key={column.status}
                className={cn(
                  "flex flex-col rounded-xl bg-mc-bg/50",
                  column.columnClass
                )}
              >
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-mc-text-secondary uppercase tracking-wider">
                    {column.label}
                  </span>
                  <span className="text-xs text-mc-text-secondary/70">
                    {getTasksByStatus(column.status).length}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
                  {getTasksByStatus(column.status).map((task) => (
                    <div
                      key={task._id}
                      onClick={() => setSelectedTask(task as Task)}
                      className={cn(
                        "p-3 rounded-lg",
                        "bg-mc-bg-secondary border border-mc-border",
                        "hover:border-mc-accent/30 transition-all cursor-pointer",
                        "animate-slide-in group"
                      )}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <p className="text-sm text-mc-text font-medium flex-1">
                          {task.title}
                        </p>
                        <StatusBadge status={task.status} showLabel={false} />
                      </div>

                      {task.description && (
                        <p className="text-xs text-mc-text-secondary mb-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-mc-text-secondary/70">
                          {formatTime(task.createdAt)}
                        </p>
                        {task.result && (
                          <span className="text-xs text-mc-accent-green">✓ has output</span>
                        )}
                      </div>

                      {/* Quick actions on hover */}
                      {(task.status === "pending" || task.status === "assigned") && onlineAgents.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-mc-border opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs text-mc-text-secondary mb-1.5">Assign to:</p>
                          <div className="flex flex-wrap gap-1">
                            {onlineAgents.slice(0, 3).map((agent) => (
                              <button
                                key={agent._id}
                                onClick={() =>
                                  assignTask({
                                    taskId: task._id,
                                    agentId: agent._id,
                                  })
                                }
                                className={cn(
                                  "px-2 py-1 rounded text-xs",
                                  "bg-mc-bg-tertiary text-mc-text-secondary",
                                  "hover:bg-mc-accent/20 hover:text-mc-accent",
                                  "transition-colors"
                                )}
                              >
                                {agent.avatar || "🤖"} {agent.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {task.status === "assigned" && (
                        <div className="mt-2 pt-2 border-t border-mc-border opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startTask({ id: task._id });
                            }}
                            className={cn(
                              "flex-1 px-2 py-1.5 rounded text-xs font-medium",
                              "bg-mc-accent-yellow/20 text-mc-accent-yellow",
                              "hover:bg-mc-accent-yellow/30 transition-colors"
                            )}
                          >
                            ▶ Start
                          </button>
                          <button
                            onClick={(e) => handleDispatch(task._id, e)}
                            disabled={dispatchingTaskId === task._id}
                            className={cn(
                              "flex-1 px-2 py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1",
                              "bg-mc-accent/20 text-mc-accent",
                              "hover:bg-mc-accent/30 transition-colors",
                              "disabled:opacity-50"
                            )}
                          >
                            <Send className="w-3 h-3" />
                            {dispatchingTaskId === task._id ? "..." : "Dispatch"}
                          </button>
                        </div>
                      )}

                      {task.status === "running" && (
                        <div className="mt-2 pt-2 border-t border-mc-border opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() =>
                              completeTask({ id: task._id, result: "Completed" })
                            }
                            className={cn(
                              "w-full px-2 py-1.5 rounded text-xs font-medium",
                              "bg-mc-accent-green/20 text-mc-accent-green",
                              "hover:bg-mc-accent-green/30 transition-colors"
                            )}
                          >
                            ✓ Mark Complete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {getTasksByStatus(column.status).length === 0 && (
                    <div className="text-center py-8 text-mc-text-secondary/50 text-xs">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}

      {/* Create Task Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-mc-bg-secondary border border-mc-border rounded-xl w-full max-w-md animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-mc-border flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create New Task</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-mc-bg-tertiary rounded transition-colors"
              >
                <X className="w-5 h-5 text-mc-text-secondary" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-mc-text-secondary uppercase tracking-wider">
                  Title
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className={cn(
                    "w-full bg-mc-bg border border-mc-border rounded-lg px-4 py-2",
                    "focus:outline-none focus:border-mc-accent",
                    "placeholder:text-mc-text-secondary/50"
                  )}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-mc-text-secondary uppercase tracking-wider">
                  Description (optional)
                </label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Add more details..."
                  rows={3}
                  className={cn(
                    "w-full bg-mc-bg border border-mc-border rounded-lg px-4 py-2",
                    "focus:outline-none focus:border-mc-accent resize-none",
                    "placeholder:text-mc-text-secondary/50"
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-mc-text-secondary hover:text-mc-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim() || isCreating}
                  className={cn(
                    "px-6 py-2 bg-mc-accent text-mc-bg rounded-lg font-medium",
                    "hover:bg-mc-accent/90 disabled:opacity-50 transition-colors"
                  )}
                >
                  {isCreating ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
