"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Project",
    description: "One-off projects with clear deliverables",
    price: "Custom",
    priceNote: "Based on scope",
    features: [
      "Single project focus",
      "Dedicated agent team",
      "Human QA review",
      "Source files included",
      "2 revision rounds",
      "Slack/Discord support",
    ],
    cta: "Get Quote",
    featured: false,
  },
  {
    name: "Retainer",
    description: "Ongoing partnership for continuous work",
    price: "$5,000",
    priceNote: "per month",
    features: [
      "Priority queue",
      "Unlimited small tasks",
      "2 major projects/month",
      "Dedicated account manager",
      "Weekly sync calls",
      "Custom agent training",
      "Deploy & maintain",
    ],
    cta: "Start Retainer",
    featured: true,
  },
  {
    name: "Enterprise",
    description: "For teams with complex needs",
    price: "Custom",
    priceNote: "Let's talk",
    features: [
      "Everything in Retainer",
      "Custom SLAs",
      "White-label delivery",
      "On-prem deployment",
      "Security review",
      "Dedicated infra",
    ],
    cta: "Contact Sales",
    featured: false,
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

export function Pricing() {
  return (
    <section id="pricing" className="py-28 px-4 sm:px-6 lg:px-8 bg-bg-alt/30 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/5 rounded-full blur-[150px]" />
      </div>

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
            Pricing
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-text mb-6">
            Simple pricing
          </h2>
          <p className="text-lg sm:text-xl text-text-secondary leading-relaxed">
            Pay for what you need. No hidden fees, no surprises.
          </p>
        </motion.div>

        {/* Pricing grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              variants={itemVariants}
              className={`relative ${plan.featured ? 'lg:-mt-6 lg:mb-6' : ''}`}
            >
              <div className={`relative h-full bg-surface/80 backdrop-blur-sm rounded-3xl border overflow-hidden transition-all duration-300 ${
                plan.featured
                  ? "border-accent/50 shadow-2xl shadow-accent/10"
                  : "border-border/50 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5"
              }`}>
                {/* Featured glow effect */}
                {plan.featured && (
                  <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
                )}

                {/* Featured badge */}
                {plan.featured && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-accent text-white text-xs font-bold rounded-b-xl shadow-lg">
                      <Sparkles className="w-3 h-3" />
                      Recommended
                    </div>
                  </div>
                )}

                <div className="p-8 pt-10">
                  {/* Plan name */}
                  <h3 className="font-display text-2xl font-bold text-text mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-text-secondary text-sm mb-8">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-text">{plan.price}</span>
                      {plan.priceNote && (
                        <span className="text-muted">{plan.priceNote}</span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-text-secondary">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          plan.featured ? 'bg-accent' : 'bg-accent/10'
                        }`}>
                          <Check className={`w-3 h-3 ${plan.featured ? 'text-white' : 'text-accent'}`} />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <a
                    href="#get-started"
                    className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl font-semibold transition-all group ${
                      plan.featured
                        ? "bg-accent text-white hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5"
                        : "bg-bg-alt text-text hover:bg-border"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-text-secondary">
            Have questions?{" "}
            <a href="#faq" className="text-accent font-semibold hover:underline">
              Check our FAQ
            </a>{" "}
            or{" "}
            <a href="#get-started" className="text-accent font-semibold hover:underline">
              get in touch
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
