"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import { useStableData } from "@/lib/hooks";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/stat-card";
import { TaskDetail } from "@/components/dashboard/task-detail";
import { useToast } from "@/components/toast";
import { useRegisterShortcut } from "@/components/shortcuts-provider";
import {
  Plus,
  CheckSquare,
  Send,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Filter,
} from "lucide-react";

type Task = {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  status: "pending" | "assigned" | "running" | "completed" | "failed";
  priority?: number;
  projectId?: Id<"projects">;
  assignedAgentId?: Id<"agents">;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  result?: string;
  error?: string;
  agent?: { _id: Id<"agents">; name: string; avatar?: string; status: string };
};

type TaskStatus = "pending" | "assigned" | "running" | "completed" | "failed";

const columns: { status: TaskStatus; label: string; icon: React.ReactNode; cls: string }[] = [
  { status: "pending", label: "Inbox", icon: <Clock className="w-3.5 h-3.5" />, cls: "column-pending" },
  { status: "running", label: "In Progress", icon: <Loader2 className="w-3.5 h-3.5" />, cls: "column-running" },
  { status: "completed", label: "Done", icon: <CheckCircle2 className="w-3.5 h-3.5" />, cls: "column-completed" },
  { status: "failed", label: "Failed", icon: <AlertCircle className="w-3.5 h-3.5" />, cls: "column-failed" },
];

