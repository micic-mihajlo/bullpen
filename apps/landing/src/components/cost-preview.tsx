"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Eye, DollarSign, Clock } from "lucide-react";

const projectPhases = [
  {
    label: "Scoping & Planning",
    hours: "2 hrs",
    cost: 320,
    status: "completed",
    delay: 0.2
  },
  {
    label: "Building dashboard UI",
    hours: "12 hrs",
    cost: 840,
    status: "active",
    delay: 0.5
  },
  {
    label: "API integrations",
    hours: "8 hrs",
    cost: 560,
    status: "active",
    delay: 0.8
  },
  {
    label: "Testing & deployment",
    hours: "4 hrs",
    cost: 280,
    status: "queued",
    delay: 1.1
  },
];

export function CostPreview() {
  const [visiblePhases, setVisiblePhases] = useState<number[]>([]);
  const [showTotal, setShowTotal] = useState(false);

  const total = projectPhases.reduce((sum, phase) => sum + phase.cost, 0);
  const completedCost = projectPhases
    .filter((_, i) => visiblePhases.includes(i))
    .reduce((sum, phase) => sum + phase.cost, 0);

  useEffect(() => {
    // Show phases one by one
    projectPhases.forEach((phase, index) => {
      setTimeout(() => {
        setVisiblePhases(prev => [...prev, index]);
      }, phase.delay * 1000);
    });

    // Show total after all phases
    setTimeout(() => {
      setShowTotal(true);
    }, 1500);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-surface rounded-lg shadow-2xl overflow-hidden border border-border max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="bg-bg px-4 sm:px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-text">Live Project Dashboard</h3>
            <p className="text-xs text-text-secondary font-mono mt-0.5">You watch. We build.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-success"
            />
            <span className="text-xs font-mono text-success font-medium uppercase tracking-wider">Live</span>
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="p-4 sm:p-6 space-y-3 min-h-[280px]">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4 text-accent" />
          <span className="text-xs sm:text-sm font-medium text-text-secondary">Active Tasks</span>
        </div>

        <AnimatePresence>
          {visiblePhases.map((index) => {
            const phase = projectPhases[index];
            return (
              <motion.div
                key={phase.label}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 py-3 sm:py-4 border-b border-border/50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Status indicator */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      phase.status === "completed" ? "bg-success" :
                      phase.status === "active" ? "bg-accent" :
                      "bg-muted"
                    }`}
                  >
                    {phase.status === "active" && (
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-full h-full rounded-full bg-accent"
                      />
                    )}
                  </motion.div>

                  {/* Task info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base text-text font-medium truncate">
                      {phase.label}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3 text-muted" />
                      <span className="text-xs text-muted font-mono">{phase.hours}</span>
                      {phase.status === "active" && (
                        <span className="text-xs text-accent font-medium ml-1">In progress</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cost */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="flex items-center gap-1.5 sm:justify-end"
                >
                  <DollarSign className="w-3.5 h-3.5 text-muted" />
                  <span className="font-mono text-sm sm:text-base font-semibold text-text">
                    ${phase.cost.toLocaleString()}
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Total with visibility emphasis */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 bg-accent/5 border-t-2 border-accent/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-display text-base sm:text-lg font-bold text-text">Total Project Cost</span>
              {showTotal && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs font-mono text-success bg-success/10 px-2 py-0.5 rounded"
                >
                  Fixed
                </motion.span>
              )}
            </div>
            <p className="text-xs text-text-secondary font-mono">
              {showTotal
                ? "Locked in. No surprises. Ever."
                : "Building your estimate in real-time..."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!showTotal ? (
              <motion.div
                key="calculating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <span className="font-mono text-xl sm:text-2xl text-accent font-bold">
                  ${completedCost.toLocaleString()}
                </span>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full"
                />
              </motion.div>
            ) : (
              <motion.div
                key="total"
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
                className="font-display text-3xl sm:text-4xl font-bold text-accent"
              >
                ${total.toLocaleString()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
