"use client";

import { useMemo, useState } from "react";
import { Watch, ChevronRight } from "lucide-react";
import { decodeSeiko } from "@/lib/seiko/decode";
import { CALIBERS } from "@/data/calibers";
import { ResultCard } from "./ResultCard";

const EXAMPLES = [
  { serial: "7N0142", caliber: "6309", note: "Turtle diver" },
  { serial: "9D2210", caliber: "6309", note: "single-year hit" },
  { serial: "7D1234", caliber: "7002", note: "contradiction" },
  { serial: "5R3001", caliber: "7S26", note: "SKX era" },
];

export function SerialDecoder({
  autoFocus = false,
  initialSerial = "",
  initialCaliber = "",
}: {
  autoFocus?: boolean;
  initialSerial?: string;
  initialCaliber?: string;
}) {
  const [serial, setSerial] = useState(initialSerial);
  const [caliber, setCaliber] = useState(initialCaliber);

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const result = useMemo(
    () => decodeSeiko(serial, { caliber: caliber || undefined }),
    [serial, caliber],
  );

  const showResult = serial.trim().length > 0;

  return (
    <div>
      <div className="crop rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface)] p-6 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-[1.6fr_1fr]">
          <label className="block">
            <span className="label flex items-center gap-1.5">
              <Watch size={13} /> Serial number
            </span>
            <input
              type="text"
              inputMode="text"
              autoFocus={autoFocus}
              value={serial}
              onChange={(e) => setSerial(e.target.value.toUpperCase())}
              placeholder="e.g. 7N0142"
              spellCheck={false}
              autoComplete="off"
              className="mt-2 w-full rounded-[var(--radius)] border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-3 font-mono text-2xl tracking-[0.12em] text-[var(--burgundy-800)] outline-none transition-colors placeholder:text-[var(--ink-soft)]/50 focus:border-[var(--burgundy-500)]"
            />
          </label>

          <label className="block">
            <span className="label">
              Caliber <span className="text-[var(--ink-soft)] normal-case tracking-normal">— optional, narrows the year</span>
            </span>
            <input
              type="text"
              list="caliber-list"
              value={caliber}
              onChange={(e) => setCaliber(e.target.value.toUpperCase())}
              placeholder="e.g. 6309"
              spellCheck={false}
              autoComplete="off"
              className="mt-2 w-full rounded-[var(--radius)] border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-3 font-mono text-2xl tracking-[0.12em] text-[var(--burgundy-800)] outline-none transition-colors placeholder:text-[var(--ink-soft)]/50 focus:border-[var(--burgundy-500)]"
            />
            <datalist id="caliber-list">
              {CALIBERS.map((c) => (
                <option key={c.caliber} value={c.caliber.toUpperCase()} />
              ))}
            </datalist>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="label !text-[0.58rem]">Try</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.serial + ex.caliber}
              type="button"
              onClick={() => {
                setSerial(ex.serial);
                setCaliber(ex.caliber);
              }}
              className="group inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 font-mono text-[0.72rem] text-[var(--ink-muted)] transition-colors hover:border-[var(--gold-500)] hover:text-[var(--burgundy-700)]"
            >
              {ex.serial}
              <span className="text-[var(--ink-soft)] group-hover:text-[var(--gold-700)]">/ {ex.note}</span>
            </button>
          ))}
        </div>

        <details className="mt-4 max-w-md">
          <summary className="label cursor-pointer list-none text-[var(--ink-soft)] transition-colors hover:text-[var(--burgundy-700)]">
            Where do I find these numbers?
          </summary>
          <p className="mt-2 text-[0.82rem] leading-relaxed text-[var(--ink-muted)]">
            The <strong>serial</strong> is engraved on the outside of the caseback (the metal back of
            the watch). The <strong>caliber</strong> is the 4-character movement code — it’s the first
            part of the case reference, e.g. <span className="font-mono">6309</span>-7040, also stamped
            on the movement itself.
          </p>
        </details>
      </div>

      <div className="mt-5">
        {showResult ? (
          <ResultCard result={result} currentYear={currentYear} />
        ) : (
          <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)]/50 px-6 py-8 text-[var(--ink-soft)]">
            <ChevronRight size={18} />
            <p className="text-sm">Type a serial above — the decode appears here instantly, entirely in your browser.</p>
          </div>
        )}
      </div>
    </div>
  );
}
