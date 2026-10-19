"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CaliberRecord, MovementType } from "@/lib/seiko/types";
import { canonicalCaliberKey, caliberSlug } from "@/lib/seiko/caliberKey";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";

const TYPES: { key: MovementType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "automatic", label: "Automatic" },
  { key: "manual", label: "Manual" },
  { key: "quartz", label: "Quartz" },
  { key: "digital-quartz", label: "Digital" },
  { key: "spring-drive", label: "Spring Drive" },
  { key: "solar", label: "Solar" },
  { key: "kinetic", label: "Kinetic" },
];

export type CaliberRow = Omit<CaliberRecord, "sources">;

function years(c: CaliberRow) {
  return `${c.startYear}–${c.endYear ?? "present"}${c.rangeConfidence === "approximate" ? " ~" : ""}`;
}

export function CaliberTable({ calibers, asOf }: { calibers: CaliberRow[]; asOf: number }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<MovementType | "all">("all");
  const [family, setFamily] = useState<string>("all");

  // Distinct families with at least two calibers — used for the family browse.
  const families = useMemo(
    () =>
      Array.from(
        calibers.reduce((m, c) => {
          if (c.family) m.set(c.family, (m.get(c.family) ?? 0) + 1);
          return m;
        }, new Map<string, number>()),
      )
        .filter(([, n]) => n >= 2)
        .map(([f]) => f)
        .sort(),
    [calibers],
  );

  const rows = useMemo(() => {
    const key = canonicalCaliberKey(q);
    return calibers
      .filter((c) => {
        if (type !== "all" && c.movementType !== type) return false;
        if (family !== "all" && c.family !== family) return false;
        if (!key) return true;
        const hay = [c.caliber, ...(c.aliases ?? []), c.family ?? "", c.notes ?? "", ...(c.notableRefs ?? [])]
          .join(" ")
          .toUpperCase();
        // key has spaces/dashes stripped, so strip the haystack too — otherwise a dashed
        // ref like "6309-7040" never matches its own key.
        return hay.replace(/[\s-]+/g, "").includes(key);
      })
      .sort((a, b) => a.startYear - b.startYear || a.caliber.localeCompare(b.caliber));
  }, [calibers, q, type, family]);

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="block w-full sm:max-w-sm">
            <span className="sr-only">Search calibers</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search a caliber, family or reference"
              spellCheck={false}
              className="field h-12 px-4 text-[15px]"
            />
          </label>
          <label className="block w-full sm:max-w-xs">
            <span className="sr-only">Filter by family</span>
            <select value={family} onChange={(e) => setFamily(e.target.value)} className="field h-12 px-3 text-[15px]">
              <option value="all">All families</option>
              {families.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by movement type">
          {TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setType(t.key)}
              aria-pressed={type === t.key}
              className={cn(
                "h-10 border px-4 text-[12px] font-medium uppercase tracking-[0.16em] transition-colors",
                type === t.key
                  ? "border-[var(--maroon)] bg-[var(--maroon)] text-[var(--ivory)]"
                  : "border-[var(--line-2)] bg-[var(--ivory)] text-[var(--ink)] hover:border-[var(--maroon)] hover:text-[var(--maroon)]",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-5 text-[12px] uppercase tracking-[0.14em] text-[var(--ink-soft)]" aria-live="polite">
        {rows.length} of {calibers.length} calibers · ranges are community-sourced approximations · as of {asOf}
      </p>

      {/* Phones: one card per caliber (no sideways-scrolling table). */}
      <ul className="mt-4 divide-y divide-[var(--line)] border border-[var(--line)] bg-[var(--surface)] md:hidden">
        {rows.map((c) => (
          <li key={c.caliber}>
            <Link href={`/caliber/${caliberSlug(c.caliber)}`} className="block px-4 py-4 hover:bg-[var(--sand)]">
              <span className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[17px] text-[var(--maroon)]">{c.caliber}</span>
                <span className="font-mono text-[13px] text-[var(--ink)]">{years(c)}</span>
              </span>
              <span className="mt-1 block text-[13px] capitalize text-[var(--ink-muted)]">
                {[c.movementType.replace("-", " "), c.jewels != null ? `${c.jewels} jewels` : null, c.family].filter(Boolean).join(" · ")}
              </span>
              {c.notes && <span className="mt-1.5 line-clamp-2 block text-[13px] leading-relaxed text-[var(--ink-soft)]">{c.notes}</span>}
            </Link>
          </li>
        ))}
      </ul>

      {/* Wider screens: the full table. */}
      <div className="mt-4 hidden border border-[var(--line)] md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[var(--sand)]">
              {["Caliber", "Type", "Jewels", "Years", "Family", "Notes"].map((h) => (
                <th key={h} scope="col" className="label whitespace-nowrap px-4 py-3 !text-[10px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.caliber} className="border-b border-[var(--line)] bg-[var(--surface)] last:border-0 hover:bg-[var(--ivory)]">
                <td className="whitespace-nowrap px-4 py-3 align-top">
                  <Link
                    href={`/caliber/${caliberSlug(c.caliber)}`}
                    className="font-mono text-[15px] text-[var(--maroon)] underline decoration-[var(--line-2)] underline-offset-4 hover:decoration-[var(--maroon)]"
                  >
                    {c.caliber}
                  </Link>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {c.grandSeiko && <Badge variant="burgundy">GS</Badge>}
                    {c.longRun && <Badge>Long run</Badge>}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 align-top text-[14px] capitalize text-[var(--ink-muted)]">
                  {c.movementType.replace("-", " ")}
                </td>
                <td className="px-4 py-3 align-top font-mono text-[14px] text-[var(--ink-muted)]">{c.jewels ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 align-top font-mono text-[14px] text-[var(--ink)]">{years(c)}</td>
                <td className="px-4 py-3 align-top text-[14px] text-[var(--ink-muted)]">{c.family ?? "—"}</td>
                <td className="min-w-[16rem] px-4 py-3 align-top text-[14px] leading-relaxed text-[var(--ink-muted)]">
                  {c.notes ?? "—"}
                  {c.notableRefs && c.notableRefs.length > 0 && (
                    <span className="mt-1 block font-mono text-[12px] text-[var(--ink-soft)]">{c.notableRefs.slice(0, 3).join(" · ")}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="mt-4 px-4 py-10 text-center text-[15px] text-[var(--ink-soft)]">
          No calibers match “{q}”. Try a different number, family or type.
        </p>
      )}
    </div>
  );
}
