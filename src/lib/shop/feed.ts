import { findCaliber } from "@/data/calibers";
import { SHOP_ORIGIN } from "@/lib/site";
import { parseSeikoWatches, type ShopWatch } from "./parse";

// Server-side read of the shop's public WooCommerce Store API (no auth, read-only —
// we never write to the shop). Fetched on the server so there's no CORS, and cached
// with ISR so the shop sees at most one request per revalidation window.

/** How long a fetched shop feed stays fresh, in seconds (keep in sync with page `revalidate`). */
export const SHOP_REVALIDATE_SECONDS = 1800;

const FIELDS = [
  "id", "name", "permalink", "on_sale", "prices", "images", "brands",
  "short_description", "description", "is_in_stock", "is_purchasable",
].join(",");

export const STORE_API_URL =
  `${SHOP_ORIGIN}/wp-json/wc/store/v1/products?per_page=100&stock_status=instock&_fields=${FIELDS}`;

const resolveCaliber = (code: string) => findCaliber(code)?.caliber ?? null;

async function fetchFeed(): Promise<ShopWatch[]> {
  if (process.env.SHOP_FEED === "off") return [];
  try {
    const res = await fetch(STORE_API_URL, {
      headers: {
        Accept: "application/json",
        "User-Agent": "SeikoAlmanac/1.0 (+https://seiko.tinyhourtales.com)",
      },
      next: { revalidate: SHOP_REVALIDATE_SECONDS, tags: ["shop-feed"] },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    if (!(res.headers.get("content-type") ?? "").includes("json")) return [];
    const json: unknown = await res.json();
    return parseSeikoWatches(json, SHOP_ORIGIN, { resolve: resolveCaliber });
  } catch {
    // Shop unreachable, slow, or answering with a bot challenge: the shelf just hides.
    return [];
  }
}

// One in-flight request per server process: static generation renders hundreds of
// caliber/model pages in parallel, and they should share a single fetch.
let memo: { at: number; promise: Promise<ShopWatch[]> } | null = null;
const MEMO_MS = 5 * 60 * 1000;

/** In-stock Seiko-family watches at Tiny Hour Tales, newest first. Never throws; [] on failure. */
export function getShopSeikoWatches(): Promise<ShopWatch[]> {
  const now = Date.now();
  if (!memo || now - memo.at > MEMO_MS) memo = { at: now, promise: fetchFeed() };
  return memo.promise;
}
