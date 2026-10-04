# Maintenance guide

Almost everything you'd want to change lives in **`js/config.js`**. Edit it on GitHub
(open the file → ✏️ → edit → **Commit changes**) or locally, then push. The site updates in
about a minute.

## Where to edit what

| To change… | Edit | Key in `js/config.js` |
|---|---|---|
| Couple names (display, nickname, initials) | `js/config.js` | `couple.groom` / `couple.bride` |
| Parents & "Putra/Putri dari" | `js/config.js` | `couple.*.father`, `mother`, `childOf` |
| Instagram handles (optional) | `js/config.js` | `couple.*.instagram` |
| Wedding date & countdown target | `js/config.js` | `wedding.date`, `wedding.countdownTarget`, `wedding.celebrationEnds` |
| Event names & times | `js/config.js` | `events[]`: `title`, `startTime`, `endTime`, `endText` |
| Venue, address, Google Maps link | `js/config.js` | `venue` (and `events[].venue/mapsUrl`) |
| Google Calendar entry | `js/config.js` | `calendar`: `title`, `start`, `end`, `location`, `description` |
| Our Story chapters | `js/config.js` | `story[]` |
| Gallery photos & order | `js/config.js` | `gallery[]` |
| Bank accounts | `js/config.js` | `gift.accounts[]` |
| Music | `js/config.js` + file | `music.src` |
| Guest list (slugs) | `js/config.js` | `GUESTS` (bottom of the file) |
| RSVP endpoint, max guests | `js/config.js` | `rsvp.apiUrl`, `rsvp.maxGuests` |
| Sentences (intro, verse, closing, cover note…) | `js/config.js` | `copy` |
| Page title & WhatsApp preview text | `index.html` `<head>` | (static, see note below) |
| Section titles ("Our Story", "Kindly Reply"…) | `index.html` | inside each `<section>` |

> **Why is the `<head>` separate?** WhatsApp/Facebook read the title and preview image
> without running JavaScript, so those lines must be written directly in `index.html`.
> If you change names or the date, update the `<title>`, `description` and `og:`/`twitter:`
> lines too.

---

## Common tasks

### Add or rename guests
Two options:
- **No setup:** send `…/?to=Nama+Tamu` (spaces as `+`, `&` as `%26`). Use `generator.html`
  to make these and the WhatsApp message automatically.
- **Short slugs:** add to `GUESTS`:
  ```js
  "budi-santoso": { name: "Budi Santoso", partner: "Keluarga" },   // → "Budi Santoso & Keluarga"
  ```
  Link: `…/?to=budi-santoso`. To rename, edit `name`; the link stays the same.

### Change event times or titles
```js
events: [
  { title: "Akad Nikah", date: "2026-10-21", startTime: "08:30", endTime: null, endText: "", … },
  { title: "Resepsi",    date: "2026-10-21", startTime: "10:00", endTime: null, endText: "selesai", … },
]
```
- Also update `wedding.countdownTarget` if the first event's time changes
  (format `"2026-10-21T08:30:00+07:00"`), and `calendar.start` / `calendar.end`.
- Keep the `+07:00` offset. It keeps the countdown correct for guests abroad.

### Change bank details
```js
gift: { accounts: [
  { label: "Mempelai Pria",   bank: "BCA", accountNumber: "1234567890", accountHolder: "NAMA PEMILIK" },
  { label: "Mempelai Wanita", bank: "BNI", accountNumber: "0987654321", accountHolder: "NAMA PEMILIK" },
]}
```
Digits only in `accountNumber` (spaces are added automatically for display; the copy button
copies the plain digits). Remove an object to show one account.

### Replace a photo
1. Run the optimiser (Python 3 + Pillow) with the **same output name** to overwrite:
   ```bash
   pip install pillow
   python3 tools/optimize-images.py new-groom.jpg assets/images/groom/groom --widths 480 800 1200
   ```
   It prints `w`, `h` and `color`. Paste them into the matching entry in `js/config.js`.
2. Commit the new `.avif` and `.webp` files.

| Image | Output base | Widths |
|---|---|---|
| Opening cover (night) | `assets/images/cover/cover-night` | 640 960 1440 |
| Header photo (day) | `assets/images/cover/cover-day` | 640 960 1440 |
| Closing photo | `assets/images/cover/closing-lantern` | 640 960 1440 |
| Groom / Bride | `assets/images/groom/groom`, `assets/images/bride/bride` | 480 800 1200 |
| Story chapters | `assets/images/story/story-01` … `04` | 480 800 1200 |
| Gallery | `assets/images/gallery/gallery-NN` | 480 800 1600 (landscape: 800 1600 + `wide: true`) |

The three cover/closing photos are referenced directly in `index.html` (for fastest loading),
so keep their file names when replacing them.

### Add a gallery photo
Optimise it as `assets/images/gallery/gallery-11`, then add a line to `gallery` in
`js/config.js`:
```js
{ src: "assets/images/gallery/gallery-11", widths: [480, 800, 1600], w: 2400, h: 3600, color: "#6b6b4a", alt: "Deskripsi foto" },
```
Order in the array = order on the page.

### Replace the music
1. Convert to a compact MP3 (≈ 96 kbps keeps it under 4 MB):
   `ffmpeg -i song.mp3 -map 0:a -map_metadata -1 -b:a 96k assets/audio/wedding-song.mp3`
2. Update `music.title` (shown in the button tooltip). Set `music.enabled: false` to remove music.

### Change the story
Edit `story[]`. Each chapter has `title`, `subtitle`, `paragraphs` (one string per
paragraph) and an optional `image` (remove the `image` key for a text-only chapter).

### Moderate / export RSVPs
See `GOOGLE-SHEETS.md` → *Moderating wishes* and *Reading the RSVPs*.

### Update the Apps Script
Paste the new `Code.gs` → **Deploy → Manage deployments → ✏️ → New version → Deploy**.
The URL stays the same.

---

## Local preview & tests (optional)

Extract the project and **double-click `index.html`**. It works straight from the folder
(fonts are embedded automatically in that case). The RSVP form only works once `rsvp.apiUrl`
is set. To preview a guest link locally you can also run a tiny server:

```bash
python3 -m http.server 8080          # then open http://localhost:8080/?to=Pujo
```

Automated checks (Node 18+, Python 3 + Playwright):
```bash
node --test tests/gas.test.mjs        # backend unit tests (Code.gs in an emulator)
node tests/gas-emulator.mjs 8787 &    # local stand-in for Apps Script
python3 tests/e2e.py                  # full browser test: cover, RSVP, wishes, gift, gallery…
python3 tests/shoot.py http://127.0.0.1:8080/ /tmp/shots --widths 360,390,430,768,1440
```

## After the wedding

The countdown switches to *"Today is the day."* on the day and to a thank-you message
afterwards (texts in `copy.countdownToday*` / `copy.countdownAfter*`). You can keep the site
as a keepsake. To stop accepting RSVPs, set `rsvp.closed: true`. The form shows
`copy.rsvpClosed` and the wishes stay visible.
