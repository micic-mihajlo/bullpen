"use client";

import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";

const ease = [0.25, 0.1, 0.25, 1] as const;

const plans = [
  {
    name: "Project",
    price: "Custom",
    unit: "per project",
    description: "One-off work with clear deliverables",
    features: [
      "Dedicated agent team",
      "Human QA review",
      "Source files included",
      "2 revision rounds",
    ],
    cta: "Get Quote",
    featured: false,
  },
  {
    name: "Retainer",
    price: "$5K",
    unit: "per month",
    description: "Ongoing partnership",
    features: [
      "Priority queue",
      "Unlimited small tasks",
      "2 major projects/month",
      "Weekly sync calls",
      "Custom agent training",
    ],
    cta: "Start Retainer",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    unit: "let's talk",
    description: "For teams with complex needs",
    features: [
      "Everything in Retainer",
      "Custom SLAs",
      "White-label delivery",
      "On-prem deployment",
      "Dedicated infrastructure",
    ],
    cta: "Contact Sales",
    featured: false,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
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

export function Pricing() {
  return (
    <section id="pricing" className="py-28 px-4 sm:px-6 bg-bg-alt">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.3, ease }}
          className="mb-20"
        >
          <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase mb-3">
            Pricing
          </p>
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-text uppercase tracking-tight">
            Simple Plans
          </h2>
        </motion.div>

        {/* Plans */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid lg:grid-cols-3 gap-0"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              whileHover={
                plan.featured
                  ? { y: -6, transition: { duration: 0.3, ease } }
                  : { y: -4, boxShadow: "8px 8px 0px 0px rgba(15,15,15,0.08)", transition: { duration: 0.3, ease } }
              }
              className={`p-10 border-2 -ml-[2px] first:ml-0 transition-all duration-300 ease-out ${
                plan.featured
                  ? "bg-text text-bg border-text relative lg:-my-4 lg:py-14 shadow-[0_8px_32px_rgba(15,15,15,0.15)]"
                  : "bg-bg-alt border-border hover:border-text"
              }`}
            >
              {/* Plan header */}
              <div className="flex items-start justify-between mb-10">
                <div>
                  <h3
                    className={`font-display text-3xl uppercase tracking-tight ${
                      plan.featured ? "text-bg" : "text-text"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm mt-2 ${
                      plan.featured ? "text-bg/60" : "text-text-secondary"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>
                {plan.featured && (
                  <span className="font-mono text-[10px] bg-accent text-bg px-3 py-1.5 uppercase tracking-[0.15em]">
                    Popular
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mb-10 pb-10 border-b border-border/30">
                <span
                  className={`font-display text-6xl ${
                    plan.featured ? "text-bg" : "text-text"
                  }`}
                >
                  {plan.price}
                </span>
                <span
                  className={`font-mono text-xs ml-3 uppercase tracking-[0.15em] ${
                    plan.featured ? "text-bg/50" : "text-muted"
                  }`}
                >
                  {plan.unit}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={`flex items-start gap-3 text-sm ${
                      plan.featured ? "text-bg/80" : "text-text-secondary"
                    }`}
                  >
                    <Check
                      className="w-4 h-4 text-accent shrink-0 mt-0.5"
                      strokeWidth={2}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <motion.a
                href="#get-started"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15, ease }}
                className={`group/btn flex items-center justify-center gap-2 w-full py-4 font-mono text-sm uppercase tracking-[0.15em] transition-all duration-300 ease-out ${
                  plan.featured
                    ? "bg-accent text-bg hover:bg-accent-hover hover:shadow-[0_4px_16px_rgba(194,65,12,0.3)]"
                    : "border-2 border-text text-text hover:bg-text hover:text-bg"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover/btn:translate-x-1" />
              </motion.a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
