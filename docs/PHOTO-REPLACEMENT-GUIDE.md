# Photo Replacement Guide

How to swap any photo on the invitation without breaking the layout, the crops
or the page speed. Everything below uses the **real file names in this project**.

> Short version: make the web versions with `tools/optimize-images.py`, keep the
> same file name (or update the one line in `js/config.js`), adjust `position`
> if a face is cut off, then check the page on a phone.

---

## 1. Where every photo is used (current mapping)

All photo settings live in **`js/config.js`**. Apart from the share preview image
in the `<head>` of `index.html` (last row), the HTML never hard-codes a photo.

| Place on the page | Config key (`js/config.js`) | File base in the repo | Original source file | Widths | Shape |
|---|---|---|---|---|---|
| Opening cover (first screen, before "Buka Undangan"), and the desktop left panel while it is showing | `images.cover` | `assets/images/cover/cover-03` | `awl-cover-3.jpg` | 640, 960, 1440 | 2:3 portrait |
| Header after opening (mobile/tablet), and the desktop left panel after opening | `images.hero` | `assets/images/cover/cover-01` | `awl-cover-1.jpg` | 640, 960, 1440 | 2:3 portrait |
| Closing "Thank You" | `images.closing` | `assets/images/cover/cover-04` | `awl-cover-4.jpg` | 640, 960, 1440 | 2:3 portrait |
| The Groom portrait | `couple.groom.photo` | `assets/images/groom/groom` | `awl-groom.jpg` | 480, 800, 1200 | 2:3 portrait |
| The Bride portrait | `couple.bride.photo` | `assets/images/bride/bride` | `awl-bride.jpg` | 480, 800, 1200 | 2:3 portrait |
| Our Story · 01 Pertemuan | `story[0].image` | `assets/images/story/story-01` | `awl-cover-5.jpg` | 480, 800, 1200 | 2:3 portrait |
| Our Story · 02 Pendekatan | `story[1].image` | `assets/images/story/story-02` | `awl-cover-2.jpg` | 480, 800, 1200 | 2:3 portrait |
| Our Story · 03 Lamaran | `story[2].image` | `assets/images/story/story-03` | `awl-cover-6.jpg` | 480, 800, 1200 | 2:3 portrait |
| Our Story · 04 Pernikahan | `story[3].image` | `assets/images/story/story-04` | `awl-cover-8.jpg` | 480, 800, 1200 | 2:3 portrait |
| Gallery photos 1–6 | `gallery[0]` … `gallery[5]` | `assets/images/gallery/gallery-01` … `gallery-06` | `awl-gallery-01.jpg` … `awl-gallery-06.jpg` | 480, 800, 1600 | 2:3 portrait (photos 1 and 4 are shown full width, cropped to 4:5) |
| Gallery photo 7 (full-width landscape) | `gallery[6]` (`wide: true`) | `assets/images/gallery/gallery-11` | `awl-cover-7.jpg` | 800, 1600 | 3:2 landscape |
| Gallery photos 8–11 | `gallery[7]` … `gallery[10]` | `assets/images/gallery/gallery-07` … `gallery-10` | `awl-gallery-07.jpg` … `awl-gallery-10.jpg` | 480, 800, 1600 | 2:3 portrait (photos 8 and 11 are shown full width, cropped to 4:5) |
| Soft blurred background behind the gallery | `galleryBackdrop` | `assets/images/gallery/gallery-backdrop.webp` (single file) | `awl-gallery-04.jpg` | 360 × 540 | 2:3, pre-blurred |
| Link preview (WhatsApp / social share) | `<meta property="og:image">` in `index.html` | `assets/images/meta/og-image.jpg` (single file) | made from `awl-cover-5.jpg` (lantern photo) with the names set on the left | 1200 × 630 | 1.91:1 |

Each "file base" exists as an **AVIF and a WebP for every width**, for example
`assets/images/story/story-02-480.avif`, `story-02-480.webp`, `story-02-800.avif`
… `story-02-1200.webp`. The browser picks the smallest one that looks sharp on
the visitor's screen.

