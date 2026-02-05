"use client";

import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section id="get-started" className="py-24 px-4 sm:px-6 bg-text text-bg">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase mb-4">
              Get Started
            </p>
            <h2 className="font-display text-5xl sm:text-6xl text-bg uppercase tracking-tight mb-6">
              Ready To
              <br />
              Ship?
            </h2>
            <p className="text-bg/70 leading-relaxed">
              Tell us what you&apos;re building. We&apos;ll put together a plan and get started within 24 hours.
            </p>
          </div>

          {/* Right - Form */}
          <div className="space-y-4">
            <div>
              <label className="font-mono text-xs text-bg/50 uppercase tracking-wider block mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                className="w-full px-4 py-4 bg-transparent border-2 border-bg/30 text-bg placeholder:text-bg/30 focus:outline-none focus:border-accent"
              />
            </div>
            <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-accent text-bg font-medium uppercase tracking-wider text-sm hover:bg-accent-hover transition-colors">
              Start Your Project
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="font-mono text-xs text-bg/50 text-center uppercase tracking-wider">
              Response within 24 hours
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
