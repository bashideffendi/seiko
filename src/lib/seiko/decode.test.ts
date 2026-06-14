import { describe, it, expect } from "vitest";
import { decodeSeiko, normalizeSerial, candidateYears } from "./decode";
import { findCaliber } from "@/data/calibers";

// Pin "now" to 2026 so candidate-year generation is deterministic.
const NOW = Date.UTC(2026, 5, 13);
const decode = (s: string, caliber?: string) => decodeSeiko(s, { now: NOW, caliber });

describe("normalizeSerial", () => {
  it("trims, uppercases, strips spaces and dashes", () => {
    expect(normalizeSerial("  7d 12-34 ")).toBe("7D1234");
  });
  it("converts Cyrillic О to Latin O", () => {
    expect(normalizeSerial("7О1234")).toBe("7O1234");
  });
});

describe("candidateYears", () => {
  it("returns every 1966..now year ending in the digit", () => {
    expect(candidateYears(7, 2026)).toEqual([1967, 1977, 1987, 1997, 2007, 2017]);
    expect(candidateYears(0, 2026)).toEqual([1970, 1980, 1990, 2000, 2010, 2020]);
  });
});

describe("decodeSeiko — basic", () => {
  it("decodes a 6-digit serial (year digit, month, sequence)", () => {
    const r = decode("7D1234");
    expect(r.ok).toBe(true);
    expect(r.decoded?.yearDigit).toBe(7);
    expect(r.decoded?.month).toEqual({ number: 12, name: "December" });
    expect(r.decoded?.sequence).toBe("1234");
    expect(r.decoded?.candidateYears).toEqual([1967, 1977, 1987, 1997, 2007, 2017]);
    expect(r.confidence).toBe("medium");
  });

  it("preserves leading zeros in the production sequence", () => {
    const r = decode("7D0042");
    expect(r.decoded?.sequence).toBe("0042");
    expect(r.decoded?.sequenceNumber).toBe(42);
  });
});

describe("decodeSeiko — October O vs 0", () => {
  it("treats position-2 'O' as October", () => {
    const r = decode("7O1234");
    expect(r.decoded?.month.number).toBe(10);
    expect(r.notes.some((n) => n.code === "OCTOBER_O_OR_ZERO")).toBe(true);
  });
  it("treats position-2 '0' as October too", () => {
    const r = decode("701234");
    expect(r.decoded?.month.number).toBe(10);
  });
});

describe("decodeSeiko — leading-zero year is NOT October", () => {
  it("reads a leading 0 as a year digit, month from position 2", () => {
    const r = decode("0N1234");
    expect(r.ok).toBe(true);
    expect(r.decoded?.yearDigit).toBe(0);
    expect(r.decoded?.month).toEqual({ number: 11, name: "November" });
    expect(r.decoded?.candidateYears).toEqual([1970, 1980, 1990, 2000, 2010, 2020]);
  });
});

describe("decodeSeiko — length handling", () => {
  it("rejects 5-character serials as pre-1966 / worn", () => {
    const r = decode("7D123");
    expect(r.ok).toBe(false);
    expect(r.error?.code).toBe("FIVE_DIGIT_PRE1966");
  });
  it("decodes 7-digit but flags lower confidence", () => {
    const r = decode("7D12345");
    expect(r.ok).toBe(true);
    expect(r.decoded?.sequence).toBe("12345");
    expect(r.confidence).toBe("low");
    expect(r.notes.some((n) => n.code === "SEVEN_DIGIT_LOWER_CONFIDENCE")).toBe(true);
  });
  it("rejects >7 characters", () => {
    expect(decode("7D123456").error?.code).toBe("TOO_LONG");
  });
  it("rejects bad characters", () => {
    expect(decode("7D12!4").error?.code).toBe("BAD_CHARS");
  });
  it("rejects empty input", () => {
    expect(decode("").error?.code).toBe("EMPTY");
  });
});

describe("decodeSeiko — caliber narrowing", () => {
  it("narrows to a single year when only one candidate fits the caliber window", () => {
    // 6309 ran 1976–1988; year digit 9 → only 1979 fits.
    const r = decode("9D1234", "6309");
    expect(r.decoded?.narrowing?.singleYear).toBe(1979);
    expect(r.confidence).toBe("high");
    expect(r.notes.some((n) => n.code === "CALIBER_NARROWED_SINGLE")).toBe(true);
  });

  it("keeps multiple candidates when the caliber window spans them", () => {
    // 6309 (1976–1988); year digit 6 → 1976 and 1986 both fit.
    const r = decode("6D1234", "6309");
    expect(r.decoded?.narrowing?.likelyYears).toEqual([1976, 1986]);
    expect(r.decoded?.narrowing?.singleYear).toBeNull();
    expect(r.confidence).toBe("medium");
  });

  it("surfaces a contradiction when no candidate fits the caliber window", () => {
    // 7002 ran 1988–1996; year digit 7 → 1987 and 1997 both miss the window.
    const r = decode("7D1234", "7002");
    expect(r.decoded?.narrowing?.contradiction).toBe(true);
    expect(r.notes.some((n) => n.code === "CALIBER_CONTRADICTION")).toBe(true);
    expect(r.confidence).toBe("low");
  });

  it("flags an unknown caliber without narrowing", () => {
    const r = decode("7D1234", "ZZZZ");
    expect(r.decoded?.narrowing?.caliberMatched).toBeNull();
    expect(r.notes.some((n) => n.code === "CALIBER_UNKNOWN")).toBe(true);
  });

  it("hedges on Grand Seiko calibers", () => {
    const r = decode("7D1234", "9S55");
    expect(r.notes.some((n) => n.code === "GRAND_SEIKO_DIFFERENT")).toBe(true);
    expect(r.confidence).not.toBe("high");
  });

  it("does not oversell a long-run caliber even at a single survivor", () => {
    // 4R36 (2011–present, weak narrowing); year digit 9 → only 2019 fits the window.
    const r = decode("9D1234", "4R36");
    expect(r.decoded?.narrowing?.singleYear).toBe(2019);
    expect(r.confidence).toBe("medium"); // long-run → never sold as "high"
    expect(r.notes.some((n) => n.code === "LONG_RUN_WEAK_NARROWING")).toBe(true);
  });
});

describe("findCaliber — alias & variant resolution", () => {
  it("resolves a variant suffix to the base caliber", () => {
    expect(findCaliber("7S26A")?.caliber).toBe("7s26");
  });
  it("resolves the NH35 export twin", () => {
    expect(findCaliber("nh35")?.caliber).toBe("nh35");
  });
  it("returns null for an unknown caliber", () => {
    expect(findCaliber("XYZ99")).toBeNull();
  });
});

describe("decodeSeiko — honesty", () => {
  it("always includes the convention disclaimer note", () => {
    const r = decode("7D1234");
    expect(r.notes.some((n) => n.code === "SCHEME_IS_CONVENTION")).toBe(true);
  });
});

describe("decodeSeiko — external cross-checks (WatchSleuth)", () => {
  it("matches WatchSleuth for 370237 / cal. 5931 → July 1983", () => {
    // https://www.watchsleuth.com/seikodatefinder/?mvmt=5931&case=5170&serial=370237
    // 5931 is an early-’80s analog quartz, so digit-3 resolves to a single year.
    const r = decode("370237", "5931");
    expect(r.ok).toBe(true);
    expect(r.decoded?.month).toEqual({ number: 7, name: "July" });
    expect(r.decoded?.narrowing?.singleYear).toBe(1983);
    expect(r.decoded?.narrowing?.likelyYears).toEqual([1983]);
  });
});
