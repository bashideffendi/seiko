"""
Catalogue digitisation — every watch photo in a scanned catalogue becomes a record
with its OWN cropped photo, tied back to the page it came from.

Builds on the vision-extraction pipeline (EXTRACTION.md): the records already exist in
`src/data/models-<id>.json` (one per watch, in reading order). This script adds, per
record, the watch's bounding box on its page and a cropped photo; and renders the pages
themselves as WebP for the in-site catalogue reader.

Stages (run in order; each is idempotent):

  detect   render pages at --dpi into .pilot/<id>/hi/, find every watch photo (paper
           background → ink mask → rows of photos → columns), pair boxes with the page's
           records in reading order, write .pilot/<id>/bbox-auto.json and a check sheet
           per page in .pilot/<id>/check/ (boxes + assigned refs drawn over the page).
  apply    auto boxes + hand corrections (scripts/bbox-overrides/<id>.json) → `bbox` and
           `photo` on each record in src/data/models-<id>.json.
  export   page images (WebP, 1600 px wide) + thumbnails + one crop per watch (and a
           240 px copy in watches/sm/ for grids) into
           public/catalogue/<year>/<id>/ and the page manifest src/data/scans/<id>.json.

  python scripts/digitize_catalog.py detect --id 1975-1975-seiko-catalog \
      --pdf "_reference/seiko-source/Seiko Catalogue/1975/1975-Seiko-Catalog.pdf"
  python scripts/digitize_catalog.py apply  --id 1975-1975-seiko-catalog
  python scripts/digitize_catalog.py export --id 1975-1975-seiko-catalog

bbox = [x, y, w, h], normalised 0–1 to the page image (top-left origin), margin included.
Record `page` = scan index (0 = first PDF page), which is how the extraction named pages.
"""
import os, re, json, argparse
from collections import defaultdict

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PILOT = os.path.join(HERE, ".pilot")
DATA = os.path.join(HERE, "src", "data")
PUBLIC = os.path.join(HERE, "public", "catalogue")
OVERRIDES = os.path.join(HERE, "scripts", "bbox-overrides")

PAGE_W = 1600       # reader page width (px)
THUMB_W = 240       # thumbnail strip width (px)
CROP_LONG = 800     # watch crop long side (px, never upscaled past the hi-res render)
CROP_SM = 240       # small watch crop for grids (watches/sm/)
PAGE_Q, THUMB_Q, CROP_Q = 80, 70, 80
# margin added around each detected photo (fraction of page width / height)
PAD_X, PAD_TOP, PAD_BOTTOM = 0.012, 0.012, 0.012


# ---------------------------------------------------------------- helpers

def runs(flags, gap=0):
    """Contiguous True runs in a 1-D bool array as (start, stop), bridging gaps <= gap."""
    out, start, last = [], None, None
    for i, f in enumerate(flags):
        if f:
            if start is None:
                start = i
            elif i - last - 1 > gap:
                out.append((start, last + 1))
                start = i
            last = i
    if start is not None:
        out.append((start, last + 1))
    return out


def load_models(cid):
    """The models file whose catalog.id is `cid` (file names don't always repeat the id)."""
    direct = os.path.join(DATA, f"models-{cid}.json")
    cands = [direct] if os.path.exists(direct) else sorted(
        os.path.join(DATA, f) for f in os.listdir(DATA) if f.startswith("models-") and f.endswith(".json"))
    for path in cands:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        if data.get("catalog", {}).get("id") == cid:
            return path, data
    raise SystemExit(f"no src/data/models-*.json with catalog.id == {cid}")


def by_page(records):
    per = defaultdict(list)
    for i, r in enumerate(records):
        per[r["page"]].append(i)
    return per


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-") or "x"


def hi_dir(cid):
    return os.path.join(PILOT, cid, "hi")


def hi_path(cid, n):
    return os.path.join(hi_dir(cid), f"p{n:03d}.png")


# ---------------------------------------------------------------- detection

