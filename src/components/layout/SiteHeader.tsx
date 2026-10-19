"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThtLogo } from "@/components/brand";
import { cn } from "@/lib/cn";
import { ALMANAC_NAV, CONTACT, SHOP, SHOP_BRANDS, SHOP_NAV } from "@/lib/site";

// Mirrors the Tiny Hour Tales shop header (THT Design): announcement bar, centred logo,
// uppercase Jost navigation, a slide-in drawer below desktop width. The left nav is the
// Almanac; the right nav goes straight into the shop, so the two read as one site.

const DRAWER_ALMANAC = [
  ...ALMANAC_NAV,
  { label: "Models", href: "/catalogue/models" },
  { label: "All Tools", href: "/tools" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/catalogue") return pathname === "/catalogue" || pathname.startsWith("/catalogue/");
  if (href === "/tools/caliber-lookup") return pathname.startsWith("/tools/caliber-lookup") || pathname.startsWith("/caliber/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
function IconBag() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 8h14l-1 12H6L5 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
function Caret() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" className="transition-transform group-open:rotate-180">
      <path d="M2.5 4.5L6 8l3.5-3.5" />
    </svg>
  );
}

const navLink =
  "caps whitespace-nowrap border-b border-transparent py-3 text-[var(--ink)] transition-colors hover:border-[var(--maroon)] hover:text-[var(--maroon)]";

function BrandsMenu() {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent | KeyboardEvent) => {
      const el = ref.current;
      if (!el?.open) return;
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !el.contains(e.target as Node)) el.open = false;
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", close);
    };
  }, []);
  return (
    <details ref={ref} className="group relative">
      <summary className={cn(navLink, "flex cursor-pointer list-none items-center gap-1.5 [&::-webkit-details-marker]:hidden")}>
        Brands <Caret />
      </summary>
      <ul className="absolute right-0 top-full z-50 mt-2 min-w-[200px] border border-[var(--line)] bg-[var(--ivory)] py-2 shadow-[0_12px_32px_rgba(30,23,20,.10)]">
        {SHOP_BRANDS.map((b) => (
          <li key={b.href}>
            <a href={b.href} className="block px-5 py-2.5 text-[15px] text-[var(--ink)] transition-colors hover:bg-[var(--sand)] hover:text-[var(--maroon)]">
              {b.label}
            </a>
          </li>
        ))}
        <li className="mt-1 border-t border-[var(--line)] pt-1">
          <a href={SHOP.collection} className="block px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--muted)] hover:text-[var(--maroon)]">
            All watches
          </a>
        </li>
      </ul>
    </details>
  );
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const openBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    openBtn.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, close]);

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>

      {/* Announcement bar — same voice as the shop's */}
      <div className="bg-[var(--maroon)] px-4 py-2 text-center text-[11px] font-medium uppercase leading-4 tracking-[0.14em] text-[var(--on-dark)]">
        <span className="sm:hidden">The Seiko Almanac · by Tiny Hour Tales</span>
        <span className="hidden sm:inline">The Seiko Almanac · a reference desk by Tiny Hour Tales</span>
        <a
          href={SHOP.seiko}
          className="ml-3 hidden border border-dashed border-[rgba(246,238,232,.7)] px-2 py-0.5 font-semibold text-[var(--on-dark)] transition-colors hover:bg-[rgba(246,238,232,.12)] sm:inline-block"
        >
          Shop Seiko
        </a>
      </div>

      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--ivory)]">
        <div className="mx-auto grid h-[64px] max-w-[1440px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-2 min-[1180px]:h-[96px] min-[1180px]:gap-6 min-[1180px]:px-[var(--gutter)]">
          {/* Left — menu button (narrow) / Almanac nav (wide) */}
          <div className="flex min-w-0 items-center">
            <button
              ref={openBtn}
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-controls="site-drawer"
              aria-expanded={open}
              className="grid h-11 w-11 place-items-center text-[var(--ink)] hover:text-[var(--maroon)] min-[1180px]:hidden"
            >
              <IconMenu />
            </button>
            <nav aria-label="Almanac" className="hidden items-center gap-[clamp(20px,2.4vw,34px)] min-[1180px]:flex">
              {ALMANAC_NAV.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(navLink, active && "border-[var(--maroon)] text-[var(--maroon)]")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Centre — logo + Almanac caption */}
          <Link href="/" aria-label="Seiko Almanac by Tiny Hour Tales — home" className="group flex flex-col items-center leading-none">
            <ThtLogo priority className="h-11 w-auto min-[1180px]:h-[60px]" />
            <span className="mt-1 text-[8.5px] font-medium uppercase tracking-[0.34em] text-[var(--maroon)] min-[1180px]:mt-1.5 min-[1180px]:text-[9.5px]">
              Seiko Almanac
            </span>
          </Link>

          {/* Right — shop nav (wide) / bag link (narrow) */}
          <div className="flex min-w-0 items-center justify-end">
            <nav aria-label="Tiny Hour Tales shop" className="hidden items-center gap-[clamp(20px,2.4vw,34px)] min-[1180px]:flex">
              <a href={SHOP_NAV[0].href} className={navLink}>{SHOP_NAV[0].label}</a>
              <a href={SHOP_NAV[1].href} className={navLink}>{SHOP_NAV[1].label}</a>
              <BrandsMenu />
              <a href={SHOP_NAV[2].href} className={navLink}>{SHOP_NAV[2].label}</a>
            </nav>
            <a
              href={SHOP.seiko}
              aria-label="Shop Seiko at Tiny Hour Tales"
              className="grid h-11 w-11 place-items-center text-[var(--ink)] hover:text-[var(--maroon)] min-[1180px]:hidden"
            >
              <IconBag />
            </a>
          </div>
        </div>
      </header>

      {/* Drawer */}
      <div id="site-drawer" className={cn("fixed inset-0 z-[60] flex", !open && "hidden")} hidden={!open}>
        <div className="absolute inset-0 bg-[rgba(30,23,20,.45)]" onClick={close} aria-hidden="true" />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="relative flex h-full w-[min(86vw,380px)] flex-col overflow-y-auto bg-[var(--ivory)] px-6 pb-8 pt-3 shadow-[12px_0_40px_rgba(30,23,20,.2)]"
        >
          <button
            ref={closeBtn}
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="-mr-2.5 grid h-11 w-11 place-items-center self-end text-[var(--ink)] hover:text-[var(--maroon)]"
          >
            <IconClose />
          </button>

          <p className="label mt-1">The Almanac</p>
          <nav aria-label="Almanac" className="mt-1 flex flex-col">
            {DRAWER_ALMANAC.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block border-b border-[var(--line)] py-3.5 font-serif text-[26px] leading-8 text-[var(--ink)]",
                    active && "text-[var(--maroon)]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <p className="label mt-8">Tiny Hour Tales</p>
          <ul className="mt-1">
            {SHOP_NAV.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="block py-2.5 text-[16px] text-[var(--ink)] hover:text-[var(--maroon)]">{l.label}</a>
              </li>
            ))}
          </ul>

          <p className="label mt-6">Brands</p>
          <ul className="mt-1 flex flex-wrap gap-x-5">
            {SHOP_BRANDS.map((b) => (
              <li key={b.href}>
                <a href={b.href} className="inline-block py-2.5 text-[16px] text-[var(--ink)] hover:text-[var(--maroon)]">{b.label}</a>
              </li>
            ))}
          </ul>

          <ul className="mt-6 border-t border-[var(--line)] pt-2">
            <li>
              <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className="caps block py-3 !text-[12px] text-[var(--text)] hover:text-[var(--maroon)]">
                WhatsApp <span className="whitespace-nowrap">{CONTACT.whatsappDisplay}</span>
              </a>
            </li>
            <li>
              <Link href="/contact" onClick={() => setOpen(false)} className="caps block py-3 !text-[12px] text-[var(--text)] hover:text-[var(--maroon)]">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
