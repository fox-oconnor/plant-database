#!/usr/bin/env python3
"""
Plant image harvester — fills plantImg, photoCredit, photoLicense
from Wikimedia Commons (via Wikipedia page images).

Usage:
    python3 harvest_images.py plants.csv
    python3 harvest_images.py plants.csv --out plants_with_images.csv

Reads the CSV, looks up each plant by scientificName (falls back to
commonName), and writes back an enriched CSV with the three image
columns filled in. Existing values are left alone (won't overwrite
your own photos or hand-picked credits).

Only stdlib — no pip install needed.
"""

import argparse
import csv
import html
import json
import re
import sys
import time, urllib.error
import urllib.parse
import urllib.request

WIKI_API = "https://en.wikipedia.org/w/api.php"
COMMONS_API = "https://commons.wikimedia.org/w/api.php"
HEADERS = {"User-Agent": "PlantDatabaseImageHarvester/1.0 (personal project)"}


def api_get(base, params, retries=3):
    url = base + "?" + urllib.parse.urlencode(params)
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=20) as resp:
                return json.load(resp)
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < retries -1:
                time.sleep(3 ** attempt * 5)
                continue
            raise


def strip_html(s):
    return re.sub(r"<[^>]+>", "", s or "").strip()


def clean_url(u):
    # drop utm tracking params from thumbnail URLs
    return u.split("?")[0] if u else ""


def find_image(name):
    """Return (thumb_url, file_title) for a plant name, or (None, None)."""
    data = api_get(WIKI_API, {
        "action": "query", "format": "json",
        "prop": "pageimages", "titles": name,
        "pithumbsize": 500, "origin": "*",
    })
    pages = data.get("query", {}).get("pages", {})
    for page in pages.values():
        if "missing" in page:
            continue
        thumb = page.get("thumbnail", {}).get("source")
        file_title = page.get("pageimage")
        if thumb:
            return clean_url(thumb), file_title
    # Fallback: search Commons file namespace directly
    return search_commons(name)


def search_commons(name):
    """Search Commons files for the plant name; return (thumb_url, file_title)."""
    data = api_get(COMMONS_API, {
        "action": "query", "format": "json",
        "generator": "search", "gsrsearch": name,
        "gsrnamespace": 6, "gsrlimit": 5,
        "prop": "imageinfo", "iiprop": "url|extmetadata",
        "iiurlwidth": 500, "origin": "*",
    })
    pages = data.get("query", {}).get("pages", {})
    for page in sorted(pages.values(), key=lambda p: p.get("index", 0)):
        info = (page.get("imageinfo") or [{}])[0]
        thumb = info.get("thumburl") or info.get("url")
        title = page.get("title", "").removeprefix("File:")
        if thumb:
            return clean_url(thumb), title
    return None, None


def get_credit_license(file_title):
    """Return (credit, license) for a Commons file title."""
    data = api_get(COMMONS_API, {
        "action": "query", "format": "json",
        "prop": "imageinfo", "iiprop": "url|extmetadata",
        "titles": "File:" + file_title, "origin": "*",
    })
    pages = data.get("query", {}).get("pages", {})
    for page in pages.values():
        info = (page.get("imageinfo") or [{}])[0]
        em = info.get("extmetadata", {})
        artist = strip_html(em.get("Artist", {}).get("value", ""))
        artist = html.unescape(artist)
        lic = em.get("LicenseShortName", {}).get("value", "")
        credit = artist if artist and artist.lower() != "unknown" else ""
        return credit, lic
    return "", ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("csv_path", help="input plants CSV")
    ap.add_argument("--out", default=None, help="output CSV (default: overwrite input)")
    args = ap.parse_args()

    with open(args.csv_path, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
        fieldnames = list(rows[0].keys()) if rows else []

    for col in ("plantImg", "photoCredit", "photoLicense"):
        if col not in fieldnames:
            fieldnames.append(col)

    done, skipped, missed = 0, 0, 0
    for row in rows:
        if row.get("plantImg"):
            skipped += 1
            continue
        name = (row.get("scientificName") or "").strip() or (row.get("commonName") or "").strip()
        if not name:
            missed += 1
            continue
        try:
            thumb, file_title = find_image(name)
            if not thumb and row.get("commonName"):
                # retry with common name if scientific name missed
                thumb, file_title = find_image(row["commonName"].strip())
            if thumb:
                credit, lic = get_credit_license(file_title) if file_title else ("", "")
                row["plantImg"] = thumb
                row["photoCredit"] = credit
                row["photoLicense"] = lic
                done += 1
                print(f"  ✓ {name}")
            else:
                missed += 1
                print(f"  ✗ {name} (no image found)")
        except Exception as e:  # noqa: BLE001 - best effort per row
            missed += 1
            print(f"  ✗ {name} (error: {e})")
        time.sleep(0.5)  # be polite to the APIs

    out = args.out or args.csv_path
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)

    print(f"\nDone: {done} enriched, {skipped} already had images, {missed} missed.")
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
