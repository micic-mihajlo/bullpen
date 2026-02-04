import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use basePath to prefix all routes (pages + API + assets) with /bullpen
  // This way tailscale serve /bullpen → localhost:3001 works correctly
  basePath: "/bullpen",
};

export default nextConfig;
