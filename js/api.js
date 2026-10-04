/**
 * Tiny client for the Google Apps Script Web App (see google-apps-script/Code.gs).
 *
 * - POST uses Content-Type text/plain so the browser sends a "simple" request
 *   (no CORS preflight, which Apps Script can't answer). The body is still JSON.
 * - GET returns only public data: { name, message } per wish.
 */
(function (AWL) {
  "use strict";
  const WEDDING_CONFIG = window.WEDDING_CONFIG;
  const { fetchWithTimeout } = AWL;

  const { rsvp } = WEDDING_CONFIG;
  const URL_PATTERN = /^https:\/\/script\.google\.com\/(?:a\/macros\/[^/]+|macros)\/s\/[\w-]+\/exec$/;

  const apiUrl = () => (rsvp.apiUrl || "").trim();
  const isApiConfigured = () => URL_PATTERN.test(apiUrl());

  class ApiError extends Error {
    constructor(kind, message, detail) {
      super(message);
      this.kind = kind; // "network" | "timeout" | "server" | "rejected" | "config"
      this.detail = detail;
    }
  }

  async function readJson(res) {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new ApiError("server", "Respons server tidak valid.", text.slice(0, 200));
    }
  }

  async function call(url, options) {
    if (!isApiConfigured()) throw new ApiError("config", "RSVP belum dikonfigurasi.");
    let res;
    try {
      res = await fetchWithTimeout(url, { cache: "no-store", redirect: "follow", ...options }, rsvp.requestTimeoutMs);
    } catch (err) {
      if (err && err.name === "AbortError") throw new ApiError("timeout", "Permintaan terlalu lama.");
      throw new ApiError("network", "Tidak dapat terhubung ke server.");
    }
    if (!res.ok) throw new ApiError("server", `Server error (${res.status}).`);
    const data = await readJson(res);
    if (!data || data.ok !== true) {
      throw new ApiError("rejected", (data && data.error) || "Permintaan ditolak server.", data);
    }
    return data;
  }

  function getWishes() {
    if (!isApiConfigured()) return Promise.reject(new ApiError("config", "RSVP belum dikonfigurasi."));
    const u = new URL(apiUrl());
    u.searchParams.set("action", "wishes");
    u.searchParams.set("_", String(Date.now())); // defeat intermediary caches
    return call(u.toString(), { method: "GET" });
  }

  function submitRsvp(payload) {
    return call(apiUrl(), {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "rsvp", ...payload }),
    });
  }

  Object.assign(AWL, { apiUrl, isApiConfigured, ApiError, getWishes, submitRsvp });
})(window.AWL = window.AWL || {});
