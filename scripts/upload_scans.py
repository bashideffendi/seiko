"""
Upload a digitised catalogue's scan assets to the Railway bucket (S3-compatible).

  python scripts/upload_scans.py --id 1977-1977-seiko-v1 [--dry-run]

Reads public/catalogue/<year>/<id>/** (written by `digitize_catalog.py export`) and puts
each file at `catalogue/<year>/<id>/...` in the bucket, which /scan/<...> on the site
redirects to (src/app/scan/[...key]/route.ts). Files already in the bucket with the same
size are skipped, so a run can be repeated after an interruption.

Credentials come from `.env.storage` at the repo root (S3_ENDPOINT, S3_ACCESS_KEY_ID,
S3_SECRET_ACCESS_KEY, S3_BUCKET, S3_REGION) and are never printed.
"""
import os, re, json, argparse
from concurrent.futures import ThreadPoolExecutor

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(HERE, "public", "catalogue")
SCANS = os.path.join(HERE, "src", "data", "scans")


def load_env(path):
    env = {}
    for line in open(path, encoding="utf-8-sig").read().splitlines():
        m = re.match(r"\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$", line)
        if m:
            env[m.group(1)] = m.group(2).strip().strip('"').strip("'")
    return env


def client(env):
    return boto3.client(
        "s3", endpoint_url=env["S3_ENDPOINT"], aws_access_key_id=env["S3_ACCESS_KEY_ID"],
        aws_secret_access_key=env["S3_SECRET_ACCESS_KEY"], region_name=env.get("S3_REGION") or "auto",
        config=Config(signature_version="s3v4", s3={"addressing_style": "virtual"}, max_pool_connections=16),
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--id", required=True)
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    manifest = json.load(open(os.path.join(SCANS, f"{a.id}.json"), encoding="utf-8"))
    rel_dir = manifest["dir"]  # "<year>/<id>"
    src = os.path.join(PUBLIC, *rel_dir.split("/"))
    files = []
    for root, _, names in os.walk(src):
        for n in names:
            if n.endswith(".webp"):
                p = os.path.join(root, n)
                files.append((p, "catalogue/" + rel_dir + "/" + os.path.relpath(p, src).replace(os.sep, "/")))
    print(f"{a.id}: {len(files)} files, {sum(os.path.getsize(p) for p, _ in files) / 1e6:.1f} MB")
    if a.dry_run:
        return

    env = load_env(os.path.join(HERE, ".env.storage"))
    s3, bucket = client(env), env["S3_BUCKET"]

    def put(item):
        path, key = item
        size = os.path.getsize(path)
        try:
            if s3.head_object(Bucket=bucket, Key=key)["ContentLength"] == size:
                return "skip"
        except ClientError:
            pass
        with open(path, "rb") as f:
            s3.put_object(Bucket=bucket, Key=key, Body=f, ContentType="image/webp",
                          CacheControl="public, max-age=31536000, immutable")
        return "put"

    with ThreadPoolExecutor(8) as ex:
        res = list(ex.map(put, files))
    print(f"  uploaded {res.count('put')}, already there {res.count('skip')}")


if __name__ == "__main__":
    main()
