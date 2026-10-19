// Pure parsing for the Tiny Hour Tales WooCommerce Store API (public, read-only).
// No fetching here — see ./feed.ts. Everything is defensive: the feed is someone
// else's data, so any odd shape yields "no watch", never a crash.

export interface RawStoreImage {
  src?: string;
  thumbnail?: string;
  srcset?: string;
  thumbnail_srcset?: string;
  alt?: string;
}

export interface RawStoreProduct {
  id?: number;
  name?: string;
  permalink?: string;
  on_sale?: boolean;
  prices?: {
    price?: string;
    regular_price?: string;
    currency_code?: string;
    currency_minor_unit?: number;
  };
  images?: RawStoreImage[];
  brands?: { name?: string; slug?: string }[];
  short_description?: string;
  description?: string;
  is_in_stock?: boolean;
  is_purchasable?: boolean;
}

export interface ShopWatch {
  id: number;
  /** Plain-text product name, entities decoded. */
  name: string;
  url: string;
  /** Most specific brand, e.g. "Lassale" rather than its parent "Seiko". */
  brand: string;
  /** Price in major currency units (IDR has none minor), or null if unknown. */
  price: number | null;
  regularPrice: number | null;
  currency: string;
  onSale: boolean;
  image: { src: string; srcSet?: string; alt: string } | null;
  /** Calibers explicitly named in the listing (labelled, movement line, or case ref). */
  calibers: string[];
  /** Case–movement references explicitly named, e.g. "2E20-753A". */
  caseRefs: string[];
  /** "Production era" line as written by the shop, e.g. "Circa 1986 – 1991". */
  era?: string;
}

/** Seiko and the brands Seiko owns/produces. */
const SEIKO_FAMILY = /\b(seiko|grand[\s-]?seiko|king[\s-]?seiko|lord[\s-]?marvel|lassale|credor|pulsar|alba|lorus|dolce|exceline)\b/i;

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", hellip: "…",
};

export function decodeEntities(s: string): string {
  return (s ?? "").replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, body: string) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : m;
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? m;
  });
}

