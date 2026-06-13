import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { PageHeader } from "@/components/page";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title={<>A field guide from <span className="italic text-[var(--burgundy-600)]">Tiny Hour Tales</span></>}
      />
      <Container className="py-12">
        <div className="max-w-2xl space-y-5 text-[1.05rem] leading-relaxed text-[var(--ink-muted)]">
          <p>
            Seiko Almanac is the reference desk of{" "}
            <a href="https://www.tinyhourtales.com" target="_blank" rel="noopener noreferrer" className="text-[var(--burgundy-700)] underline decoration-[var(--gold-500)] underline-offset-2">Tiny Hour Tales</a>,
            a shop for curated vintage and modern Seiko. We kept needing the same tools — a serial
            decoder, a caliber reference, a way through decades of catalogue — so we built them, and
            opened them up.
          </p>
          <p>
            Everything here is meant to be honest and useful: the decoder tells you when it{" "}
            <em>can’t</em> be sure, the caliber dates are marked as approximate where the community
            disagrees, and the catalogue is drawn straight from period Seiko brochures rather than
            second-hand lists.
          </p>
          <p>
            It’s a work in progress, growing one tool and one product line at a time. If something’s
            wrong, tell us — accuracy is the whole point.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/tools/serial-decoder">Try the decoder</ButtonLink>
          <ButtonLink href="/disclaimer" variant="ghost">Sources & accuracy →</ButtonLink>
        </div>
      </Container>
    </>
  );
}
