"""
Phase 3 pipeline — STEP 1: render a catalog's pages + emit a batch plan.

Renders every page of a catalogue PDF to PNG (vision-extraction quality) and
writes a `_plan.json` describing how to fan the pages out across subagents.
Each batch has an output file the subagent will WRITE its JSON to (step 2),
which the merge script (step 3) then combines — no hand-transcription.

Usage:
  python scripts/render_catalog.py --pdf "D:\\...\\1974 Seiko V2.pdf" --id 1974-1974-seiko-v2
  [--dpi 210] [--batch 9] [--force]
"""
import sys, os, re, json, glob, argparse

import fitz  # PyMuPDF

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PILOT = os.path.join(HERE, ".pilot")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pdf", required=True, help="absolute path to the catalogue PDF")
    ap.add_argument("--id", required=True, help="catalogue id (matches catalogue.json id)")
    ap.add_argument("--dpi", type=int, default=210)
    ap.add_argument("--batch", type=int, default=9, help="pages per subagent batch")
    ap.add_argument("--force", action="store_true", help="re-render even if PNG exists")
    args = ap.parse_args()

    outdir = os.path.join(PILOT, args.id)
    os.makedirs(outdir, exist_ok=True)

    doc = fitz.open(args.pdf)
    n = doc.page_count
    zoom = args.dpi / 72
    paths = []
    for i in range(n):
        p = os.path.join(outdir, f"p{i:03d}.png")
        if args.force or not os.path.exists(p):
            pix = doc[i].get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
            pix.save(p)
        paths.append(p)
    doc.close()

    # build batch plan
    batches = []
    for bi, start in enumerate(range(0, n, args.batch), 1):
        chunk = paths[start:start + args.batch]
        batches.append({
            "batch": bi,
            "outFile": os.path.join(outdir, f"batch-{bi:02d}.json"),
            "pages": chunk,
        })
    plan = {"id": args.id, "pdf": args.pdf, "pages": n, "dpi": args.dpi, "batches": batches}
    with open(os.path.join(outdir, "_plan.json"), "w", encoding="utf-8") as f:
        json.dump(plan, f, ensure_ascii=False, indent=1)

    print(f"rendered {n} pages -> {outdir}  ({len(batches)} batches of {args.batch})")
    print(f"plan: {os.path.join(outdir, '_plan.json')}")
    print()
    for b in batches:
        print(f"--- batch {b['batch']:02d}  ->  {b['outFile']}")
        for p in b["pages"]:
            print(f"    {p}")


if __name__ == "__main__":
    main()
