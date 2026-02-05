"use client";

import { motion } from "framer-motion";

const logos = [
  "Y Combinator",
  "Vercel",
  "Stripe",
  "Linear",
  "Notion",
  "Figma",
  "Supabase",
  "Railway",
];

export function LogoCloud() {
  // Double the logos for seamless infinite scroll
  const doubledLogos = [...logos, ...logos];

  return (
    <section className="py-16 border-y border-border/50 bg-bg-alt/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted mb-10"
        >
          Trusted by teams building the future
        </motion.p>
        
        {/* Marquee container */}
        <div className="relative">
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-bg-alt/30 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-bg-alt/30 to-transparent z-10 pointer-events-none" />
          
          {/* Scrolling logos */}
          <motion.div
            animate={{ x: [0, -50 * logos.length] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 20,
                ease: "linear",
              },
            }}
            className="flex items-center gap-16"
          >
            {doubledLogos.map((logo, index) => (
              <div
                key={`${logo}-${index}`}
                className="shrink-0 group"
              >
                <span className="text-xl font-semibold text-text-secondary/40 group-hover:text-text-secondary transition-colors duration-300 whitespace-nowrap">
                  {logo}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
