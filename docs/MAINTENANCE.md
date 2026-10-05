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
| Venue, address, Google Maps link | `js/config.js` | `venue` (and `events[].venue/address/mapsUrl`) |
| Google Calendar entries | `js/config.js` | `calendar`: `title`, `eventTitleSuffix`, `location`, `description` (times come from `events[]`) |
| Our Story chapters | `js/config.js` | `story[]` |
| Cover, header and closing photos | `js/config.js` | `images.cover`, `images.hero`, `images.closing` |
| Groom / bride portraits | `js/config.js` | `couple.groom.photo`, `couple.bride.photo` |
| Gallery photos & order, gallery background | `js/config.js` | `gallery[]`, `galleryBackdrop` |
| Bank accounts | `js/config.js` | `gift.accounts[]` |
| Music | `js/config.js` + file | `music.src` |
| Guest list (slugs) | `js/config.js` | `GUESTS` (bottom of the file) |
| RSVP endpoint, max guests | `js/config.js` | `rsvp.apiUrl`, `rsvp.maxGuests` |
| Sentences (intro, verse, closing, cover note…) | `js/config.js` | `copy` |
| Page title & WhatsApp preview text | `index.html` `<head>` | (static, see note below) |
| Section titles ("Our Story", "Wedding Wishes"…) | `index.html` | inside each `<section>` |

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
- Each event becomes one card with its own **Lihat Lokasi** and **Simpan ke Kalender**
  buttons. Add or remove objects to add or remove cards.
- `endTime: null` + `endText: "selesai"` shows **10.00 WIB – selesai**. To show a real end
  time, set `endTime: "13:00"` (and clear `endText`).
- Also update `wedding.countdownTarget` if the first event's time changes
  (format `"2026-10-21T08:30:00+07:00"`). Keep the `+07:00` offset. It keeps the
  countdown correct for guests abroad.

### Google Calendar ("Save the Date")
- The big **Simpan ke Google Calendar** button saves the day, starting at the **first**
  event (Akad Nikah, 08.30 WIB). Each event card saves just that event.
- Times are taken from `events[]`, so there is nothing to keep in sync.
- No end time is ever invented: when an event has no `endTime`, the calendar entry ends
  at its start time (Google Calendar needs an end value) and the description says
  "Resepsi: 10.00 WIB – selesai". Google shows it as e.g. *10:00am – 10:00am*.
  If the family confirms an end time, set `endTime` and the calendar follows.
- `calendar.location` can stay empty: it then uses `venue.name` + `venue.address`.

### Change bank details
```js
gift: { accounts: [
  { label: "The Groom", bank: "BCA", accountNumber: "7361529751", accountHolder: "MOH AGIL ALGHIFARI" },
  { label: "The Bride", bank: "BCA", accountNumber: "7361504589", accountHolder: "LAELI LUSPITA SARI" },
]}
```
Digits only in `accountNumber` (spaces are added automatically for display; the copy button
copies the plain digits). Remove an object to show one account.

### Replace or add photos
See **[PHOTO-REPLACEMENT-GUIDE.md](PHOTO-REPLACEMENT-GUIDE.md)**: which file is used where,
the exact sizes, how to generate the AVIF/WebP versions, focal points (`position`) so faces
aren't cropped, alt text, and adding/removing gallery photos. Short version:

```bash
pip install pillow
python3 tools/optimize-images.py new-groom.jpg assets/images/groom/groom --widths 480 800 1200
```
It prints `w`, `h` and `color`; paste them into the matching entry in `js/config.js`.

### Replace the music
1. Convert to a compact MP3 (≈ 96 kbps keeps it under 4 MB):
   `ffmpeg -i song.mp3 -map 0:a -map_metadata -1 -b:a 96k assets/audio/wedding-song.mp3`
2. Update `music.title` (shown in the button tooltip). Set `music.enabled: false` to remove music.

### Change the story
Edit `story[]`. Each chapter has `number` (the small "01"–"04"), `title`, `paragraphs`
(one string per paragraph) and an optional `image` (remove the `image` key for a text-only
chapter).

### Moderate / export RSVPs
See `GOOGLE-SHEETS.md` → *Moderating wishes* and *Reading the RSVPs*.

### Update the Apps Script
Paste the new `Code.gs` → **Terapkan (Deploy) → Kelola deployment (Manage deployments) → ✏️ →
Versi: Versi baru (New version) → Terapkan**. The URL stays the same.

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
