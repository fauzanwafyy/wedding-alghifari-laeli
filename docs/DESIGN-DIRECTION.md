# Design Direction — *Pulang*

**The Wedding of Alghifari & Laeli · 21 October 2026**

> "…yang selalu tahu ke mana hati ini harus pulang." — from the couple's own story

The invitation is built around one idea taken from their story: **pulang**, coming home.
Their photographs give us the two images that carry it: the **joglo** (a Javanese heritage
house, the "home") and the **lantern** (the light that leads you there). The site opens at
lantern-light, at night, then moves into warm daylight on ivory paper, and ends back in
lantern-light.

---

## 1. Reference analysis

| | Tihal & Akbar (byattari) | Lana & Tika (WeKita) | Heritage · Utary | Heritage · Ameera |
|---|---|---|---|---|
| **Palette** | Cream toile + burgundy `#A54141` + olive-brown text | — | Deep forest green `#365636` / `#1F351E` + muted gold `#CCBA82`, monochrome | Cream, dusty rose, indigo `#2D346B`, taupe text `#9B8672` |
| **Type** | Pinyon Script names, Lora body | — | Uppercase high-contrast display serif, text serif, Ovo buttons | Thin high-contrast display (neutica), Lora body |
| **Decoration** | Engraved landscape, floral corners, wax seal, ornate gold frames | — | Songket-style motifs, arch frames, textured paper | Engraved landscape, rose florals |
| **Opening** | Two steps: cover with *Yth. Bapak/Ibu/Saudara/i* + guest name and *Buka Undangan*, then an envelope "the story begins" screen | — | Monogram crest, "Tamu Undangan", gold pill button | Same family as Tihal |
| **Navigation** | Floating hamburger pill, top right | — | Hamburger pill + floating guest chip + music button | Hamburger |
| **Structure** | Verse (QS Ar-Rum 21) → couple + parents → Journey of Love → countdown → date & place → dress code → gallery → RSVP + wishes → gift → thanks | — | Verse → couple → story chapters (left/right alternating) → countdown in ornate frames → *Simpan Tanggal* → date & place → RSVP → gift | Same as Tihal |

**Lana & Tika could not be loaded.** wekita.co timed out from both the research browser and
the fetch service on every attempt, so its points (information architecture, guest journey)
come from what all three loaded references share, which is the standard Indonesian
invitation journey. If the site comes back, it's worth a second look at its RSVP flow.

**What the references do well:** the guest is named on the very first screen, and opening
the invitation feels like a small ceremony. The journey is clear and familiar (verse → couple
→ story → date → RSVP → gift). Utary shows that heritage can come through **palette and
restraint** instead of illustration.

**What we deliberately avoid:** script fonts for names (they get hard to read at small
sizes and look templated), floral clip-art, ornate gilded frames, arch frames (now a
template cliché), hamburger menus on a single-page invitation, and stacked animations.

## 2. Principles

1. **Photography leads.** The couple's photos are excellent and already have a story
   (joglo, lanterns, garden). Typography and layout serve them; ornament stays thin.
2. **Typography is the decoration.** Big, light, optical-size serif for names and numbers.
   Small, widely tracked sans for labels. Nothing else.
3. **Night → Day → Night.** Dark lantern bands mark the emotional moments (opening,
   countdown, gift, closing). Ivory paper carries the information.
4. **One continuous invitation.** Hairline rules, a single roof mark and the same
   eyebrow/title pattern tie the sections together.
5. **Quiet motion.** A few deliberate movements, nothing that loops for attention.

## 3. Typography

| Role | Font | Notes |
|---|---|---|
| Display: names, titles, numerals | **Fraunces** (variable, opsz 9–144, 300–600) | Light weight at high optical size gives sharp, editorial contrast. The italic carries the ampersand and accent words. |
| Long text: story, verse | **Fraunces** at text optical size | Reads like a printed book. |
| UI, labels, body, forms | **Jost** (variable 400–600) | Geometric, Futura-lineage sans. Uppercase labels tracked at 0.28–0.4em. |

Two families, self-hosted as WOFF2 (latin subset, ~175 KB total, italic loaded only when
used), `font-display: swap`, with metric-friendly fallbacks.

