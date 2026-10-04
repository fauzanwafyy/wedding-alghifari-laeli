/**
 * RSVP form → Google Apps Script → Google Sheets.
 *
 * Handles: inline validation, loading, success, network/timeout/server errors,
 * duplicate protection (one submissionId per attempt, so retries never create
 * a second row; the server also rejects quick identical re-sends), and a
 * friendly notice when the backend URL hasn't been configured yet.
 */
import { WEDDING_CONFIG } from "./config.js";
import { submitRsvp, isApiConfigured } from "./api.js";
import { addLocalWish } from "./wishes.js";
import { $, cleanText, store, uuid } from "./utils.js";

const cfg = WEDDING_CONFIG.rsvp;
const STORE_KEY = "awl:rsvp";

const MESSAGES = {
  nameRequired: "Mohon isi nama lengkap Anda.",
  nameShort: "Nama terlalu pendek.",
  attendanceRequired: "Mohon pilih konfirmasi kehadiran.",
  countInvalid: `Jumlah tamu antara 1 dan ${cfg.maxGuests} orang.`,
  messageLong: `Ucapan maksimal ${cfg.messageMaxLength} karakter.`,
  network: "Koneksi terputus. Periksa internet Anda, lalu kirim ulang. Data yang Anda isi tidak hilang.",
  timeout: "Server sedang lambat merespons. Silakan coba kirim ulang sebentar lagi.",
  server: "Maaf, terjadi kendala pada server. Silakan coba beberapa saat lagi.",
  config: "Formulir RSVP sedang disiapkan. Silakan kembali lagi nanti.",
};

const cleanMessage = (s) =>
  String(s ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F​-‏‪-‮⁠-⁤﻿]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export function validateRsvp(data) {
  const errors = {};
  const name = cleanText(data.guestName, 200);
  if (!name) errors.guestName = MESSAGES.nameRequired;
  else if (Array.from(name).length < 2) errors.guestName = MESSAGES.nameShort;
  else if (Array.from(name).length > cfg.nameMaxLength) errors.guestName = `Nama maksimal ${cfg.nameMaxLength} karakter.`;

  if (data.attendance !== "attending" && data.attendance !== "not_attending") errors.attendance = MESSAGES.attendanceRequired;

  if (data.attendance === "attending") {
    const n = Number(data.guestCount);
    if (!Number.isInteger(n) || n < 1 || n > cfg.maxGuests) errors.guestCount = MESSAGES.countInvalid;
  }
  if (Array.from(cleanMessage(data.message)).length > cfg.messageMaxLength) errors.message = MESSAGES.messageLong;
  return errors;
}

