/**
 * Small shared helpers: DOM, formatting, images, storage, toast.
 * No dependencies.
 */
(function (AWL) {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /**
   * Create an element. Text is always set with textContent (never innerHTML),
   * so user/config strings can't inject markup.
   *   h("p", { class: "x", "aria-label": "y" }, "text", childNode)
   */
  function h(tag, attrs = {}, ...children) {
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

  const BLANK = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

  /**
   * Build a responsive <picture> (AVIF + WebP) from a config image object.
   *   position      → object-position (keeps faces in frame when cropped)
   *   onlyBelow:N   → not downloaded at all on screens ≥ N px (e.g. mobile-only photo)
   *   onlyAbove:N   → only downloaded on screens ≥ N px (e.g. desktop side photo)
   *   alt:false     → decorative (empty alt)
   */
  function picture(img, { sizes = "100vw", loading = "lazy", priority = false, className = "", fade = true,
    position, onlyBelow, onlyAbove, alt } = {}) {
    const set = (ext) =>
      img.widths.map((w) => `${img.src}-${w}.${ext} ${Math.min(w, img.w)}w`).join(", ");
    const fallbackWidth = img.widths[Math.min(1, img.widths.length - 1)];
    const altText = alt === false ? "" : img.alt || "";
    const media = onlyAbove ? `(min-width: ${onlyAbove}px)` : null;

    const pic = h("picture", { class: `pic${fade ? " pic--fade" : ""} ${className}`.trim(), "data-alt": altText });
    if (img.color) pic.style.setProperty("--pic-color", img.color);
    if (onlyBelow) pic.append(h("source", { media: `(min-width: ${onlyBelow}px)`, srcset: BLANK }));
    pic.append(
      h("source", { type: "image/avif", srcset: set("avif"), sizes, media }),
      h("source", { type: "image/webp", srcset: set("webp"), sizes, media })
    );
    const el = h("img", {
      src: onlyAbove ? BLANK : `${img.src}-${fallbackWidth}.webp`,
      alt: altText,
      width: img.w,
      height: img.h,
      loading,
      decoding: "async",
      fetchpriority: priority ? "high" : null,
    });
    const pos = position || img.position;
    if (pos) el.style.objectPosition = pos;
    el.addEventListener("error", () => pic.classList.add("is-broken"), { once: true });
    el.addEventListener("load", () => pic.classList.add("is-loaded"), { once: true });
    if (el.complete && el.naturalWidth) pic.classList.add("is-loaded");
    pic.append(el);
    return pic;
  }

  /** Absolute moment for an event's start, e.g. ("2026-10-21", "10:00") → "2026-10-21T10:00:00+07:00". */
  const eventMoment = (date, time, offset = "+07:00") => `${date}T${time}:00${offset}`;

  /* ---------------------------------------------------------------- dates -- */

  const TZ = "Asia/Jakarta";

  /** "Rabu, 21 Oktober 2026" for a YYYY-MM-DD date in the wedding timezone. */
  function formatLongDate(isoDate, locale = "id-ID", timeZone = TZ) {
    const d = new Date(`${isoDate}T12:00:00+07:00`);
    return new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone }).format(d);
  }

  function dateParts(isoDate, locale = "id-ID", timeZone = TZ) {
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
  const formatTime = (hhmm) => (hhmm ? hhmm.replace(":", ".") : "");

  /* --------------------------------------------------------------- strings -- */

  /** Remove control/zero-width characters, collapse whitespace, trim. */
  function cleanText(value, maxLength = 200) {
    const s = String(value ?? "")
      .normalize("NFC")
      .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const chars = Array.from(s); // count by code points (emoji-safe)
    return chars.length > maxLength ? chars.slice(0, maxLength).join("").trim() + "…" : s;
  }

  function slugify(value) {
    return String(value ?? "")
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/&/g, " ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }

  const titleCase = (s) =>
    s.toLowerCase().replace(/(^|\s)(\p{L})/gu, (m, sp, ch) => sp + ch.toUpperCase());

  /** Group a numeric string for readability: "7361529751" → "7361 5297 51". */
  const groupDigits = (s) => String(s).replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  /* --------------------------------------------------------------- storage -- */
  // Storage can throw (private mode, blocked cookies), so always guard it.

  const store = {
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
  function toast(message) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2600);
  }

  /* --------------------------------------------------------------- network -- */

  async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  Object.assign(AWL, { $, $$, prefersReducedMotion, h, picture, eventMoment, formatLongDate, dateParts, formatTime, cleanText, slugify, titleCase, groupDigits, uuid, store, toast, fetchWithTimeout });
})(window.AWL = window.AWL || {});
