"""
Phase 2 — catalogue extraction (free, no AI).

Walks the Seiko catalogue PDFs and produces:
  - public/catalogue/covers/<id>.jpg   (cover thumbnail per catalogue)
  - src/data/catalogue.json            (metadata + text snippet + detected refs/calibers)

The 3 GB of full scans stay OUT of the repo; only ~500px covers + text are committed.
Re-runnable: existing covers are skipped unless --force.

Usage:  python scripts/extract_catalogue.py [--force]
"""
import sys, os, re, json, glob

import fitz  # PyMuPDF

SRC = r"D:\Claude-Projects\Seiko\Seiko Catalogue"
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COVERS_DIR = os.path.join(HERE, "public", "catalogue", "covers")
OUT_JSON = os.path.join(HERE, "src", "data", "catalogue.json")
COVER_W = 480
FORCE = "--force" in sys.argv

# Known calibers to cross-link against the caliber database (canonical keys + a few aliases).
KNOWN_CALIBERS = [
    "6602", "6619", "5606", "5626", "6105", "6119", "6139", "6138", "7016", "7018",
    "7019", "6309", "7009", "7002", "7S26", "7S36", "4R35", "4R36", "NH35", "NH36",
    "6R15", "6R35", "8L35", "8L55", "9S55", "9S65", "9R65", "7T92", "7T62", "7N43",
    "7N42", "V157", "V147", "5M62", "5M63",
]
CALIBER_RE = re.compile(r"(?<![A-Z0-9])(" + "|".join(KNOWN_CALIBERS) + r")(?![A-Z0-9])", re.I)
# vintage case refs (6309-7040) + modern JDM refs (SBDX035, SARB033, SPB143J1)
CASEREF_RE = re.compile(r"\b\d{4}-\d{4}\b")
MODELREF_RE = re.compile(r"\b[A-Z]{2,4}\d{3,5}[A-Z]?\d?\b")
CJK_RE = re.compile(r"[぀-ヿ㐀-鿿]")
LATIN_RE = re.compile(r"[A-Za-z]")


def slugify(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def clean_title(filename: str) -> str:
    t = re.sub(r"\.pdf$", "", filename, flags=re.I)
    # drop a leading year / year-range and separators
    t = re.sub(r"^\s*\d{4}(-\d{4})?\s*[-_ ]*", "", t)
    t = t.replace("-", " ").replace("_", " ")
    t = re.sub(r"\s+", " ", t).strip()
    # tidy a few lowercase-only filenames
    if t and t.islower():
        t = t.title().replace(" Jp", " JP").replace(" V1", " V1").replace(" V2", " V2")
    return t or "Seiko Catalogue"


def year_from(folder: str) -> int:
    m = re.search(r"\d{4}", folder)
    return int(m.group(0)) if m else 0


def detect_lang(text: str) -> str:
    cjk = len(CJK_RE.findall(text))
    lat = len(LATIN_RE.findall(text))
    if cjk + lat < 40:
        return "scan"
    if cjk > lat * 0.25:
        return "jp" if lat else "jp"
    return "en"


def make_snippet(text: str) -> str:
    t = re.sub(r"\s+", " ", text).strip()
    return t[:200]


def render_cover(doc, path: str):
    page = doc[0]
    w = page.rect.width or 600
    zoom = COVER_W / w
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    try:
        pix.save(path, jpg_quality=78)
    except TypeError:
        pix.save(path)


def main():
    os.makedirs(COVERS_DIR, exist_ok=True)
    files = sorted(glob.glob(os.path.join(SRC, "**", "*.pdf"), recursive=True))
    items = []
    errors = []

    for i, full in enumerate(files, 1):
        rel = os.path.relpath(full, SRC).replace("\\", "/")
        folder = rel.split("/")[0]
        filename = os.path.basename(full)
        year = year_from(folder)
        title = clean_title(filename)
        cid = slugify(f"{folder}-{re.sub(r'.pdf$', '', filename, flags=re.I)}")
        cover_path = os.path.join(COVERS_DIR, f"{cid}.jpg")

        try:
            doc = fitz.open(full)
            pages = doc.page_count
            # extract text from a sample of pages (cap for speed on huge scans)
            sample = range(min(pages, 60))
            text = "".join(doc[p].get_text() for p in sample)

            if FORCE or not os.path.exists(cover_path):
                render_cover(doc, cover_path)
            doc.close()

            text_chars = len(text.strip())
            vintage_refs = set(CASEREF_RE.findall(text))
            modern_refs = {m for m in MODELREF_RE.findall(text) if m not in KNOWN_CALIBERS}
            case_refs = sorted(vintage_refs | modern_refs)[:80]
            calibers = sorted({m.upper() for m in CALIBER_RE.findall(text)})

            items.append({
                "id": cid,
                "year": year,
                "yearLabel": folder,
                "title": title,
                "file": rel,
                "pages": pages,
                "cover": f"/catalogue/covers/{cid}.jpg",
                "textChars": text_chars,
                "hasText": text_chars > 200,
                "lang": detect_lang(text),
                "snippet": make_snippet(text),
                "caseRefs": case_refs,
                "calibers": calibers,
            })
            print(f"[{i:3}/{len(files)}] {cid}  pages={pages} text={text_chars} refs={len(case_refs)} cal={len(calibers)}")
        except Exception as e:
            errors.append((rel, str(e)))
            print(f"[{i:3}/{len(files)}] ERROR {rel}: {e}")

    items.sort(key=lambda x: (x["year"], x["title"]))
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=1)

    total_refs = sum(len(x["caseRefs"]) for x in items)
    with_text = sum(1 for x in items if x["hasText"])
    print(f"\nDONE: {len(items)} catalogues → {OUT_JSON}")
    print(f"  text-bearing: {with_text} | total case-refs: {total_refs} | errors: {len(errors)}")
    if errors:
        for rel, e in errors:
            print("  ERR", rel, e)


if __name__ == "__main__":
    main()
