"use client";

import { ArrowRight } from "lucide-react";

const services = [
  {
    title: "Research",
    subtitle: "Deep market intelligence",
    items: [
      "Competitor analysis",
      "Market sizing (TAM/SAM/SOM)",
      "User interview synthesis",
      "Trend reports",
      "Due diligence research",
    ],
    price: "From $500",
    delivery: "3-5 days",
    accent: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "MVP Development",
    subtitle: "Ship fast, iterate faster",
    items: [
      "Full-stack web apps",
      "Landing pages",
      "Internal tools",
      "API integrations",
      "Database design",
    ],
    price: "From $5,000",
    delivery: "1-2 weeks",
    accent: "bg-accent/10 text-accent",
    featured: true,
  },
  {
    title: "Design",
    subtitle: "Beautiful, functional UI",
    items: [
      "UI/UX design",
      "Design systems",
      "Prototypes",
      "Brand guidelines",
      "Marketing assets",
    ],
    price: "From $2,000",
    delivery: "1 week",
    accent: "bg-purple-500/10 text-purple-600",
  },
];

export function Services() {
  return (
    <section id="services" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-text mb-4">
            What we build
          </h2>
          <p className="text-lg text-text-secondary">
            Choose a service or tell us what you need. We'll figure out the rest.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.title}
              className={`relative bg-surface rounded-2xl border p-8 ${
                service.featured
                  ? "border-accent shadow-xl scale-105"
                  : "border-border"
              }`}
            >
              {service.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-white text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}

              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mb-4 ${service.accent}`}>
                {service.subtitle}
              </div>

              <h3 className="font-display text-2xl font-bold text-text mb-4">
                {service.title}
              </h3>

              <ul className="space-y-3 mb-8">
                {service.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-text-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="pt-6 border-t border-border">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-text">{service.price}</p>
                    <p className="text-sm text-muted">Delivery: {service.delivery}</p>
                  </div>
                </div>

                <a
                  href="#get-started"
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium transition-colors ${
                    service.featured
                      ? "bg-accent text-white hover:bg-accent-hover"
                      : "bg-bg-alt text-text hover:bg-border"
                  }`}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
