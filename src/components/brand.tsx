import { cn } from "@/lib/cn";

// The Tiny Hour Tales logo — the same artwork the shop's header and footer use.
// (The Seiko trademark logo is deliberately not used anywhere: the Almanac is
// independent of Seiko Watch Corporation and must not read as a co-brand.)

const LOGO_RATIO = 600 / 440;

/** Tiny Hour Tales full logo (crest + wordmark). */
export function ThtLogo({
  height,
  tone = "maroon",
  className,
  priority = false,
}: {
  /** Pixel height. Omit to size it with className (e.g. responsive h-* classes). */
  height?: number;
  tone?: "maroon" | "white";
  className?: string;
  priority?: boolean;
}) {
  const h = height ?? 60;
  const src = tone === "white" ? "/brand/tht-logo-white.png" : "/brand/tht-logo.png";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Tiny Hour Tales"
      width={Math.round(h * LOGO_RATIO)}
      height={h}
      style={height != null ? { height, width: "auto" } : undefined}
      className={cn("block select-none", className)}
      draggable={false}
      decoding="async"
      loading={priority ? undefined : "lazy"}
      fetchPriority={priority ? "high" : undefined}
    />
  );
}

/** Tiny Hour Tales crest mark (icon only). */
export function Mark({
  size = 30,
  tone = "maroon",
  className,
}: {
  size?: number;
  tone?: "maroon" | "white";
  className?: string;
}) {
  const src = tone === "white" ? "/brand/tht-mark-white.png" : "/brand/tht-mark.png";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" aria-hidden="true" width={size} height={size}
      style={{ width: size, height: size }}
      className={cn("shrink-0 select-none", className)} draggable={false} decoding="async" />
  );
}
