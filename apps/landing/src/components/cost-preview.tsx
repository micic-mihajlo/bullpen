"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";

const invoiceItems = [
  { label: "Landing Page Design", amount: 800, delay: 0.5 },
  { label: "Custom API Integration", amount: 1200, delay: 1.5 },
  { label: "Email Automation Setup", amount: 600, delay: 2.5 },
  { label: "Testing & Deployment", amount: 400, delay: 3.5 },
];

export function CostPreview() {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [calculatingTotal, setCalculatingTotal] = useState(true);
  const [showTotal, setShowTotal] = useState(false);
  const [runningTotal, setRunningTotal] = useState(0);

  const total = invoiceItems.reduce((sum, item) => sum + item.amount, 0);

  useEffect(() => {
    // Add items one by one
    invoiceItems.forEach((item, index) => {
      setTimeout(() => {
        setVisibleItems(prev => [...prev, index]);
        // Update running total
        setTimeout(() => {
          setRunningTotal(prev => prev + item.amount);
        }, 300);
      }, item.delay * 1000);
    });

    // Show final total after all items
    const finalDelay = invoiceItems[invoiceItems.length - 1].delay + 0.8;
    setTimeout(() => {
      setCalculatingTotal(false);
      setShowTotal(true);
    }, finalDelay * 1000);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-surface rounded-lg shadow-2xl overflow-hidden border border-border"
    >
      {/* Header */}
      <div className="bg-bg px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-text">Project Estimate</h3>
            <p className="text-xs text-text-secondary font-mono mt-0.5">Building your quote in real-time...</p>
          </div>
          <AnimatePresence mode="wait">
            {calculatingTotal ? (
              <motion.div
                key="calculating"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 rounded-full"
              >
                <Loader2 className="w-3.5 h-3.5 text-warning animate-spin" />
                <span className="text-xs font-mono text-warning font-medium">Calculating</span>
              </motion.div>
            ) : (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full"
              >
                <Check className="w-3.5 h-3.5 text-success" />
                <span className="text-xs font-mono text-success font-medium">Fixed Price</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Line items */}
      <div className="p-6 space-y-3 min-h-[240px]">
        <AnimatePresence>
          {visibleItems.map((index) => {
            const item = invoiceItems[index];
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.4 }}
                className="flex justify-between items-center py-2 border-b border-border/50"
              >
                <span className="text-sm text-text flex items-center gap-2">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-1.5 h-1.5 rounded-full bg-success"
                  />
                  {item.label}
                </span>
                <motion.span
                  initial={{ opacity: 0, scale: 0.8, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="font-mono text-sm font-semibold text-text"
                >
                  ${item.amount.toLocaleString()}
                </motion.span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Running subtotal while calculating */}
        {visibleItems.length > 0 && calculatingTotal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-between items-center pt-2 text-text-secondary"
          >
            <span className="text-sm font-mono">Subtotal</span>
            <motion.span
              key={runningTotal}
              initial={{ scale: 1.1, color: "var(--color-accent)" }}
              animate={{ scale: 1, color: "var(--color-text-secondary)" }}
              transition={{ duration: 0.3 }}
              className="font-mono text-sm font-semibold"
            >
              ${runningTotal.toLocaleString()}
            </motion.span>
          </motion.div>
        )}
      </div>

      {/* Total */}
      <div className="px-6 py-4 bg-accent/5 border-t-2 border-accent/20">
        <div className="flex justify-between items-center">
          <span className="font-display text-lg font-bold text-text">Total Project Cost</span>
          <AnimatePresence mode="wait">
            {!showTotal ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-mono text-xl text-text-secondary"
              >
                $–,–––
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
                className="font-display text-3xl font-bold text-accent"
              >
                ${total.toLocaleString()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: showTotal ? 1 : 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-xs text-text-secondary mt-2 font-mono"
        >
          {showTotal
            ? "Know your costs upfront. Pay only what we quote. Zero surprises."
            : "Calculating your custom estimate..."}
        </motion.p>
      </div>
    </motion.div>
  );
}
