// Pre-1966 Seiko case-code system (early 1950s – 1964).
//
// Before the 1966 serial-dating scheme, Seiko identified watches by a 5-digit
// CASE CODE, sometimes preceded by "J". The system, as read here:
//   • first two digits ≈ the nominal dial size in LIGNES
//   • a leading "J" is taken to add half a ligne (J12 → 12.5 lignes)
//   • the last three digits are a progressive number (000, 001, 002, …)
//
// Caveat: the "J" reading is community convention and is disputed. We follow the
// theseikoguy.com reading (J = +0.5 ligne); some researchers (e.g. Plus9Time)
// instead read "J" as "Just" = exactly N lignes, with the non-J code the half-size.
// The two conventions disagree, so treat the ligne figure as approximate.
//
// The SYSTEM above is factual and lets us decode ANY 5-digit code (ligne size +
// progressive). The CURATED table below is our own short list of well-known,
// collectible codes — not an exhaustive transcription. Many codes were never
// documented; the decoder is honest about that.
//
// 1 ligne = 2.255833 mm.

export const LIGNE_MM = 2.255833;

export interface VintageCaseEntry {
  /** Normalised code as keyed, e.g. "J14070". */
  code: string;
  /** Model name(s) Seiko fitted to this case. */
  models: string[];
  /** Case material(s), abbreviated. */
  material?: string;
  /** One-line collector note. */
  note?: string;
}

/** What each ligne-family (first two digits) is known for. */
export interface LigneSeries {
  prefix: string;
  /** Nominal lignes for a non-J code in this family. */
  ligne: number;
  note: string;
}

export const LIGNE_SERIES: Record<string, LigneSeries> = {
  "12": { prefix: "12", ligne: 12, note: "Smaller 12-ligne cases — dress pieces, Goldfeather, early SilverWave and Liner." },
  "13": { prefix: "13", ligne: 13, note: "13-ligne family — Marvel, Cronos, Champion, Sportsman and the first Seikomatic/Sea Lion water-proof cases." },
  "14": { prefix: "14", ligne: 14, note: "The flagship 14-ligne family — Marvel, Cronos, Crown, Lord Marvel, Seikomatic, and the first King Seiko & Grand Seiko." },
};

/**
 * A short curated set of notable pre-1966 codes. Keyed by normalised code
 * (uppercase, no separators). Both J- and non-J variants are listed where the
 * code is famous enough to matter.
 */
export const VINTAGE_CASE_CODES: Record<string, VintageCaseEntry> = {
  // — The foundational Marvel / Cronos / Crown 14-ligne family —
  J14000: { code: "J14000", models: ["Marvel", "Laurel", "Crown", "Unique"], material: "Stainless / front EGP", note: "The 14-ligne workhorse case shared across Seiko's first in-house lines." },
  J14004: { code: "J14004", models: ["Marvel", "Cronos"], material: "Stainless / front EGP" },
  J14037: { code: "J14037", models: ["Super Cronos", "Champion"], material: "Stainless / front EGP" },
  J14101: { code: "J14101", models: ["Cronos Self Dater"], note: "Early Seiko date complication." },

  // — Lord Marvel (the hand-wound flagship) —
  J14038: { code: "J14038", models: ["Lord Marvel"], material: "Stainless steel" },
  J14039: { code: "J14039", models: ["Lord Marvel"], material: "14K gold filled" },
  J14050: { code: "J14050", models: ["Lord Marvel"], material: "18K gold", note: "Solid-gold Lord Marvel." },
  J14068: { code: "J14068", models: ["Lord Marvel"], material: "14K gold filled" },
  "14056": { code: "14056", models: ["Lord Marvel"], material: "Stainless steel" },
  "14057": { code: "14057", models: ["Lord Marvel"], material: "14K gold filled" },

  // — Goldfeather (ultra-thin dress) —
  J14057: { code: "J14057", models: ["Goldfeather"], material: "14K gold filled 80µ", note: "Ultra-thin dress watch, a 1950s halo piece." },
  J14078: { code: "J14078", models: ["Goldfeather"], material: "14K gold filled" },
  J14081: { code: "J14081", models: ["Goldfeather"], material: "EGP 20µ" },

  // — King Seiko & Grand Seiko (the firsts) —
  J14102: { code: "J14102", models: ["King Seiko"], material: "Stainless / 14K GF 100µ", note: "The case of the first King Seiko (1961)." },
  J14070: { code: "J14070", models: ["Grand Seiko Chronometer"], material: "14K gold filled", note: "The case of the very first Grand Seiko (1960), cal. 3180." },
  "14070": { code: "14070", models: ["Grand Seiko Chronometer"], material: "14K gold filled", note: "Non-J variant of the first Grand Seiko case." },

  // — Seikomatic (automatic) —
  J14064: { code: "J14064", models: ["Seikomatic"], material: "Stainless / EGP back GF" },
  J14074: { code: "J14074", models: ["Seikomatic"], material: "Stainless / GF back" },
  J14099: { code: "J14099", models: ["Seikomatic"], material: "Stainless / EGP" },
  J13059: { code: "J13059", models: ["Seikomatic Self Dater"], material: "Stainless steel", note: "Water Proof 30." },
  J13083: { code: "J13083", models: ["Seikomatic Self Dater"], material: "Gold cap 260µ", note: "Water Proof 70 — premium gold-capped diver-style case." },

  // — Sportsman / Champion / Alpinist —
  "14041": { code: "14041", models: ["Marvel", "Laurel", "Laurel Alpinist"], material: "Stainless steel", note: "Early Alpinist heritage." },
  J13035: { code: "J13035", models: ["Sportsman (Dolphin)"], material: "Stainless steel" },
  J13033: { code: "J13033", models: ["Champion Alpinist"], material: "Stainless steel", note: "Rain Proof." },

  // — Sea Lion / SilverWave (early sports & water-resistance) —
  J13066: { code: "J13066", models: ["C22 Sea Lion"], material: "Stainless steel" },
  J13088: { code: "J13088", models: ["M55 Sea Lion (Seikomatic)"], material: "Stainless steel" },
  J12032: { code: "J12032", models: ["Seikomatic SilverWave"], material: "Stainless steel", note: "Water Proof 30 — early water-resistant Seiko." },
  J12082: { code: "J12082", models: ["Seikomatic SilverWave"], material: "Stainless steel", note: "Water Proof 50." },

  // — Curiosities —
  J14054: { code: "J14054", models: ["Gyro Marvel"], material: "Stainless / front EGP", note: "Seiko's first automatic (magic-lever) movement." },
  J14108: { code: "J14108", models: ["Motorist (Harmony)"], material: "EGP back stainless" },
  J12084: { code: "J12084", models: ["Disney Time"], material: "Stainless back", note: "Character watch." },
};
