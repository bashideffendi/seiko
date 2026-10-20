"use client";

import { Suspense, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Crosshair, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  bboxStyle,
  pageImageUrl,
  pageThumbUrl,
  parsePageParam,
  readerHref,
  type BBox,
  type ScanSet,
} from "@/lib/scans";
import { IDENTITY, MAX_ZOOM, focusBox, panBy, swipeDirection, zoomAt, type View } from "@/lib/zoom";

/** One watch photo on a page, linked to its model page. */
export interface ReaderSpot {
  page: number;
  bbox: BBox;
  ref: string;
  slug: string | null;
  /** One-line description, e.g. "SSWR · 17 jewels · blue dial". */
  sub?: string;
  section?: string;
}

type Gesture =
  | { kind: "one"; x0: number; y0: number; t0: number; v0: View }
  | { kind: "pinch"; d0: number; v0: View };

const ZOOM_STEP = 1.6;
const TAP_ZOOM = 2.5;

const isNumberLabel = (label: string) => /^\d+$/.test(label);
const optionLabel = (label: string) => (isNumberLabel(label) ? `Page ${label}` : label);

type ReaderProps = { set: ScanSet; spots: ReaderSpot[]; title: string };

function countPerPage(spots: ReaderSpot[]) {
  const m = new Map<number, number>();
  for (const s of spots) m.set(s.page, (m.get(s.page) ?? 0) + 1);
  return m;
}

/**
 * Page-by-page reader for a digitised catalogue. Only the current page's large image is
 * loaded (its neighbours are prefetched once it lands); thumbnails load lazily.
 * Opens at ?page= (highlighting ?watch=) and keeps the URL in step as you read.
 * The page is static, so the reader itself renders on the client (Suspense fallback =
 * a plain list of page links).
 */
export function CatalogueReader(props: ReaderProps) {
  return (
    <Suspense fallback={<ReaderFallback set={props.set} spots={props.spots} />}>
      <ReaderFromUrl {...props} />
    </Suspense>
  );
}

function ReaderFromUrl(props: ReaderProps) {
  const q = useSearchParams();
  // Read once: from then on the reader owns page/watch and writes them back to the URL.
  const [initial] = useState(() => ({ page: parsePageParam(props.set, q.get("page")), watch: q.get("watch") }));
  return <Reader {...props} initialPage={initial.page} initialWatch={initial.watch} />;
}

function ReaderFallback({ set, spots }: { set: ScanSet; spots: ReaderSpot[] }) {
  const pg = set.pages[0];
  return (
    <div>
      <div className="h-[61px] border-b border-[var(--line)]" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
        <div
          className="mx-auto w-full border border-[var(--line)] bg-[var(--stone)]"
          style={{ aspectRatio: `${pg.w} / ${pg.h}`, maxWidth: `max(320px, calc((100svh - 200px) * ${(pg.w / pg.h).toFixed(4)}))` }}
        />
      </div>
      <PageGrid set={set} perPage={countPerPage(spots)} current={null} />
    </div>
  );
}

