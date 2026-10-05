# RSVP backend: Google Sheets + Apps Script

The website is static (GitHub Pages), so RSVPs are stored in a **Google Sheet** through a
small **Google Apps Script Web App** (`google-apps-script/Code.gs`).

```
Guest's browser ──POST /exec──▶ Apps Script (Code.gs) ──new row──▶ Google Sheet, tab "RSVP"
                ◀─GET ?action=wishes── name + message only ◀──────────┘
```

Nothing secret is ever placed in the website: the Web App URL only accepts RSVPs and
returns public wishes.

## Current live setup (already done)

| Item | Value |
|---|---|
| Google account (owner) | the Google account that ran the setup (not written here, since this repo will be public) |
| Spreadsheet | **RSVP - Undangan Alghifari & Laeli** (tab **RSVP**; the empty *Sheet1* tab can be ignored or deleted) |
| Apps Script project | **RSVP Undangan Alghifari & Laeli**, *bound* to that spreadsheet (Ekstensi → Apps Script), `@OnlyCurrentDoc` |
| Deployment | Web app · **Jalankan sebagai: Saya** · **Yang memiliki akses: Siapa saja** · version 3 |
| Web App URL | `https://script.google.com/macros/s/AKfycbxAJ-qHfMK--DcGSp1C_9E1wrarz_hrWl2teccNZPfjWnxheVE5KCtGyzRTmHYj-7gm/exec` (already in `js/config.js` → `rsvp.apiUrl`) |
| Tested live | ping, create, retry → duplicate, identical re-send → duplicate, validation errors, honeypot, formula guard, public wishes (name + message only), real frontend client code. All test rows removed afterwards. |

The sheet itself is private (only the owner can open it). The Web App runs as the owner,
so guests can submit without access to the sheet.

The sections below describe how to set it up from scratch (for a new sheet or account).
Google's menus are shown in English with the Indonesian label in brackets.

---

## 1. Create the spreadsheet

1. Go to <https://sheets.new> (signed in with the Google account that should own the data).
2. Rename it, e.g. **Undangan Alghifari & Laeli: RSVP**.

## 2. Add the script

1. In the sheet: **Extensions → Apps Script** (*Ekstensi → Apps Script*). Open it **from the
   sheet**, not from script.google.com, so the script is bound to this sheet.
2. Delete the sample `function myFunction() {}`.
3. Open `google-apps-script/Code.gs` from this repository, copy **everything**, paste it in.
4. Click **Save** (💾). Name the project e.g. *RSVP Alghifari & Laeli*.

> Because the script is opened from inside the sheet ("bound"), you do **not** need to paste
> a spreadsheet ID. Leave `SPREADSHEET_ID: ''`.
> (Only if you create a standalone script at script.google.com: put the ID from the sheet URL
> `https://docs.google.com/spreadsheets/d/<THIS_PART>/edit` into `SPREADSHEET_ID`.)

## 3. Run setup once

