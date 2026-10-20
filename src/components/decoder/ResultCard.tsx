import Link from "next/link";
import type { DecodeResult } from "@/lib/seiko/types";
import { caliberSlug } from "@/lib/seiko/caliberKey";
import { CandidateTimeline } from "./CandidateTimeline";
import { Badge } from "@/components/ui";
import { SHOP } from "@/lib/site";

const CONFIDENCE_LABEL: Record<string, { text: string; variant: "burgundy" | "outline" | "warning" | "default" }> = {
  high: { text: "High confidence", variant: "burgundy" },
  medium: { text: "Likely", variant: "outline" },
  low: { text: "Low confidence", variant: "warning" },
  none: { text: "—", variant: "default" },
};

const linkCls = "border-b border-[var(--maroon)] pb-0.5 text-[var(--maroon)] transition-colors hover:border-[var(--maroon-deep)] hover:text-[var(--maroon-deep)]";

export function ResultCard({ result, currentYear }: { result: DecodeResult; currentYear: number }) {
  // Error states (skip the empty-input case — caller renders a placeholder instead).
  if (!result.ok) {
    if (result.error?.code === "EMPTY") return null;
    return (
      <div className="border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8">
        <p className="font-serif text-[22px] leading-7 text-[var(--ink)]">We couldn’t read that one</p>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[var(--ink-muted)]">{result.error?.message}</p>
        {result.error?.code === "FIVE_DIGIT_PRE1966" && (
          <p className="mt-4 text-[14px]">
            <Link href="/tools/vintage-case-code" className={linkCls}>Try the vintage case-code reader for pre-1966 watches</Link>
          </p>
        )}
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
  } else if (likely.length === 1) {
    headline = <>Likely <em>{d.month.name}</em> {likely[0]}</>;
  } else {
    headline = <><em>{d.month.name}</em>, a year ending in {d.yearDigit}</>;
    sub = (
      <p className="mt-3 text-[15px] text-[var(--ink-muted)]">
        Most likely one of{" "}
        <span className="font-mono text-[var(--maroon)]">{likely.join(" · ")}</span>
        {!n && " — add the caliber to narrow it."}
      </p>
    );
  }

  // Notes worth surfacing prominently (rest go to fine print).
  const banner = result.notes.find((x) => x.code === "CALIBER_CONTRADICTION");
  const gs = result.notes.find((x) => x.code === "GRAND_SEIKO_DIFFERENT");
  const unknown = result.notes.find((x) => x.code === "CALIBER_UNKNOWN");
  const attested = result.notes.find((x) => x.code === "CATALOGUE_ATTESTED_ONLY");
  const finePrint = result.notes.filter(
    (x) => !["CALIBER_CONTRADICTION", "GRAND_SEIKO_DIFFERENT", "CALIBER_UNKNOWN", "CATALOGUE_ATTESTED_ONLY"].includes(x.code),
  );

  const matched = n?.caliberMatched;

  return (
    <div className="border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <span className="label">The reading</span>
        <Badge variant={conf.variant}>{conf.text}</Badge>
      </div>

      <h2 className="mt-3 font-serif text-[34px] leading-[1.1] text-[var(--ink)] sm:text-[44px]">{headline}</h2>
      {sub}

      {/* spec grid */}
      <dl className={`mt-6 grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] ${n?.caseCode ? "sm:grid-cols-5" : "sm:grid-cols-4"}`}>
        {[
          { k: "Month", v: `${d.month.name} (${String(d.month.number).padStart(2, "0")})` },
          { k: "Year digit", v: String(d.yearDigit) },
          { k: "Production no.", v: `#${d.sequence}` },
          { k: "Caliber", v: matched ? matched.caliber : n?.caliberQueried ? n.caliberQueried.toUpperCase() : "—" },
          ...(n?.caseCode ? [{ k: "Case code", v: n.caseCode }] : []),
        ].map((cell) => (
          <div key={cell.k} className="bg-[var(--ivory)] px-4 py-3">
            <dt className="label !text-[10px]">{cell.k}</dt>
            <dd className="mt-1 font-mono text-[15px] text-[var(--ink)]">{cell.v}</dd>
          </div>
        ))}
      </dl>

      {matched && !matched.attestedOnly && (
        <p className="mt-4 text-[14px]">
          <Link href={`/caliber/${caliberSlug(matched.caliber)}`} className={linkCls}>
            The {matched.caliber}: production window, specs &amp; catalogued models
          </Link>
        </p>
      )}

      {attested && <p className="mt-4 text-[14px] leading-relaxed text-[var(--ink-muted)]">{attested.message}</p>}

      {banner && (
        <div className="mt-5 border-l-2 border-[var(--danger)] bg-[var(--danger-bg)] px-4 py-3">
          <p className="text-[14px] leading-relaxed text-[var(--danger)]">
            <span className="font-medium">Serial and caliber don’t agree.</span> {banner.message}
          </p>
        </div>
      )}

      {gs && (
        <div className="mt-5 border-l-2 border-[var(--warning)] bg-[var(--warning-bg)] px-4 py-3">
          <p className="text-[14px] leading-relaxed text-[var(--warning)]">{gs.message}</p>
        </div>
      )}

      {unknown && <p className="mt-4 text-[14px] leading-relaxed text-[var(--ink-muted)]">{unknown.message}</p>}

      {/* timeline */}
      <div className="mt-7">
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
      <div className="mt-6 flex flex-col gap-5 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-end sm:justify-between">
        <details className="group max-w-xl">
          <summary className="label cursor-pointer list-none transition-colors hover:text-[var(--maroon)] [&::-webkit-details-marker]:hidden">
            <span className="border-b border-[var(--line-2)] pb-0.5">How sure is this? ({finePrint.length})</span>
          </summary>
          <ul className="mt-3 space-y-2">
            {finePrint.map((note) => (
              <li key={note.code} className="text-[14px] leading-relaxed text-[var(--ink-muted)]">
                {note.message}
              </li>
            ))}
          </ul>
        </details>

        <a
          href={SHOP.seiko}
          className="inline-flex h-11 shrink-0 items-center justify-center border border-[var(--maroon)] px-5 text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--maroon)] transition-colors hover:bg-[var(--maroon)] hover:text-[var(--ivory)]"
        >
          Shop Seiko at Tiny Hour Tales
        </a>
      </div>
    </div>
  );
}
