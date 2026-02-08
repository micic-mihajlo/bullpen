"use client";

import { Brain, Code, Search, Palette, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Brain,
    title: "Specialized Agents",
    description: "Each agent trained for specific tasks — research, coding, design. No generalists.",
    number: "01",
  },
  {
    icon: Code,
    title: "Production Code",
    description: "Working MVPs, not prototypes. Deployed, tested, documented.",
    number: "02",
  },
  {
    icon: Search,
    title: "Deep Research",
    description: "Market analysis, competitor research, user interviews — synthesized.",
    number: "03",
  },
  {
    icon: Palette,
    title: "Design Systems",
    description: "Wireframes to polished UI. Consistent, scalable, production-ready.",
    number: "04",
  },
  {
    icon: Zap,
    title: "10x Speed",
    description: "What takes weeks, delivered in days. Parallel execution.",
    number: "05",
  },
  {
    icon: Shield,
    title: "Human Review",
    description: "Every deliverable reviewed by humans before it reaches you.",
    number: "06",
  },
];

const ease = [0.25, 0.1, 0.25, 1] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease,
    },
  },
};

export function Features() {
  return (
    <section id="features" className="py-28 px-4 sm:px-6 bg-bg-alt">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.3, ease }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-20"
        >
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase mb-3">
              Capabilities
            </p>
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-text uppercase tracking-tight">
              Built For
              <br />
              Builders
            </h2>
          </div>
          <p className="text-text-secondary max-w-sm leading-relaxed">
            Stop hiring. Stop waiting. Get an AI workforce that actually delivers.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-0"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.3, ease } }}
              className="border-2 border-border -mt-[2px] -ml-[2px] p-10 group hover:bg-surface hover:border-text hover:shadow-[8px_8px_0px_0px_rgba(15,15,15,0.08)] transition-all duration-300 ease-out"
            >
              <div className="flex items-start justify-between mb-8">
                <motion.div
                  whileHover={{ rotate: 8 }}
                  transition={{ duration: 0.3, ease }}
                  className="p-3 border border-border group-hover:border-accent transition-colors duration-300 ease-out"
                >
                  <feature.icon className="w-5 h-5 text-text group-hover:text-accent transition-colors duration-300 ease-out" strokeWidth={1.5} />
                </motion.div>
                <span className="font-mono text-xs text-muted tracking-[0.1em]">{feature.number}</span>
              </div>
              <h3 className="font-display text-2xl text-text uppercase tracking-tight mb-4">
                {feature.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
