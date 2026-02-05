"use client";

import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section id="get-started" className="py-20 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-text mb-4">
          Ready to ship faster?
        </h2>
        <p className="text-text-secondary mb-8">
          Tell us what you&apos;re building. We&apos;ll get started within 24 hours.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          <input
            type="email"
            placeholder="you@company.com"
            className="flex-1 px-4 py-3 rounded-lg bg-surface border border-border text-text placeholder:text-muted focus:outline-none focus:border-accent"
          />
          <button className="px-6 py-3 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover transition-colors flex items-center justify-center gap-2">
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-muted mt-4">
          No spam. Response within 24 hours.
        </p>
      </div>
    </section>
  );
}
