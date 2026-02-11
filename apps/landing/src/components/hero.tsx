"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { DashboardPreview } from "./dashboard-preview";

export function Hero() {
  return (
    <section className="relative pt-24 pb-16 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid lg:grid-cols-[1.2fr,1fr] gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Building live now badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border border-success/20 bg-success/5"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-success"
              />
              <span className="font-mono text-xs text-success uppercase tracking-wider font-medium">
                3 projects building now
              </span>
            </motion.div>

            {/* Main headline - Larger */}
            <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl leading-[0.95] text-text mb-6">
              We build your software.
              <br />
              <span className="text-text-secondary">You watch it happen.</span>
            </h1>

            {/* Subheadline - Larger */}
            <p className="text-xl sm:text-2xl text-text-secondary max-w-2xl leading-relaxed mb-8">
              A software agency that uses AI to build fast and humans to build right. Every task, every commit, every dollar visible to you in real-time.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <a
                href="#get-started"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-accent text-white font-sans font-medium text-lg rounded hover:bg-accent-hover transition-all shadow-lg hover:shadow-xl"
              >
                Tell us what you need
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-3 text-text font-sans font-medium text-lg hover:text-accent transition-colors"
              >
                See how it works →
              </a>
            </div>
          </motion.div>

          {/* Right: Dashboard Preview - Larger */}
          <div className="hidden lg:flex justify-end">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

