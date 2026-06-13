import { SCHEME_START_YEAR } from "@/lib/seiko/decode";

/**
 * Plots the candidate years on a 1966→now rail. Survivors (after caliber
 * narrowing) are emphasized; eliminated candidates are dimmed. This makes the
 * decade ambiguity visible instead of hiding it behind a single guess.
 */
export function CandidateTimeline({
  candidates,
  likely,
  currentYear,
  contradiction = false,
}: {
  candidates: number[];
  likely?: number[];
  currentYear: number;
  contradiction?: boolean;
}) {
  const W = 640;
  const H = 78;
  const padX = 26;
  const railY = 30;
  const start = SCHEME_START_YEAR;
  const end = currentYear;
  const span = Math.max(1, end - start);
  const x = (year: number) => padX + ((year - start) / span) * (W - padX * 2);

  const survivorSet = new Set(likely ?? candidates);
  const narrowed = likely != null && likely.length !== candidates.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Candidate production years">
      {/* rail */}
      <line x1={padX} y1={railY} x2={W - padX} y2={railY} stroke="var(--border-strong)" strokeWidth="1" />
      {/* endpoint labels */}
      <text x={padX} y={railY + 34} className="tl-end" textAnchor="start">{start}</text>
      <text x={W - padX} y={railY + 34} className="tl-end" textAnchor="end">{end}</text>

      {candidates.map((year) => {
        const cx = x(year);
        const isSurvivor = !contradiction && survivorSet.has(year);
        const dim = contradiction || (narrowed && !isSurvivor);
        return (
          <g key={year}>
            <line
              x1={cx} y1={railY - 9} x2={cx} y2={railY + 9}
              stroke={dim ? "var(--border-strong)" : "var(--burgundy-600)"}
              strokeWidth={isSurvivor ? 2 : 1}
            />
            {isSurvivor && <circle cx={cx} cy={railY} r="6" fill="var(--burgundy-700)" stroke="var(--gold-500)" strokeWidth="1.5" />}
            {!isSurvivor && <circle cx={cx} cy={railY} r="3.5" fill={dim ? "var(--bg-subtle)" : "var(--burgundy-300)"} stroke="var(--border-strong)" strokeWidth="1" />}
            <text
              x={cx}
              y={railY - 16}
              textAnchor="middle"
              className="tl-year"
              style={{
                fill: dim ? "var(--ink-soft)" : "var(--burgundy-700)",
                fontWeight: isSurvivor ? 700 : 500,
                opacity: dim ? 0.6 : 1,
              }}
            >
              {year}
            </text>
          </g>
        );
      })}

      <style>{`
        .tl-year { font-family: var(--font-mono); font-size: 12px; }
        .tl-end { font-family: var(--font-mono); font-size: 10px; fill: var(--ink-soft); letter-spacing: 0.05em; }
      `}</style>
    </svg>
  );
}
