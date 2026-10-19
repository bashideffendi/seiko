import type { ReactNode } from "react";
import { Container, Eyebrow, ButtonLink } from "@/components/ui";
import { SHOP } from "@/lib/site";

/** Page title block in the shop's style (cf. its brand pages): eyebrow, Bodoni title, lead. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-[var(--line)]">
      <Container className="pb-12 pt-14 sm:pb-14 sm:pt-20">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-3 max-w-4xl font-serif text-[44px] leading-[1.06] text-[var(--ink)] sm:text-[64px]">
          {title}
        </h1>
        {lead && <p className="mt-5 max-w-2xl text-[17px] leading-[1.65] text-[var(--ink-muted)]">{lead}</p>}
        {children}
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
        <p className="label">In the workshop</p>
        <ul className="mt-5 grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2">
          {features.map((f) => (
            <li key={f.name} className="bg-[var(--surface)] p-6 sm:p-8">
              <h2 className="font-serif text-[22px] leading-7 text-[var(--ink)]">{f.name}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-muted)]">{f.detail}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/tools/serial-decoder" variant="primary">Find a Year</ButtonLink>
          <ButtonLink href={SHOP.seiko} variant="outline">Shop Seiko</ButtonLink>
        </div>
      </Container>
    </>
  );
}
