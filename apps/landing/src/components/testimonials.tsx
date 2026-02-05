"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    quote: "We needed market research for our Series A pitch. Bullpen delivered a 50-page report in 4 days that would have taken us weeks to compile.",
    author: "Sarah Chen",
    role: "CEO, TechStartup",
    avatar: "SC",
    rating: 5,
    highlight: "50-page report in 4 days",
  },
  {
    quote: "The MVP they built is now our production app. Clean code, great documentation, and they even set up CI/CD. Unreal.",
    author: "Marcus Johnson",
    role: "Founder, DevTools Co",
    avatar: "MJ",
    rating: 5,
    highlight: "Production-ready code",
    featured: true,
  },
  {
    quote: "I was skeptical about AI agencies. Then I saw the quality. Now I send all my side projects to Bullpen.",
    author: "Alex Rivera",
    role: "Solo Founder",
    avatar: "AR",
    rating: 5,
    highlight: "Consistent quality",
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
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5 },
  },
};

export function Testimonials() {
  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg-alt/30 to-bg pointer-events-none" />
      
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
            Testimonials
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-text mb-6">
            What founders say
          </h2>
          <p className="text-lg sm:text-xl text-text-secondary leading-relaxed">
            Don&apos;t take our word for it. Here&apos;s what our clients have to say.
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              variants={itemVariants}
              className={`relative group ${testimonial.featured ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              <div className={`h-full bg-surface/80 backdrop-blur-sm rounded-2xl border p-8 relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                testimonial.featured 
                  ? 'border-accent/30 shadow-lg shadow-accent/10' 
                  : 'border-border/50 hover:border-accent/20 hover:shadow-accent/5'
              }`}>
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Quote icon */}
                <Quote className="absolute top-6 right-6 w-10 h-10 text-accent/10 group-hover:text-accent/20 transition-colors" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-text leading-relaxed mb-6 relative">
                  <span className="text-2xl text-accent/30 absolute -left-2 -top-2">&ldquo;</span>
                  {testimonial.quote}
                  <span className="text-2xl text-accent/30">&rdquo;</span>
                </blockquote>

                {/* Highlight badge */}
                {testimonial.highlight && (
                  <div className="inline-block px-3 py-1 bg-accent/10 rounded-full text-xs font-medium text-accent mb-6">
                    {testimonial.highlight}
                  </div>
                )}

                {/* Author */}
                <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-text">{testimonial.author}</p>
                    <p className="text-sm text-muted">{testimonial.role}</p>
                  </div>
                </div>

                {/* Featured badge */}
                {testimonial.featured && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1 bg-accent text-white text-xs font-semibold rounded-b-lg">
                      Featured
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {[
            { value: "50+", label: "Projects Delivered" },
            { value: "4.9", label: "Average Rating" },
            { value: "3 days", label: "Avg. Delivery Time" },
            { value: "100%", label: "Client Satisfaction" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl sm:text-4xl font-bold text-text mb-1">{stat.value}</div>
              <div className="text-sm text-muted">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
