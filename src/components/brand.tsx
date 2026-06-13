import Link from "next/link";
import { cn } from "@/lib/cn";

/** Tiny Hour Tales crest mark (icon only). */
export function Mark({
  size = 30,
  variant = "burgundy",
  className,
}: {
  size?: number;
  variant?: "burgundy" | "white";
  className?: string;
}) {
  const src = variant === "white" ? "/brand/tht-mark-white.png" : "/brand/tht-mark.png";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="Tiny Hour Tales" width={size} height={size}
      style={{ width: size, height: size }}
      className={cn("shrink-0 select-none", className)} draggable={false} />
  );
}

/** Tiny Hour Tales full logo (crest + wordmark). */
export function ThtLogo({ height = 56, variant = "burgundy", className }: { height?: number; variant?: "burgundy" | "white"; className?: string }) {
  const src = variant === "white" ? "/brand/tht-logo-white.png" : "/brand/tht-logo.png";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="Tiny Hour Tales" style={{ height, width: "auto" }}
      className={cn("select-none", className)} draggable={false} />
  );
}

function Seiko({ height = 18, tone = "ink", className }: { height?: number; tone?: "ink" | "white"; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/seiko-black.png" alt="Seiko"
      style={{ height, width: "auto", filter: tone === "white" ? "brightness(0) invert(1)" : "none" }}
      className={cn("select-none", className)} draggable={false} />
  );
}

/** Co-brand lockup: the two logos placed side by side with a hairline divider. */
export function CoBrand({
  variant = "mark",
  tone = "light",
  seikoHeight = 22,
  className,
}: {
  variant?: "mark" | "full";
  tone?: "light" | "dark";
  seikoHeight?: number;
  className?: string;
}) {
  const onDark = tone === "dark";
  const dividerH = variant === "full" ? seikoHeight * 2.4 : seikoHeight * 1.5;
  return (
    <div className={cn("flex items-center", className)} style={{ gap: seikoHeight * 0.85 }}>
      <Seiko height={seikoHeight} tone={onDark ? "white" : "ink"} />
      <span className="lockdiv" style={{ height: dividerH }} aria-hidden />
      {variant === "full" ? (
        <ThtLogo height={seikoHeight * 2.6} variant={onDark ? "white" : "burgundy"} />
      ) : (
        <Mark size={seikoHeight * 1.7} variant={onDark ? "white" : "burgundy"} />
      )}
    </div>
  );
}

/** Header home link — compact co-brand. */
export function Wordmark({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} aria-label="Seiko Almanac — Tiny Hour Tales" className={cn("group inline-flex", className)}>
      <CoBrand variant="mark" seikoHeight={17} className="transition-opacity group-hover:opacity-80" />
    </Link>
  );
}
