#!/usr/bin/env python3
"""
Generate web-ready responsive images (AVIF + WebP) from a source photo.

Usage
-----
    python3 tools/optimize-images.py SOURCE.jpg OUTPUT_BASE [--widths 480 800 1600]

Example
-------
    python3 tools/optimize-images.py ~/Downloads/new-photo.jpg assets/images/gallery/gallery-11 --widths 480 800 1600

This writes:
    assets/images/gallery/gallery-11-480.avif   assets/images/gallery/gallery-11-480.webp
    assets/images/gallery/gallery-11-800.avif   assets/images/gallery/gallery-11-800.webp
    assets/images/gallery/gallery-11-1600.avif  assets/images/gallery/gallery-11-1600.webp

and prints the original width/height + a placeholder colour to paste into js/config.js.

Requirements: Python 3.9+ and Pillow 11.3+ (`pip install pillow`).
"""
import argparse
import os
import sys

from PIL import Image, ImageOps

AVIF_QUALITY = 58   # 0-100 (Pillow scale). ~58 is visually lossless for photos at these sizes.
WEBP_QUALITY = 80


def average_colour(img):
    small = img.convert("RGB").resize((1, 1), Image.LANCZOS)
    r, g, b = small.getpixel((0, 0))
    return f"#{r:02x}{g:02x}{b:02x}"


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("source")
    p.add_argument("output_base", help="path without size/extension, e.g. assets/images/gallery/gallery-11")
    p.add_argument("--widths", nargs="+", type=int, default=[480, 800, 1600])
    args = p.parse_args()

    img = Image.open(args.source)
    img = ImageOps.exif_transpose(img).convert("RGB")  # respect camera rotation, drop alpha/EXIF
    w, h = img.size
    os.makedirs(os.path.dirname(args.output_base) or ".", exist_ok=True)

    for target in args.widths:
        tw = min(target, w)
        th = round(h * tw / w)
        resized = img.resize((tw, th), Image.LANCZOS) if tw != w else img
        base = f"{args.output_base}-{target}"
        resized.save(base + ".avif", quality=AVIF_QUALITY, speed=4)
        resized.save(base + ".webp", quality=WEBP_QUALITY, method=6)
        print(f"  {base}.avif  {os.path.getsize(base + '.avif') // 1024} KB   "
              f".webp {os.path.getsize(base + '.webp') // 1024} KB   ({tw}x{th})")

    print(f"\nconfig values ->  w: {w}, h: {h}, color: '{average_colour(img)}'")


if __name__ == "__main__":
    sys.exit(main())
