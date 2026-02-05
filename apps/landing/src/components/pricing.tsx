"use client";

import { Check, ArrowRight } from "lucide-react";

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

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-text mb-4">
            Simple pricing
          </h2>
          <p className="text-lg text-text-secondary">
            Pay for what you need. No subscriptions for one-off work.
          </p>
        </div>

        {/* Pricing grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-surface rounded-2xl border p-8 ${
                plan.featured
                  ? "border-accent shadow-xl lg:scale-105"
                  : "border-border"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-white text-xs font-semibold rounded-full">
                  Recommended
                </div>
              )}

              <h3 className="font-display text-xl font-bold text-text mb-2">
                {plan.name}
              </h3>
              <p className="text-text-secondary text-sm mb-6">
                {plan.description}
              </p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-text">{plan.price}</span>
                <span className="text-muted ml-2">{plan.priceNote}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-text-secondary text-sm">
                    <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#get-started"
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium transition-colors ${
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
