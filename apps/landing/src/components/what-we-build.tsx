"use client";

import { motion } from "framer-motion";

const projects = [
  {
    name: "Landing Pages",
    description: "Marketing sites with backend logic, forms, analytics",
    timeline: "Hours to 1 day",
    startingPrice: "$2K",
  },
  {
    name: "Dashboards",
    description: "Internal tools, admin panels, data visualization",
    timeline: "5-10 days",
    startingPrice: "$4K",
  },
  {
    name: "Automations",
    description: "Email workflows, CRM integrations, scheduled tasks",
    timeline: "Hours to 1 day",
    startingPrice: "$1.5K",
  },
  {
    name: "API Integrations",
    description: "Connect your tools — Stripe, Slack, Shopify, anything",
    timeline: "Hours to 2 days",
    startingPrice: "$2.5K",
  },
  {
    name: "Web Apps",
    description: "Full-stack applications with auth, database, deployment",
    timeline: "1-3 weeks",
    startingPrice: "$8K",
  },
  {
    name: "Mobile Apps",
    description: "iOS and Android apps with backend",
    timeline: "2-4 weeks",
    startingPrice: "$12K",
  },
];

const addOns = [
  {
    name: "Email Agents",
    description: "AI agents that handle customer support, lead qualification, and outreach at scale",
    price: "$500-$2K/mo",
  },
  {
    name: "Lead Agents",
    description: "Automated lead capture, enrichment, and routing to your CRM",
    price: "$500-$1.5K/mo",
  },
];

export function WhatWeBuild() {
  return (
    <section className="py-28 px-4 sm:px-6 bg-surface">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase mb-3">
            What We Build
          </p>
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-text mb-4">
            From idea to shipped software
          </h2>
        </motion.div>

        {/* Project grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {projects.map((project, i) => (
            <motion.div
              key={project.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-bg rounded-lg p-8 border border-border hover:border-accent/30 transition-colors"
            >
              <h3 className="font-display text-2xl font-bold text-text mb-3">
                {project.name}
              </h3>
              <p className="text-text-secondary leading-relaxed mb-6">
                {project.description}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted font-mono uppercase tracking-wider mb-1">
                    Timeline
                  </p>
                  <p className="text-sm font-semibold text-text">{project.timeline}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted font-mono uppercase tracking-wider mb-1">
                    Starting at
                  </p>
                  <p className="font-display text-2xl font-bold text-accent">
                    {project.startingPrice}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add-ons section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 pt-16 border-t border-border"
        >
          <div className="mb-12">
            <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase mb-3">
              Add-Ons
            </p>
            <h3 className="font-display text-3xl sm:text-4xl text-text mb-3">
              Grow your business on autopilot
            </h3>
            <p className="text-text-secondary max-w-2xl">
              AI agents that work 24/7 to handle customer conversations, qualify leads, and grow your pipeline.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mb-12">
            {addOns.map((addon, i) => (
              <motion.div
                key={addon.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                className="bg-bg rounded-lg p-6 border border-border hover:border-accent/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-display text-xl font-bold text-text">
                    {addon.name}
                  </h4>
                  <span className="font-mono text-sm text-accent font-semibold whitespace-nowrap ml-4">
                    {addon.price}
                  </span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {addon.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Don't see your project?{" "}
            <a href="#get-started" className="text-accent font-semibold hover:text-accent-hover transition-colors">
              Tell us what you need
            </a>
            . We scope it in 24 hours — free, no commitment.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
