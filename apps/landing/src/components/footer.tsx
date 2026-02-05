"use client";

export function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 border-t-2 border-text">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Logo */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🐂</span>
              <span className="font-display text-2xl text-text uppercase tracking-tight">Bullpen</span>
            </div>
            <p className="font-mono text-xs text-muted uppercase tracking-wider">
              Your AI Workforce
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-lg text-text uppercase tracking-tight mb-4">Product</h4>
            <ul className="space-y-2">
              {["Features", "How It Works", "Pricing", "FAQ"].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-sm text-text-secondary hover:text-accent transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg text-text uppercase tracking-tight mb-4">Company</h4>
            <ul className="space-y-2">
              {["About", "Blog", "Contact"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-text-secondary hover:text-accent transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg text-text uppercase tracking-tight mb-4">Legal</h4>
            <ul className="space-y-2">
              {["Privacy", "Terms"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-text-secondary hover:text-accent transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-mono text-xs text-muted uppercase tracking-wider">
            © {new Date().getFullYear()} Bullpen
          </p>
          <p className="font-mono text-xs text-muted uppercase tracking-wider">
            Built by AI agents + humans
          </p>
        </div>
      </div>
    </footer>
  );
}
