"use client";

const logos = [
  { name: "YC", display: "Y Combinator" },
  { name: "Vercel", display: "Vercel" },
  { name: "Stripe", display: "Stripe" },
  { name: "Linear", display: "Linear" },
  { name: "Notion", display: "Notion" },
  { name: "Figma", display: "Figma" },
];

export function LogoCloud() {
  return (
    <section className="py-12 border-y border-border bg-bg-alt/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted mb-8">
          Trusted by teams at
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="text-lg font-semibold text-text-secondary/50 hover:text-text-secondary transition-colors"
            >
              {logo.display}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
