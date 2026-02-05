"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "How is this different from a dev agency?",
    answer: "Traditional agencies are people-bound — meetings, context switching, bottlenecks. Our AI agents work in parallel, 24/7, with perfect memory. You get agency-quality output at software speed.",
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

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase mb-2">
            FAQ
          </p>
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-text uppercase tracking-tight">
            Questions
          </h2>
        </div>

        {/* FAQ items */}
        <div className="divide-y-2 divide-text border-y-2 border-text">
          {faqs.map((faq, index) => (
            <div key={index}>
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full py-6 flex items-start justify-between text-left group"
              >
                <span className="font-display text-xl sm:text-2xl text-text uppercase tracking-tight pr-8 group-hover:text-accent transition-colors">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <Minus className="w-6 h-6 text-accent shrink-0" />
                ) : (
                  <Plus className="w-6 h-6 text-text shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="pb-6">
                  <p className="text-text-secondary leading-relaxed max-w-2xl">
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
