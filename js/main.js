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
  const { buildGoogleCalendarUrl, buildEventCalendarUrl } = AWL;
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
    const icon = (id) => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("class", "icon");
      const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", `#${id}`);
      svg.append(use);
      return svg;
    };
    C.events.forEach((ev, i) => {
      const sameVenue = ev.venue === C.venue.name;
      const area = ev.shortAddress || (sameVenue ? C.venue.shortAddress : ev.address);
      const endText = ev.endTime ? `– ${formatTime(ev.endTime)} ${tz}` : ev.endText ? `– ${ev.endText}` : "";
      const mark = icon("i-atap");
      mark.setAttribute("class", "event-card__mark");
      list.append(
        h("li", { class: `event-card${i % 2 ? " event-card--alt" : ""}`, "data-reveal": "" },
          mark,
          h("h3", { class: "event-card__title", text: ev.title }),
          h("p", { class: "event-card__date", text: formatLongDate(ev.date, C.site.locale) }),
          h("p", { class: "event-card__time" },
            h("span", { class: "event-card__clock", text: formatTime(ev.startTime) }),
            h("span", { class: "event-card__tz", text: tz }),
            endText ? h("span", { class: "event-card__end", text: endText }) : null),
          ev.note ? h("p", { class: "event-card__note", text: ev.note }) : null,
          h("span", { class: "event-card__rule", "aria-hidden": "true" }),
          h("p", { class: "event-card__venue", text: ev.venue }),
          area ? h("p", { class: "event-card__area", text: area }) : null,
          h("div", { class: "event-card__actions" },
            h("a", { class: "btn btn--small", href: ev.mapsUrl || C.venue.mapsUrl, target: "_blank", rel: "noopener noreferrer",
              "aria-label": `Lihat lokasi ${ev.title} di Google Maps` }, icon("i-pin"), h("span", { text: "Lihat Lokasi" })),
            h("a", { class: "link-arrow event-card__cal", href: buildEventCalendarUrl(C, ev, siteUrl), target: "_blank", rel: "noopener noreferrer",
              "aria-label": `Simpan ${ev.title} ke Google Calendar` }, icon("i-calendar"), h("span", { text: "Simpan ke Kalender" }))))
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
            ? h("figure", { class: "chapter__figure", "data-reveal": "image" },
                picture(ch.image, { sizes: "(min-width: 1024px) 340px, (min-width: 768px) 40vw, 70vw" }))
            : null,
          h("div", { class: "chapter__body", "data-reveal": "" },
            h("p", { class: "chapter__kicker", "aria-hidden": "true" },
              h("span", { class: "chapter__no", text: ch.number })),
            h("h3", { class: "chapter__title", text: ch.title }),
            h("div", { class: "chapter__text" }, ...ch.paragraphs.map((t) => h("p", { text: t })))))
      );
    });
  }

  /** Cover, header, desktop side photo and closing photo, all from C.images. */
  function renderPageImages() {
    const { cover, hero, closing } = C.images;
    const put = (sel, node) => {
      const slot = $(sel);
      if (slot && node) slot.replaceChildren(node);
    };
    put("[data-slot='cover']", picture(cover, { sizes: "100vw", loading: "eager", priority: true, fade: false, alt: false, onlyBelow: 1024 }));
    put("[data-slot='hero']", picture(hero, { sizes: "100vw", loading: "eager", fade: false, alt: false, onlyBelow: 1024 }));
    put("[data-slot='stage-cover']", picture(cover, { sizes: "66vw", loading: "eager", priority: true, fade: false, alt: false,
      onlyAbove: 1024, position: cover.positionDesktop, className: "stage__pic stage__pic--cover" }));
    put("[data-slot='stage-hero']", picture(hero, { sizes: "66vw", loading: "eager", fade: false, alt: false,
      onlyAbove: 1024, position: hero.positionDesktop, className: "stage__pic stage__pic--hero" }));
    put("[data-slot='closing']", picture(closing, { sizes: "(min-width: 1024px) 520px, 100vw" }));
  }

  function renderVerse() {
    const verse = $("#verse");
    if (verse) verse.hidden = !C.copy.verse.enabled;
  }

  /* --------------------------------------------------------------- motion -- */
  function initReveal() {
    // Children of [data-stagger] appear one after another (small delays only).
    $$("[data-stagger]").forEach((group) => {
      const step = Number(group.dataset.stagger) || 110;
      [...group.querySelectorAll("[data-reveal]")].forEach((el, i) => el.style.setProperty("--reveal-delay", `${Math.min(i, 6) * step}ms`));
    });
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
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
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

  /**
   * Desktop photo panel: its caption repeats the hero title, so it only appears
   * once the hero (with the same names) has scrolled out of view.
   */
  function initStageCaption() {
    const hero = $("#home");
    if (!hero || !("IntersectionObserver" in window)) return html.classList.add("is-past-hero");
    new IntersectionObserver(([e]) => html.classList.toggle("is-past-hero", e.intersectionRatio < 0.3), {
      threshold: [0, 0.3, 0.6, 1],
    }).observe(hero);
  }

  function initParallax() {
    if (prefersReducedMotion()) return;
    const media = $(".hero__media");
    if (!media) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      if (y < window.innerHeight * 1.2) media.style.transform = `translate3d(0, ${(y * 0.1).toFixed(1)}px, 0)`;
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

    renderPageImages();
    renderVerse();
    renderCouple();
    renderEvents();
    renderStory();
    initGallery(C.gallery, C.galleryBackdrop);
    initGift(C.gift);
    initCountdown($("#countdown"), C.wedding, C.copy);
    initWishes();
    initRsvp(guest);

    const music = createMusic(C.music);
    initCover(music);
    initReveal();
    initDock();
    initStageCaption();
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
