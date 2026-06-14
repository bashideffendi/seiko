import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Construction } from "lucide-react";
import { Container, Eyebrow, Badge } from "@/components/ui";
import { PageHeader } from "@/components/page";

export const metadata: Metadata = { title: "Learn" };

const LIVE = [
  {
    href: "/learn/region-codes",
    kicker: "Buying",
    title: "What the J, K or P on a Seiko reference means",
    desc: "SKX007J vs K vs P — what the market code actually tells you, and what it doesn’t.",
  },
];

const SOON = [
  { name: "History", detail: "A timeline of Seiko from 1881 to today." },
  { name: "Movement guide", detail: "Mechanical vs quartz vs Spring Drive, explained simply." },
  { name: "Buying guide", detail: "Where to start by budget, style and use case." },
  { name: "Authenticity", detail: "Telling an honest watch from a franken or a fake." },
  { name: "Glossary", detail: "Horology terms, A–Z, in plain language." },
  { name: "Mods & maintenance", detail: "Servicing, modding and keeping a Seiko honest." },
];

export default function LearnPage() {
  return (
    <>
      <PageHeader
        eyebrow="Knowledge"
        title={<>Learn to <span className="italic text-[var(--burgundy-600)]">read</span> a Seiko</>}
        lead="Guides for collectors at every stage — from your first automatic to spotting a re-dial across a room."
      />
      <Container className="py-14">
        {/* Live guides */}
        <div className="grid gap-4 sm:grid-cols-2">
          {LIVE.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="group crop flex flex-col rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface)] p-6 transition-colors hover:bg-[var(--surface-2)]"
            >
              <div className="flex items-center gap-2">
                <Eyebrow>{g.kicker}</Eyebrow>
                <Badge variant="gold">New</Badge>
              </div>
              <h3 className="mt-3 font-serif text-xl leading-snug text-[var(--burgundy-800)]">{g.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{g.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--burgundy-700)]">
                Read the guide <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>

        {/* Coming soon */}
        <div className="mt-12 flex items-center gap-2.5 text-[var(--gold-700)]">
          <Construction size={17} />
          <span className="label !text-[var(--gold-700)]">In the workshop</span>
        </div>
        <ul className="mt-5 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
          {SOON.map((f) => (
            <li key={f.name} className="bg-[var(--surface)] p-6">
              <h3 className="font-serif text-xl text-[var(--burgundy-800)]">{f.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-muted)]">{f.detail}</p>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
