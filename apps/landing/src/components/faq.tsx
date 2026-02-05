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
    <section id="faq" className="py-28 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-20">
          <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase mb-3">
            FAQ
          </p>
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-text uppercase tracking-tight">
            Questions
          </h2>
        </div>

        {/* FAQ items */}
        <div className="border-t-2 border-text">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b-2 border-text">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full py-7 flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-6 pr-8">
                  <span className="font-mono text-xs text-muted tracking-[0.1em] shrink-0">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-xl sm:text-2xl text-text uppercase tracking-tight group-hover:text-accent transition-colors duration-300 ease-out">
                    {faq.question}
                  </span>
                </div>
                <div className="w-8 h-8 border border-border flex items-center justify-center shrink-0 group-hover:border-accent transition-colors duration-300 ease-out">
                  {openIndex === index ? (
                    <Minus className="w-4 h-4 text-accent" strokeWidth={2} />
                  ) : (
                    <Plus className="w-4 h-4 text-text group-hover:text-accent transition-colors duration-300 ease-out" strokeWidth={2} />
                  )}
                </div>
              </button>
              <div
                className={`grid transition-all duration-300 ease-out ${
                  openIndex === index
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="text-text-secondary leading-relaxed max-w-2xl pl-[3.25rem] pb-7">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
