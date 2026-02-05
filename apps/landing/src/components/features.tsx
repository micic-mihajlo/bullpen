"use client";

import { Brain, Code, Search, Palette, Zap, Shield } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Specialized Agents",
    description: "Each agent is trained for specific tasks — research, coding, design. No jack-of-all-trades.",
  },
  {
    icon: Code,
    title: "Production-Ready Code",
    description: "Get working MVPs, not prototypes. Deployed, tested, and documented.",
  },
  {
    icon: Search,
    title: "Deep Research",
    description: "Market analysis, competitor research, user interviews — synthesized into actionable insights.",
  },
  {
    icon: Palette,
    title: "Design Systems",
    description: "From wireframes to polished UI. Consistent, scalable, beautiful.",
  },
  {
    icon: Zap,
    title: "10x Faster",
    description: "What takes weeks, we deliver in days. Parallel agents, no meetings, pure execution.",
  },
  {
    icon: Shield,
    title: "Human Oversight",
    description: "Every deliverable is reviewed by humans before it reaches you. Quality guaranteed.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-text mb-4">
            Built for builders
          </h2>
          <p className="text-lg text-text-secondary">
            Stop hiring. Stop waiting. Get an AI workforce that delivers real results.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 bg-surface rounded-xl border border-border hover:border-accent/30 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-display text-xl font-semibold text-text mb-2">
                {feature.title}
              </h3>
              <p className="text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
