import type { MetadataRoute } from "next";
import { CALIBERS } from "@/data/calibers";
import { caliberSlug } from "@/lib/seiko/caliberKey";
import { PAGE_ENTRIES } from "@/lib/modelIndex";
import { SCAN_SETS } from "@/lib/scans";
import { SITE_URL } from "@/lib/site";

const STATIC = [
  { path: "/", priority: 1 },
  { path: "/tools/serial-decoder", priority: 0.9 },
  { path: "/tools/caliber-lookup", priority: 0.8 },
  { path: "/catalogue", priority: 0.8 },
  { path: "/catalogue/archive", priority: 0.7 },
  { path: "/catalogue/models", priority: 0.7 },
  { path: "/tools", priority: 0.6 },
  { path: "/tools/vintage-case-code", priority: 0.6 },
  { path: "/learn", priority: 0.5 },
  { path: "/learn/region-codes", priority: 0.6 },
  { path: "/about", priority: 0.3 },
  { path: "/disclaimer", priority: 0.3 },
  { path: "/contact", priority: 0.3 },
];

// Only indexable pages: stubs ("coming soon") and thin model fragments are left out.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...STATIC.map((s) => ({ url: `${SITE_URL}${s.path === "/" ? "" : s.path}`, priority: s.priority })),
    ...Object.keys(SCAN_SETS).map((id) => ({ url: `${SITE_URL}/catalogue/read/${id}`, priority: 0.6 })),
    ...CALIBERS.map((c) => ({ url: `${SITE_URL}/caliber/${caliberSlug(c.caliber)}`, priority: 0.5 })),
    ...PAGE_ENTRIES.map((e) => ({ url: `${SITE_URL}/catalogue/model/${e.slug}`, priority: 0.4 })),
  ];
}
