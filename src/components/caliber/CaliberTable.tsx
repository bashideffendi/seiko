"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CALIBERS, canonicalCaliberKey } from "@/data/calibers";
import type { MovementType } from "@/lib/seiko/types";
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

const CURRENT_YEAR = new Date().getFullYear();

// Distinct families with at least two calibers — used for the family browse.
const FAMILIES = Array.from(
  CALIBERS.reduce((m, c) => {
    if (c.family) m.set(c.family, (m.get(c.family) ?? 0) + 1);
    return m;
  }, new Map<string, number>()),
)
  .filter(([, n]) => n >= 2)
  .map(([f]) => f)
  .sort();

export function CaliberTable() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<MovementType | "all">("all");
  const [family, setFamily] = useState<string>("all");

  const rows = useMemo(() => {
    const key = canonicalCaliberKey(q);
    return CALIBERS.filter((c) => {
      if (type !== "all" && c.movementType !== type) return false;
      if (family !== "all" && c.family !== family) return false;
      if (!key) return true;
      const hay = [
        c.caliber,
        ...(c.aliases ?? []),
        c.family ?? "",
        c.notes ?? "",
        ...(c.notableRefs ?? []),
      ]
        .join(" ")
        .toUpperCase();
      // key has spaces/dashes stripped (canonicalCaliberKey), so strip the haystack
      // too — otherwise a dashed ref like "6309-7040" never matches its own key.
      return hay.replace(/[\s-]+/g, "").includes(key);
    }).sort((a, b) => a.startYear - b.startYear || a.caliber.localeCompare(b.caliber));
  }, [q, type, family]);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative w-full lg:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search caliber, family, ref…"
            spellCheck={false}
            className="w-full rounded-[var(--radius)] border border-[var(--border-strong)] bg-[var(--surface)] py-2.5 pl-9 pr-3 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--burgundy-500)]"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setType(t.key)}
                className={cn(
                  "rounded-full border px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.1em] transition-colors",
                  type === t.key
                    ? "border-[var(--burgundy-700)] bg-[var(--burgundy-700)] text-[var(--surface)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--gold-500)]",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <select
            value={family}
            onChange={(e) => setFamily(e.target.value)}
            className="rounded-[var(--radius)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 font-mono text-[0.72rem] text-[var(--ink-muted)] outline-none focus:border-[var(--burgundy-500)]"
            aria-label="Filter by family"
          >
            <option value="all">All families</option>
            {FAMILIES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)]">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]">
              {["Caliber", "Type", "Jewels", "Years", "Family", "Notes"].map((h) => (
                <th key={h} className="label whitespace-nowrap px-4 py-3 !text-[0.58rem]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.caliber} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]/60">
                <td className="whitespace-nowrap px-4 py-3 align-top">
                  <span className="font-mono text-[0.95rem] font-medium text-[var(--burgundy-800)]">
                    {c.caliber.toUpperCase()}
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.grandSeiko && <Badge variant="burgundy">GS</Badge>}
                    {c.longRun && <Badge>long run</Badge>}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 align-top text-sm capitalize text-[var(--ink-muted)]">
                  {c.movementType.replace("-", " ")}
                </td>
                <td className="px-4 py-3 align-top font-mono text-sm text-[var(--ink-muted)]">{c.jewels ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 align-top font-mono text-sm text-[var(--ink)]">
                  {c.startYear}<span className="text-[var(--ink-soft)]">–</span>{c.endYear ?? "present"}
                  {c.rangeConfidence === "approximate" && (
                    <span className="ml-1 text-[var(--ink-soft)]" title="Approximate range">~</span>
                  )}
                </td>
                <td className="px-4 py-3 align-top text-sm text-[var(--ink-muted)]">{c.family ?? "—"}</td>
                <td className="px-4 py-3 align-top text-sm leading-relaxed text-[var(--ink-muted)] min-w-[16rem]">
                  {c.notes ?? "—"}
                  {c.notableRefs && c.notableRefs.length > 0 && (
                    <span className="mt-1 block font-mono text-[0.68rem] text-[var(--gold-700)]">
                      {c.notableRefs.slice(0, 3).join(" · ")}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-[var(--ink-soft)]">
                  No calibers match “{q}”. Try a different number, family or type.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
        {rows.length} of {CALIBERS.length} calibers · ranges are community-sourced approximations · as of {CURRENT_YEAR}
      </p>
    </div>
  );
}
