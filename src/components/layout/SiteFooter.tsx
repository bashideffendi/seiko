import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CoBrand } from "@/components/brand";

const COLUMNS = [
  {
    title: "Tools",
    links: [
      { label: "Serial Decoder", href: "/tools/serial-decoder" },
      { label: "Caliber Lookup", href: "/tools/caliber-lookup" },
      { label: "Model Finder", href: "/tools/model-finder" },
      { label: "Strap Size", href: "/tools/strap-size" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Catalogue", href: "/catalogue" },
      { label: "Learn", href: "/learn" },
      { label: "Stories", href: "/stories" },
    ],
  },
  {
    title: "Tiny Hour Tales",
    links: [
      { label: "About", href: "/about" },
      { label: "Disclaimer & Sources", href: "/disclaimer" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--border)] bg-[var(--surface-2)]">
      <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
        <div className="max-w-xs">
          <CoBrand variant="mark" seikoHeight={16} />
          <p className="mt-4 font-serif text-xl text-[var(--ink)]">
            Seiko <span className="italic text-[var(--burgundy-700)]">Almanac</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">
            A field guide to Seiko — serial decoding, caliber references, and decades of
            catalogue, kept by{" "}
            <a
              href="https://www.tinyhourtales.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--burgundy-700)] underline decoration-[var(--gold-500)] underline-offset-2"
            >
              Tiny Hour Tales
            </a>
            .
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="label mb-3">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-[var(--ink-muted)] transition-colors hover:text-[var(--burgundy-700)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-[1180px] flex-col items-start justify-between gap-2 px-5 py-5 sm:flex-row sm:items-center sm:px-8 lg:px-10">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
            © {new Date().getFullYear()} Tiny Hour Tales · Not affiliated with Seiko Watch Corp.
          </p>
          <a
            href="https://www.tinyhourtales.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--burgundy-700)]"
          >
            Visit the shop <ArrowUpRight size={13} strokeWidth={2.2} />
          </a>
        </div>
      </div>
    </footer>
  );
}
