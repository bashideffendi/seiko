import { ComingSoon } from "@/components/page";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta({
  title: 'Battery Estimator',
  description: 'Quartz battery age and change reminders — a tool in the workshop at the Seiko Almanac.',
  path: '/tools/battery-estimator',
  noindex: true,
});

export default function BatteryEstimatorPage() {
  return (
    <ComingSoon
      eyebrow="Tool · Battery Estimator"
      title={<>When does the <em>quartz</em> need a battery?</>}
      lead="Estimate remaining battery life for a quartz Seiko from its caliber and last change date — and set yourself a reminder."
      features={[
        { name: "Caliber-based life", detail: "Typical battery life per quartz caliber, from the database." },
        { name: "Last-change tracking", detail: "Enter when it was last serviced for a remaining-life estimate." },
        { name: "EOL behaviour", detail: "Notes on end-of-life seconds-hand indicators per movement." },
        { name: "Reminders", detail: "Optional calendar reminder before the battery is due." },
      ]}
    />
  );
}
