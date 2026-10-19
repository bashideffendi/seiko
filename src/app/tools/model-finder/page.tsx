import { ComingSoon } from "@/components/page";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta({
  title: 'Model Finder',
  description: 'Identify a Seiko from its dial, case and bracelet — a tool in the workshop at the Seiko Almanac.',
  path: '/tools/model-finder',
  noindex: true,
});

export default function ModelFinderPage() {
  return (
    <ComingSoon
      eyebrow="Tool · Model Finder"
      title={<>Find a model from its <em>features</em></>}
      lead="No serial, no papers — just the watch in front of you. Answer a few questions about the dial, case and bracelet and we’ll narrow down what it is."
      features={[
        { name: "Dial & hands", detail: "Indices, sub-dials, day/date window, lume style and hand shapes." },
        { name: "Case & bezel", detail: "Shape, diameter, crown position and bezel type." },
        { name: "Caseback codes", detail: "Cross-reference the case reference against the caliber database." },
        { name: "Best-guess shortlist", detail: "A ranked list of likely references, each linking to the catalogue." },
      ]}
    />
  );
}
