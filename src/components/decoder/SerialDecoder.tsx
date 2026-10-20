"use client";

import { useEffect, useMemo, useState } from "react";
import { decodeSerial } from "@/lib/seiko/decodeCore";
import type { SlimCaliber } from "@/data/calibers";
import { ResultCard } from "./ResultCard";
import { CatalogueMatches } from "./CatalogueMatches";
import { DECODER_EXAMPLES } from "./examples";
import { cn } from "@/lib/cn";

/** Keep only characters that can appear in a serial / caliber, capped to a sane length. */
const cleanSerial = (s: string) => s.toUpperCase().replace(/[^0-9A-Z\s-]/g, "").slice(0, 12);
const cleanCaliber = (s: string) => s.toUpperCase().replace(/[^0-9A-Z\s-]/g, "").slice(0, 10);

export function SerialDecoder({
  calibers,
  autoFocus = false,
  initialSerial = "",
  initialCaliber = "",
  syncUrl = false,
  idPrefix = "dec",
}: {
  /** Slim caliber dataset from the server (keeps notes/sources out of the bundle). */
  calibers: SlimCaliber[];
  autoFocus?: boolean;
  initialSerial?: string;
  initialCaliber?: string;
  /** Mirror the inputs into ?serial=&caliber= so the result can be shared or bookmarked. */
  syncUrl?: boolean;
  idPrefix?: string;
}) {
  const [serial, setSerial] = useState(cleanSerial(initialSerial));
  const [caliber, setCaliber] = useState(cleanCaliber(initialCaliber));

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const result = useMemo(
    () => decodeSerial(serial, calibers, { caliber: caliber || undefined }),
    [serial, caliber, calibers],
  );

  useEffect(() => {
    if (!syncUrl) return;
    const t = window.setTimeout(() => {
      const url = new URL(window.location.href);
      const s = serial.trim();
      const c = caliber.trim();
      if (s) url.searchParams.set("serial", s);
      else url.searchParams.delete("serial");
      if (c) url.searchParams.set("caliber", c);
      else url.searchParams.delete("caliber");
      if (url.href !== window.location.href) window.history.replaceState(window.history.state, "", url);
    }, 350);
    return () => window.clearTimeout(t);
  }, [serial, caliber, syncUrl]);

  const showResult = serial.trim().length > 0;
  const serialId = `${idPrefix}-serial`;
  const caliberId = `${idPrefix}-caliber`;
  const listId = `${idPrefix}-calibers`;

  return (
    <div>
      <div className="border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-[1.5fr_1fr] sm:gap-6">
          <div>
            <label htmlFor={serialId} className="label">Serial number</label>
            <input
              id={serialId}
              type="text"
              inputMode="text"
              autoFocus={autoFocus}
              value={serial}
              onChange={(e) => setSerial(cleanSerial(e.target.value))}
              placeholder="e.g. 7N0142"
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="characters"
              aria-describedby={`${idPrefix}-help`}
              className="field mt-2 h-14 px-4 font-mono text-[22px] tracking-[0.14em] sm:h-16 sm:text-[26px]"
            />
          </div>

          <div>
            <label htmlFor={caliberId} className="label">
              Caseback Number <span className="normal-case tracking-normal text-[var(--ink-soft)]">— optional, narrows the decade</span>
            </label>
            <input
              id={caliberId}
              type="text"
              list={listId}
              value={caliber}
              onChange={(e) => setCaliber(cleanCaliber(e.target.value))}
              placeholder="e.g. 6309-7040"
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="characters"
              className="field mt-2 h-14 px-4 font-mono text-[22px] tracking-[0.14em] sm:h-16 sm:text-[26px]"
            />
            <datalist id={listId}>
              {calibers.map((c) => (
                <option key={c.caliber} value={c.caliber} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="label mr-1">Try</span>
          {DECODER_EXAMPLES.map((ex) => {
            const active = serial === ex.serial && caliber === ex.caliber;
            return (
              <button
                key={ex.serial + ex.caliber}
                type="button"
                onClick={() => {
                  setSerial(ex.serial);
                  setCaliber(ex.caliber);
                }}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1.5 border px-3 py-1.5 text-[12px] transition-colors",
                  active
                    ? "border-[var(--maroon)] bg-[var(--maroon)] text-[var(--ivory)]"
                    : "border-[var(--line-2)] bg-[var(--ivory)] text-[var(--text)] hover:border-[var(--maroon)] hover:text-[var(--maroon)]",
                )}
              >
                <span className="font-mono">{ex.serial}</span>
                <span className={active ? "text-[var(--on-dark-2)]" : "text-[var(--ink-soft)]"}>· {ex.caliber} · {ex.note}</span>
              </button>
            );
          })}
        </div>

        <details id={`${idPrefix}-help`} className="group mt-5 max-w-xl">
          <summary className="label cursor-pointer list-none transition-colors hover:text-[var(--maroon)] [&::-webkit-details-marker]:hidden">
            <span className="border-b border-[var(--line-2)] pb-0.5">Where do I find these numbers?</span>
          </summary>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink-muted)]">
            Both are engraved on the outside of the caseback — the metal back of the watch. The{" "}
            <strong className="font-medium text-[var(--ink)]">serial</strong> is usually six characters. The{" "}
            <strong className="font-medium text-[var(--ink)]">caseback number</strong> is the caliber and the case code joined by a
            hyphen, e.g. <span className="font-mono">6309-7040</span>: the first half (<span className="font-mono">6309</span>) is the
            movement and narrows the decade; the second half (<span className="font-mono">7040</span>) is the case and identifies the
            model, so we list the matching watches from the original catalogues. The caliber alone works too.
          </p>
        </details>
      </div>

      <div className="mt-4" aria-live="polite">
        {showResult ? (
          <>
            <ResultCard result={result} currentYear={currentYear} />
            {result.ok && result.decoded?.narrowing?.caliberMatched && (
              <CatalogueMatches
                caliber={result.decoded.narrowing.caliberMatched.caliber}
                caseCode={result.decoded.narrowing.caseCode}
                hasCaliberPage={!result.decoded.narrowing.caliberMatched.attestedOnly}
              />
            )}
          </>
        ) : (
          <p className="border border-dashed border-[var(--line-2)] px-6 py-7 text-[15px] text-[var(--ink-soft)]">
            Type a serial above — the reading appears here instantly, entirely in your browser.
          </p>
        )}
      </div>
    </div>
  );
}
