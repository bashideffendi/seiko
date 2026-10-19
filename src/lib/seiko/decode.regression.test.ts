import { describe, it, expect } from "vitest";
import { decodeSeiko } from "./decode";
import { decodeSerial } from "./decodeCore";
import { CALIBERS, findCaliber, slimCalibers } from "@/data/calibers";
import { DECODER_EXAMPLES } from "@/components/decoder/examples";

// Audit 2026-10: real-world serial + caliber matrix, input edge cases and the
// data-integrity bugs found in the caliber merge. "Now" is pinned to 19 Oct 2026.
const NOW = Date.UTC(2026, 9, 19);
const decode = (s: string, caliber?: string) => decodeSeiko(s, { now: NOW, caliber });
const likely = (s: string, caliber: string) => decode(s, caliber).decoded?.narrowing?.likelyYears;

describe("real serial × common caliber matrix", () => {
  it.each([
    // serial, caliber, expected likely years
    ["7N0142", "6309", [1977, 1987]],          // Turtle — two decades fit 1976–1988
    ["9D2210", "6309", [1979]],                // single survivor
    ["6O1234", "7S26", [1996, 2006, 2016]],    // SKX era (1996–2019, long run)
    ["370237", "5931", [1983]],                // WatchSleuth parity (pinned in core)
    ["480123", "4205", [1974, 1984]],          // ladies 42-series automatic
    ["510456", "2E20", [1985, 1995, 2005]],    // long-run ladies quartz
    ["4N2001", "6R15", [2014]],                // SARB era 2006–2019
    ["1D0420", "4R36", [2011, 2021]],          // still in production
    ["8O0001", "7N43", [1988, 1998, 2008, 2018]], // ubiquitous quartz, weak narrowing
  ] as const)("%s with %s", (serial, cal, years) => {
    const r = decode(serial, cal);
    expect(r.ok).toBe(true);
    expect(r.decoded?.narrowing?.caliberMatched).not.toBeNull();
    expect(r.decoded?.narrowing?.likelyYears).toEqual(years);
  });

  it("flags a contradiction instead of guessing (7002 diver, year digit 7)", () => {
    const r = decode("7D1234", "7002");
    expect(r.decoded?.narrowing?.contradiction).toBe(true);
    expect(r.confidence).toBe("low");
  });

  it("decade ambiguity stays visible without a caliber", () => {
    const r = decode("7N0142");
    expect(r.decoded?.candidateYears).toEqual([1967, 1977, 1987, 1997, 2007, 2017]);
    expect(r.decoded?.narrowing).toBeUndefined();
  });
});

describe("audit fixes — input handling", () => {
  it("rules out a month that hasn't happened yet this year", () => {
    // Nov/Dec 2026 are still in the future on 19 Oct 2026.
    const r = decode("6N1234");
    expect(r.decoded?.candidateYears).not.toContain(2026);
    expect(r.notes.some((n) => n.code === "FUTURE_MONTH_EXCLUDED")).toBe(true);
    // …but the current month is fine.
    expect(decode("6O1234").decoded?.candidateYears).toContain(2026);
  });

  it("reads a letter O outside the month position as a zero", () => {
    const r = decode("7N1O42");
    expect(r.ok).toBe(true);
    expect(r.decoded?.sequence).toBe("1042");
    expect(r.decoded?.sequenceNumber).toBe(1042);
    expect(r.notes.some((n) => n.code === "LETTER_O_READ_AS_ZERO")).toBe(true);
    expect(decode("O51234").decoded?.yearDigit).toBe(0);
  });

  it("rejects N or D outside the month position (sequence must be numeric)", () => {
    expect(decode("7N12D4").error?.code).toBe("BAD_CHARS");
    expect(decode("N71234").error?.code).toBe("BAD_CHARS");
  });

  it("never returns NaN for the production number", () => {
    for (const s of ["7DO0O1", "0O0000", "9D9999", "5512345"]) {
      const r = decode(s);
      expect(r.ok).toBe(true);
      expect(Number.isNaN(r.decoded!.sequenceNumber)).toBe(false);
    }
  });

  it("tolerates spaces, dashes, lowercase and Cyrillic O", () => {
    expect(decode(" 7n-01 42 ").decoded?.month.number).toBe(11);
    expect(decode("7О0142").decoded?.month.number).toBe(10);
  });

  it("handles junk without throwing", () => {
    for (const s of ["", "   ", "🙂🙂🙂🙂🙂🙂", "<script>", "12", "123456789", "SEIKO1"]) {
      expect(() => decode(s, "6309")).not.toThrow();
      expect(decode(s).ok).toBe(false);
    }
  });

  it("every example button on the decoder decodes cleanly", () => {
    for (const ex of DECODER_EXAMPLES) {
      const r = decode(ex.serial, ex.caliber);
      expect(r.ok, `${ex.serial}/${ex.caliber}`).toBe(true);
      expect(r.decoded?.narrowing?.caliberMatched, ex.caliber).not.toBeNull();
    }
  });
});

