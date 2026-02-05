import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tailscale serve strips the /bullpen prefix when forwarding,
  // so Next.js should serve at root. We use assetPrefix to ensure
  // static assets load correctly when accessed via /bullpen path.
  assetPrefix: "/bullpen",
  
  // Allow dev requests from Tailscale hostname
  allowedDevOrigins: [
    "https://ubuntu-8gb-nbg1-1.tail706c84.ts.net",
  ],
};

export default nextConfig;
