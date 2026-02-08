"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";

const invoiceItems = [
  { label: "Landing Page Design", amount: 800, delay: 0 },
  { label: "Custom API Integration", amount: 1200, delay: 0.3 },
  { label: "Email Automation Setup", amount: 600, delay: 0.6 },
  { label: "Testing & Deployment", amount: 400, delay: 0.9 },
];

export function CostPreview() {
  const [showTotal, setShowTotal] = useState(false);
  const total = invoiceItems.reduce((sum, item) => sum + item.amount, 0);

  useEffect(() => {
    const timer = setTimeout(() => setShowTotal(true), 1500);
    return () => clearTimeout(timer);
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
            <p className="text-xs text-text-secondary font-mono mt-0.5">Transparent. Upfront. No surprises.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full">
            <Check className="w-3.5 h-3.5 text-success" />
            <span className="text-xs font-mono text-success font-medium">Fixed Price</span>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="p-6 space-y-3">
        {invoiceItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: item.delay, duration: 0.4 }}
            className="flex justify-between items-center py-2"
          >
            <span className="text-sm text-text">{item.label}</span>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: item.delay + 0.2, duration: 0.3 }}
              className="font-mono text-sm font-semibold text-text"
            >
              ${item.amount.toLocaleString()}
            </motion.span>
          </motion.div>
        ))}
      </div>

      {/* Total */}
      <div className="px-6 py-4 bg-accent/5 border-t-2 border-accent/20">
        <div className="flex justify-between items-center">
          <span className="font-display text-lg font-bold text-text">Total Project Cost</span>
          <AnimatePresence>
            {showTotal && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="font-display text-3xl font-bold text-accent"
              >
                ${total.toLocaleString()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
          className="text-xs text-text-secondary mt-2 font-mono"
        >
          Know your costs upfront. Pay only what we quote. Zero surprises.
        </motion.p>
      </div>
    </motion.div>
  );
}
