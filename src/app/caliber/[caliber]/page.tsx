import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Binary, Cog } from "lucide-react";
import { Container, Eyebrow, Badge } from "@/components/ui";
import { CALIBERS, findCaliber } from "@/data/calibers";
import { modelsForCaliber, slugForRef } from "@/lib/modelIndex";

export const dynamicParams = false;

export function generateStaticParams() {
  return CALIBERS.map((c) => ({ caliber: c.caliber.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ caliber: string }>;
}): Promise<Metadata> {
  const { caliber } = await params;
  const c = findCaliber(caliber);
  if (!c) return { title: "Caliber not found" };
  const up = c.caliber.toUpperCase();
  return {
    title: `Seiko caliber ${up}`,
    description: `Seiko ${up} — ${c.movementType.replace("-", " ")} movement${
      c.jewels ? `, ${c.jewels} jewels` : ""
    }, produced ${c.startYear}–${c.endYear ?? "present"}. Specs, notable references and catalogued models.`,
  };
}

function decadeOf(year: number) {
  return `${Math.floor(year / 10) * 10}s`;
}

export default async function CaliberPage({
  params,
}: {
  params: Promise<{ caliber: string }>;
}) {
  const { caliber } = await params;
  const c = findCaliber(caliber);
  if (!c) notFound();

  const up = c.caliber.toUpperCase();
  const models = modelsForCaliber(c.caliber);

  const spec = [
    { k: "Type", v: c.movementType.replace("-", " ") },
    { k: "Jewels", v: c.jewels != null ? `${c.jewels}` : "—" },
    { k: "Produced", v: `${c.startYear}–${c.endYear ?? "present"}${c.rangeConfidence === "approximate" ? " ~" : ""}` },
    { k: "Family", v: c.family ?? "—" },
  ];

  return (
    <>
      <header className="border-b border-[var(--border)] bg-[var(--surface-2)]/40">
        <Container className="py-12 sm:py-14">
          <Link href="/tools/caliber-lookup" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--burgundy-700)] hover:text-[var(--burgundy-600)]">
            <ArrowLeft size={15} /> Caliber lookup
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Eyebrow>Movement reference</Eyebrow>
            {c.grandSeiko && <Badge variant="burgundy">Grand Seiko</Badge>}
            {c.longRun && <Badge>long run</Badge>}
          </div>
          <h1 className="mt-3 font-mono text-[2.8rem] font-600 leading-none text-[var(--burgundy-800)] sm:text-[3.6rem]">
            {up}
          </h1>
          {c.notes && <p className="mt-4 max-w-2xl text-[1.02rem] leading-relaxed text-[var(--ink-muted)]">{c.notes}</p>}
        </Container>
      </header>

      <Container className="py-12">
        {/* Spec + decode CTA */}
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-4">
            {spec.map((s) => (
              <div key={s.k} className="bg-[var(--surface)] px-4 py-3">
                <dt className="label !text-[0.56rem]">{s.k}</dt>
                <dd className="mt-1 font-mono text-[0.95rem] capitalize text-[var(--ink)]">{s.v}</dd>
              </div>
            ))}
          </dl>

          <Link
            href={`/tools/serial-decoder?caliber=${encodeURIComponent(up)}`}
            className="group flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--gold-400)] bg-[var(--gold-100)]/50 px-5 py-4 transition-colors hover:bg-[var(--gold-100)]"
          >
            <span className="flex items-center gap-2.5">
              <Binary size={18} className="text-[var(--burgundy-700)]" />
              <span className="text-sm font-medium text-[var(--burgundy-800)]">Date a {up} from its serial</span>
            </span>
            <ArrowRight size={16} className="text-[var(--burgundy-700)] transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Notable references */}
        {c.notableRefs && c.notableRefs.length > 0 && (
          <div className="mt-10">
            <span className="label">Notable references</span>
            <div className="mt-3 flex flex-wrap gap-2">
              {c.notableRefs.map((r) => {
                const slug = slugForRef(r.split(" ")[0]);
                const inner = (
                  <span className="rounded-full border border-[var(--gold-300)] bg-[var(--gold-100)] px-3 py-1 font-mono text-[0.76rem] text-[var(--gold-700)]">
                    {r}
                  </span>
                );
                return slug ? (
                  <Link key={r} href={`/catalogue/model/${slug}`} className="transition-opacity hover:opacity-80">{inner}</Link>
                ) : (
                  <span key={r}>{inner}</span>
                );
              })}
            </div>
          </div>
        )}

        {/* Catalogued models with this caliber */}
        <div className="mt-12">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl text-[var(--burgundy-800)]">In the catalogue</h2>
            <span className="h-px flex-1 bg-[var(--border)]" />
            <Badge variant={models.length ? "gold" : "default"}>{models.length} models</Badge>
          </div>

          {models.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {models.map((m) => (
                <Link
                  key={m.slug}
                  href={`/catalogue/model/${m.slug}`}
                  className="group flex flex-col rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--gold-400)] hover:bg-[var(--surface-2)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[0.95rem] font-medium text-[var(--burgundy-800)]">{m.ref}</span>
                    {m.years[0] && <span className="font-mono text-[0.66rem] text-[var(--ink-soft)]">{decadeOf(m.years[0])}</span>}
                  </div>
                  <span className="mt-1 line-clamp-1 text-[0.78rem] text-[var(--ink-muted)]">
                    {[m.dial, m.case].filter(Boolean).join(" · ") || m.sections[0]?.toLowerCase() || "—"}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)]/50 px-6 py-8 text-sm text-[var(--ink-muted)]">
              No models with the {up} are in the catalogued sets yet — our extracted catalogues are mostly 1970s
              Japanese-domestic editions. More catalogues are being digitised.
            </p>
          )}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/tools/caliber-lookup"
            className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-[var(--border-strong)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--ink)] transition-colors hover:border-[var(--ink-soft)]"
          >
            <Cog size={15} /> All calibers
          </Link>
          <Link
            href="/catalogue/models"
            className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-[var(--border-strong)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--ink)] transition-colors hover:border-[var(--ink-soft)]"
          >
            Browse all models <ArrowRight size={15} />
          </Link>
        </div>
      </Container>
    </>
  );
}
