import cat1975 from "@/data/models-1975-seiko-catalog.json";
import cat1975v2 from "@/data/models-1975-1975-seiko-v22.json";
import cat1932 from "@/data/models-1932-1932-seiko.json";
import cat1956 from "@/data/models-1956-1956-seiko.json";
import cat1960 from "@/data/models-1960-1960-seiko.json";
import cat1978cr1 from "@/data/models-1978-1978-credor-v1.json";
import cat1978cr2 from "@/data/models-1978-1978-credor-v2.json";
import cat1978v2 from "@/data/models-1978-1978-seiko-v2.json";
import cat1979v1 from "@/data/models-1979-1979-seiko-v1.json";
import cat1979v2 from "@/data/models-1979-1979-seiko-v2.json";
import cat1973v1 from "@/data/models-1973-1973-seiko-v1.json";
import cat1974 from "@/data/models-1974-seiko-v2.json";
import cat1974v1 from "@/data/models-1974-1974-seiko-v1.json";
import cat1977v1 from "@/data/models-1977-1977-seiko-v1.json";
import cat1977v2 from "@/data/models-1977-1977-seiko-v2.json";
import cat1976v1 from "@/data/models-1976-1976-seiko-v1.json";
import cat1968jdm2 from "@/data/models-1968-1968-seiko-jdm-catalog-no-2.json";
import cat1968jdm1 from "@/data/models-1968-1968-seiko-jdm-catalog-no-1.json";
import cat1968jdm2s from "@/data/models-1968-1968-seiko-jdm-catalog-no-2-supplement.json";
import cat1967jdm2 from "@/data/models-1967-1967-seiko-jdm-catalog-no-2.json";
import cat1966jdm1s from "@/data/models-1966-1966-seiko-jdm-catalog-no-1-supplement.json";
import cat1969jdm2 from "@/data/models-1969-1969-seiko-jdm-catalog-no-2.json";
import cat1969jdm1 from "@/data/models-1969-1969-seiko-jdm-catalog-no-1.json";
import cat1969sd from "@/data/models-1969-1969-seiko-sport-diver.json";
import cat1969v1 from "@/data/models-1969-1969-seiko-v1.json";
import cat1969v2 from "@/data/models-1969-1969-seiko-v2.json";
import cat1969br from "@/data/models-1969-1969-seiko-brochure.json";
import cat1972lux from "@/data/models-1972-1972-seiko-luxury.json";
import cat1972cat from "@/data/models-1972-1972-seiko-catalogue.json";
import cat1972v1 from "@/data/models-1972-1972-seiko-v1.json";
import cat1973v2 from "@/data/models-1973-1973-seiko-v2.json";
import cat1973lux from "@/data/models-1973-1973-seiko-luxury.json";
import { caliberFromRef, parseCaseRef } from "@/lib/seiko/refs";

export interface CatalogModel {
  page: number;
  section: string;
  ref: string;
  code?: string;
  caliber?: string;
  jewels: number | null;
  price?: string;
  specs?: string;
  dial?: string;
  case?: string;
  bracelet?: string;
  wr?: string;
  notes?: string;
  conf: "high" | "medium" | "low";
  // === The canonical Seiko 3-ID system (optional; populated where derivable) ===
  /** Marketing/box name, e.g. "SKX007". */
  marketingRef?: string;
  /** Case-movement reference, CCCC-NNNN, e.g. "7S26-0020". */
  caseRef?: string;
  /** Case-dial / variant code, NNN-XXX, e.g. "002-04Z". */
  caseDialCode?: string;
  /** Region/strap suffix variants seen for this ref, e.g. ["J1","K1","P"]. */
  regionVariants?: string[];
  // === Digitised scan (scripts/digitize_catalog.py; see src/lib/scans.ts) ===
  /** Where the watch's photo sits on its page: normalised [x, y, w, h], margin included. */
  bbox?: [number, number, number, number];
  /** The cropped photo, relative to the catalogue's asset dir, e.g. "watches/p008-01-yp037.webp". */
  photo?: string;
  /** Pixel size of the cropped photo [w, h]. */
  photoSize?: [number, number];
}

/** The structured identifiers for one model, derived from whatever fields exist. */
export interface SeikoIds {
  caliber: string | null;
  caseRef: string | null;
  caseNumber: string | null;
  caseDialCode: string | null;
  marketingRef: string | null;
}

/**
 * Resolve a model's three identifiers. Prefers explicit fields, then derives:
 * caliber from an explicit field or a CCCC-NNNN ref; caseRef from an explicit
 * field or a ref that parses as CCCC-NNNN.
 */
export function seikoIds(m: CatalogModel): SeikoIds {
  const explicitCaseRef = m.caseRef ? parseCaseRef(m.caseRef) : null;
  const refAsCase = !explicitCaseRef ? parseCaseRef(m.ref) : null;
  const caseRef = explicitCaseRef ?? refAsCase;
  return {
    caliber: caliberFromRef(m.caseRef ?? m.ref, m.caliber),
    caseRef: caseRef?.full ?? null,
    caseNumber: caseRef?.caseNumber ?? null,
    caseDialCode: m.caseDialCode ?? null,
    marketingRef: m.marketingRef ?? null,
  };
}

