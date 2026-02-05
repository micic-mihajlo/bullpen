"use client";

import { FileText, Users, Rocket, CheckCircle } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Submit Your Brief",
    description: "Tell us what you need — landing page, research, MVP.",
  },
  {
    number: "02",
    icon: Users,
    title: "We Assemble Your Team",
    description: "AI agents spin up with the right skills for your project.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Watch Progress Live",
    description: "Track your project in real-time. Give feedback anytime.",
  },
  {
    number: "04",
    icon: CheckCircle,
    title: "Receive Deliverables",
    description: "Human-reviewed, polished, ready to use.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-bg-alt/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-text mb-4">
            How it works
          </h2>
          <p className="text-text-secondary">
            From brief to deliverable in days, not weeks.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <div className="p-6 bg-surface/50 rounded-xl border border-border/50">
                <div className="text-xs font-mono text-accent mb-4">
                  {step.number}
                </div>
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <step.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-text mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-text-secondary">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
