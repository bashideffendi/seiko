"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { decadeOf, modelHaystack, type CompactModel } from "@/lib/modelCompact";

const CAP = 150;
const noopSubscribe = () => () => {};

type Filters = { q: string; decade: string; withCaliber: boolean; withPhoto: boolean; catalog: string };
const EMPTY: Filters = { q: "", decade: "all", withCaliber: false, withPhoto: false, catalog: "" };

/**
 * Server renders the first CAP models (props); the full compact index is fetched from
 * /api/models only when a filter is used — so the page ships no catalogue JSON up front.
 * Accepts ?q=, ?caliber= and ?catalog= so other pages can deep-link a filtered view.
 */
export function ModelBrowser({
  initial,
  total,
  decades,
  catalogs,
}: {
  initial: CompactModel[];
  total: number;
  decades: string[];
  catalogs: { id: string; label: string }[];
}) {
  const [f, setF] = useState<Filters>(EMPTY);
  const [all, setAll] = useState<CompactModel[] | null>(null);
  const [failed, setFailed] = useState(false);

  const filtering = f.q.trim() !== "" || f.decade !== "all" || f.withCaliber || f.withPhoto || f.catalog !== "";

  // Deep links (?q=, ?caliber=, ?catalog=): read the query string after hydration and fold it
  // into the filters once — React's "adjust state while rendering" pattern, no effect needed.
  const search = useSyncExternalStore(noopSubscribe, () => window.location.search, () => "");
  const [seenSearch, setSeenSearch] = useState("");
  if (search !== seenSearch) {
    setSeenSearch(search);
    const p = new URLSearchParams(search);
    const q = (p.get("q") ?? p.get("caliber") ?? "").slice(0, 40);
    const catalog = p.get("catalog") ?? "";
    if (q || catalog) setF((prev) => ({ ...prev, q, catalog }));
  }

  // Load the full index the first time it's needed.
  useEffect(() => {
    if (!filtering || all || failed) return;
    let cancelled = false;
    fetch("/api/models")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: CompactModel[]) => !cancelled && setAll(data))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [filtering, all, failed]);

  const matches = useMemo(() => {
    const source = all ?? initial;
    if (!filtering) return source;
    const key = f.q.trim().toUpperCase();
    return source.filter((m) => {
      if (f.withCaliber && !m.c) return false;
      if (f.withPhoto && !m.i) return false;
      if (f.catalog && !m.g.includes(f.catalog)) return false;
      if (f.decade !== "all" && !m.y.some((y) => decadeOf(y) === f.decade)) return false;
      return !key || modelHaystack(m).includes(key);
    });
  }, [all, initial, f, filtering]);

  const loading = filtering && !all && !failed;
  const shown = matches.slice(0, CAP);
  const count = filtering ? matches.length : total;
  const catalogLabel = catalogs.find((c) => c.id === f.catalog)?.label;

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="block w-full lg:max-w-sm">
          <span className="sr-only">Search models</span>
          <input
            type="search"
            value={f.q}
            onChange={(e) => setF({ ...f, q: e.target.value })}
            placeholder="Search a reference (6309-8120), caliber or dial"
            spellCheck={false}
            className="field h-12 px-4 text-[15px]"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by decade">
          <Chip active={f.decade === "all"} onClick={() => setF({ ...f, decade: "all" })}>All</Chip>
          {decades.map((d) => (
            <Chip key={d} active={f.decade === d} onClick={() => setF({ ...f, decade: d })}>{d}</Chip>
          ))}
          <Chip active={f.withCaliber} onClick={() => setF({ ...f, withCaliber: !f.withCaliber })}>Has caliber</Chip>
          <Chip active={f.withPhoto} onClick={() => setF({ ...f, withPhoto: !f.withPhoto })}>Has photo</Chip>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-[12px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
        <span aria-live="polite">
          {loading ? "Loading the full index…" : `${count.toLocaleString("en-US")} of ${total.toLocaleString("en-US")} models`}
          {!loading && count > CAP && ` · showing the first ${CAP} — refine to narrow`}
        </span>
        {catalogLabel && (
          <button
            type="button"
            onClick={() => setF({ ...f, catalog: "" })}
            className="border border-[var(--maroon)] px-2.5 py-1 text-[var(--maroon)] hover:bg-[var(--maroon)] hover:text-[var(--ivory)]"
          >
            {catalogLabel} ✕
          </button>
        )}
        {failed && <span className="normal-case tracking-normal text-[var(--danger)]">Couldn’t load the full index — showing the first page only.</span>}
      </div>

      <div className="mt-5 grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((m) => (
          <ModelCard key={m.s} m={m} />
        ))}
      </div>

      {!loading && matches.length === 0 && (
        <p className="py-16 text-center text-[15px] text-[var(--ink-soft)]">
          No models match “{f.q}”. Try a reference, a caliber, or a dial colour.
        </p>
      )}
    </div>
  );
}

function ModelCard({ m }: { m: CompactModel }) {
  const sub = [m.c ? `Cal. ${m.c}` : null, m.d].filter(Boolean).join(" · ") || m.x?.toLowerCase() || "—";
  return (
    <Link href={`/catalogue/model/${m.s}`} className="group flex items-center gap-4 bg-[var(--surface)] p-4 transition-colors hover:bg-[var(--sand)]">
      {m.i && (
        <span className="grid h-16 w-11 shrink-0 place-items-center overflow-hidden bg-[var(--ivory)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.i} alt="" loading="lazy" decoding="async" width={44} height={64} className="h-full w-full object-contain" />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center justify-between gap-2">
          <span className="font-mono text-[15px] text-[var(--ink)] group-hover:text-[var(--maroon)]">{m.r}</span>
          <span className="flex items-center gap-2 text-[12px] text-[var(--ink-soft)]">
            {m.y[0] ? decadeOf(m.y[0]) : null}
            <span
              title={`${m.k === "h" ? "high" : m.k === "m" ? "medium" : "low"} confidence`}
              className={cn("h-1.5 w-1.5 rounded-full", m.k === "h" ? "bg-[var(--maroon)]" : m.k === "m" ? "bg-[var(--gold-500)]" : "bg-[var(--line-2)]")}
            />
          </span>
        </span>
        <span className="mt-1 line-clamp-1 text-[13px] text-[var(--ink-muted)]">{sub}</span>
      </span>
    </Link>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-10 border px-4 text-[12px] font-medium uppercase tracking-[0.16em] transition-colors",
        active
          ? "border-[var(--maroon)] bg-[var(--maroon)] text-[var(--ivory)]"
          : "border-[var(--line-2)] bg-[var(--ivory)] text-[var(--ink)] hover:border-[var(--maroon)] hover:text-[var(--maroon)]",
      )}
    >
      {children}
    </button>
  );
}
