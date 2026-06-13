import type { Metadata } from "next";
import { ComingSoon } from "@/components/page";

export const metadata: Metadata = { title: "Model Finder" };

export default function ModelFinderPage() {
  return (
    <ComingSoon
      eyebrow="Tool · Model Finder"
      title={<>Find a model from its <span className="italic text-[var(--burgundy-600)]">features</span></>}
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
