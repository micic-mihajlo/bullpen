"use client";

import { Eye, DollarSign, FileText, Shield, Code, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Eye,
    title: "Live Task Tracking",
    description: "Watch AI agents work in real-time. See exactly what's being built, by whom, and when.",
    number: "01",
  },
  {
    icon: DollarSign,
    title: "Cost Transparency",
    description: "Know exactly what you're paying for. AI compute, human review, infrastructure — all itemized.",
    number: "02",
  },
  {
    icon: FileText,
    title: "Full Audit Logs",
    description: "Every decision, every change, timestamped and searchable. Nothing hidden, ever.",
    number: "03",
  },
  {
    icon: Shield,
    title: "Human Oversight",
    description: "Expert review on every deliverable. AI speed with human judgment.",
    number: "04",
  },
  {
    icon: Code,
    title: "Source Access",
    description: "All code, all prompts, all reasoning. You own everything we build.",
    number: "05",
  },
  {
    icon: BarChart3,
    title: "Performance Metrics",
    description: "See speed, quality, and efficiency data. No guessing how your project is doing.",
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
    <section id="features" className="py-28 px-4 sm:px-6 bg-surface">
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
              Transparency
            </p>
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-text font-bold tracking-tight">
              Radical transparency
            </h2>
          </div>
          <p className="text-text-secondary max-w-sm leading-relaxed">
            See everything. Know everything. Trust everything.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.3, ease } }}
              className="border border-border rounded-lg p-10 group hover:bg-bg hover:border-accent hover:shadow-lg transition-all duration-300 ease-out"
            >
              <div className="flex items-start justify-between mb-8">
                <motion.div
                  whileHover={{ rotate: 8 }}
                  transition={{ duration: 0.3, ease }}
                >
                  <feature.icon className="w-6 h-6 text-accent transition-colors duration-300 ease-out" strokeWidth={1.5} />
                </motion.div>
                <span className="font-mono text-xs text-muted tracking-[0.1em]">{feature.number}</span>
              </div>
              <h3 className="font-display text-2xl text-text tracking-tight mb-4">
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
