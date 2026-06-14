"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, Cog } from "lucide-react";
import { ALL_MODEL_ENTRIES, type ModelEntry } from "@/lib/modelIndex";
import { cn } from "@/lib/cn";

const CAP = 150;

function decadeOf(year: number) {
  return `${Math.floor(year / 10) * 10}s`;
}

const DECADES = Array.from(
  new Set(ALL_MODEL_ENTRIES.flatMap((e) => e.years.map(decadeOf))),
).sort();

export function ModelBrowser() {
  const [q, setQ] = useState("");
  const [decade, setDecade] = useState("all");
  const [withCaliber, setWithCaliber] = useState(false);

  const matches = useMemo(() => {
    const key = q.trim().toUpperCase();
    return ALL_MODEL_ENTRIES.filter((e) => {
      if (withCaliber && !e.caliber) return false;
      if (decade !== "all" && !e.years.some((y) => decadeOf(y) === decade)) return false;
      if (!key) return true;
      const hay = [
        e.ref,
        e.caliber ?? "",
        e.sections.join(" "),
        e.dial ?? "",
        e.case ?? "",
        e.specs ?? "",
        e.notes ?? "",
      ]
        .join(" ")
        .toUpperCase();
      return hay.includes(key);
    });
  }, [q, decade, withCaliber]);

  const shown = matches.slice(0, CAP);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative w-full lg:max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ref (6309-7040), caliber, dial…"
            spellCheck={false}
            className="w-full rounded-[var(--radius)] border border-[var(--border-strong)] bg-[var(--surface)] py-2.5 pl-9 pr-3 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--burgundy-500)]"
          />
        </label>
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip active={decade === "all"} onClick={() => setDecade("all")}>All</Chip>
          {DECADES.map((d) => (
            <Chip key={d} active={decade === d} onClick={() => setDecade(d)}>{d}</Chip>
          ))}
          <button
            type="button"
            onClick={() => setWithCaliber((v) => !v)}
            className={cn(
              "ml-1 inline-flex items-center gap-1 rounded-full border px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.1em] transition-colors",
              withCaliber
                ? "border-[var(--gold-500)] bg-[var(--gold-100)] text-[var(--gold-700)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--gold-500)]",
            )}
          >
            <Cog size={11} /> has caliber
          </button>
        </div>
      </div>

      <p className="mt-4 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
        {matches.length.toLocaleString()} of {ALL_MODEL_ENTRIES.length.toLocaleString()} models
        {matches.length > CAP && ` · showing first ${CAP} — refine to narrow`}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((e) => (
          <ModelCard key={e.slug} e={e} />
        ))}
      </div>

      {matches.length === 0 && (
        <p className="py-16 text-center text-[var(--ink-soft)]">
          No models match “{q}”. Try a reference, a caliber, or a dial colour.
        </p>
      )}
    </div>
  );
}

function ModelCard({ e }: { e: ModelEntry }) {
  const sub = [e.caliber ? `cal. ${e.caliber}` : null, e.dial, e.case]
    .filter(Boolean)
    .slice(0, 2)
    .join(" · ");
  return (
    <Link
      href={`/catalogue/model/${e.slug}`}
      className="group flex flex-col rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--gold-400)] hover:bg-[var(--surface-2)]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[0.95rem] font-medium text-[var(--burgundy-800)]">{e.ref}</span>
        <span
          title={`${e.conf} confidence`}
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            e.conf === "high" ? "bg-[var(--gold-500)]" : e.conf === "medium" ? "bg-[var(--ink-soft)]" : "bg-[var(--border-strong)]",
          )}
        />
      </div>
      <span className="mt-1 line-clamp-1 text-[0.78rem] text-[var(--ink-muted)]">{sub || e.sections[0]?.toLowerCase() || "—"}</span>
      <span className="mt-3 inline-flex items-center gap-1 text-[0.72rem] font-medium text-[var(--burgundy-700)] opacity-0 transition-opacity group-hover:opacity-100">
        View <ArrowRight size={12} />
      </span>
    </Link>
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
