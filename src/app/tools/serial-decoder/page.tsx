import { Container } from "@/components/ui";
import { PageHeader } from "@/components/page";
import { SerialDecoder } from "@/components/decoder/SerialDecoder";
import { JsonLd } from "@/components/JsonLd";
import { slimCalibers } from "@/data/calibers";
import { pageMeta } from "@/lib/meta";
import { SITE_URL } from "@/lib/site";

// Stable, linkable URL: /tools/serial-decoder?serial=7N0142&caliber=6309
// (the shop links here from Seiko product pages; /year-finder redirects here too).

export const metadata = pageMeta({
  title: "Seiko Serial Number Decoder — Find the Year",
  description:
    "Find the month and year a Seiko was made from the serial number on its caseback. Add the caliber to narrow the decade. Free, private — runs entirely in your browser.",
  path: "/tools/serial-decoder",
});

const STEPS = [
  { n: "1", t: "Year", d: "The first character is the last digit of the production year — so it repeats every decade." },
  { n: "2", t: "Month", d: "The second character is the month: 1–9 for January–September, then O, N, D for October, November, December." },
  { n: "3", t: "Sequence", d: "The remaining digits are that month’s production count for the line." },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Seiko Serial Number Decoder",
  url: `${SITE_URL}/tools/serial-decoder`,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "Tiny Hour Tales", url: "https://tinyhourtales.com" },
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function SerialDecoderPage({
  searchParams,
}: {
  searchParams: Promise<{ caliber?: string | string[]; serial?: string | string[] }>;
}) {
  const sp = await searchParams;
  const initialCaliber = first(sp.caliber).toUpperCase().slice(0, 10);
  const initialSerial = first(sp.serial).toUpperCase().slice(0, 12);
  return (
    <>
      <JsonLd data={JSON_LD} />
      <PageHeader
        eyebrow="Year Finder · Serial Decoder"
        title={<>When was your Seiko <em>made?</em></>}
        lead="Enter the serial engraved on the caseback. Add the movement caliber and we’ll narrow which decade it came from."
      />
      <Container className="py-12">
        <SerialDecoder
          calibers={slimCalibers()}
          autoFocus={!initialSerial}
          initialSerial={initialSerial}
          initialCaliber={initialCaliber}
          syncUrl
        />

        <div className="mt-16">
          <p className="label">How the code works</p>
          <div className="mt-5 grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-[var(--surface)] p-6 sm:p-8">
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-[34px] leading-none text-[var(--maroon)]">{s.n}</span>
                  <h2 className="font-serif text-[22px] text-[var(--ink)]">{s.t}</h2>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-muted)]">{s.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-2xl text-[14px] leading-relaxed text-[var(--ink-soft)]">
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
