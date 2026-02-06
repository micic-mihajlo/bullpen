import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { ConvexClientProvider } from "@/lib/convex";
import { ToastProvider } from "@/components/toast";
import { ShortcutsProvider } from "@/components/shortcuts-provider";
import { DashboardShell } from "@/components/dashboard-shell";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
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
    <html lang="en" className="dark">
      <body className={`${jetbrainsMono.variable} font-mono antialiased`}>
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
