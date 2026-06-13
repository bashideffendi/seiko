import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[62vh] max-w-xl place-items-center px-5 text-center">
      <div>
        <p className="label">Error 404</p>
        <h1 className="mt-3 font-serif text-[2.6rem] leading-tight text-[var(--ink)]" style={{ fontWeight: 400 }}>
          This page slipped off the <span className="italic text-[var(--burgundy-700)]">bracelet</span>.
        </h1>
        <p className="mt-3 text-[var(--ink-muted)]">
          The page you’re looking for isn’t here — try the tools or the catalogue.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-[var(--radius)] bg-[var(--burgundy-700)] px-5 py-2.5 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[var(--burgundy-600)]"
          >
            Back to the Almanac
          </Link>
          <Link
            href="/catalogue"
            className="inline-flex items-center rounded-[var(--radius)] border border-[var(--border-strong)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--ink)] transition-colors hover:border-[var(--ink-soft)]"
          >
            Browse the catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
