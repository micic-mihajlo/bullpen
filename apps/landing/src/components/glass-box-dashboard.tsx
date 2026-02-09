"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";

// Mock data that cycles through realistic tasks
const mockTasks = [
  { id: 1, name: "Building user auth flow", agent: "Agent-03", status: "active" as const },
  { id: 2, name: "API endpoint — /invoices", agent: "Agent-07", status: "active" as const },
  { id: 3, name: "Database schema setup", agent: "Agent-12", status: "completed" as const },
  { id: 4, name: "Dashboard UI components", agent: "Agent-03", status: "review" as const },
];

export function GlassBoxDashboard() {
  // State for animated cost counter
  const [cost, setCost] = useState(481.20);

  // Increment cost periodically to show "live" activity
  useEffect(() => {
    const interval = setInterval(() => {
      setCost(prev => prev + (Math.random() * 0.50));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative bg-surface border border-border rounded-lg shadow-2xl overflow-hidden glass-shine"
    >
      {/* Dashboard header with "LIVE" indicator */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#EC6A5E]" />
            <div className="w-3 h-3 rounded-full bg-[#F4BF4F]" />
            <div className="w-3 h-3 rounded-full bg-[#61C554]" />
          </div>
          <span className="font-mono text-xs text-text-secondary">Project Dashboard</span>
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

      <div className="p-6 space-y-6">
        {/* Active Tasks Section */}
        <div>
          <h3 className="font-sans text-sm font-semibold text-text mb-3">Active Tasks</h3>
          <div className="space-y-2">
            {mockTasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded border border-border bg-bg/30 hover:bg-bg/50 transition-colors"
              >
                <TaskStatusIcon status={task.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text truncate">{task.name}</p>
                  <p className="text-xs text-text-secondary font-mono">{task.agent}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans text-sm font-semibold text-text">Cost Breakdown</h3>
            <motion.div
              key={Math.floor(cost * 100)} // Re-trigger animation on change
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="font-mono text-2xl font-bold text-accent"
            >
              ${cost.toFixed(2)}
            </motion.div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">AI agent compute</span>
              <span className="font-mono text-text">$142.80</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Human review (3.2 hrs)</span>
              <span className="font-mono text-text">$320.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Infrastructure</span>
              <span className="font-mono text-text">$18.40</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border text-xs text-text-secondary">
            Project budget: $4,800 • <span className="text-success">10% used</span>
          </div>
        </div>

        {/* Timeline Progress */}
        <div className="border-t border-border pt-6">
          <h3 className="font-sans text-sm font-semibold text-text mb-3">Delivery Timeline</h3>
          <div className="relative h-2 bg-border rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "35%" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 bg-success"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "15%" }}
              transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
              className="absolute inset-y-0 left-[35%] bg-accent"
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-full h-full"
              />
            </motion.div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-text-secondary font-mono">
            <span>Dec 1</span>
            <span className="text-accent font-medium">Today</span>
            <span>Dec 15 (est.)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TaskStatusIcon({ status }: { status: "completed" | "active" | "review" | "queued" }) {
  if (status === "completed") {
    return <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />;
  }
  if (status === "active") {
    return (
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Circle className="w-5 h-5 text-accent fill-accent/20 flex-shrink-0" />
      </motion.div>
    );
  }
  if (status === "review") {
    return <Clock className="w-5 h-5 text-warning flex-shrink-0" />;
  }
  return <Circle className="w-5 h-5 text-muted flex-shrink-0" />;
}
