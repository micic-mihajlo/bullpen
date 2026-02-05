"use client";

import { Marquee } from "@/components/magicui/marquee";

const testimonials = [
  {
    quote: "50-page market research report in 4 days. Would have taken us weeks.",
    author: "Sarah Chen",
    role: "CEO",
  },
  {
    quote: "The MVP they built is now our production app. Clean code, great docs.",
    author: "Marcus J.",
    role: "Founder",
  },
  {
    quote: "I was skeptical about AI agencies. Then I saw the quality.",
    author: "Alex Rivera",
    role: "Solo Founder",
  },
  {
    quote: "Fastest turnaround I've ever seen. They just get it.",
    author: "Jamie Park",
    role: "CTO",
  },
  {
    quote: "Research quality rivals top consulting firms. Fraction of the cost.",
    author: "David Kim",
    role: "VP Product",
  },
];

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div className="w-96 mx-4 p-6 border-2 border-text bg-surface">
      <p className="text-text text-lg leading-relaxed mb-6">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-text text-bg flex items-center justify-center font-display text-lg">
          {author[0]}
        </div>
        <div>
          <p className="font-medium text-text">{author}</p>
          <p className="font-mono text-xs text-muted uppercase tracking-wider">{role}</p>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
        <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase mb-2">
          Testimonials
        </p>
        <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-text uppercase tracking-tight">
          What Founders Say
        </h2>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-bg to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-bg to-transparent z-10" />
        
        <Marquee pauseOnHover className="[--duration:50s]">
          {testimonials.map((t) => (
            <TestimonialCard key={t.author} {...t} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
