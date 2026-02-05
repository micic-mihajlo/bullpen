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
    <section className="py-8 border-y border-border bg-bg-alt/50 overflow-hidden">
      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-bg-alt/50 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-bg-alt/50 to-transparent z-10" />
        
        <Marquee className="[--duration:40s] [--gap:3rem]">
          {logos.map((logo) => (
            <span
              key={logo}
              className="font-mono text-xs text-muted uppercase tracking-[0.2em]"
            >
              {logo}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
