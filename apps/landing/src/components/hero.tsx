"use client";

import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-bull/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-border rounded-full text-sm text-text-secondary">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>YC-Backed AI Agency</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-text">
              Your AI
              <br />
              <span className="text-gradient">Workforce</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-text-secondary max-w-lg leading-relaxed">
              Ship products 10x faster with specialized AI agents. 
              Research, code, and design — delivered.
              <br />
              <span className="text-muted">No hiring. No waiting. Just results.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#get-started"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors group"
              >
                Start Your Project
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-border text-text font-medium rounded-lg hover:bg-bg-alt transition-colors"
              >
                See How It Works
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-muted/20 border-2 border-bg flex items-center justify-center text-xs font-mono text-muted"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <div className="text-sm text-text-secondary">
                <span className="font-semibold text-text">50+</span> projects delivered
              </div>
            </div>
          </div>

          {/* Right column - ASCII Bull placeholder */}
          <div className="relative">
            <div className="aspect-square bg-surface/50 rounded-2xl border border-border p-8 flex items-center justify-center">
              {/* ASCII Art placeholder */}
              <pre className="font-mono text-xs sm:text-sm text-bull/80 leading-tight">
{`
         (__) 
         (oo) 
   /------\\/  
  / |    ||   
 *  /\\---/\\  
    ~~   ~~   

 [ BULL ASCII ]
 [ ANIMATION  ]
 [ GOES HERE  ]
`}
              </pre>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 px-3 py-1.5 bg-surface border border-border rounded-lg shadow-sm">
              <span className="text-sm font-mono text-accent">agent.ready()</span>
            </div>
            <div className="absolute -bottom-4 -left-4 px-3 py-1.5 bg-surface border border-border rounded-lg shadow-sm">
              <span className="text-sm font-mono text-muted">task.complete ✓</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
