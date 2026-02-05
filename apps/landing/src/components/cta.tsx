"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, Sparkles, Zap } from "lucide-react";

export function CTA() {
  return (
    <section id="get-started" className="py-28 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="max-w-5xl mx-auto"
      >
        <div className="relative rounded-[2.5rem] overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-bull via-bull to-accent/80" />
          
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.15, 0.1],
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-0 left-0 w-96 h-96 bg-accent rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ duration: 10, repeat: Infinity, delay: 2 }}
              className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 opacity-5"
            />
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{ duration: 6, repeat: Infinity, delay: 1 }}
              className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2"
            />
          </div>

          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Content */}
          <div className="relative z-10 px-8 py-16 sm:px-16 sm:py-20 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white/80 mb-8"
            >
              <Zap className="w-4 h-4 text-accent" />
              Response within 24 hours
            </motion.div>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
            >
              Ready to ship
              <br />
              <span className="relative">
                faster?
                <Sparkles className="absolute -top-2 -right-8 w-6 h-6 text-accent" />
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Tell us what you&apos;re building. We&apos;ll put together a plan
              and get your AI workforce started within 24 hours.
            </motion.p>

            {/* Email form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="max-w-lg mx-auto"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="email"
                    placeholder="you@company.com"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent shadow-lg"
                  />
                </div>
                <button className="px-8 py-4 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/50 hover:-translate-y-0.5 flex items-center justify-center gap-2 group whitespace-nowrap">
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <p className="text-sm text-white/40 mt-4">
                No spam, ever. Unsubscribe anytime.
              </p>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-white/50"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                50+ projects shipped
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                100% satisfaction
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                NDA available
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
