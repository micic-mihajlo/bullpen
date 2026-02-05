"use client";

const steps = [
  {
    number: "01",
    title: "Brief",
    description: "Tell us what you need. Landing page, research report, MVP — be as detailed or high-level as you want.",
  },
  {
    number: "02",
    title: "Assemble",
    description: "We spin up the right agents for your project. Research, code, design — whatever it takes.",
  },
  {
    number: "03",
    title: "Execute",
    description: "Track progress in real-time. See what agents are working on. Give feedback anytime.",
  },
  {
    number: "04",
    title: "Deliver",
    description: "Human-reviewed, polished, ready to use. Code deployed, research actionable, designs production-ready.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase mb-2">
            Process
          </p>
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-text uppercase tracking-tight">
            How It Works
          </h2>
        </div>

        {/* Steps - horizontal on desktop, vertical on mobile */}
        <div className="grid md:grid-cols-4 gap-8 md:gap-4">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-px bg-border -translate-x-4" />
              )}
              
              {/* Step */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-display text-6xl text-accent">{step.number}</span>
                </div>
                <h3 className="font-display text-2xl text-text uppercase tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 pt-8 border-t-2 border-text flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-text-secondary">
            From brief to deliverable in days, not weeks.
          </p>
          <a
            href="#get-started"
            className="inline-flex items-center gap-2 font-mono text-sm text-accent hover:underline uppercase tracking-wider"
          >
            Start Your Project →
          </a>
        </div>
      </div>
    </section>
  );
}
