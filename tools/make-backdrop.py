#!/usr/bin/env python3
"""
Make the very soft, blurred photo that sits behind the "Our Moment" gallery.

Usage
-----
    python3 tools/make-backdrop.py SOURCE.jpg [OUTPUT.webp]

Example
-------
    python3 tools/make-backdrop.py ~/Downloads/awl-gallery-04.jpg assets/images/gallery/gallery-backdrop.webp

The blur is baked into a tiny image (360 x 540 px, about 1-3 KB), so phones
download almost nothing and the browser never has to run a CSS blur filter.
The page then lays an ivory wash over it (css/main.css → .gallery::after),
so the gallery photos in front always stay sharp and in focus.

Requirements: Python 3.9+ and Pillow (`pip install pillow`).
"""
import os
import sys

from PIL import Image, ImageEnhance, ImageFilter, ImageOps

SIZE = (360, 540)      # portrait 2:3, matches the gallery section's shape on phones
BLUR_RADIUS = 22       # px at this small size; higher = softer
SATURATION = 0.85      # slightly muted so it never competes with the photos
QUALITY = 45


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    source = sys.argv[1]
    output = sys.argv[2] if len(sys.argv) > 2 else "assets/images/gallery/gallery-backdrop.webp"

    img = ImageOps.exif_transpose(Image.open(source)).convert("RGB")
    img = ImageOps.fit(img, SIZE, Image.LANCZOS, centering=(0.5, 0.5))
    img = img.filter(ImageFilter.GaussianBlur(BLUR_RADIUS))
    img = ImageEnhance.Color(img).enhance(SATURATION)
    os.makedirs(os.path.dirname(output) or ".", exist_ok=True)
    img.save(output, "WEBP", quality=QUALITY, method=6)
    print(f"{output}  {SIZE[0]}x{SIZE[1]}  {os.path.getsize(output) / 1024:.1f} KB")


if __name__ == "__main__":
    main()
