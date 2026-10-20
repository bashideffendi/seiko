import Link from "next/link";
import { decoderCalibers } from "@/lib/seiko/attestation";
import { Container, ButtonLink, SectionHead, TextLink } from "@/components/ui";
import { SerialDecoder } from "@/components/decoder/SerialDecoder";
import { ShopShelf } from "@/components/shop/ShopShelf";
import { JsonLd } from "@/components/JsonLd";
import { CALIBERS } from "@/data/calibers";
import { CATALOGUES, CATALOGUE_STATS } from "@/lib/catalogue";
import { MODEL_STATS } from "@/lib/modelIndex";
import { CONTACT, SHOP, SITE_NAME, SITE_URL } from "@/lib/site";

// ISR: the "Available at Tiny Hour Tales" shelf re-reads the shop feed at most every 30 minutes.
export const revalidate = 1800;

const HERO_COVERS = ["1932-1932-seiko", "1969-1969-seiko-jdm-catalog-no-1", "1968-1968-seiko-jdm-catalog-no-1"]
  .map((id) => CATALOGUES.find((c) => c.id === id))
  .filter((c): c is (typeof CATALOGUES)[number] => !!c);

const TEASER = [1960, 1969, 1975, 1981, 1990, 2007]
  .map((y) => CATALOGUES.find((c) => c.year === y))
  .filter((c): c is (typeof CATALOGUES)[number] => !!c);

