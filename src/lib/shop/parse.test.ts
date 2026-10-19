import { describe, it, expect } from "vitest";
import fixture from "@/lib/__fixtures__/shop-products.json";
import { findCaliber } from "@/data/calibers";
import {
  decodeEntities,
  extractMovement,
  formatPrice,
  htmlToLines,
  isSeikoFamily,
  parseSeikoWatches,
  shelfForCaliber,
  shelfForModel,
  type RawStoreProduct,
} from "./parse";

// Fixture = a trimmed, real snapshot of https://tinyhourtales.com/wp-json/wc/store/v1/products
// (public Store API, Oct 2026): Seiko, Lassale, Credor, Pulsar listings + two non-Seiko pieces.
const ORIGIN = "https://tinyhourtales.com";
const resolve = (c: string) => findCaliber(c)?.caliber ?? null;
const watches = parseSeikoWatches(fixture, ORIGIN, { resolve });
const byId = (id: number) => watches.find((w) => w.id === id);

describe("decodeEntities / htmlToLines", () => {
  it("decodes numeric and named entities", () => {
    expect(decodeEntities("Seiko &#8216;The Quiet Socialite&#8217; &amp; co")).toBe("Seiko ‘The Quiet Socialite’ & co");
    expect(decodeEntities("Circa 1985 &#8211; 1993")).toBe("Circa 1985 – 1993");
  });
  it("splits a technical summary into one line per <br>", () => {
    const lines = htmlToLines("<p>Case width: 16 mm<br />\nMovement: Japan Quartz (Caliber 1E20)<br />\nProduction era: 1990s</p>");
    expect(lines).toEqual(["Case width: 16 mm", "Movement: Japan Quartz (Caliber 1E20)", "Production era: 1990s"]);
  });
});

describe("isSeikoFamily", () => {
  it("accepts Seiko and the brands Seiko owns", () => {
    expect(isSeikoFamily({ name: "Lassale ‘The Tiered Shell’", brands: [{ name: "Lassale", slug: "lassale" }] })).toBe(true);
    expect(isSeikoFamily({ name: "Pulsar ‘The Lapis Twilight’", brands: [{ name: "Pulsar", slug: "pulsar" }] })).toBe(true);
    expect(isSeikoFamily({ name: "Credor ‘The Materialist’", brands: [] })).toBe(true);
  });
  it("rejects other brands", () => {
    expect(isSeikoFamily({ name: "Citizen ‘The Sylph’", brands: [{ name: "Citizen", slug: "citizen" }] })).toBe(false);
    expect(isSeikoFamily({ name: "Raymond Weil ‘The Materialist’", brands: [{ name: "Raymond Weil" }] })).toBe(false);
  });
});

describe("parseSeikoWatches on the real feed snapshot", () => {
  it("keeps only Seiko-family pieces", () => {
    expect(watches.length).toBe((fixture as RawStoreProduct[]).length - 2);
    expect(watches.some((w) => /citizen|raymond/i.test(w.name))).toBe(false);
  });

  it("reads the caliber from the Movement line in every phrasing the shop uses", () => {
    expect(byId(3788)?.calibers).toContain("1E20"); // Movement: Japan Quartz (Caliber 1E20)
    expect(byId(3701)?.calibers).toContain("2E20"); // (Cal. 2E20)
    expect(byId(3620)?.calibers).toContain("1F20"); // Japan Seiko Quartz 1F20
    expect(byId(3194)?.calibers).toContain("4N00"); // Japan Seiko Quartz (4N00)
    expect(byId(3093)?.calibers).toContain("5A50"); // Japan Seiko-Lassale Quartz 5A50
    expect(byId(3045)?.calibers).toContain("8420"); // Japan 8420 Ultra-Thin Quartz
    expect(byId(2728)?.calibers).toContain("7731"); // Japan 7731 Quartz
    expect(byId(3298)?.calibers).toContain("V810"); // Pulsar (Seiko) Quartz V810
  });

  it("picks up case–movement references named in the prose", () => {
    expect(byId(3101)?.caseRefs).toContain("2E20-753A");
    expect(byId(3620)?.caseRefs).toContain("1F20-1B60");
  });

  it("decodes names, prices, images and the production era", () => {
    const w = byId(3788)!;
    expect(w.name).toBe("Seiko ‘The Quiet Socialite’");
    expect(w.price).toBe(1400000);
    expect(formatPrice(w)).toBe("Rp 1.400.000");
    expect(w.url.startsWith("https://tinyhourtales.com/")).toBe(true);
    expect(w.image?.src).toMatch(/^https:\/\/tinyhourtales\.com\/wp-content\//);
    expect(w.era).toBe("1990s");
    expect(byId(3655)?.brand).toBe("Lassale");
  });
});

describe("extractMovement guards", () => {
  it("never mistakes a phone number for a case ref", () => {
    const r = extractMovement(["WhatsApp us on 0899-5080-305 for details."], { resolve });
    expect(r.calibers).toEqual([]);
    expect(r.caseRefs).toEqual([]);
  });
  it("ignores year-like tokens on the movement line", () => {
    const r = extractMovement(["Movement: Japan Quartz 1990"], { resolve });
    expect(r.calibers).toEqual([]);
  });
  it("does not read prose words after 'caliber' as codes", () => {
    const r = extractMovement(["A caliber movement celebrated for its caliber that endures."], { resolve });
    expect(r.calibers).toEqual([]);
  });
  it("canonicalises variant suffixes through the caliber database", () => {
    const r = extractMovement(["Movement: Automatic Cal. 7S26A"], { resolve });
    expect(r.calibers).toEqual(["7S26"]);
  });
});

describe("parse rejects unsafe or unavailable listings", () => {
  const base = { id: 1, name: "Seiko ‘Test’", brands: [{ name: "Seiko" }], prices: { price: "100", currency_minor_unit: 0 } };
  it("drops permalinks that leave the shop", () => {
    expect(parseSeikoWatches([{ ...base, permalink: "https://evil.example/x" }], ORIGIN)).toEqual([]);
  });
  it("drops sold-out listings", () => {
    expect(parseSeikoWatches([{ ...base, permalink: `${ORIGIN}/shop/x/`, is_in_stock: false }], ORIGIN)).toEqual([]);
  });
  it("returns [] for a non-array (e.g. an HTML challenge page parsed as text)", () => {
    expect(parseSeikoWatches("<html>", ORIGIN)).toEqual([]);
    expect(parseSeikoWatches({ code: "rest_error" }, ORIGIN)).toEqual([]);
  });
});

describe("shelves", () => {
  it("matches a caliber only when the listing names it", () => {
    const { matched, others } = shelfForCaliber(watches, "2e20");
    expect(matched.map((w) => w.id).sort()).toEqual([3101, 3701]);
    expect(others.every((w) => !w.calibers.includes("2E20"))).toBe(true);
  });
  it("prefers an exact case ref, then the same caliber", () => {
    const s = shelfForModel(watches, { caseRef: "2E20-753A", caliber: "2E20" });
    expect(s.exact.map((w) => w.id)).toEqual([3101]);
    expect(s.sameCaliber.map((w) => w.id)).toEqual([3701]);
  });
});
