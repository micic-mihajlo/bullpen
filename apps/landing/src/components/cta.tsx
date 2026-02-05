"use client";

import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section id="get-started" className="relative py-28 px-4 sm:px-6 bg-text text-bg overflow-hidden">
      {/* Diagonal stripe background */}
      <div className="absolute inset-0 diagonal-stripes pointer-events-none" />

      {/* Oversized background text */}
      <div
        className="absolute -top-6 -left-4 font-display text-[18vw] leading-none text-bg/[0.03] uppercase pointer-events-none select-none"
        aria-hidden="true"
      >
        SHIP IT
      </div>

      {/* Geometric accent - top right corner block */}
      <div
        className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-accent/10 pointer-events-none"
        style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
        aria-hidden="true"
      />

      <div className="relative max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase mb-4">
              Get Started
            </p>
            <h2 className="font-display text-6xl sm:text-7xl md:text-8xl text-bg uppercase tracking-tight mb-6 leading-[0.9]">
              Ready To
              <br />
              <span className="text-accent">Ship?</span>
            </h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-[3px] bg-accent" />
              <div className="w-6 h-[3px] bg-bg/20" />
            </div>
            <p className="text-bg/60 leading-relaxed">
              Tell us what you&apos;re building. We&apos;ll put together a plan
              and get started within 24 hours.
            </p>
          </div>

          {/* Right - Form */}
          <div className="space-y-5">
            <div>
              <label className="font-mono text-[10px] text-bg/40 uppercase tracking-[0.2em] block mb-3">
                Email
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                className="w-full px-5 py-4 bg-transparent border-2 border-bg/20 text-bg placeholder:text-bg/25 font-mono text-sm focus:outline-none focus:border-accent transition-colors duration-300 ease-out"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] text-bg/40 uppercase tracking-[0.2em] block mb-3">
                What do you need?
              </label>
              <textarea
                placeholder="Landing page, MVP, research..."
                rows={3}
                className="w-full px-5 py-4 bg-transparent border-2 border-bg/20 text-bg placeholder:text-bg/25 font-mono text-sm focus:outline-none focus:border-accent transition-colors duration-300 ease-out resize-none"
              />
            </div>
            <button className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-accent text-bg font-mono text-sm uppercase tracking-[0.15em] hover:bg-accent-hover transition-all duration-300 ease-out cursor-pointer">
              Start Your Project
              <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
            </button>
            <p className="font-mono text-[10px] text-bg/30 text-center uppercase tracking-[0.2em]">
              Response within 24 hours
            </p>
          </div>
        </div>
      </div>

      {/* Bottom geometric accent - left corner block */}
      <div
        className="absolute bottom-0 left-0 w-24 h-24 sm:w-36 sm:h-36 bg-accent/10 pointer-events-none"
        style={{ clipPath: "polygon(0 0, 0 100%, 100% 100%)" }}
        aria-hidden="true"
      />
    </section>
  );
}
