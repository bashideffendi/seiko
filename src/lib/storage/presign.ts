// Presigned GET URLs for the catalogue-scan bucket (Railway Storage, S3-compatible).
//
// The bucket is private, so the site never links to it directly: /scan/<key> signs a
// short-lived URL here and redirects to it (see src/app/scan/[...key]/route.ts). AWS
// Signature V4 by hand — query-string auth, virtual-host addressing — to keep the
// server bundle free of the AWS SDK.

import { createHash, createHmac } from "node:crypto";

export interface BucketConfig {
  endpoint: string;
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

/** Bucket settings from the environment, or null when storage isn't configured. */
export function bucketFromEnv(env: NodeJS.ProcessEnv = process.env): BucketConfig | null {
  const { S3_ENDPOINT, S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = env;
  if (!S3_ENDPOINT || !S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) return null;
  return {
    endpoint: S3_ENDPOINT,
    bucket: S3_BUCKET,
    region: S3_REGION || "auto",
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  };
}

const sha256 = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");
const hmac = (key: Buffer | string, s: string) => createHmac("sha256", key).update(s, "utf8").digest();

/** RFC 3986 encoding, as SigV4 wants it (keeps A–Z a–z 0–9 - _ . ~). */
function rfc3986(s: string) {
  return encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

/** A GET URL for `key`, valid for `expires` seconds (SigV4 caps it at 7 days). */
export function presignGet(cfg: BucketConfig, key: string, expires = 604800, now = new Date()): string {
  const base = new URL(cfg.endpoint);
  const host = `${cfg.bucket}.${base.host}`;
  const path = "/" + key.split("/").map(rfc3986).join("/");
  const amzDate = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const day = amzDate.slice(0, 8);
  const scope = `${day}/${cfg.region}/s3/aws4_request`;

  const params: [string, string][] = [
    ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
    ["X-Amz-Credential", `${cfg.accessKeyId}/${scope}`],
    ["X-Amz-Date", amzDate],
    ["X-Amz-Expires", String(Math.min(Math.max(1, Math.floor(expires)), 604800))],
    ["X-Amz-SignedHeaders", "host"],
  ];
  const query = params
    .map(([k, v]) => [rfc3986(k), rfc3986(v)])
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  const canonical = ["GET", path, query, `host:${host}\n`, "host", "UNSIGNED-PAYLOAD"].join("\n");
  const toSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256(canonical)].join("\n");
  const kDate = hmac(`AWS4${cfg.secretAccessKey}`, day);
  const kSigning = hmac(hmac(hmac(kDate, cfg.region), "s3"), "aws4_request");
  const signature = createHmac("sha256", kSigning).update(toSign, "utf8").digest("hex");

  return `${base.protocol}//${host}${path}?${query}&X-Amz-Signature=${signature}`;
}

/** Bucket key for a public catalogue path, or null if it isn't a catalogue scan asset. */
export function scanKey(parts: string[]): string | null {
  const rel = parts.join("/");
  return /^\d{4}\/[a-z0-9-]+\/(pages|thumbs|watches|watches\/sm)\/[a-z0-9-]+\.webp$/.test(rel) ? `catalogue/${rel}` : null;
}
