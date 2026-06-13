import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { PageHeader } from "@/components/page";
import { CaliberTable } from "@/components/caliber/CaliberTable";

export const metadata: Metadata = {
  title: "Seiko Caliber Lookup",
  description:
    "Search Seiko movement calibers by number — type, jewel count, production window and notes. The same database that powers the serial decoder.",
};

export default function CaliberLookupPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tool · Caliber Lookup"
        title={<>The <span className="italic text-[var(--burgundy-600)]">movement</span> behind the dial</>}
        lead="Every Seiko caliber tells you roughly when a watch was made. Search the database — it’s the same one that narrows the decade in the serial decoder."
      />
      <Container className="py-12">
        <CaliberTable />
      </Container>
    </>
  );
}
