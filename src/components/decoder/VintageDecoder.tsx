"use client";

import { useMemo, useState } from "react";
import { Ruler, ChevronRight, Info, Gem } from "lucide-react";
import Link from "next/link";
import { decodeVintageCaseCode } from "@/lib/seiko/vintage";
import { Badge } from "@/components/ui";
import { SHOP } from "@/lib/site";

const EXAMPLES = [
  { code: "J14070", note: "1st Grand Seiko" },
  { code: "J14102", note: "1st King Seiko" },
  { code: "14041", note: "Laurel Alpinist" },
  { code: "J13088", note: "Sea Lion" },
  { code: "J14054", note: "Gyro Marvel" },
];

export function VintageDecoder({ autoFocus = false }: { autoFocus?: boolean }) {
  const [code, setCode] = useState("");
  const result = useMemo(() => decodeVintageCaseCode(code), [code]);
  const show = code.trim().length > 0;

  return (
    <div>
      <div className="border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-8">
        <label className="block">
          <span className="label flex items-center gap-1.5">
            <Ruler size={13} /> Vintage case code
          </span>
          <input
            type="text"
            autoFocus={autoFocus}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. J14070"
            spellCheck={false}
            autoComplete="off"
            className="field mt-2 h-14 px-4 font-mono text-[22px] tracking-[0.14em] sm:h-16 sm:text-[26px]"
          />
        </label>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="label mr-1">Try</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.code}
              type="button"
              onClick={() => setCode(ex.code)}
              className="group inline-flex items-center gap-1.5 border border-[var(--line-2)] bg-[var(--ivory)] px-3 py-1.5 text-[12px] text-[var(--text)] transition-colors hover:border-[var(--maroon)] hover:text-[var(--maroon)]"
            >
              <span className="font-mono">{ex.code}</span>
              <span className="text-[var(--ink-soft)]">· {ex.note}</span>
            </button>
          ))}
        </div>

        <details className="mt-4 max-w-md">
          <summary className="label cursor-pointer list-none text-[var(--ink-soft)] transition-colors hover:text-[var(--maroon)]">
            Where do I find this code?
          </summary>
          <p className="mt-2 text-[0.82rem] leading-relaxed text-[var(--ink-muted)]">
            On pre-1966 Seikos the <strong>case code</strong> is stamped on the caseback — five digits,
            often with a leading <span className="font-mono">J</span> (e.g. <span className="font-mono">J14070</span>).
            This is <em>not</em> the same as the modern 4+4 reference. Watches from 1966 on are dated from
            the <Link href="/tools/serial-decoder" className="border-b border-[var(--maroon)] text-[var(--maroon)]">serial number</Link> instead.
          </p>
        </details>
      </div>

      <div className="mt-5">
        {show ? <VintageResultCard result={result} /> : (
          <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)]/50 px-6 py-8 text-[var(--ink-soft)]">
            <ChevronRight size={18} />
            <p className="text-sm">Type a five-digit case code above — the decode appears here instantly, in your browser.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function VintageResultCard({ result }: { result: ReturnType<typeof decodeVintageCaseCode> }) {
  if (!result.ok) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex items-start gap-3">
          <Info size={18} className="mt-0.5 shrink-0 text-[var(--ink-soft)]" />
          <div>
            <p className="font-serif text-[22px] leading-7 text-[var(--ink)]">We couldn’t read that one</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--ink-muted)]">{result.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { match, seriesInfo } = result;

  return (
    <div className="border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <span className="label">Decoded · pre-1966 case code</span>
        <Badge variant={match ? "gold" : "default"}>{match ? "Known case" : "System read"}</Badge>
      </div>

      <h3 className="mt-3 font-serif text-[34px] leading-[1.1] text-[var(--ink)] sm:text-[44px]">
        {match ? (
          <>{match.models.join(" · ")}</>
        ) : (
          <><span className="italic">{result.ligne}</span>-ligne case</>
        )}
      </h3>
      {match?.note && <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{match.note}</p>}

      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-4">
        {[
          { k: "Ligne family", v: `${result.series}xx` },
          { k: "Lignes", v: `${result.ligne}${result.hasJ ? " (J +½)" : ""}` },
          { k: "≈ Dial size", v: `${result.approxMm} mm` },
          { k: "Case no.", v: `#${result.progressive}` },
        ].map((cell) => (
          <div key={cell.k} className="bg-[var(--surface-2)] px-4 py-3">
            <dt className="label !text-[0.58rem]">{cell.k}</dt>
            <dd className="mt-1 font-mono text-[0.95rem] text-[var(--ink)]">{cell.v}</dd>
          </div>
        ))}
      </dl>

      {match?.material && (
        <p className="mt-4 flex items-center gap-2 text-sm text-[var(--ink-muted)]">
          <Gem size={15} className="shrink-0 text-[var(--gold-600)]" />
          <span><span className="text-[var(--ink-soft)]">Material</span> · {match.material}</span>
        </p>
      )}

      {seriesInfo && (
        <div className="mt-5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)]/60 p-4">
          <span className="label !text-[0.56rem]">About the {seriesInfo.prefix}-ligne family</span>
          <p className="mt-1.5 text-[0.84rem] leading-relaxed text-[var(--ink-muted)]">{seriesInfo.note}</p>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-end sm:justify-between">
        <details className="group max-w-md">
          <summary className="label cursor-pointer list-none text-[var(--ink-soft)] transition-colors hover:text-[var(--maroon)]">
            How this code works ({result.notes.length})
          </summary>
          <ul className="mt-3 space-y-2">
            {result.notes.map((n) => (
              <li key={n} className="text-[0.82rem] leading-relaxed text-[var(--ink-muted)]">{n}</li>
            ))}
          </ul>
        </details>

        <a
          href={SHOP.seiko}
          className="inline-flex h-11 shrink-0 items-center justify-center border border-[var(--maroon)] px-5 text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--maroon)] transition-colors hover:bg-[var(--maroon)] hover:text-[var(--ivory)]"
        >
          {match ? `Looking for a ${match.models[0]}?` : "Shop vintage Seiko"}
        </a>
      </div>
    </div>
  );
}
