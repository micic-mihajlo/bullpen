"use client";

import { motion } from "framer-motion";
import { ArrowRight, FileSearch, Code2, Palette, Check } from "lucide-react";

const services = [
  {
    title: "Research",
    subtitle: "Deep market intelligence",
    icon: FileSearch,
    items: [
      "Competitor analysis",
      "Market sizing (TAM/SAM/SOM)",
      "User interview synthesis",
      "Trend reports",
      "Due diligence research",
    ],
    price: "From $500",
    delivery: "3-5 days",
  },
  {
    title: "MVP Development",
    subtitle: "Ship fast, iterate faster",
    icon: Code2,
    items: [
      "Full-stack web apps",
      "Landing pages",
      "Internal tools",
      "API integrations",
      "Database design",
    ],
    price: "From $5,000",
    delivery: "1-2 weeks",
    featured: true,
  },
  {
    title: "Design",
    subtitle: "Beautiful, functional UI",
    icon: Palette,
    items: [
      "UI/UX design",
      "Design systems",
      "Prototypes",
      "Brand guidelines",
      "Marketing assets",
    ],
    price: "From $2,000",
    delivery: "1 week",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function Services() {
  return (
    <section id="services" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-16 sm:mb-20"
        >
          <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase mb-2">
            Services
          </p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-text uppercase tracking-tight mb-4">
            What We Build
          </h2>
          <p className="text-lg text-text-secondary leading-relaxed">
            Choose a service or tell us what you need. We&apos;ll figure out the rest.
          </p>
        </motion.div>

        {/* Services grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-start"
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              variants={itemVariants}
              className={`relative group ${service.featured ? "lg:-mt-4 lg:mb-4" : ""}`}
            >
              <div
                className={`relative h-full bg-surface border-2 overflow-hidden transition-colors duration-300 ${
                  service.featured
                    ? "border-accent"
                    : "border-text hover:border-accent"
                }`}
              >
                {/* Top accent bar */}
                {service.featured && (
                  <div className="h-1 bg-accent" />
                )}

                {/* Featured badge */}
                {service.featured && (
                  <div className="absolute top-0 right-0">
                    <span className="block px-3 py-1.5 bg-accent text-bg font-mono text-[10px] uppercase tracking-wider">
                      Popular
                    </span>
                  </div>
                )}

                <div className="p-6 sm:p-8">
                  {/* Icon and subtitle */}
                  <div className="flex items-center gap-2 mb-6">
                    <service.icon className="w-4 h-4 text-accent" />
                    <span className="font-mono text-xs text-muted uppercase tracking-wider">
                      {service.subtitle}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-2xl sm:text-3xl text-text uppercase tracking-tight mb-6">
                    {service.title}
                  </h3>

                  {/* Items */}
                  <ul className="space-y-3 sm:space-y-4 mb-8">
                    {service.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-text-secondary text-sm sm:text-base">
                        <div className="w-5 h-5 border-2 border-accent flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-accent" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* Pricing */}
                  <div className="pt-6 border-t-2 border-border">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-display text-3xl text-text">{service.price}</span>
                    </div>
                    <p className="font-mono text-[10px] text-muted uppercase tracking-wider mb-6">
                      Delivery: {service.delivery}
                    </p>

                    <a
                      href="#get-started"
                      className={`flex items-center justify-center gap-2 w-full py-4 font-mono text-xs uppercase tracking-wider transition-colors duration-300 min-h-[44px] ${
                        service.featured
                          ? "bg-accent text-bg hover:bg-text"
                          : "bg-text text-bg hover:bg-accent"
                      }`}
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Custom project CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 sm:mt-16"
        >
          <p className="text-text-secondary mb-4">
            Need something custom? We can build it.
          </p>
          <a
            href="#get-started"
            className="inline-flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-wider hover:text-text transition-colors min-h-[44px]"
          >
            Tell us about your project
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
