"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const blackBoxItems = [
  "$15K–$150K upfront before any work starts",
  "8–12 week timelines with no visibility",
  "Hidden costs surface after the contract is signed",
  "'We'll get back to you' is the status update",
  "Final invoice is always a surprise",
];

const glassBoxItems = [
  "Software, automations, integrations — whatever grows your business",
  "Projects start at $2K. See the full cost before starting",
  "Delivered in days, not months. Watch progress live",
  "Every task, every commit, every dollar — visible in real-time",
  "No surprises. Ever.",
];

export function BlackBoxVsGlassBox() {
  return (
    <section className="py-28 px-4 sm:px-6 bg-bg">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-text mb-4 font-bold tracking-tight">
            Black box vs. glass box
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Traditional agencies keep you in the dark. We show you everything.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* Black Box Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#292524] rounded-lg p-8 border border-[#3d3d3d]"
          >
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-[#3d3d3d]/50 rounded text-xs font-mono text-[#A8A29E] uppercase tracking-wider">
                Traditional Agency
              </span>
              <h3 className="font-display text-4xl text-white mt-4 font-bold tracking-tight">
                Pay. Wait. Hope.
              </h3>
            </div>
            <div className="space-y-4">
              {blackBoxItems.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <X className="w-5 h-5 text-[#6b6b6b] flex-shrink-0 mt-0.5" />
                  <p className="text-[#A8A29E] leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Glass Box Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-surface rounded-lg p-8 border-2 border-accent shadow-lg relative overflow-hidden"
          >
            {/* Subtle orange glow in corner */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />

            <div className="mb-6 relative">
              <span className="inline-block px-3 py-1 bg-accent/10 rounded text-xs font-mono text-accent uppercase tracking-wider">
                Bullpen — The Glass Box
              </span>
              <h3 className="font-display text-4xl text-text mt-4 font-bold tracking-tight">
                Watch. Know. Ship.
              </h3>
            </div>
            <div className="space-y-4 relative">
              {glassBoxItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="flex gap-3"
                >
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-text leading-relaxed">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