const SECTIONS = [
  { n: "01", href: "/tools/serial-decoder", name: "Year Finder", desc: "Date any Seiko from the serial on its caseback — with the caliber to settle the decade." },
  { n: "02", href: "/tools/caliber-lookup", name: "Caliber Lookup", desc: `${CALIBERS.length} movements with type, jewels and production window.` },
  { n: "03", href: "/catalogue/models", name: "Models", desc: `${MODEL_STATS.unique.toLocaleString("en-US")} references read from original catalogues, each with its own page.` },
  { n: "04", href: "/catalogue/archive", name: "Catalogue Archive", desc: `${CATALOGUE_STATS.count} Seiko catalogues, ${CATALOGUE_STATS.earliest}–${CATALOGUE_STATS.latest}, searchable by year, reference and caliber.` },
  { n: "05", href: "/tools/vintage-case-code", name: "Vintage Case Codes", desc: "Read the five-digit case codes of Seiko made before the 1966 serial scheme." },
  { n: "06", href: "/learn", name: "Learn", desc: "Short field guides — starting with what J, K and P on a Seiko reference really mean." },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: "Seiko serial decoder, caliber reference and original catalogue archive by Tiny Hour Tales.",
      inLanguage: "en",
      publisher: { "@id": "https://tinyhourtales.com/#organization" },
    },
    {
      "@type": "Organization",
      "@id": "https://tinyhourtales.com/#organization",
      name: "Tiny Hour Tales",
      url: SHOP.home,
      logo: `${SITE_URL}/brand/tht-logo.png`,
      email: CONTACT.email,
      sameAs: [CONTACT.instagramUrl],
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={JSON_LD} />

      {/* ===== Hero — split like the shop's: copy on sand, archive on linen ===== */}
      <section className="grid border-b border-[var(--line)] lg:min-h-[620px] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="order-2 flex items-center bg-[var(--sand)] px-[var(--gutter)] py-14 lg:order-1 lg:py-20">
          <div className="max-w-[520px]">
            <p className="rise label" style={{ animationDelay: "0ms" }}>The Seiko Almanac · by Tiny Hour Tales</p>
            <h1
              className="rise mt-5 font-serif text-[52px] leading-[1.02] text-[var(--maroon)] sm:text-[72px] lg:text-[84px]"
              style={{ animationDelay: "60ms" }}
            >
              Know your Seiko,
              <br />
              <em>by heart.</em>
            </h1>
            <p className="rise mt-6 text-[17px] leading-[1.75] text-[var(--text)]" style={{ animationDelay: "120ms" }}>
              Find the year your watch was made, look up its caliber, and trace it through ninety years of
              original Seiko catalogues — kept by the people who handpick every piece at Tiny Hour Tales.
            </p>
            <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "180ms" }}>
              <ButtonLink href="#year-finder" variant="primary">Find the Year</ButtonLink>
              <ButtonLink href="/catalogue" variant="outline">Browse the Catalogue</ButtonLink>
            </div>
          </div>
        </div>

        <div className="relative order-1 flex items-center justify-center overflow-hidden bg-[var(--linen)] px-6 py-12 lg:order-2 lg:py-16" aria-hidden="true">
          <div className="relative flex items-end justify-center">
            {HERO_COVERS.map((c, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={c.id}
                src={c.cover}
                alt=""
                width={480}
                height={680}
                fetchPriority={i === 1 ? "high" : undefined}
                decoding="async"
                className="w-[30vw] max-w-[250px] border border-[rgba(30,23,20,.08)] object-cover shadow-[0_28px_50px_-28px_rgba(43,7,16,.55)] sm:w-[200px] lg:w-[min(16vw,250px)]"
                style={{
                  aspectRatio: "480 / 680",
                  rotate: `${(i - 1) * 6}deg`,
                  translate: `${(i - 1) * 6}% ${i === 1 ? "-6%" : "0"}`,
                  zIndex: i === 1 ? 3 : 1,
                  marginInline: i === 1 ? "-1.5rem" : 0,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== Trust strip — the shop's row of reassurances, in Almanac terms ===== */}
      <section className="border-b border-[var(--line)] bg-[var(--ivory)]">
        <Container>
          <dl className="grid grid-cols-2 lg:grid-cols-4">
            {[
              { k: "Calibers", v: CALIBERS.length.toLocaleString("en-US") },
              { k: "Catalogued references", v: MODEL_STATS.unique.toLocaleString("en-US") },
              { k: "Original catalogues", v: String(CATALOGUE_STATS.count) },
              { k: "Years covered", v: `${CATALOGUE_STATS.earliest}–${CATALOGUE_STATS.latest}` },
            ].map((s, i) => (
              <div
                key={s.k}
                className={`flex flex-col gap-1 py-6 ${i % 2 === 1 ? "pl-5 sm:pl-8" : ""} ${i > 1 ? "border-t border-[var(--line)] lg:border-t-0" : ""} ${i > 0 ? "lg:border-l lg:border-[var(--line)] lg:pl-8" : ""}`}
              >
                <dt className="order-2 text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">{s.k}</dt>
                <dd className="order-1 font-serif text-[30px] leading-9 text-[var(--ink)]">{s.v}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* ===== Year Finder ===== */}
      <section id="year-finder" className="scroll-mt-24 border-b border-[var(--line)]">
        <Container className="py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.6fr)] lg:gap-16">
            <div>
              <SectionHead eyebrow="Year Finder" title={<>When was it <em>made?</em></>} />
              <p className="mt-4 max-w-md text-[16px] leading-[1.7] text-[var(--ink-muted)]">
                The serial on a Seiko caseback carries the month and the last digit of the year it was made.
                Add the caliber and the Almanac works out the decade — and tells you honestly when it can’t.
              </p>
              <div className="mt-6">
                <TextLink href="/tools/serial-decoder">Open the full decoder</TextLink>
              </div>
            </div>
            <SerialDecoder calibers={decoderCalibers()} idPrefix="home" />
          </div>
        </Container>
      </section>

      {/* ===== Available at Tiny Hour Tales (live shop feed; hidden if unavailable) ===== */}
      <Container className="border-b border-[var(--line)] py-16 lg:py-24">
        <ShopShelf mode="home" limit={8} />
      </Container>

      {/* ===== The Almanac — index of sections ===== */}
      <section className="border-b border-[var(--line)]">
        <Container className="py-16 lg:py-24">
          <SectionHead eyebrow="The Almanac" title={<>Everything we keep <em>on the bench</em></>} />
          <div className="mt-10 grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map((s) => (
              <Link key={s.href} href={s.href} className="group flex flex-col bg-[var(--ivory)] p-7 transition-colors hover:bg-[var(--surface)] sm:p-9">
                <span className="font-serif text-[15px] italic text-[var(--muted)]">{s.n}</span>
                <h3 className="mt-3 font-serif text-[26px] leading-8 text-[var(--ink)] transition-colors group-hover:text-[var(--maroon)]">{s.name}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-muted)]">{s.desc}</p>
                <span className="caps mt-6 !text-[11px] text-[var(--maroon)]">
                  <span className="border-b border-transparent pb-0.5 transition-colors group-hover:border-[var(--maroon)]">Open</span>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ===== Catalogue teaser ===== */}
      <section>
        <Container className="py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
            <div>
              <SectionHead eyebrow="The Archive" title={<>Ninety years of Seiko, <em>catalogued</em></>} />
              <p className="mt-4 max-w-md text-[16px] leading-[1.7] text-[var(--ink-muted)]">
                {CATALOGUE_STATS.count} original Seiko catalogues and {CATALOGUE_STATS.pages.toLocaleString("en-US")} pages,
                from a 1932 price list to the 2020 collections — the source for every reference on these pages, not
                second-hand lists.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/catalogue/archive" variant="primary">Open the Archive</ButtonLink>
                <ButtonLink href="/catalogue/models" variant="outline">Browse Models</ButtonLink>
              </div>
            </div>
            <Link href="/catalogue/archive" className="group grid grid-cols-3 gap-3 sm:gap-4" aria-label="Open the catalogue archive">
              {TEASER.map((c) => (
                <span key={c.id} className="block overflow-hidden border border-[var(--line)] bg-[var(--stone)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.cover}
                    alt={`${c.yearLabel} ${c.title} cover`}
                    width={480}
                    height={640}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[3/4] w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </span>
              ))}
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
