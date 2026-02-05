"use client";

import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Project",
    description: "One-off projects",
    price: "Custom",
    priceNote: "Based on scope",
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
    description: "Ongoing partnership",
    price: "$5,000",
    priceNote: "per month",
    features: [
      "Priority queue",
      "Unlimited small tasks",
      "2 major projects/month",
      "Weekly sync calls",
    ],
    cta: "Start Retainer",
    featured: true,
  },
  {
    name: "Enterprise",
    description: "Complex needs",
    price: "Custom",
    priceNote: "Let's talk",
    features: [
      "Everything in Retainer",
      "Custom SLAs",
      "White-label delivery",
      "Dedicated infra",
    ],
    cta: "Contact Sales",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-text mb-4">
            Simple pricing
          </h2>
          <p className="text-text-secondary">
            Pay for what you need. No hidden fees.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-6 rounded-xl border ${
                plan.featured
                  ? "bg-surface border-accent"
                  : "bg-surface/50 border-border/50"
              }`}
            >
              <h3 className="font-display text-lg font-semibold text-text">
                {plan.name}
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                {plan.description}
              </p>

              <div className="mb-6">
                <span className="text-3xl font-bold text-text">{plan.price}</span>
                <span className="text-muted ml-1">{plan.priceNote}</span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-text-secondary">
                    <Check className="w-4 h-4 text-accent shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#get-started"
                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-medium transition-colors ${
                  plan.featured
                    ? "bg-accent text-white hover:bg-accent-hover"
                    : "bg-bg-alt text-text hover:bg-border"
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
