import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow, Badge, ButtonLink } from "@/components/ui";
import { ShopShelf } from "@/components/shop/ShopShelf";
import { JsonLd } from "@/components/JsonLd";
import { CALIBERS, findCaliber } from "@/data/calibers";
import { caliberSlug } from "@/lib/seiko/caliberKey";
import { modelsForCaliber, slugForRef } from "@/lib/modelIndex";
import { pageMeta } from "@/lib/meta";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;
// ISR for the "Available at Tiny Hour Tales" shelf (shop feed, 30 min).
export const revalidate = 1800;

export function generateStaticParams() {
  return CALIBERS.map((c) => ({ caliber: caliberSlug(c.caliber) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ caliber: string }>;
}): Promise<Metadata> {
  const { caliber } = await params;
  const c = findCaliber(caliber);
  if (!c) return { title: "Caliber not found" };
  const up = c.caliber;
  return pageMeta({
    title: `Seiko caliber ${up}`,
    description: `Seiko ${up} — ${c.movementType.replace("-", " ")} movement${
      c.jewels ? `, ${c.jewels} jewels` : ""
    }, produced ${c.startYear}–${c.endYear ?? "present"}. Specs, notable references, catalogued models and a serial decoder pre-set for the ${up}.`,
    path: `/caliber/${caliberSlug(up)}`,
  });
}

function decadeOf(year: number) {
  return `${Math.floor(year / 10) * 10}s`;
}

export default async function CaliberPage({
  params,
}: {
  params: Promise<{ caliber: string }>;
}) {
  const { caliber } = await params;
  const c = findCaliber(caliber);
  if (!c) notFound();

  const up = c.caliber;
  const models = modelsForCaliber(c.caliber);

  const spec = [
    { k: "Type", v: c.movementType.replace("-", " ") },
    { k: "Jewels", v: c.jewels != null ? `${c.jewels}` : "—" },
    { k: "Produced", v: `${c.startYear}–${c.endYear ?? "present"}${c.rangeConfidence === "approximate" ? " (approx.)" : ""}` },
    { k: "Family", v: c.family ?? "—" },
  ];

  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Seiko Almanac", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Calibers", item: `${SITE_URL}/tools/caliber-lookup` },
      { "@type": "ListItem", position: 3, name: `Caliber ${up}`, item: `${SITE_URL}/caliber/${caliberSlug(up)}` },
    ],
  };

  return (
    <>
      <JsonLd data={crumbs} />
      <header className="border-b border-[var(--line)]">
        <Container className="pb-12 pt-10 sm:pb-14 sm:pt-14">
          <nav aria-label="Breadcrumb" className="label">
            <Link href="/tools/caliber-lookup" className="hover:text-[var(--maroon)]">Calibers</Link>
            <span aria-hidden="true" className="mx-2">/</span>
            <span aria-current="page">{up}</span>
          </nav>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Eyebrow>Movement reference</Eyebrow>
            {c.grandSeiko && <Badge variant="burgundy">Grand Seiko</Badge>}
            {c.longRun && <Badge>Long production run</Badge>}
          </div>
          <h1 className="mt-3 font-serif text-[56px] leading-none text-[var(--ink)] sm:text-[80px]">
            <span className="sr-only">Seiko caliber </span>{up}
          </h1>
          {c.notes && <p className="mt-5 max-w-2xl text-[17px] leading-[1.65] text-[var(--ink-muted)]">{c.notes}</p>}
        </Container>
      </header>

      <Container className="py-12 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-stretch">
          <dl className="grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-4">
            {spec.map((s) => (
              <div key={s.k} className="bg-[var(--surface)] px-4 py-4">
                <dt className="label !text-[10px]">{s.k}</dt>
                <dd className="mt-1.5 font-mono text-[15px] capitalize text-[var(--ink)]">{s.v}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-col justify-between gap-4 bg-[var(--sand)] p-6">
            <p className="font-serif text-[22px] leading-7 text-[var(--ink)]">Have a {up}? Find the year it was made.</p>
            <div>
              <ButtonLink href={`/tools/serial-decoder?caliber=${encodeURIComponent(up)}`} size="sm">
                Date a {up} by Serial
              </ButtonLink>
            </div>
          </div>
        </div>

        {c.notableRefs && c.notableRefs.length > 0 && (
          <div className="mt-12">
            <p className="label">Notable references</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {c.notableRefs.map((r) => {
                const slug = slugForRef(r.split(" ")[0]);
                const inner = (
                  <span className="inline-block border border-[var(--line-2)] bg-[var(--surface)] px-3 py-1.5 font-mono text-[13px] text-[var(--text)]">
                    {r}
                  </span>
                );
                return slug ? (
                  <Link key={r} href={`/catalogue/model/${slug}`} className="transition-colors hover:[&>span]:border-[var(--maroon)]">{inner}</Link>
                ) : (
                  <span key={r}>{inner}</span>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-14">
          <div className="flex items-center gap-4">
            <h2 className="font-serif text-[30px] leading-9 text-[var(--ink)]">In the catalogue</h2>
            <span className="h-px flex-1 bg-[var(--line)]" />
            <Badge>{models.length} models</Badge>
          </div>

          {models.length > 0 ? (
            <div className="mt-6 grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
              {models.map((m) => (
                <Link
                  key={m.slug}
                  href={`/catalogue/model/${m.slug}`}
                  className="group flex flex-col bg-[var(--surface)] p-4 transition-colors hover:bg-[var(--sand)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[15px] text-[var(--ink)] group-hover:text-[var(--maroon)]">{m.ref}</span>
                    {m.years[0] && <span className="text-[12px] text-[var(--ink-soft)]">{decadeOf(m.years[0])}</span>}
                  </div>
                  <span className="mt-1 line-clamp-1 text-[13px] text-[var(--ink-muted)]">
                    {[m.dial, m.case].filter(Boolean).join(" · ") || m.sections[0]?.toLowerCase() || "—"}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-6 border border-dashed border-[var(--line-2)] px-6 py-8 text-[15px] leading-relaxed text-[var(--ink-muted)]">
              No models with the {up} are in the catalogued sets yet — the extracted catalogues are mostly 1968–1977
              Japanese-domestic editions. More catalogues are being read.
            </p>
          )}
        </div>

        <ShopShelf mode="caliber" caliber={up} className="mt-20 border-t border-[var(--line)] pt-14" />

        <div className="mt-14 flex flex-wrap gap-3">
          <ButtonLink href="/tools/caliber-lookup" variant="outline" size="sm">All Calibers</ButtonLink>
          <ButtonLink href="/catalogue/models" variant="ghost" size="sm">Browse All Models</ButtonLink>
        </div>
      </Container>
    </>
  );
}
