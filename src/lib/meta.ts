import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

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
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: full, description, url: path, siteName: SITE_NAME, type: "website", locale: "en_US" },
    twitter: { card: "summary_large_image", title: full, description },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
