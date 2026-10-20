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
  async rewrites() {
    // Scan assets not shipped in /public come from the private bucket via /scan (signed redirect).
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [{ source: "/catalogue/:year(\\d{4})/:path*", destination: "/scan/:year/:path*" }],
    };
  },
  async redirects() {
    // Friendly aliases for the serial decoder; the query string (?serial=&caliber=) is carried over.
    return [
      { source: "/year-finder", destination: "/tools/serial-decoder", permanent: false },
      { source: "/decoder", destination: "/tools/serial-decoder", permanent: false },
      // 1975 catalogue refs misread by the first extraction, corrected against the
      // catalogue's own index (Oct 2026) — keep the old model URLs working.
      { source: "/catalogue/model/yp001c", destination: "/catalogue/model/yp001", permanent: true },
      { source: "/catalogue/model/bw0xx", destination: "/catalogue/model/bw090", permanent: true },
      { source: "/catalogue/model/9z024", destination: "/catalogue/model/bz024", permanent: true },
    ];
  },
};

export default nextConfig;
