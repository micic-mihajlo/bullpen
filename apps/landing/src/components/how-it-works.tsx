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
    <section id="how-it-works" className="py-28 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-20">
          <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase mb-3">
            Process
          </p>
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-text uppercase tracking-tight">
            How It Works
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-4 gap-0">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative group border-l-2 border-border md:border-l-0 md:border-t-2 pl-8 md:pl-0 md:pt-8 pb-10 md:pb-0 md:pr-8"
            >
              {/* Active dot on timeline */}
              <div className="absolute left-[-7px] top-0 md:left-0 md:top-[-7px] w-3 h-3 bg-border group-hover:bg-accent transition-colors duration-300 ease-out" />

              <div className="space-y-4">
                <span className="font-mono text-xs text-accent tracking-[0.2em] uppercase">
                  Step {step.number}
                </span>
                <h3 className="font-display text-4xl md:text-5xl text-text uppercase tracking-tight group-hover:text-accent transition-colors duration-300 ease-out">
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
        <div className="mt-20 pt-8 border-t-2 border-text flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-text-secondary">
            From brief to deliverable in days, not weeks.
          </p>
          <a
            href="#get-started"
            className="inline-flex items-center gap-2 font-mono text-sm text-accent hover:text-accent-hover uppercase tracking-[0.15em] transition-colors duration-300 ease-out"
          >
            Start Your Project
            <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
