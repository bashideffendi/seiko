import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { PageHeader } from "@/components/page";
import { CatalogueArchive } from "@/components/catalogue/CatalogueArchive";
import { CATALOGUE_STATS } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Catalogue Archive",
  description:
    "Browse 125 original Seiko catalogues from 1932 to 2020 — covers, references and calibers, searchable by year, model reference and movement.",
};

export default function ArchivePage() {
  const s = CATALOGUE_STATS;
  return (
    <>
      <PageHeader
        eyebrow="The archive"
        title={<>Every catalogue, <span className="italic text-[var(--burgundy-600)]">1932–2020</span></>}
        lead={`${s.count} original Seiko catalogues — ${s.pages.toLocaleString()} pages in all. Search by year, model reference (e.g. SLA037) or caliber.`}
      />
      <Container className="py-12">
        <CatalogueArchive />
      </Container>
    </>
  );
}
