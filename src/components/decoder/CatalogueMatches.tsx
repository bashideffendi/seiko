"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CatalogueMatches as Matches } from "@/lib/catalogueMatches";
import type { CompactModel } from "@/lib/modelCompact";
import { caliberSlug } from "@/lib/seiko/caliberKey";

/** Catalogued models for the caseback number under the decoder's reading. */
export function CatalogueMatches({
  caliber,
  caseCode,
  hasCaliberPage,
}: {
  caliber: string;
  caseCode: string | null;
  /** Calibers known only from catalogues have no reference page; link to the model search instead. */
  hasCaliberPage: boolean;
}) {
  const [data, setData] = useState<Matches | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    const t = window.setTimeout(() => {
      const q = new URLSearchParams({ caliber });
      if (caseCode) q.set("case", caseCode);
      fetch(`/api/catalogue/matches?${q}`, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : null))
        .then((j: Matches | null) => setData(j))
        .catch(() => {});
    }, 300);
    return () => {
      window.clearTimeout(t);
      ctrl.abort();
    };
  }, [caliber, caseCode]);

  if (!data || data.caliber !== caliber || data.caliberTotal === 0) return null;
  const seeAll = hasCaliberPage ? `/caliber/${caliberSlug(caliber)}` : `/catalogue/models?q=${encodeURIComponent(caliber)}`;

  return (
    <section className="mt-4 border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-8" aria-label="Catalogued models">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span className="label">In the Original Catalogues</span>
        <Link href={seeAll} className="text-[13px] text-[var(--maroon)] underline decoration-[var(--line-2)] underline-offset-4 hover:decoration-[var(--maroon)]">
          See All {data.caliberTotal} {caliber} Models →
        </Link>
      </div>

      {caseCode && (
        <>
          <h3 className="mt-3 font-serif text-[22px] leading-7 text-[var(--ink)]">
            {data.exact.length ? <>Catalogued as <span className="font-mono">{caliber}-{caseCode}</span></> : <>No model catalogued as <span className="font-mono">{caliber}-{caseCode}</span> yet</>}
          </h3>
          {data.exact.length > 0 && <Grid models={data.exact} />}
          {!data.exact.length && (
            <p className="mt-1 text-[14px] text-[var(--ink-muted)]">
              The catalogues digitised so far don’t print this case code — here are other models with the same movement.
            </p>
          )}
        </>
      )}

      {data.sameCaliber.length > 0 && (
        <>
          <h3 className="mt-5 font-serif text-[20px] leading-7 text-[var(--ink)]">
            {caseCode ? <>Other {caliber} Models</> : <>Models with the {caliber}</>}
          </h3>
          <Grid models={data.sameCaliber} />
        </>
      )}
    </section>
  );
}

function Grid({ models }: { models: CompactModel[] }) {
  return (
    <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {models.map((m) => (
        <li key={m.s}>
          <Link href={`/catalogue/model/${m.s}`} className="group block border border-[var(--line)] bg-[var(--ivory)] transition-colors hover:border-[var(--maroon)]">
            <span className="flex aspect-[4/5] items-center justify-center overflow-hidden bg-[var(--stone)]">
              {m.i ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.i} alt={`Seiko ${m.r} in the original catalogue`} loading="lazy" decoding="async" className="h-full w-full object-contain" />
              ) : (
                <span className="px-3 text-center text-[12px] text-[var(--ink-soft)]">Listed without a photo</span>
              )}
            </span>
            <span className="block px-3 py-2">
              <span className="block font-mono text-[14px] text-[var(--ink)] group-hover:text-[var(--maroon)]">{m.r}</span>
              <span className="block truncate text-[12px] text-[var(--ink-soft)]">
                {[m.y[0], m.d].filter(Boolean).join(" · ")}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
