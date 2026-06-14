// Decoder for the pre-1966 Seiko 5-digit case-code system.
// Pure, dependency-light, fully testable — mirrors decode.ts in spirit.

import {
  LIGNE_MM,
  LIGNE_SERIES,
  VINTAGE_CASE_CODES,
  type LigneSeries,
  type VintageCaseEntry,
} from "@/data/vintage-case-codes";

export interface VintageResult {
  ok: boolean;
  input: { raw: string; normalized: string };
  /** Leading "J" present (adds half a ligne). */
  hasJ: boolean;
  /** First two digits — the ligne family, e.g. "14". */
  series: string | null;
  /** Effective lignes, e.g. 14.5 for a J-prefixed 14 family. */
  ligne: number | null;
  /** Nominal dial size in mm (ligne × 2.2558), 1 dp. */
  approxMm: number | null;
  /** Last three digits — the progressive case number. */
  progressive: string | null;
  /** Curated model match, if this exact code is known. */
  match: VintageCaseEntry | null;
  /** Family-level context for the ligne series. */
  seriesInfo: LigneSeries | null;
  notes: string[];
  error?: string;
}

const NOTE_SYSTEM =
  "Pre-1966 codes predate Seiko's serial-dating scheme — this case code can't be turned into a production date.";
const NOTE_LIGNE =
  "The dial size is the nominal ligne value (1 ligne ≈ 2.26 mm); actual case diameter differs by design.";
const NOTE_APPROX =
  "The case-code system is a community-reconstructed convention; many codes were never documented by Seiko.";

/** Uppercase, strip spaces / dashes / a leading "REF". */
export function normalizeCaseCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/^REF\.?\s*/, "")
    .replace(/\s+/g, "")
    .replace(/[‐-―−-]/g, "");
}

const CODE_RE = /^(J?)(\d{2})(\d{3})$/;

export function decodeVintageCaseCode(raw: string): VintageResult {
  const normalized = normalizeCaseCode(raw ?? "");
  const base = (msg: string): VintageResult => ({
    ok: false,
    input: { raw: raw ?? "", normalized },
    hasJ: false,
    series: null,
    ligne: null,
    approxMm: null,
    progressive: null,
    match: null,
    seriesInfo: null,
    notes: [],
    error: msg,
  });

  if (!normalized) return base("Enter a vintage case code to decode.");

  // Modern CCCC-NNNN refs are a different system — point users at the right tool.
  // Test a dash-preserving form, since normalize() strips the dash.
  const dashed = (raw ?? "").trim().toUpperCase().replace(/\s+/g, "");
  if (/^[0-9][0-9A-Z]{3}-[0-9A-Z]{3,4}$/.test(dashed) || /^[A-Z]{2,4}\d{2,4}/.test(dashed)) {
    return base(
      "That looks like a modern reference (CCCC-NNNN or a marketing ref like SKX007). Vintage case codes are 5 digits, optionally with a leading “J”.",
    );
  }

  const m = normalized.match(CODE_RE);
  if (!m) {
    return base(
      "A pre-1966 case code is five digits, optionally prefixed with “J” — e.g. J14070 or 14041.",
    );
  }

  const hasJ = m[1] === "J";
  const series = m[2];
  const progressive = m[3];
  const ligne = parseInt(series, 10) + (hasJ ? 0.5 : 0);
  const approxMm = Math.round(ligne * LIGNE_MM * 10) / 10;

  const match =
    VINTAGE_CASE_CODES[normalized] ??
    (hasJ ? VINTAGE_CASE_CODES[normalized.slice(1)] : VINTAGE_CASE_CODES["J" + normalized]) ??
    null;

  const seriesInfo = LIGNE_SERIES[series] ?? null;

  const notes = [NOTE_SYSTEM, NOTE_LIGNE, NOTE_APPROX];

  return {
    ok: true,
    input: { raw: raw ?? "", normalized },
    hasJ,
    series,
    ligne,
    approxMm,
    progressive,
    match,
    seriesInfo,
    notes,
  };
}
