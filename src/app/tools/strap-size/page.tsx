import type { Metadata } from "next";
import { ComingSoon } from "@/components/page";

export const metadata: Metadata = { title: "Strap Size" };

export default function StrapSizePage() {
  return (
    <ComingSoon
      eyebrow="Tool · Strap Size"
      title={<>The right <span className="italic text-[var(--burgundy-600)]">strap</span>, first time</>}
      lead="Look up the lug width for a reference and get strap-style recommendations that suit the watch — from tropic to oyster to leather."
      features={[
        { name: "Lug width by reference", detail: "Exact mm for hundreds of popular Seiko references." },
        { name: "Style recommendations", detail: "Curated strap pairings by case style and era." },
        { name: "Fitted vs straight", detail: "Flags references that need fitted end-links (e.g. SKX, Turtle)." },
        { name: "Shop the pairing", detail: "Jump straight to matching straps in the shop." },
      ]}
    />
  );
}
