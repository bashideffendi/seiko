import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow, Badge, ButtonLink } from "@/components/ui";
import { ShopShelf } from "@/components/shop/ShopShelf";
import { JsonLd } from "@/components/JsonLd";
import { findCaliber } from "@/data/calibers";
import { caliberSlug } from "@/lib/seiko/caliberKey";
import { ALL_MODEL_ENTRIES, findModelBySlug, isPageWorthy, similarModels } from "@/lib/modelIndex";
import { pageMeta } from "@/lib/meta";
import { readerHref, scanFor, scanPage } from "@/lib/scans";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;
// ISR for the "Available at Tiny Hour Tales" shelf (shop feed, 30 min).
export const revalidate = 1800;

export function generateStaticParams() {
  return ALL_MODEL_ENTRIES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = findModelBySlug(slug);
  if (!e) return { title: "Model not found" };
  const cal = e.caliber ? ` · caliber ${e.caliber}` : "";
  return pageMeta({
    title: `Seiko ${e.ref}`,
    description: `Seiko reference ${e.ref}${cal} — catalogued from original Seiko material${
      e.years.length ? ` (${e.years.join(", ")})` : ""
    }. Identifiers, catalogue specs and similar models.`,
    path: `/catalogue/model/${e.slug}`,
    // Thin, low-confidence fragments stay reachable but out of search indexes.
    noindex: !isPageWorthy(e),
  });
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function decadeOf(year: number) {
  return `${Math.floor(year / 10) * 10}s`;
}

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = findModelBySlug(slug);
  if (!entry) notFound();

  const ids = entry.ids;
  // Only link a caliber that actually has a page (dynamicParams=false would 404 otherwise).
  const calRecord = entry.caliber ? findCaliber(entry.caliber) : null;
  const idRows = [
    ids.marketingRef && { k: "Marketing ref", v: ids.marketingRef },
    ids.caseRef && { k: "Case–movement ref", v: ids.caseRef },
    entry.caliber && {
      k: "Caliber",
      v: entry.caliber,
      href: calRecord ? `/caliber/${caliberSlug(calRecord.caliber)}` : undefined,
    },
    ids.caseNumber && { k: "Case no.", v: ids.caseNumber },
    ids.caseDialCode && { k: "Case–dial code", v: ids.caseDialCode },
  ].filter(Boolean) as { k: string; v: string; href?: string }[];

  const wr = entry.wr === "WR" ? "Water resistant" : entry.wr;
  const specRows = [
    entry.dial && { k: "Dial", v: entry.dial },
    entry.case && { k: "Case", v: entry.case },
    entry.bracelet && (/\bstrap$/i.test(entry.bracelet)
      ? { k: "Strap", v: capitalize(entry.bracelet.replace(/\s*\bstrap$/i, "")) || "Strap" }
      : { k: "Bracelet", v: entry.bracelet }),
    entry.jewels != null && { k: "Jewels", v: `${entry.jewels}` },
    wr && { k: "Water resist.", v: wr },
    entry.price && { k: "List price", v: entry.price },
    entry.specs && { k: "Specs", v: entry.specs },
  ].filter(Boolean) as { k: string; v: string }[];

  // The few facts a collector checks first, shown beside the photo.
  const facts = [
    entry.case && { k: "Case", v: entry.wr === "WR" ? `${entry.case} · WR` : entry.case },
    entry.jewels != null && { k: "Jewels", v: `${entry.jewels}` },
    entry.dial && { k: "Dial", v: entry.dial },
    entry.price && { k: "List price", v: entry.price },
  ].filter(Boolean) as { k: string; v: string }[];
  const notes = capitalize(entry.notes ?? "");

  const similar = similarModels(entry);
  const photo = entry.photo;

  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Seiko Almanac", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Models", item: `${SITE_URL}/catalogue/models` },
      { "@type": "ListItem", position: 3, name: `Seiko ${entry.ref}`, item: `${SITE_URL}/catalogue/model/${entry.slug}` },
    ],
  };

  return (
    <>
      <JsonLd data={crumbs} />
      <header className="border-b border-[var(--line)]">
        <Container className="pb-12 pt-10 sm:pb-14 sm:pt-14">
          <nav aria-label="Breadcrumb" className="label">
            <Link href="/catalogue/models" className="hover:text-[var(--maroon)]">Models</Link>
            <span aria-hidden="true" className="mx-2">/</span>
            <span aria-current="page">{entry.ref}</span>
          </nav>
          <div className={photo ? "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-center lg:gap-16" : undefined}>
            <div>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Eyebrow>Model reference</Eyebrow>
                {entry.caliber && <Badge variant="gold">Cal. {entry.caliber}</Badge>}
                {entry.conf !== "high" && <Badge>{entry.conf} confidence</Badge>}
              </div>
              <h1 className="mt-3 font-serif text-[48px] leading-[1.04] text-[var(--ink)] sm:text-[72px]">
                <span className="sr-only">Seiko </span>{entry.ref}
              </h1>
              <p className="mt-4 max-w-2xl text-[17px] leading-[1.65] text-[var(--ink-muted)]">
                {entry.sections[0] ? <span className="capitalize">{entry.sections[0].toLowerCase()}</span> : "Seiko"}
                {entry.years.length > 0 && (
                  <> · catalogued {entry.years.length === 1 ? "in" : "across"}{" "}
                    <span className="font-mono text-[var(--maroon)]">{entry.years.join(" · ")}</span>
                  </>
                )}
              </p>
              {facts.length > 0 && (
                <dl className="mt-8 flex max-w-xl flex-wrap gap-x-10 gap-y-5 border-t border-[var(--line)] pt-6">
                  {facts.map((f) => (
                    <div key={f.k}>
                      <dt className="label !text-[10px]">{f.k}</dt>
                      <dd className="mt-1.5 font-mono text-[15px] text-[var(--ink)]">{f.v}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            {photo && (
              <figure className="mt-10 flex flex-col items-center lg:mt-8">
                {/* A clipping from the original page: the scan's own paper, a hairline and a soft shadow. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  width={photo.w}
                  height={photo.h}
                  alt={`Seiko ${entry.ref} as pictured in the ${photo.catalogTitle}, ${photo.pagePhrase}`}
                  fetchPriority="high"
                  decoding="async"
                  className="h-auto max-h-[360px] w-auto max-w-full border border-[var(--line)] shadow-[0_22px_40px_-28px_rgba(43,7,16,.55)] sm:max-h-[440px]"
                />
                <figcaption className="mt-5 flex flex-col items-center gap-3 text-center">
                  <span className="text-[13px] leading-5 text-[var(--ink-muted)]">
                    From the {photo.year} Seiko catalogue, {photo.pagePhrase}
                  </span>
                  <ButtonLink href={readerHref(photo.catalogId, photo.page, entry.slug)} variant="outline" size="sm">
                    View Page
                  </ButtonLink>
                </figcaption>
              </figure>
            )}
          </div>
        </Container>
      </header>

      <Container className="py-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div className="[&>h2:first-child]:mt-0">
            {idRows.length > 0 && (
              <>
                <h2 className="font-serif text-[28px] leading-9 text-[var(--ink)]">Identifiers</h2>
                <dl className="mt-4 grid grid-cols-1 gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2">
                  {idRows.map((r) => (
                    <div key={r.k} className="bg-[var(--surface)] px-4 py-4 sm:[&:last-child:nth-child(odd)]:col-span-2">
                      <dt className="label !text-[10px]">{r.k}</dt>
                      <dd className="mt-1.5 font-mono text-[15px] text-[var(--ink)]">
                        {r.href ? (
                          <Link href={r.href} className="border-b border-[var(--maroon)] text-[var(--maroon)] hover:text-[var(--maroon-deep)]">{r.v}</Link>
                        ) : r.v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </>
            )}

            {specRows.length > 0 && (
              <>
                <h2 className="mt-12 font-serif text-[28px] leading-9 text-[var(--ink)]">From the catalogue</h2>
                <dl className="mt-4 divide-y divide-[var(--line)] border border-[var(--line)] bg-[var(--surface)]">
                  {specRows.map((r) => (
                    <div key={r.k} className="flex gap-4 px-4 py-3.5">
                      <dt className="label w-32 shrink-0 !text-[10px] !leading-5">{r.k}</dt>
                      <dd className="text-[15px] text-[var(--ink)]">{r.v}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}

            {notes && (
              <p className="mt-6 text-[15px] leading-relaxed text-[var(--ink-muted)]">{notes}</p>
            )}

            <h2 className="mt-12 font-serif text-[28px] leading-9 text-[var(--ink)]">Appears in</h2>
            <ul className="mt-4 divide-y divide-[var(--line)] border border-[var(--line)] bg-[var(--surface)]">
              {entry.appearances.map((a, i) => {
                const set = scanFor(a.catalogId);
                const pg = set ? scanPage(set, a.record.page) : null;
                return (
                  <li key={a.catalogId + i} className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <span className="text-[15px] text-[var(--ink)]">{a.catalogTitle}</span>
                    {pg ? (
                      <Link
                        href={readerHref(a.catalogId, pg.n, a.record.photo ? entry.slug : null)}
                        className="shrink-0 font-mono text-[12px] text-[var(--maroon)] underline decoration-[var(--line-2)] underline-offset-4 hover:decoration-[var(--maroon)]"
                      >
                        p.{pg.label} · view page
                      </Link>
                    ) : (
                      <span className="font-mono text-[12px] text-[var(--ink-soft)]">p.{a.record.page}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <aside>
            <div className="lg:sticky lg:top-32">
              {entry.caliber && calRecord && (
                <div className="mb-8 bg-[var(--sand)] p-6">
                  <p className="font-serif text-[20px] leading-7 text-[var(--ink)]">Have a {entry.ref}? Date it from its serial.</p>
                  <div className="mt-4">
                    <ButtonLink href={`/tools/serial-decoder?caliber=${encodeURIComponent(calRecord.caliber)}`} size="sm">
                      Find the Year
                    </ButtonLink>
                  </div>
                </div>
              )}
              {similar.length > 0 && (
                <>
                  <p className="label">Similar models</p>
                  <div className="mt-3 divide-y divide-[var(--line)] border border-[var(--line)] bg-[var(--surface)]">
                    {similar.map((s) => (
                      <Link
                        key={s.slug}
                        href={`/catalogue/model/${s.slug}`}
                        className="group flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[var(--sand)]"
                      >
                        <span className="min-w-0">
                          <span className="block font-mono text-[14px] text-[var(--ink)] group-hover:text-[var(--maroon)]">{s.ref}</span>
                          <span className="block truncate text-[12px] text-[var(--ink-soft)]">
                            {[s.caliber ? `Cal. ${s.caliber}` : "", s.years[0] ? decadeOf(s.years[0]) : ""].filter(Boolean).join(" · ")}
                          </span>
                        </span>
                        <span aria-hidden="true" className="text-[var(--ink-soft)] group-hover:text-[var(--maroon)]">→</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
              <p className="mt-4 text-[12px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">Drawn from original Seiko catalogues</p>
            </div>
          </aside>
        </div>

        <ShopShelf
          mode="model"
          caliber={calRecord?.caliber ?? entry.caliber}
          caseRef={ids.caseRef}
          className="mt-20 border-t border-[var(--line)] pt-14"
        />
      </Container>
    </>
  );
}
