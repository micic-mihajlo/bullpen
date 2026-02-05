"use client";

import { ArrowRight } from "lucide-react";
import { AsciiBull } from "./ascii-bull";

export function Hero() {
  return (
    <section className="relative min-h-screen pt-20">
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-border) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-border) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-4 items-end">
          {/* Main headline - takes 7 cols */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-2">
              <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">
                AI-Powered Agency
              </p>
              <h1 className="font-display text-[clamp(4rem,12vw,10rem)] leading-[0.85] tracking-tight text-text uppercase">
                Your AI
                <br />
                <span className="text-accent">Workforce</span>
              </h1>
            </div>

            <p className="text-lg sm:text-xl text-text-secondary max-w-md leading-relaxed">
              Ship products 10x faster with specialized AI agents. 
              Research, code, design — delivered.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="#get-started"
                className="group inline-flex items-center gap-3 px-6 py-4 bg-text text-bg font-medium uppercase tracking-wider text-sm hover:bg-accent transition-colors"
              >
                Start Project
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-3 px-6 py-4 border-2 border-text text-text font-medium uppercase tracking-wider text-sm hover:bg-text hover:text-bg transition-colors"
              >
                How It Works
              </a>
            </div>
          </div>

          {/* ASCII Bull - takes 5 cols, offset upward */}
          <div className="lg:col-span-5 lg:-mb-16">
            <div className="relative">
              {/* Label */}
              <div className="absolute -top-8 left-0 font-mono text-xs text-muted tracking-wider uppercase">
                Agent Status: Online
              </div>
              
              {/* Bull container */}
              <div className="bg-surface border-2 border-text p-8 sm:p-12">
                <AsciiBull />
              </div>

              {/* Corner accent */}
              <div className="absolute -bottom-2 -right-2 w-full h-full border-2 border-accent -z-10" />
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-20 pt-8 border-t-2 border-text">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="font-display text-4xl sm:text-5xl text-text">50+</div>
              <div className="font-mono text-xs text-muted uppercase tracking-wider mt-1">Projects Shipped</div>
            </div>
            <div>
              <div className="font-display text-4xl sm:text-5xl text-text">10X</div>
              <div className="font-mono text-xs text-muted uppercase tracking-wider mt-1">Faster Delivery</div>
            </div>
            <div>
              <div className="font-display text-4xl sm:text-5xl text-text">24/7</div>
              <div className="font-mono text-xs text-muted uppercase tracking-wider mt-1">Agent Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
