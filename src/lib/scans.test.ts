import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  CATALOGUE_ASSET_BASE,
  SCAN_SETS,
  bboxIoU,
  bboxStyle,
  catalogueAssetUrl,
  isValidBbox,
  pagePhrase,
  pageImageUrl,
  pageThumbUrl,
  parsePageParam,
  readerHref,
  scanFor,
  watchPhotoUrl,
  type BBox,
} from "@/lib/scans";
import { MODEL_SETS } from "@/lib/models";
import { findModelBySlug, photoOf, slugForRef } from "@/lib/modelIndex";
import { compactModel } from "@/lib/modelCompact";
import { archiveItems } from "@/lib/archive";

const ID = "1975-1975-seiko-catalog";
const set = SCAN_SETS[ID];
const records = MODEL_SETS[ID].records;

describe("asset URLs", () => {
  it("defaults to /catalogue in /public", () => {
    expect(CATALOGUE_ASSET_BASE).toBe("/catalogue");
    expect(pageImageUrl(set, 8)).toBe("/catalogue/1975/1975-1975-seiko-catalog/pages/p008.webp");
    expect(pageThumbUrl(set, 0)).toBe("/catalogue/1975/1975-1975-seiko-catalog/thumbs/p000.webp");
  });

  it("swaps to an object-storage origin with only the base changing", () => {
    const r2 = "https://scans.example.com/";
    expect(pageImageUrl(set, 12, r2)).toBe("https://scans.example.com/1975/1975-1975-seiko-catalog/pages/p012.webp");
    expect(catalogueAssetUrl("/1975/x/", "/pages/p001.webp", "https://cdn.test//")).toBe("https://cdn.test/1975/x/pages/p001.webp");
  });

  it("resolves full and small watch photos", () => {
    const photo = "watches/p008-01-yp037.webp";
    expect(watchPhotoUrl(set, photo)).toBe("/catalogue/1975/1975-1975-seiko-catalog/watches/p008-01-yp037.webp");
    expect(watchPhotoUrl(set, photo, "sm")).toBe("/catalogue/1975/1975-1975-seiko-catalog/watches/sm/p008-01-yp037.webp");
  });

  it("builds reader links with an optional highlighted watch", () => {
    expect(readerHref(ID, 8)).toBe("/catalogue/read/1975-1975-seiko-catalog?page=8");
    expect(readerHref(ID, 8, "yp037")).toBe("/catalogue/read/1975-1975-seiko-catalog?page=8&watch=yp037");
  });
});

describe("page params", () => {
  it("accepts real pages and falls back to the first", () => {
    expect(parsePageParam(set, "8")).toBe(8);
    expect(parsePageParam(set, "0")).toBe(0);
    expect(parsePageParam(set, "99")).toBe(0);
    expect(parsePageParam(set, "abc")).toBe(0);
    expect(parsePageParam(set, null)).toBe(0);
  });

  it("phrases page labels for captions", () => {
    expect(pagePhrase({ n: 8, label: "8", w: 1, h: 1 })).toBe("page 8");
    expect(pagePhrase({ n: 0, label: "Cover", w: 1, h: 1 })).toBe("the cover");
  });
});

describe("bbox helpers", () => {
  it("validates shape and bounds", () => {
    expect(isValidBbox([0.1, 0.2, 0.3, 0.4])).toBe(true);
    expect(isValidBbox([0, 0, 1, 1])).toBe(true);
    expect(isValidBbox([0.5, 0.5, 0.6, 0.1])).toBe(false); // runs off the page
    expect(isValidBbox([0.1, 0.1, 0, 0.1])).toBe(false); // zero width
    expect(isValidBbox([-0.1, 0.1, 0.2, 0.2])).toBe(false);
    expect(isValidBbox([0.1, 0.1, 0.2])).toBe(false);
    expect(isValidBbox([0.1, 0.1, Number.NaN, 0.2])).toBe(false);
    expect(isValidBbox("0.1,0.1,0.2,0.2")).toBe(false);
  });

  it("positions overlays in percent", () => {
    expect(bboxStyle([0.1516, 0.176, 0.1375, 0.2553])).toEqual({ left: "15.16%", top: "17.6%", width: "13.75%", height: "25.53%" });
  });

  it("measures overlap", () => {
    const a: BBox = [0, 0, 0.5, 0.5];
    expect(bboxIoU(a, a)).toBeCloseTo(1);
    expect(bboxIoU(a, [0.5, 0.5, 0.5, 0.5])).toBe(0);
    expect(bboxIoU(a, [0.25, 0, 0.5, 0.5])).toBeCloseTo(1 / 3);
  });
});

