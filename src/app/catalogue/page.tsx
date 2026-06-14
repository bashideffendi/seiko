import type { Metadata } from "next";
import Link from "next/link";
import { Library, Cog, ArrowUpRight, ArrowRight } from "lucide-react";
import { Container, Eyebrow, Badge } from "@/components/ui";
import { PageHeader } from "@/components/page";
import { CATALOGUES, CATALOGUE_STATS } from "@/lib/catalogue";
import { MODEL_STATS } from "@/lib/modelIndex";

// A spread of covers across the decades for the archive teaser.
const TEASER = [1932, 1969, 1974, 1984, 2005, 2020]
  .map((y) => CATALOGUES.find((c) => c.year === y))
  .filter(Boolean)
  .slice(0, 6) as (typeof CATALOGUES)[number][];

export const metadata: Metadata = {
  title: "Catalogue",
  description:
    "A growing, searchable library drawn from 125 original Seiko catalogues spanning 1932–2020 — Seiko 5, Prospex, Presage, Grand Seiko and vintage.",
};

const LINES = [
  { name: "Seiko 5", desc: "The everyman automatic — Seiko 5 & 5 Sports.", years: "1963–now" },
  { name: "Prospex", desc: "Divers, land and sea — SKX, Turtle, Samurai, Marinemaster.", years: "1965–now" },
  { name: "Presage", desc: "Dress automatics & cocktail-time enamel dials.", years: "2016–now" },
  { name: "King & Grand Seiko", desc: "The high-beat, Spring Drive and 9F flagships.", years: "1960–now" },
  { name: "Vintage", desc: "Seikomatic, Bell-Matic, 6105, 6139 chronographs.", years: "1960s–80s" },
  { name: "Credor", desc: "Seiko’s haute-horlogerie luxury house.", years: "1974–now" },
];

export default function CataloguePage() {
  return (
    <>
      <PageHeader
        eyebrow="The archive"
        title={<>Ninety years of Seiko, <span className="italic text-[var(--burgundy-600)]">catalogued</span></>}
        lead="A library built from 125 original Seiko catalogues spanning 1932–2020. We’re digitising them line by line — start with the families below."
      />
      <Container className="py-14">
        {/* Archive teaser */}
        <Link
          href="/catalogue/archive"
          className="group crop block rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface)] p-6 transition-colors hover:bg-[var(--surface-2)] sm:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-md">
              <Eyebrow>Browse the archive</Eyebrow>
              <h2 className="mt-2 font-serif text-2xl text-[var(--burgundy-800)] sm:text-3xl">
                All {CATALOGUE_STATS.count} catalogues, searchable
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
                Covers, model references and calibers from {CATALOGUE_STATS.earliest}–{CATALOGUE_STATS.latest} —
                search by year, reference (SLA037) or movement.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--burgundy-700)]">
                Open the archive <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
            <div className="flex shrink-0 -space-x-6">
              {TEASER.map((c, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={c.id}
                  src={c.cover}
                  alt=""
                  aria-hidden="true"
                  className="h-32 w-24 rounded-[var(--radius)] border border-[var(--border)] object-cover object-top shadow-[0_10px_24px_-16px_rgba(32,22,15,0.8)] transition-transform duration-300 group-hover:translate-y-0"
                  style={{ rotate: `${(i - 2.5) * 4}deg`, zIndex: i }}
                />
              ))}
            </div>
          </div>
        </Link>

        {/* Browse by model */}
        <Link
          href="/catalogue/models"
          className="group mt-4 flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 transition-colors hover:bg-[var(--surface-2)]"
        >
          <div className="flex items-center gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--burgundy-700)] transition-colors group-hover:border-[var(--gold-400)]">
              <Cog size={20} strokeWidth={1.6} />
            </span>
            <div>
              <h3 className="font-serif text-xl text-[var(--burgundy-800)]">Browse by model</h3>
              <p className="mt-0.5 text-sm text-[var(--ink-muted)]">
                {MODEL_STATS.unique.toLocaleString()} references, each with its own page &amp; similar models.
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="shrink-0 text-[var(--burgundy-700)] transition-transform group-hover:translate-x-1" />
        </Link>

        <div className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
          {LINES.map((l) => (
            <div key={l.name} className="flex flex-col gap-2 bg-[var(--surface)] p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl text-[var(--burgundy-800)]">{l.name}</h3>
                <Badge>Cataloguing</Badge>
              </div>
              <p className="text-sm leading-relaxed text-[var(--ink-muted)]">{l.desc}</p>
              <span className="mt-auto font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                {l.years}
              </span>
            </div>
          ))}
        </div>

        {/* archive note */}
        <div className="crop mt-12 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface)] p-7">
          <div className="flex items-center gap-2.5 text-[var(--gold-700)]">
            <Library size={18} />
            <Eyebrow className="!text-[var(--gold-700)]">From the source</Eyebrow>
          </div>
          <h2 className="mt-3 max-w-2xl font-serif text-2xl text-[var(--burgundy-800)] sm:text-3xl">
            Built from the original catalogues
          </h2>
          <p className="mt-3 max-w-2xl text-[1rem] leading-relaxed text-[var(--ink-muted)]">
            Every entry is drawn straight from period Seiko catalogues — many of them Japanese-domestic
            (JDM) editions — so references, calibers and prices come from the source, not hearsay. The
            browsable scan archive and per-model pages are landing in stages.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-6 border-t border-[var(--border)] pt-6 sm:grid-cols-4">
            {[
              { n: "125", l: "catalogues" },
              { n: "8,749", l: "pages" },
              { n: "1932", l: "earliest" },
              { n: "2020", l: "latest" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-serif text-3xl text-[var(--burgundy-700)]">{s.n}</div>
                <div className="label !text-[0.56rem]">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/catalogue/archive"
              className="inline-flex items-center gap-1.5 rounded-[var(--radius)] bg-[var(--burgundy-700)] px-4 py-2.5 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[var(--burgundy-600)]"
            >
              Browse all {CATALOGUE_STATS.count} catalogues <ArrowRight size={15} strokeWidth={2.2} />
            </Link>
            <a
              href="https://www.tinyhourtales.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-[var(--gold-500)] px-4 py-2.5 text-sm font-medium text-[var(--burgundy-800)] transition-colors hover:bg-[var(--gold-100)]"
            >
              Shop catalogued pieces <ArrowUpRight size={15} strokeWidth={2.2} />
            </a>
          </div>
        </div>
      </Container>
    </>
  );
}
