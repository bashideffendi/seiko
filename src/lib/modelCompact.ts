import type { ModelEntry } from "@/lib/modelIndex";

// The handful of fields the client-side model browser needs, under short keys.
// The full index (every catalogue record) never goes to the browser: the models page
// server-renders the first page and the browser fetches /api/models (a static file)
// only once the visitor starts filtering.

export interface CompactModel {
  /** reference */ r: string;
  /** slug */ s: string;
  /** caliber */ c?: string;
  /** catalogue years */ y: number[];
  /** one-line description (dial · case, or section) */ d?: string;
  /** first section */ x?: string;
  /** confidence */ k: "h" | "m" | "l";
  /** catalogue ids it appears in */ g: string[];
}

export function compactModel(e: ModelEntry): CompactModel {
  const d = [e.dial, e.case].filter(Boolean).join(" · ").slice(0, 90) || undefined;
  const out: CompactModel = {
    r: e.ref,
    s: e.slug,
    y: e.years,
    k: e.conf === "high" ? "h" : e.conf === "medium" ? "m" : "l",
    g: Array.from(new Set(e.appearances.map((a) => a.catalogId))),
  };
  if (e.caliber) out.c = e.caliber;
  if (d) out.d = d;
  if (e.sections[0]) out.x = e.sections[0];
  return out;
}

export function decadeOf(year: number): string {
  return `${Math.floor(year / 10) * 10}s`;
}

/** Uppercase haystack for client-side search. */
export function modelHaystack(m: CompactModel): string {
  return `${m.r} ${m.c ?? ""} ${m.x ?? ""} ${m.d ?? ""}`.toUpperCase();
}
