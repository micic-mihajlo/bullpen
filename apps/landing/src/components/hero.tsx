"use client";

import { ArrowRight } from "lucide-react";
import { AsciiBull } from "./ascii-bull";
import { CostPreview } from "./cost-preview";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] pt-24 pb-12 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Messaging */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* "Building live now" badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-success/20 bg-success/5">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-success"
              />
              <span className="font-mono text-xs text-success uppercase tracking-wider">
                Building live now
              </span>
            </div>

            {/* Main headline */}
            <div>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.1] text-text font-bold tracking-tight">
                Software built fast.
                <br />
                <span className="text-accent">Costs known upfront.</span>
              </h1>
            </div>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-text-secondary max-w-lg leading-relaxed">
              AI agents build your software, automations, and integrations in days. You see exactly what you're paying for. No surprises.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="#get-started"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-accent text-white font-sans font-medium rounded hover:bg-accent-hover transition-all shadow-lg hover:shadow-xl"
              >
                Get your estimate
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-3 px-8 py-4 border border-border text-text font-sans font-medium rounded hover:bg-surface transition-colors"
              >
                See how it works
              </a>
            </div>

            {/* Small trust indicator */}
            <p className="text-sm text-text-secondary font-mono">
              Fixed pricing · Fast delivery · Full transparency
            </p>
          </motion.div>

          {/* Right: Split view - Bull + Invoice */}
          <div className="space-y-6">
            {/* ASCII Bull in terminal window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-lg">
                <div className="flex items-center gap-2 px-4 py-2 bg-bg border-b border-border">
                  <div className="w-3 h-3 rounded-full bg-[#EC6A5E]" />
                  <div className="w-3 h-3 rounded-full bg-[#F4BF4F]" />
                  <div className="w-3 h-3 rounded-full bg-[#61C554]" />
                  <span className="ml-2 text-xs font-mono text-text-secondary">bullpen_agent.exe</span>
                </div>
                <div className="p-6 bg-surface">
                  <AsciiBull />
                </div>
              </div>
            </motion.div>

            {/* Cost Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <CostPreview />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
