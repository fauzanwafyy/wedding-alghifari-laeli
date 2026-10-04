/**
 * Entry point: binds config to the page, runs the opening experience and
 * initialises every section. All wedding data comes from js/config.js.
 */
(function (AWL) {
  "use strict";
  const C = window.WEDDING_CONFIG;
  const GUESTS = window.GUESTS;
  const { $, $$, h, picture, dateParts, formatLongDate, formatTime, prefersReducedMotion } = AWL;
  const { resolveGuest } = AWL;
  const { initCountdown } = AWL;
  const { buildGoogleCalendarUrl } = AWL;
  const { initGallery } = AWL;
  const { initRsvp } = AWL;
  const { initWishes } = AWL;
  const { initGift } = AWL;
  const { createMusic } = AWL;

  const html = document.documentElement;
  const siteUrl = C.site.url || `${location.origin}${location.pathname.replace(/index\.html$/, "")}`;

  /* ------------------------------------------------------------ view model -- */
  function buildModel(guest) {
    const { groom, bride } = C.couple;
    const d = dateParts(C.wedding.date, C.site.locale);
    const parents = (p) => `${p.father.prefix} ${p.father.name} & ${p.mother.prefix} ${p.mother.name}`.replace(/\s+/g, " ").trim();
    const first = C.events[0] || {};
    return {
      "couple.short": `${groom.nickname} & ${bride.nickname}`,
      "groom.nick": groom.nickname,
      "bride.nick": bride.nickname,
      "groom.name": groom.displayName,
      "bride.name": bride.displayName,
      "groom.childOf": groom.childOf,
      "bride.childOf": bride.childOf,
      "groom.parents": parents(groom),
      "bride.parents": parents(bride),
      "groom.initial": groom.initial,
      "bride.initial": bride.initial,
      "date.long": formatLongDate(C.wedding.date, C.site.locale),
      "date.weekday": d.weekday,
      "date.day": d.day,
      "date.month": d.month,
      "date.year": d.year,
      "date.monthYear": `${d.month} ${d.year}`,
      "date.en": `${d.day} ${d.monthEn} ${d.year}`,
      "date.dots": `${d.day.padStart(2, "0")} · ${d.monthNum} · ${d.year}`,
      "date.short": `${d.day.padStart(2, "0")}.${d.monthNum}.${d.year.slice(-2)}`,
      "date.firstTime": `${formatLongDate(C.wedding.date, C.site.locale)} · ${formatTime(first.startTime)} ${C.wedding.timezoneLabel}`,
      "venue.name": C.venue.name,
      "venue.address": C.venue.address,
      "venue.short": C.venue.shortAddress || C.venue.address,
      "guest.name": guest.displayName,
      "family.groom": `${C.copy.familyPrefix}\n${parents(groom)}`,
      "family.bride": `${C.copy.familyPrefix}\n${parents(bride)}`,
      ...Object.fromEntries(
        Object.entries(C.copy).filter(([, v]) => typeof v === "string").map(([k, v]) => [`copy.${k}`, v])
      ),
      "copy.verse.text": C.copy.verse.text,
      "copy.verse.source": C.copy.verse.source,
      "gift.intro": C.gift.intro,
    };
  }

  function bindModel(model) {
    $$("[data-bind]").forEach((el) => {
      const v = model[el.dataset.bind];
      if (typeof v === "string") el.textContent = v;
    });
    $$("[data-hide-empty]").forEach((el) => {
      el.hidden = !model[el.dataset.hideEmpty];
    });
    $$("[data-href='maps']").forEach((a) => {
      a.href = C.venue.mapsUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    });
  }

  /* ------------------------------------------------------------- sections -- */
  function renderCouple() {
    for (const role of ["groom", "bride"]) {
      const p = C.couple[role];
      const slot = $(`[data-image="${role}"]`);
      if (slot && p.photo) {
        slot.replaceChildren(picture(p.photo, { sizes: "(min-width: 1024px) 420px, (min-width: 768px) 45vw, 82vw" }));
      }
      const ig = $(`[data-instagram="${role}"]`);
      if (ig) {
        const handle = (p.instagram || "").replace(/^@/, "").trim();
        ig.hidden = !handle;
        if (handle) {
          ig.href = `https://instagram.com/${encodeURIComponent(handle)}`;
          ig.querySelector("span").textContent = `@${handle}`;
        }
      }
    }
  }

  function renderEvents() {
    const list = $("#event-list");
    if (!list) return;
    const tz = C.wedding.timezoneLabel;
    C.events.forEach((ev, i) => {
      const end = ev.endTime ? `– ${formatTime(ev.endTime)} ${tz}` : ev.endText ? `– ${ev.endText}` : "";
      list.append(
        h("li", { class: "program__item", "data-reveal": "" },
          h("span", { class: "program__no", "aria-hidden": "true", text: String(i + 1).padStart(2, "0") }),
          h("div", { class: "program__body" },
            h("h3", { class: "program__title", text: ev.title }),
            h("p", { class: "program__date", text: formatLongDate(ev.date, C.site.locale) }),
            h("p", { class: "program__time" },
              h("span", { class: "program__clock", text: formatTime(ev.startTime) }),
              h("span", { class: "program__tz", text: ` ${tz}` }),
              end ? h("span", { class: "program__end", text: ` ${end}` }) : null),
            ev.note ? h("p", { class: "program__note", text: ev.note }) : null,
            // Only show a per-event venue when events take place at different venues
            new Set(C.events.map((e) => e.venue)).size > 1
              ? h("a", { class: "link-arrow", href: ev.mapsUrl, target: "_blank", rel: "noopener noreferrer", text: ev.venue })
              : null))
      );
    });
  }

  function renderStory() {
    const list = $("#story-list");
    if (!list) return;
    C.story.forEach((ch, i) => {
      list.append(
        h("li", { class: `chapter${i % 2 ? " chapter--alt" : ""}` },
          ch.image
            ? h("figure", { class: "chapter__figure", "data-reveal": "" },
                picture(ch.image, { sizes: "(min-width: 1024px) 400px, (min-width: 768px) 50vw, 78vw" }))
            : null,
          h("div", { class: "chapter__body", "data-reveal": "" },
            h("p", { class: "chapter__kicker" },
              h("span", { class: "chapter__no", text: ch.number }),
              h("span", { class: "chapter__sub", text: ch.subtitle })),
            h("h3", { class: "chapter__title", text: ch.title }),
            h("div", { class: "chapter__text" }, ...ch.paragraphs.map((t) => h("p", { text: t })))))
      );
    });
  }

  function renderVerse() {
    const verse = $("#verse");
    if (verse) verse.hidden = !C.copy.verse.enabled;
  }

  /* --------------------------------------------------------------- motion -- */
  function initReveal() {
    const items = $$("[data-reveal]");
    if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    items.forEach((el) => io.observe(el));
  }

  function initDock() {
    const links = $$(".dock__link");
    const byKey = new Map(links.map((a) => [a.dataset.nav, a]));
    const sections = $$("main section[data-nav]");
    const setActive = (key) =>
      links.forEach((a) => {
        const on = a.dataset.nav === key;
        a.classList.toggle("is-active", on);
        if (on) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const key = e.target.dataset.nav;
            setActive(byKey.has(key) ? key : "");
          }
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));

    // Hide the dock while typing so it never covers form fields (mobile keyboards)
    document.addEventListener("focusin", (e) => {
      if (e.target.matches("input, textarea, select")) html.classList.add("is-typing");
    });
    document.addEventListener("focusout", () => html.classList.remove("is-typing"));
  }

  function initParallax() {
    if (prefersReducedMotion()) return;
    const media = $(".hero__media");
    if (!media) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      if (y < window.innerHeight * 1.2) media.style.transform = `translate3d(0, ${(y * 0.18).toFixed(1)}px, 0)`;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
  }

  /* -------------------------------------------------------- opening cover -- */
  function initCover(music) {
    const cover = $("#cover");
    const main = $("#main");
    const btn = $("#open-invitation");
    const done = () => {
      cover.hidden = true;
      html.classList.remove("is-locked", "is-opening");
      html.classList.add("is-open");
      main.inert = false;
      main.removeAttribute("inert");
      const target = location.hash && document.getElementById(location.hash.slice(1));
      if (target && target !== cover) target.scrollIntoView();
      else $("#hero-title")?.focus({ preventScroll: true });
    };

    // If the inline fallback already opened the page (slow network), just sync state.
    if (!cover || cover.hidden) {
      html.classList.remove("is-locked");
      html.classList.add("is-open");
      main && main.removeAttribute("inert");
      music.start && $("#music-toggle") && ($("#music-toggle").hidden = false);
      return;
    }

    requestAnimationFrame(() => {
      cover.classList.add("is-ready");
      html.classList.add("is-ready");
    });

    let opened = false;
    btn.addEventListener("click", () => {
      if (opened) return;
      opened = true;
      window.__awlOpened = true;
      music.start(); // inside the user gesture, so playback is allowed
      window.scrollTo(0, 0);
      if (prefersReducedMotion()) return done();
      html.classList.add("is-opening");
      cover.classList.add("is-leaving");
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        done();
      };
      cover.addEventListener("transitionend", (e) => e.target === cover && finish());
      setTimeout(finish, 1800); // safety net
    });
  }

  /* ----------------------------------------------------------------- boot -- */
  function boot() {
    const guest = resolveGuest(location.search, GUESTS, C.copy.coverDefaultGuest);
    html.dataset.guest = guest.source;
    bindModel(buildModel(guest));

    const cal = $("#calendar-link");
    if (cal) cal.href = buildGoogleCalendarUrl(C, siteUrl);

    renderVerse();
    renderCouple();
    renderEvents();
    renderStory();
    initGallery(C.gallery);
    initGift(C.gift);
    initCountdown($("#countdown"), C.wedding, C.copy);
    initWishes();
    initRsvp(guest);

    const music = createMusic(C.music);
    initCover(music);
    initReveal();
    initDock();
    initParallax();

    window.__awlReady = true;
  }

  try {
    boot();
  } catch (err) {
    // Never leave the guest stuck behind the cover.
    console.error(err);
    html.classList.remove("is-locked");
    const cover = $("#cover");
    if (cover) cover.classList.add("is-ready");
    $("#main")?.removeAttribute("inert");
    window.__awlReady = false;
  }

})(window.AWL = window.AWL || {});
