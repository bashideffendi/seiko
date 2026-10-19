import { SCHEME_START_YEAR } from "@/lib/seiko/decodeCore";

/**
 * Plots the candidate years on a 1966→now rail. Survivors (after caliber
 * narrowing) are emphasized; eliminated candidates are dimmed. This makes the
 * decade ambiguity visible instead of hiding it behind a single guess.
 * Labels scale up on narrow screens so they stay legible once the SVG shrinks.
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
  const H = 92;
  const padX = 30;
  const railY = 42;
  const start = SCHEME_START_YEAR;
  const end = currentYear;
  const span = Math.max(1, end - start);
  const x = (year: number) => padX + ((year - start) / span) * (W - padX * 2);

  const survivorSet = new Set(likely ?? candidates);
  const narrowed = likely != null && likely.length !== candidates.length;
  const survivors = candidates.filter((y) => !contradiction && survivorSet.has(y));
  const label = contradiction
    ? `Candidate years ${candidates.join(", ")} — none fits the caliber`
    : narrowed
      ? `Likely ${survivors.join(" or ")}, out of ${candidates.join(", ")}`
      : `Candidate years: ${candidates.join(", ")}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={label}>
      <line x1={padX} y1={railY} x2={W - padX} y2={railY} stroke="var(--line-2)" strokeWidth="1" />
      <text x={padX} y={railY + 38} className="tl-end" textAnchor="start">{start}</text>
      <text x={W - padX} y={railY + 38} className="tl-end" textAnchor="end">{end}</text>

      {candidates.map((year) => {
        const cx = x(year);
        const isSurvivor = !contradiction && survivorSet.has(year);
        const dim = contradiction || (narrowed && !isSurvivor);
        return (
          <g key={year}>
            <line
              x1={cx} y1={railY - 9} x2={cx} y2={railY + 9}
              stroke={dim ? "var(--line-2)" : "var(--maroon)"}
              strokeWidth={isSurvivor ? 2 : 1}
            />
            {isSurvivor ? (
              <circle cx={cx} cy={railY} r="7" fill="var(--maroon)" stroke="var(--ivory)" strokeWidth="2" />
            ) : (
              <circle cx={cx} cy={railY} r="4" fill={dim ? "var(--stone)" : "var(--burgundy-200)"} stroke="var(--line-2)" strokeWidth="1" />
            )}
            <text
              x={cx}
              y={railY - 18}
              textAnchor="middle"
              className="tl-year"
              style={{
                fill: dim ? "var(--ink-soft)" : "var(--maroon)",
                fontWeight: isSurvivor ? 600 : 400,
                opacity: dim ? 0.7 : 1,
              }}
            >
              {year}
            </text>
          </g>
        );
      })}

      <style>{`
        .tl-year { font-family: var(--font-mono); font-size: 13px; }
        .tl-end { font-family: var(--font-mono); font-size: 11px; fill: var(--ink-soft); letter-spacing: 0.05em; }
        @media (max-width: 640px) {
          .tl-year { font-size: 22px; }
          .tl-end { font-size: 19px; }
        }
      `}</style>
    </svg>
  );
}
