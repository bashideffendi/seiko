// GET /api/decode?serial=7N0142&caseback=6139-6002 — the Year Finder as JSON, for the shop's
// product studio (it stores the result on the listing). Same decoder and catalogue evidence as
// /tools/serial-decoder. `caliber` + `case` may be given instead of `caseback`.
import { decodeSerial } from "@/lib/seiko/decodeCore";
import { decoderCalibers } from "@/lib/seiko/attestation";
import { SITE_URL } from "@/lib/site";

const DATA = decoderCalibers();

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET" };

export function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const serial = (q.get("serial") ?? "").trim().slice(0, 12);
  const caseback = (q.get("caseback") ?? [q.get("caliber"), q.get("case")].filter(Boolean).join("-")).trim().slice(0, 12);
  const r = decodeSerial(serial, DATA, { caliber: caseback || undefined });
  const link = new URL("/tools/serial-decoder", SITE_URL);
  if (serial) link.searchParams.set("serial", serial.toUpperCase());
  if (caseback) link.searchParams.set("caliber", caseback.toUpperCase());

  if (!r.ok || !r.decoded) {
    return Response.json({ ok: false, error: r.error, decoderUrl: link.href }, { status: 200, headers: CORS });
  }
  const d = r.decoded;
  const n = d.narrowing;
  const years = n && !n.contradiction ? n.likelyYears : d.candidateYears;
  const year = years.length === 1 ? years[0] : null;
  return Response.json(
    {
      ok: true,
      month: d.month,
      /** Single year when the decade is resolved, else null (see `years`). */
      year,
      years,
      confidence: r.confidence,
      caliber: n?.caliberMatched?.caliber ?? n?.caliberQueried ?? null,
      caliberKnown: !!n?.caliberMatched,
      caseCode: n?.caseCode ?? null,
      contradiction: !!n?.contradiction,
      evidenceOnly: !!n?.caliberMatched?.attestedOnly,
      /** Ready-to-show English text: "November 1977" or "November 1967 or 1977". */
      label: year ? `${d.month.name} ${year}` : `${d.month.name} ${years.join(" or ")}`,
      notes: r.notes.map((x) => ({ code: x.code, message: x.message })),
      decoderUrl: link.href,
    },
    { headers: { ...CORS, "Cache-Control": "public, max-age=300, s-maxage=86400" } },
  );
}