describe("audit fixes — caliber data integrity", () => {
  it("no longer lets a core alias swallow a distinct caliber", () => {
    expect(findCaliber("7N01")?.caliber).toBe("7N01");
    expect(findCaliber("7N42")?.caliber).toBe("7N42");
    expect(findCaliber("6619")?.caliber).toBe("6619");
    expect(findCaliber("5M63")?.caliber).toBe("5M63");
    expect(findCaliber("5M85")?.caliber).toBe("5M85");
  });

  it("stores every canonical key in uppercase with no duplicates", () => {
    const keys = CALIBERS.map((c) => c.caliber);
    expect(keys.every((k) => k === k.toUpperCase())).toBe(true);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("every caliber has a sane production window", () => {
    for (const c of CALIBERS) {
      expect(c.startYear, c.caliber).toBeGreaterThanOrEqual(1900);
      if (c.endYear != null) expect(c.endYear, c.caliber).toBeGreaterThanOrEqual(c.startYear);
    }
  });

  it("the slim client dataset decodes exactly like the full one", () => {
    const slim = slimCalibers();
    for (const [s, cal] of [["9D2210", "6309"], ["370237", "5931"], ["6O1234", "7S26A"], ["7D1234", "9S55"]]) {
      const full = decode(s, cal);
      const lite = decodeSerial(s, slim, { now: NOW, caliber: cal });
      expect(lite.decoded?.narrowing?.likelyYears).toEqual(full.decoded?.narrowing?.likelyYears);
      expect(lite.confidence).toBe(full.confidence);
      expect(lite.notes.map((n) => n.code)).toEqual(full.notes.map((n) => n.code));
    }
  });

  it("likely years are always a subset of the candidates", () => {
    for (const c of CALIBERS.slice(0, 80)) {
      for (const d of [0, 3, 7]) {
        const ly = likely(`${d}51234`, c.caliber) ?? [];
        const cand = decode(`${d}51234`).decoded!.candidateYears;
        expect(ly.every((y) => cand.includes(y))).toBe(true);
      }
    }
  });
});

describe("audit fixes — ladies' & dress quartz calibers sold at Tiny Hour Tales", () => {
  it("resolves the shop's common calibers, each with a cited source", () => {
    for (const cal of ["1E20", "1F20", "1F21", "4N20", "4N21", "2J31", "4J41", "5A50", "8420", "2F50", "6030", "2320", "1220", "7321", "1400", "1421"]) {
      const rec = findCaliber(cal);
      expect(rec?.caliber, cal).toBe(cal);
      expect(rec?.rangeConfidence, cal).toBe("approximate");
      expect(rec?.sources?.length, cal).toBeGreaterThan(0);
    }
  });

  it("narrows a 1E20 serial to its two plausible decades", () => {
    expect(likely("9O1234", "1E20")).toEqual([1989, 1999]);
  });

  it("stays honest about calibers without solid production data (1N01, V700)", () => {
    for (const cal of ["1N01", "V700"]) {
      const r = decode("510456", cal);
      expect(r.notes.some((n) => n.code === "CALIBER_UNKNOWN"), cal).toBe(true);
      expect(r.decoded?.narrowing?.likelyYears).toEqual(r.decoded?.candidateYears);
    }
  });
});
