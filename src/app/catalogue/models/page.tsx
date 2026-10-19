import { Container } from "@/components/ui";
import { PageHeader } from "@/components/page";
import { ModelBrowser } from "@/components/catalogue/ModelBrowser";
import { ALL_MODEL_ENTRIES, MODEL_STATS } from "@/lib/modelIndex";
import { MODEL_SETS } from "@/lib/models";
import { compactModel, decadeOf } from "@/lib/modelCompact";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta({
  title: "Seiko Models by Reference",
  description:
    "Every Seiko model reference read from original Seiko catalogues — searchable by reference, caliber, dial and decade, each with its own page and similar models.",
  path: "/catalogue/models",
});

const FIRST_PAGE = ALL_MODEL_ENTRIES.slice(0, 150).map(compactModel);
const DECADES = Array.from(new Set(ALL_MODEL_ENTRIES.flatMap((e) => e.years.map(decadeOf)))).sort();
const CATALOGS = Object.values(MODEL_SETS).map(({ catalog: c }) => ({
  id: c.id,
  label: c.title.startsWith(String(c.year)) ? c.title : `${c.year} ${c.title}`,
}));

export default function ModelsPage() {
  const s = MODEL_STATS;
  return (
    <>
      <PageHeader
        eyebrow="The Archive · by model"
        title={<>Every model, <em>by reference</em></>}
        lead={`${s.unique.toLocaleString("en-US")} unique references read from original Seiko catalogues — ${s.withCaliber.toLocaleString("en-US")} with an identified caliber. Search a reference, a movement or a dial.`}
      />
      <Container className="py-12">
        <ModelBrowser initial={FIRST_PAGE} total={s.unique} decades={DECADES} catalogs={CATALOGS} />
      </Container>
    </>
  );
}
