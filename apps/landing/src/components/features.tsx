"use client";

import { motion } from "framer-motion";
import { Brain, Code, Search, Palette, Zap, Shield } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Specialized Agents",
    description: "Each agent is trained for specific tasks — research, coding, design. No jack-of-all-trades.",
  },
  {
    icon: Code,
    title: "Production-Ready Code",
    description: "Get working MVPs, not prototypes. Deployed, tested, and documented.",
  },
  {
    icon: Search,
    title: "Deep Research",
    description: "Market analysis, competitor research, user interviews — synthesized into actionable insights.",
  },
  {
    icon: Palette,
    title: "Design Systems",
    description: "From wireframes to polished UI. Consistent, scalable, beautiful.",
  },
  {
    icon: Zap,
    title: "10x Faster",
    description: "What takes weeks, we deliver in days. Parallel agents, no meetings, pure execution.",
  },
  {
    icon: Shield,
    title: "Human Oversight",
    description: "Every deliverable is reviewed by humans before it reaches you. Quality guaranteed.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/3 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-block px-4 py-1.5 bg-surface border border-border rounded-full text-sm font-medium text-muted mb-6">
            Why Bullpen?
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-text mb-6">
            Built for builders
          </h2>
          <p className="text-lg sm:text-xl text-text-secondary leading-relaxed">
            Stop hiring. Stop waiting. Get an AI workforce that delivers real results.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full p-8 bg-surface/80 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5">
                <div className="relative">
                  {/* Icon */}
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-300">
                    <feature.icon className="w-7 h-7 text-accent" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-display text-xl font-semibold text-text mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
