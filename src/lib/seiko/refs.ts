// The three identifiers stamped on a Seiko — formalised in one place.
//
// A single watch carries up to THREE distinct numbers, and collectors routinely
// conflate them. This module is the canonical parser/normaliser for all three so
// the decoder, the catalogue and the per-model pages speak the same language.
//
//   1. Serial number       — the date code (see decode.ts), e.g. 7N0142
//   2. Case-movement ref    — caliber + case, format CCCC-NNNN, e.g. 7S26-0020
//   3. Case-dial code       — the dial/variant code, format NNN-XXX, e.g. 002-04Z
//
//   + Marketing reference   — the catalogue/box name, e.g. SKX007
//   + Region suffix         — J / K / P (+ digit), e.g. SKX007K1  (see /learn/region-codes)
//
// Reference learned from the community archive at theseikoguy.com; the SYSTEM
// (the formats below) is factual — the data we attach to it is our own.

/** A Seiko case-movement reference, CCCC-NNNN (e.g. 7S26-0020). */
export interface CaseRef {
  /** Full normalised ref, e.g. "7S26-0020". */
  full: string;
  /** First block = the movement caliber, e.g. "7S26". */
  caliber: string;
  /** Second block = the case/design number, e.g. "0020". */
  caseNumber: string;
}

/** A marketing reference + its decoded region suffix, e.g. SKX007K1. */
export interface MarketingRef {
  /** Full as written, e.g. "SKX007K1". */
  full: string;
  /** The base, region-agnostic ref, e.g. "SKX007". */
  base: string;
  /** Region letter if present: "J" | "K" | "P" | other. */
  region: string | null;
  /** Trailing digit variant if present (bracelet/packaging), e.g. "1". */
  variant: string | null;
}

const CASE_REF_RE = /\b([0-9][0-9A-Z]{3})-([0-9A-Z]{3,4})\b/i;
const MARKETING_RE = /^([A-Z]{2,4}[0-9]{2,4})([JKP])?([0-9])?$/i;
const CASE_DIAL_RE = /^([0-9][0-9A-Z]{2})-([0-9A-Z]{3})$/i;

/** Uppercase, collapse whitespace, normalise the dash. */
export function normalizeRef(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[‐-―−]/g, "-");
}

/**
 * Parse a case-movement reference (CCCC-NNNN). The first block is the caliber,
 * the second is the case number. Returns null if the string isn't a case ref.
 */
export function parseCaseRef(raw: string): CaseRef | null {
  if (!raw) return null;
  const m = normalizeRef(raw).match(CASE_REF_RE);
  if (!m) return null;
  return { full: `${m[1].toUpperCase()}-${m[2].toUpperCase()}`, caliber: m[1].toUpperCase(), caseNumber: m[2].toUpperCase() };
}

/** True if the string is a case-dial code, NNN-XXX (e.g. 002-04Z). */
export function isCaseDialCode(raw: string): boolean {
  return CASE_DIAL_RE.test(normalizeRef(raw));
}

/**
 * Pull the caliber out of any model record. Prefers an explicit caliber field,
 * else derives it from a CCCC-NNNN reference.
 */
export function caliberFromRef(ref: string | undefined, explicit?: string): string | null {
  if (explicit && explicit.trim()) return explicit.trim().toUpperCase();
  const parsed = ref ? parseCaseRef(ref) : null;
  return parsed?.caliber ?? null;
}

/** Parse a marketing reference + region suffix (e.g. SKX007K1 → base SKX007, region K, variant 1). */
export function parseMarketingRef(raw: string): MarketingRef | null {
  if (!raw) return null;
  const norm = normalizeRef(raw);
  const m = norm.match(MARKETING_RE);
  if (!m) return null;
  return {
    full: norm,
    base: m[1].toUpperCase(),
    region: m[2] ? m[2].toUpperCase() : null,
    variant: m[3] ?? null,
  };
}

/** What each region letter means (kept in sync with /learn/region-codes). */
export const REGION_MEANING: Record<string, string> = {
  J: "Made in Japan",
  K: "Assembled outside Japan (often from Japanese parts)",
  P: "Later overseas production",
};
