// Digitised catalogue scans: page images for the in-site reader, and per-watch photos cut
// from those pages (see scripts/digitize_catalog.py).
//
// Every asset URL goes through catalogueAssetUrl(), so moving the files to object storage
// (Cloudflare R2) is one environment variable: NEXT_PUBLIC_CATALOGUE_ASSET_BASE, e.g.
// "https://scans.tinyhourtales.com" — with the same key layout, `<year>/<catalogue-id>/…`.

import scan1966jdm1s from "@/data/scans/1966-1966-seiko-jdm-catalog-no-1-supplement.json";
import scan1967jdm2 from "@/data/scans/1967-1967-seiko-jdm-catalog-no-2.json";
import scan1968jdm1 from "@/data/scans/1968-1968-seiko-jdm-catalog-no-1.json";
import scan1968jdm2s from "@/data/scans/1968-1968-seiko-jdm-catalog-no-2-supplement.json";
import scan1968jdm2 from "@/data/scans/1968-1968-seiko-jdm-catalog-no-2.json";
import scan1969jdm1 from "@/data/scans/1969-1969-seiko-jdm-catalog-no-1.json";
import scan1969jdm2 from "@/data/scans/1969-1969-seiko-jdm-catalog-no-2.json";
import scan1972lux from "@/data/scans/1972-1972-seiko-luxury.json";
import scan1974v2 from "@/data/scans/1974-1974-seiko-v2.json";
import scan1975 from "@/data/scans/1975-1975-seiko-catalog.json";
import scan1976v1 from "@/data/scans/1976-1976-seiko-v1.json";
import scan1977v1 from "@/data/scans/1977-1977-seiko-v1.json";

/** Where catalogue assets live: /catalogue in /public today, a CDN origin tomorrow. */
export const CATALOGUE_ASSET_BASE = trimSlash(process.env.NEXT_PUBLIC_CATALOGUE_ASSET_BASE || "/catalogue");

export interface ScanPage {
  /** Scan index (0 = first page of the PDF); records' `page` refers to this. */
  n: number;
  /** Printed page label: "Cover", "1", …, "Index", "Back cover". */
  label: string;
  w: number;
  h: number;
}

export interface ScanSet {
  id: string;
  year: number;
  title: string;
  /** Source file name, for provenance. */
  source: string;
  /** Asset directory under the base: `<year>/<catalogue-id>`. */
  dir: string;
  thumbWidth: number;
  pages: ScanPage[];
}

/** Normalised [x, y, w, h] of a watch photo on its page (0–1, top-left origin). */
export type BBox = [number, number, number, number];

// Catalogues whose scans have been digitised, keyed by catalogue id.
export const SCAN_SETS: Record<string, ScanSet> = {
  "1966-1966-seiko-jdm-catalog-no-1-supplement": scan1966jdm1s as ScanSet,
  "1967-1967-seiko-jdm-catalog-no-2": scan1967jdm2 as ScanSet,
  "1968-1968-seiko-jdm-catalog-no-1": scan1968jdm1 as ScanSet,
  "1968-1968-seiko-jdm-catalog-no-2-supplement": scan1968jdm2s as ScanSet,
  "1968-1968-seiko-jdm-catalog-no-2": scan1968jdm2 as ScanSet,
  "1969-1969-seiko-jdm-catalog-no-1": scan1969jdm1 as ScanSet,
  "1969-1969-seiko-jdm-catalog-no-2": scan1969jdm2 as ScanSet,
  "1972-1972-seiko-luxury": scan1972lux as ScanSet,
  "1974-1974-seiko-v2": scan1974v2 as ScanSet,
  "1975-1975-seiko-catalog": scan1975 as ScanSet,
  "1976-1976-seiko-v1": scan1976v1 as ScanSet,
  "1977-1977-seiko-v1": scan1977v1 as ScanSet,
};

export function scanFor(catalogId: string): ScanSet | null {
  return SCAN_SETS[catalogId] ?? null;
}

function trimSlash(s: string): string {
  return s.replace(/\/+$/, "");
}

/** Absolute-or-root URL of a file inside a catalogue's asset directory. */
export function catalogueAssetUrl(dir: string, rel: string, base: string = CATALOGUE_ASSET_BASE): string {
  return `${trimSlash(base)}/${dir.replace(/^\/+|\/+$/g, "")}/${rel.replace(/^\/+/, "")}`;
}

const pad3 = (n: number) => String(n).padStart(3, "0");

export function pageImageUrl(set: ScanSet, n: number, base?: string): string {
  return catalogueAssetUrl(set.dir, `pages/p${pad3(n)}.webp`, base);
}

export function pageThumbUrl(set: ScanSet, n: number, base?: string): string {
  return catalogueAssetUrl(set.dir, `thumbs/p${pad3(n)}.webp`, base);
}

/** A record's cropped photo (`watches/…`), full size or the small grid copy. */
export function watchPhotoUrl(set: ScanSet, photo: string, size: "full" | "sm" = "full", base?: string): string {
  const rel = size === "sm" ? photo.replace(/^watches\//, "watches/sm/") : photo;
  return catalogueAssetUrl(set.dir, rel, base);
}

/** Page entry by scan index, or null when out of range. */
export function scanPage(set: ScanSet, n: number): ScanPage | null {
  return set.pages.find((p) => p.n === n) ?? null;
}

/** "page 8" / "the cover" — for captions ("From the 1975 Seiko catalogue, page 8"). */
export function pagePhrase(page: ScanPage): string {
  return /^\d+$/.test(page.label) ? `page ${page.label}` : `the ${page.label.toLowerCase()}`;
}

/** Parse a ?page= value into a valid scan index (falls back to the first page). */
export function parsePageParam(set: ScanSet, raw: string | null | undefined): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (Number.isFinite(n) && set.pages.some((p) => p.n === n)) return n;
  return set.pages[0]?.n ?? 0;
}

/** Link into the reader at a page, optionally highlighting one watch (by model slug). */
export function readerHref(catalogId: string, page: number, watch?: string | null): string {
  const q = new URLSearchParams({ page: String(page) });
  if (watch) q.set("watch", watch);
  return `/catalogue/read/${encodeURIComponent(catalogId)}?${q.toString()}`;
}

/** A well-formed box: four finite numbers, positive size, inside the page. */
export function isValidBbox(b: unknown): b is BBox {
  if (!Array.isArray(b) || b.length !== 4) return false;
  if (!b.every((v) => typeof v === "number" && Number.isFinite(v))) return false;
  const [x, y, w, h] = b as number[];
  const eps = 1e-3;
  return x >= 0 && y >= 0 && w > 0 && h > 0 && x + w <= 1 + eps && y + h <= 1 + eps;
}

/** CSS position for an overlay drawn over the page image, in percent. */
export function bboxStyle(b: BBox): { left: string; top: string; width: string; height: string } {
  const pct = (v: number) => `${+(v * 100).toFixed(3)}%`;
  return { left: pct(b[0]), top: pct(b[1]), width: pct(b[2]), height: pct(b[3]) };
}

/** Intersection-over-union of two boxes (used to check photos on a page don't overlap). */
export function bboxIoU(a: BBox, b: BBox): number {
  const ix = Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0]));
  const iy = Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]));
  const inter = ix * iy;
  const union = a[2] * a[3] + b[2] * b[3] - inter;
  return union > 0 ? inter / union : 0;
}
