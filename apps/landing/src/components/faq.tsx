"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.25, 0.1, 0.25, 1] as const;

const faqs = [
  {
    question: "What can you build?",
    answer: "Anything that grows your business: web apps, mobile apps, dashboards, automations, API integrations, email agents, data pipelines, internal tools. If it can be built with code, we can build it fast and show you every step.",
  },
  {
    question: "What do you mean by 'glass box'?",
    answer: "Unlike traditional agencies that operate as 'black boxes' where you have no visibility, Bullpen is a 'glass box' — you can see through it. Your live dashboard shows every task, every agent working, every dollar spent, in real-time. Nothing is hidden.",
  },
  {
    question: "Can I really watch the AI agents working?",
    answer: "Yes. Your dashboard updates in real-time as agents complete tasks, write code, and run tests. You'll see task descriptions, agent assignments, timestamps, and status updates. You can even view the code commits as they happen.",
  },
  {
    question: "Where is my app hosted?",
    answer: "Your choice. We can host on our infrastructure (fully managed, zero maintenance) or deploy to yours (AWS, GCP, Vercel, etc.). You always own the code and can move it anytime.",
  },
  {
    question: "How detailed is the cost breakdown?",
    answer: "Extremely detailed. You'll see itemized costs for AI compute time, human review hours, infrastructure, and any third-party services. The dashboard updates live as costs accrue, so you always know exactly what you're paying for.",
  },
  {
    question: "What about quality? AI makes mistakes.",
    answer: "Every deliverable goes through human review. Agents do the heavy lifting, humans ensure quality. We guarantee revisions until you're satisfied.",
  },
  {
    question: "What tech stack do you use?",
    answer: "We default to Next.js, Tailwind, and Convex/Supabase — the modern stack that ships fast. But we work with your existing stack if needed.",
  },
  {
    question: "How do you handle confidential info?",
    answer: "Your data is yours. We sign NDAs, use encrypted channels, and never train on your proprietary information. Enterprise plans include additional security.",
  },
  {
    question: "What if I need changes?",
    answer: "Every project includes 2 revision rounds. Need more? Retainer gives you ongoing support. One-off revisions available at hourly rates.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease,
    },
  },
};

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-28 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.3, ease }}
          className="mb-20"
        >
          <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase mb-3">
            FAQ
          </p>
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-text tracking-tight">
            Questions
          </h2>
        </motion.div>

        {/* FAQ items */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="border-t border-border"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="border-b border-border"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full py-7 flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-6 pr-8">
                  <motion.span
                    animate={{ color: openIndex === index ? "var(--color-accent)" : "var(--color-muted)" }}
                    transition={{ duration: 0.3, ease }}
                    className="font-mono text-xs tracking-[0.1em] shrink-0"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </motion.span>
                  <span className="font-display text-xl sm:text-2xl text-text tracking-tight group-hover:text-accent transition-colors duration-300 ease-out">
                    {faq.question}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: openIndex === index ? 45 : 0 }}
                  transition={{ duration: 0.3, ease }}
                  className="w-8 h-8 border border-border flex items-center justify-center shrink-0 group-hover:border-accent transition-colors duration-300 ease-out"
                >
                  <Plus
                    className={`w-4 h-4 transition-colors duration-300 ease-out ${
                      openIndex === index ? "text-accent" : "text-text group-hover:text-accent"
                    }`}
                    strokeWidth={2}
                  />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease }}
                    className="overflow-hidden"
                  >
                    <p className="text-text-secondary leading-relaxed max-w-2xl pl-[3.25rem] pb-7">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
