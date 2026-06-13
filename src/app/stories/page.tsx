import type { Metadata } from "next";
import { ComingSoon } from "@/components/page";

export const metadata: Metadata = { title: "Stories" };

export default function StoriesPage() {
  return (
    <ComingSoon
      eyebrow="Stories"
      title={<>Tiny hour <span className="italic text-[var(--burgundy-600)]">tales</span></>}
      lead="The reason the shop has its name. Reviews, collection stories and the small histories that come attached to old watches."
      features={[
        { name: "Reviews", detail: "Honest, wrist-time write-ups of models we’ve handled." },
        { name: "Collection tales", detail: "The stories behind individual watches and their owners." },
        { name: "Field notes", detail: "Short observations from the bench and the hunt." },
      ]}
    />
  );
}
