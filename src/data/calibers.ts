import type { CaliberDataset, CaliberRecord } from "@/lib/seiko/types";
import extended from "@/data/calibers-extended.json";

// Seiko caliber reference. Two tiers, merged below:
//   • CORE — ~30 hand-curated, decoder-critical calibers with tight windows.
//   • EXTENDED — calibers-extended.json, compiled + adversarially verified per family.
// Ranges are approximate where the community disagrees (rangeConfidence:"approximate").
// This dataset powers BOTH the decoder's decade-narrowing AND the /tools/caliber-lookup
// page, and is the join target for catalogue data — so the schema is intentionally complete.
// On a key collision the CORE record wins (it's hand-tuned for the decoder).

const COMMUNITY = [
  "https://www.watchsleuth.com/seikodatefinder/",
  "https://retroseiko.co.uk/seiko-serial-database.htm",
];

const CALIBERS_CORE: CaliberDataset = [
  { caliber: "6602", aliases: ["6619", "66xx"], startYear: 1963, endYear: 1973, movementType: "automatic", jewels: 17, family: "Sportmatic / 5", rangeConfidence: "approximate", notes: "Early Seiko 5 / Sportmatic workhorse.", sources: COMMUNITY },
  { caliber: "5606", startYear: 1968, endYear: 1978, movementType: "automatic", jewels: 21, family: "Lord Matic", notes: "Lord Matic dress automatic.", sources: COMMUNITY },
  { caliber: "5626", startYear: 1970, endYear: 1980, movementType: "automatic", jewels: 23, family: "Lord Matic Special", rangeConfidence: "approximate", sources: COMMUNITY },
  { caliber: "6105", startYear: 1968, endYear: 1977, movementType: "automatic", jewels: 17, family: "Diver", notes: "6105-8110 'Captain Willard' diver.", sources: COMMUNITY },
  { caliber: "6119", startYear: 1969, endYear: 1979, movementType: "automatic", jewels: 17, family: "5 / Sports", sources: COMMUNITY },
  { caliber: "6139", startYear: 1969, endYear: 1979, movementType: "automatic", jewels: 17, family: "Chronograph", notes: "6139 'Pogue' automatic chronograph.", sources: COMMUNITY },
  { caliber: "6138", startYear: 1969, endYear: 1979, movementType: "automatic", jewels: 21, family: "Chronograph", notes: "Larger column-wheel-era automatic chronograph.", sources: COMMUNITY },
  { caliber: "7016", aliases: ["7018"], startYear: 1971, endYear: 1979, movementType: "automatic", jewels: 21, family: "Chronograph", rangeConfidence: "approximate", sources: COMMUNITY },
  { caliber: "7019", startYear: 1972, endYear: 1982, movementType: "automatic", jewels: 17, family: "5", rangeConfidence: "approximate", sources: COMMUNITY },
  { caliber: "6309", startYear: 1976, endYear: 1988, movementType: "automatic", jewels: 17, family: "Diver", notes: "6309-7040 / 7290 'Turtle' diver.", sources: COMMUNITY },
  { caliber: "7009", startYear: 1988, endYear: 1999, movementType: "automatic", jewels: 17, family: "5", rangeConfidence: "approximate", notes: "Overlaps 7002 era — caliber alone may not pin the decade.", sources: COMMUNITY },
  { caliber: "7002", startYear: 1988, endYear: 1996, movementType: "automatic", jewels: 17, family: "Diver", notes: "7002-700x diver; predecessor to the 7S26 SKX.", rangeConfidence: "approximate", sources: COMMUNITY },
  { caliber: "7s26", aliases: ["7S26A", "7S26B", "7S26C"], startYear: 1996, endYear: 2019, movementType: "automatic", jewels: 21, family: "5 / Diver", longRun: true, notes: "SKX007/009 diver workhorse; very long run, weak decade-narrowing on its own.", sources: COMMUNITY },
  { caliber: "7s36", aliases: ["7S36A", "7S36B"], startYear: 1996, endYear: 2019, movementType: "automatic", jewels: 23, family: "5 Sports", longRun: true, sources: COMMUNITY },
  { caliber: "4r35", aliases: ["4R35A", "4R35B"], startYear: 2010, endYear: null, movementType: "automatic", jewels: 23, family: "5 / Prospex", rangeConfidence: "approximate", notes: "Hacking + hand-winding; successor lineage to 7S26.", sources: COMMUNITY },
  { caliber: "4r36", aliases: ["4R36A", "4R36B"], startYear: 2010, endYear: null, movementType: "automatic", jewels: 24, family: "5 Sports / Prospex", longRun: true, rangeConfidence: "approximate", notes: "Day-date workhorse in modern Seiko 5 Sports & Prospex.", sources: COMMUNITY },
  { caliber: "nh35", aliases: ["NH35A"], startYear: 2012, endYear: null, movementType: "automatic", jewels: 24, family: "5 (SII export)", notes: "Seiko-Epson (SII) export twin of the 4R35.", sources: COMMUNITY },
  { caliber: "nh36", aliases: ["NH36A"], startYear: 2012, endYear: null, movementType: "automatic", jewels: 24, family: "5 (SII export)", notes: "Export twin of the 4R36.", sources: COMMUNITY },
  { caliber: "6r15", startYear: 2006, endYear: 2019, movementType: "automatic", jewels: 23, family: "SARB / Prospex", notes: "SARB033/035 era; ~50h power reserve.", sources: COMMUNITY },
  { caliber: "6r35", startYear: 2019, endYear: null, movementType: "automatic", jewels: 24, family: "Prospex / Presage", notes: "70h power-reserve successor to the 6R15.", sources: COMMUNITY },
  { caliber: "8l35", startYear: 1998, endYear: null, movementType: "automatic", jewels: 26, family: "Prospex (MM300)", notes: "Undecorated sibling of the Grand Seiko 9S; powers Marinemaster 300.", sources: COMMUNITY },
  { caliber: "8l55", startYear: 2014, endYear: null, movementType: "automatic", jewels: 37, family: "Prospex Hi-Beat", rangeConfidence: "approximate", notes: "Hi-beat 36,000 vph for premium Prospex divers.", sources: COMMUNITY },
  { caliber: "9s55", startYear: 1998, endYear: 2010, movementType: "automatic", jewels: 26, family: "Grand Seiko 9S", grandSeiko: true, notes: "Grand Seiko — uses GS dating conventions, not the standard serial scheme.", sources: COMMUNITY },
  { caliber: "9s65", startYear: 2006, endYear: null, movementType: "automatic", jewels: 35, family: "Grand Seiko 9S", grandSeiko: true, notes: "Grand Seiko 72h automatic — treat serial dating with caution.", sources: COMMUNITY },
  { caliber: "9r65", startYear: 2004, endYear: null, movementType: "spring-drive", jewels: 30, family: "Grand Seiko 9R Spring Drive", grandSeiko: true, sources: COMMUNITY },
  { caliber: "7t92", startYear: 2002, endYear: null, movementType: "quartz", jewels: 7, family: "Chronograph (quartz)", longRun: true, notes: "Common quartz alarm-chronograph; long run, weak narrowing.", sources: COMMUNITY },
  { caliber: "7t62", startYear: 1997, endYear: null, movementType: "quartz", jewels: 7, family: "Alarm chronograph (quartz)", longRun: true, sources: COMMUNITY },
  { caliber: "7n43", aliases: ["7N42", "7N01"], startYear: 1986, endYear: null, movementType: "quartz", jewels: 0, family: "3-hand quartz", longRun: true, notes: "Ubiquitous quartz movement, decades-long run — very weak narrowing power.", sources: COMMUNITY },
  { caliber: "v157", startYear: 2010, endYear: null, movementType: "solar", jewels: 0, family: "Prospex Solar Diver", rangeConfidence: "approximate", sources: COMMUNITY },
  { caliber: "v147", startYear: 2012, endYear: null, movementType: "solar", jewels: 0, family: "Solar chronograph", rangeConfidence: "approximate", sources: COMMUNITY },
  { caliber: "5m62", aliases: ["5M63", "5M85"], startYear: 1998, endYear: null, movementType: "kinetic", jewels: 11, family: "Kinetic", rangeConfidence: "approximate", notes: "Kinetic (auto-quartz hybrid).", sources: COMMUNITY },
];

