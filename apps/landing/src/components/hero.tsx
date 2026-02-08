"use client";

import { ArrowRight } from "lucide-react";
import { GlassBoxDashboard } from "./glass-box-dashboard";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Messaging */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
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
            <div className="space-y-4">
              <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl leading-[0.95] text-text font-bold tracking-tight">
                Your software,
                <br />
                built by AI.
                <br />
                <span className="text-accent">Watched by you.</span>
              </h1>
            </div>

            {/* Subheadline */}
            <p className="text-xl text-text-secondary max-w-lg leading-relaxed">
              Software, automations, integrations — built fast to grow your business. AI agents do the work. Humans ensure quality. You watch everything happen in real-time.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="#get-started"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-accent text-white font-sans font-medium rounded hover:bg-accent-hover transition-all shadow-lg hover:shadow-xl"
              >
                Start your project
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#demo"
                className="inline-flex items-center gap-3 px-8 py-4 border border-border text-text font-sans font-medium rounded hover:bg-surface transition-colors"
              >
                Watch a live build
              </a>
            </div>

            {/* Small trust indicator */}
            <p className="text-sm text-text-secondary font-mono">
              Projects start at $2K · Delivered in days, not months
            </p>
          </motion.div>

          {/* Right: Glass Box Dashboard */}
          <div className="lg:pl-8">
            <GlassBoxDashboard />
          </div>
        </div>
      </div>
    </section>
  );
}
