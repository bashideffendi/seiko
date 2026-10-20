// Catalogue scan assets that live in the private bucket rather than /public.
//
// /catalogue/<year>/<id>/... is served from /public when the file is there (the 1975
// pilot); anything else falls through (next.config rewrites → fallback) to this route,
// which redirects to a signed bucket URL. The redirect itself is cached at the edge for a
// day, well inside the URL's seven-day lifetime, so most requests never reach here.

import { bucketFromEnv, presignGet, scanKey } from "@/lib/storage/presign";

export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const objectKey = scanKey(key);
  const cfg = bucketFromEnv();
  if (!objectKey || !cfg) return new Response("Not found", { status: 404 });
  return new Response(null, {
    status: 302,
    headers: {
      Location: presignGet(cfg, objectKey),
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
