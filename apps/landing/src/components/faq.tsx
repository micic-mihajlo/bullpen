"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How is this different from hiring a dev agency?",
    answer: "Traditional agencies are people-bound — meetings, context switching, bottlenecks. Our AI agents work in parallel, 24/7, with perfect memory.",
  },
  {
    question: "What about quality? AI makes mistakes.",
    answer: "Every deliverable goes through human review. Our agents handle the heavy lifting, humans ensure quality. We guarantee revisions until you're satisfied.",
  },
  {
    question: "What tech stack do you use?",
    answer: "We default to Next.js, Tailwind, and Convex/Supabase — the modern stack. But we can work with your existing stack if needed.",
  },
  {
    question: "How do you handle confidential information?",
    answer: "Your data is yours. We sign NDAs, use encrypted channels, and never train on your proprietary information.",
  },
  {
    question: "What if I need changes after delivery?",
    answer: "Every project includes 2 revision rounds. Need more? Our retainer plan gives you ongoing support.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 bg-bg-alt/30">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-text mb-4">
            FAQ
          </h2>
          <p className="text-text-secondary">
            Common questions answered.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-surface/50 rounded-lg border border-border/50 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-5 py-4 flex items-center justify-between text-left"
              >
                <span className="font-medium text-text">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-muted transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