export interface CatalogModelSet {
  catalog: {
    id: string;
    title: string;
    year: number;
    edition?: string;
    note?: string;
    method?: string;
    pages: number;
    records: number;
    /** Records with their own cropped photo. */
    photos?: number;
  };
  records: CatalogModel[];
}

// Catalogs that have been through structured (vision) extraction, keyed by catalogue id.
// Grows one catalog at a time as more are extracted.
export const MODEL_SETS: Record<string, CatalogModelSet> = {
  "1975-1975-seiko-catalog": cat1975 as CatalogModelSet,
  "1975-1975-seiko-v22": cat1975v2 as CatalogModelSet,
  "1932-1932-seiko": cat1932 as CatalogModelSet,
  "1956-1956-seiko": cat1956 as CatalogModelSet,
  "1960-1960-seiko": cat1960 as CatalogModelSet,
  "1978-1978-credor-v1": cat1978cr1 as CatalogModelSet,
  "1978-1978-credor-v2": cat1978cr2 as CatalogModelSet,
  "1978-1978-seiko-v2": cat1978v2 as CatalogModelSet,
  "1979-1979-seiko-v1": cat1979v1 as CatalogModelSet,
  "1979-1979-seiko-v2": cat1979v2 as CatalogModelSet,
  "1973-1973-seiko-v1": cat1973v1 as CatalogModelSet,
  "1974-1974-seiko-v2": cat1974 as CatalogModelSet,
  "1974-1974-seiko-v1": cat1974v1 as CatalogModelSet,
  "1977-1977-seiko-v1": cat1977v1 as CatalogModelSet,
  "1977-1977-seiko-v2": cat1977v2 as CatalogModelSet,
  "1976-1976-seiko-v1": cat1976v1 as CatalogModelSet,
  "1968-1968-seiko-jdm-catalog-no-2": cat1968jdm2 as CatalogModelSet,
  "1968-1968-seiko-jdm-catalog-no-1": cat1968jdm1 as CatalogModelSet,
  "1968-1968-seiko-jdm-catalog-no-2-supplement": cat1968jdm2s as CatalogModelSet,
  "1967-1967-seiko-jdm-catalog-no-2": cat1967jdm2 as CatalogModelSet,
  "1966-1966-seiko-jdm-catalog-no-1-supplement": cat1966jdm1s as CatalogModelSet,
  "1969-1969-seiko-jdm-catalog-no-2": cat1969jdm2 as CatalogModelSet,
  "1969-1969-seiko-jdm-catalog-no-1": cat1969jdm1 as CatalogModelSet,
  "1969-1969-seiko-sport-diver": cat1969sd as CatalogModelSet,
  "1969-1969-seiko-v1": cat1969v1 as CatalogModelSet,
  "1969-1969-seiko-v2": cat1969v2 as CatalogModelSet,
  "1969-1969-seiko-brochure": cat1969br as CatalogModelSet,
  "1972-1972-seiko-luxury": cat1972lux as CatalogModelSet,
  "1972-1972-seiko-catalogue": cat1972cat as CatalogModelSet,
  "1972-1972-seiko-v1": cat1972v1 as CatalogModelSet,
  "1973-1973-seiko-v2": cat1973v2 as CatalogModelSet,
  "1973-1973-seiko-luxury": cat1973lux as CatalogModelSet,
};

export function modelSetFor(id: string): CatalogModelSet | null {
  return MODEL_SETS[id] ?? null;
}

export function modelsFor(id: string): CatalogModel[] | null {
  return MODEL_SETS[id]?.records ?? null;
}

export function modelCount(id: string): number {
  return MODEL_SETS[id]?.records.length ?? 0;
}

/** Uppercase blob of refs + sections + notes for catalogue search. */
export function modelSearchBlob(id: string): string {
  const set = MODEL_SETS[id];
  if (!set) return "";
  const parts: string[] = [];
  for (const m of set.records) {
    parts.push(
      m.ref, m.code ?? "", m.caliber ?? "", m.section, m.specs ?? "", m.notes ?? "",
      m.marketingRef ?? "", m.caseRef ?? "", m.caseDialCode ?? "",
    );
  }
  return parts.join(" ").toUpperCase();
}

/** Group a catalog's models by section, preserving first-seen order. */
export function modelsBySection(records: CatalogModel[]): { section: string; items: CatalogModel[] }[] {
  const order: string[] = [];
  const map = new Map<string, CatalogModel[]>();
  for (const m of records) {
    const s = m.section || "Other";
    if (!map.has(s)) {
      map.set(s, []);
      order.push(s);
    }
    map.get(s)!.push(m);
  }
  return order.map((section) => ({ section, items: map.get(section)! }));
}
