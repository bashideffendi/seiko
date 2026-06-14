import cat1975 from "@/data/models-1975-seiko-catalog.json";
import cat1974 from "@/data/models-1974-seiko-v2.json";
import cat1977v1 from "@/data/models-1977-1977-seiko-v1.json";
import cat1976v1 from "@/data/models-1976-1976-seiko-v1.json";
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
  };
  records: CatalogModel[];
}

// Catalogs that have been through structured (vision) extraction, keyed by catalogue id.
// Grows one catalog at a time as more are extracted.
export const MODEL_SETS: Record<string, CatalogModelSet> = {
  "1975-1975-seiko-catalog": cat1975 as CatalogModelSet,
  "1974-1974-seiko-v2": cat1974 as CatalogModelSet,
  "1977-1977-seiko-v1": cat1977v1 as CatalogModelSet,
  "1976-1976-seiko-v1": cat1976v1 as CatalogModelSet,
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
