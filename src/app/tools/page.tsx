import Link from "next/link";
import { Container, Badge } from "@/components/ui";
import { PageHeader } from "@/components/page";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta({
  title: "Seiko Tools",
  description: "Free Seiko tools for collectors: serial-number year finder, caliber lookup and pre-1966 case-code reader. Everything runs in your browser.",
  path: "/tools",
});

const TOOLS = [
  { href: "/tools/serial-decoder", name: "Year Finder", desc: "Decode the production month and year from any Seiko caseback serial, with caliber-based decade narrowing.", live: true },
  { href: "/tools/caliber-lookup", name: "Caliber Lookup", desc: "Search Seiko movements by number — type, jewels, production window and notes.", live: true },
  { href: "/tools/vintage-case-code", name: "Vintage Case Codes", desc: "Decode a pre-1966 five-digit case code — ligne dial size, family, and the model for known codes.", live: true },
  { href: "/tools/model-finder", name: "Model Finder", desc: "Narrow down a model from its dial, case and bracelet characteristics.", live: false },
  { href: "/tools/strap-size", name: "Strap Size", desc: "Look up lug width by reference and get strap-style recommendations.", live: false },
  { href: "/tools/battery-estimator", name: "Battery Estimator", desc: "Estimate remaining quartz battery life and set a change reminder.", live: false },
];

export default function ToolsPage() {
  return (
    <>
      <PageHeader
        eyebrow="The bench"
        title={<>Tools for reading a <em>Seiko</em></>}
        lead="Small, precise utilities for collectors. Everything runs in your browser — nothing you type leaves the page."
      />
      <Container className="py-14">
        <div className="grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => (
            <Link key={t.href} href={t.href} className="group flex flex-col bg-[var(--ivory)] p-7 transition-colors hover:bg-[var(--surface)] sm:p-9">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-serif text-[26px] leading-8 text-[var(--ink)] group-hover:text-[var(--maroon)]">{t.name}</h2>
                {t.live ? <Badge variant="outline">Live</Badge> : <Badge>Soon</Badge>}
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-muted)]">{t.desc}</p>
              <span className="caps mt-6 !text-[11px] text-[var(--maroon)]">
                <span className="border-b border-transparent pb-0.5 group-hover:border-[var(--maroon)]">{t.live ? "Open" : "Preview"}</span>
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
