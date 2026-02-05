"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";

const faqs = [
  {
    question: "How is this different from hiring a dev agency?",
    answer: "Traditional agencies are people-bound — they have meetings, context switching, and human bottlenecks. Our AI agents work in parallel, 24/7, with perfect memory. You get agency-quality output at software speed.",
  },
  {
    question: "What about quality? AI makes mistakes.",
    answer: "Every deliverable goes through human review before reaching you. Our agents handle the heavy lifting, but humans ensure quality. We guarantee revisions until you're satisfied.",
  },
  {
    question: "What tech stack do you use for MVPs?",
    answer: "We default to Next.js, Tailwind, and Convex/Supabase — the modern stack that ships fast. But we can work with your existing stack if needed. Just tell us your requirements.",
  },
  {
    question: "How do you handle confidential information?",
    answer: "Your data is yours. We sign NDAs, use encrypted channels, and never train on your proprietary information. Enterprise plans include additional security measures.",
  },
  {
    question: "What if I need changes after delivery?",
    answer: "Every project includes 2 revision rounds. Need more? Our retainer plan gives you ongoing support. One-off revisions are also available at hourly rates.",
  },
  {
    question: "Can I see work in progress?",
    answer: "Absolutely. You get access to a real-time dashboard showing what agents are working on, drafts, and progress. Give feedback anytime.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-alt/30 via-bg to-bg pointer-events-none" />

      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-surface border border-border rounded-full text-sm font-medium text-muted mb-6">
            <MessageCircleQuestion className="w-4 h-4" />
            FAQ
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-text mb-6">
            Questions? Answers.
          </h2>
          <p className="text-lg sm:text-xl text-text-secondary leading-relaxed">
            Everything you need to know about working with us.
          </p>
        </motion.div>

        {/* FAQ items */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`bg-surface/80 backdrop-blur-sm rounded-2xl border overflow-hidden transition-all duration-300 ${
                openIndex === index
                  ? "border-accent/30 shadow-lg shadow-accent/5"
                  : "border-border/50 hover:border-accent/20"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left group"
              >
                <span className="font-semibold text-text pr-4 group-hover:text-accent transition-colors">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    openIndex === index
                      ? "bg-accent text-white"
                      : "bg-bg-alt text-muted group-hover:bg-accent/10 group-hover:text-accent"
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>
              
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6">
                      <p className="text-text-secondary leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-6 bg-surface/80 backdrop-blur-sm rounded-2xl border border-border/50">
            <p className="text-text-secondary">
              Still have questions?
            </p>
            <a
              href="#get-started"
              className="px-6 py-2.5 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/25"
            >
              Get in touch
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
