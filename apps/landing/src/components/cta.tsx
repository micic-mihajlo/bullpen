"use client";

import { ArrowRight, Mail } from "lucide-react";

export function CTA() {
  return (
    <section id="get-started" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-bull rounded-3xl p-12 text-center overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-accent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative z-10">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Ready to ship faster?
            </h2>
            <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
              Tell us what you're building. We'll put together a plan and get started within 24 hours.
            </p>

            {/* Email input + CTA */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <button className="px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 group">
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <p className="text-sm text-white/50 mt-4">
              No spam. We'll reach out within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
