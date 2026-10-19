import type {
  CaliberDataset,
  CaliberNarrowing,
  DecodeNote,
  DecodeNoteCode,
  DecodeOptions,
  DecodeResult,
  MonthResult,
} from "./types";
import { findCaliberIn } from "./caliberKey";

// Pure serial decoder. It takes the caliber dataset as an argument and imports no data,
// so the client bundle only carries the slim dataset the page hands it.
// `decode.ts` wraps this with the full bundled dataset as the default.

export const SCHEME_START_YEAR = 1966;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const NOTE_TEXT: Record<DecodeNoteCode, string> = {
  OCTOBER_O_OR_ZERO:
    "October is written as “O” (letter) or “0” (zero) in position 2 — both mean the same month.",
  LETTER_O_READ_AS_ZERO:
    "A letter “O” outside the month position was read as a zero — on a worn caseback the two are easy to confuse.",
  SEVEN_DIGIT_LOWER_CONFIDENCE:
    "7-digit serials are read with the last 5 digits as the production sequence. The position convention varies across eras, so this reading is lower-confidence than a 6-digit serial.",
  CALIBER_UNKNOWN:
    "That caliber isn’t in our database yet, so we couldn’t narrow the decade. The year below is still ambiguous.",
  CALIBER_CONTRADICTION:
    "The serial’s year digit doesn’t fall inside this caliber’s known production window. Double-check the caliber — this can also mean a service-replaced movement or non-original parts.",
  CALIBER_NARROWED_SINGLE:
    "Narrowed to a single likely year using the caliber’s production window.",
  CALIBER_NARROWED_MULTI:
    "The caliber narrowed the options but more than one decade still fits.",
  STILL_IN_PRODUCTION:
    "This caliber is still in production, so the most recent candidate years remain open.",
  LONG_RUN_WEAK_NARROWING:
    "This caliber ran for a very long time, so even a match leaves more than one possible decade.",
  SCHEME_IS_CONVENTION:
    "Seiko has never published an official serial-dating standard. This is a community-derived convention.",
  GRAND_SEIKO_DIFFERENT:
    "Grand Seiko uses its own dating conventions. Treat this estimate with extra caution.",
  FUTURE_MONTH_EXCLUDED:
    "This month hasn’t happened yet this year, so the current year was ruled out.",
};

function note(code: DecodeNoteCode): DecodeNote {
  return { code, message: NOTE_TEXT[code] };
}

/** Normalize raw input: trim, uppercase, strip spaces/dashes, fix look-alike O. */
export function normalizeSerial(raw: string): string {
  return (raw ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[‐-―−-]/g, "") // hyphens / minus
    .replace(/О/g, "O"); // Cyrillic О → Latin O
}

/** Month from position-2 character. October accepts both "O" and "0". */
function parseMonth(ch: string): MonthResult | null {
  if (ch >= "1" && ch <= "9") {
    const n = ch.charCodeAt(0) - 48;
    return { number: n, name: MONTH_NAMES[n - 1] };
  }
  if (ch === "O" || ch === "0") return { number: 10, name: "October" };
  if (ch === "N") return { number: 11, name: "November" };
  if (ch === "D") return { number: 12, name: "December" };
  return null;
}

/** All years from 1966..now whose last digit matches. */
export function candidateYears(yearDigit: number, currentYear: number): number[] {
  const out: number[] = [];
  for (let y = SCHEME_START_YEAR; y <= currentYear; y++) {
    if (y % 10 === yearDigit) out.push(y);
  }
  return out;
}

const VALID_CHARS = /^[0-9OND]+$/;

