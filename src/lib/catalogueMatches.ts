// Catalogued models for a caseback number — what the serial decoder lists under its reading.
// The case code doesn't date a watch; it identifies the model. So: exact caliber–case matches
// first, then other models with the same movement, photographed ones before the rest.

import { ALL_MODEL_ENTRIES, type ModelEntry } from "@/lib/modelIndex";
import { compactModel, type CompactModel } from "@/lib/modelCompact";
import { canonicalCaliberKey } from "@/lib/seiko/caliberKey";

export interface CatalogueMatches {
  caliber: string;
  caseCode: string | null;
  /** Same caliber and case code. */
  exact: CompactModel[];
  /** Same movement, other cases. */
  sameCaliber: CompactModel[];
  /** How many models in all carry this caliber (for the "see all" link). */
  caliberTotal: number;
}

const byPhotoThenYear = (a: ModelEntry, b: ModelEntry) =>
  Number(!!b.photo) - Number(!!a.photo) || (a.years[0] ?? 0) - (b.years[0] ?? 0) || a.ref.localeCompare(b.ref);

export function catalogueMatches(caliber: string, caseCode: string | null, limit = 8): CatalogueMatches {
  const cal = canonicalCaliberKey(caliber);
  const code = caseCode ? canonicalCaliberKey(caseCode) : null;
  const withCaliber = ALL_MODEL_ENTRIES.filter((e) => e.caliber && canonicalCaliberKey(e.caliber) === cal);
  const isExact = (e: ModelEntry) => !!code && !!e.ids.caseNumber && canonicalCaliberKey(e.ids.caseNumber) === code;
  const exact = withCaliber.filter(isExact).sort(byPhotoThenYear);
  const rest = withCaliber.filter((e) => !isExact(e)).sort(byPhotoThenYear);
  return {
    caliber: cal,
    caseCode: code,
    exact: exact.slice(0, limit).map(compactModel),
    sameCaliber: rest.slice(0, limit).map(compactModel),
    caliberTotal: withCaliber.length,
  };
}
