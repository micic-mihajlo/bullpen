"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

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
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-bg-alt/50">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-text mb-4">
            FAQ
          </h2>
          <p className="text-lg text-text-secondary">
            Questions? We've got answers.
          </p>
        </div>

        {/* FAQ items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-surface rounded-xl border border-border overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left"
              >
                <span className="font-semibold text-text">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-muted transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-text-secondary leading-relaxed">
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
