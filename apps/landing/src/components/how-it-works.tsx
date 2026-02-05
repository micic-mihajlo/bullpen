"use client";

import { motion } from "framer-motion";
import { FileText, Users, Rocket, CheckCircle, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Submit Your Brief",
    description: "Tell us what you need — a landing page, market research, MVP prototype. Be as detailed or high-level as you want.",
    color: "from-blue-500 to-blue-600",
  },
  {
    number: "02",
    icon: Users,
    title: "We Assemble Your Team",
    description: "Our AI agents spin up with the right skills for your project. Research, code, design — whatever it takes.",
    color: "from-purple-500 to-purple-600",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Watch Progress Live",
    description: "Track your project in real-time. See what agents are working on, review drafts, give feedback.",
    color: "from-orange-500 to-orange-600",
  },
  {
    number: "04",
    icon: CheckCircle,
    title: "Receive Deliverables",
    description: "Human-reviewed, polished, ready to use. Code is deployed, research is actionable, designs are production-ready.",
    color: "from-green-500 to-green-600",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-4 sm:px-6 lg:px-8 bg-bg-alt/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-bull/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-block px-4 py-1.5 bg-surface border border-border rounded-full text-sm font-medium text-muted mb-6">
            Simple Process
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-text mb-6">
            How it works
          </h2>
          <p className="text-lg sm:text-xl text-text-secondary leading-relaxed">
            From brief to deliverable in days, not weeks.
          </p>
        </motion.div>

        {/* Steps - Desktop */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Animated connection line */}
            <div className="absolute top-24 left-[12%] right-[12%] h-0.5 bg-border" />
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="absolute top-24 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-accent via-accent to-accent/50 origin-left"
            />

            <div className="grid grid-cols-4 gap-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative"
                >
                  {/* Number circle */}
                  <div className="flex justify-center mb-8">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg relative z-10`}>
                      {step.number}
                    </div>
                  </div>

                  {/* Card */}
                  <div className="bg-surface/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 h-full hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 group">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} bg-opacity-10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                      <step.icon className="w-7 h-7 text-white" />
                    </div>
                    
                    <h3 className="font-display text-xl font-semibold text-text mb-3">
                      {step.title}
                    </h3>
                    
                    <p className="text-text-secondary leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Steps - Mobile/Tablet */}
        <div className="lg:hidden space-y-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="flex gap-4">
                {/* Number and line */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0`}>
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-border mt-4" />
                  )}
                </div>

                {/* Card */}
                <div className="flex-1 bg-surface/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-text mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-16"
        >
          <a
            href="#get-started"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/25 group"
          >
            Start Your Project
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
