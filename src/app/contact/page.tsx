import { Container } from "@/components/ui";
import { PageHeader } from "@/components/page";
import { pageMeta } from "@/lib/meta";
import { CONTACT, SHOP } from "@/lib/site";

export const metadata = pageMeta({
  title: "Contact",
  description: "Spotted an error, have a Seiko to identify, or looking for one to wear? Reach Tiny Hour Tales on WhatsApp, Instagram or email.",
  path: "/contact",
});

const LINKS = [
  { label: "WhatsApp", value: CONTACT.whatsappDisplay, href: CONTACT.whatsappUrl, external: true },
  { label: "Instagram", value: CONTACT.instagram, href: CONTACT.instagramUrl, external: true },
  { label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}`, external: false },
  { label: "Shop", value: "tinyhourtales.com", href: SHOP.home, external: false },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={<>Say <em>hello</em></>}
        lead="Spotted an error in the Almanac, have a watch you’d like identified, or just want to talk Seiko? We’d love to hear from you — WhatsApp is quickest."
      />
      <Container className="py-12">
        <div className="grid max-w-4xl gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noopener noreferrer" : undefined}
              className="group flex flex-col gap-2 bg-[var(--ivory)] p-6 transition-colors hover:bg-[var(--surface)]"
            >
              <span className="label">{l.label}</span>
              <span className="text-[16px] text-[var(--ink)] [overflow-wrap:anywhere] group-hover:text-[var(--maroon)]">{l.value}</span>
            </a>
          ))}
        </div>
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-[var(--ink-muted)]">
          Corrections make the Almanac better for everyone: if a date, caliber window or reference looks wrong,
          send us the serial, the caliber and a photo of the caseback and we’ll check it against the catalogues.
        </p>
      </Container>
    </>
  );
}
