"""
Old model URLs → where they live now, after a catalogue's refs were re-read.

  python scripts/model_redirects.py [--base main]

Compares every model slug in `--base` (git ref, default main) with the working tree. A slug
that disappeared is redirected to its replacement's model page when a re-verification map
says which ref replaced it (and that ref has a page), otherwise to the model search for the
old ref — never to a guess. Writes src/data/model-redirects.json ({old slug: path}), read by
src/proxy.ts.

Maps per catalogue (written by the digitisation runs, kept in scripts/ref-maps/<id>.json):
{"refs": {"old ref": "new ref", ...}} — only confident one-to-one replacements.
"""
import os, re, json, glob, argparse, subprocess
from urllib.parse import quote

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(HERE, "src", "data")
MAPS = os.path.join(HERE, "scripts", "ref-maps")


def normalize(ref):
    # same as normalizeRef() in src/lib/seiko/refs.ts
    s = re.sub(r"\s+", "", ref.strip().upper())
    return re.sub("[‐-―−]", "-", s)


def slugify(ref):
    # same as slugify() in src/lib/modelIndex.ts
    return re.sub(r"[^a-z0-9]+", "-", normalize(ref).lower()).strip("-")


def refs_of(data):
    return [r["ref"] for r in data.get("records", []) if r.get("ref", "").strip()]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="main")
    a = ap.parse_args()

    new_refs = {}
    for f in glob.glob(os.path.join(DATA, "models-*.json")):
        for ref in refs_of(json.load(open(f, encoding="utf-8"))):
            new_refs.setdefault(slugify(ref), ref)

    names = subprocess.run(["git", "ls-tree", "--name-only", a.base, "src/data/"], cwd=HERE,
                           capture_output=True, text=True, check=True).stdout.split()
    old_refs = {}
    for name in names:
        if not re.match(r"src/data/models-.*\.json$", name):
            continue
        raw = subprocess.run(["git", "show", f"{a.base}:{name}"], cwd=HERE, capture_output=True, check=True).stdout
        for ref in refs_of(json.loads(raw.decode("utf-8"))):
            old_refs.setdefault(slugify(ref), ref)

    replaced = {}
    for f in sorted(glob.glob(os.path.join(MAPS, "*.json"))):
        for old, new in json.load(open(f, encoding="utf-8")).get("refs", {}).items():
            replaced.setdefault(slugify(old), slugify(new))

    out, to_page, to_search = {}, 0, 0
    for s, ref in sorted(old_refs.items()):
        if not s or s in new_refs:
            continue
        target = replaced.get(s)
        if target and target in new_refs:
            out[s] = f"/catalogue/model/{target}"
            to_page += 1
        else:
            out[s] = f"/catalogue/models?q={quote(ref, safe='')}"
            to_search += 1
    path = os.path.join(DATA, "model-redirects.json")
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=0, sort_keys=True)
        fh.write("\n")
    print(f"old slugs {len(old_refs)}, now {len(new_refs)}; gone {len(out)} -> model page {to_page}, search {to_search}")
    print(f"-> {os.path.relpath(path, HERE)}")


if __name__ == "__main__":
    main()
