# Seiko Almanac

Tools & catalogue for Seiko collectors — a field guide from **Tiny Hour Tales**.
Target: **seiko.tinyhourtales.com**

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4
- Vitest (unit tests for the decode core)
- Fonts: Cormorant Garamond (display) · Inter (body) · JetBrains Mono (technical)

## What's live (Phase 1)

- **Serial Decoder** (`/tools/serial-decoder`) — decodes month + candidate years from a Seiko
  caseback serial; narrows the decade using the caliber. Pure, client-side, no network calls.
- **Caliber Lookup** (`/tools/caliber-lookup`) — searchable movement database (~30 calibers).
- Full site shell: Home, Tools, Catalogue overview, Learn, Stories, footer pages.
- Model Finder / Strap Size / Battery Estimator — designed "coming soon" placeholders.

## Decode core

The credibility-critical logic is pure and dependency-free:

- `src/lib/seiko/decode.ts` — `decodeSeiko(serial, { caliber? })`
- `src/lib/seiko/types.ts` — the `DecodeResult` / `CaliberRecord` contract
- `src/data/calibers.ts` — caliber dataset + canonical-key resolution
- `src/lib/seiko/decode.test.ts` — 23 unit tests (`npm test`)

## Scripts

```bash
npm run dev     # memory-capped dev server (NODE_OPTIONS=3072)
npm run build   # memory-capped build (NODE_OPTIONS=4096)
npm test        # vitest run
npm run lint
```

## Roadmap

- **Phase 2** — browsable catalogue: extract the text layer from the ~66 text-bearing Seiko
  catalogues into a search index; serve the 3 GB of scans from object storage (Cloudflare R2),
  never committed to git.
- **Phase 3** — structured catalogue data (ref / model / caliber / year / case / price) extracted
  from the ~59 image-only scans via AI vision, piloted on one line (Prospex) first.

Source assets live outside the repo at `D:\Claude-Projects\Seiko\`.

> Not affiliated with Seiko Watch Corporation. The serial-dating scheme is a community
> convention, not an official Seiko standard.
