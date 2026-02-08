"use client";

import { Eye, DollarSign, Shield, Code, Zap, Workflow } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Eye,
    title: "Live Task Tracking",
    description: "Watch AI agents work in real-time. See exactly what's being built, by whom, and when.",
    gradient: "from-accent/10 to-accent/5",
  },
  {
    icon: Zap,
    title: "Rapid Integrations",
    description: "Connect your tools fast. APIs, webhooks, email agents, automations — integrated in days.",
    gradient: "from-warning/10 to-warning/5",
  },
  {
    icon: Workflow,
    title: "Business Automations",
    description: "Automate workflows that grow your business. From email sequences to data pipelines.",
    gradient: "from-success/10 to-success/5",
  },
  {
    icon: DollarSign,
    title: "Cost Transparency",
    description: "Know exactly what you're paying for. AI compute, human review, infrastructure — itemized.",
    gradient: "from-accent/10 to-accent/5",
  },
  {
    icon: Shield,
    title: "Human Oversight",
    description: "Expert review on every deliverable. AI speed with human judgment.",
    gradient: "from-text/10 to-text/5",
  },
  {
    icon: Code,
    title: "Full Source Access",
    description: "All code, all prompts, all reasoning. You own everything we build.",
    gradient: "from-text/10 to-text/5",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-32 px-4 sm:px-6 bg-gradient-to-b from-bg to-surface overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-success/5 rounded-full blur-3xl" />
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
          <p className="inline-block px-4 py-2 bg-accent/10 rounded-full text-xs font-mono text-accent uppercase tracking-wider mb-6">
            Transparency
          </p>
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-text font-bold tracking-tight mb-6">
            See everything.<br />Know everything.
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Full visibility into every task, every decision, every dollar. Because your business deserves transparency, not mystery.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full bg-surface border border-border rounded-2xl p-8 hover:border-accent/50 hover:shadow-xl transition-all duration-300">
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Content */}
                <div className="relative">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-accent/10 rounded-xl mb-6 group-hover:bg-accent/20 transition-colors duration-300">
                    <feature.icon className="w-7 h-7 text-accent" strokeWidth={2} />
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-2xl font-bold text-text mb-3 tracking-tight">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Hover shine effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <p className="text-text-secondary font-mono text-sm">
            Every feature designed for one thing: <span className="text-accent font-semibold">your trust</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
