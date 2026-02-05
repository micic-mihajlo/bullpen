"use client";

import { ArrowRight, Check } from "lucide-react";

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

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 bg-bg-alt">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase mb-2">
            Pricing
          </p>
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-text uppercase tracking-tight">
            Simple Plans
          </h2>
        </div>

        {/* Plans */}
        <div className="grid lg:grid-cols-3 gap-px bg-border">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 ${plan.featured ? 'bg-text text-bg' : 'bg-bg-alt'}`}
            >
              {/* Plan name */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className={`font-display text-3xl uppercase tracking-tight ${plan.featured ? 'text-bg' : 'text-text'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mt-1 ${plan.featured ? 'text-bg/70' : 'text-text-secondary'}`}>
                    {plan.description}
                  </p>
                </div>
                {plan.featured && (
                  <span className="font-mono text-xs bg-accent text-bg px-2 py-1 uppercase tracking-wider">
                    Popular
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mb-8">
                <span className={`font-display text-5xl ${plan.featured ? 'text-bg' : 'text-text'}`}>
                  {plan.price}
                </span>
                <span className={`font-mono text-xs ml-2 uppercase tracking-wider ${plan.featured ? 'text-bg/70' : 'text-muted'}`}>
                  {plan.unit}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className={`flex items-center gap-3 text-sm ${plan.featured ? 'text-bg/90' : 'text-text-secondary'}`}>
                    <Check className={`w-4 h-4 ${plan.featured ? 'text-accent' : 'text-accent'}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="#get-started"
                className={`flex items-center justify-center gap-2 w-full py-4 font-medium uppercase tracking-wider text-sm transition-colors ${
                  plan.featured
                    ? 'bg-accent text-bg hover:bg-accent-hover'
                    : 'border-2 border-text text-text hover:bg-text hover:text-bg'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
