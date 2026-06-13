import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-10", className)}>
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
  crop = false,
}: {
  children: ReactNode;
  className?: string;
  crop?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]",
        "shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_18px_40px_-30px_rgba(32,22,15,0.5)]",
        crop && "crop",
        className,
      )}
    >
      {children}
    </div>
  );
}

const badgeVariants: Record<string, string> = {
  default: "bg-[var(--surface-2)] text-[var(--ink-muted)] border-[var(--border)]",
  gold: "bg-[var(--gold-100)] text-[var(--gold-700)] border-[var(--gold-300)]",
  burgundy: "bg-[var(--burgundy-50)] text-[var(--burgundy-700)] border-[var(--burgundy-200)]",
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
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.66rem] uppercase tracking-[0.14em]",
        badgeVariants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

const buttonVariants: Record<string, string> = {
  primary:
    "bg-[var(--burgundy-700)] text-[var(--surface)] hover:bg-[var(--burgundy-600)] border-transparent",
  gold:
    "bg-transparent text-[var(--burgundy-800)] border-[var(--gold-500)] hover:bg-[var(--gold-100)]",
  ghost:
    "bg-transparent text-[var(--burgundy-700)] border-transparent hover:bg-[var(--burgundy-50)]",
  outline:
    "bg-[var(--surface)] text-[var(--ink)] border-[var(--border-strong)] hover:border-[var(--ink-soft)]",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof buttonVariants;
  className?: string;
  external?: boolean;
}) {
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] border px-5 py-2.5 text-sm font-medium transition-colors",
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
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function Flourish({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={cn("flourish font-mono text-[0.62rem] uppercase tracking-[0.3em]", className)}>
      {children}
    </div>
  );
}
