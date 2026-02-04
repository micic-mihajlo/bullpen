"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useState } from "react";

type TaskStatus = "pending" | "assigned" | "running" | "completed" | "failed";

const columns: { status: TaskStatus; label: string; color: string }[] = [
  { status: "pending", label: "Pending", color: "border-zinc-700" },
  { status: "running", label: "Running", color: "border-amber-500/50" },
  { status: "completed", label: "Completed", color: "border-emerald-500/50" },
];

export function TaskBoard() {
  const tasks = useQuery(api.tasks.list);
  const agents = useQuery(api.agents.list);
  const createTask = useMutation(api.tasks.create);
  const assignTask = useMutation(api.tasks.assign);
  const startTask = useMutation(api.tasks.start);
  const completeTask = useMutation(api.tasks.complete);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await createTask({ title: newTaskTitle.trim() });
    setNewTaskTitle("");
    setIsCreating(false);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    if (!tasks) return [];
    return tasks.filter((t) => t.status === status);
  };

  const onlineAgents = agents?.filter((a) => a.status === "online") ?? [];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle>Tasks</CardTitle>
          <button
            onClick={() => setIsCreating(true)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium",
              "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
              "hover:bg-cyan-500/20 transition-colors"
            )}
          >
            + New Task
          </button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-4">
        {/* New task form */}
        {isCreating && (
          <form onSubmit={handleCreateTask} className="mb-4 animate-slide-up">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                autoFocus
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-sm",
                  "bg-zinc-800/50 border border-zinc-700/50",
                  "placeholder:text-zinc-600 text-zinc-100",
                  "focus:outline-none focus:border-cyan-500/50"
                )}
              />
              <button
                type="submit"
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium",
                  "bg-cyan-500 text-zinc-900",
                  "hover:bg-cyan-400 transition-colors"
                )}
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm",
                  "text-zinc-400 hover:text-zinc-300 transition-colors"
                )}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Kanban columns */}
        <div className="grid grid-cols-3 gap-4 h-full">
          {columns.map((column) => (
            <div
              key={column.status}
              className={cn(
                "flex flex-col rounded-xl",
                "bg-zinc-900/30 border-t-2",
                column.color
              )}
            >
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {column.label}
                </span>
                <span className="text-xs text-zinc-600 font-mono">
                  {getTasksByStatus(column.status).length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {getTasksByStatus(column.status).map((task, index) => (
                  <div
                    key={task._id}
                    className={cn(
                      "p-3 rounded-lg",
                      "bg-zinc-800/50 border border-zinc-700/30",
                      "hover:border-zinc-600/50 transition-all cursor-pointer",
                      "animate-slide-up group"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-2">
                      <StatusBadge status={task.status} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-200 font-medium truncate">
                          {task.title}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 font-mono">
                          {formatTime(task.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Quick actions on hover */}
                    {task.status === "pending" && onlineAgents.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-zinc-700/30 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                "bg-zinc-700/50 text-zinc-300",
                                "hover:bg-cyan-500/20 hover:text-cyan-400",
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
                      <div className="mt-2 pt-2 border-t border-zinc-700/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startTask({ id: task._id })}
                          className={cn(
                            "w-full px-2 py-1 rounded text-xs",
                            "bg-amber-500/20 text-amber-400",
                            "hover:bg-amber-500/30 transition-colors"
                          )}
                        >
                          ▶ Start
                        </button>
                      </div>
                    )}

                    {task.status === "running" && (
                      <div className="mt-2 pt-2 border-t border-zinc-700/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() =>
                            completeTask({ id: task._id, result: "Done" })
                          }
                          className={cn(
                            "w-full px-2 py-1 rounded text-xs",
                            "bg-emerald-500/20 text-emerald-400",
                            "hover:bg-emerald-500/30 transition-colors"
                          )}
                        >
                          ✓ Complete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
