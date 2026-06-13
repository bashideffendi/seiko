import type { Metadata } from "next";
import { Mail, Instagram, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui";
import { PageHeader } from "@/components/page";

export const metadata: Metadata = { title: "Contact" };

const LINKS = [
  { icon: Mail, label: "Email", value: "hello@tinyhourtales.com", href: "mailto:hello@tinyhourtales.com" },
  { icon: Instagram, label: "Instagram", value: "@tinyhourtales", href: "https://instagram.com/tinyhourtales" },
  { icon: ArrowUpRight, label: "Shop", value: "tinyhourtales.com", href: "https://www.tinyhourtales.com" },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={<>Say <span className="italic text-[var(--burgundy-600)]">hello</span></>}
        lead="Spotted an error, have a watch to identify, or just want to talk Seiko? We’d love to hear from you."
      />
      <Container className="py-12">
        <div className="grid max-w-2xl gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-3">
          {LINKS.map((l) => {
            const Icon = l.icon;
            return (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="group flex flex-col gap-2 bg-[var(--surface)] p-6 transition-colors hover:bg-[var(--surface-2)]"
              >
                <Icon size={20} className="text-[var(--burgundy-700)]" strokeWidth={1.7} />
                <span className="label !text-[0.56rem]">{l.label}</span>
                <span className="font-mono text-sm text-[var(--burgundy-800)]">{l.value}</span>
              </a>
            );
          })}
        </div>
        <p className="mt-6 text-sm text-[var(--ink-soft)]">
          Note: contact details are placeholders for now — update them before launch.
        </p>
      </Container>
    </>
  );
}
