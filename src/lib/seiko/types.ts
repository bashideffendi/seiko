// Contract for the Seiko serial-number decoder.
// Every phase (decoder, future catalogue search, future vision extraction)
// depends on these types — keep them stable.

export type Confidence = "high" | "medium" | "low" | "none";

export type MovementType =
  | "automatic"
  | "manual"
  | "quartz"
  | "spring-drive"
  | "solar"
  | "kinetic";

/** One movement (caliber) record. The canonical join key across the whole product. */
export interface CaliberRecord {
  /** Canonical key: uppercase, no variant suffix, e.g. "7S26". */
  caliber: string;
  /** Variant suffixes / synonyms, e.g. ["7S26A", "7S26B", "7S26C"]. */
  aliases?: string[];
  startYear: number;
  /** null = still in production (resolve to current year at runtime). */
  endYear: number | null;
  movementType: MovementType;
  jewels?: number;
  /** Joins to the future catalogue, e.g. "Diver", "Grand Seiko 9S". */
  family?: string;
  notes?: string;
  /** Honesty flag on the date RANGE itself (community-sourced). */
  rangeConfidence?: "established" | "approximate";
  /** Weak narrowing power — very long production run. */
  longRun?: boolean;
  /** Grand Seiko families use their own dating conventions. */
  grandSeiko?: boolean;
  sources?: string[];
}

export type CaliberDataset = CaliberRecord[];

export interface DecodeOptions {
  caliber?: string;
  /** Injected so decode() stays pure & testable; defaults to bundled seed. */
  caliberData?: CaliberDataset;
  /** For deterministic tests / SSR. Epoch ms. */
  now?: number;
}

export interface MonthResult {
  number: number;
  name: string;
}

export type DecodeErrorCode =
  | "EMPTY"
  | "BAD_CHARS"
  | "TOO_SHORT"
  | "TOO_LONG"
  | "BAD_MONTH"
  | "FIVE_DIGIT_PRE1966";

export type DecodeNoteCode =
  | "OCTOBER_O_OR_ZERO"
  | "SEVEN_DIGIT_LOWER_CONFIDENCE"
  | "CALIBER_UNKNOWN"
  | "CALIBER_CONTRADICTION"
  | "CALIBER_NARROWED_SINGLE"
  | "CALIBER_NARROWED_MULTI"
  | "STILL_IN_PRODUCTION"
  | "LONG_RUN_WEAK_NARROWING"
  | "SCHEME_IS_CONVENTION"
  | "GRAND_SEIKO_DIFFERENT";

export interface DecodeNote {
  code: DecodeNoteCode;
  message: string;
}

export interface CaliberNarrowing {
  caliberQueried: string;
  caliberMatched: CaliberRecord | null;
  /** candidateYears ∩ caliber range. */
  likelyYears: number[];
  singleYear: number | null;
  /** caliber range excludes ALL candidate years. */
  contradiction: boolean;
}

export interface DecodedFields {
  yearDigit: number;
  month: MonthResult;
  /** kept as string to preserve leading zeros (e.g. "0042"). */
  sequence: string;
  sequenceNumber: number;
  /** all decade matches 1966..now. */
  candidateYears: number[];
  narrowing?: CaliberNarrowing;
}

export interface DecodeResult {
  ok: boolean;
  input: { raw: string; normalized: string; length: number };
  /** present only when ok === true. */
  decoded?: DecodedFields;
  confidence: Confidence;
  notes: DecodeNote[];
  error?: { code: DecodeErrorCode; message: string };
}
