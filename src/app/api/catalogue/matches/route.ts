// GET /api/catalogue/matches?caliber=6309&case=7040 — catalogued models for a caseback number.
import { catalogueMatches } from "@/lib/catalogueMatches";

const CALIBER = /^[0-9][0-9A-Z][0-9]{2}$/;
const CASE = /^[0-9A-Z]{3,4}$/;

export function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  // The decoder sends the matched caliber (6309, not 6309A).
  const caliber = (q.get("caliber") ?? "").trim().toUpperCase();
  const caseCode = (q.get("case") ?? "").trim().toUpperCase() || null;
  if (!CALIBER.test(caliber) || (caseCode && !CASE.test(caseCode))) {
    return Response.json({ error: "caliber must look like 6309 (and case like 7040)" }, { status: 400 });
  }
  return Response.json(catalogueMatches(caliber, caseCode), {
    headers: { "Cache-Control": "public, max-age=600, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
