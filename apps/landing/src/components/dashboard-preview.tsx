"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Eye, DollarSign, Clock, CheckCircle2, Circle } from "lucide-react";
import { useState, useEffect } from "react";

const tasks = [
  {
    label: "Building admin dashboard",
    hours: "12h",
    cost: "$840",
    status: "active",
    subtasks: [
      { label: "Setting up dashboard layout", completed: true },
      { label: "Adding navigation menu", completed: true },
      { label: "Building data visualization cards", completed: false, inProgress: true },
      { label: "Adding real-time updates", completed: false, inProgress: false },
    ]
  },
  {
    label: "Connecting Slack, Stripe, and your CRM",
    hours: "8h",
    cost: "$560",
    status: "active",
    subtasks: [
      { label: "Setting up Stripe payments", completed: true },
      { label: "Connecting Slack notifications", completed: false, inProgress: true },
      { label: "Syncing customer data to CRM", completed: false, inProgress: false },
    ]
  },
  {
    label: "Setting up customer database",
    hours: "4h",
    cost: "$280",
    status: "completed",
    subtasks: []
  },
];

export function DashboardPreview() {
  const [expandedTask, setExpandedTask] = useState<number | null>(0);
  const [subtaskProgress, setSubtaskProgress] = useState<{ [key: string]: number }>({});

  // Auto-expand first active task and cycle through subtasks
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    tasks.forEach((task, taskIndex) => {
      if (task.status === "active" && task.subtasks.length > 0) {
        task.subtasks.forEach((subtask, subtaskIndex) => {
          if (subtask.inProgress) {
            const key = `${taskIndex}-${subtaskIndex}`;
            let progress = 0;
            const interval = setInterval(() => {
              progress += 2;
              if (progress <= 100) {
                setSubtaskProgress(prev => ({ ...prev, [key]: progress }));
              } else {
                clearInterval(interval);
              }
            }, 60);
            intervals.push(interval);
          }
        });
      }
    });

    return () => intervals.forEach(i => clearInterval(i));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-surface rounded-lg border border-border shadow-2xl overflow-hidden w-full"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-bg/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-accent" />
            <span className="font-sans text-base font-semibold text-text">Live Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-success"
            />
            <span className="font-mono text-xs text-success uppercase tracking-wider">Live</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-2">
        {tasks.map((task, taskIndex) => (
          <div key={task.label}>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + taskIndex * 0.1 }}
              onClick={() => task.status === "active" && task.subtasks.length > 0 ?
                setExpandedTask(expandedTask === taskIndex ? null : taskIndex) : null}
              className={`flex items-center gap-3 p-4 rounded border border-border bg-bg/30 ${
                task.status === "active" && task.subtasks.length > 0 ? "cursor-pointer hover:bg-bg/50" : ""
              } transition-colors`}
            >
              {task.status === "completed" ? (
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
              ) : (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Circle className="w-5 h-5 text-accent fill-accent/20 flex-shrink-0" />
                </motion.div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-base text-text font-medium truncate">{task.label}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-muted" />
                    <span className="text-sm text-muted font-mono">{task.hours}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-muted" />
                    <span className="text-sm text-text font-mono font-semibold">{task.cost}</span>
                  </div>
                  {task.status === "active" && (
                    <span className="text-xs text-accent font-medium">In progress</span>
                  )}
                </div>
              </div>
              {task.status === "active" && task.subtasks.length > 0 && (
                <a
                  href="#"
                  className="text-xs text-accent font-medium hover:text-accent-hover transition-colors border border-accent/20 px-3 py-1.5 rounded hover:bg-accent/5"
                >
                  View status
                </a>
              )}
            </motion.div>

            {/* Subtasks */}
            <AnimatePresence>
              {expandedTask === taskIndex && task.subtasks.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="ml-8 mt-2 space-y-2 pb-2">
                    {task.subtasks.map((subtask, subtaskIndex) => {
                      const progressKey = `${taskIndex}-${subtaskIndex}`;
                      const progress = subtaskProgress[progressKey] || 0;

                      return (
                        <motion.div
                          key={subtask.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: subtaskIndex * 0.1 }}
                          className="flex items-start gap-2"
                        >
                          <div className="pt-1">
                            {subtask.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                            ) : subtask.inProgress ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              >
                                <Circle className="w-3.5 h-3.5 text-accent fill-accent/20" />
                              </motion.div>
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-muted/40" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm ${
                              subtask.completed ? "text-text-secondary line-through" :
                              subtask.inProgress ? "text-text font-medium" :
                              "text-muted"
                            }`}>
                              {subtask.label}
                            </p>
                            {subtask.inProgress && (
                              <div className="mt-1.5 h-1 bg-border rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-accent"
                                  style={{ width: `${progress}%` }}
                                  transition={{ duration: 0.1 }}
                                />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 bg-accent/5 border-t border-accent/20">
        <div className="flex items-center justify-between mb-1">
          <span className="text-base font-medium text-text">Total Cost</span>
          <span className="font-display text-3xl font-bold text-accent">$1,680</span>
        </div>
        <p className="text-sm text-text-secondary">
          Watch every dollar as it's spent
        </p>
      </div>
    </motion.div>
  );
}
