import { ComingSoon } from "@/components/page";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta({
  title: 'Stories',
  description: 'Reviews, collection stories and the small histories that come attached to old watches — coming soon from Tiny Hour Tales.',
  path: '/stories',
  noindex: true,
});

export default function StoriesPage() {
  return (
    <ComingSoon
      eyebrow="Stories"
      title={<>Tiny hour <em>tales</em></>}
      lead="The reason the shop has its name. Reviews, collection stories and the small histories that come attached to old watches."
      features={[
        { name: "Reviews", detail: "Honest, wrist-time write-ups of models we’ve handled." },
        { name: "Collection tales", detail: "The stories behind individual watches and their owners." },
        { name: "Field notes", detail: "Short observations from the bench and the hunt." },
      ]}
    />
  );
}
