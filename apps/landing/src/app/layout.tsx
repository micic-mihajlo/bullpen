import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bullpen — Glass Box AI Development",
  description: "The first software agency where you watch your project being built in real-time. AI agents do the work. Humans ensure quality. You see everything.",
  keywords: ["AI development", "software agency", "transparent development", "real-time tracking", "AI agents", "software transparency", "glass box development"],
  openGraph: {
    title: "Bullpen — Glass Box AI Development",
    description: "Watch your project being built in real-time. AI agents do the work. You see everything.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bullpen — Glass Box AI Development",
    description: "Watch your project being built in real-time. AI agents do the work. You see everything.",
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
        {children}
      </body>
    </html>
  );
}
