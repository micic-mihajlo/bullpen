import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use basePath to prefix all routes (pages + API + assets) with /bullpen
  // This way tailscale serve /bullpen → localhost:3001 works correctly
  basePath: "/bullpen",
  
  // Allow dev requests from Tailscale hostname
  allowedDevOrigins: [
    "https://ubuntu-8gb-nbg1-1.tail706c84.ts.net",
  ],
};

export default nextConfig;
