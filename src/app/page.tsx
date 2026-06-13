import Link from "next/link";
import {
  Binary,
  Cog,
  Search,
  Ruler,
  BatteryMedium,
  Library,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import { Container, Eyebrow, Badge, ButtonLink } from "@/components/ui";
import { CoBrand } from "@/components/brand";
import { SerialDecoder } from "@/components/decoder/SerialDecoder";

const TOOLS = [
  { href: "/tools/serial-decoder", icon: Binary, name: "Serial Decoder", desc: "Date any Seiko from its caseback serial.", live: true },
  { href: "/tools/caliber-lookup", icon: Cog, name: "Caliber Lookup", desc: "Movement specs & production windows.", live: true },
  { href: "/tools/model-finder", icon: Search, name: "Model Finder", desc: "Identify a watch from its features.", live: false },
  { href: "/tools/strap-size", icon: Ruler, name: "Strap Size", desc: "Lug width & strap recommendations.", live: false },
  { href: "/tools/battery-estimator", icon: BatteryMedium, name: "Battery Estimator", desc: "Quartz battery age & change reminders.", live: false },
];

const ERAS = ["1932", "1960s JDM", "1969 Divers", "1970s Chrono", "1984", "Grand Seiko", "2020 Prospex"];

export default function HomePage() {
  return (
    <>
      {/* ===== Hero — the hub ===== */}
      <section className="border-b border-[var(--border)]">
        <Container className="flex flex-col items-center pb-16 pt-16 text-center sm:pt-20">
          <div className="rise" style={{ animationDelay: "0ms" }}>
            <CoBrand variant="full" seikoHeight={26} />
          </div>
          <p className="rise label mt-9" style={{ animationDelay: "70ms" }}>
            A Tiny Hour Tales reference desk
          </p>
          <h1
            className="rise mt-4 max-w-4xl font-serif text-[2.7rem] leading-[1.04] text-[var(--ink)] sm:text-[4.1rem]"
            style={{ animationDelay: "130ms", fontWeight: 400 }}
          >
            Read any Seiko — by{" "}
            <span className="italic text-[var(--burgundy-700)]">serial</span>,{" "}
            <span className="italic text-[var(--burgundy-700)]">caliber</span> &amp;{" "}
            <span className="italic text-[var(--burgundy-700)]">catalogue</span>.
          </h1>
          <p
            className="rise mt-6 max-w-xl text-[1.08rem] leading-relaxed text-[var(--ink-muted)]"
            style={{ animationDelay: "200ms" }}
          >
            Decode a caseback serial, look up a movement, and trace any model through ninety years
            of original Seiko catalogue. Built for collectors, kept by a watch shop.
          </p>
          <div className="rise mt-9 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "270ms" }}>
            <ButtonLink href="/tools" variant="primary">Open the tools</ButtonLink>
            <ButtonLink href="/catalogue" variant="outline">Browse the catalogue</ButtonLink>
          </div>
        </Container>
      </section>

      {/* ===== Tools ===== */}
      <section className="border-b border-[var(--border)]">
        <Container className="py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <Eyebrow>The bench</Eyebrow>
              <h2 className="mt-2 font-serif text-3xl text-[var(--ink)] sm:text-4xl" style={{ fontWeight: 400 }}>Tools</h2>
            </div>
            <Link href="/tools" className="hidden items-center gap-1.5 text-sm font-medium text-[var(--burgundy-700)] hover:text-[var(--burgundy-600)] sm:inline-flex">
              All tools <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              return (
                <Link key={t.href} href={t.href} className="group flex flex-col gap-3 bg-[var(--surface)] p-6 transition-colors hover:bg-[var(--surface-2)]">
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--burgundy-700)] transition-colors group-hover:border-[var(--gold-400)]">
                      <Icon size={20} strokeWidth={1.6} />
                    </span>
                    {t.live ? <Badge variant="gold">Live</Badge> : <Badge variant="default">Soon</Badge>}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-[var(--ink)]" style={{ fontWeight: 400 }}>{t.name}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--ink-muted)]">{t.desc}</p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-[var(--burgundy-700)] opacity-0 transition-opacity group-hover:opacity-100">
                    Open <ArrowRight size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ===== Serial decoder feature ===== */}
      <section className="border-b border-[var(--border)] bg-[var(--surface-2)]">
        <Container className="py-16">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Most-used tool</Eyebrow>
            <h2 className="mt-2 font-serif text-3xl text-[var(--ink)] sm:text-4xl" style={{ fontWeight: 400 }}>
              Decode a serial in <span className="italic text-[var(--burgundy-700)]">seconds</span>
            </h2>
            <p className="mt-3 text-[1.02rem] leading-relaxed text-[var(--ink-muted)]">
              The number engraved on the caseback tells you the month and year it was made — entirely in your browser.
            </p>
          </div>
          <div className="mt-9">
            <SerialDecoder />
          </div>
        </Container>
      </section>

      {/* ===== Catalogue teaser ===== */}
      <section className="border-b border-[var(--border)]">
        <Container className="py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <Eyebrow>The archive</Eyebrow>
              <h2 className="mt-2 font-serif text-3xl leading-tight text-[var(--ink)] sm:text-4xl" style={{ fontWeight: 400 }}>
                Ninety years of Seiko, <span className="italic text-[var(--burgundy-700)]">catalogued</span>.
              </h2>
              <p className="mt-4 max-w-md text-[1.02rem] leading-relaxed text-[var(--ink-muted)]">
                A growing, searchable library drawn from
                <span className="font-mono text-[var(--burgundy-700)]"> 125 </span>
                original Seiko catalogues — search by year, model reference or caliber.
              </p>
              <Link href="/catalogue" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--burgundy-700)] hover:text-[var(--burgundy-600)]">
                Explore the catalogue <ArrowRight size={15} />
              </Link>
            </div>

            <div className="crop rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface)] p-7">
              <div className="flex items-center gap-2 text-[var(--gold-600)]">
                <Library size={16} />
                <span className="label">Spanning</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {ERAS.map((e) => (
                  <span key={e} className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-1.5 font-mono text-[0.78rem] text-[var(--ink-muted)]">{e}</span>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-[var(--border)] pt-6">
                {[
                  { n: "125", l: "catalogues" },
                  { n: "1,260", l: "models" },
                  { n: "1932", l: "earliest" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="font-serif text-3xl text-[var(--burgundy-700)]" style={{ fontWeight: 400 }}>{s.n}</div>
                    <div className="label !text-[0.56rem]">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ===== Shop band ===== */}
      <section className="bg-[var(--surface)]">
        <Container className="flex flex-col items-start justify-between gap-7 py-16 sm:flex-row sm:items-center">
          <div>
            <CoBrand variant="mark" seikoHeight={18} />
            <h2 className="mt-5 font-serif text-3xl text-[var(--ink)] sm:text-4xl" style={{ fontWeight: 400 }}>
              Found the one you’ve been <span className="italic text-[var(--burgundy-700)]">chasing</span>?
            </h2>
            <p className="mt-2 max-w-md text-[var(--ink-muted)]">
              Curated vintage &amp; modern Seiko, serviced and ready to wear.
            </p>
          </div>
          <a
            href="https://www.tinyhourtales.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-[var(--radius)] bg-[var(--burgundy-700)] px-6 py-3 font-medium text-[var(--surface)] transition-colors hover:bg-[var(--burgundy-600)]"
          >
            Visit the shop <ArrowUpRight size={17} strokeWidth={2.2} />
          </a>
        </Container>
      </section>
    </>
  );
}
