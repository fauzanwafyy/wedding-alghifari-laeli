# The Wedding of Alghifari & Laeli

Digital wedding invitation for **Moh Agil Alghifari & Laeli Luspitasari**:
Rabu, 21 Oktober 2026 · SGB Learning Center, Cisarua, Bogor.

A lightweight, mobile-first static site (GitHub Pages) with personalised guest links, live
countdown, Google Maps + Google Calendar, gallery, RSVP and wedding wishes stored in Google
Sheets through a Google Apps Script Web App. No framework, no build step.

**Design direction:** *Pulang*. See [`docs/DESIGN-DIRECTION.md`](docs/DESIGN-DIRECTION.md).

## Quick start

| I want to… | Read |
|---|---|
| Change names, times, bank details, guests | [`docs/MAINTENANCE.md`](docs/MAINTENANCE.md) |
| Replace, add or remove photos | [`docs/PHOTO-REPLACEMENT-GUIDE.md`](docs/PHOTO-REPLACEMENT-GUIDE.md) |
| RSVP Google Sheet + Apps Script (live; setup, moderation, updates) | [`docs/GOOGLE-SHEETS.md`](docs/GOOGLE-SHEETS.md) |
| Publish / update GitHub Pages, custom domain | [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) |
| Generate personal guest links + WhatsApp text | open `generator.html` on the live site |

All wedding content lives in **`js/config.js`**.

## Guest links

```
https://<site>/?to=Pujo                 → "Pujo"
https://<site>/?to=Pujo+%26+Partner     → "Pujo & Partner"
https://<site>/?to=fauzan-wafi          → "Fauzan Wafi & Partner" (from GUESTS in config.js)
https://<site>/                         → "Tamu Undangan"
```

## Structure

```
├── index.html                 The invitation (static <head> for SEO/social previews)
├── 404.html                   Not-found page + /<slug> → ?to=<slug> redirect
├── generator.html             Guest-link & WhatsApp message generator (noindex)
├── css/
│   ├── main.css               Tokens, typography, components (mobile-first)
│   ├── responsive.css         Tablet, desktop split stage, reduced motion
│   └── fonts-local.css        Embedded fonts, used only when index.html is opened from a folder
├── js/
│   ├── config.js              ★ All editable content + guest list
│   ├── main.js                Boot: binds config to the page, opening experience, reveal, dock
│   ├── guest.js               ?to= personalisation (sanitised)
│   ├── countdown.js           Timezone-safe countdown (WIB)
│   ├── calendar.js            Google Calendar "Save the Date" URLs (day + per event)
│   ├── api.js                 Apps Script client (no-preflight POST, timeouts)
│   ├── rsvp.js                RSVP form: validation, states, duplicate-safe retries
│   ├── wishes.js              Public wishes: lazy load, polling, pagination
│   ├── gallery.js             Mosaic + accessible lightbox
│   ├── gift.js                Bank accounts + copy to clipboard
│   ├── music.js               Background music (starts on "Buka Undangan")
│   └── utils.js               DOM/format/image helpers
├── assets/
│   ├── images/{cover,groom,bride,story,gallery,meta}/   AVIF + WebP, responsive widths
│   ├── fonts/                 Fraunces + Jost (WOFF2, self-hosted)
│   └── audio/wedding-song.mp3
├── google-apps-script/Code.gs RSVP backend (paste into Apps Script)
├── tools/optimize-images.py   Regenerate responsive images from a new photo
├── tools/make-backdrop.py     Regenerate the blurred gallery background
├── tests/                     Apps Script emulator, unit tests, Playwright e2e + screenshots
└── docs/                      Design direction, deployment, Google Sheets, maintenance, photo guide
```

## Tech notes

- **Performance:** two font files preloaded (~92 KB), the opening photo preloaded as AVIF
  (~115–215 KB depending on screen density), everything else lazy-loaded. Music (`preload="none"`) is
  only fetched after the guest taps *Buka Undangan*. No third-party scripts, no frameworks.
- **Accessibility:** semantic landmarks and headings, labelled form controls with inline
  errors, keyboard-operable lightbox (native `<dialog>`), visible focus, AA contrast,
  `prefers-reduced-motion` support, `inert` content behind the cover.
- **Security:** no secrets in the frontend; all user text rendered with `textContent`;
  server-side validation, sanitisation, formula-injection guard, honeypot, rate limit.
- **Browser support:** current Safari (iOS 15+), Chrome, Edge, Firefox, Samsung Internet.

## Credits

Photography: the couple's pre-wedding session. Music: *"Masa Ini, Nanti, dan Masa Indah
Lainnya"* by Nuca, used as background music for this private invitation. Fonts: Fraunces
(Undercase Type) and Jost (indestructible type*), both SIL Open Font License.
