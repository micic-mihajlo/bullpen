"use client";

import { motion } from "framer-motion";

const ease = [0.25, 0.1, 0.25, 1] as const;

const steps = [
  {
    number: "01",
    title: "Brief",
    description: "Tell us what you need. Landing page, research report, MVP — be as detailed or high-level as you want.",
  },
  {
    number: "02",
    title: "Assemble",
    description: "We spin up the right agents for your project. Research, code, design — whatever it takes.",
  },
  {
    number: "03",
    title: "Execute",
    description: "Track progress in real-time. See what agents are working on. Give feedback anytime.",
  },
  {
    number: "04",
    title: "Deliver",
    description: "Human-reviewed, polished, ready to use. Code deployed, research actionable, designs production-ready.",
  },
];

const stepVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.3,
      ease,
    },
  }),
};

const dotVariants = {
  hidden: { scale: 0 },
  visible: (i: number) => ({
    scale: 1,
    transition: {
      delay: i * 0.15 + 0.1,
      duration: 0.3,
      ease,
    },
  }),
};

const lineVariants = {
  hidden: { scaleX: 0, scaleY: 0 },
  visible: (i: number) => ({
    scaleX: 1,
    scaleY: 1,
    transition: {
      delay: i * 0.15,
      duration: 0.4,
      ease,
    },
  }),
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.3, ease }}
          className="mb-20"
        >
          <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase mb-3">
            Process
          </p>
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-text uppercase tracking-tight">
            How It Works
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-4 gap-0">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              custom={index}
              variants={stepVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="relative group pb-10 md:pb-0 md:pr-8"
            >
              {/* Timeline line */}
              <motion.div
                custom={index}
                variants={lineVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                className="absolute left-0 top-0 w-[2px] h-full md:w-full md:h-[2px] bg-border origin-top md:origin-left"
              />

              {/* Active dot on timeline */}
              <motion.div
                custom={index}
                variants={dotVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                whileHover={{ scale: 1.5, backgroundColor: "var(--color-accent)" }}
                transition={{ duration: 0.3, ease }}
                className="absolute left-[-5px] top-[-5px] md:left-0 md:top-[-5px] w-3 h-3 bg-border group-hover:bg-accent transition-colors duration-300 ease-out z-10"
              />

              <div className="space-y-4 pl-8 md:pl-0 md:pt-8">
                <span className="font-mono text-xs text-accent tracking-[0.2em] uppercase">
                  Step {step.number}
                </span>
                <h3 className="font-display text-4xl md:text-5xl text-text uppercase tracking-tight group-hover:text-accent transition-colors duration-300 ease-out">
                  {step.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.3, ease }}
          className="mt-20 pt-8 border-t-2 border-text flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <p className="text-text-secondary">
            From brief to deliverable in days, not weeks.
          </p>
          <motion.a
            href="#get-started"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.3, ease }}
            className="inline-flex items-center gap-2 font-mono text-sm text-accent hover:text-accent-hover uppercase tracking-[0.15em] transition-colors duration-300 ease-out"
          >
            Start Your Project
            <span className="inline-block">→</span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