1. In the toolbar function dropdown choose **`setup`** → **Run**.
2. Google asks for permission: **Review permissions** → choose your account →
   *"Google hasn't verified this app"* → **Advanced** → **Go to RSVP… (unsafe)** → **Allow**.
   (It's your own script. The warning appears for every personal script.)
3. The sheet now has an **RSVP** tab with these columns:

| Column | Content | Public? |
|---|---|---|
| A · Timestamp | Time received (Asia/Jakarta) | No |
| B · Invitation Slug | From the guest link, e.g. `pujo-partner`, or `umum` | No |
| C · Guest Name | Full name typed by the guest | **Yes** (with the wish) |
| D · Attendance | `Hadir` / `Tidak Hadir` | No |
| E · Guest Count | Number of people (0 if not attending) | No |
| F · Wedding Message | The wish | **Yes** |
| G · Submission ID | Random ID used to prevent duplicates | No |
| H · Show on Website | ☑ = wish visible. Untick to hide a wish | No |

Permissions requested: *see, edit, create spreadsheets* (to write RSVPs) and *connect to an
external service / run when you're not present* (to serve the Web App).

## 4. Deploy as a Web App

1. **Deploy → New deployment** (*Terapkan → Deployment baru*).
2. Click ⚙ next to "Select type" → **Web app** (*Aplikasi web*).
3. Settings:
   - **Description:** `RSVP v1`
   - **Execute as:** **Me** (*Saya*): your account, so the script can write to your sheet
   - **Who has access:** **Anyone** (*Siapa saja*): guests aren't signed in; this is required
4. **Deploy** → copy the **Web app URL**. It looks like
   `https://script.google.com/macros/s/AKfycb…/exec`

**Quick check:** open `<your URL>?action=ping` in a browser. You should see
`{"ok":true,"time":"…"}`.

## 5. Connect the website

1. Open `js/config.js`.
2. Replace the placeholder:
   ```js
   rsvp: {
     apiUrl: "https://script.google.com/macros/s/AKfycb…/exec",
   ```
3. Commit & push (see `DEPLOYMENT.md`). The RSVP form and Wedding Wishes go live
   automatically. Until a valid URL is set, the form politely says it's being prepared.

## 6. Test it

1. Open the invitation, submit an RSVP with a message.
2. A new row appears in the sheet within a second or two.
3. The wish appears in **Wedding Wishes** immediately for you, and for other guests within
   ~30 seconds (they poll while the section is on screen).

You can also run **`selfTest`** in the editor: it writes one test row ("Self Test") and logs
the responses. Afterwards run **`removeTestRows`**: it deletes only rows whose Invitation Slug
is `selftest` or `qa-test`, never real RSVPs.

---

## Updating the script later

Edits to `Code.gs` only go live after a new version is deployed:

**Deploy → Manage deployments → ✏️ (edit) → Version: New version → Deploy.**
(*Terapkan → Kelola deployment → ✏️ → Versi: Versi baru → Terapkan.*)

Editing the existing deployment this way **keeps the same URL**, so the website needs no change.
(Creating a *New deployment* instead would produce a new URL that you'd have to paste into
`js/config.js`.)

## Moderating wishes

Untick **Show on Website** (column H) on any row. The wish disappears from the site within
~30 seconds. You can also edit the text in column F, or delete the row.

## Reading the RSVPs

- Filter column D for `Hadir` and use `=SUM(E:E)` for the head count.
- **File → Download → .xlsx / .csv** for the vendor.

## Behaviour & safety built in

| Concern | How it's handled |
|---|---|
| Validation | Name 2–80 chars, attendance required, guest count 1–5 (0 if not attending), message ≤ 500. Same rules in browser and server. |
| HTML / script injection | Tags and control characters stripped server-side; the website renders text only (never HTML). |
| Spreadsheet formula injection | Values starting with `= + - @` are stored with a leading `'`. |
| Double taps / retries | Each attempt carries a random `submissionId`; repeats are answered `duplicate` and **not** stored. Identical re-sends within 10 minutes are also ignored. |
| Spam | Hidden honeypot field + max 6 submissions per name/invitation per 10 minutes. |
| Concurrency | `LockService` serialises writes, so no rows are lost when many guests submit at once. |
| Privacy | `?action=wishes` returns only `name` + `message` (+ an opaque id). Attendance, counts, timestamps and slugs never leave the sheet. |
| Load | Public wishes cached for 20 s, so polling stays cheap. |
| Row placement | New RSVPs go into the first empty row under the data (judged by column A), not via `appendRow`. Checkboxes are added per row. A checkbox column pre-filled down the sheet fills empty rows with FALSE, which made `appendRow` write at row 1001+. `setup` now clears those leftovers. |

## Troubleshooting

| Symptom | Fix |
|---|---|
| Form says *"sedang disiapkan"* | `rsvp.apiUrl` in `js/config.js` is still the placeholder or doesn't end in `/exec`. |
| `?action=ping` asks you to sign in | Deployment access isn't **Anyone**. Edit the deployment. |
| Error *"Maaf, terjadi kendala pada server"* | Open Apps Script → **Executions** to see the error. Usually the `setup` authorisation wasn't completed. |
| Changes to Code.gs have no effect | Deploy a **New version** of the existing deployment (see above). |
| Wishes don't update | Wait ~30 s (cache + polling). Check column H is ticked. |
| New rows appear far below (row 1000+) | Someone filled column H with checkboxes for the whole sheet. Run **`setup`** once: it removes checkboxes/FALSE from empty rows. Existing rows are kept. |
| Need to delete test submissions | Use Invitation Slug `qa-test` for tests, then run **`removeTestRows`**. |
