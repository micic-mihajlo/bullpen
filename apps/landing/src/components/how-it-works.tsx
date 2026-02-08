"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "You describe, we scope",
    description:
      "Tell us what you need in plain English. A human reviews your request and creates a project plan within 24 hours — tasks, timeline, cost. You approve before any work starts.",
    metric: "< 24h",
    metricLabel: "Response time",
  },
  {
    number: "02",
    title: "AI builds, humans review",
    description:
      "AI agents start writing code, running tests, and building your project in parallel. Every deliverable is reviewed by a human before it's marked complete. Nothing ships without human eyes on it.",
    metric: "100%",
    metricLabel: "Human reviewed",
  },
  {
    number: "03",
    title: "You watch, we ship",
    description:
      "Track every task, every commit, every dollar through your live dashboard. When it's ready, we deploy it. You own the code, the docs, everything.",
    metric: "Real-time",
    metricLabel: "Transparency",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-4 sm:px-6 bg-surface relative overflow-hidden">
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(28, 25, 23, 1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(28, 25, 23, 1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase mb-3">
            How It Works
          </p>
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-text mb-4">
            AI builds fast.
            <br />
            Humans build right.
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative group"
            >
              {/* Card with subtle hover effect */}
              <div className="relative bg-bg border border-border rounded-lg p-8 h-full transition-all duration-300 hover:border-accent/30 hover:shadow-lg">
                {/* Step number badge - refined, not playful */}
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 border border-accent/20">
                    <span className="font-mono text-sm font-bold text-accent tracking-tight">
                      {step.number}
                    </span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                </div>

                {/* Title */}
                <h3 className="font-display text-2xl font-bold text-text mb-4 leading-tight">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-text-secondary leading-relaxed mb-6">
                  {step.description}
                </p>

                {/* Data-driven metric - replaces emoji with professional stat */}
                <div className="mt-auto pt-6 border-t border-border">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-2xl font-bold text-accent">
                      {step.metric}
                    </span>
                    <span className="text-xs text-muted font-mono uppercase tracking-wider">
                      {step.metricLabel}
                    </span>
                  </div>
                </div>

                {/* Subtle accent corner */}
                <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-accent/5 to-transparent rounded-tr-lg" />
                </div>
              </div>

              {/* Connector line (desktop only) - more refined */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-14 left-full w-full h-[1px] pointer-events-none">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.2 }}
                    className="w-1/2 h-full bg-gradient-to-r from-accent/30 to-accent/10 origin-left"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
