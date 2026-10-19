import { ALL_MODEL_ENTRIES } from "@/lib/modelIndex";
import { compactModel } from "@/lib/modelCompact";

// Prerendered at build into a static, CDN-cached JSON file: the compact model index
// the /catalogue/models browser loads on demand (instead of bundling every record).
export const dynamic = "force-static";

export function GET() {
  return Response.json(ALL_MODEL_ENTRIES.map(compactModel), {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
