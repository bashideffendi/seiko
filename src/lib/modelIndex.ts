// Model-centric index over every extracted catalogue record.
//
// The catalogue is organised per-PDF; collectors think per-MODEL. This module
// aggregates all MODEL_SETS records by canonical reference into one ModelEntry
// each — collecting every catalogue/year a reference appears in, deriving its
// Seiko IDs, and powering the /catalogue/models browser, the per-model pages and
// "similar watches" cross-links.

import { MODEL_SETS, seikoIds, type CatalogModel, type SeikoIds } from "@/lib/models";
import { normalizeRef } from "@/lib/seiko/refs";

export interface ModelAppearance {
  catalogId: string;
  catalogTitle: string;
  year: number;
  record: CatalogModel;
}

export interface ModelEntry {
  /** Canonical uppercase reference, e.g. "6309-7040" or "ZW851". */
  ref: string;
  /** URL-safe slug. */
  slug: string;
  ids: SeikoIds;
  caliber: string | null;
  /** Distinct catalogue sections it was filed under. */
  sections: string[];
  /** Distinct catalogue years it appears in, ascending. */
  years: number[];
  appearances: ModelAppearance[];
  /** Representative spec fields (taken from the highest-confidence appearance). */
  dial?: string;
  case?: string;
  bracelet?: string;
  jewels?: number | null;
  specs?: string;
  price?: string;
  wr?: string;
  notes?: string;
  conf: "high" | "medium" | "low";
}

const CONF_RANK: Record<string, number> = { high: 3, medium: 2, low: 1 };

function slugify(ref: string): string {
  return ref.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function buildIndex(): ModelEntry[] {
  const byRef = new Map<string, ModelEntry>();

  for (const set of Object.values(MODEL_SETS)) {
    const { id, title, year } = set.catalog;
    for (const record of set.records) {
      const ref = normalizeRef(record.ref ?? "");
      if (!ref) continue;

      const appearance: ModelAppearance = { catalogId: id, catalogTitle: title, year, record };
      let entry = byRef.get(ref);
      if (!entry) {
        entry = {
          ref,
          slug: slugify(ref),
          ids: seikoIds(record),
          caliber: seikoIds(record).caliber,
          sections: [],
          years: [],
          appearances: [],
          conf: record.conf,
        };
        byRef.set(ref, entry);
      }
      entry.appearances.push(appearance);
      if (record.section && !entry.sections.includes(record.section)) entry.sections.push(record.section);
      if (year && !entry.years.includes(year)) entry.years.push(year);
      if (!entry.caliber) {
        const c = seikoIds(record).caliber;
        if (c) {
          entry.caliber = c;
          entry.ids = seikoIds(record);
        }
      }
      if (CONF_RANK[record.conf] > CONF_RANK[entry.conf]) entry.conf = record.conf;
    }
  }

  // Fill representative spec fields from the best (highest-confidence, then earliest) appearance.
  for (const entry of byRef.values()) {
    entry.years.sort((a, b) => a - b);
    const best = [...entry.appearances].sort(
      (a, b) => CONF_RANK[b.record.conf] - CONF_RANK[a.record.conf] || a.year - b.year,
    )[0].record;
    entry.dial = pick(entry, "dial");
    entry.case = pick(entry, "case");
    entry.bracelet = pick(entry, "bracelet");
    entry.specs = pick(entry, "specs");
    entry.price = pick(entry, "price");
    entry.wr = pick(entry, "wr");
    entry.notes = pick(entry, "notes");
    entry.jewels = best.jewels ?? null;
    if (!entry.caliber && best.caliber) {
      entry.caliber = best.caliber.toUpperCase();
      entry.ids = { ...entry.ids, caliber: entry.caliber };
    }
  }

  // Disambiguate any slug collisions (rare — distinct refs slugifying alike).
  // Loop until the candidate is genuinely unused so uniqueness is guaranteed.
  const assigned = new Set<string>();
  for (const entry of byRef.values()) {
    const base = entry.slug || "ref";
    let cand = base;
    let k = 2;
    while (assigned.has(cand)) cand = `${base}-${k++}`;
    entry.slug = cand;
    assigned.add(cand);
  }

  return Array.from(byRef.values()).sort(
    (a, b) => CONF_RANK[b.conf] - CONF_RANK[a.conf] || a.ref.localeCompare(b.ref),
  );

  // helper: first non-empty value of `field` across appearances (best conf first)
  function pick(entry: ModelEntry, field: keyof CatalogModel): string | undefined {
    const ordered = [...entry.appearances].sort(
      (a, b) => CONF_RANK[b.record.conf] - CONF_RANK[a.record.conf] || a.year - b.year,
    );
    for (const a of ordered) {
      const v = a.record[field];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    return undefined;
  }
}

export const ALL_MODEL_ENTRIES: ModelEntry[] = buildIndex();

const BY_SLUG = new Map(ALL_MODEL_ENTRIES.map((e) => [e.slug, e]));
const SLUG_BY_REF = new Map(ALL_MODEL_ENTRIES.map((e) => [e.ref, e.slug]));

export function findModelBySlug(slug: string): ModelEntry | null {
  return BY_SLUG.get(slug) ?? null;
}

/** Slug for a raw reference string (normalised), or null if not indexed. */
export function slugForRef(rawRef: string): string | null {
  return SLUG_BY_REF.get(normalizeRef(rawRef)) ?? null;
}

/** A model is worth its own static page if it's meaningfully identifiable. */
export function isPageWorthy(e: ModelEntry): boolean {
  return (
    e.caliber != null ||
    e.conf === "high" ||
    e.appearances.length >= 2 ||
    e.ids.caseRef != null
  );
}

export const PAGE_ENTRIES: ModelEntry[] = ALL_MODEL_ENTRIES.filter(isPageWorthy);

/** Related models: shared caliber first, then shared section. */
export function similarModels(entry: ModelEntry, limit = 8): ModelEntry[] {
  const out: ModelEntry[] = [];
  const taken = new Set<string>([entry.slug]);

  if (entry.caliber) {
    for (const e of ALL_MODEL_ENTRIES) {
      if (taken.has(e.slug)) continue;
      if (e.caliber === entry.caliber) {
        out.push(e);
        taken.add(e.slug);
      }
      if (out.length >= limit) return out;
    }
  }
  if (entry.sections.length) {
    for (const e of ALL_MODEL_ENTRIES) {
      if (taken.has(e.slug)) continue;
      if (e.sections.some((s) => entry.sections.includes(s))) {
        out.push(e);
        taken.add(e.slug);
      }
      if (out.length >= limit) return out;
    }
  }
  return out;
}

export const MODEL_STATS = {
  unique: ALL_MODEL_ENTRIES.length,
  withCaliber: ALL_MODEL_ENTRIES.filter((e) => e.caliber).length,
  pages: PAGE_ENTRIES.length,
  catalogues: Object.keys(MODEL_SETS).length,
};

/** Distinct calibers present in the index, sorted, for filter chips. */
export const INDEX_CALIBERS: string[] = Array.from(
  new Set(ALL_MODEL_ENTRIES.map((e) => e.caliber).filter((c): c is string => !!c)),
).sort();
