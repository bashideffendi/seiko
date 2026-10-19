import type { CaliberDataset, CaliberRecord } from "./types";

// Pure caliber-key helpers. Kept free of any dataset import so client components
// (the serial decoder) can resolve calibers against a slim dataset passed as a prop
// instead of bundling the full caliber JSON.

/** Canonical key: uppercase, strip spaces/dashes. */
export function canonicalCaliberKey(raw: string): string {
  return raw.trim().toUpperCase().replace(/[\s-]+/g, "");
}

/**
 * Resolve a user-typed caliber string against a dataset.
 * Match order: exact canonical → alias → strip a single trailing variant letter → retry.
 */
export function findCaliberIn(raw: string, data: CaliberDataset): CaliberRecord | null {
  const key = canonicalCaliberKey(raw ?? "");
  if (!key) return null;

  const lookup = (k: string) => {
    for (const rec of data) {
      if (canonicalCaliberKey(rec.caliber) === k) return rec;
      if (rec.aliases?.some((a) => canonicalCaliberKey(a) === k)) return rec;
    }
    return null;
  };

  const direct = lookup(key);
  if (direct) return direct;
  // Strip a single trailing letter (variant suffix like 7S26A → 7S26) and retry.
  // (No regex lookbehind: older iOS Safari can't parse it.)
  const stripped = key.replace(/^(.*\d)[A-Z]$/, "$1");
  return stripped !== key ? lookup(stripped) : null;
}

/** URL slug for a caliber page, e.g. "7S26" → "7s26". */
export function caliberSlug(caliber: string): string {
  return canonicalCaliberKey(caliber).toLowerCase();
}
