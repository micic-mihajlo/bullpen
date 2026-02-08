import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono, Inter } from "next/font/google";
import { ConvexClientProvider } from "@/lib/convex";
import { ToastProvider } from "@/components/toast";
import { ShortcutsProvider } from "@/components/shortcuts-provider";
import { DashboardShell } from "@/components/dashboard-shell";
import "./globals.css";

const inter = Inter({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bullpen",
  description: "Agent orchestration dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${ibmPlexSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ConvexClientProvider>
          <ToastProvider>
            <ShortcutsProvider>
              <DashboardShell>{children}</DashboardShell>
            </ShortcutsProvider>
          </ToastProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
