"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { ArchiveItem } from "@/lib/archive";
import { Badge, ButtonLink } from "@/components/ui";
import { cn } from "@/lib/cn";

const LANG_LABEL: Record<ArchiveItem["lang"], string> = { jp: "Japanese", en: "English", scan: "Scan" };

function decadeOf(year: number): string {
  if (!year) return "Undated";
  return `${Math.floor(year / 10) * 10}s`;
}

export function CatalogueArchive({ items }: { items: ArchiveItem[] }) {
  const [q, setQ] = useState("");
  const [decade, setDecade] = useState<string>("all");
  const [active, setActive] = useState<ArchiveItem | null>(null);

  const decades = useMemo(() => Array.from(new Set(items.map((c) => decadeOf(c.year)))).sort(), [items]);

  const filtered = useMemo(() => {
    const query = q.trim().toUpperCase();
    return items.filter((c) => {
      if (decade !== "all" && decadeOf(c.year) !== decade) return false;
      return !query || c.search.includes(query);
    });
  }, [items, q, decade]);

  const groups = useMemo(() => {
    const m = new Map<string, ArchiveItem[]>();
    for (const c of filtered) {
      const d = decadeOf(c.year);
      (m.get(d) ?? m.set(d, []).get(d)!).push(c);
    }
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="block w-full lg:max-w-sm">
          <span className="sr-only">Search the archive</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a year, reference (SLA037) or caliber"
            spellCheck={false}
            className="field h-12 px-4 text-[15px]"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by decade">
          <Chip active={decade === "all"} onClick={() => setDecade("all")}>All</Chip>
          {decades.map((d) => (
            <Chip key={d} active={decade === d} onClick={() => setDecade(d)}>{d}</Chip>
          ))}
        </div>
      </div>

      <p className="mt-5 text-[12px] uppercase tracking-[0.14em] text-[var(--ink-soft)]" aria-live="polite">
        {filtered.length} of {items.length} catalogues
      </p>

      <div className="mt-8 space-y-14">
        {groups.map(([d, list]) => (
          <section key={d}>
            <div className="mb-5 flex items-center gap-4">
              <h2 className="font-serif text-[30px] leading-9 text-[var(--ink)]">{d}</h2>
              <span className="h-px flex-1 bg-[var(--line)]" />
              <span className="text-[12px] text-[var(--ink-soft)]">{list.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-6">
              {list.map((c) => (
                <div key={c.id}>
                  <button type="button" onClick={() => setActive(c)} className="group block w-full text-left" aria-haspopup="dialog">
                    <span className="block overflow-hidden border border-[var(--line)] bg-[var(--stone)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.cover}
                        alt={`${c.yearLabel} ${c.title} cover`}
                        width={480}
                        height={640}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[3/4] w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                    </span>
                    <span className="mt-3 block text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--muted)]">{c.yearLabel}</span>
                    <span className="mt-1 line-clamp-2 block font-serif text-[16px] leading-[21px] text-[var(--ink)] group-hover:text-[var(--maroon)]">{c.title}</span>
                    {c.photoCount > 0 ? (
                      <span className="mt-1 block text-[12px] text-[var(--maroon)]">{c.photoCount} watch photos</span>
                    ) : c.modelCount > 0 ? (
                      <span className="mt-1 block text-[12px] text-[var(--maroon)]">{c.modelCount} models read</span>
                    ) : null}
                  </button>
                  {c.readerHref && (
                    <Link
                      href={c.readerHref}
                      className="mt-2.5 inline-flex h-9 items-center border border-[var(--maroon)] px-3 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--maroon)] transition-colors hover:bg-[var(--maroon)] hover:text-[var(--ivory)]"
                    >
                      Read Catalogue
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        {filtered.length === 0 && (
          <p className="py-16 text-center text-[15px] text-[var(--ink-soft)]">
            No catalogues match “{q}”. Try a year, a model reference, or a caliber.
          </p>
        )}
      </div>

      {active && <DetailModal item={active} onClose={() => setActive(null)} />}
    </div>
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

function DetailModal({ item, onClose }: { item: ArchiveItem; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      prev?.focus();
    };
  }, [onClose]);

  const extraRefs = item.refCount - item.refs.length;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[rgba(30,23,20,.5)] sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-dialog-title"
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto border border-[var(--line)] bg-[var(--ivory)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] p-5 sm:p-6">
          <div>
            <p className="label">{item.yearLabel} · {item.pages} pages</p>
            <h2 id="archive-dialog-title" className="mt-1.5 font-serif text-[28px] leading-9 text-[var(--ink)]">{item.title}</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-11 w-11 shrink-0 place-items-center text-[var(--ink)] hover:text-[var(--maroon)]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-[200px_1fr] sm:p-6">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.cover} alt={`${item.title} cover`} width={480} height={640} className="w-full border border-[var(--line)]" />
            {item.readerHref && (
              <ButtonLink href={item.readerHref} size="sm" className="mt-4 w-full">
                Read Catalogue
              </ButtonLink>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.lang !== "scan" && <Badge>{LANG_LABEL[item.lang]}</Badge>}
              <Badge variant={item.hasText ? "gold" : "default"}>{item.hasText ? "Text-searchable" : "Scan only"}</Badge>
            </div>
          </div>

          <div className="min-w-0">
            {item.excerpt && <p className="line-clamp-4 text-[14px] leading-relaxed text-[var(--ink-muted)]">{item.excerpt}…</p>}

            {item.modelCount > 0 ? (
              <div className={item.excerpt ? "mt-5" : ""}>
                <div className="flex items-center justify-between">
                  <p className="label">Models read from this catalogue</p>
                  <Badge variant="gold">{item.modelCount}</Badge>
                </div>
                <ul className="mt-3 divide-y divide-[var(--line)] border-y border-[var(--line)]">
                  {item.models.map((m, i) => (
                    <li key={m.ref + i} className="flex items-baseline gap-3 py-2">
                      {m.slug ? (
                        <Link href={`/catalogue/model/${m.slug}`} className="w-[6.5rem] shrink-0 font-mono text-[13px] text-[var(--maroon)] underline decoration-[var(--line-2)] underline-offset-4 hover:decoration-[var(--maroon)]">
                          {m.ref}
                        </Link>
                      ) : (
                        <span className="w-[6.5rem] shrink-0 font-mono text-[13px] text-[var(--ink)]">{m.ref}</span>
                      )}
                      <span className="flex-1 truncate text-[13px] text-[var(--ink-muted)]">{m.sub ?? ""}</span>
                    </li>
                  ))}
                </ul>
                {item.modelCount > item.models.length && (
                  <p className="mt-4 text-[14px]">
                    <Link
                      href={`/catalogue/models?catalog=${encodeURIComponent(item.id)}`}
                      className="border-b border-[var(--maroon)] pb-0.5 text-[var(--maroon)] hover:text-[var(--maroon-deep)]"
                    >
                      See all {item.modelCount} models from this catalogue
                    </Link>
                  </p>
                )}
              </div>
            ) : (
              <>
                {item.calibers.length > 0 && (
                  <div className={item.excerpt ? "mt-5" : ""}>
                    <p className="label">Calibers featured</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.calibers.map((cal) =>
                        cal.slug ? (
                          <Link key={cal.code} href={`/caliber/${cal.slug}`} className="border border-[var(--line-2)] bg-[var(--surface)] px-2.5 py-1 font-mono text-[13px] text-[var(--text)] hover:border-[var(--maroon)] hover:text-[var(--maroon)]">
                            {cal.code}
                          </Link>
                        ) : (
                          <span key={cal.code} className="border border-[var(--line)] px-2.5 py-1 font-mono text-[13px] text-[var(--ink-muted)]">{cal.code}</span>
                        ),
                      )}
                    </div>
                  </div>
                )}
                {item.refs.length > 0 && (
                  <div className="mt-5">
                    <p className="label">Model references</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.refs.map((r) => (
                        <span key={r} className="border border-[var(--line)] bg-[var(--surface)] px-2 py-0.5 font-mono text-[12px] text-[var(--ink-muted)]">{r}</span>
                      ))}
                      {extraRefs > 0 && <span className="px-1 py-0.5 font-mono text-[12px] text-[var(--ink-soft)]">+{extraRefs} more</span>}
                    </div>
                  </div>
                )}
              </>
            )}

            <p className="mt-6 border-l-2 border-[var(--line-2)] pl-4 text-[13px] leading-relaxed text-[var(--ink-muted)]">
              {item.readerHref
                ? `All ${item.pages} pages are online to read. ${item.photoCount} watches were cut from the scan as their own photos, each linked to its model page.`
                : item.modelCount > 0
                  ? `${item.modelCount} models were read from the original scan. The full ${item.pages}-page scan goes online once archive storage is set up.`
                  : `The full ${item.pages}-page scan goes online once archive storage is set up. For now: the cover, its details and the references found in it — straight from the original.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
