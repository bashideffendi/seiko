import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ArrowRight, Cog, Library } from "lucide-react";
import { Container, Eyebrow, Badge } from "@/components/ui";
import {
  ALL_MODEL_ENTRIES,
  findModelBySlug,
  similarModels,
  type ModelEntry,
} from "@/lib/modelIndex";

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_MODEL_ENTRIES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = findModelBySlug(slug);
  if (!e) return { title: "Model not found" };
  const cal = e.caliber ? ` · caliber ${e.caliber}` : "";
  return {
    title: `Seiko ${e.ref}`,
    description: `Seiko reference ${e.ref}${cal} — catalogued from original Seiko material${
      e.years.length ? ` (${e.years.join(", ")})` : ""
    }. Specs, identifiers and similar models.`,
  };
}

function decadeOf(year: number) {
  return `${Math.floor(year / 10) * 10}s`;
}

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = findModelBySlug(slug);
  if (!entry) notFound();

  const ids = entry.ids;
  const idRows = [
    ids.marketingRef && { k: "Marketing ref", v: ids.marketingRef },
    ids.caseRef && { k: "Case-movement ref", v: ids.caseRef },
    entry.caliber && { k: "Caliber", v: entry.caliber, href: `/caliber/${entry.caliber.toLowerCase()}` },
    ids.caseNumber && { k: "Case no.", v: ids.caseNumber },
    ids.caseDialCode && { k: "Case-dial code", v: ids.caseDialCode },
  ].filter(Boolean) as { k: string; v: string; href?: string }[];

  const specRows = [
    entry.dial && { k: "Dial", v: entry.dial },
    entry.case && { k: "Case", v: entry.case },
    entry.bracelet && { k: "Bracelet", v: entry.bracelet },
    entry.jewels != null && { k: "Jewels", v: `${entry.jewels}` },
    entry.wr && { k: "Water resist.", v: entry.wr },
    entry.price && { k: "List price", v: entry.price },
    entry.specs && { k: "Specs", v: entry.specs },
  ].filter(Boolean) as { k: string; v: string }[];

  const similar = similarModels(entry);

  return (
    <>
      <header className="border-b border-[var(--border)] bg-[var(--surface-2)]/40">
        <Container className="py-12 sm:py-14">
          <Link href="/catalogue/models" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--burgundy-700)] hover:text-[var(--burgundy-600)]">
            <ArrowLeft size={15} /> All models
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Eyebrow>Model reference</Eyebrow>
            {entry.caliber && <Badge variant="gold">cal. {entry.caliber}</Badge>}
            {entry.conf !== "high" && <Badge>{entry.conf} confidence</Badge>}
          </div>
          <h1 className="mt-3 font-serif text-[2.6rem] font-600 leading-[1.04] text-[var(--burgundy-800)] sm:text-[3.4rem]">
            {entry.ref}
          </h1>
          <p className="mt-3 max-w-2xl text-[1.02rem] leading-relaxed text-[var(--ink-muted)]">
            {entry.sections[0] ? <span className="capitalize">{entry.sections[0].toLowerCase()}</span> : "Seiko"}
            {entry.years.length > 0 && (
              <> · catalogued {entry.years.length === 1 ? "in" : "across"}{" "}
                <span className="font-mono text-[var(--burgundy-700)]">{entry.years.join(" · ")}</span>
              </>
            )}
          </p>
        </Container>
      </header>

      <Container className="py-12">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            {/* Identifiers */}
            <h2 className="font-serif text-2xl text-[var(--burgundy-800)]">Identifiers</h2>
            <dl className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
              {idRows.map((r) => (
                <div key={r.k} className="bg-[var(--surface)] px-4 py-3">
                  <dt className="label !text-[0.56rem]">{r.k}</dt>
                  <dd className="mt-1 font-mono text-[0.95rem] text-[var(--ink)]">
                    {r.href ? (
                      <Link href={r.href} className="text-[var(--burgundy-700)] underline decoration-[var(--gold-500)] underline-offset-2">{r.v}</Link>
                    ) : r.v}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Specs */}
            {specRows.length > 0 && (
              <>
                <h2 className="mt-10 font-serif text-2xl text-[var(--burgundy-800)]">From the catalogue</h2>
                <dl className="mt-4 divide-y divide-[var(--border)] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
                  {specRows.map((r) => (
                    <div key={r.k} className="flex gap-4 px-4 py-3">
                      <dt className="label w-32 shrink-0 !text-[0.56rem]">{r.k}</dt>
                      <dd className="text-sm text-[var(--ink)]">{r.v}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}

            {entry.notes && (
              <p className="mt-6 text-[0.92rem] leading-relaxed text-[var(--ink-muted)]">{entry.notes}</p>
            )}

            {/* Appears in */}
            <h2 className="mt-10 font-serif text-2xl text-[var(--burgundy-800)]">Appears in</h2>
            <ul className="mt-4 space-y-2">
              {entry.appearances.map((a, i) => (
                <li key={a.catalogId + i} className="flex items-center gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                  <Library size={15} className="shrink-0 text-[var(--gold-700)]" />
                  <span className="text-sm text-[var(--ink)]">{a.catalogTitle}</span>
                  <span className="font-mono text-[0.7rem] text-[var(--ink-soft)]">p.{a.record.page}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sidebar: similar + shop */}
          <aside>
            <div className="sticky top-24">
              {similar.length > 0 && (
                <>
                  <span className="label flex items-center gap-1.5"><Cog size={12} /> Similar models</span>
                  <div className="mt-3 space-y-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--border)]">
                    {similar.map((s) => (
                      <Link
                        key={s.slug}
                        href={`/catalogue/model/${s.slug}`}
                        className="group flex items-center justify-between gap-3 bg-[var(--surface)] px-4 py-3 transition-colors hover:bg-[var(--surface-2)]"
                      >
                        <div className="min-w-0">
                          <span className="block font-mono text-[0.85rem] font-medium text-[var(--burgundy-800)]">{s.ref}</span>
                          <span className="block truncate text-[0.72rem] text-[var(--ink-soft)]">
                            {[s.caliber ? `cal.${s.caliber}` : "", s.years[0] ? decadeOf(s.years[0]) : ""].filter(Boolean).join(" · ")}
                          </span>
                        </div>
                        <ArrowRight size={14} className="shrink-0 text-[var(--ink-soft)] transition-colors group-hover:text-[var(--burgundy-700)]" />
                      </Link>
                    ))}
                  </div>
                </>
              )}

              <a
                href="https://www.tinyhourtales.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-center gap-1.5 rounded-[var(--radius)] border border-[var(--gold-500)] px-4 py-3 text-sm font-medium text-[var(--burgundy-800)] transition-colors hover:bg-[var(--gold-100)]"
              >
                Find this in the shop <ArrowUpRight size={15} strokeWidth={2.2} />
              </a>
              <p className="mt-3 text-center font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                Drawn from original Seiko catalogues
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
