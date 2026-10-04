/**
 * Public Wedding Wishes: shows ONLY guest name + message.
 * Loads when the section approaches the viewport, then polls every
 * `wishesPollIntervalMs` while the section is visible and the tab is active.
 */
(function (AWL) {
  "use strict";
  const WEDDING_CONFIG = window.WEDDING_CONFIG;
  const { getWishes, isApiConfigured } = AWL;
  const { $, h, cleanText } = AWL;

  const cfg = WEDDING_CONFIG.rsvp;

  const state = {
    items: [],          // newest first: { id, name, message }
    ids: new Set(),
    shown: cfg.wishesPageSize,
    loaded: false,
    loading: false,
    visible: false,
    timer: null,
    lastFetch: 0,
  };

  let els = {};

  const initialOf = (name) => (Array.from(name.trim())[0] || "•").toUpperCase();
  const keyOf = (w) => String(w.id || `${w.name}|${w.message}`);

  function wishNode(w, isNew = false) {
    return h(
      "li",
      { class: `wish${isNew ? " is-new" : ""}` },
      h("span", { class: "wish__avatar", "aria-hidden": "true", text: initialOf(w.name) }),
      h(
        "div",
        { class: "wish__body" },
        h("p", { class: "wish__name", text: w.name }),
        h("p", { class: "wish__msg", text: w.message })
      )
    );
  }

  function setStatus(kind) {
    const box = els.state;
    box.replaceChildren();
    box.dataset.kind = kind || "";
    if (!kind) {
      box.hidden = true;
      return;
    }
    box.hidden = false;

    if (kind === "loading") {
      box.setAttribute("aria-busy", "true");
      box.append(
        h("span", { class: "visually-hidden", text: "Memuat ucapan…" }),
        ...[0, 1, 2].map(() =>
          h("div", { class: "wish-skeleton", "aria-hidden": "true" },
            h("span", { class: "wish-skeleton__dot" }),
            h("span", { class: "wish-skeleton__lines" }, h("span"), h("span"), h("span")))
        )
      );
      return;
    }
    box.removeAttribute("aria-busy");

    if (kind === "empty") {
      box.append(
        h("p", { class: "wishes-empty__title", text: "Belum ada ucapan." }),
        h("p", { class: "wishes-empty__text", text: "Jadilah yang pertama mengirimkan doa dan ucapan untuk kedua mempelai." }),
        h("a", { class: "link-arrow", href: "#rsvp", text: "Tulis ucapan" })
      );
    } else if (kind === "error") {
      box.append(
        h("p", { class: "wishes-empty__title", text: "Ucapan belum dapat dimuat." }),
        h("p", { class: "wishes-empty__text", text: "Periksa koneksi internet Anda, lalu coba lagi." }),
        h("button", { type: "button", class: "btn btn--small", text: "Coba lagi", onclick: () => load(true) })
      );
    } else if (kind === "offline") {
      box.append(
        h("p", { class: "wishes-empty__title", text: "Ucapan akan segera tampil di sini." }),
        h("p", { class: "wishes-empty__text", text: "Halaman ucapan sedang disiapkan." })
      );
    }
  }

  function renderCount() {
    const n = state.items.length;
    els.count.textContent = n ? `${n} ucapan & doa` : "";
  }

  function renderList(newIds = new Set()) {
    const visible = state.items.slice(0, state.shown);
    els.list.replaceChildren(...visible.map((w) => wishNode(w, newIds.has(keyOf(w)))));
    const remaining = state.items.length - visible.length;
    els.more.hidden = remaining <= 0;
    if (remaining > 0) els.more.textContent = `Tampilkan lebih banyak (${remaining})`;
    renderCount();
  }

  function normalise(list) {
    return (Array.isArray(list) ? list : [])
      .map((w) => ({
        id: w.id ? String(w.id).slice(0, 80) : "",
        name: cleanText(w.name, 80),
        message: String(w.message ?? "").replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, 1000),
      }))
      .filter((w) => w.name && w.message);
  }

  async function load(force = false) {
    if (state.loading) return;
    if (!force && Date.now() - state.lastFetch < cfg.wishesPollIntervalMs - 1000) return;
    state.loading = true;
    if (!state.loaded) setStatus("loading");
    try {
      const data = await getWishes();
      const incoming = normalise(data.wishes);
      const wasLoaded = state.loaded;
      const prevSignature = state.items.map(keyOf).join("\n");
      const newIds = new Set();
      if (wasLoaded) incoming.forEach((w) => !state.ids.has(keyOf(w)) && newIds.add(keyOf(w)));
      // Keep locally-added wishes that the server hasn't returned yet
      const incomingKeys = new Set(incoming.map(keyOf));
      const pendingLocal = state.items.filter((w) => w.local && !incomingKeys.has(keyOf(w)));
      state.items = [...pendingLocal, ...incoming];
      state.ids = new Set(state.items.map(keyOf));
      state.loaded = true;
      state.lastFetch = Date.now();
      setStatus(state.items.length ? null : "empty");
      // Avoid re-rendering when nothing changed between polls
      if (!wasLoaded || state.items.map(keyOf).join("\n") !== prevSignature) renderList(newIds);
    } catch (err) {
      if (!state.loaded) setStatus(err && err.kind === "config" ? "offline" : "error");
      // If we already have wishes, keep showing them silently and retry next poll.
    } finally {
      state.loading = false;
    }
  }

  function schedule() {
    clearTimeout(state.timer);
    if (!state.visible || document.visibilityState !== "visible" || !isApiConfigured()) return;
    state.timer = setTimeout(async () => {
      await load();
      schedule();
    }, cfg.wishesPollIntervalMs);
  }

  /** Called by rsvp.js after a successful submission (optimistic display). */
  function addLocalWish({ id, name, message }) {
    if (!els.list) return;
    const w = { id, name: cleanText(name, 80), message: String(message || "").trim(), local: true };
    if (!w.name || !w.message || state.ids.has(keyOf(w))) return;
    state.items.unshift(w);
    state.ids.add(keyOf(w));
    state.shown = Math.max(state.shown, cfg.wishesPageSize);
    setStatus(null);
    renderList(new Set([keyOf(w)]));
  }

  function initWishes() {
    els = {
      section: $("#wishes"),
      list: $("#wishes-list"),
      state: $("#wishes-state"),
      count: $("#wishes-count"),
      more: $("#wishes-more"),
    };
    if (!els.section) return;

    els.more.addEventListener("click", () => {
      state.shown += cfg.wishesPageSize;
      renderList();
    });

    if (!isApiConfigured()) {
      setStatus("offline");
      return;
    }

    // Lazy first load + poll only while visible
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          state.visible = entry.isIntersecting;
          if (state.visible) {
            load();
            schedule();
          } else {
            clearTimeout(state.timer);
          }
        }
      },
      { rootMargin: "600px 0px 600px 0px" }
    );
    io.observe(els.section);

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && state.visible) {
        load();
        schedule();
      } else {
        clearTimeout(state.timer);
      }
    });
  }

  Object.assign(AWL, { addLocalWish, initWishes });
})(window.AWL = window.AWL || {});
