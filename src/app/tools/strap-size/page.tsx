import { ComingSoon } from "@/components/page";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta({
  title: 'Strap Size',
  description: 'Lug widths by Seiko reference and strap recommendations — a tool in the workshop at the Seiko Almanac.',
  path: '/tools/strap-size',
  noindex: true,
});

export default function StrapSizePage() {
  return (
    <ComingSoon
      eyebrow="Tool · Strap Size"
      title={<>The right <em>strap</em>, first time</>}
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
