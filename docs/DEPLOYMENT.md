# Deployment: GitHub Pages

The site is plain HTML/CSS/JS with no build step. GitHub Pages serves the repository as-is.

## 1. Repository

| Setting | Value |
|---|---|
| Name | `alghifari-laeli` (any name works) |
| Visibility | **Public** (GitHub Pages is free for public repos; private repos need GitHub Pro) |
| Default branch | `main` |

```bash
git remote add origin https://github.com/<username>/alghifari-laeli.git
git push -u origin main
```

> Everything in a public repo is public, but so is everything on the website itself. No
> secrets live here: the Apps Script URL is designed to be public, and RSVP data stays in your
> Google Sheet.

## 2. Turn on GitHub Pages

1. Repository → **Settings → Pages**.
2. **Build and deployment → Source:** *Deploy from a branch*.
3. **Branch:** `main` · folder `/ (root)` → **Save**.
4. After ~1 minute the site is live at
   `https://<username>.github.io/alghifari-laeli/`

`.nojekyll` in the root tells Pages to serve files as-is (no Jekyll processing).

## 3. Set the public URL in the page head

Social previews (WhatsApp, Instagram, Facebook) need absolute URLs. In `index.html`, replace
every `https://SITE_URL/` with your real address, e.g.

```
https://<username>.github.io/alghifari-laeli/
```

(4 places: `canonical`, `og:url`, `og:image`, `twitter:image`.) Commit and push.

To refresh a preview WhatsApp has already cached, share the link with a harmless extra
parameter (e.g. `?to=Nama&v=2`). Facebook's
[Sharing Debugger](https://developers.facebook.com/tools/debug/) can force a re-scrape.

## 4. Guest links

Every guest uses the same site with a different `?to=`:

```
https://<username>.github.io/alghifari-laeli/?to=Pujo
https://<username>.github.io/alghifari-laeli/?to=Pujo+%26+Partner
https://<username>.github.io/alghifari-laeli/?to=fauzan-wafi        ← slug from GUESTS in config.js
```

These work when opened directly, from WhatsApp, and on any phone, because query strings need
no server routing. As a bonus, `…/alghifari-laeli/fauzan-wafi` (no `?to=`) is redirected by
`404.html` to `?to=fauzan-wafi`.

Use **`generator.html`** (`…/alghifari-laeli/generator.html`) to create links and ready-to-send
WhatsApp messages for a whole list of names. It isn't linked from the invitation and is
marked `noindex`.

## 5. Custom domain (optional)

1. Buy a domain, e.g. `alghifarilaeli.com`.
2. DNS at your registrar:
   - Apex domain: four `A` records → `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - or a subdomain such as `www`: `CNAME` → `<username>.github.io`
3. Repository → **Settings → Pages → Custom domain** → enter the domain → Save
   (GitHub adds a `CNAME` file). Tick **Enforce HTTPS** once it's available.
4. Update `SITE_URL` in `index.html` (step 3) and, optionally, `site.url` in `js/config.js`.

## 6. Updating the site

Edit → commit → push to `main`. Pages redeploys automatically in about a minute.
Hard-refresh (or add `?v=2` to the URL) if the browser shows an old version.

## 7. Pre-launch checklist

- [x] `rsvp.apiUrl` set in `js/config.js` and tested live against the sheet (see `GOOGLE-SHEETS.md`)
- [ ] `SITE_URL` replaced in `index.html` (4 places) once the final address is known
- [ ] Open a guest link on an iPhone and an Android phone: cover → open → music → RSVP
- [ ] Submit one real-phone test RSVP with Invitation Slug `qa-test`
      (e.g. `…/?to=qa-test`), then run `removeTestRows` in Apps Script
- [ ] Share a link in WhatsApp and check the preview image and title