export function decodeSerial(
  serial: string,
  data: CaliberDataset,
  opts: Omit<DecodeOptions, "caliberData"> = {},
): DecodeResult {
  const nowDate = new Date(opts.now ?? Date.now());
  const currentYear = nowDate.getUTCFullYear();
  const currentMonth = nowDate.getUTCMonth() + 1;
  const raw = serial ?? "";
  const normalized = normalizeSerial(raw);
  const input = { raw, normalized, length: normalized.length };

  const fail = (code: NonNullable<DecodeResult["error"]>["code"], message: string, notes: DecodeNote[] = []): DecodeResult => ({
    ok: false,
    input,
    confidence: "none",
    notes,
    error: { code, message },
  });

  if (normalized.length === 0) return fail("EMPTY", "Enter a serial number to decode.");
  if (!VALID_CHARS.test(normalized)) {
    return fail(
      "BAD_CHARS",
      "A Seiko serial uses digits 0–9 plus the letters O, N, D (for Oct/Nov/Dec). That’s not what we got — re-check the caseback.",
    );
  }
  if (normalized.length === 5) {
    return fail(
      "FIVE_DIGIT_PRE1966",
      "5-character serials predate the 1966 dating scheme (or a digit is worn/missing). We can’t reliably date this one.",
      [note("SCHEME_IS_CONVENTION")],
    );
  }
  if (normalized.length < 5) return fail("TOO_SHORT", "That’s too short for a Seiko serial (expected 6 or 7 characters).");
  if (normalized.length > 7) return fail("TOO_LONG", "That’s too long for a Seiko serial (expected 6 or 7 characters).");

  // N and D only ever encode a month, so they can't appear anywhere else.
  const rest = normalized[0] + normalized.slice(2);
  if (/[ND]/.test(rest)) {
    return fail(
      "BAD_CHARS",
      "N and D only appear in the month position (the second character). Every other character should be a digit — re-check the caseback.",
    );
  }

  // Position-locked parse: char0 = year digit, char1 = month, rest = sequence.
  // A letter O outside the month position is a worn/misread zero.
  let letterO = false;
  const toDigit = (ch: string) => {
    if (ch === "O") {
      letterO = true;
      return "0";
    }
    return ch;
  };
  const yearChar = toDigit(normalized[0]);
  const yearDigit = yearChar.charCodeAt(0) - 48;

  const monthChar = normalized[1];
  const month = parseMonth(monthChar);
  if (!month) {
    return fail("BAD_MONTH", "The second character is the month: 1–9, O (Oct), N (Nov) or D (Dec). We couldn’t read it.");
  }

  const sequence = normalized.slice(2).split("").map(toDigit).join("");
  const sequenceNumber = parseInt(sequence, 10);

  const notes: DecodeNote[] = [note("SCHEME_IS_CONVENTION")];
  if (monthChar === "0" || monthChar === "O") notes.push(note("OCTOBER_O_OR_ZERO"));
  if (letterO) notes.push(note("LETTER_O_READ_AS_ZERO"));

  const isSeven = normalized.length === 7;
  if (isSeven) notes.push(note("SEVEN_DIGIT_LOWER_CONFIDENCE"));

  let candidates = candidateYears(yearDigit, currentYear);
  // A watch can't have been made in a month that hasn't happened yet.
  if (candidates[candidates.length - 1] === currentYear && month.number > currentMonth) {
    candidates = candidates.slice(0, -1);
    notes.push(note("FUTURE_MONTH_EXCLUDED"));
  }

  // Base confidence before caliber narrowing.
  let confidence: DecodeResult["confidence"] = isSeven ? "low" : "medium";

  let narrowing: CaliberNarrowing | undefined;
  const caliberQuery = opts.caliber?.trim();
  if (caliberQuery) {
    const matched = findCaliberIn(caliberQuery, data);
    if (!matched) {
      notes.push(note("CALIBER_UNKNOWN"));
      narrowing = {
        caliberQueried: caliberQuery,
        caliberMatched: null,
        likelyYears: candidates,
        singleYear: null,
        contradiction: false,
      };
    } else {
      const end = matched.endYear ?? currentYear;
      const likely = candidates.filter((y) => y >= matched.startYear && y <= end);
      const contradiction = likely.length === 0;
      narrowing = {
        caliberQueried: caliberQuery,
        caliberMatched: matched,
        likelyYears: likely,
        singleYear: likely.length === 1 ? likely[0] : null,
        contradiction,
      };

      if (matched.grandSeiko) notes.push(note("GRAND_SEIKO_DIFFERENT"));
      if (matched.endYear === null) notes.push(note("STILL_IN_PRODUCTION"));

      if (contradiction) {
        notes.push(note("CALIBER_CONTRADICTION"));
        confidence = "low";
      } else if (likely.length === 1) {
        notes.push(note("CALIBER_NARROWED_SINGLE"));
        // A long-run or GS caliber shouldn't be sold as "high" even at a single survivor.
        confidence = matched.longRun || matched.grandSeiko ? "medium" : isSeven ? "medium" : "high";
        if (matched.longRun) notes.push(note("LONG_RUN_WEAK_NARROWING"));
      } else {
        notes.push(note("CALIBER_NARROWED_MULTI"));
        if (matched.longRun) notes.push(note("LONG_RUN_WEAK_NARROWING"));
        confidence = "medium";
      }
    }
  }

  return {
    ok: true,
    input,
    decoded: {
      yearDigit,
      month,
      sequence,
      sequenceNumber,
      candidateYears: candidates,
      narrowing,
    },
    confidence,
    notes,
  };
}
