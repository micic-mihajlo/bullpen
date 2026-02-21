import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Bullpen",
  description: "Agent orchestration dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authButtonBaseClass =
    "inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2410c] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-sans antialiased">
          <ConvexClientProvider>
            <ToastProvider>
              <ShortcutsProvider>
                <header className="fixed left-3 right-3 top-3 z-50 flex justify-end sm:left-auto sm:right-4 sm:top-4">
                  <div className="animate-header-enter flex min-h-12 items-center rounded-2xl border border-[#e8e5de] bg-white/90 p-1.5 shadow-[0_8px_24px_rgba(26,26,26,0.08)] backdrop-blur-md">
                    <SignedOut>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="hidden pr-2 sm:block">
                          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b6560]">
                            Bullpen Dashboard
                          </p>
                          <p className="text-xs font-medium text-[#1f1b16]">
                            Sign in to access your workspace
                          </p>
                        </div>
                        <SignInButton mode="modal">
                          <button
                            type="button"
                            className={`${authButtonBaseClass} border border-[#d8d4cb] bg-white text-[#1f1b16] hover:border-[#c7c1b6] hover:bg-[#faf9f6]`}
                          >
                            Sign in
                          </button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                          <button
                            type="button"
                            className={`${authButtonBaseClass} bg-[#1a1a1a] text-white hover:bg-[#2b2b2b]`}
                          >
                            Sign up
                          </button>
                        </SignUpButton>
                      </div>
                    </SignedOut>
                    <SignedIn>
                      <div className="flex items-center gap-3 px-2">
                        <div className="hidden text-right sm:block">
                          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b6560]">
                            Account
                          </p>
                          <p className="text-xs font-medium text-[#1f1b16]">
                            Signed in
                          </p>
                        </div>
                        <UserButton
                          afterSignOutUrl="/"
                          appearance={{
                            elements: {
                              avatarBox:
                                "h-9 w-9 border border-[#d8d4cb] shadow-[0_1px_4px_rgba(26,26,26,0.14)]",
                              userButtonPopoverCard:
                                "rounded-2xl border border-[#e8e5de] shadow-[0_20px_38px_rgba(26,26,26,0.12)]",
                            },
                          }}
                        />
                      </div>
                    </SignedIn>
                  </div>
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
