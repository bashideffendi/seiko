import Link from "next/link";
import { ThtLogo } from "@/components/brand";
import { CONTACT, SHOP, SHOP_BRANDS } from "@/lib/site";

// Mirrors the shop's deep-maroon footer (THT Design) so the Almanac and the shop end the same way.

const ALMANAC = [
  { label: "Year Finder", href: "/tools/serial-decoder" },
  { label: "Caliber Lookup", href: "/tools/caliber-lookup" },
  { label: "Vintage Case Codes", href: "/tools/vintage-case-code" },
  { label: "Catalogue Archive", href: "/catalogue/archive" },
  { label: "Models", href: "/catalogue/models" },
  { label: "Learn", href: "/learn" },
];

const SHOP_LINKS = [
  { label: "Collection", href: SHOP.collection },
  { label: "For Her", href: SHOP.forHer },
  { label: "For Him", href: SHOP.forHim },
  ...SHOP_BRANDS.slice(0, 3),
];

const ABOUT = [
  { label: "About the Almanac", href: "/about", internal: true },
  { label: "Sources & Disclaimer", href: "/disclaimer", internal: true },
  { label: "Contact", href: "/contact", internal: true },
  { label: "Our Story", href: SHOP.ourStory, internal: false },
  { label: "Wear & Care", href: SHOP.wearCare, internal: false },
];

const colLink = "block py-[9px] text-[15px] leading-[22px] text-[var(--on-dark-2)] transition-colors hover:text-white hover:underline hover:underline-offset-4 [overflow-wrap:anywhere]";

function ColHead({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-[11px] font-medium uppercase leading-4 tracking-[0.22em] text-[var(--on-dark-faint)]">{children}</p>;
}

export function SiteFooter() {
  return (
    <footer className="on-dark mt-24 bg-[var(--maroon-deep)] text-[var(--on-dark-2)]">
      <div className="mx-auto max-w-[1440px] px-[var(--gutter)] pb-10 pt-12 lg:pt-16">
        {/* Top — the bridge back to the shop */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h2 className="font-serif text-[28px] leading-[34px] text-[var(--ivory)] lg:text-[34px] lg:leading-[42px]">
              Found the one you’ve been <em>looking for?</em>
            </h2>
            <p className="mt-2 text-[15px] leading-[23px] text-[var(--on-dark-soft)]">
              Every watch at Tiny Hour Tales is handpicked, checked in-house and ready to wear — one of each.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={SHOP.seiko}
              className="inline-flex h-[52px] items-center justify-center bg-[var(--ivory)] px-8 text-[13px] font-medium uppercase tracking-[0.18em] text-[var(--maroon-deep)] transition-colors hover:bg-white"
            >
              Shop Seiko
            </a>
            <a
              href={CONTACT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[52px] items-center justify-center border border-[#8A6A70] px-8 text-[13px] font-medium uppercase tracking-[0.18em] text-[var(--ivory)] transition-colors hover:border-[var(--ivory)]"
            >
              Ask on WhatsApp
            </a>
          </div>
        </div>

        <hr className="my-10 h-px border-0 bg-[var(--dark-rule)] lg:mt-12" />

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1.15fr]">
          <div className="col-span-2 lg:col-span-1">
            <ThtLogo tone="white" height={80} />
            <p className="mt-4 font-serif text-[18px] italic leading-[26px] text-[var(--on-dark-soft)]">Rewind, wear, relive.</p>
            <p className="mt-3 max-w-[18rem] text-[13px] leading-5 text-[var(--on-dark-faint)]">
              The Seiko Almanac is our reference desk — free tools and original catalogues for anyone who loves a Seiko.
            </p>
          </div>

          <nav aria-label="Almanac">
            <ColHead>Almanac</ColHead>
            <ul>
              {ALMANAC.map((l) => (
                <li key={l.href}><Link href={l.href} className={colLink}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Shop">
            <ColHead>Shop</ColHead>
            <ul>
              {SHOP_LINKS.map((l) => (
                <li key={l.href}><a href={l.href} className={colLink}>{l.label}</a></li>
              ))}
            </ul>
          </nav>

          <nav aria-label="About">
            <ColHead>About</ColHead>
            <ul>
              {ABOUT.map((l) => (
                <li key={l.href}>
                  {l.internal ? <Link href={l.href} className={colLink}>{l.label}</Link> : <a href={l.href} className={colLink}>{l.label}</a>}
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <ColHead>Contact</ColHead>
            <ul>
              <li>
                <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className={colLink}>
                  WhatsApp <span className="whitespace-nowrap">{CONTACT.whatsappDisplay}</span>
                </a>
              </li>
              <li>
                <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className={colLink}>
                  Instagram {CONTACT.instagram}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className={colLink}>
                  hello@<wbr />tinyhourtales.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="mb-6 mt-8 h-px border-0 bg-[var(--dark-rule)]" />

        <div className="flex flex-col-reverse gap-3 text-[12px] leading-[18px] text-[var(--on-dark-faint)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Tiny Hour Tales. All rights reserved.</p>
          <p>Independent reference — not affiliated with Seiko Watch Corporation.</p>
        </div>
      </div>
    </footer>
  );
}
