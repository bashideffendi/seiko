import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

const OG_ALT = "The Seiko Almanac by Tiny Hour Tales — know your Seiko, by heart.";

/**
 * Per-page metadata with a canonical URL and page-specific Open Graph / Twitter tags.
 * (Without this every page shared the root's generic og:title.) The site-wide
 * opengraph-image.png is still attached by Next's file convention.
 */
export function pageMeta({
  title,
  description,
  path,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  const full = `${title} · ${SITE_NAME}`;
  // A page-level openGraph object replaces the root one, so the share image must be restated here.
  const images = [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: OG_ALT }];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: full, description, url: path, siteName: SITE_NAME, type: "website", locale: "en_US", images },
    twitter: { card: "summary_large_image", title: full, description, images: ["/opengraph-image.png"] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