/** HTML → plain text with one line per <br>/<p>, entities decoded. */
export function htmlToLines(html: string): string[] {
  const text = (html ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|div|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  return decodeEntities(text)
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

// A caliber code is 4 characters (e.g. 1E20, 7731, V810), optionally followed by a variant letter (7S26A).
const CODE = "([0-9][0-9A-Z][0-9]{2}|[A-Z][A-Z0-9][0-9]{2})([A-Z])?";
const LABELLED = new RegExp(String.raw`\bcal(?:iber|ibre)?\.?\s*(?:no\.?\s*)?[:#]?\s*\(?` + CODE + String.raw`\b`, "gi");
const MOVEMENT_TOKEN = new RegExp(String.raw`\b` + CODE + String.raw`\b`, "g");
const CASE_REF = /\b([0-9][0-9A-Z][0-9]{2})-([0-9A-Z]{4})\b/g;
const YEARISH = /^(19|20)\d\d$/;

export interface ExtractOptions {
  /** Map a raw code to its canonical caliber key, or null if the code is unknown. */
  resolve?: (code: string) => string | null;
}

/**
 * Pull the caliber(s) and case references a listing explicitly names.
 * Sources, strongest first: a labelled mention ("Cal. 2E20", "Caliber 1E20"), the
 * "Movement:" line of the technical summary, then case refs ("2E20-753A") — the latter
 * only when their prefix is a caliber we already know or one named elsewhere, so a phone
 * number like 0899-5080 can never pose as a caliber.
 */
export function extractMovement(lines: string[], opts: ExtractOptions = {}): { calibers: string[]; caseRefs: string[]; era?: string } {
  const resolve = opts.resolve ?? ((c: string) => c);
  const explicit = new Set<string>();
  const add = (base: string, variant?: string) => {
    const b = base.toUpperCase();
    if (YEARISH.test(b)) return; // "1990s" is an era, not a caliber
    const full = b + (variant ?? "").toUpperCase();
    explicit.add(resolve(full) ?? resolve(b) ?? b);
  };

  let era: string | undefined;
  for (const line of lines) {
    const m = /^([A-Za-z /]+):\s*(.+)$/.exec(line);
    if (!m) continue;
    const label = m[1].trim().toLowerCase();
    const value = m[2].trim();
    if (label === "movement" || label === "caliber" || label === "calibre") {
      for (const t of value.toUpperCase().matchAll(MOVEMENT_TOKEN)) add(t[1], t[2]);
    } else if (label === "production era" || label === "era") {
      era = value;
    }
  }

  const text = lines.join("\n");
  for (const t of text.matchAll(LABELLED)) add(t[1], t[2]);

  const caseRefs = new Set<string>();
  for (const t of text.toUpperCase().matchAll(CASE_REF)) {
    const prefix = t[1];
    const known = resolve(prefix);
    if (explicit.has(prefix) || (known && opts.resolve)) {
      caseRefs.add(`${prefix}-${t[2]}`);
      explicit.add(known ?? prefix);
    }
  }

  return { calibers: [...explicit], caseRefs: [...caseRefs], era };
}

export function isSeikoFamily(p: RawStoreProduct): boolean {
  const brandText = (p.brands ?? []).map((b) => `${b.name ?? ""} ${b.slug ?? ""}`).join(" ");
  return SEIKO_FAMILY.test(brandText) || SEIKO_FAMILY.test(decodeEntities(p.name ?? ""));
}

function money(raw: string | undefined, minor: number | undefined): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return n / 10 ** (minor ?? 0);
}

/** Only accept links back into the shop itself. */
function isShopUrl(url: string | undefined, origin: string): url is string {
  if (!url) return false;
  try {
    const u = new URL(url);
    const o = new URL(origin);
    return u.protocol === "https:" && (u.hostname === o.hostname || u.hostname.endsWith(`.${o.hostname}`));
  } catch {
    return false;
  }
}

export function parseStoreProduct(p: RawStoreProduct, origin: string, opts: ExtractOptions = {}): ShopWatch | null {
  if (!p || typeof p.id !== "number" || !p.name || !isShopUrl(p.permalink, origin)) return null;
  if (p.is_in_stock === false || p.is_purchasable === false) return null;

  const name = decodeEntities(p.name).replace(/\s+/g, " ").trim();
  const brands = (p.brands ?? []).map((b) => decodeEntities(b.name ?? "").trim()).filter(Boolean);
  const brand = brands[0] ?? (SEIKO_FAMILY.exec(name)?.[1] ?? "Seiko");

  const img = (p.images ?? [])[0];
  const imgSrc = img?.thumbnail || img?.src;
  const image = isShopUrl(imgSrc, origin)
    ? { src: imgSrc, srcSet: img?.thumbnail_srcset || img?.srcset || undefined, alt: decodeEntities(img?.alt ?? "").trim() || name }
    : null;

  const lines = [...htmlToLines(p.short_description ?? ""), ...htmlToLines(p.description ?? "")];
  const movement = extractMovement(lines, opts);

  return {
    id: p.id,
    name,
    url: p.permalink!,
    brand: brand.charAt(0).toUpperCase() + brand.slice(1),
    price: money(p.prices?.price, p.prices?.currency_minor_unit),
    regularPrice: money(p.prices?.regular_price, p.prices?.currency_minor_unit),
    currency: p.prices?.currency_code ?? "IDR",
    onSale: !!p.on_sale,
    image,
    ...movement,
  };
}

/** Parse a Store API products response into in-stock Seiko-family watches. */
export function parseSeikoWatches(json: unknown, origin: string, opts: ExtractOptions = {}): ShopWatch[] {
  if (!Array.isArray(json)) return [];
  const out: ShopWatch[] = [];
  for (const raw of json as RawStoreProduct[]) {
    if (!raw || typeof raw !== "object" || !isSeikoFamily(raw)) continue;
    const w = parseStoreProduct(raw, origin, opts);
    if (w) out.push(w);
  }
  return out;
}

export function formatPrice(w: Pick<ShopWatch, "price" | "currency">): string | null {
  if (w.price == null) return null;
  if (w.currency === "IDR") return `Rp ${Math.round(w.price).toLocaleString("id-ID")}`;
  return `${w.currency} ${w.price.toLocaleString("en-US")}`;
}

const keyOf = (s: string) => s.toUpperCase().replace(/[\s-]+/g, "");

/** Watches naming this caliber, and the rest (never claimed as a match). */
export function shelfForCaliber(watches: ShopWatch[], caliber: string): { matched: ShopWatch[]; others: ShopWatch[] } {
  const key = keyOf(caliber);
  const matched = watches.filter((w) => w.calibers.some((c) => keyOf(c) === key));
  const ids = new Set(matched.map((w) => w.id));
  return { matched, others: watches.filter((w) => !ids.has(w.id)) };
}

/** Exact case-ref matches first, then same-caliber, then the rest. */
export function shelfForModel(
  watches: ShopWatch[],
  model: { caseRef?: string | null; caliber?: string | null },
): { exact: ShopWatch[]; sameCaliber: ShopWatch[]; others: ShopWatch[] } {
  const ref = model.caseRef ? keyOf(model.caseRef) : null;
  const exact = ref ? watches.filter((w) => w.caseRefs.some((r) => keyOf(r) === ref)) : [];
  const taken = new Set(exact.map((w) => w.id));
  const cal = model.caliber ? keyOf(model.caliber) : null;
  const sameCaliber = cal ? watches.filter((w) => !taken.has(w.id) && w.calibers.some((c) => keyOf(c) === cal)) : [];
  sameCaliber.forEach((w) => taken.add(w.id));
  return { exact, sameCaliber, others: watches.filter((w) => !taken.has(w.id)) };
}
