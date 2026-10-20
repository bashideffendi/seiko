# Catalogue vision-extraction pipeline (Phase 3)

Turns scanned catalogue pages into structured model records — **in-harness vision,
no paid API**. The key to scaling: subagents **write their JSON to a file**, a
Python script merges. Nothing is hand-transcribed.

## Flow

```
STEP 1  render  →  STEP 2  extract (subagents write files)  →  STEP 3  merge  →  wire
```

### Step 1 — render + plan
```
python scripts/render_catalog.py --pdf "<abs path to PDF>" --id <catalogue-id>
```
Renders every page to `.pilot/<id>/pNNN.png` and prints a batch plan: for each
batch, the **output file** and the **page paths**. Copy those into the Step-2
subagent prompts.

### Step 2 — extract (one subagent per batch, in parallel)
Spawn one general-purpose Agent per batch. **Each agent WRITES its JSON array to
the batch's outFile** (do not return the JSON as text). Prompt template:

> Extract structured watch data from these scanned Seiko catalogue pages
> (**\<catalog name / JDM or export\>**). Do NOT invoke any skills.
>
> Read EACH image with the Read tool: \<paste the batch's page paths\>
>
> For EVERY watch, build one record. Read the small caption text:
> ref/model code, caliber (4-digit when the ref is `CCCC-NNNN`), jewels (`NN石`
> on JDM / `L NN` on export), price, specs (SS/SGP/TSGP/WP/MB/auto/chrono/diver),
> section header, dial colour. Skip covers / dividers / text-only pages.
>
> **Price:** copy it exactly as printed, currency included (`¥32,000`, `32,000円`,
> `$125`); several variants stay together (`¥16,000 (SS·WP·MB) / ¥18,500 (SGP·WP·MB)`).
> The site writes yen one way on display (`src/lib/seiko/price.ts`).
>
> **Bracelet / strap codes (`B/R …`, `S/R …`) start with a LETTER** — `B702S`,
> `Z529G`, `M509S`, `Q514S`, `E507S`, `BLL46` — then three characters and a colour
> suffix (S steel, G gold, Y two-tone). A leading digit (`8702S`, `2529G`) is a
> misread B or Z; zoom in before writing it.
>
> Record shape: `{page, section, ref, caliber, jewels, price, specs, notes, conf}`
> (conf = high|medium|low). Extract only what's legible; blank + conf "low" for
> illegible digits; never invent.
>
> **Write the JSON array (and nothing else) to this exact path using the Write
> tool: `<batch outFile>`. Then reply only: done <N records>.**

Lesson (1975 pilot, Oct 2026): the first pass misread 139 of 150 bracelet codes
(B→8, Z→2, S/G swapped). Refs and jewels were right. After every batch, eyeball a
contact sheet of the caption crops before trusting the bracelet field.

Tip: at 210 DPI the men's mechanical lines read well (and expose calibers);
ladies / bracelet / fancy / stopwatch refs are often too small — those pages
need per-watch crops or a higher-DPI rescan.

### Step 3 — merge
```
python scripts/merge_models.py --id <catalogue-id> --title "<Title>" --year <YYYY> --edition "<JDM|export>"
```
Reads `.pilot/<id>/batch-*.json`, normalizes + dedups + drops empty-ref rows
(use `--keep-empty` to keep them), writes `src/data/models-<id>.json`, prints stats.

### Step 4 — wire
Add one line to `MODEL_SETS` in `src/lib/models.ts`:
```ts
import catXXXX from "@/data/models-<id>.json";
// ...
"<id>": catXXXX as CatalogModelSet,
```
The archive card then shows an "N models" badge and the modal lists them; refs
and calibers become searchable. `.pilot/` is gitignored (render artifacts).
```

## Step 5 — digitise (every watch photo becomes its own record photo)

```
python scripts/digitize_catalog.py detect --id <catalogue-id> --pdf "<abs path to PDF>"   # render 250 DPI + find photos
python scripts/digitize_catalog.py apply  --id <catalogue-id>                              # bbox + photo onto each record
python scripts/digitize_catalog.py export --id <catalogue-id> --source "<file.pdf>" [--labels '{"28":"Index"}']
```
`detect` finds each watch photo on a page (paper → ink mask → tall structures only, so type,
captions and pen marks drop out → rows of photos → columns), pairs the boxes with that page's
records **in reading order**, and draws a check sheet per page in `.pilot/<id>/check/`
(box + assigned ref over the page). Read every check sheet: the label must match the printed
"Ref." under the photo. Fix a box by hand in `scripts/bbox-overrides/<id>.json`
(`"<page>:<k>": [x, y, w, h]`, k = 1-based reading-order position; `null` = no photo).
The catalogue's own index page, when it has one, is the best cross-check for refs.

`export` writes `public/catalogue/<year>/<id>/{pages,thumbs,watches,watches/sm}/` (WebP) and
the page manifest `src/data/scans/<id>.json`; register it in `SCAN_SETS` (`src/lib/scans.ts`).
All URLs go through `catalogueAssetUrl()` — to serve from Cloudflare R2 instead of /public,
upload the same `<year>/<id>/…` tree and set `NEXT_PUBLIC_CATALOGUE_ASSET_BASE`.
Pilot (1975 Seiko Catalog, 30 pages): 150/150 photos found automatically, 0 hand fixes, 9.5 MB.
