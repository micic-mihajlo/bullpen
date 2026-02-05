"use client";

import { motion } from "framer-motion";
import { Github, Twitter, Linkedin, ArrowUpRight } from "lucide-react";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Services", href: "#services" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#", badge: "Hiring" },
    { label: "Contact", href: "#get-started" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Security", href: "#" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 border-t border-border/50">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-alt/50 to-bg pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12 mb-16">
          {/* Brand column */}
          <div className="col-span-2">
            <a href="#" className="inline-flex items-center gap-2.5 mb-6 group">
              <span className="text-3xl group-hover:scale-110 transition-transform">🐂</span>
              <span className="font-display font-bold text-2xl text-text">Bullpen</span>
            </a>
            <p className="text-text-secondary leading-relaxed max-w-xs mb-6">
              Your AI workforce. Ship products 10x faster with specialized AI agents.
            </p>
            
            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-surface/80 border border-border/50 flex items-center justify-center text-muted hover:text-accent hover:border-accent/30 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-semibold text-text mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-text-secondary hover:text-accent text-sm transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-semibold text-text mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-text-secondary hover:text-accent text-sm transition-colors inline-flex items-center gap-2"
                  >
                    {link.label}
                    {link.badge && (
                      <span className="px-1.5 py-0.5 bg-accent/10 text-accent text-[10px] font-semibold rounded">
                        {link.badge}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="font-semibold text-text mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-text-secondary hover:text-accent text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold text-text mb-4">Stay updated</h4>
            <p className="text-text-secondary text-sm mb-4">
              Get notified about new features and updates.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 min-w-0 px-4 py-2.5 bg-surface/80 border border-border/50 rounded-l-lg text-sm focus:outline-none focus:border-accent/50"
              />
              <button className="px-4 py-2.5 bg-accent text-white font-medium rounded-r-lg hover:bg-accent-hover transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50 mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} Bullpen. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <p className="text-sm text-muted">
              Built with 🐂 by AI agents (and humans)
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
