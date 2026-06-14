import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Container, Eyebrow, Badge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Seiko Region Codes: J, K & P explained",
  description:
    "What the letter on the end of a Seiko reference means — SKX007J vs SKX007K vs SKX007P — plus the trailing digit. A plain-language guide for collectors and buyers.",
};

const ROWS = [
  {
    code: "J",
    title: "Made in Japan",
    body: "Japanese assembly. Often a JDM or Japan-made export piece; the dial sometimes prints “Japan” or the jewel count. Collectors frequently pay a premium for a “J”.",
  },
  {
    code: "K",
    title: "Assembled outside Japan",
    body: "Historically assembled in Hong Kong, Singapore or Malaysia — usually from Japanese-made parts and the same Seiko caliber. Traditionally the lower-priced market code.",
  },
  {
    code: "P",
    title: "Later overseas production",
    body: "Seen on more recent runs, commonly built outside Japan (e.g. Malaysia). Functionally a modern equivalent of the K market code.",
  },
];

export default function RegionCodesPage() {
  return (
    <>
      <header className="border-b border-[var(--border)] bg-[var(--surface-2)]/40">
        <Container className="py-14 sm:py-16">
          <Link href="/learn" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--burgundy-700)] hover:text-[var(--burgundy-600)]">
            <ArrowLeft size={15} /> Learn
          </Link>
          <Eyebrow className="mt-6 block">Guide · Buying</Eyebrow>
          <h1 className="mt-3 max-w-3xl font-serif text-[2.4rem] font-600 leading-[1.06] text-[var(--burgundy-800)] sm:text-[3.2rem]">
            What the <span className="italic text-[var(--burgundy-600)]">J, K or P</span> on a Seiko reference means
          </h1>
          <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-[var(--ink-muted)]">
            You see it in listings — <span className="font-mono">SKX007J1</span>, <span className="font-mono">SKX007K1</span>,
            <span className="font-mono"> SKX007P</span>. The base reference is identical; the suffix is a market code. Here’s
            what it actually tells you.
          </p>
        </Container>
      </header>

      <Container className="py-14">
        <article className="mx-auto max-w-2xl">
          <p className="text-[1.05rem] leading-relaxed text-[var(--ink)]">
            A full Seiko reference often ends with a letter and sometimes a digit — for example
            <span className="font-mono"> SKX007</span> ships as <span className="font-mono">SKX007J1</span>,
            <span className="font-mono"> SKX007K1</span> or <span className="font-mono">SKX007P</span>. The
            <span className="font-mono"> SKX007</span> part is the model; the rest is a <strong>region &amp; packaging code</strong>.
          </p>

          {/* The letter */}
          <h2 className="mt-10 font-serif text-2xl text-[var(--burgundy-800)]">The letter: where it was assembled</h2>
          <div className="mt-5 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--border)]">
            {ROWS.map((r) => (
              <div key={r.code} className="flex gap-5 bg-[var(--surface)] p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius)] border border-[var(--gold-300)] bg-[var(--gold-100)] font-mono text-lg font-semibold text-[var(--gold-700)]">
                  {r.code}
                </span>
                <div>
                  <h3 className="font-serif text-lg text-[var(--burgundy-800)]">{r.title}</h3>
                  <p className="mt-1 text-[0.92rem] leading-relaxed text-[var(--ink-muted)]">{r.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* The digit */}
          <h2 className="mt-10 font-serif text-2xl text-[var(--burgundy-800)]">The digit: bracelet or packaging</h2>
          <p className="mt-3 text-[1rem] leading-relaxed text-[var(--ink)]">
            A trailing <span className="font-mono">1</span> or <span className="font-mono">2</span> — as in
            <span className="font-mono"> J1</span> vs <span className="font-mono">J2</span> — almost always
            distinguishes the <strong>bracelet, strap or box</strong> it was sold with, not the watch inside. It is
            <em> not</em> a quality grade.
          </p>

          {/* The honest bit */}
          <div className="crop mt-10 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface)] p-6">
            <Badge variant="burgundy">The honest version</Badge>
            <h2 className="mt-3 font-serif text-2xl text-[var(--burgundy-800)]">Does J really beat K?</h2>
            <p className="mt-3 text-[1rem] leading-relaxed text-[var(--ink-muted)]">
              Both house the <strong>same Seiko caliber</strong>. The usual real-world difference is the country of
              assembly and the dial printing — not movement grade. “J” often carries a price premium driven by
              collector preference more than measurable quality. Buy the actual watch in front of you: condition,
              originality and service history matter far more than the letter on the box.
            </p>
            <p className="mt-3 text-[0.88rem] leading-relaxed text-[var(--ink-soft)]">
              One more catch: these suffixes are <strong>market/dealer codes</strong>. They’re printed on the box and
              papers — the watch itself rarely says J, K or P. A listing’s letter is a claim, not proof.
            </p>
          </div>

          {/* Cross-links */}
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/tools/serial-decoder"
              className="inline-flex items-center gap-1.5 rounded-[var(--radius)] bg-[var(--burgundy-700)] px-5 py-2.5 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[var(--burgundy-600)]"
            >
              Date a watch by its serial
            </Link>
            <a
              href="https://www.tinyhourtales.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-[var(--gold-500)] px-5 py-2.5 text-sm font-medium text-[var(--burgundy-800)] transition-colors hover:bg-[var(--gold-100)]"
            >
              Shop verified Seiko <ArrowUpRight size={15} strokeWidth={2.2} />
            </a>
          </div>
        </article>
      </Container>
    </>
  );
}
