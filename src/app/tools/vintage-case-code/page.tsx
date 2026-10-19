import { Container } from "@/components/ui";
import { PageHeader } from "@/components/page";
import { VintageDecoder } from "@/components/decoder/VintageDecoder";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta({
  title: 'Vintage Case-Code Decoder',
  description: 'Decode pre-1966 Seiko case codes (J14070, 14041, J13088): the five-digit code reveals the ligne dial size and, for known codes, the model — Marvel, Cronos, Lord Marvel, the first King Seiko and Grand Seiko.',
  path: '/tools/vintage-case-code',
});

export default function VintageCaseCodePage() {
  return (
    <>
      <PageHeader
        eyebrow="Tool · Vintage Case Code"
        title={<>Before the serial: the <em>case code</em></>}
        lead="Seikos made before 1966 carry no date-able serial — they’re identified by a five-digit case code. Decode the ligne size, the family, and (for famous codes) the model itself."
      />
      <Container className="py-12">
        <div className="mx-auto max-w-3xl">
          <VintageDecoder autoFocus />

          <div className="crop mt-10 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-2)]/50 p-6 sm:p-7">
            <span className="label">How the system works</span>
            <ul className="mt-3 space-y-2.5 text-[0.9rem] leading-relaxed text-[var(--ink-muted)]">
              <li>
                <span className="font-mono text-[var(--maroon)]">14</span>070 — the first two digits are
                roughly the <strong>dial size in lignes</strong> (1 ligne ≈ 2.26 mm).
              </li>
              <li>
                A leading <span className="font-mono text-[var(--maroon)]">J</span> is read — by one
                community convention — as adding half a ligne, so <span className="font-mono">J12</span> means
                12.5 lignes. (Others read it differently, so treat the size as approximate.)
              </li>
              <li>
                The last three digits — <span className="font-mono">14<span className="text-[var(--maroon)]">070</span></span> —
                are a <strong>progressive case number</strong>, counting up from 000.
              </li>
              <li>
                Because this predates the 1966 serial scheme, a case code <strong>can’t be turned into a date</strong> —
                it identifies the case design, not when the watch was built.
              </li>
            </ul>
            <p className="mt-4 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
              System reconstructed from the collector community · curated model matches are our own
            </p>
          </div>
        </div>
      </Container>
    </>
  );
}
