import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono, Inter } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
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
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} ${ibmPlexSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
          <ConvexClientProvider>
            <ToastProvider>
              <ShortcutsProvider>
                <header className="fixed right-4 top-3 z-50 flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 backdrop-blur">
                  <SignedOut>
                    <SignInButton />
                    <SignUpButton />
                  </SignedOut>
                  <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                </header>
                <DashboardShell>{children}</DashboardShell>
              </ShortcutsProvider>
            </ToastProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