The original Drive files (`awl-*.jpg`) are **not** stored in the repository;
only the optimized web versions are. Keep the originals in Google Drive.

---

## 2. Before you start: what a good replacement photo looks like

- **Orientation.** Use the same shape as the photo you replace (see the table).
  Portrait 2:3 for almost everything; landscape 3:2 only for a `wide` gallery photo.
  Another ratio still works (the page crops it), but more of the photo is cut off.
- **Resolution.** At least **1600 px on the long side** for gallery/story/couple
  photos and **2400 px** for cover, hero and closing. Larger is fine; the tool
  scales it down.
- **Faces.** Keep faces away from the extreme top and bottom 15% of the frame.
  On phones the cover and hero are cropped to the screen shape.
- **Cover photo specifically.** The names and the "Buka Undangan" button sit on
  the **lower third** of the cover on phones. Choose a photo whose faces are
  **at or above the middle** (the current awl-cover-3 has them just above the
  middle), otherwise the text covers them.
- **Colour & mood.** Warm, natural tones match the ivory/earth palette. Very
  saturated or cool/blue photos will look out of place.
- **File type.** JPG or PNG straight from the photographer is fine. HEIC from an
  iPhone: export as JPG first.

---

## 3. File names (important on GitHub Pages)

- Use **lowercase letters, numbers and hyphens only**: `gallery-12`, `story-02`.
- **No spaces**, no brackets, no `&`, no accents.
  `Foto Prewed (1).JPG` will break; `gallery-12` will not.
- **GitHub Pages is case-sensitive.** `Gallery-12-800.webp` and
  `gallery-12-800.webp` are different files there, even if they look the same on
  Windows/macOS. Always lowercase.
- Don't type the width or extension in `js/config.js`. Write only the base:
  `assets/images/gallery/gallery-12` (the page adds `-800.webp` etc. itself).
- Paths are **relative** (no leading `/`). That keeps them working on
  `https://username.github.io/repo-name/`, on a custom domain, and when
  `index.html` is opened straight from a folder.

---

## 4. Make the web versions (one command)

Requirements once: Python 3 and Pillow (`pip install pillow`).

From the project folder:

```bash
# Cover / hero / closing (portrait, large)
python3 tools/optimize-images.py ~/Downloads/new-cover.jpg assets/images/cover/cover-03 --widths 640 960 1440

# Groom / bride / story (portrait)
python3 tools/optimize-images.py ~/Downloads/new-story.jpg assets/images/story/story-02 --widths 480 800 1200

# Gallery, portrait
python3 tools/optimize-images.py ~/Downloads/new-photo.jpg assets/images/gallery/gallery-05 --widths 480 800 1600

# Gallery, landscape (wide)
python3 tools/optimize-images.py ~/Downloads/new-landscape.jpg assets/images/gallery/gallery-11 --widths 800 1600
```

On Windows, write the path in quotes if it has spaces, e.g.
`"C:\Users\Nama\Downloads\Foto Baru.jpg"`. The *output* name must still have no spaces.

The tool:

- fixes the rotation from the camera,
- writes AVIF + WebP for every width,
- prints the line to paste into `js/config.js`:

```
config values ->  w: 2400, h: 3600, color: '#8d7653'
```

**Use exactly the widths in the table for that slot.** The page asks for those
sizes; a missing width shows as a broken image on some screens.

If you can't run Python, use [squoosh.app](https://squoosh.app) in the browser:
resize to each width, export once as AVIF and once as WebP, and name the files
`<base>-<width>.avif` / `<base>-<width>.webp`. Fill in `w`/`h` with the original
size and pick any mid-tone colour from the photo for `color`.

---

## 5. Update `js/config.js`

Each photo is one small object. Example (Our Story · 02):

```js
image: {
  src: "assets/images/story/story-02",   // file base, no width/extension
  widths: [480, 800, 1200],              // the widths you generated
  w: 2400, h: 3600,                      // ORIGINAL size printed by the tool
  color: "#8d7653",                      // placeholder colour while loading
  position: "50% 55%",                   // which part stays visible when cropped
  alt: "Alghifari dan Laeli di beranda rumah kayu",
},
```