export default function TasksPage() {
  const tasks = useStableData(useQuery(api.tasks.list));
  const agents = useStableData(useQuery(api.agents.list));
  const projects = useStableData(useQuery(api.projects.list));
  const createTask = useMutation(api.tasks.create);
  const assignTask = useMutation(api.tasks.assign);
  const startTask = useMutation(api.tasks.start);
  const completeTask = useMutation(api.tasks.complete);
  const { addToast } = useToast();

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newProjectId, setNewProjectId] = useState("");
  const [newPriority, setNewPriority] = useState("3");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [filterProject, setFilterProject] = useState<string>("all");

  const openCreate = useCallback(() => setShowCreate(true), []);
  useRegisterShortcut("newTask", openCreate);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsCreating(true);
    try {
      await createTask({
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        priority: parseInt(newPriority),
        projectId: newProjectId ? (newProjectId as Id<"projects">) : undefined,
      });
      addToast("Task created", "success");
      setNewTitle("");
      setNewDesc("");
      setNewProjectId("");
      setNewPriority("3");
      setShowCreate(false);
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
        addToast(data.error || "Failed to dispatch", "error");
      }
    } catch {
      addToast("Network error dispatching task", "error");
    } finally {
      setDispatchingId(null);
    }
  };

  const getByStatus = (status: TaskStatus) => {
    if (!tasks) return [];
    let filtered = status === "pending"
      ? tasks.filter((t) => t.status === "pending" || t.status === "assigned")
      : tasks.filter((t) => t.status === status);

    if (filterProject !== "all") {
      filtered = filtered.filter((t) => t.projectId === filterProject);
    }
    return filtered;
  };

  const onlineAgents = agents?.filter((a) => a.status === "online") ?? [];

  const stats = useMemo(() => ({
    total: tasks?.length ?? 0,
    pending: tasks?.filter((t) => t.status === "pending" || t.status === "assigned").length ?? 0,
    running: tasks?.filter((t) => t.status === "running").length ?? 0,
    completed: tasks?.filter((t) => t.status === "completed").length ?? 0,
    failed: tasks?.filter((t) => t.status === "failed").length ?? 0,
  }), [tasks]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-mc-border bg-mc-bg-secondary/80 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-wider text-mc-text uppercase">Tasks</h1>
            <p className="text-[10px] text-mc-muted font-mono-jb uppercase tracking-widest">
              /// {stats.total} total · {stats.running} running
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Project filter */}
            {projects && projects.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-mc-text-secondary" />
                <select
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                  className="bg-mc-bg border border-mc-border rounded px-2 py-1 text-xs text-mc-text focus:outline-none focus:border-mc-accent font-mono-jb"
                >
                  <option value="all">All projects</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs bg-mc-accent text-white uppercase tracking-wider hover:bg-mc-accent-hover transition-colors font-mono-jb"
            >
              <Plus className="w-3.5 h-3.5" />
              New Task
            </button>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-mc-border grid grid-cols-4 gap-3 bg-mc-bg-secondary/40">
        <div className="flex items-center gap-2 text-[10px] font-mono-jb uppercase tracking-wide">
          <Clock className="w-3 h-3 text-mc-text-secondary" />
          <span className="text-mc-text-secondary">Pending</span>
          <span className="font-semibold text-mc-text">{stats.pending}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono-jb uppercase tracking-wide">
          <Loader2 className="w-3 h-3 text-mc-accent-yellow" />
          <span className="text-mc-text-secondary">Running</span>
          <span className="font-semibold text-mc-accent-yellow">{stats.running}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono-jb uppercase tracking-wide">
          <CheckCircle2 className="w-3 h-3 text-mc-accent-green" />
          <span className="text-mc-text-secondary">Done</span>
          <span className="font-semibold text-mc-accent-green">{stats.completed}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono-jb uppercase tracking-wide">
          <AlertCircle className="w-3 h-3 text-mc-accent-red" />
          <span className="text-mc-text-secondary">Failed</span>
          <span className="font-semibold text-mc-accent-red">{stats.failed}</span>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-hidden p-3">
        <div className="grid grid-cols-4 gap-3 h-full">
          {columns.map((col) => (
            <div key={col.status} className={cn("flex flex-col rounded bg-mc-bg-secondary/60 overflow-hidden border border-mc-border", col.cls)}>
              <div className="px-3 py-2 flex items-center justify-between border-b border-mc-border/50 bg-mc-bg-secondary/80">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-mc-text-secondary uppercase font-mono-jb tracking-wide">
                  {col.icon}
                  {col.label}
                </div>
                <span className="text-[10px] text-mc-muted font-mono-jb font-semibold">{getByStatus(col.status).length}</span>
              </div>
              <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
                {!tasks ? (
                  <div className="p-2 text-xs text-mc-text-secondary">Loading...</div>
                ) : getByStatus(col.status).length === 0 ? (
                  <div className="p-4 text-[10px] text-mc-muted text-center uppercase tracking-wide font-mono-jb">Empty</div>
                ) : (
                  getByStatus(col.status).map((task) => (
                    <div
                      key={task._id}
                      onClick={() => setSelectedTask(task as Task)}
                      className="p-2.5 rounded bg-mc-bg-secondary border border-mc-border hover:border-mc-accent/30 cursor-pointer group transition-colors"
                    >
                      {/* Priority + title */}
                      <div className="flex items-start gap-2 mb-1">
                        {task.priority && task.priority >= 4 && (
                          <span className="text-[10px] text-mc-accent-red font-semibold mt-0.5 font-mono-jb">P{task.priority}</span>
                        )}
                        <p className="text-sm font-medium line-clamp-2 flex-1 text-mc-text">{task.title}</p>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-2 text-[10px] text-mc-muted mb-1 font-mono-jb">
                        <span>{formatTime(task.createdAt)}</span>
                        {task.result && <span className="text-mc-accent-green font-semibold">✓</span>}
                      </div>

                      {/* Agent assignment */}
                      {task.assignedAgentId && agents && (
                        <div className="text-[10px] text-mc-text-secondary flex items-center gap-1 mb-1">
                          {(() => {
                            const a = agents.find((ag) => ag._id === task.assignedAgentId);
                            return a ? <><span>{a.avatar}</span> {a.name}</> : null;
                          })()}
                        </div>
                      )}

                      {/* Actions (pending/assigned) */}
                      {(task.status === "pending" || task.status === "assigned") && onlineAgents.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-mc-border opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex flex-wrap gap-1 mb-1.5">
                            {onlineAgents.slice(0, 3).map((a) => (
                              <button
                                key={a._id}
                                onClick={(e) => { e.stopPropagation(); assignTask({ taskId: task._id, agentId: a._id }); }}
                                className="px-1.5 py-0.5 text-[10px] bg-mc-bg-tertiary rounded hover:bg-mc-bg-tertiary/80 transition-colors text-mc-text font-mono-jb"
                              >
                                {a.avatar} {a.name}
                              </button>
                            ))}
                          </div>
                          {task.status === "assigned" && (
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); startTask({ id: task._id }); }}
                                className="flex-1 px-2 py-1 text-[10px] bg-mc-accent-yellow/15 text-mc-accent-yellow rounded hover:bg-mc-accent-yellow/25 transition-colors font-mono-jb font-semibold uppercase"
                              >
                                Start
                              </button>
                              <button
                                onClick={(e) => handleDispatch(task._id, e)}
                                disabled={dispatchingId === task._id}
                                className="flex-1 px-2 py-1 text-[10px] bg-mc-accent/15 text-mc-accent rounded hover:bg-mc-accent/25 flex items-center justify-center gap-1 disabled:opacity-50 transition-colors font-mono-jb font-semibold uppercase"
                              >
                                <Send className="w-3 h-3" />
                                {dispatchingId === task._id ? "..." : "Dispatch"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Complete action for running */}
                      {task.status === "running" && (
                        <div className="mt-2 pt-2 border-t border-mc-border opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); completeTask({ id: task._id, result: "Completed" }); }}
                            className="w-full px-2 py-1 text-[10px] bg-mc-accent-green/15 text-mc-accent-green rounded hover:bg-mc-accent-green/25 transition-colors font-mono-jb font-semibold uppercase"
                          >
                            Complete
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task detail modal */}
      {selectedTask && <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} />}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Task" size="sm">
        <form onSubmit={handleCreate} className="p-4 space-y-3">
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
            rows={3}
            className="w-full bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent resize-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-mc-text-secondary uppercase tracking-wider mb-1 block font-mono-jb">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent"
              >
                <option value="1">P1 - Low</option>
                <option value="2">P2</option>
                <option value="3">P3 - Normal</option>
                <option value="4">P4 - High</option>
                <option value="5">P5 - Urgent</option>
              </select>
            </div>
            {projects && projects.length > 0 && (
              <div>
                <label className="text-[10px] text-mc-text-secondary uppercase tracking-wider mb-1 block font-mono-jb">Project</label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent"
                >
                  <option value="">None</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setShowCreate(false)} className="px-3 py-1.5 text-xs text-mc-text-secondary hover:text-mc-text">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newTitle.trim() || isCreating}
              className="px-4 py-1.5 text-xs bg-mc-accent text-white rounded hover:bg-mc-accent-hover disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
