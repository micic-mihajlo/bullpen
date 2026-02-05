"use client";

import { Brain, Code, Search, Palette, Zap, Shield } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Specialized Agents",
    description: "Each agent is trained for specific tasks — research, coding, design.",
  },
  {
    icon: Code,
    title: "Production-Ready Code",
    description: "Get working MVPs, not prototypes. Deployed, tested, and documented.",
  },
  {
    icon: Search,
    title: "Deep Research",
    description: "Market analysis, competitor research, user interviews — synthesized.",
  },
  {
    icon: Palette,
    title: "Design Systems",
    description: "From wireframes to polished UI. Consistent, scalable, beautiful.",
  },
  {
    icon: Zap,
    title: "10x Faster",
    description: "What takes weeks, we deliver in days. Parallel agents, pure execution.",
  },
  {
    icon: Shield,
    title: "Human Oversight",
    description: "Every deliverable is reviewed by humans before it reaches you.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-text mb-4">
            Built for builders
          </h2>
          <p className="text-text-secondary">
            Stop hiring. Stop waiting. Get an AI workforce that delivers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 bg-surface/50 rounded-xl border border-border/50 hover:border-accent/30 transition-colors"
            >
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-display text-lg font-semibold text-text mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
