"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { cn } from "@/lib/cn";

const NAV = [
  { label: "Tools", href: "/tools" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "Learn", href: "/learn" },
  { label: "Stories", href: "/stories" },
];

const SHOP_URL = "https://www.tinyhourtales.com";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <Wordmark />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "text-[var(--burgundy-700)]"
                  : "text-[var(--ink-muted)] hover:text-[var(--burgundy-700)]",
              )}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-[var(--gold-500)]" />
              )}
            </Link>
          ))}
          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-[var(--gold-500)] px-3.5 py-2 text-sm font-medium text-[var(--burgundy-800)] transition-colors hover:bg-[var(--gold-100)]"
          >
            Shop <ArrowUpRight size={14} strokeWidth={2.2} />
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center rounded-[var(--radius)] text-[var(--burgundy-700)] hover:bg-[var(--burgundy-50)] md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-[var(--border)] bg-[var(--surface)] px-5 py-3 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-[var(--radius)] px-3 py-2.5 text-[0.95rem] font-medium",
                isActive(item.href)
                  ? "bg-[var(--burgundy-50)] text-[var(--burgundy-700)]"
                  : "text-[var(--ink-muted)]",
              )}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center gap-1.5 rounded-[var(--radius)] px-3 py-2.5 text-[0.95rem] font-medium text-[var(--burgundy-800)]"
          >
            Shop at Tiny Hour Tales <ArrowUpRight size={15} strokeWidth={2.2} />
          </a>
        </nav>
      )}
    </header>
  );
}
