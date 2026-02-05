"use client";

import { Marquee } from "@/components/magicui/marquee";

const logos = [
  "Y Combinator",
  "Vercel",
  "Stripe",
  "Linear",
  "Notion",
  "Figma",
  "Supabase",
  "Railway",
];

export function LogoCloud() {
  return (
    <section className="py-12 border-y border-border/50 bg-bg-alt/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="text-center text-sm text-muted mb-8">
          Trusted by teams building the future
        </p>
        
        <div className="relative">
          {/* Gradient masks */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-bg-alt/30 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-bg-alt/30 to-transparent z-10" />
          
          <Marquee pauseOnHover className="[--duration:30s]">
            {logos.map((logo) => (
              <div
                key={logo}
                className="mx-8 text-lg font-medium text-text-secondary/40 hover:text-text-secondary transition-colors"
              >
                {logo}
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