What each field does:

| Field | Why it matters |
|---|---|
| `src` | The file base. Same name as before = nothing else to change. |
| `widths` | Must match the files that exist, or some screens get a broken image. |
| `w`, `h` | Lets the browser reserve the right space, so the page doesn't jump while loading. Use the original photo's size. |
| `color` | Shown behind the photo while it loads. Use the value the tool prints. |
| `position` | The focal point. See section 6. |
| `positionDesktop` | (cover and hero only) focal point for the tall desktop side panel. |
| `alt` | Description for screen readers and when an image fails to load. See section 7. |
| `wide: true` | (gallery only) landscape photo that spans the full row. |

If you **reused the exact same file name**, you only need to change `w`, `h`,
`color`, `position` and `alt` when they differ from the old photo.

---

## 6. Keeping faces in the frame (`position`)

Photos are cropped to fit their frame (`object-fit: cover`). `position` says
which point of the photo to keep: `"horizontal% vertical%"`.

- `"50% 50%"`: centre (default).
- `"50% 25%"`: keep the upper part, typical for portraits so heads aren't cut.
- `"50% 70%"`: keep the lower part.
- `"35% 40%"`: keep the left-of-centre area.

Current values to start from:

| Slot | `position` | `positionDesktop` |
|---|---|---|
| Cover (`cover-03`) | `50% 50%` | `48% 60%` |
| Hero (`cover-01`) | `50% 32%` | `50% 72%` |
| Closing (`cover-04`) | `50% 40%` | n/a |
| Groom | `50% 22%` | n/a |
| Bride | `50% 24%` | n/a |
| Story 01–04 | `50% 52%` · `50% 55%` · `50% 62%` · `50% 58%` | n/a |

Tip: change the number in steps of 5–10%, save, refresh. Check at phone width
(see section 10). Story frames and the half-width gallery tiles are 2:3, so a 2:3 photo is
not cropped at all there and `position` has almost no effect.

---

## 7. Alt text

Write one short Indonesian sentence describing what is in the photo, the way you
would describe it to someone on the phone:

- Good: `"Alghifari dan Laeli berjalan bergandengan di antara bunga kosmos"`
- Avoid: `"foto 5"`, `"prewedding"`, `"IMG_2041"`, or repeating the same text on every photo.

Alt text is read aloud by screen readers, appears if a photo fails to load, and
is used in the gallery's enlarge buttons ("Perbesar foto 3 dari 11: …").

---

## 8. Add, remove or reorder gallery photos

The gallery shows `gallery` in `js/config.js` **in array order**, as a two-column
mosaic with a fixed rhythm (the layout of the first design):

1. **feature**: full width, cropped to **4:5**
2. **half** + 3. **half**: side by side, **2:3** (not cropped)
4. feature, 5–6. halves, and so on.

A `wide: true` landscape photo always takes a full row at **3:2** and doesn't
count in the rhythm. Current order: feature · half half · feature · half half ·
**wide** · feature · half half · feature.

A feature tile crops about 8% from the top and bottom of a 2:3 photo. If a face
gets too close to the edge, add `position` to that photo's line (section 6),
e.g. `position: "50% 35%"`.

**Add a photo**

1. Pick the next free name, e.g. `gallery-12`.
2. Generate it (section 4) with `--widths 480 800 1600` (portrait) or `--widths 800 1600` (landscape).
3. Add a line in `gallery: [ … ]` where you want it to appear:
   ```js
   { src: "assets/images/gallery/gallery-12", widths: [480, 800, 1600], w: 2400, h: 3600, color: "#5a6b44", alt: "…" },
   ```
   For landscape add `wide: true` and use `widths: [800, 1600]`.

**Remove a photo**: delete its line from `gallery`. Optionally delete its
files (`gallery-05-480.avif` … `gallery-05-1600.webp`) so the repository stays small.

**Reorder**: move the lines. The numbers in the file names don't have to be in
order; only the array order matters.

