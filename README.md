# Seiko Almanac

Tools & catalogue for Seiko collectors — the reference desk of **Tiny Hour Tales**.
Live at **https://seiko.tinyhourtales.com** (Vercel, auto-deploys from `main`).

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4
- Vitest (decoder, caliber data integrity, shop-feed parser)
- House style of the shop (THT Design): maroon `#490B18` / deep maroon `#2B0710` / ivory & linen /
  ink `#1E1714`; Bodoni Moda (display) + Jost (text); Geist Mono for technical data only.

## What's live

- **Year Finder / Serial Decoder** — `/tools/serial-decoder?serial=7N0142&caliber=6309`
  (also `/year-finder`, which redirects with the query). The inputs stay mirrored in the URL,
  so a result can be shared. Decoding is pure and runs in the browser.
- **Caliber Lookup** (`/tools/caliber-lookup`) and a page per caliber (`/caliber/[caliber]`).
- **Catalogue** — 125 original catalogues (`/catalogue/archive`) and a page per model reference
  (`/catalogue/model/[slug]`), browsable at `/catalogue/models` (`?q=`, `?caliber=`, `?catalog=`).
- **Vintage Case Codes** (`/tools/vintage-case-code`) for pre-1966 watches; **Learn** guides.
- **Available at Tiny Hour Tales** — live, in-stock Seiko-family watches (Seiko, Lassale, Credor,
  Pulsar, Alba, Lorus, Grand/King Seiko) on the home, caliber and model pages.

## Shop integration

`src/lib/shop/feed.ts` reads the shop's public WooCommerce Store API on the server
(`/wp-json/wc/store/v1/products?stock_status=instock`, read-only, no auth) with
`next.revalidate = 1800` (ISR, 30 minutes) and one in-flight request per process. Any failure —
network, non-JSON, bot challenge — returns `[]` and the shelf simply doesn't render.
`src/lib/shop/parse.ts` (pure, tested) keeps Seiko-family brands and pulls the caliber/case ref
the listing *explicitly* names ("Cal. 2E20", the "Movement:" line, "2E20-753A"). A watch is only
shown as a match when the shop's own text names that caliber or reference; otherwise the shelf
says plainly that these are simply the Seiko pieces available now. Set `SHOP_FEED=off` to disable.

## Decode core

- `src/lib/seiko/decodeCore.ts` — pure decoder, takes the caliber dataset as an argument
- `src/lib/seiko/decode.ts` — `decodeSeiko(serial, { caliber? })` with the bundled dataset
- `src/data/calibers.ts` — three tiers (core → extended → supplement); earlier tier wins,
  keys normalised to uppercase. Aliases must be variant suffixes, never another caliber.
- Client pages receive a slim caliber dataset as props (`slimCalibers()`), and the model browser
  loads its index from the static `/api/models` only when filtering — no catalogue JSON in bundles.

## Scripts

```bash
npm run build   # memory-capped build (NODE_OPTIONS=4096) — needs ~3 GB free RAM locally
npm test        # vitest run
npm run lint
```

After a build, verify prerendered HTML has content (a page that hits `notFound()` still builds).

> Not affiliated with Seiko Watch Corporation. The serial-dating scheme is a community
> convention, not an official Seiko standard.
