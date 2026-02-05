"use client";

import { Marquee } from "@/components/magicui/marquee";

const testimonials = [
  {
    quote: "We needed market research for our Series A pitch. Bullpen delivered a 50-page report in 4 days that would have taken us weeks to compile.",
    author: "Sarah Chen",
    role: "CEO, TechStartup",
  },
  {
    quote: "The MVP they built is now our production app. Clean code, great documentation, and they even set up CI/CD. Unreal.",
    author: "Marcus Johnson",
    role: "Founder, DevTools Co",
  },
  {
    quote: "I was skeptical about AI agencies. Then I saw the quality. Now I send all my side projects to Bullpen.",
    author: "Alex Rivera",
    role: "Solo Founder",
  },
  {
    quote: "Fastest turnaround I've ever seen. They understood our requirements immediately and delivered exactly what we needed.",
    author: "Jamie Park",
    role: "CTO, Fintech Startup",
  },
  {
    quote: "The research quality rivals what I'd expect from a top consulting firm, at a fraction of the cost and time.",
    author: "David Kim",
    role: "VP Product, SaaS Co",
  },
];

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div className="w-80 mx-4 p-6 bg-surface/80 rounded-xl border border-border/50">
      <p className="text-text-secondary text-sm leading-relaxed mb-4">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-medium">
          {author.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="text-sm font-medium text-text">{author}</p>
          <p className="text-xs text-muted">{role}</p>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-12">
        <div className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-text mb-4">
            What founders say
          </h2>
          <p className="text-text-secondary">
            Don&apos;t take our word for it.
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-bg to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-bg to-transparent z-10" />
        
        <Marquee pauseOnHover className="[--duration:40s]">
          {testimonials.map((t) => (
            <TestimonialCard key={t.author} {...t} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
