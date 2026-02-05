"use client";

import { FileText, Users, Rocket, CheckCircle } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Submit Your Brief",
    description: "Tell us what you need — a landing page, market research, MVP prototype. Be as detailed or high-level as you want.",
  },
  {
    number: "02",
    icon: Users,
    title: "We Assemble Your Team",
    description: "Our AI agents spin up with the right skills for your project. Research, code, design — whatever it takes.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Watch Progress Live",
    description: "Track your project in real-time. See what agents are working on, review drafts, give feedback.",
  },
  {
    number: "04",
    icon: CheckCircle,
    title: "Receive Deliverables",
    description: "Human-reviewed, polished, ready to use. Code is deployed, research is actionable, designs are production-ready.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-bg-alt/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-text mb-4">
            How it works
          </h2>
          <p className="text-lg text-text-secondary">
            From brief to deliverable in days, not weeks.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Step card */}
                <div className="bg-surface rounded-xl border border-border p-6 relative z-10">
                  {/* Number badge */}
                  <div className="absolute -top-3 left-6 px-2 py-0.5 bg-accent text-white text-xs font-mono rounded">
                    {step.number}
                  </div>
                  
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 mt-2">
                    <step.icon className="w-6 h-6 text-accent" />
                  </div>
                  
                  <h3 className="font-display text-lg font-semibold text-text mb-2">
                    {step.title}
                  </h3>
                  
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-8 -translate-y-1/2 z-20">
                    <div className="w-full h-full bg-bg-alt flex items-center justify-center">
                      <div className="w-2 h-2 border-r-2 border-t-2 border-accent rotate-45" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
