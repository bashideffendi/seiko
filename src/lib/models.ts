import cat1975 from "@/data/models-1975-seiko-catalog.json";
import cat1974 from "@/data/models-1974-seiko-v2.json";
import cat1977v1 from "@/data/models-1977-1977-seiko-v1.json";
import cat1976v1 from "@/data/models-1976-1976-seiko-v1.json";

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
    parts.push(m.ref, m.code ?? "", m.caliber ?? "", m.section, m.specs ?? "", m.notes ?? "");
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
