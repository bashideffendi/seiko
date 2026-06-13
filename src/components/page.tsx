import type { ReactNode } from "react";
import { Construction } from "lucide-react";
import { Container, Eyebrow, ButtonLink } from "@/components/ui";

export function PageHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
}) {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface-2)]/40">
      <Container className="py-14 sm:py-16">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-3 max-w-3xl font-serif text-[2.6rem] font-600 leading-[1.05] text-[var(--burgundy-800)] sm:text-[3.4rem]">
          {title}
        </h1>
        {lead && <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-[var(--ink-muted)]">{lead}</p>}
      </Container>
    </header>
  );
}

export function ComingSoon({
  eyebrow,
  title,
  lead,
  features,
}: {
  eyebrow: string;
  title: ReactNode;
  lead: string;
  features: { name: string; detail: string }[];
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} lead={lead} />
      <Container className="py-14">
        <div className="flex items-center gap-2.5 text-[var(--gold-700)]">
          <Construction size={17} />
          <span className="label !text-[var(--gold-700)]">In the workshop</span>
        </div>

        <ul className="mt-6 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
          {features.map((f) => (
            <li key={f.name} className="bg-[var(--surface)] p-6">
              <h3 className="font-serif text-xl text-[var(--burgundy-800)]">{f.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-muted)]">{f.detail}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/tools/serial-decoder" variant="primary">
            Try the Serial Decoder
          </ButtonLink>
          <ButtonLink href="https://www.tinyhourtales.com" variant="gold" external>
            Browse the shop ↗
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}