function Reader({ set, spots, title, initialPage, initialWatch }: ReaderProps & { initialPage: number; initialWatch: string | null }) {
  const [page, setPage] = useState(initialPage);
  const [watch, setWatch] = useState<string | null>(initialWatch);

  const [view, setView] = useState<View>(IDENTITY);
  const [gesturing, setGesturing] = useState(false);
  const [loaded, setLoaded] = useState<number | null>(null);
  const [outlines, setOutlines] = useState(true);
  const [hover, setHover] = useState<string | null>(null);

  const topRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<Gesture | null>(null);
  const moved = useRef(false);

  const idx = Math.max(0, set.pages.findIndex((p) => p.n === page));
  const pg = set.pages[idx];
  const prev = idx > 0 ? set.pages[idx - 1].n : null;
  const next = idx < set.pages.length - 1 ? set.pages[idx + 1].n : null;
  const onPage = useMemo(() => spots.filter((s) => s.page === page), [spots, page]);
  const perPage = useMemo(() => countPerPage(spots), [spots]);
  const selected = watch ? onPage.find((s) => s.slug === watch) ?? null : null;
  const section = onPage.find((s) => s.section)?.section;
  const pageName = isNumberLabel(pg.label) ? `Page ${pg.label}` : pg.label;

  function go(n: number | null, opts: { scroll?: boolean; watch?: string | null } = {}) {
    if (n === null || !set.pages.some((p) => p.n === n)) return;
    const w = opts.watch ?? null;
    setPage(n);
    setWatch(w);
    setView(IDENTITY);
    setHover(null);
    // Next.js syncs native history calls with its router (no server round trip).
    window.history.replaceState(null, "", readerHref(set.id, n, w));
    if (opts.scroll) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      topRef.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    }
  }

  function stageSize() {
    const r = stageRef.current?.getBoundingClientRect();
    return r ? { w: r.width, h: r.height, left: r.left, top: r.top } : null;
  }

  function zoomBy(factor: number) {
    const r = stageSize();
    if (!r) return;
    setView((v) => zoomAt(v, v.s * factor, r.w / 2, r.h / 2, r.w, r.h));
  }

  function focusSelected() {
    const r = stageSize();
    if (r && selected) setView(focusBox(selected.bbox, 2.2, r.w, r.h));
  }

  function preload(n: number | null) {
    if (n === null) return;
    const img = new window.Image();
    img.decoding = "async";
    img.src = pageImageUrl(set, n);
  }

  // ---- pointer gestures: tap/click to zoom, drag to pan, pinch to zoom, swipe to turn
  function local(e: ReactPointerEvent | ReactMouseEvent) {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height };
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const p = local(e);
    pointers.current.set(e.pointerId, { x: p.x, y: p.y });
    const pts = [...pointers.current.values()];
    if (pts.length === 1) {
      moved.current = false;
      gesture.current = { kind: "one", x0: p.x, y0: p.y, t0: e.timeStamp, v0: view };
    } else if (pts.length === 2) {
      moved.current = true;
      gesture.current = { kind: "pinch", d0: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1, v0: view };
      setGesturing(true);
    }
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(e.pointerId)) return;
    const p = local(e);
    pointers.current.set(e.pointerId, { x: p.x, y: p.y });
    const g = gesture.current;
    if (!g) return;
    const pts = [...pointers.current.values()];
    if (g.kind === "pinch" && pts.length >= 2) {
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const mx = (pts[0].x + pts[1].x) / 2;
      const my = (pts[0].y + pts[1].y) / 2;
      setView(zoomAt(g.v0, (g.v0.s * d) / g.d0, mx, my, p.w, p.h));
      return;
    }
    if (g.kind === "one") {
      const dx = p.x - g.x0;
      const dy = p.y - g.y0;
      if (!moved.current && Math.hypot(dx, dy) > 6) {
        moved.current = true;
        if (g.v0.s > 1) {
          e.currentTarget.setPointerCapture(e.pointerId);
          setGesturing(true);
        }
      }
      if (moved.current && g.v0.s > 1) setView(panBy(g.v0, dx, dy, p.w, p.h));
    }
  }

  function endPointer(e: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) {
    const last = pointers.current.get(e.pointerId);
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (g && g.kind === "one" && g.v0.s === 1 && moved.current && last && !cancelled) {
      const dir = swipeDirection(last.x - g.x0, last.y - g.y0, e.timeStamp - g.t0, e.currentTarget.clientWidth);
      if (dir === -1) go(next);
      if (dir === 1) go(prev);
    }
    const rest = [...pointers.current.values()];
    if (rest.length === 1) {
      // pinch → one finger: continue as a pan from here
      gesture.current = { kind: "one", x0: rest[0].x, y0: rest[0].y, t0: e.timeStamp, v0: view };
    } else if (rest.length === 0) {
      gesture.current = null;
      setGesturing(false);
    }
  }

  function onClickCapture(e: ReactMouseEvent<HTMLDivElement>) {
    // a drag or pinch is not a click: don't zoom, don't follow a watch link
    if (moved.current) {
      e.preventDefault();
      e.stopPropagation();
      moved.current = false;
    }
  }

  function onStageClick(e: ReactMouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("a")) return;
    const p = local(e);
    setView(view.s > 1 ? IDENTITY : zoomAt(view, TAP_ZOOM, p.x, p.y, p.w, p.h));
  }

  // ---- keyboard: ← → / PageUp PageDown turn pages (arrows pan a zoomed page),
  //      + − zoom, 0 / Esc back to the whole page
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target as HTMLElement | null;
    if (t?.closest("input, textarea, select, [contenteditable='true']")) return;
    const PAN: Record<string, [number, number]> = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
    if (view.s > 1 && PAN[e.key]) {
      const r = stageSize();
      if (!r) return;
      e.preventDefault();
      const [dx, dy] = PAN[e.key];
      setView((v) => panBy(v, dx * r.w * 0.15, dy * r.h * 0.15, r.w, r.h));
    } else if (e.key === "ArrowRight" || e.key === "PageDown") {
      e.preventDefault();
      go(next);
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      go(prev);
    } else if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      zoomBy(ZOOM_STEP);
    } else if (e.key === "-" || e.key === "_") {
      e.preventDefault();
      zoomBy(1 / ZOOM_STEP);
    } else if ((e.key === "0" || e.key === "Escape") && view.s > 1) {
      e.preventDefault();
      setView(IDENTITY);
    }
  });

  // ctrl/⌘ + wheel (and trackpad pinch, which arrives as ctrl+wheel) zooms at the cursor
  const onWheel = useEffectEvent((e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const r = stageSize();
    if (!r) return;
    const f = Math.exp(-e.deltaY * 0.01);
    setView((v) => zoomAt(v, v.s * f, e.clientX - r.left, e.clientY - r.top, r.w, r.h));
  });

  const onResize = useEffectEvent(() => setView(IDENTITY));

  useEffect(() => {
    const key = (e: KeyboardEvent) => onKey(e);
    const resize = () => onResize();
    const el = stageRef.current;
    const wheel = (e: WheelEvent) => onWheel(e);
    window.addEventListener("keydown", key);
    window.addEventListener("resize", resize);
    el?.addEventListener("wheel", wheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", resize);
      el?.removeEventListener("wheel", wheel);
    };
  }, []);

  const ratio = pg.w / pg.h;
  const zoomed = view.s > 1;

  return (
    <div ref={topRef} className="scroll-mt-[72px] min-[1180px]:scroll-mt-[104px]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-[var(--line)] pb-4">
        <div className="flex items-center gap-2">
          <IconButton label="Previous page" onClick={() => go(prev)} disabled={prev === null}>
            <ChevronLeft size={18} strokeWidth={1.5} aria-hidden="true" />
          </IconButton>
          <label htmlFor="reader-page" className="sr-only">Go to page</label>
          <select
            id="reader-page"
            value={page}
            onChange={(e) => go(Number(e.target.value))}
            className="field h-11 w-auto cursor-pointer px-3 pr-8 text-[14px]"
          >
            {set.pages.map((p) => (
              <option key={p.n} value={p.n}>
                {optionLabel(p.label)}
                {perPage.get(p.n) ? ` · ${perPage.get(p.n)} watches` : ""}
              </option>
            ))}
          </select>
          <IconButton label="Next page" onClick={() => go(next)} disabled={next === null}>
            <ChevronRight size={18} strokeWidth={1.5} aria-hidden="true" />
          </IconButton>
          <span className="ml-1 hidden text-[12px] uppercase tracking-[0.14em] text-[var(--ink-soft)] sm:inline">
            {idx + 1} / {set.pages.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <IconButton label="Zoom out" onClick={() => zoomBy(1 / ZOOM_STEP)} disabled={!zoomed}>
            <ZoomOut size={18} strokeWidth={1.5} aria-hidden="true" />
          </IconButton>
          <button
            type="button"
            onClick={() => setView(IDENTITY)}
            disabled={!zoomed}
            className="h-11 min-w-[3.5rem] px-1 text-center font-mono text-[12px] text-[var(--ink)] disabled:text-[var(--ink-soft)]"
            aria-label={zoomed ? `Zoom ${Math.round(view.s * 100)}%, reset to fit` : "Zoom 100%"}
          >
            {Math.round(view.s * 100)}%
          </button>
          <IconButton label="Zoom in" onClick={() => zoomBy(ZOOM_STEP)} disabled={view.s >= MAX_ZOOM}>
            <ZoomIn size={18} strokeWidth={1.5} aria-hidden="true" />
          </IconButton>
          <button
            type="button"
            aria-pressed={outlines}
            onClick={() => setOutlines((o) => !o)}
            className={cn(
              "ml-1.5 h-11 border px-3 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors",
              outlines
                ? "border-[var(--maroon)] text-[var(--maroon)] hover:bg-[var(--maroon)] hover:text-[var(--ivory)]"
                : "border-[var(--line-2)] text-[var(--ink)] hover:border-[var(--maroon)] hover:text-[var(--maroon)]",
            )}
          >
            Outlines
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {pageName} of {set.pages.length}
        {onPage.length ? `, ${onPage.length} watches pictured` : ""}
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
        {/* Stage */}
        <figure className="min-w-0">
          <div
            ref={stageRef}
            className={cn(
              "relative mx-auto w-full select-none overflow-hidden border border-[var(--line)] bg-[var(--stone)]",
              zoomed ? (gesturing ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in",
            )}
            style={{
              aspectRatio: `${pg.w} / ${pg.h}`,
              maxWidth: `max(320px, calc((100svh - 200px) * ${ratio.toFixed(4)}))`,
              touchAction: zoomed ? "none" : "pan-y",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(e) => endPointer(e, false)}
            onPointerCancel={(e) => endPointer(e, true)}
            onClickCapture={onClickCapture}
            onClick={onStageClick}
          >
            <div
              className={cn("absolute inset-0 origin-top-left", !gesturing && "transition-transform duration-200 ease-out motion-reduce:transition-none")}
              style={{
                transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})`,
                backgroundImage: `url(${pageThumbUrl(set, page)})`,
                backgroundSize: "100% 100%",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={page}
                src={pageImageUrl(set, page)}
                alt={`${title} — ${pageName.toLowerCase()}${section ? `, ${section.toLowerCase()}` : ""}`}
                width={pg.w}
                height={pg.h}
                draggable={false}
                decoding="async"
                fetchPriority="high"
                onLoad={() => {
                  setLoaded(page);
                  preload(next);
                  preload(prev);
                }}
                className={cn(
                  "absolute inset-0 h-full w-full transition-opacity duration-300 motion-reduce:transition-none",
                  loaded === page ? "opacity-100" : "opacity-0",
                )}
              />

              {onPage.map((s) => {
                const isSel = selected === s;
                const isHot = hover === s.ref;
                const showBox = outlines || isSel || isHot;
                const box = (
                  <>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-0 transition-[border-color,background-color] duration-150",
                        isSel
                          ? "border-2 border-[var(--maroon)] shadow-[0_0_0_9999px_rgba(30,23,20,.22)]"
                          : isHot
                            ? "border-2 border-[var(--maroon)] bg-[rgba(73,11,24,.06)]"
                            : showBox
                              ? "border border-dashed border-[rgba(73,11,24,.45)] group-hover:border-2 group-hover:border-solid group-hover:border-[var(--maroon)] group-hover:bg-[rgba(73,11,24,.06)] group-focus-visible:border-2 group-focus-visible:border-solid group-focus-visible:border-[var(--maroon)]"
                              : "group-hover:border-2 group-hover:border-[var(--maroon)] group-focus-visible:border-2 group-focus-visible:border-[var(--maroon)]",
                      )}
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none absolute left-0 top-0 -translate-y-full whitespace-nowrap bg-[var(--maroon)] px-1.5 py-0.5 font-mono text-[10px] leading-4 text-[var(--ivory)] sm:text-[11px]",
                        isSel || isHot ? "block" : "hidden group-hover:block group-focus-visible:block",
                      )}
                    >
                      {s.ref}
                    </span>
                  </>
                );
                return s.slug ? (
                  <Link
                    key={s.ref}
                    href={`/catalogue/model/${s.slug}`}
                    aria-label={`Seiko ${s.ref}${s.sub ? ` — ${s.sub}` : ""}: open model page`}
                    className="group absolute block outline-none"
                    style={bboxStyle(s.bbox)}
                    onMouseEnter={() => setHover(s.ref)}
                    onMouseLeave={() => setHover(null)}
                    draggable={false}
                  >
                    {box}
                  </Link>
                ) : (
                  <span key={s.ref} className="group absolute block" style={bboxStyle(s.bbox)}>
                    {box}
                  </span>
                );
              })}
            </div>

            {loaded !== page && (
              <span className="pointer-events-none absolute bottom-3 left-3 bg-[rgba(250,247,242,.92)] px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">
                Loading page…
              </span>
            )}
          </div>
          <figcaption className="mx-auto mt-3 flex max-w-full flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[13px] text-[var(--ink-soft)]">
            <span>
              {pageName}
              {section ? <span className="capitalize"> · {section.toLowerCase()}</span> : null}
            </span>
            <span className="pointer-coarse:hidden">Click to zoom · drag to pan · ← → turn pages · + − zoom</span>
            <span className="hidden pointer-coarse:inline">Tap to zoom · pinch · swipe to turn pages</span>
          </figcaption>
        </figure>

        {/* On this page */}
        <aside className="min-w-0">
          <div className="lg:sticky lg:top-[120px]">
            {selected && (
              <div className="mb-6 border border-[var(--maroon)] bg-[var(--surface)] p-4">
                <p className="label !text-[var(--maroon)]">Highlighted</p>
                <p className="mt-1 font-mono text-[18px] text-[var(--ink)]">{selected.ref}</p>
                {selected.sub && <p className="mt-0.5 text-[13px] text-[var(--ink-muted)]">{selected.sub}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={focusSelected}
                    className="inline-flex h-10 items-center gap-2 border border-[var(--maroon)] px-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--maroon)] transition-colors hover:bg-[var(--maroon)] hover:text-[var(--ivory)]"
                  >
                    <Crosshair size={14} strokeWidth={1.5} aria-hidden="true" /> Zoom to Watch
                  </button>
                  {selected.slug && (
                    <Link
                      href={`/catalogue/model/${selected.slug}`}
                      className="inline-flex h-10 items-center border border-transparent px-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--maroon)] underline decoration-[var(--line-2)] underline-offset-4 hover:decoration-[var(--maroon)]"
                    >
                      Model Page
                    </Link>
                  )}
                </div>
              </div>
            )}

            <p className="label">{onPage.length ? `Pictured on this page · ${onPage.length}` : "Pictured on this page"}</p>
            {onPage.length ? (
              <ol className="mt-3 divide-y divide-[var(--line)] border border-[var(--line)] bg-[var(--surface)]">
                {onPage.map((s) => {
                  const inner = (
                    <>
                      <span className="min-w-0">
                        <span className="block font-mono text-[14px] text-[var(--ink)] group-hover:text-[var(--maroon)]">{s.ref}</span>
                        {s.sub && <span className="block truncate text-[12px] text-[var(--ink-soft)]">{s.sub}</span>}
                      </span>
                      <span aria-hidden="true" className="text-[var(--ink-soft)] group-hover:text-[var(--maroon)]">→</span>
                    </>
                  );
                  return (
                    <li key={s.ref}>
                      {s.slug ? (
                        <Link
                          href={`/catalogue/model/${s.slug}`}
                          onMouseEnter={() => setHover(s.ref)}
                          onMouseLeave={() => setHover(null)}
                          onFocus={() => setHover(s.ref)}
                          onBlur={() => setHover(null)}
                          className={cn(
                            "group flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--sand)]",
                            selected === s && "bg-[var(--sand)]",
                          )}
                        >
                          {inner}
                        </Link>
                      ) : (
                        <span className="group flex items-center justify-between gap-3 px-4 py-2.5">{inner}</span>
                      )}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink-muted)]">
                No watches are pictured on this page.
              </p>
            )}
          </div>
        </aside>
      </div>

      <PageGrid set={set} perPage={perPage} current={page} onSelect={(n) => go(n, { scroll: true })} />
    </div>
  );
}

/** Every page as a thumbnail link — wraps, never scrolls sideways. */
function PageGrid({
  set,
  perPage,
  current,
  onSelect,
}: {
  set: ScanSet;
  perPage: Map<number, number>;
  current: number | null;
  onSelect?: (n: number) => void;
}) {
  return (
    <nav aria-label="All pages" className="mt-12 border-t border-[var(--line)] pt-8">
      <p className="label">All pages</p>
      <ol className="mt-4 grid grid-cols-5 gap-x-2 gap-y-4 min-[420px]:grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-15">
        {set.pages.map((p) => {
          const isCurrent = p.n === current;
          const n = perPage.get(p.n) ?? 0;
          return (
            <li key={p.n}>
              <a
                href={readerHref(set.id, p.n)}
                onClick={
                  onSelect
                    ? (e) => {
                        e.preventDefault();
                        onSelect(p.n);
                      }
                    : undefined
                }
                aria-current={isCurrent ? "page" : undefined}
                aria-label={`${optionLabel(p.label)}${n ? `, ${n} watches` : ""}`}
                className="group block"
              >
                <span
                  className={cn(
                    "block overflow-hidden border bg-[var(--stone)] transition-colors",
                    isCurrent ? "border-2 border-[var(--maroon)]" : "border-[var(--line)] group-hover:border-[var(--maroon)]",
                  )}
                  style={{ aspectRatio: `${p.w} / ${p.h}` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pageThumbUrl(set, p.n)}
                    alt=""
                    width={set.thumbWidth}
                    height={Math.round((set.thumbWidth * p.h) / p.w)}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </span>
                <span
                  className={cn(
                    "mt-1 flex items-center justify-between gap-1 text-[10px] uppercase tracking-[0.1em]",
                    isCurrent ? "text-[var(--maroon)]" : "text-[var(--ink-soft)] group-hover:text-[var(--maroon)]",
                  )}
                >
                  <span className="truncate">{isNumberLabel(p.label) ? p.label : p.label.replace(" cover", "")}</span>
                  {n > 0 && <span className="font-mono normal-case tracking-normal">{n}</span>}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-11 w-11 place-items-center border border-[var(--line-2)] bg-[var(--surface)] text-[var(--ink)] transition-colors hover:border-[var(--maroon)] hover:text-[var(--maroon)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--line-2)] disabled:hover:text-[var(--ink)]"
    >
      {children}
    </button>
  );
}