export function initRsvp(guest) {
  const form = $("#rsvp-form");
  if (!form) return;

  const els = {
    name: $("#rsvp-name"),
    count: $("#rsvp-count"),
    countField: $("#guest-count-field"),
    message: $("#rsvp-message"),
    counter: $("#rsvp-message-count"),
    status: $("#rsvp-status"),
    submit: $("#rsvp-submit"),
    fieldset: $("#rsvp-fields"),
    success: $("#rsvp-success"),
    successTitle: $("#rsvp-success-title"),
    successText: $("#rsvp-success-text"),
    again: $("#rsvp-again"),
    returning: $("#rsvp-returning"),
    hint: $("#guest-count-hint"),
  };

  let submissionId = uuid();
  let submitting = false;

  // ---- setup ---------------------------------------------------------------
  els.name.maxLength = cfg.nameMaxLength;
  els.message.maxLength = cfg.messageMaxLength;
  els.count.max = String(cfg.maxGuests);
  if (els.hint) els.hint.textContent = `Termasuk Anda. Maksimal ${cfg.maxGuests} orang.`;
  if (guest && !guest.isDefault && guest.rsvpName) els.name.value = guest.rsvpName;

  const previous = store.get(STORE_KEY);
  if (previous && previous.name && els.returning) {
    els.returning.hidden = false;
    els.returning.textContent = `Anda sudah mengirim konfirmasi sebagai “${cleanText(previous.name, 80)}”. Kirim lagi hanya jika ingin memperbarui.`;
  }

  if (!isApiConfigured()) {
    showStatus("info", MESSAGES.config);
    els.submit.disabled = true;
  }

  // ---- helpers ---------------------------------------------------------------
  function fieldError(name, message) {
    const input = form.querySelector(`[name="${name}"]`);
    const box = $(`#rsvp-${name}-error`);
    if (box) box.textContent = message || "";
    form.querySelectorAll(`[name="${name}"]`).forEach((el) => {
      if (message) el.setAttribute("aria-invalid", "true");
      else el.removeAttribute("aria-invalid");
    });
    const field = input && input.closest(".field");
    if (field) field.classList.toggle("has-error", Boolean(message));
  }

  function showStatus(kind, text) {
    els.status.hidden = !text;
    els.status.dataset.kind = kind || "";
    els.status.textContent = text || "";
  }

  function readForm() {
    const fd = new FormData(form);
    const attendance = fd.get("attendance") || "";
    return {
      guestName: cleanText(fd.get("guestName"), 200),
      attendance,
      guestCount: attendance === "attending" ? Number(fd.get("guestCount")) : 0,
      message: cleanMessage(fd.get("message")),
      website: String(fd.get("website") || ""), // honeypot
    };
  }

  function updateCounter() {
    const len = Array.from(els.message.value).length;
    els.counter.textContent = `${len} / ${cfg.messageMaxLength}`;
    els.counter.classList.toggle("is-near", len > cfg.messageMaxLength * 0.9);
  }

  function setAttendanceUI() {
    const value = (form.querySelector('[name="attendance"]:checked') || {}).value;
    const attending = value === "attending";
    els.countField.hidden = !attending;
    els.count.disabled = !attending;
  }

  function setSubmitting(on) {
    submitting = on;
    form.classList.toggle("is-submitting", on);
    els.submit.setAttribute("aria-busy", on ? "true" : "false");
    els.submit.querySelector(".btn__label").textContent = on ? "Mengirim…" : "Kirim Konfirmasi";
    els.fieldset.disabled = on;
    els.submit.disabled = on;
  }

  function showSuccess(data, duplicate) {
    const first = data.guestName.split(" ")[0];
    els.successTitle.textContent = `Terima kasih, ${first}.`;
    els.successText.textContent = duplicate
      ? "Konfirmasi Anda sudah kami terima sebelumnya. Tidak perlu mengirim ulang."
      : data.attendance === "attending"
        ? `Konfirmasi kehadiran untuk ${data.guestCount} orang telah kami terima. Kami menantikan kehadiran Anda di hari bahagia kami.`
        : "Konfirmasi Anda telah kami terima. Terima kasih atas doa dan restunya, kehadiran Anda akan kami rindukan.";
    form.hidden = true;
    els.returning.hidden = true;
    els.success.hidden = false;
    els.success.classList.remove("is-shown");
    void els.success.offsetWidth; // restart the check animation
    els.success.classList.add("is-shown");
    els.success.focus({ preventScroll: true });
    els.success.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // ---- events ----------------------------------------------------------------
  form.addEventListener("change", (e) => {
    if (e.target.name === "attendance") {
      setAttendanceUI();
      fieldError("attendance", "");
    }
  });

  els.message.addEventListener("input", updateCounter);
  els.name.addEventListener("blur", () => {
    const errs = validateRsvp({ ...readForm(), attendance: "attending", guestCount: 1 });
    if (els.name.value) fieldError("guestName", errs.guestName);
  });
  els.name.addEventListener("input", () => form.querySelector(".field.has-error #rsvp-name") && fieldError("guestName", ""));

  form.querySelectorAll("[data-step]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const next = Math.min(cfg.maxGuests, Math.max(1, (Number(els.count.value) || 1) + Number(btn.dataset.step)));
      els.count.value = String(next);
      fieldError("guestCount", "");
    })
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submitting) return; // guard against double taps

    const data = readForm();
    const errors = validateRsvp(data);
    ["guestName", "attendance", "guestCount", "message"].forEach((k) => fieldError(k, errors[k]));
    if (Object.keys(errors).length) {
      showStatus("error", "Mohon periksa kembali isian yang ditandai.");
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }
    if (!isApiConfigured()) {
      showStatus("info", MESSAGES.config);
      return;
    }

    showStatus("", "");
    setSubmitting(true);
    try {
      const res = await submitRsvp({
        submissionId,
        invitationSlug: (guest && guest.slug) || "umum",
        guestName: data.guestName,
        attendance: data.attendance,
        guestCount: data.guestCount,
        message: data.message,
        website: data.website,
      });
      const duplicate = res.status === "duplicate";
      store.set(STORE_KEY, { name: data.guestName, attendance: data.attendance, at: Date.now() });
      if (data.message && !duplicate) addLocalWish({ id: submissionId, name: data.guestName, message: data.message });
      showSuccess(data, duplicate);
    } catch (err) {
      const kind = err && err.kind;
      if (kind === "rejected") {
        // Server-side validation message (already user-friendly Indonesian)
        showStatus("error", err.message || MESSAGES.server);
        if (err.detail && err.detail.field) fieldError(err.detail.field, err.message);
      } else {
        showStatus("error", MESSAGES[kind] || MESSAGES.server);
      }
      // Keep the same submissionId so a retry can't create a duplicate row.
    } finally {
      setSubmitting(false);
    }
  });

  els.again.addEventListener("click", () => {
    submissionId = uuid(); // a new, intentional submission
    els.success.hidden = true;
    form.hidden = false;
    form.reset();
    if (guest && !guest.isDefault && guest.rsvpName) els.name.value = guest.rsvpName;
    setAttendanceUI();
    updateCounter();
    showStatus("", "");
    els.name.focus();
  });

  setAttendanceUI();
  updateCounter();
}
