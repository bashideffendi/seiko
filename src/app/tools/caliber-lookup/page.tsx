import { Container } from "@/components/ui";
import { PageHeader } from "@/components/page";
import { CaliberTable, type CaliberRow } from "@/components/caliber/CaliberTable";
import { CALIBERS } from "@/data/calibers";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta({
  title: 'Seiko Caliber Lookup',
  description: 'Search Seiko movement calibers by number — type, jewel count, production window and notes. The same database that powers the serial decoder.',
  path: '/tools/caliber-lookup',
});

// Everything the table shows, minus per-record source URLs.
const ROWS: CaliberRow[] = CALIBERS.map(({ sources: _sources, ...rest }) => rest);

export default function CaliberLookupPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tool · Caliber Lookup"
        title={<>The <em>movement</em> behind the dial</>}
        lead="Every Seiko caliber tells you roughly when a watch was made. Search the database — it’s the same one that narrows the decade in the serial decoder."
      />
      <Container className="py-12">
        <CaliberTable calibers={ROWS} asOf={new Date().getFullYear()} />
      </Container>
    </>
  );
}