describe("1975 digitised catalogue", () => {
  it("has a manifest for every scanned page", () => {
    expect(scanFor(ID)).toBe(set);
    expect(set.pages).toHaveLength(MODEL_SETS[ID].catalog.pages);
    expect(set.pages.map((p) => p.n)).toEqual(set.pages.map((_, i) => i));
  });

  it("gives every watch record a valid box and photo on a real page", () => {
    expect(records).toHaveLength(150);
    for (const r of records) {
      expect(isValidBbox(r.bbox), r.ref).toBe(true);
      expect(r.photo, r.ref).toMatch(/^watches\/p\d{3}-\d{2}-[a-z0-9-]+\.webp$/);
      expect(r.photoSize?.length, r.ref).toBe(2);
      expect(set.pages.some((p) => p.n === r.page), r.ref).toBe(true);
    }
    expect(MODEL_SETS[ID].catalog.photos).toBe(150);
  });

  it("never lets two photos on a page overlap", () => {
    const byPage = new Map<number, BBox[]>();
    for (const r of records) byPage.set(r.page, [...(byPage.get(r.page) ?? []), r.bbox as BBox]);
    for (const [page, boxes] of byPage) {
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++) expect(bboxIoU(boxes[i], boxes[j]), `p${page} #${i + 1}/#${j + 1}`).toBeLessThan(0.02);
    }
  });

  it("orders boxes on a page in reading order (rows, then left to right)", () => {
    const byPage = new Map<number, BBox[]>();
    for (const r of records) byPage.set(r.page, [...(byPage.get(r.page) ?? []), r.bbox as BBox]);
    for (const [page, boxes] of byPage) {
      for (let i = 1; i < boxes.length; i++) {
        const [a, b] = [boxes[i - 1], boxes[i]];
        const sameRow = Math.abs(a[1] - b[1]) < 0.1;
        expect(sameRow ? b[0] > a[0] : b[1] > a[1], `p${page} #${i}→#${i + 1}`).toBe(true);
      }
    }
  });

  it("ships every page, thumbnail and watch crop it references", () => {
    const root = join(process.cwd(), "public", "catalogue", ...set.dir.split("/"));
    for (const p of set.pages) {
      expect(existsSync(join(root, "pages", `p${String(p.n).padStart(3, "0")}.webp`))).toBe(true);
      expect(existsSync(join(root, "thumbs", `p${String(p.n).padStart(3, "0")}.webp`))).toBe(true);
    }
    for (const r of records) {
      expect(existsSync(join(root, r.photo!)), r.photo).toBe(true);
      expect(existsSync(join(root, r.photo!.replace("watches/", "watches/sm/"))), r.photo).toBe(true);
    }
  });

  it("carries the photo through to the model index, the compact grid and the archive", () => {
    const slug = slugForRef("YP037")!;
    const e = findModelBySlug(slug)!;
    expect(e.photo).toMatchObject({ catalogId: ID, page: 8, pageLabel: "8", pagePhrase: "page 8", year: 1975 });
    expect(e.photo!.url).toMatch(/\/watches\/p008-01-yp037\.webp$/);
    expect(compactModel(e).i).toMatch(/\/watches\/sm\/p008-01-yp037\.webp$/);
    const item = archiveItems().find((c) => c.id === ID)!;
    expect(item.photoCount).toBe(150);
    expect(item.readerHref).toBe(readerHref(ID, 0));
    expect(archiveItems().find((c) => c.id === "1974-1974-seiko-v2")?.readerHref).toBeNull();
  });

  it("returns no photo for a record whose catalogue is not digitised", () => {
    const rec = { ...records[0] };
    expect(photoOf({ catalogId: "1974-1974-seiko-v2", catalogTitle: "x", year: 1974, record: rec })).toBeNull();
    expect(photoOf({ catalogId: ID, catalogTitle: "x", year: 1975, record: { ...rec, bbox: [0.9, 0.9, 0.5, 0.5] } })).toBeNull();
  });

  it("keeps the refs corrected against the catalogue index", () => {
    const refs = new Set(records.map((r) => r.ref));
    for (const fixed of ["YP001", "BW090", "BZ024"]) expect(refs.has(fixed)).toBe(true);
    for (const old of ["YP001C", "BW0xx", "9Z024"]) expect(refs.has(old)).toBe(false);
  });
});
