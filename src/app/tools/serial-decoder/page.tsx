import type { Metadata } from "next";
import { Container, Eyebrow } from "@/components/ui";
import { PageHeader } from "@/components/page";
import { SerialDecoder } from "@/components/decoder/SerialDecoder";

export const metadata: Metadata = {
  title: "Seiko Serial Number Decoder",
  description:
    "Decode the production month and year of any Seiko watch from its caseback serial number. Add the caliber to narrow the decade. Runs entirely in your browser.",
};

const STEPS = [
  { n: "1", t: "Year", d: "The first character is the last digit of the production year — so it repeats every decade." },
  { n: "2", t: "Month", d: "The second character is the month: 1–9 for Jan–Sep, then O, N, D for Oct, Nov, Dec." },
  { n: "3", t: "Sequence", d: "The remaining digits are that month’s production count for the line." },
];

export default function SerialDecoderPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tool · Serial Decoder"
        title={<>Decode a Seiko <span className="italic text-[var(--burgundy-600)]">serial</span></>}
        lead="Enter the serial engraved on the caseback. Add the movement caliber and we’ll narrow which decade it came from."
      />
      <Container className="py-12">
        <SerialDecoder autoFocus />

        <div className="mt-14">
          <Eyebrow>How the code works</Eyebrow>
          <div className="mt-5 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-[var(--surface)] p-6">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl text-[var(--gold-600)]">{s.n}</span>
                  <h3 className="font-serif text-xl text-[var(--burgundy-800)]">{s.t}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{s.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 max-w-2xl text-[0.85rem] leading-relaxed text-[var(--ink-soft)]">
            Seiko has never published an official serial-dating standard — this is a community-derived
            convention. It works for most Seiko (and Seiko 5) watches from 1966 onward, but can mislead
            on Grand Seiko, some quartz lines, and watches with service-replaced movements. Treat the
            result as a strong estimate, not a certificate.
          </p>
        </div>
      </Container>
    </>
  );
}
