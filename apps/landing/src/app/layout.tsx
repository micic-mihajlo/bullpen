import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bullpen - Your AI Workforce",
  description: "Ship products 10x faster with specialized AI agents. Research, code, and design — delivered.",
  keywords: ["AI", "agents", "automation", "development", "research", "startup"],
  openGraph: {
    title: "Bullpen - Your AI Workforce",
    description: "Ship products 10x faster with specialized AI agents.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bullpen - Your AI Workforce",
    description: "Ship products 10x faster with specialized AI agents.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="dot-grid" />
        <div className="grain" />
        {children}
      </body>
    </html>
  );
}