Layout tips:

- The rhythm is feature, half, half, so the grid looks complete when the number
  of portrait photos between two wide photos (or before the end) is a multiple
  of 3, or a multiple of 3 plus 1 (ending on a feature). Otherwise the last half
  sits alone next to an empty space.
- Put the strongest, most "hero" shots where a feature falls (1st, 4th, 7th…
  portrait), and landscape photos where you want a pause.
- 8–14 photos in total feels curated; much more makes the page long on phones.

The lightbox counter ("03 / 11") updates automatically.

---

## 9. Special files

**Gallery background (`gallery-backdrop.webp`)**: a tiny, pre-blurred photo
(360 × 540, ~2 KB) behind the gallery, softened further by an ivory wash so the
gallery photos stay sharp. To change it:

```bash
python3 tools/make-backdrop.py ~/Downloads/awl-gallery-04.jpg assets/images/gallery/gallery-backdrop.webp
```

To remove it, set `galleryBackdrop: ""` in `js/config.js`.

**Share preview (`assets/images/meta/og-image.jpg`)**: what WhatsApp and social
apps show when the link is shared. The current one is the lantern photo with
the names set on the left. Make a **1200 × 630 JPG under 300 KB**, keep faces
and text away from the outer ~60 px (some apps crop the edges or show a square
thumbnail from the centre), and keep the same file name. WhatsApp
caches previews for a long time; a changed image may only appear for new chats.

**Favicons** (`meta/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`): the
"A & L" monogram, not photos. They don't need changing.

---

## 10. Check before publishing

1. Open the site locally (double-click `index.html`, or run
   `python3 -m http.server 8080` in the project folder and open
   `http://localhost:8080/?to=Pujo`).
2. In Chrome DevTools, device toolbar: check **360, 390 and 430 px** wide, then tablet and desktop.
3. For each replaced photo, check:
   - faces are not cut off and not covered by text (especially the cover);
   - no broken-image placeholder (a soft coloured box with the alt text means the file is missing or misnamed);
   - the page doesn't jump while the photo loads (if it does, `w`/`h` are wrong).
4. Open the gallery lightbox and swipe through all photos.
5. On GitHub Pages, after pushing, hard-refresh (Ctrl+Shift+R / pull-to-refresh)
   because browsers cache images. Test once on a real phone over mobile data.

---

## 11. Size budget (keeps it fast on mobile data)

| Slot | Target per file (AVIF, largest width) |
|---|---|
| Cover / hero / closing @1440 | ≤ 250 KB (current: 57–216 KB) |
| Groom / bride / story @1200 | ≤ 200 KB (current: 55–193 KB) |
| Gallery @1600 | ≤ 500 KB (current: up to 472 KB). Only the lightbox and large screens load this size; phones show the 480/800 versions in the grid |
| Gallery backdrop | ≤ 5 KB |
| og-image.jpg | ≤ 300 KB |

Detailed foliage and grainy night photos compress less well, which is why
some gallery files are near the limit. If a new file is bigger than its budget,
lower `AVIF_QUALITY` / `WEBP_QUALITY` at the top of `tools/optimize-images.py`
by 5 and run it again.

---

## 12. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Coloured box with text instead of the photo | File name/path doesn't match `src`, or a width is missing | Compare the names letter by letter (case!); make sure every width in `widths` exists as `.avif` and `.webp` |
| Works on the laptop, broken on GitHub Pages | Upper/lower-case difference, or a space in the name | Rename to lowercase, no spaces; push again |
| Face cut off on phones | Focal point | Adjust `position` (section 6) |
| Text covers faces on the cover | Faces too low in the photo | Pick a photo with faces in the upper half, or raise `position` vertical % |
| Page jumps while loading | Wrong `w`/`h` | Use the original size printed by the tool |
| Old photo still shows | Browser/CDN cache | Hard-refresh; GitHub Pages can take a few minutes to update |
| Photo looks sideways | Camera rotation | Re-run the tool (it auto-rotates), don't rotate by renaming |
