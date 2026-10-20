import { describe, expect, it } from "vitest";
import { IDENTITY, MAX_ZOOM, clampView, focusBox, panBy, swipeDirection, zoomAt } from "@/lib/zoom";

const W = 400;
const H = 520;

describe("zoomAt", () => {
  it("keeps the point under the cursor fixed", () => {
    const v = zoomAt(IDENTITY, 2, 100, 200, W, H);
    expect(v.s).toBe(2);
    // content point (100, 200) is still at viewport (100, 200)
    expect(100 * v.s + v.x).toBeCloseTo(100);
    expect(200 * v.s + v.y).toBeCloseTo(200);
  });

  it("clamps the scale to 1…MAX_ZOOM", () => {
    expect(zoomAt(IDENTITY, 0.3, 10, 10, W, H)).toEqual(IDENTITY);
    expect(zoomAt(IDENTITY, 99, 10, 10, W, H).s).toBe(MAX_ZOOM);
  });

  it("returns to the identity view when zoomed back out", () => {
    const v = zoomAt(IDENTITY, 3, 300, 400, W, H);
    expect(zoomAt(v, 1, 50, 50, W, H)).toEqual(IDENTITY);
  });
});

describe("clampView / panBy", () => {
  it("never shows blank edges", () => {
    const v = clampView({ s: 2, x: 50, y: -5000 }, W, H);
    expect(v.x).toBe(0);
    expect(v.y).toBe(H - H * 2);
  });

  it("pans within bounds", () => {
    const v0 = zoomAt(IDENTITY, 2, W / 2, H / 2, W, H);
    const v1 = panBy(v0, -30, 20, W, H);
    expect(v1.x).toBeCloseTo(v0.x - 30);
    expect(v1.y).toBeCloseTo(v0.y + 20);
    expect(panBy(v0, 10_000, 10_000, W, H)).toMatchObject({ x: 0, y: 0 });
  });

  it("cannot pan an unzoomed page", () => {
    expect(panBy(IDENTITY, 40, 40, W, H)).toEqual(IDENTITY);
  });
});

describe("focusBox", () => {
  it("centres a watch box in the viewport", () => {
    const box: [number, number, number, number] = [0.4, 0.4, 0.2, 0.2];
    const v = focusBox(box, 2, W, H);
    const cx = (box[0] + box[2] / 2) * W * v.s + v.x;
    const cy = (box[1] + box[3] / 2) * H * v.s + v.y;
    expect(cx).toBeCloseTo(W / 2);
    expect(cy).toBeCloseTo(H / 2);
  });

  it("stays inside the page for a box at the edge", () => {
    const v = focusBox([0, 0, 0.1, 0.1], 2, W, H);
    expect(v).toMatchObject({ s: 2, x: 0, y: 0 });
  });
});

describe("swipeDirection", () => {
  it("turns on a long or quick horizontal swipe", () => {
    expect(swipeDirection(-120, 10, 400, W)).toBe(-1);
    expect(swipeDirection(120, -10, 400, W)).toBe(1);
    expect(swipeDirection(-40, 0, 150, W)).toBe(-1);
  });

  it("ignores vertical scrolls and short drags", () => {
    expect(swipeDirection(-60, 200, 300, W)).toBe(0);
    expect(swipeDirection(-20, 0, 500, W)).toBe(0);
  });
});
