import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** The shop's content wrap: 1440px max, fluid gutter clamp(20px, 5.5vw, 80px). */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1440px] px-[var(--gutter)]", className)}>
      {children}
    </div>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("label", className)}>{children}</span>;
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  crop?: boolean;
}) {
  return (
    <div className={cn("border border-[var(--border)] bg-[var(--surface)]", className)}>
      {children}
    </div>
  );
}

const badgeVariants: Record<string, string> = {
  default: "bg-[var(--surface)] text-[var(--muted)] border-[var(--line-2)]",
  gold: "bg-[var(--sand)] text-[var(--text)] border-[var(--line-2)]",
  burgundy: "bg-[var(--maroon)] text-[var(--ivory)] border-[var(--maroon)]",
  outline: "bg-transparent text-[var(--maroon)] border-[var(--maroon)]",
  success: "bg-[var(--success-bg)] text-[var(--success)] border-transparent",
  warning: "bg-[var(--warning-bg)] text-[var(--warning)] border-transparent",
  danger: "bg-[var(--danger-bg)] text-[var(--danger)] border-transparent",
  info: "bg-[var(--info-bg)] text-[var(--info)] border-transparent",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: keyof typeof badgeVariants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] font-medium uppercase leading-[14px] tracking-[0.2em]",
        badgeVariants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

// The shop's .thd-btn: square, 52px tall, uppercase tracked Jost.
const buttonVariants: Record<string, string> = {
  primary: "bg-[var(--maroon)] text-[var(--ivory)] border-[var(--maroon)] hover:bg-[var(--maroon-deep)] hover:border-[var(--maroon-deep)]",
  outline: "bg-transparent text-[var(--maroon)] border-[var(--maroon)] hover:bg-[var(--maroon)] hover:text-[var(--ivory)]",
  gold: "bg-transparent text-[var(--maroon)] border-[var(--maroon)] hover:bg-[var(--maroon)] hover:text-[var(--ivory)]",
  ghost: "bg-transparent text-[var(--maroon)] border-transparent hover:border-[var(--line-2)]",
  light: "bg-[var(--ivory)] text-[var(--maroon-deep)] border-[var(--ivory)] hover:bg-white",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof buttonVariants;
  size?: "md" | "sm";
  className?: string;
  /** Opens in a new tab (only for third-party sites; shop links stay in the same tab). */
  external?: boolean;
}) {
  const cls = cn(
    "inline-flex items-center justify-center gap-2.5 whitespace-nowrap border font-medium uppercase transition-colors",
    size === "md" ? "h-[52px] px-8 text-[13px] tracking-[0.18em]" : "h-11 px-5 text-[12px] tracking-[0.16em]",
    buttonVariants[variant],
    className,
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

/** Small uppercase text link with an underline that draws on hover. */
export function TextLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const cls = cn(
    "caps inline-flex items-center gap-2 border-b border-[var(--maroon)] pb-1 !text-[12px] text-[var(--maroon)] transition-colors hover:border-[var(--maroon-deep)] hover:text-[var(--maroon-deep)]",
    className,
  );
  return /^https?:\/\//.test(href) ? (
    <a href={href} className={cls}>{children}</a>
  ) : (
    <Link href={href} className={cls}>{children}</Link>
  );
}

export function Flourish({ children, className }: { children?: ReactNode; className?: string }) {
  return <div className={cn("flourish label", className)}>{children}</div>;
}

/** Section heading in the shop's style: eyebrow + Bodoni title (+ optional action on the right). */
export function SectionHead({
  eyebrow,
  title,
  action,
  className,
  as: As = "h2",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  action?: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        {eyebrow && <p className="label">{eyebrow}</p>}
        <As className="mt-2 font-serif text-[34px] leading-[40px] text-[var(--ink)] lg:mt-3 lg:text-[44px] lg:leading-[52px]">
          {title}
        </As>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
