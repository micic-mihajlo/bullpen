"use client";

import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "We needed market research for our Series A pitch. Bullpen delivered a 50-page report in 4 days that would have taken us weeks to compile.",
    author: "Sarah Chen",
    role: "CEO, TechStartup",
    avatar: "SC",
  },
  {
    quote: "The MVP they built is now our production app. Clean code, great documentation, and they even set up CI/CD. Unreal.",
    author: "Marcus Johnson",
    role: "Founder, DevTools Co",
    avatar: "MJ",
  },
  {
    quote: "I was skeptical about AI agencies. Then I saw the quality. Now I send all my side projects to Bullpen.",
    author: "Alex Rivera",
    role: "Solo Founder",
    avatar: "AR",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-bg-alt/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-text mb-4">
            What founders say
          </h2>
          <p className="text-lg text-text-secondary">
            Don't take our word for it.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="bg-surface rounded-xl border border-border p-8 relative"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-accent/20" />
              
              <p className="text-text-secondary leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-text">{testimonial.author}</p>
                  <p className="text-sm text-muted">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
