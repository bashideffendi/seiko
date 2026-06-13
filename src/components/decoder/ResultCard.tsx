import { AlertTriangle, Info, ArrowUpRight, ShieldQuestion } from "lucide-react";
import type { DecodeResult } from "@/lib/seiko/types";
import { CandidateTimeline } from "./CandidateTimeline";
import { Badge } from "@/components/ui";

const CONFIDENCE_LABEL: Record<string, { text: string; variant: "gold" | "burgundy" | "warning" | "default" }> = {
  high: { text: "High confidence", variant: "gold" },
  medium: { text: "Likely", variant: "burgundy" },
  low: { text: "Low confidence", variant: "warning" },
  none: { text: "—", variant: "default" },
};

function decadeOf(year: number) {
  return `${Math.floor(year / 10) * 10}s`;
}

export function ResultCard({ result, currentYear }: { result: DecodeResult; currentYear: number }) {
  // Error states (skip the empty-input case — caller renders a placeholder instead).
  if (!result.ok) {
    if (result.error?.code === "EMPTY") return null;
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex items-start gap-3">
          <Info size={18} className="mt-0.5 shrink-0 text-[var(--ink-soft)]" />
          <div>
            <p className="font-serif text-lg text-[var(--burgundy-800)]">We couldn’t read that one</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--ink-muted)]">{result.error?.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const d = result.decoded!;
  const n = d.narrowing;
  const likely = n && !n.contradiction ? n.likelyYears : d.candidateYears;
  const conf = CONFIDENCE_LABEL[result.confidence];

  // Honesty-scaled headline.
  let headline: React.ReactNode;
  let sub: React.ReactNode = null;

  if (n?.contradiction) {
    headline = <>{d.month.name} — <span className="text-[var(--danger)]">year unresolved</span></>;
  } else if (n?.singleYear) {
    headline = <>Likely <span className="italic">{d.month.name}</span> {n.singleYear}</>;
  } else if (likely.length === 1) {
    headline = <>Likely <span className="italic">{d.month.name}</span> {likely[0]}</>;
  } else {
    headline = <><span className="italic">{d.month.name}</span>, year ending in {d.yearDigit}</>;
    sub = (
      <p className="mt-2 text-sm text-[var(--ink-muted)]">
        Most likely one of{" "}
        <span className="font-mono text-[var(--burgundy-700)]">{likely.join(" · ")}</span>
        {!n && " — add the caliber below to narrow it."}
      </p>
    );
  }

  const ctaYear = n?.singleYear ?? (likely.length === 1 ? likely[0] : null);

  // Notes worth surfacing prominently (rest go to fine print).
  const banner = result.notes.find((x) => x.code === "CALIBER_CONTRADICTION");
  const gs = result.notes.find((x) => x.code === "GRAND_SEIKO_DIFFERENT");
  const unknown = result.notes.find((x) => x.code === "CALIBER_UNKNOWN");
  const finePrint = result.notes.filter(
    (x) => !["CALIBER_CONTRADICTION", "GRAND_SEIKO_DIFFERENT", "CALIBER_UNKNOWN"].includes(x.code),
  );

  return (
    <div className="crop rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface)] p-6 shadow-[0_18px_50px_-34px_rgba(32,22,15,0.6)] sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <span className="label">Decoded</span>
        <Badge variant={conf.variant}>{conf.text}</Badge>
      </div>

      <h3 className="mt-3 font-serif text-[2rem] font-600 leading-tight text-[var(--burgundy-800)] sm:text-[2.4rem]">
        {headline}
      </h3>
      {sub}

      {/* spec grid */}
      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-4">
        {[
          { k: "Month", v: `${d.month.name} (${String(d.month.number).padStart(2, "0")})` },
          { k: "Year digit", v: String(d.yearDigit) },
          { k: "Production no.", v: `#${d.sequence}` },
          { k: "Caliber", v: n?.caliberMatched ? n.caliberMatched.caliber.toUpperCase() : n?.caliberQueried ? n.caliberQueried.toUpperCase() : "—" },
        ].map((cell) => (
          <div key={cell.k} className="bg-[var(--surface-2)] px-4 py-3">
            <dt className="label !text-[0.58rem]">{cell.k}</dt>
            <dd className="mt-1 font-mono text-[0.95rem] text-[var(--ink)]">{cell.v}</dd>
          </div>
        ))}
      </dl>

      {/* contradiction banner */}
      {banner && (
        <div className="mt-5 flex items-start gap-3 rounded-[var(--radius)] border border-[var(--danger)]/30 bg-[var(--danger-bg)] p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[var(--danger)]" />
          <p className="text-sm leading-relaxed text-[var(--danger)]">
            <span className="font-semibold">Serial &amp; caliber don’t agree.</span> {banner.message}
          </p>
        </div>
      )}

      {gs && (
        <div className="mt-5 flex items-start gap-3 rounded-[var(--radius)] border border-[var(--warning)]/30 bg-[var(--warning-bg)] p-4">
          <ShieldQuestion size={18} className="mt-0.5 shrink-0 text-[var(--warning)]" />
          <p className="text-sm leading-relaxed text-[var(--warning)]">{gs.message}</p>
        </div>
      )}

      {unknown && (
        <p className="mt-4 flex items-start gap-2 text-sm text-[var(--ink-muted)]">
          <Info size={15} className="mt-0.5 shrink-0 text-[var(--info)]" />
          {unknown.message}
        </p>
      )}

      {/* timeline */}
      <div className="mt-6">
        <span className="label">Possible production years</span>
        <div className="mt-2">
          <CandidateTimeline
            candidates={d.candidateYears}
            likely={n && !n.contradiction ? n.likelyYears : undefined}
            currentYear={currentYear}
            contradiction={!!n?.contradiction}
          />
        </div>
      </div>

      {/* fine print + contextual CTA */}
      <div className="mt-6 flex flex-col gap-4 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-end sm:justify-between">
        <details className="group max-w-md">
          <summary className="label cursor-pointer list-none text-[var(--ink-soft)] transition-colors hover:text-[var(--burgundy-700)]">
            How sure is this? ({finePrint.length})
          </summary>
          <ul className="mt-3 space-y-2">
            {finePrint.map((note) => (
              <li key={note.code} className="text-[0.82rem] leading-relaxed text-[var(--ink-muted)]">
                {note.message}
              </li>
            ))}
          </ul>
        </details>

        <a
          href="https://www.tinyhourtales.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius)] border border-[var(--gold-500)] px-4 py-2.5 text-sm font-medium text-[var(--burgundy-800)] transition-colors hover:bg-[var(--gold-100)]"
        >
          {ctaYear ? `Find a ${decadeOf(ctaYear)} Seiko` : "Browse Seiko in the shop"}
          <ArrowUpRight size={15} strokeWidth={2.2} />
        </a>
      </div>
    </div>
  );
}