const CALIBERS_EXTENDED = extended as unknown as CaliberDataset;

/** Canonical key: uppercase, strip spaces/dashes. */
export function canonicalCaliberKey(raw: string): string {
  return raw.trim().toUpperCase().replace(/[\s-]+/g, "");
}

/** Merge core + extended; CORE wins on any caliber-or-alias key collision. */
function mergeCalibers(core: CaliberDataset, ext: CaliberDataset): CaliberDataset {
  const seen = new Set<string>();
  for (const c of core) {
    seen.add(canonicalCaliberKey(c.caliber));
    c.aliases?.forEach((a) => seen.add(canonicalCaliberKey(a)));
  }
  const merged = [...core];
  for (const rec of ext) {
    const key = canonicalCaliberKey(rec.caliber);
    if (seen.has(key)) continue;
    seen.add(key);
    rec.aliases?.forEach((a) => seen.add(canonicalCaliberKey(a)));
    merged.push(rec);
  }
  return merged;
}

/** The full caliber reference: hand-curated core + verified extended set. */
export const CALIBERS: CaliberDataset = mergeCalibers(CALIBERS_CORE, CALIBERS_EXTENDED);

/**
 * Resolve a user-typed caliber string to a record.
 * Match order: exact canonical → alias → strip a single trailing variant letter → retry.
 */
export function findCaliber(
  raw: string,
  data: CaliberDataset = CALIBERS,
): CaliberRecord | null {
  const key = canonicalCaliberKey(raw);
  if (!key) return null;

  for (const rec of data) {
    if (canonicalCaliberKey(rec.caliber) === key) return rec;
    if (rec.aliases?.some((a) => canonicalCaliberKey(a) === key)) return rec;
  }
  // Strip a single trailing letter (variant suffix like 7S26A → 7S26) and retry.
  const stripped = key.replace(/[A-Z]$/, "");
  if (stripped !== key) {
    for (const rec of data) {
      if (canonicalCaliberKey(rec.caliber) === stripped) return rec;
      if (rec.aliases?.some((a) => canonicalCaliberKey(a) === stripped)) return rec;
    }
  }
  return null;
}
