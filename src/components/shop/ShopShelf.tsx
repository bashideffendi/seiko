import { getShopSeikoWatches } from "@/lib/shop/feed";
import { formatPrice, shelfForCaliber, shelfForModel, type ShopWatch } from "@/lib/shop/parse";
import { SectionHead, TextLink } from "@/components/ui";
import { cn } from "@/lib/cn";
import { SHOP } from "@/lib/site";

// "Available at Tiny Hour Tales" — live, in-stock Seiko-family watches from the shop's public
// Store API (read on the server, ISR-cached). We only say a watch "matches" when the shop's own
// listing names the caliber or case reference; otherwise the shelf says plainly that these are
// simply the Seiko pieces available now. If the feed can't be read, the shelf renders nothing.

function WatchCard({ w }: { w: ShopWatch }) {
  const price = formatPrice(w);
  const eyebrow = [w.brand, w.calibers[0] ? `Cal. ${w.calibers[0]}` : null].filter(Boolean).join(" · ");
  return (
    <a href={w.url} className="group flex min-w-0 flex-col text-[var(--ink)]">
      <span className="relative block aspect-[4/5] overflow-hidden bg-[var(--stone)]">
        {w.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={w.image.src}
            srcSet={w.image.srcSet}
            sizes="(min-width: 1180px) 22vw, (min-width: 640px) 30vw, 46vw"
            alt={w.image.alt}
            width={1000}
            height={1250}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : null}
      </span>
      <span className="mt-3 block text-[10px] font-medium uppercase leading-[14px] tracking-[0.2em] text-[var(--muted)]">{eyebrow}</span>
      <span className="mt-1 block font-serif text-[17px] font-medium leading-[22px] group-hover:text-[var(--maroon)]">{w.name}</span>
      {price && <span className="mt-1.5 block text-[14px] font-medium leading-5">{price}</span>}
    </a>
  );
}

function Grid({ watches }: { watches: ShopWatch[] }) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
      {watches.map((w) => (
        <WatchCard key={w.id} w={w} />
      ))}
    </div>
  );
}

type Props =
  | { mode: "home"; limit?: number; className?: string }
  | { mode: "caliber"; caliber: string; limit?: number; className?: string }
  | { mode: "model"; caliber?: string | null; caseRef?: string | null; limit?: number; className?: string };

export async function ShopShelf(props: Props) {
  const all = await getShopSeikoWatches();
  if (!all.length) return null;
  const limit = props.limit ?? 4;

  let eyebrow = "Available at Tiny Hour Tales";
  let title: React.ReactNode;
  let note: React.ReactNode = null;
  let items: ShopWatch[];

  if (props.mode === "home") {
    title = <>Seiko, <em>ready to wear</em></>;
    note = `${all.length} Seiko-family ${all.length === 1 ? "piece is" : "pieces are"} in the shop right now — each handpicked, checked in-house and one of a kind.`;
    items = all.slice(0, limit);
  } else if (props.mode === "caliber") {
    const cal = props.caliber.toUpperCase();
    const { matched, others } = shelfForCaliber(all, cal);
    if (matched.length) {
      title = <>With the <span className="font-mono text-[0.8em]">{cal}</span>, in the shop now</>;
      note = `The shop’s own listing names the ${cal} for ${matched.length === 1 ? "this watch" : "these watches"}.`;
      items = matched.slice(0, limit);
    } else {
      eyebrow = "Elsewhere at Tiny Hour Tales";
      title = <>Seiko pieces in the shop now</>;
      note = `Nothing in the shop is listed with the ${cal} right now — these are the Seiko-family watches that are.`;
      items = others.slice(0, limit);
    }
  } else {
    const { exact, sameCaliber, others } = shelfForModel(all, { caseRef: props.caseRef, caliber: props.caliber });
    if (exact.length) {
      title = <>This reference, in the shop now</>;
      note = `Listed by the shop as ${props.caseRef}.`;
      items = [...exact, ...sameCaliber].slice(0, limit);
    } else if (sameCaliber.length) {
      title = <>Same caliber, in the shop now</>;
      note = `Not this exact reference — but the shop’s listing names the same ${props.caliber?.toUpperCase()} movement.`;
      items = sameCaliber.slice(0, limit);
    } else {
      eyebrow = "Elsewhere at Tiny Hour Tales";
      title = <>Seiko pieces in the shop now</>;
      note = "Not this reference or caliber — simply the Seiko-family watches available today.";
      items = others.slice(0, limit);
    }
  }

  if (!items.length) return null;

  return (
    <section aria-label="Available at Tiny Hour Tales" className={cn(props.className)}>
      <SectionHead
        eyebrow={eyebrow}
        title={title}
        action={<TextLink href={SHOP.seiko}>Shop all Seiko</TextLink>}
      />
      {note && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--ink-muted)]">{note}</p>}
      <Grid watches={items} />
    </section>
  );
}
