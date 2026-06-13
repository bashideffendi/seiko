import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Phase 2: catalogue scans served from object storage (e.g. Cloudflare R2).
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.tinyhourtales.com" },
    ],
  },
};

export default nextConfig;
