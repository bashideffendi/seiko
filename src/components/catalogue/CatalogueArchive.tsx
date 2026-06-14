"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, FileText, Layers, Cog } from "lucide-react";
import {
  CATALOGUES,
  LANG_LABEL,
  decadeOf,
  type CatalogueItem,
} from "@/lib/catalogue";
import { modelsFor, modelCount, modelSearchBlob, modelsBySection } from "@/lib/models";
import { slugForRef } from "@/lib/modelIndex";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";

const DECADES = Array.from(new Set(CATALOGUES.map((c) => decadeOf(c.year)))).sort();

export function CatalogueArchive() {
  const [q, setQ] = useState("");
  const [decade, setDecade] = useState<string>("all");
  const [active, setActive] = useState<CatalogueItem | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toUpperCase();
    return CATALOGUES.filter((c) => {
      if (decade !== "all" && decadeOf(c.year) !== decade) return false;
      if (!query) return true;
      // search title/year/text AND any extracted model refs for this catalogue
      const hay = [
        c.title,
        c.yearLabel,
        c.snippet,
        c.caseRefs.join(" "),
        c.calibers.join(" "),
        modelSearchBlob(c.id),
      ]
        .join(" ")
        .toUpperCase();
      return hay.includes(query);
    });
  }, [q, decade]);

  const groups = useMemo(() => {
    const m = new Map<string, CatalogueItem[]>();
    for (const c of filtered) {
      const d = decadeOf(c.year);
      (m.get(d) ?? m.set(d, []).get(d)!).push(c);
    }
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <div>
      {/* controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative w-full lg:max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search year, model ref (SLA037), caliber…"
            spellCheck={false}
            className="w-full rounded-[var(--radius)] border border-[var(--border-strong)] bg-[var(--surface)] py-2.5 pl-9 pr-3 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--burgundy-500)]"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          <Chip active={decade === "all"} onClick={() => setDecade("all")}>All</Chip>
          {DECADES.map((d) => (
            <Chip key={d} active={decade === d} onClick={() => setDecade(d)}>{d}</Chip>
          ))}
        </div>
      </div>

      <p className="mt-4 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
        {filtered.length} of {CATALOGUES.length} catalogues
      </p>

      {/* grid grouped by decade */}
      <div className="mt-6 space-y-12">
        {groups.map(([d, items]) => (
          <section key={d}>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-serif text-2xl text-[var(--burgundy-800)]">{d}</h2>
              <span className="h-px flex-1 bg-[var(--border)]" />
              <span className="font-mono text-[0.7rem] text-[var(--ink-soft)]">{items.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {items.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActive(c)}
                  className="group text-left"
                >
                  <div className="crop overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)] shadow-[0_10px_30px_-22px_rgba(32,22,15,0.7)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.cover}
                      alt={`${c.yearLabel} ${c.title} cover`}
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="mt-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[0.78rem] font-medium text-[var(--burgundy-700)]">{c.yearLabel}</span>
                      {c.hasText && <FileText size={12} className="text-[var(--gold-700)]" />}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[0.82rem] leading-snug text-[var(--ink-muted)]">{c.title}</p>
                    {modelCount(c.id) > 0 && (
                      <span className="mt-1 inline-flex items-center gap-1 font-mono text-[0.64rem] text-[var(--gold-700)]">
                        <Cog size={10} /> {modelCount(c.id)} models
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}

        {filtered.length === 0 && (
          <p className="py-16 text-center text-[var(--ink-soft)]">
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
      className={cn(
        "rounded-full border px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.1em] transition-colors",
        active
          ? "border-[var(--burgundy-700)] bg-[var(--burgundy-700)] text-[var(--surface)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--gold-500)]",
      )}
    >
      {children}
    </button>
  );
}

function DetailModal({ item, onClose }: { item: CatalogueItem; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const refsShown = item.caseRefs.slice(0, 30);
  const extra = item.caseRefs.length - refsShown.length;
  const models = modelsFor(item.id);
  const grouped = models ? modelsBySection(models) : [];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[var(--burgundy-900)]/70 p-0 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface)] sm:rounded-[var(--radius-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-5">
          <div>
            <span className="label">{item.yearLabel} · {item.pages} pages</span>
            <h3 className="mt-1 font-serif text-2xl text-[var(--burgundy-800)]">{item.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius)] text-[var(--ink-muted)] hover:bg-[var(--burgundy-50)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-[200px_1fr]">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.cover}
              alt={`${item.title} cover`}
              className="w-full rounded-[var(--radius)] border border-[var(--border)]"
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge variant={item.hasText ? "gold" : "default"}>{LANG_LABEL[item.lang]}</Badge>
              {item.hasText ? <Badge variant="success">Text-searchable</Badge> : <Badge>Scan only</Badge>}
            </div>
          </div>

          <div className="min-w-0">
            {item.snippet && (
              <p className="text-sm leading-relaxed text-[var(--ink-muted)] line-clamp-3">{item.snippet}…</p>
            )}

            {models ? (
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <span className="label flex items-center gap-1.5"><Cog size={12} /> Models in this catalogue</span>
                  <Badge variant="gold">{models.length}</Badge>
                </div>
                <div className="mt-3 max-h-[44vh] overflow-y-auto pr-1">
                  {grouped.map((g) => (
                    <div key={g.section} className="mb-4 last:mb-0">
                      <div className="sticky top-0 z-10 flex items-center gap-2 bg-[var(--surface)] py-1">
                        <span className="label !text-[0.54rem]">{g.section}</span>
                        <span className="h-px flex-1 bg-[var(--border)]" />
                        <span className="font-mono text-[0.6rem] text-[var(--ink-soft)]">{g.items.length}</span>
                      </div>
                      {g.items.map((m, i) => {
                        const slug = slugForRef(m.ref);
                        return (
                        <div key={m.ref + i} className="flex items-baseline gap-2 border-b border-[var(--border)] py-1.5 last:border-0">
                          {slug ? (
                            <Link
                              href={`/catalogue/model/${slug}`}
                              className="w-[5rem] shrink-0 font-mono text-[0.76rem] font-medium text-[var(--burgundy-700)] underline decoration-[var(--gold-400)] decoration-dotted underline-offset-2 hover:decoration-solid"
                            >
                              {m.ref}
                            </Link>
                          ) : (
                            <span className="w-[5rem] shrink-0 font-mono text-[0.76rem] font-medium text-[var(--burgundy-800)]">{m.ref}</span>
                          )}
                          <span className="flex-1 truncate text-[0.74rem] text-[var(--ink-muted)]">
                            {[m.caliber ? `cal.${m.caliber}` : "", m.dial, m.case, m.specs, m.notes].filter(Boolean).join(" · ")}
                          </span>
                          {m.price ? <span className="shrink-0 font-mono text-[0.66rem] text-[var(--burgundy-600)]">{m.price}</span> : null}
                          {m.jewels ? <span className="shrink-0 font-mono text-[0.68rem] text-[var(--ink-soft)]">{m.jewels}j</span> : null}
                          <span
                            title={`${m.conf} confidence`}
                            className={cn(
                              "h-1.5 w-1.5 shrink-0 rounded-full",
                              m.conf === "high"
                                ? "bg-[var(--gold-500)]"
                                : m.conf === "medium"
                                  ? "bg-[var(--ink-soft)]"
                                  : "bg-[var(--border-strong)]",
                            )}
                          />
                        </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <p className="mt-2 flex items-center gap-3 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-[var(--ink-soft)]">
                  <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--gold-500)]" /> high</span>
                  <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--ink-soft)]" /> medium</span>
                  <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--border-strong)]" /> low</span>
                </p>
              </div>
            ) : (
              <>
                {item.calibers.length > 0 && (
                  <div className="mt-5">
                    <span className="label flex items-center gap-1.5"><Cog size={12} /> Calibers featured</span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.calibers.map((cal) => (
                        <Link
                          key={cal}
                          href="/tools/caliber-lookup"
                          className="rounded-full border border-[var(--gold-300)] bg-[var(--gold-100)] px-2.5 py-0.5 font-mono text-[0.72rem] text-[var(--gold-700)] hover:border-[var(--gold-500)]"
                        >
                          {cal}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {refsShown.length > 0 && (
                  <div className="mt-5">
                    <span className="label flex items-center gap-1.5"><Layers size={12} /> Model references</span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {refsShown.map((r) => (
                        <span key={r} className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 font-mono text-[0.72rem] text-[var(--ink-muted)]">
                          {r}
                        </span>
                      ))}
                      {extra > 0 && <span className="px-1 py-0.5 font-mono text-[0.72rem] text-[var(--ink-soft)]">+{extra} more</span>}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="mt-6 rounded-[var(--radius)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)]/60 p-4">
              <p className="text-[0.82rem] leading-relaxed text-[var(--ink-muted)]">
                {models
                  ? `${models.length} models catalogued from the original scan. The full ${item.pages}-page scan goes online once archive storage is set up.`
                  : `The full ${item.pages}-page scan goes online once archive storage is set up. For now, this is the cover, metadata and detected references — drawn straight from the original catalogue.`}
              </p>
              <p className="mt-2 font-mono text-[0.68rem] text-[var(--ink-soft)]">{item.file}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
