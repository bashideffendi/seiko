import Link from "next/link";
import type { Metadata } from "next";
import { Binary, Cog, Search, Ruler, BatteryMedium, ArrowRight } from "lucide-react";
import { Container, Badge } from "@/components/ui";
import { PageHeader } from "@/components/page";

export const metadata: Metadata = { title: "Tools" };

const TOOLS = [
  { href: "/tools/serial-decoder", icon: Binary, name: "Serial Decoder", desc: "Decode the production month & year from any Seiko caseback serial, with caliber-based decade narrowing.", live: true },
  { href: "/tools/caliber-lookup", icon: Cog, name: "Caliber Lookup", desc: "Search Seiko movements by number — type, jewels, production window and notes.", live: true },
  { href: "/tools/model-finder", icon: Search, name: "Model Finder", desc: "Narrow down a model from its dial, case and bracelet characteristics.", live: false },
  { href: "/tools/strap-size", icon: Ruler, name: "Strap Size", desc: "Look up lug width by reference and get strap-style recommendations.", live: false },
  { href: "/tools/battery-estimator", icon: BatteryMedium, name: "Battery Estimator", desc: "Estimate remaining quartz battery life and set a change reminder.", live: false },
];

export default function ToolsPage() {
  return (
    <>
      <PageHeader
        eyebrow="The bench"
        title={<>Tools for reading a <span className="italic text-[var(--burgundy-600)]">Seiko</span></>}
        lead="Small, precise utilities for collectors. Everything runs in your browser — nothing you type leaves the page."
      />
      <Container className="py-14">
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
          {TOOLS.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                className="group flex gap-5 bg-[var(--surface)] p-7 transition-colors hover:bg-[var(--surface-2)]"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--burgundy-700)] transition-colors group-hover:border-[var(--gold-500)]">
                  <Icon size={22} strokeWidth={1.6} />
                </span>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif text-xl text-[var(--burgundy-800)]">{t.name}</h3>
                    {t.live ? <Badge variant="gold">Live</Badge> : <Badge>Soon</Badge>}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-muted)]">{t.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--burgundy-700)]">
                    {t.live ? "Open" : "Preview"} <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </>
  );
}
