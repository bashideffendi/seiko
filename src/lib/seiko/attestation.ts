// Catalogue evidence for caliber production windows (server-only: reads every models file).
//
// A movement printed in an original Seiko catalogue of year Y was certainly in production in
// Y. The caliber reference is community data and sometimes too narrow (e.g. 6159 ending in 1976
// while the 1977 catalogue still lists it), and many JDM movements are missing from it. The
// decoder uses this evidence two ways:
//   - a known caliber whose window leaves out a catalogue year is widened to cover it;
//   - a movement missing from the reference gets an evidence-only record ("attestedOnly") so
//     the decoder can still pick the nearest decade, without claiming the run's true bounds.

import { CALIBERS, slimCalibers, type SlimCaliber } from "@/data/calibers";
import { MODEL_SETS, seikoIds } from "@/lib/models";
import { canonicalCaliberKey, findCaliberIn } from "@/lib/seiko/caliberKey";
import type { CaliberDataset } from "@/lib/seiko/types";

export interface CaliberSighting {
  caliber: string;
  first: number;
  last: number;
  /** Records across all digitised catalogues. */
  records: number;
}

let cache: Map<string, CaliberSighting> | null = null;

/** Every movement number printed (or carried by a printed caliber–model number) in the digitised catalogues. */
export function caliberSightings(): Map<string, CaliberSighting> {
  if (cache) return cache;
  const out = new Map<string, CaliberSighting>();
  for (const set of Object.values(MODEL_SETS)) {
    const year = set.catalog.year;
    for (const r of set.records) {
      const cal = seikoIds(r).caliber;
      if (!cal) continue;
      const key = canonicalCaliberKey(cal);
      // Only real movement numbers: four characters, digit first, two digits last.
      if (!/^[0-9][0-9A-Z][0-9]{2}$/.test(key)) continue;
      const s = out.get(key) ?? { caliber: key, first: year, last: year, records: 0 };
      s.first = Math.min(s.first, year);
      s.last = Math.max(s.last, year);
      s.records++;
      out.set(key, s);
    }
  }
  cache = out;
  return out;
}

/** The caliber reference with catalogue evidence folded in, for the decoder. */
export function decoderCalibers(data: CaliberDataset = CALIBERS): SlimCaliber[] {
  const sightings = caliberSightings();
  const slim = slimCalibers(data);
  const claimed = new Set<string>();
  const merged = slim.map((c) => {
    const rec = findCaliberIn(c.caliber, data);
    const key = canonicalCaliberKey(c.caliber);
    const keys = [key, ...(c.aliases ?? []).map(canonicalCaliberKey)];
    const seen = keys.map((k) => sightings.get(k)).filter((s): s is CaliberSighting => !!s);
    keys.forEach((k) => claimed.add(k));
    if (!rec || !seen.length) return c;
    const first = Math.min(...seen.map((s) => s.first));
    const last = Math.max(...seen.map((s) => s.last));
    const out: SlimCaliber = { ...c, seenFrom: first, seenTo: last };
    if (first < c.startYear) {
      out.startYear = first;
      out.widenedByCatalogue = true;
    }
    if (c.endYear !== null && last > c.endYear) {
      out.endYear = last;
      out.widenedByCatalogue = true;
    }
    return out;
  });
  for (const s of sightings.values()) {
    if (claimed.has(s.caliber) || findCaliberIn(s.caliber, data)) continue;
    merged.push({
      caliber: s.caliber,
      startYear: s.first,
      endYear: s.last,
      movementType: "unknown",
      rangeConfidence: "approximate",
      seenFrom: s.first,
      seenTo: s.last,
      attestedOnly: true,
    });
  }
  return merged;
}
