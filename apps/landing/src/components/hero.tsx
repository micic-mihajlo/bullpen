"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Bot, Code } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const floatAnimation = {
  y: [0, -8, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/8 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-bull/10 rounded-full blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/3 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column - Text */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-sm font-medium text-accent">
                <Sparkles className="w-4 h-4" />
                AI-Powered Agency
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-text leading-[1.1]"
            >
              Your AI
              <br />
              <span className="relative">
                <span className="text-gradient">Workforce</span>
                <motion.span
                  className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-accent to-accent/0 rounded-full"
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="text-lg sm:text-xl text-text-secondary max-w-lg leading-relaxed"
            >
              Ship products <span className="text-text font-semibold">10x faster</span> with 
              specialized AI agents. Research, code, and design — delivered.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <a
                href="#get-started"
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white font-semibold rounded-xl overflow-hidden transition-all hover:shadow-lg hover:shadow-accent/25"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Your Project
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-hover to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-surface/80 backdrop-blur border border-border text-text font-medium rounded-xl hover:bg-surface hover:border-accent/30 transition-all"
              >
                See How It Works
              </a>
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap items-center gap-8 pt-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-xl font-bold text-text">50+</div>
                  <div className="text-sm text-muted">Projects shipped</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-xl font-bold text-text">24/7</div>
                  <div className="text-sm text-muted">Agent uptime</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Code className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-xl font-bold text-text">10x</div>
                  <div className="text-sm text-muted">Faster delivery</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right column - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative lg:pl-8"
          >
            {/* Main visual container */}
            <div className="relative aspect-square">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-accent/20 via-transparent to-bull/20 blur-xl" />
              
              {/* Main card */}
              <div className="relative h-full bg-surface/80 backdrop-blur-sm rounded-3xl border border-border/50 p-8 flex flex-col items-center justify-center overflow-hidden">
                {/* Grid pattern background */}
                <div 
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                />
                
                {/* ASCII Art placeholder - Razeen will replace */}
                <pre className="font-mono text-sm sm:text-base text-bull leading-tight whitespace-pre z-10">
{`         (__)
         (oo)
   /------\\/
  / |    ||
 *  /\\---/\\
    ~~   ~~`}
                </pre>
                
                <div className="mt-6 text-center z-10">
                  <p className="font-mono text-xs text-muted uppercase tracking-wider">
                    [ Razeen&apos;s ASCII Animation ]
                  </p>
                </div>
              </div>

              {/* Floating badges */}
              <motion.div
                animate={floatAnimation}
                className="absolute -top-3 -right-3 px-4 py-2 bg-surface border border-border rounded-xl shadow-lg"
              >
                <span className="text-sm font-mono">
                  <span className="text-accent">●</span> agent.ready()
                </span>
              </motion.div>
              
              <motion.div
                animate={{
                  ...floatAnimation,
                  transition: { ...floatAnimation.transition, delay: 1 },
                }}
                className="absolute -bottom-3 -left-3 px-4 py-2 bg-surface border border-border rounded-xl shadow-lg"
              >
                <span className="text-sm font-mono text-muted">
                  task.complete <span className="text-green-500">✓</span>
                </span>
              </motion.div>

              <motion.div
                animate={{
                  ...floatAnimation,
                  transition: { ...floatAnimation.transition, delay: 0.5 },
                }}
                className="absolute top-1/2 -right-6 px-3 py-1.5 bg-accent text-white text-xs font-mono rounded-lg shadow-lg"
              >
                shipping...
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
