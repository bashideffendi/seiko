import Link from "next/link";
import { Container, Badge } from "@/components/ui";
import { PageHeader } from "@/components/page";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta({
  title: "Learn",
  description: "Short, honest field guides for Seiko collectors — starting with what the J, K and P on a Seiko reference really mean.",
  path: "/learn",
});

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
        title={<>Learn to <em>read</em> a Seiko</>}
        lead="Guides for collectors at every stage — from your first automatic to spotting a re-dial across a room."
      />
      <Container className="py-14">
        <div className="grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2">
          {LIVE.map((g) => (
            <Link key={g.href} href={g.href} className="group flex flex-col bg-[var(--sand)] p-7 transition-colors hover:bg-[var(--linen)] sm:p-9">
              <div className="flex items-center gap-3">
                <span className="label">{g.kicker}</span>
                <Badge variant="burgundy">New</Badge>
              </div>
              <h2 className="mt-3 font-serif text-[28px] leading-9 text-[var(--ink)] group-hover:text-[var(--maroon)]">{g.title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-muted)]">{g.desc}</p>
              <span className="caps mt-6 !text-[11px] text-[var(--maroon)]">
                <span className="border-b border-[var(--maroon)] pb-0.5">Read the guide</span>
              </span>
            </Link>
          ))}
        </div>

        <p className="label mt-14">In the workshop</p>
        <ul className="mt-5 grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
          {SOON.map((f) => (
            <li key={f.name} className="bg-[var(--ivory)] p-7">
              <h3 className="font-serif text-[22px] leading-7 text-[var(--ink)]">{f.name}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-muted)]">{f.detail}</p>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
