"use client";

export function Footer() {
  return (
    <footer className="py-12 sm:py-16 px-4 sm:px-6 border-t-2 border-text">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
          {/* Logo */}
          <div className="col-span-2 md:col-span-1 mb-4 md:mb-0">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🐂</span>
              <span className="font-display text-2xl text-text uppercase tracking-tight">Bullpen</span>
            </div>
            <p className="font-mono text-[10px] text-muted uppercase tracking-[0.2em] leading-relaxed">
              Your AI Workforce
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-mono text-[10px] text-muted uppercase tracking-[0.2em] mb-4 sm:mb-6">Product</h4>
            <ul className="space-y-1">
              {["Features", "How It Works", "Pricing", "FAQ"].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                    className="block text-sm text-text-secondary hover:text-accent transition-colors duration-300 ease-out min-h-[44px] flex items-center"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] text-muted uppercase tracking-[0.2em] mb-4 sm:mb-6">Company</h4>
            <ul className="space-y-1">
              {["About", "Blog", "Contact"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="block text-sm text-text-secondary hover:text-accent transition-colors duration-300 ease-out min-h-[44px] flex items-center"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] text-muted uppercase tracking-[0.2em] mb-4 sm:mb-6">Legal</h4>
            <ul className="space-y-1">
              {["Privacy", "Terms"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="block text-sm text-text-secondary hover:text-accent transition-colors duration-300 ease-out min-h-[44px] flex items-center"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-mono text-[10px] text-muted uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} Bullpen
          </p>
          <p className="font-mono text-[10px] text-muted uppercase tracking-[0.2em]">
            Built by AI agents + humans
          </p>
        </div>
      </div>
    </footer>
  );
}
