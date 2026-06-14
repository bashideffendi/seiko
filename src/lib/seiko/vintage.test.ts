import { describe, it, expect } from "vitest";
import { decodeVintageCaseCode, normalizeCaseCode } from "./vintage";

describe("normalizeCaseCode", () => {
  it("uppercases and strips spaces, dashes and a REF prefix", () => {
    expect(normalizeCaseCode("  ref. j14 070 ")).toBe("J14070");
    expect(normalizeCaseCode("14-041")).toBe("14041");
  });
});

describe("decodeVintageCaseCode — system", () => {
  it("decodes a J-prefixed code: half-ligne added, series + progressive split", () => {
    const r = decodeVintageCaseCode("J14070");
    expect(r.ok).toBe(true);
    expect(r.hasJ).toBe(true);
    expect(r.series).toBe("14");
    expect(r.ligne).toBe(14.5);
    expect(r.progressive).toBe("070");
    expect(r.approxMm).toBeCloseTo(32.7, 1);
  });

  it("decodes a non-J code with whole lignes", () => {
    const r = decodeVintageCaseCode("14041");
    expect(r.ok).toBe(true);
    expect(r.hasJ).toBe(false);
    expect(r.ligne).toBe(14);
    expect(r.series).toBe("14");
    expect(r.progressive).toBe("041");
  });

  it("matches a curated famous code (first Grand Seiko)", () => {
    const r = decodeVintageCaseCode("J14070");
    expect(r.match?.models).toContain("Grand Seiko Chronometer");
  });

  it("falls back across J / non-J when matching curated codes", () => {
    // "14070" is curated; querying without J should still find a match.
    expect(decodeVintageCaseCode("14070").match).not.toBeNull();
    // "J14102" is curated under the J key; querying the bare digits finds it too.
    expect(decodeVintageCaseCode("14102").match?.models).toContain("King Seiko");
  });

  it("exposes ligne-series context", () => {
    expect(decodeVintageCaseCode("13035").seriesInfo?.prefix).toBe("13");
  });

  it("always carries the honesty notes (no serial dating, nominal ligne)", () => {
    const r = decodeVintageCaseCode("J14000");
    expect(r.notes.length).toBeGreaterThanOrEqual(3);
  });
});

describe("decodeVintageCaseCode — rejection", () => {
  it("rejects empty input", () => {
    expect(decodeVintageCaseCode("").ok).toBe(false);
  });

  it("redirects a modern case-movement ref to the right tool", () => {
    const r = decodeVintageCaseCode("7S26-0020");
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/modern reference/i);
  });

  it("redirects a marketing ref (SKX007)", () => {
    const r = decodeVintageCaseCode("SKX007");
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/modern reference/i);
  });

  it("rejects wrong-length input", () => {
    expect(decodeVintageCaseCode("1404").ok).toBe(false);
    expect(decodeVintageCaseCode("140412").ok).toBe(false);
  });
});
