import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dev requests from Tailscale hostname (all ports)
  allowedDevOrigins: [
    "https://ubuntu-8gb-nbg1-1.tail706c84.ts.net",
    "https://ubuntu-8gb-nbg1-1.tail706c84.ts.net:8443",
  ],
};

export default nextConfig;
