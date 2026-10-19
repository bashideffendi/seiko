import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-5 py-20 text-center">
      <div>
        <p className="label">Error 404</p>
        <h1 className="mt-4 font-serif text-[44px] leading-[1.08] text-[var(--ink)]">
          This page slipped off the <em>bracelet</em>.
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-[var(--ink-muted)]">
          The page you’re looking for isn’t here — try the year finder or the catalogue.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Back to the Almanac</ButtonLink>
          <ButtonLink href="/catalogue" variant="outline">Browse the Catalogue</ButtonLink>
        </div>
      </div>
    </div>
  );
}
