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
    gradient: "from-blue-500 to-cyan-500",
    lightGradient: "from-blue-500/10 to-cyan-500/10",
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
    gradient: "from-accent to-orange-500",
    lightGradient: "from-accent/10 to-orange-500/10",
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
    gradient: "from-purple-500 to-pink-500",
    lightGradient: "from-purple-500/10 to-pink-500/10",
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
    <section id="services" className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px]" />
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
            Our Services
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-text mb-6">
            What we build
          </h2>
          <p className="text-lg sm:text-xl text-text-secondary leading-relaxed">
            Choose a service or tell us what you need. We&apos;ll figure out the rest.
          </p>
        </motion.div>

        {/* Services grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              variants={itemVariants}
              className={`relative group ${service.featured ? 'lg:-mt-6 lg:mb-6' : ''}`}
            >
              <div className={`relative h-full bg-surface/80 backdrop-blur-sm rounded-3xl border overflow-hidden transition-all duration-500 ${
                service.featured
                  ? "border-accent/50 shadow-2xl shadow-accent/10"
                  : "border-border/50 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5"
              }`}>
                {/* Top gradient bar */}
                <div className={`h-1.5 bg-gradient-to-r ${service.gradient}`} />

                {/* Featured badge */}
                {service.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-accent text-white text-xs font-bold rounded-full shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Icon and subtitle */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${service.lightGradient} mb-6`}>
                    <service.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{service.subtitle}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-text mb-6">
                    {service.title}
                  </h3>

                  {/* Items */}
                  <ul className="space-y-4 mb-8">
                    {service.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-text-secondary">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${service.gradient} flex items-center justify-center shrink-0 mt-0.5`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* Pricing */}
                  <div className="pt-6 border-t border-border/50">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-bold text-text">{service.price}</span>
                    </div>
                    <p className="text-sm text-muted mb-6">Delivery: {service.delivery}</p>

                    <a
                      href="#get-started"
                      className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl font-semibold transition-all group/btn ${
                        service.featured
                          ? `bg-gradient-to-r ${service.gradient} text-white hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5`
                          : "bg-bg-alt text-text hover:bg-border"
                      }`}
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
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
          className="mt-16 text-center"
        >
          <p className="text-text-secondary mb-4">
            Need something custom? We can build it.
          </p>
          <a
            href="#get-started"
            className="inline-flex items-center gap-2 text-accent font-semibold hover:underline"
          >
            Tell us about your project
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
