"""
Phase 3 pipeline — STEP 3: merge subagent batch files into one models JSON.

Reads every `batch-*.json` a subagent wrote into `.pilot/<id>/` (each a JSON
array of records), normalizes to the canonical schema, dedups, sorts by page,
and writes `src/data/models-<id>.json`. No hand-transcription anywhere.

Usage:
  python scripts/merge_models.py --id 1974-1974-seiko-v2 \
     --title "1974 Seiko Catalog Vol.2" --year 1974 --edition "JDM" [--keep-empty]
"""
import os, re, json, glob, argparse

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PILOT = os.path.join(HERE, ".pilot")
DATA = os.path.join(HERE, "src", "data")

FIELDS = ["page", "section", "ref", "code", "caliber", "jewels", "price",
          "specs", "dial", "case", "bracelet", "wr", "notes", "conf"]


def normalize(rec):
    out = {}
    for k in FIELDS:
        v = rec.get(k, None)
        if k == "page":
            out[k] = int(v) if isinstance(v, (int, float, str)) and str(v).strip().lstrip("-").isdigit() else (v if isinstance(v, int) else 0)
        elif k == "jewels":
            out[k] = v if isinstance(v, int) else None
        elif k == "conf":
            out[k] = v if v in ("high", "medium", "low") else "low"
        else:
            # string fields: coerce lists/numbers an agent may emit into a string
            if isinstance(v, list):
                v = " · ".join(str(x) for x in v if x is not None and str(x).strip())
            elif v is not None and not isinstance(v, str):
                v = str(v)
            out[k] = (v or "")
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--id", required=True)
    ap.add_argument("--title", required=True)
    ap.add_argument("--year", type=int, required=True)
    ap.add_argument("--edition", default="")
    ap.add_argument("--note", default="")
    ap.add_argument("--keep-empty", action="store_true", help="keep records with empty ref")
    args = ap.parse_args()

    indir = os.path.join(PILOT, args.id)
    batch_files = sorted(glob.glob(os.path.join(indir, "batch-*.json")))
    if not batch_files:
        raise SystemExit(f"no batch-*.json found in {indir} — run extraction (step 2) first")

    records, errors = [], []
    for bf in batch_files:
        try:
            arr = json.load(open(bf, encoding="utf-8"))
            if not isinstance(arr, list):
                errors.append((bf, "not a JSON array"))
                continue
            for rec in arr:
                records.append(normalize(rec))
        except Exception as e:
            errors.append((bf, str(e)))

    if not args.keep_empty:
        records = [r for r in records if r["ref"].strip()]

    # dedup by (ref, page); keep first
    seen, deduped = set(), []
    for r in records:
        key = (r["ref"].upper(), r["page"])
        if r["ref"] and key in seen:
            continue
        seen.add(key)
        deduped.append(r)
    deduped.sort(key=lambda r: (r["page"], r["ref"]))

    # drop always-empty columns to keep the file lean
    nonempty_cols = {k for r in deduped for k in FIELDS if r.get(k) not in ("", None)}
    lean = [{k: r[k] for k in FIELDS if k in nonempty_cols} for r in deduped]

    pages = max((r["page"] for r in deduped), default=0)
    out = {
        "catalog": {
            "id": args.id, "title": args.title, "year": args.year,
            "edition": args.edition, "note": args.note,
            "method": "vision extraction in-harness (no paid API): pages rendered, read by Claude subagents writing batch JSON",
            "pages": pages, "records": len(lean),
        },
        "records": lean,
    }
    outpath = os.path.join(DATA, f"models-{args.id}.json")
    with open(outpath, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)

    import collections
    conf = collections.Counter(r["conf"] for r in deduped)
    print(f"merged {len(batch_files)} batch files -> {outpath}")
    print(f"  records: {len(lean)} | conf: {dict(conf)} | with-caliber: {sum(1 for r in deduped if r.get('caliber'))}")
    if errors:
        print("  ERRORS:")
        for bf, e in errors:
            print("   ", os.path.basename(bf), e)
    print()
    print(f"Next: add  \"{args.id}\": catXXXX  to MODEL_SETS in src/lib/models.ts")


if __name__ == "__main__":
    main()
