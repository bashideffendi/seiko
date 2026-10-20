// Pan/zoom maths for the catalogue reader, kept pure so it can be unit-tested.
// The zoomed layer is transformed with `translate(x, y) scale(s)` from a top-left origin,
// inside a viewport of size w × h that the layer fills exactly at s = 1.

export interface View {
  s: number;
  x: number;
  y: number;
}

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;
export const IDENTITY: View = { s: 1, x: 0, y: 0 };

export function clampZoom(s: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, s));
}

/** Keep the zoomed layer covering the viewport: no blank edges while panning. */
export function clampView(v: View, w: number, h: number): View {
  const s = clampZoom(v.s);
  if (s === 1) return IDENTITY;
  const x = Math.min(0, Math.max(w - w * s, v.x));
  const y = Math.min(0, Math.max(h - h * s, v.y));
  return { s, x, y };
}

/** Zoom to scale `s`, keeping viewport point (px, py) fixed under the finger/cursor. */
export function zoomAt(v: View, s: number, px: number, py: number, w: number, h: number): View {
  const next = clampZoom(s);
  // content point under (px, py) before the zoom
  const cx = (px - v.x) / v.s;
  const cy = (py - v.y) / v.s;
  return clampView({ s: next, x: px - cx * next, y: py - cy * next }, w, h);
}

/** Pan by a pointer delta. */
export function panBy(v: View, dx: number, dy: number, w: number, h: number): View {
  return clampView({ s: v.s, x: v.x + dx, y: v.y + dy }, w, h);
}

/** Centre a normalised box [x, y, bw, bh] in the viewport at scale `s` (to show one watch). */
export function focusBox(box: [number, number, number, number], s: number, w: number, h: number): View {
  const next = clampZoom(s);
  const cx = (box[0] + box[2] / 2) * w;
  const cy = (box[1] + box[3] / 2) * h;
  return clampView({ s: next, x: w / 2 - cx * next, y: h / 2 - cy * next }, w, h);
}

/** A horizontal swipe worth a page turn: -1 (next), 1 (previous) or 0. */
export function swipeDirection(dx: number, dy: number, dt: number, width: number): -1 | 0 | 1 {
  const far = Math.abs(dx) > Math.max(48, width * 0.15);
  const flick = Math.abs(dx) > 30 && dt < 300;
  if (Math.abs(dx) < Math.abs(dy) * 1.4 || !(far || flick)) return 0;
  return dx < 0 ? -1 : 1;
}
