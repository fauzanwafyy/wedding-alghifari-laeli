/**
 * Small shared helpers: DOM, formatting, images, storage, toast.
 * No dependencies.
 */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export const prefersReducedMotion = () =>
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Create an element. Text is always set with textContent (never innerHTML),
 * so user/config strings can't inject markup.
 *   h("p", { class: "x", "aria-label": "y" }, "text", childNode)
 */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === false || value === null || value === undefined) continue;
    if (key === "class") el.className = value;
    else if (key === "text") el.textContent = value;
    else if (key === "dataset") Object.assign(el.dataset, value);
    else if (key.startsWith("on") && typeof value === "function") el.addEventListener(key.slice(2), value);
    else if (value === true) el.setAttribute(key, "");
    else el.setAttribute(key, String(value));
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

/** Build a responsive <picture> (AVIF + WebP) from a config image object. */
export function picture(img, { sizes = "100vw", loading = "lazy", priority = false, className = "" } = {}) {
  const set = (ext) =>
    img.widths.map((w) => `${img.src}-${w}.${ext} ${Math.min(w, img.w)}w`).join(", ");
  const fallbackWidth = img.widths[Math.min(1, img.widths.length - 1)];

  const pic = h("picture", { class: `pic pic--fade ${className}`.trim(), "data-alt": img.alt || "" });
  if (img.color) pic.style.setProperty("--pic-color", img.color);
  pic.append(
    h("source", { type: "image/avif", srcset: set("avif"), sizes }),
    h("source", { type: "image/webp", srcset: set("webp"), sizes })
  );
  const el = h("img", {
    src: `${img.src}-${fallbackWidth}.webp`,
    alt: img.alt || "",
    width: img.w,
    height: img.h,
    loading,
    decoding: "async",
    fetchpriority: priority ? "high" : null,
  });
  el.addEventListener("error", () => pic.classList.add("is-broken"), { once: true });
  el.addEventListener("load", () => pic.classList.add("is-loaded"), { once: true });
  if (el.complete && el.naturalWidth) pic.classList.add("is-loaded");
  pic.append(el);
  return pic;
}

/* ---------------------------------------------------------------- dates -- */

const TZ = "Asia/Jakarta";

/** "Rabu, 21 Oktober 2026" for a YYYY-MM-DD date in the wedding timezone. */
export function formatLongDate(isoDate, locale = "id-ID", timeZone = TZ) {
  const d = new Date(`${isoDate}T12:00:00+07:00`);
  return new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone }).format(d);
}

export function dateParts(isoDate, locale = "id-ID", timeZone = TZ) {
  const d = new Date(`${isoDate}T12:00:00+07:00`);
  const get = (opts) => new Intl.DateTimeFormat(locale, { ...opts, timeZone }).format(d);
  return {
    weekday: get({ weekday: "long" }),
    day: get({ day: "numeric" }),
    month: get({ month: "long" }),
    year: get({ year: "numeric" }),
    monthNum: get({ month: "2-digit" }),
    monthEn: new Intl.DateTimeFormat("en-GB", { month: "long", timeZone }).format(d),
  };
}

/** "08:30" → "08.30" (Indonesian style). */
export const formatTime = (hhmm) => (hhmm ? hhmm.replace(":", ".") : "");

/* --------------------------------------------------------------- strings -- */

/** Remove control/zero-width characters, collapse whitespace, trim. */
export function cleanText(value, maxLength = 200) {
  const s = String(value ?? "")
    .normalize("NFC")
    .replace(/[\u0000-\u001F\u007F-\u009F​-‏‪-‮⁠-⁤﻿]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const chars = Array.from(s); // count by code points (emoji-safe)
  return chars.length > maxLength ? chars.slice(0, maxLength).join("").trim() + "…" : s;
}

export function slugify(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const titleCase = (s) =>
  s.toLowerCase().replace(/(^|\s)(\p{L})/gu, (m, sp, ch) => sp + ch.toUpperCase());

/** Group a numeric string for readability: "7361529751" → "7361 5297 51". */
export const groupDigits = (s) => String(s).replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");

export function uuid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/* --------------------------------------------------------------- storage -- */
// Storage can throw (private mode, blocked cookies), so always guard it.

export const store = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  },
};

/* ----------------------------------------------------------------- toast -- */

let toastTimer;
export function toast(message) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2600);
}

/* --------------------------------------------------------------- network -- */

export async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
