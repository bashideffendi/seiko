import type { Metadata } from "next";
import { ComingSoon } from "@/components/page";

export const metadata: Metadata = { title: "Learn" };

export default function LearnPage() {
  return (
    <ComingSoon
      eyebrow="Knowledge"
      title={<>Learn to <span className="italic text-[var(--burgundy-600)]">read</span> a Seiko</>}
      lead="Guides for collectors at every stage — from your first automatic to spotting a re-dial across a room."
      features={[
        { name: "History", detail: "A timeline of Seiko from 1881 to today." },
        { name: "Movement guide", detail: "Mechanical vs quartz vs Spring Drive, explained simply." },
        { name: "Buying guide", detail: "Where to start by budget, style and use case." },
        { name: "Authenticity", detail: "Telling an honest watch from a franken or a fake." },
        { name: "Glossary", detail: "Horology terms, A–Z, in plain language." },
        { name: "Mods & maintenance", detail: "Servicing, modding and keeping a Seiko honest." },
      ]}
    />
  );
}
