import { CATALOGUES, type CatalogueItem } from "@/lib/catalogue";
import { MODEL_SETS } from "@/lib/models";
import { slugForRef } from "@/lib/modelIndex";
import { findCaliber } from "@/data/calibers";
import { caliberSlug } from "@/lib/seiko/caliberKey";

// Server-side shaping of the catalogue archive for its client grid: only what the grid,
// the search box and the detail panel need — not the raw catalogue + every model record.

export interface ArchiveModel {
  ref: string;
  slug: string | null;
  sub?: string;
  conf: "high" | "medium" | "low";
}

export interface ArchiveItem {
  id: string;
  year: number;
  yearLabel: string;
  title: string;
  pages: number;
  cover: string;
  hasText: boolean;
  lang: CatalogueItem["lang"];
  /** English text excerpt only (OCR of Japanese editions isn't readable as prose). */
  excerpt?: string;
  refs: string[];
  refCount: number;
  calibers: { code: string; slug: string | null }[];
  modelCount: number;
  /** A taste of the extracted models; the rest are one click away on /catalogue/models. */
  models: ArchiveModel[];
  /** Uppercase haystack for search: title, year, refs, calibers and model refs. */
  search: string;
}

const PREVIEW_MODELS = 24;
const RANK = { high: 0, medium: 1, low: 2 } as const;

export function archiveItems(): ArchiveItem[] {
  return CATALOGUES.map((c) => {
    const set = MODEL_SETS[c.id];
    const records = set?.records ?? [];
    // Highest-confidence first; Array.prototype.sort is stable, so page order holds within a tier.
    const best = [...records].filter((m) => m.ref).sort((a, b) => RANK[a.conf] - RANK[b.conf]);
    const models: ArchiveModel[] = best.slice(0, PREVIEW_MODELS).map((m) => {
      const sub = [m.caliber ? `Cal. ${m.caliber}` : "", m.dial, m.case].filter(Boolean).join(" · ").slice(0, 80);
      return { ref: m.ref, slug: m.ref ? slugForRef(m.ref) : null, conf: m.conf, ...(sub ? { sub } : {}) };
    });
    const modelBlob = records.map((m) => `${m.ref} ${m.caliber ?? ""}`).join(" ");
    return {
      id: c.id,
      year: c.year,
      yearLabel: c.yearLabel,
      title: c.title,
      pages: c.pages,
      cover: c.cover,
      hasText: c.hasText,
      lang: c.lang,
      ...(c.lang === "en" && c.snippet ? { excerpt: c.snippet.slice(0, 260) } : {}),
      refs: c.caseRefs.slice(0, 30),
      refCount: c.caseRefs.length,
      calibers: c.calibers.map((code) => {
        const rec = findCaliber(code);
        return { code, slug: rec ? caliberSlug(rec.caliber) : null };
      }),
      modelCount: records.length,
      models,
      search: [c.title, c.yearLabel, c.caseRefs.join(" "), c.calibers.join(" "), modelBlob].join(" ").toUpperCase(),
    };
  });
}