def ink_mask(im, thr=40):
    """Pixels that are clearly darker/more coloured than the local paper."""
    a = np.asarray(im).astype(np.float32)
    H, W, _ = a.shape
    k = int(W * 0.16)  # wider than a watch, so the closing restores bare paper
    bg = np.stack([ndi.grey_closing(a[..., c], size=(k, k)) for c in range(3)], -1)
    bg = ndi.uniform_filter(bg, size=(9, 9, 1))
    mask = np.clip(bg - a, 0, None).max(-1) > thr
    # strip long THIN straight lines (page frame, panel separators); thick dark areas stay
    m = mask.astype(np.float32)
    hr = ndi.uniform_filter1d(m, size=int(W * 0.2), axis=1) > 0.8
    vr = ndi.uniform_filter1d(m, size=int(H * 0.15), axis=0) > 0.8
    thick_v = ndi.binary_opening(mask, structure=np.ones((9, 1)))
    thick_h = ndi.binary_opening(mask, structure=np.ones((1, 9)))
    mask &= ~ndi.binary_dilation((hr & ~thick_v) | (vr & ~thick_h), iterations=2)
    mask = ndi.binary_opening(mask, structure=np.ones((2, 2)))
    # ignore the scan's outer margin (page edge shadow, binding)
    mx, my = int(0.04 * W), int(0.02 * H)
    mask[:my] = False; mask[-my:] = False; mask[:, :mx] = False; mask[:, -mx:] = False
    return mask


