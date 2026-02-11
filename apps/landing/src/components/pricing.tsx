"use client";

import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";

const ease = [0.25, 0.1, 0.25, 1] as const;

const plans = [
  {
    name: "Project",
    price: "Fixed",
    priceDetail: "$1.5K–$15K",
    description: "One-time projects with upfront pricing",
    features: [
      "Scope call within 24hrs",
      "Fixed price quote before starting",
      "Delivered in days or weeks",
      "Full source code ownership",
      "Live dashboard access",
      "Human review on everything",
    ],
    cta: "Start a Project",
    featured: false,
  },
  {
    name: "Retainer",
    price: "$3K–$10K",
    priceDetail: "per month",
    description: "Ongoing development and support",
    features: [
      "Monthly hours bank",
      "Priority response time",
      "Rollover unused hours",
      "Slack channel access",
      "Weekly check-ins",
      "Same-day bug fixes",
    ],
    cta: "Get Started",
    featured: true,
  },
  {
    name: "Add-Ons",
    price: "$500+",
    priceDetail: "per month",
    description: "AI agents that work 24/7",
    features: [
      "Email support agents",
      "Lead qualification agents",
      "CRM automation",
      "Outreach at scale",
      "Custom integrations",
      "24/7 operation",
    ],
    cta: "Add Agents",
    featured: false,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease,
    },
  },
};

export function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 bg-surface">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease }}
          className="text-center mb-16"
        >
          <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase mb-3">
            Pricing
          </p>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-text mb-4">
            Pay for what you need
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Fixed pricing for projects. Flexible retainers for ongoing work. No surprises.
          </p>
        </motion.div>

        {/* Plans */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              className={`rounded-lg p-8 border transition-all ${
                plan.featured
                  ? "bg-accent/5 border-accent shadow-lg"
                  : "bg-bg border-border hover:border-accent/30"
              }`}
            >
              {/* Plan header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-2xl font-bold text-text">
                    {plan.name}
                  </h3>
                  {plan.featured && (
                    <span className="font-mono text-xs bg-accent text-white px-2 py-1 rounded uppercase tracking-wider">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8 pb-8 border-b border-border">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-bold text-accent">
                    {plan.price}
                  </span>
                  <span className="font-mono text-sm text-muted">
                    {plan.priceDetail}
                  </span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-text-secondary"
                  >
                    <Check
                      className="w-4 h-4 text-accent shrink-0 mt-0.5"
                      strokeWidth={2}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="#get-started"
                className={`group/btn flex items-center justify-center gap-2 w-full py-3.5 rounded font-sans font-medium transition-all ${
                  plan.featured
                    ? "bg-accent text-white hover:bg-accent-hover shadow-md hover:shadow-lg"
                    : "border border-border text-text hover:bg-surface hover:border-accent/30"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </a>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-text-secondary">
            All plans include live dashboard access and full source code ownership.{" "}
            <a href="#get-started" className="text-accent font-medium hover:text-accent-hover">
              Talk to us
            </a>
            {" "}to find the right fit.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
