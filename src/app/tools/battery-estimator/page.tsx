import type { Metadata } from "next";
import { ComingSoon } from "@/components/page";

export const metadata: Metadata = { title: "Battery Estimator" };

export default function BatteryEstimatorPage() {
  return (
    <ComingSoon
      eyebrow="Tool · Battery Estimator"
      title={<>When does the <span className="italic text-[var(--burgundy-600)]">quartz</span> need a battery?</>}
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
