#!/usr/bin/env python3
"""Pull the species photographs out of the Taijiang field-guide PDF into img/.

Usage:
    pip install pymupdf pillow
    python3 tools/extract_photos.py /path/to/full.pdf

Only do this once you have permission from Taijiang National Park HQ to use the
photographs (see README). The app looks for:
    img/p<page>.jpg      main photo       (page = the book's printed page number)
    img/p<page>-2.jpg    second photo
    img/p<page>-3.jpg, img/p<page>-4.jpg ...
and simply hides any that are missing.

Species pages run from printed page 45 to 235; printed page N is PDF page N+2.
Images on each page are saved largest-first, resized to max 1200 px, JPEG q=82.
"""
import sys, io, pathlib
import fitz  # PyMuPDF
from PIL import Image

MIN_SIDE = 160        # skip icons / glyphs
MAX_SIDE = 1200
QUALITY = 82

pdf_path = sys.argv[1]
out = pathlib.Path(__file__).resolve().parent.parent / "img"
out.mkdir(exist_ok=True)
doc = fitz.open(pdf_path)
DIVIDERS = {44, 62, 79, 83, 86, 89, 122, 175, 180, 211, 225, 233}  # full-page order dividers

count = 0
for book_page in range(45, 236):
    if book_page in DIVIDERS:
        continue
    page = doc[book_page + 2 - 1]
    seen, imgs = set(), []
    for info in page.get_images(full=True):
        xref = info[0]
        if xref in seen:
            continue
        seen.add(xref)
        try:
            pix = fitz.Pixmap(doc, xref)
            if pix.n - pix.alpha >= 4:          # CMYK -> RGB
                pix = fitz.Pixmap(fitz.csRGB, pix)
            if pix.width < MIN_SIDE or pix.height < MIN_SIDE:
                continue
            im = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
            imgs.append(im)
        except Exception as e:
            print(f"  page {book_page}: skipped image {xref} ({e})")
    imgs.sort(key=lambda im: im.width * im.height, reverse=True)
    for i, im in enumerate(imgs[:4]):
        im.thumbnail((MAX_SIDE, MAX_SIDE))
        name = f"p{book_page}.jpg" if i == 0 else f"p{book_page}-{i+1}.jpg"
        im.save(out / name, "JPEG", quality=QUALITY, optimize=True)
        count += 1
    print(f"page {book_page}: {len(imgs[:4])} photo(s)")
print(f"done — {count} files written to {out}")
