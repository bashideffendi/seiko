import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { PageHeader } from "@/components/page";

export const metadata: Metadata = { title: "Disclaimer & Sources" };

const SOURCES = [
  { name: "WatchSleuth — Seiko Date Finder", url: "https://www.watchsleuth.com/seikodatefinder/" },
  { name: "RetroSeiko — serial database", url: "https://retroseiko.co.uk/seiko-serial-database.htm" },
  { name: "Plus9Time — caseback & Grand Seiko references", url: "https://www.plus9time.com/seiko-case-back-information" },
  { name: "Original Seiko catalogues, 1932–2020", url: null },
];

export default function DisclaimerPage() {
  return (
    <>
      <PageHeader
        eyebrow="Disclaimer & Sources"
        title={<>How sure is <span className="italic text-[var(--burgundy-600)]">any</span> of this?</>}
      />
      <Container className="py-12">
        <div className="max-w-2xl space-y-5 text-[1rem] leading-relaxed text-[var(--ink-muted)]">
          <p>
            <strong className="text-[var(--ink)]">Not affiliated with Seiko.</strong> Seiko Almanac and
            Tiny Hour Tales are independent. “Seiko”, “Prospex”, “Presage”, “Grand Seiko” and related
            names are trademarks of Seiko Watch Corporation, used here only to describe and identify
            watches.
          </p>
          <p>
            <strong className="text-[var(--ink)]">The serial scheme is a convention, not a standard.</strong>{" "}
            Seiko has never published an official method for dating watches by serial number. The
            decoder uses the widely-accepted community reading: it works for most Seiko from 1966
            onward, but can be wrong for Grand Seiko, some quartz lines, and any watch whose movement
            has been replaced during a service. Treat results as strong estimates.
          </p>
          <p>
            <strong className="text-[var(--ink)]">Caliber dates are approximate.</strong> Production
            windows are drawn from community references and are marked with a “~” where sources
            disagree. They’re good enough to narrow a decade — not to certify a single year.
          </p>
          <p>If you spot an error, we genuinely want to know.</p>
        </div>

        <div className="mt-10 max-w-2xl">
          <h2 className="label">Sources</h2>
          <ul className="mt-3 space-y-2">
            {SOURCES.map((s) => (
              <li key={s.name} className="text-sm text-[var(--ink-muted)]">
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[var(--burgundy-700)] underline decoration-[var(--gold-500)] underline-offset-2">
                    {s.name}
                  </a>
                ) : (
                  s.name
                )}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </>
  );
}
