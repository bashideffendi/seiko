import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow } from "@/components/ui";
import { CatalogueReader, type ReaderSpot } from "@/components/catalogue/CatalogueReader";
import { MODEL_SETS } from "@/lib/models";
import { slugForRef } from "@/lib/modelIndex";
import { isValidBbox, SCAN_SETS, scanFor } from "@/lib/scans";
import { pageMeta } from "@/lib/meta";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(SCAN_SETS).map((catalogId) => ({ catalogId }));
}

function readerData(catalogId: string) {
  const set = scanFor(catalogId);
  if (!set) return null;
  const models = MODEL_SETS[catalogId];
  const spots: ReaderSpot[] = (models?.records ?? [])
    .filter((r) => r.photo && isValidBbox(r.bbox))
    .map((r) => ({
      page: r.page,
      bbox: r.bbox!,
      ref: r.ref,
      slug: slugForRef(r.ref),
      section: r.section || undefined,
      sub: [r.case, r.jewels != null ? `${r.jewels} jewels` : "", r.dial ? `${r.dial} dial` : ""].filter(Boolean).join(" · ") || undefined,
    }));
  const title = models?.catalog.title ?? set.title;
  return { set, spots, title, edition: models?.catalog.edition };
}

export async function generateMetadata({ params }: { params: Promise<{ catalogId: string }> }): Promise<Metadata> {
  const { catalogId } = await params;
  const d = readerData(catalogId);
  if (!d) return { title: "Catalogue not found" };
  return pageMeta({
    title: `Read the ${d.title}`,
    description: `Page through the original ${d.title} — all ${d.set.pages.length} pages, with each of the ${d.spots.length} watches pictured linked to its model page.`,
    path: `/catalogue/read/${catalogId}`,
  });
}

export default async function ReadPage({ params }: { params: Promise<{ catalogId: string }> }) {
  const { catalogId } = await params;
  const d = readerData(catalogId);
  if (!d) notFound();

  return (
    <>
      <header className="border-b border-[var(--line)]">
        <Container className="pb-8 pt-8 sm:pb-10 sm:pt-12">
          <nav aria-label="Breadcrumb" className="label">
            <Link href="/catalogue/archive" className="hover:text-[var(--maroon)]">Archive</Link>
            <span aria-hidden="true" className="mx-2">/</span>
            <span aria-current="page">{d.title}</span>
          </nav>
          <div className="mt-6">
            <Eyebrow>Read the catalogue</Eyebrow>
            <h1 className="mt-2 font-serif text-[38px] leading-[1.08] text-[var(--ink)] sm:text-[52px]">{d.title}</h1>
            <p className="mt-3 max-w-2xl text-[16px] leading-[1.6] text-[var(--ink-muted)]">
              All {d.set.pages.length} pages, scanned from the original{d.edition ? <> — {d.edition}</> : null}.{" "}
              {d.spots.length} watches are pictured, and each outline opens that model’s page.
            </p>
          </div>
        </Container>
      </header>

      <Container className="py-8 sm:py-10">
        <CatalogueReader set={d.set} spots={d.spots} title={d.title} />
      </Container>
    </>
  );
}
