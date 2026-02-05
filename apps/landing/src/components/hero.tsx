"use client";

import { ArrowRight } from "lucide-react";
import { AsciiBull } from "./ascii-bull";

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text */}
          <div className="space-y-6">
            <p className="text-sm font-medium text-accent">
              AI-Powered Agency
            </p>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text leading-[1.1]">
              Your AI
              <br />
              <span className="text-accent">Workforce</span>
            </h1>

            <p className="text-lg text-text-secondary max-w-md leading-relaxed">
              Ship products 10x faster with specialized AI agents. 
              Research, code, and design — delivered.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="#get-started"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover transition-colors"
              >
                Start Your Project
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-text font-medium rounded-lg hover:bg-surface transition-colors"
              >
                How It Works
              </a>
            </div>

            <div className="flex items-center gap-6 pt-4 text-sm text-muted">
              <span>50+ projects shipped</span>
              <span>•</span>
              <span>10x faster delivery</span>
            </div>
          </div>

          {/* Right column - ASCII Bull */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="p-8 bg-surface/50 rounded-2xl border border-border/50">
              <AsciiBull />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
