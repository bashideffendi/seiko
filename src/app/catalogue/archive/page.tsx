import { Container } from "@/components/ui";
import { PageHeader } from "@/components/page";
import { CatalogueArchive } from "@/components/catalogue/CatalogueArchive";
import { CATALOGUE_STATS } from "@/lib/catalogue";
import { archiveItems } from "@/lib/archive";
import { pageMeta } from "@/lib/meta";

const s = CATALOGUE_STATS;

export const metadata = pageMeta({
  title: "Seiko Catalogue Archive",
  description: `Browse ${s.count} original Seiko catalogues from ${s.earliest} to ${s.latest} — covers, references and calibers, searchable by year, model reference and movement.`,
  path: "/catalogue/archive",
});

export default function ArchivePage() {
  return (
    <>
      <PageHeader
        eyebrow="The Archive"
        title={<>Every catalogue, <em>{s.earliest}–{s.latest}</em></>}
        lead={`${s.count} original Seiko catalogues — ${s.pages.toLocaleString("en-US")} pages in all. Search by year, model reference (e.g. SLA037) or caliber.`}
      />
      <Container className="py-12">
        <CatalogueArchive items={archiveItems()} />
      </Container>
    </>
  );
}
