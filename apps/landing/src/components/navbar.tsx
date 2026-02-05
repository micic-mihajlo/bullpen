"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "Process" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

const overlayVariants = {
  closed: {
    opacity: 0,
    transition: { duration: 0.3, ease: "easeOut" as const, when: "afterChildren" as const },
  },
  open: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" as const, when: "beforeChildren" as const },
  },
};

const linkVariants = {
  closed: { opacity: 0, x: -24 },
  open: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" as const, delay: i * 0.08 },
  }),
};

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 min-h-[44px]">
            <span className="text-xl">🐂</span>
            <span className="font-display text-xl text-text uppercase tracking-tight">Bullpen</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-mono text-xs text-text-secondary hover:text-accent transition-colors uppercase tracking-wider"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center">
            <a
              href="#get-started"
              className="px-4 py-2 bg-text text-bg font-mono text-xs uppercase tracking-wider hover:bg-accent transition-colors"
            >
              Start Project
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden flex items-center justify-center w-11 h-11"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-text" />
            ) : (
              <Menu className="w-5 h-5 text-text" />
            )}
          </button>
        </div>
      </div>

      {/* Full-screen mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="md:hidden fixed inset-0 top-16 bg-bg/98 backdrop-blur-md z-40"
          >
            <div className="flex flex-col justify-between h-full px-6 py-12">
              <div className="space-y-2">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    custom={i}
                    variants={linkVariants}
                    initial="closed"
                    animate="open"
                    className="block font-display text-4xl text-text uppercase tracking-tight min-h-[44px] py-3 border-b-2 border-border hover:text-accent transition-colors duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.35 }}
              >
                <a
                  href="#get-started"
                  className="block w-full py-4 bg-text text-bg text-center font-mono text-sm uppercase tracking-wider hover:bg-accent transition-colors min-h-[44px]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start Project
                </a>
                <p className="font-mono text-[10px] text-muted uppercase tracking-[0.2em] text-center mt-6">
                  Your AI Workforce
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
