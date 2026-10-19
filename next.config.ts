import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Phase 2: catalogue scans served from object storage (e.g. Cloudflare R2).
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "tinyhourtales.com" },
      { protocol: "https", hostname: "**.tinyhourtales.com" },
    ],
  },
  async redirects() {
    // Friendly aliases for the serial decoder; the query string (?serial=&caliber=) is carried over.
    return [
      { source: "/year-finder", destination: "/tools/serial-decoder", permanent: false },
      { source: "/decoder", destination: "/tools/serial-decoder", permanent: false },
    ];
  },
};

export default nextConfig;
