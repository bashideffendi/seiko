import data from "@/data/catalogue.json";

export interface CatalogueItem {
  id: string;
  year: number;
  yearLabel: string;
  title: string;
  file: string;
  pages: number;
  cover: string;
  textChars: number;
  hasText: boolean;
  lang: "jp" | "en" | "scan";
  snippet: string;
  caseRefs: string[];
  calibers: string[];
}

export const CATALOGUES = data as CatalogueItem[];

export const LANG_LABEL: Record<CatalogueItem["lang"], string> = {
  jp: "Japanese",
  en: "English",
  scan: "Scan",
};

export function decadeOf(year: number): string {
  if (!year) return "Undated";
  return `${Math.floor(year / 10) * 10}s`;
}

/** Search across title, year, model refs and calibers. */
export function searchCatalogues(items: CatalogueItem[], query: string): CatalogueItem[] {
  const q = query.trim().toUpperCase();
  if (!q) return items;
  return items.filter((c) => {
    const hay = [
      c.title,
      c.yearLabel,
      c.snippet,
      c.caseRefs.join(" "),
      c.calibers.join(" "),
    ]
      .join(" ")
      .toUpperCase();
    return hay.includes(q);
  });
}

export const CATALOGUE_STATS = {
  count: CATALOGUES.length,
  pages: CATALOGUES.reduce((s, c) => s + c.pages, 0),
  withText: CATALOGUES.filter((c) => c.hasText).length,
  refs: CATALOGUES.reduce((s, c) => s + c.caseRefs.length, 0),
  earliest: Math.min(...CATALOGUES.map((c) => c.year).filter(Boolean)),
  latest: Math.max(...CATALOGUES.map((c) => c.year)),
};
