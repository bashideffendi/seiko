import { describe, it, expect } from "vitest";
import { decodeSerial, splitCaseback } from "./decodeCore";
import { CALIBERS } from "@/data/calibers";
import { caliberSightings, decoderCalibers } from "./attestation";
import { catalogueMatches } from "@/lib/catalogueMatches";

const NOW = Date.UTC(2026, 9, 20);
const data = decoderCalibers();
const decode = (s: string, caliber?: string) => decodeSerial(s, data, { now: NOW, caliber });

describe("splitCaseback", () => {
  it("splits a caseback number into caliber and case code", () => {
    expect(splitCaseback("6309-7040")).toEqual({ caliber: "6309", caseCode: "7040" });
    expect(splitCaseback("6309 7040")).toEqual({ caliber: "6309", caseCode: "7040" });
    expect(splitCaseback("63097040")).toEqual({ caliber: "6309", caseCode: "7040" });
    expect(splitCaseback("7s26-0020")).toEqual({ caliber: "7S26", caseCode: "0020" });
    expect(splitCaseback("6309-576A")).toEqual({ caliber: "6309", caseCode: "576A" });
  });
  it("passes a bare caliber (with or without a revision letter) through", () => {
    expect(splitCaseback("6309")).toEqual({ caliber: "6309", caseCode: null });
    expect(splitCaseback("7S26A")).toEqual({ caliber: "7S26A", caseCode: null });
    expect(splitCaseback("6119C")).toEqual({ caliber: "6119C", caseCode: null });
  });
});

describe("decoder with a caseback number", () => {
  it("dates 6309-7040 like the caliber alone and keeps the case code", () => {
    const r = decode("2D5822", "6309-7040");
    expect(r.decoded?.month.name).toBe("December");
    expect(r.decoded?.narrowing).toMatchObject({ caliberQueried: "6309", caseCode: "7040", singleYear: 1982 });
    expect(r.notes.some((n) => n.code === "CASE_CODE_READ")).toBe(true);
    expect(decode("2D5822", "6309").decoded?.narrowing?.singleYear).toBe(1982);
  });
});

describe("catalogue evidence", () => {
  it("finds movements printed in the digitised catalogues", () => {
    const s = caliberSightings();
    expect(s.get("6159")).toMatchObject({ first: 1968, last: 1977 });
    expect(s.get("2220")?.first).toBeLessThanOrEqual(1974);
  });

  it("widens a reference window that leaves out a catalogue year", () => {
    const ref = CALIBERS.find((c) => c.caliber === "6159")!;
    const dec = data.find((c) => c.caliber === "6159")!;
    expect(dec.endYear!).toBeGreaterThanOrEqual(1977);
    if (ref.endYear !== null && ref.endYear < 1977) expect(dec.widenedByCatalogue).toBe(true);
    // A 6159 serial from 1977 is no longer a contradiction.
    const r = decode("7N0001", "6159");
    expect(r.decoded?.narrowing?.contradiction).toBe(false);
    expect(r.decoded?.narrowing?.likelyYears).toContain(1977);
  });

  it("dates a movement known only from catalogues to the nearest decade, never a contradiction", () => {
    const rec = data.find((c) => c.caliber === "2220");
    expect(rec?.attestedOnly).toBe(true);
    const r = decode("5N1234", "2220");
    expect(r.decoded?.narrowing?.contradiction).toBe(false);
    expect(r.decoded?.narrowing?.likelyYears).toEqual([1975]);
    expect(r.notes.some((n) => n.code === "CATALOGUE_ATTESTED_ONLY" && /\(19\d\d–19\d\d\)/.test(n.message))).toBe(true);
    expect(r.confidence).toBe("medium");
  });

  it("treats the 6159 hi-beat diver as a Seiko, not a Grand Seiko (catalogued as a diver)", () => {
    const r = decode("7N0001", "6159-7000");
    expect(r.notes.some((n) => n.code === "GRAND_SEIKO_DIFFERENT")).toBe(false);
    expect(CALIBERS.find((c) => c.caliber === "6159")?.endYear).toBe(1977);
  });

  it("does not add an evidence-only record for a caliber the reference already has", () => {
    expect(data.filter((c) => c.caliber === "6309")).toHaveLength(1);
    expect(data.find((c) => c.caliber === "6309")?.attestedOnly).toBeUndefined();
  });
});

describe("catalogueMatches", () => {
  it("lists catalogued models for a movement, photographed ones first", () => {
    const m = catalogueMatches("6159", null);
    expect(m.caliberTotal).toBeGreaterThan(0);
    expect(m.sameCaliber.length).toBeGreaterThan(0);
    const firstNoPhoto = m.sameCaliber.findIndex((x) => !x.i);
    if (firstNoPhoto >= 0) expect(m.sameCaliber.slice(firstNoPhoto).every((x) => !x.i)).toBe(true);
  });
});
