"use client";

export function Footer() {
  return (
    <footer className="border-t-2 border-text bg-bg-alt/35 px-4 py-14 sm:px-6 sm:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 grid grid-cols-2 gap-10 sm:mb-16 sm:gap-12 md:grid-cols-4">
          {/* Logo */}
          <div className="col-span-2 md:col-span-1 mb-4 md:mb-0">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-2xl">🐂</span>
              <span className="font-display text-2xl text-text uppercase tracking-tight">Bullpen</span>
            </div>
            <p className="font-mono text-[10px] text-muted uppercase tracking-[0.2em] leading-relaxed">
              Your AI Workforce
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 font-mono text-[10px] text-muted uppercase tracking-[0.2em] sm:mb-6">Product</h4>
            <ul className="space-y-2">
              {["Features", "How It Works", "Pricing", "FAQ"].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                    className="flex min-h-[44px] items-center text-sm text-text-secondary transition-all duration-300 ease-out hover:translate-x-0.5 hover:text-accent"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-mono text-[10px] text-muted uppercase tracking-[0.2em] sm:mb-6">Company</h4>
            <ul className="space-y-2">
              {["About", "Blog", "Contact"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="flex min-h-[44px] items-center text-sm text-text-secondary transition-all duration-300 ease-out hover:translate-x-0.5 hover:text-accent"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-mono text-[10px] text-muted uppercase tracking-[0.2em] sm:mb-6">Legal</h4>
            <ul className="space-y-2">
              {["Privacy", "Terms"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="flex min-h-[44px] items-center text-sm text-text-secondary transition-all duration-300 ease-out hover:translate-x-0.5 hover:text-accent"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-8 sm:flex-row">
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
