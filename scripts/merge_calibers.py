#!/usr/bin/env python3
"""Merge per-family caliber JSON (from the vision/compile workflow) into one
extended dataset: src/data/calibers-extended.json.

Reads every .pilot/calibers/*.json (each a JSON array of caliber records),
normalises endYear 9999 -> null, dedupes by canonical caliber key, and writes a
single sorted array. The core hand-curated set in calibers.ts stays authoritative
and is merged at runtime (core wins on key collisions).

Run:  python scripts/merge_calibers.py
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / ".pilot" / "calibers"
OUT = ROOT / "src" / "data" / "calibers-extended.json"

ALLOWED_TYPES = {
    "automatic", "manual", "quartz", "digital-quartz",
    "spring-drive", "solar", "kinetic",
}


def canon(s: str) -> str:
    return re.sub(r"[\s-]+", "", (s or "").strip().upper())


def clean(rec: dict) -> dict | None:
    cal = (rec.get("caliber") or "").strip().upper()
    if not cal:
        return None
    out: dict = {"caliber": cal}
    if rec.get("aliases"):
        out["aliases"] = [a.strip().upper() for a in rec["aliases"] if a and a.strip()]
    start = rec.get("startYear")
    end = rec.get("endYear")
    if not isinstance(start, int):
        return None
    out["startYear"] = start
    out["endYear"] = None if (end is None or end == 9999 or (isinstance(end, int) and end >= 9999)) else end
    mt = (rec.get("movementType") or "").strip()
    out["movementType"] = mt if mt in ALLOWED_TYPES else "automatic"
    if isinstance(rec.get("jewels"), int):
        out["jewels"] = rec["jewels"]
    if rec.get("family"):
        out["family"] = rec["family"].strip()
    if rec.get("notableRefs"):
        out["notableRefs"] = [r.strip() for r in rec["notableRefs"] if r and r.strip()]
    if rec.get("notes"):
        out["notes"] = rec["notes"].strip()
    if rec.get("longRun"):
        out["longRun"] = True
    if rec.get("grandSeiko"):
        out["grandSeiko"] = True
    rc = rec.get("rangeConfidence")
    out["rangeConfidence"] = rc if rc in ("established", "approximate") else "approximate"
    return out


def main() -> int:
    if not SRC.exists():
        print(f"no source dir: {SRC}", file=sys.stderr)
        return 1
    by_key: dict[str, dict] = {}
    files = sorted(SRC.glob("*.json"))
    raw_count = 0
    for f in files:
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            print(f"skip {f.name}: {e}", file=sys.stderr)
            continue
        if not isinstance(data, list):
            print(f"skip {f.name}: not a JSON array", file=sys.stderr)
            continue
        for rec in data:
            raw_count += 1
            c = clean(rec)
            if not c:
                continue
            key = canon(c["caliber"])
            # first occurrence wins; merge notableRefs/aliases if dup
            if key in by_key:
                ex = by_key[key]
                for fld in ("aliases", "notableRefs"):
                    if c.get(fld):
                        ex[fld] = sorted(set(ex.get(fld, []) + c[fld]))
                continue
            by_key[key] = c

    records = sorted(by_key.values(), key=lambda r: (r["startYear"], r["caliber"]))
    OUT.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(files)} files | {raw_count} raw -> {len(records)} unique calibers -> {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
