/**
 * Guest personalisation from the URL, e.g.
 *   ?to=Pujo                → "Pujo"
 *   ?to=Pujo+%26+Partner    → "Pujo & Partner"
 *   ?to=fauzan-wafi         → looked up in GUESTS → "Fauzan Wafi & Partner"
 *   ?to=budi-santoso        → unknown slug → "Budi Santoso"
 *   (none)                  → default greeting
 *
 * The result is only ever written with textContent, so input like
 * ?to=<script>… is displayed as harmless text.
 */
import { cleanText, slugify, titleCase } from "./utils.js";

const MAX_NAME = 60;
const SLUG_LIKE = /^[a-z0-9]+(?:[-_.][a-z0-9]+)+$/i;
const PARTNER_SUFFIX = /\s*(?:&|\+|dan|and)\s*(?:partner|pasangan|keluarga|family|suami|istri)\.?\s*$/i;

export function resolveGuest(search, guests = {}, defaultName = "Tamu Undangan") {
  const fallback = { isDefault: true, displayName: defaultName, rsvpName: "", slug: "umum", source: "default" };

  let raw = null;
  try {
    raw = new URLSearchParams(search).get("to");
  } catch {
    raw = null;
  }
  const value = cleanText(raw, MAX_NAME);
  if (!value) return fallback;

  // 1) Known slug from the guest list
  const key = slugify(value);
  const entry = key && Object.prototype.hasOwnProperty.call(guests, key) ? guests[key] : null;
  if (entry && entry.name) {
    const name = cleanText(entry.name, MAX_NAME);
    const partner = cleanText(entry.partner || "", 40);
    return {
      isDefault: false,
      displayName: entry.display ? cleanText(entry.display, MAX_NAME) : partner ? `${name} & ${partner}` : name,
      rsvpName: name,
      slug: key,
      source: "list",
    };
  }

  // 2) Free-text name (or an unknown slug, made readable)
  const displayName = SLUG_LIKE.test(value) && !/\s/.test(value)
    ? titleCase(value.replace(/[-_.]+/g, " "))
    : value;

  return {
    isDefault: false,
    displayName,
    rsvpName: displayName.replace(PARTNER_SUFFIX, "").trim() || displayName,
    slug: slugify(displayName) || "tamu",
    source: "param",
  };
}
