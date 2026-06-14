import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { PageHeader } from "@/components/page";
import { ModelBrowser } from "@/components/catalogue/ModelBrowser";
import { MODEL_STATS } from "@/lib/modelIndex";

export const metadata: Metadata = {
  title: "Models",
  description:
    "Every Seiko model reference catalogued from original Seiko material — searchable by reference, caliber, dial and decade, each with its own page and similar models.",
};

export default function ModelsPage() {
  const s = MODEL_STATS;
  return (
    <>
      <PageHeader
        eyebrow="The archive · by model"
        title={<>Every model, <span className="italic text-[var(--burgundy-600)]">by reference</span></>}
        lead={`${s.unique.toLocaleString()} unique references catalogued from original Seiko material — ${s.withCaliber.toLocaleString()} with an identified caliber. Search a reference, a movement or a dial.`}
      />
      <Container className="py-12">
        <ModelBrowser />
      </Container>
    </>
  );
}
