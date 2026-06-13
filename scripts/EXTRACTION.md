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
> Record shape: `{page, section, ref, caliber, jewels, price, specs, notes, conf}`
> (conf = high|medium|low). Extract only what's legible; blank + conf "low" for
> illegible digits; never invent.
>
> **Write the JSON array (and nothing else) to this exact path using the Write
> tool: `<batch outFile>`. Then reply only: done <N records>.**

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
