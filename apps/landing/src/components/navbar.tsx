"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/90 bg-bg/90 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[4.5rem]">
          {/* Logo */}
          <a
            href="#"
            className="flex min-h-[44px] items-center transition-opacity duration-300 hover:opacity-80"
          >
            <span className="font-display text-2xl text-text lowercase">bullpen</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="py-2 font-sans text-sm text-text uppercase tracking-wide transition-colors duration-300 hover:text-accent"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center">
            <a
              href="#get-started"
              className="inline-flex items-center min-h-[44px] px-6 py-3 bg-text text-bg font-sans text-sm uppercase tracking-wide transition-all duration-300 hover:bg-accent"
            >
              Start Project
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden flex h-11 w-11 items-center justify-center border border-border/80 bg-bg-alt/70 transition-colors duration-300 hover:border-accent hover:bg-surface"
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
            className="md:hidden fixed inset-0 top-[4.5rem] z-40 bg-bg/95 backdrop-blur-md"
          >
            <div className="flex h-full flex-col justify-between px-6 py-10">
              <div className="space-y-2">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    custom={i}
                    variants={linkVariants}
                    initial="closed"
                    animate="open"
                    className="block min-h-[44px] border-b-2 border-border py-3 font-display text-4xl text-text uppercase tracking-tight transition-all duration-300 hover:translate-x-1 hover:text-accent"
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
                  className="block min-h-[44px] w-full bg-text py-4 text-center font-mono text-sm text-bg uppercase tracking-wider transition-all duration-300 hover:bg-accent hover:shadow-[0_8px_20px_rgba(15,15,15,0.15)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start Project
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