def split_widest(zone_cols, need):
    """Split merged column runs (touching photos / a caption bridging two) at profile minima,
    widest first relative to the page's typical photo width, until `need` boxes are added."""
    while need > 0:
        widths = sorted(b - a for z in zone_cols for a, b in z[2])
        if not widths:
            return
        typ = widths[0] if len(widths) < 3 else widths[len(widths) // 2]
        zi, j = max(((zi, j) for zi, z in enumerate(zone_cols) for j in range(len(z[2]))),
                    key=lambda t: zone_cols[t[0]][2][t[1]][1] - zone_cols[t[0]][2][t[1]][0])
        cols, colc = zone_cols[zi][2], zone_cols[zi][3]
        a, b = cols[j]
        w = b - a
        n = min(int(round(w / typ)), need + 1)
        if w < 1.6 * typ or n < 2:
            return
        prof = ndi.uniform_filter1d(colc[a:b].astype(float), 9)
        cuts = []
        for k in range(1, n):
            c = int(w * k / n)
            lo, hi = max(1, c - int(typ * 0.35)), min(w - 1, c + int(typ * 0.35))
            cuts.append(a + lo + int(np.argmin(prof[lo:hi])))
        edges = [a] + cuts + [b]
        cols[j:j + 1] = [(edges[i], edges[i + 1]) for i in range(len(edges) - 1)]
        need -= n - 1


def detect_page(im, expected=None, min_h=0.12):
    """Watch-photo boxes on one page, in reading order (rows top→bottom, then left→right)."""
    W, H = im.size
    ink = ink_mask(im)
    # keep only tall structures: type, captions, rules and pen marks are all thin vertically,
    # watch heads and bracelets are not
    mask = ndi.binary_opening(ink, structure=np.ones((max(3, int(0.02 * H)), 1)))
    rowc = mask.sum(1)
    zones = [z for z in runs(rowc > 2, gap=int(0.006 * H)) if z[1] - z[0] > 0.08 * H]
    zone_cols = []
    for (y0, y1) in zones:
        colc = mask[y0:y1].sum(0)
        cols = [c for c in runs(colc > 2, gap=int(0.008 * W))
                if 0.04 * W < c[1] - c[0] < 0.6 * W]  # wider = a header band, not a photo
        # drop columns too short to be a photo
        keep = []
        for (x0, x1) in cols:
            rr = runs(mask[y0:y1, x0:x1].sum(1) > 1, gap=int(0.006 * H))
            if rr and max(r[1] - r[0] for r in rr) >= min_h * H:
                keep.append((x0, x1))
        if keep:
            zone_cols.append([y0, y1, keep, colc])
    found = sum(len(z[2]) for z in zone_cols)
    if expected is not None and found < expected:
        split_widest(zone_cols, expected - found)
    boxes = []
    for (y0, y1, cols, _) in zone_cols:
        for j, (x0, x1) in enumerate(cols):
            rc = mask[y0:y1, x0:x1].sum(1)
            rr = max(runs(rc > 1, gap=int(0.006 * H)), key=lambda r: r[1] - r[0])
            ty0, ty1 = y0 + rr[0], y0 + rr[1]
            # widen to the photo's thin edges (crown, strap tips) from the full ink mask over its
            # own rows, never past the midpoint to a neighbour
            lo = (cols[j - 1][1] + x0) // 2 if j > 0 else max(0, x0 - int(0.03 * W))
            hi = (x1 + cols[j + 1][0]) // 2 if j + 1 < len(cols) else min(W, x1 + int(0.03 * W))
            cc = ink[ty0:ty1, lo:hi].sum(0) > max(2, int(0.01 * (ty1 - ty0)))
            cr = [r for r in runs(cc, gap=int(0.004 * W)) if r[1] + lo > x0 and r[0] + lo < x1]
            if cr:
                x0, x1 = min(x0, lo + cr[0][0]), max(x1, lo + cr[-1][1])
            boxes.append(margin(ink, x0, ty0, x1, ty1))
    return boxes


def margin(ink, x0, y0, x1, y1):
    """Pad a tight photo box, but stop short of the next ink above/below (caption, blurb),
    so a crop never ends in half a line of type. Returns normalised [x, y, w, h]."""
    H, W = ink.shape
    rows = ink[:, x0:x1].sum(1) > 2

    def clear(start, step, limit):
        # first inked row after a blank gap, walking away from the photo
        r, seen_blank = start, 0
        while 0 <= r < H and abs(r - start) <= limit:
            if rows[r]:
                if seen_blank >= 2:
                    return abs(r - start) - 2
            else:
                seen_blank += 1
            r += step
        return limit

    pb = min(int(PAD_BOTTOM * H), max(0, clear(y1, 1, int(PAD_BOTTOM * H))))
    pt = min(int(PAD_TOP * H), max(0, clear(y0 - 1, -1, int(PAD_TOP * H))))
    px = int(PAD_X * W)
    X0, Y0 = max(0, x0 - px), max(0, y0 - pt)
    X1, Y1 = min(W, x1 + px), min(H, y1 + pb)
    return [round(X0 / W, 4), round(Y0 / H, 4), round((X1 - X0) / W, 4), round((Y1 - Y0) / H, 4)]


def render(pdf, cid, dpi, force=False):
    import fitz  # PyMuPDF
    os.makedirs(hi_dir(cid), exist_ok=True)
    doc = fitz.open(pdf)
    z = dpi / 72
    for i in range(doc.page_count):
        p = hi_path(cid, i)
        if force or not os.path.exists(p):
            doc[i].get_pixmap(matrix=fitz.Matrix(z, z), alpha=False).save(p)
    n = doc.page_count
    doc.close()
    return n


def font(size):
    for f in ("arialbd.ttf", "arial.ttf", "DejaVuSans-Bold.ttf"):
        try:
            return ImageFont.truetype(f, size)
        except OSError:
            pass
    return ImageFont.load_default()


def check_sheet(im, items, out):
    """Page with each box + its record label drawn on; cropped to the content for legibility."""
    W, H = im.size
    sheet = im.copy()
    d = ImageDraw.Draw(sheet)
    f = font(int(W * 0.016))
    for k, (label, b) in enumerate(items, 1):
        x, y, w, h = b
        r = [x * W, y * H, (x + w) * W, (y + h) * H]
        d.rectangle(r, outline=(220, 0, 40), width=max(2, W // 500))
        t = f"{k} {label}"
        tw = d.textlength(t, font=f)
        d.rectangle([r[0], r[1], r[0] + tw + 10, r[1] + f.size + 8], fill=(220, 0, 40))
        d.text((r[0] + 5, r[1] + 3), t, fill="white", font=f)
    sheet = sheet.crop((int(0.05 * W), int(0.08 * H), int(0.96 * W), int(0.95 * H)))
    sheet.thumbnail((1500, 1500))
    sheet.save(out, quality=85)


def cmd_detect(a):
    n = render(a.pdf, a.id, a.dpi, a.force)
    _, data = load_models(a.id)
    recs = data["records"]
    per = by_page(recs)
    os.makedirs(os.path.join(PILOT, a.id, "check"), exist_ok=True)
    auto, report = {}, []
    for p in range(n):
        idxs = per.get(p, [])
        if not idxs:
            continue
        im = Image.open(hi_path(a.id, p)).convert("RGB")
        small = im.resize((im.width // 2, im.height // 2), Image.LANCZOS)
        boxes = detect_page(small, expected=len(idxs))
        ok = len(boxes) == len(idxs)
        report.append((p, len(boxes), len(idxs)))
        items = []
        for k, ri in enumerate(idxs):
            b = boxes[k] if ok else None
            auto[str(ri)] = {"page": p, "ref": recs[ri]["ref"], "bbox": b}
            if b:
                items.append((recs[ri]["ref"], b))
        if not ok:  # draw what was found, unlabeled, so the sheet still helps
            items = [("?", b) for b in boxes]
        check_sheet(im, items, os.path.join(PILOT, a.id, "check", f"p{p:03d}.jpg"))
    with open(os.path.join(PILOT, a.id, "bbox-auto.json"), "w", encoding="utf-8") as f:
        json.dump(auto, f, ensure_ascii=False, indent=1)
    bad = [r for r in report if r[1] != r[2]]
    print(f"{n} pages, {len(report)} with records; boxes found = records on {len(report) - len(bad)} pages")
    for p, got, exp in bad:
        print(f"  p{p:03d}: found {got}, expected {exp}  → fix in {os.path.relpath(override_path(a.id), HERE)}")
    print(f"check sheets: {os.path.join(PILOT, a.id, 'check')}")


# ---------------------------------------------------------------- apply

def override_path(cid):
    return os.path.join(OVERRIDES, f"{cid}.json")


def load_overrides(cid):
    """{"<page>:<k>": [x,y,w,h] | null}  — k = 1-based position of the record on its page."""
    p = override_path(cid)
    if not os.path.exists(p):
        return {}
    with open(p, encoding="utf-8") as f:
        raw = json.load(f)
    return {k: v for k, v in raw.items() if not k.startswith("_")}


def cmd_apply(a):
    path, data = load_models(a.id)
    recs = data["records"]
    with open(os.path.join(PILOT, a.id, "bbox-auto.json"), encoding="utf-8") as f:
        auto = json.load(f)
    ov = load_overrides(a.id)
    per = by_page(recs)
    n_auto = n_ov = n_none = 0
    for p, idxs in per.items():
        for k, ri in enumerate(idxs, 1):
            r = recs[ri]
            key = f"{p}:{k}"
            if key in ov:
                b = ov[key]
                n_ov += 1
            else:
                b = (auto.get(str(ri)) or {}).get("bbox")
                n_auto += b is not None
            for k_ in ("bbox", "photo", "photoSize"):
                r.pop(k_, None)
            if b:
                r["bbox"] = [round(float(v), 4) for v in b]
                r["photo"] = f"watches/p{p:03d}-{k:02d}-{slug(r['ref'])}.webp"
            else:
                n_none += 1
    data["catalog"]["photos"] = sum(1 for r in recs if r.get("photo"))
    write_models(path, data)
    print(f"bbox: {n_auto} auto, {n_ov} hand-corrected, {n_none} without photo → {os.path.relpath(path, HERE)}")


def write_models(path, data):
    """Same layout as the existing files: catalog block pretty, one record per line."""
    lines = ["{", f'  "catalog": {json.dumps(data["catalog"], ensure_ascii=False, indent=2)},'.replace("\n", "\n  "), '  "records": [']
    rows = [f"    {json.dumps(r, ensure_ascii=False, separators=(',', ':'))}" for r in data["records"]]
    lines.append(",\n".join(rows))
    lines += ["  ]", "}"]
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines) + "\n")


# ---------------------------------------------------------------- export

PAGE_LABELS = {"cover": "Cover", "back": "Back cover"}


def cmd_export(a):
    path, data = load_models(a.id)
    recs = data["records"]
    year = data["catalog"]["year"]
    root = os.path.join(PUBLIC, str(year), a.id)
    for sub in ("pages", "thumbs", "watches", os.path.join("watches", "sm")):
        os.makedirs(os.path.join(root, sub), exist_ok=True)
    files = sorted(f for f in os.listdir(hi_dir(a.id)) if re.fullmatch(r"p\d{3}\.png", f))
    n = len(files)
    pages = []
    labels = json.loads(a.labels) if a.labels else {}
    for i in range(n):
        im = Image.open(hi_path(a.id, i)).convert("RGB")
        ph = round(im.height * PAGE_W / im.width)
        im.resize((PAGE_W, ph), Image.LANCZOS).save(os.path.join(root, "pages", f"p{i:03d}.webp"), "WEBP", quality=PAGE_Q, method=6)
        th = round(im.height * THUMB_W / im.width)
        im.resize((THUMB_W, th), Image.LANCZOS).save(os.path.join(root, "thumbs", f"p{i:03d}.webp"), "WEBP", quality=THUMB_Q, method=6)
        label = labels.get(str(i)) or (PAGE_LABELS["cover"] if i == 0 else PAGE_LABELS["back"] if i == n - 1 else str(i))
        pages.append({"n": i, "label": label, "w": PAGE_W, "h": ph})
    crops = 0
    for r in recs:
        if not r.get("photo"):
            continue
        im = Image.open(hi_path(a.id, r["page"])).convert("RGB")
        x, y, w, h = r["bbox"]
        W, H = im.size
        c = im.crop((round(x * W), round(y * H), round((x + w) * W), round((y + h) * H)))
        s = min(1.0, CROP_LONG / max(c.size))
        if s < 1:
            c = c.resize((round(c.width * s), round(c.height * s)), Image.LANCZOS)
        c.save(os.path.join(root, r["photo"]), "WEBP", quality=CROP_Q, method=6)
        k = CROP_SM / max(c.size)
        c.resize((round(c.width * k), round(c.height * k)), Image.LANCZOS).save(
            os.path.join(root, r["photo"].replace("watches/", "watches/sm/", 1)), "WEBP", quality=THUMB_Q, method=6)
        r["photoSize"] = [c.width, c.height]
        crops += 1
    write_models(path, data)
    manifest = {
        "id": a.id,
        "year": year,
        "title": data["catalog"]["title"],
        "source": a.source or "",
        "dir": f"{year}/{a.id}",
        "thumbWidth": THUMB_W,
        "pages": pages,
    }
    os.makedirs(os.path.join(DATA, "scans"), exist_ok=True)
    mpath = os.path.join(DATA, "scans", f"{a.id}.json")
    head = {k: v for k, v in manifest.items() if k != "pages"}
    # one page per line keeps the manifest diff-friendly
    body = ",\n".join("  " + json.dumps(pg, ensure_ascii=False, separators=(",", ":")) for pg in pages)
    with open(mpath, "w", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps(head, ensure_ascii=False, indent=1)[:-2] + ',\n "pages": [\n' + body + "\n ]\n}\n")
    total = 0
    for dp, _, fs in os.walk(root):
        total += sum(os.path.getsize(os.path.join(dp, f)) for f in fs)
    print(f"{n} pages + {n} thumbs + {crops} watch crops → {os.path.relpath(root, HERE)}  ({total / 1e6:.2f} MB)")
    print(f"manifest → {os.path.relpath(mpath, HERE)}")


def main():
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    sp = ap.add_subparsers(dest="cmd", required=True)
    d = sp.add_parser("detect")
    d.add_argument("--id", required=True)
    d.add_argument("--pdf", required=True)
    d.add_argument("--dpi", type=int, default=250)
    d.add_argument("--force", action="store_true")
    ap_ = sp.add_parser("apply")
    ap_.add_argument("--id", required=True)
    e = sp.add_parser("export")
    e.add_argument("--id", required=True)
    e.add_argument("--source", default="", help="source file name, recorded in the manifest")
    e.add_argument("--labels", default="", help='JSON {"<n>": "label"} to override page labels')
    a = ap.parse_args()
    {"detect": cmd_detect, "apply": cmd_apply, "export": cmd_export}[a.cmd](a)


if __name__ == "__main__":
    main()