Fraunces was picked over Cormorant/Playfair (overused in wedding templates) and
Bodoni (too cold for these warm photos).

## 4. Colour

Taken directly from the photographs:

| Token | Hex | Source / use |
|---|---|---|
| `--c-ivory` | `#F7F2EA` | Paper. Main background |
| `--c-linen` | `#EFE6D8` | Alternate surface |
| `--c-ink` | `#2A231D` | Text (13.9:1 on ivory) |
| `--c-ink-soft` | `#5E5248` | Secondary text (6.8:1) |
| `--c-clay` | `#8A5238` | Joglo roof terracotta. Small accent text (5.6:1) |
| `--c-brass` | `#B8925A` | Lantern brass. Hairlines and ornaments on light; text on dark |
| `--c-night` | `#17130F` | Lantern night. Dark bands |
| `--c-on-night` | `#F2E8D8` | Text on night (15:1) |
| `--c-lantern` | `#D8BC8A` | Gold text on night (10:1) |

Every text pairing meets WCAG AA. Brass is never used for body text on ivory.

## 5. Layout

- **Mobile (primary):** full-bleed photographs, 24px gutters plus safe-area insets, a text
  measure of about 34rem, generous vertical rhythm (96–128px between sections).
- **Editorial devices:** offset hairline "passe-partout" frames on portraits, figure
  captions (*No. 01 — Mempelai Pria*), vertical labels, giant light numerals for the date
  and countdown, and a program-style list for the events instead of cards.
- **Tablet:** the same flow with wider measure; portraits sit beside text; the gallery
  goes to three columns.
- **Desktop (≥1024px):** a split stage. The left side holds a sticky full-height photograph
  that cross-fades from the night cover to the daylight joglo after opening. The right side
  is the invitation column (≈520px). This keeps the intimate phone-like reading rhythm
  instead of stretching sections across a wide screen.

**Ornament system (original, all inline SVG):**

- *Atap* (roof) mark: a hairline joglo roof silhouette, used in dividers and the monogram.
- *Kawung* pattern: the classical four-petal Javanese geometry, at ~6% opacity on dark bands.

## 6. Motion

| Moment | Motion |
|---|---|
| Cover load | Photo settles from 1.08 → 1 scale over 6s; text fades up in a short stagger |
| Open invitation | Cover content fades, then the cover lifts away (1s, ease-in-out) |
| Desktop stage | Night photo cross-fades to day photo |
| Scroll | Section headers and key blocks fade up 16px once (IntersectionObserver) |
| New wish / RSVP success | Gentle fade-in with a brief warm highlight; drawn check mark |

`prefers-reduced-motion: reduce` removes all transforms and transitions; content simply
appears. Only `transform` and `opacity` are animated.

## 7. Mobile UX

- One thumb-reachable **bottom dock** (Mempelai · Acara · Galeri · RSVP · Hadiah) with an
  active-section indicator. It replaces the hamburger.
- A floating **music** control sits above the dock on the right.
- Touch targets ≥44px; inputs are 16px to prevent iOS zoom; `100svh/dvh` with fallbacks;
  `env(safe-area-inset-*)` on every fixed element.
- No scroll-jacking. The cover only locks scroll while it's showing.

## 8. Personalization

- `?to=` accepts **either** a free-text name (`?to=Pujo+%26+Partner`) **or** a guest slug
  from the optional `GUESTS` list (`?to=fauzan-wafi` → "Fauzan Wafi & Partner").
- An unknown slug is title-cased gracefully. No parameter shows *Bapak/Ibu/Saudara/i*.
- The name appears on the cover inside a framed nameplate, is pre-filled in the RSVP form,
  and the slug is stored with each RSVP.
- Everything is rendered with `textContent` (never `innerHTML`), so `?to=<script>` is shown
  as plain text.

## 9. Why this fits Alghifari & Laeli

Their photos were shot at a joglo, in a garden, and by lantern-light, dressed in taupe and
cream. A burgundy-floral or green-gold template would fight those images. *Pulang* takes the
palette, the architecture and the light from their own photographs and their own words, so
the invitation could only belong to them. It feels heritage without costume, and premium
without excess.
