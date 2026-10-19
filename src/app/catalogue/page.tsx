import Link from "next/link";
import { Container, ButtonLink, SectionHead } from "@/components/ui";
import { PageHeader } from "@/components/page";
import { CATALOGUES, CATALOGUE_STATS } from "@/lib/catalogue";
import { MODEL_STATS } from "@/lib/modelIndex";
import { pageMeta } from "@/lib/meta";
import { SHOP } from "@/lib/site";

const S = CATALOGUE_STATS;

// A spread of covers across the decades for the archive teaser.
const TEASER = [1932, 1969, 1974, 1984, 2005, 2020]
  .map((y) => CATALOGUES.find((c) => c.year === y))
  .filter((c): c is (typeof CATALOGUES)[number] => !!c);

export const metadata = pageMeta({
  title: "Seiko Catalogue",
  description: `A searchable library drawn from ${S.count} original Seiko catalogues spanning ${S.earliest}–${S.latest} — Seiko 5, Prospex, King & Grand Seiko, Credor and vintage, model by model.`,
  path: "/catalogue",
});

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
        eyebrow="The Archive"
        title={<>Ninety years of Seiko, <em>catalogued</em></>}
        lead={`A library built from ${S.count} original Seiko catalogues spanning ${S.earliest}–${S.latest}. We’re reading them line by line — every reference on these pages comes from the source.`}
      />
      <Container className="py-14">
        <div className="grid gap-px border border-[var(--line)] bg-[var(--line)] lg:grid-cols-2">
          <Link href="/catalogue/archive" className="group flex flex-col justify-between gap-8 bg-[var(--surface)] p-7 transition-colors hover:bg-[var(--sand)] sm:p-9">
            <div>
              <p className="label">Browse the archive</p>
              <h2 className="mt-3 font-serif text-[30px] leading-9 text-[var(--ink)] group-hover:text-[var(--maroon)]">All {S.count} catalogues, searchable</h2>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[var(--ink-muted)]">
                Covers, model references and calibers from {S.earliest}–{S.latest} — search by year, reference (SLA037) or movement.
              </p>
            </div>
            <div className="flex -space-x-5">
              {TEASER.map((c, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={c.id}
                  src={c.cover}
                  alt=""
                  aria-hidden="true"
                  width={96}
                  height={128}
                  loading="lazy"
                  className="h-32 w-24 border border-[var(--line)] object-cover object-top shadow-[0_12px_24px_-16px_rgba(43,7,16,.6)]"
                  style={{ rotate: `${(i - 2.5) * 3}deg`, zIndex: i }}
                />
              ))}
            </div>
          </Link>
          <Link href="/catalogue/models" className="group flex flex-col justify-between gap-8 bg-[var(--surface)] p-7 transition-colors hover:bg-[var(--sand)] sm:p-9">
            <div>
              <p className="label">Browse by model</p>
              <h2 className="mt-3 font-serif text-[30px] leading-9 text-[var(--ink)] group-hover:text-[var(--maroon)]">
                {MODEL_STATS.unique.toLocaleString("en-US")} references, one page each
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[var(--ink-muted)]">
                Read from {MODEL_STATS.catalogues} catalogues so far — {MODEL_STATS.withCaliber.toLocaleString("en-US")} with an
                identified caliber, each linked to similar models and the decoder.
              </p>
            </div>
            <span className="caps !text-[12px] text-[var(--maroon)]">
              <span className="border-b border-[var(--maroon)] pb-1">Search models</span>
            </span>
          </Link>
        </div>

        <SectionHead className="mt-20" eyebrow="By family" title={<>The lines we’re <em>cataloguing</em></>} />
        <div className="mt-8 grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
          {LINES.map((l) => (
            <div key={l.name} className="flex flex-col gap-2 bg-[var(--ivory)] p-7">
              <h3 className="font-serif text-[24px] leading-8 text-[var(--ink)]">{l.name}</h3>
              <p className="text-[15px] leading-relaxed text-[var(--ink-muted)]">{l.desc}</p>
              <span className="mt-auto pt-3 text-[12px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">{l.years}</span>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-[var(--sand)] p-7 sm:p-10">
          <p className="label">From the source</p>
          <h2 className="mt-3 max-w-2xl font-serif text-[30px] leading-9 text-[var(--ink)]">Built from the original catalogues</h2>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-[var(--ink-muted)]">
            Every entry is drawn straight from period Seiko catalogues — many of them Japanese-domestic (JDM)
            editions — so references, calibers and prices come from the source, not hearsay. The browsable
            scan archive lands in stages.
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-[var(--line-2)] pt-6 sm:grid-cols-4">
            {[
              { n: String(S.count), l: "Catalogues" },
              { n: S.pages.toLocaleString("en-US"), l: "Pages" },
              { n: String(S.earliest), l: "Earliest" },
              { n: String(S.latest), l: "Latest" },
            ].map((x) => (
              <div key={x.l} className="flex flex-col">
                <dt className="order-2 text-[12px] uppercase tracking-[0.16em] text-[var(--muted)]">{x.l}</dt>
                <dd className="order-1 font-serif text-[32px] leading-10 text-[var(--maroon)]">{x.n}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/catalogue/archive">Browse All {S.count} Catalogues</ButtonLink>
            <ButtonLink href={SHOP.seiko} variant="outline">Shop Seiko</ButtonLink>
          </div>
        </div>
      </Container>
    </>
  );
}
